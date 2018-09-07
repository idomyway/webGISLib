define([
	"dojo/_base/lang",
    "dojo/_base/declare",
	"dojo/query",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/_base/Deferred",
	"esri/dijit/Search",
	"esri/tasks/query",
	"esri/Color",	
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/PictureMarkerSymbol",
	"esri/graphic"
],function(
	lang,
    declare,
	query,
	domConstruct,
	domAttr,
	Deferred,
	Search,
	Query,
	Color,
	SimpleLineSymbol,
	SimpleMarkerSymbol,
	PictureMarkerSymbol,
	Graphic
)
{
    return declare([Search],{
		queryAll:null,
		theId:"",
		constructor: function(a, c) {
			this.queryAll = a.queryAll;
			this.theId=a.theId;
			domConstruct.create('style',{innerHTML:a.searchCss},document.head);
		},	
		
		_insertSources: function(a) {
			this.inherited(arguments);
			var searchInput = query("div[id='"+this.theId+"'] input[class='searchInput']");
			if(searchInput && searchInput.length > 0){
				domAttr.set(searchInput[0],'value',"");
			}
			if(this.queryAll != null){
				if(this.queryAll.enable){//如果允许查询全部
					if(this.activeSourceIndex == 'all'){
						var _placeholder = this.queryAll.placeholder;
						if(_placeholder)
							domAttr.set(searchInput[0],{placeholder:_placeholder,title:_placeholder});
					}
				}
				else{//不允许查询所有的图层 经十路
					//删除查询全部的功能 
					var t = query("div[class='searchBtn searchToggle'] > span[class='sourceName']");
					if(t && t.length > 0){
						domConstruct.destroy(t[0]);
					}
					var all = query("div[class='searchMenu sourcesMenu'] > ul > li");			
					if(all && all.length > 0){
						all.removeClass('active');
						all.forEach(function(item,index){
							if(domAttr.get(item,'data-index') == 'all'){
								domConstruct.destroy(item);
								if(this.activeSourceIndex == 'all')
									this.activeSourceIndex = 0;
								var searchInput = query("div[class='searchInputGroup'] > input[id='search_input']");
								if(searchInput && searchInput.length > 0){
									var firstSource = query("div[class='searchMenu sourcesMenu'] > ul > li[data-index='"+this.activeSourceIndex+"']");
									firstSource.addClass('active');
									domAttr.set(searchInput[0],{placeholder:firstSource[0].innerHTML,title:firstSource[0].title});
								}
								return;
							}	
						},this);
					}
				}
			}
        },	
		
		_hydrateResult: function(a, c) {
			var b = this.inherited(arguments);
			if(b.feature.geometry){
				var d = this.sources[c];
				var e = null;
				d.hasOwnProperty("highlightSymbol") && (e = d.highlightSymbol);
				if(e == null){
					var symbol = null;
					//后期会采用集中定位的方式，将符号单独抽取成类				
					switch (b.feature.geometry.type) { //point | multipoint | polyline | polygon | extent
						case "point":
							symbol = (new PictureMarkerSymbol(this.basePath + "/Search/images/search-pointer.png", 36, 36)).setOffset(9, 18);
							//new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 1), new Color([0,255,0,0.25]));
							break; 
						case "polyline": 
							symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0,0.8]),4);
							break; 
						case "polygon": 
							symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 2), new Color([255,255,0,0.25])); 
							break; 
						case "extent": 
							symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 2), new Color([255,255,0,0.25])); 
							break; 
						case "multipoint": 
							symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0]), 1), new Color([255,255,0,0.5])); 
							break; 
					}
					this.map.graphics.clear();
					this.map.graphics.add(new Graphic(b.feature.geometry,symbol));
					//this.set("highlightGraphic", new Graphic(b.feature.geometry,symbol));
				}
			}
			return b;
		},
		
		_suggest: function(a) {
            a || (a = {
                index: this.activeSourceIndex,
                text: this.value
            });
            var c = new Deferred;
            this._deferreds.push(c);
            var b = a.index,
            d = this.sources[b],
            e = this.enableSuggestions;
            d.hasOwnProperty("enableSuggestions") && (e = d.enableSuggestions);
            var f = 0,g;
            a.hasOwnProperty("text") && (g = lang.trim(a.text), f = a.text.length);
            a = d.minCharacters || this.minCharacters;
            if (e && g && f >= a) {
                var l = "";
                d.prefix && (l += d.prefix);
                l += g;
                d.suffix && (l += d.suffix);
                var h = this._defaultSR;
                this.map && (h = this.map.spatialReference);
                e = {};
                if (d.locator) {
                    d.categories && (e.categories = d.categories);
                    d.locator.outSpatialReference = h;
                    if (this.map && (d.localSearchOptions && d.localSearchOptions.hasOwnProperty("distance") && d.localSearchOptions.hasOwnProperty("minScale")) && (f = this._getScale(), !d.localSearchOptions.minScale || f && f <= parseFloat(d.localSearchOptions.minScale))) e.location = this.map.extent.getCenter(),
                    e.distance = d.localSearchOptions.distance;
                    e.text = l;
                    d.searchExtent && (e.searchExtent = d.searchExtent);
                    d.locator.suggestLocations(e).then(lang.hitch(this,
                    function(a) {
                        c.isFulfilled() || c.resolve(a)
                    }), lang.hitch(this,
                    function(a) {
                        a || (a = Error(this._dijitName + " Suggest location error"));
                        c.reject(a)
                    }))
                } else d.featureLayer && this._featureLayerLoaded(d.featureLayer).then(lang.hitch(this,
                function() {
                    var a = this._getDisplayField(d),
                    e = d.searchFields || [a],
                    f = this._validField(d.featureLayer, a),
                    g = this._validFields(d.featureLayer, e);
                    if (!f || !g) c.reject(Error(this._dijitName + " Invalid featureLayer field"));
                    else {
                        f = new Query();
                        f.outSpatialReference = h;
                        f.returnGeometry = !1;
                        f.num = d.maxSuggestions || this.maxSuggestions;
                        d.searchExtent && (f.geometry = d.searchExtent);
                        g = "";
                        this.reHostedFS.test(d.featureLayer.url) && this._containsNonLatinCharacter(l) && (g = "N");
                        f.outFields = [d.featureLayer.objectIdField, a];
                        if (e && e.length) for (a = 0; a < e.length; a++) f.where = 0 === a ? "": f.where + " or ",
                        f.where += "UPPER(" + e[a] + ") LIKE " + g + "'%" + l.toUpperCase() + "%'";
                        d.featureLayer.queryFeatures(f, lang.hitch(this,
                        function(a) {
                            var d; (a = a.features) && (d = this._hydrateResults(a, b));
                            c.isFulfilled() || c.resolve(d)
                        }), lang.hitch(this,
                        function(a) {
                            a || (a = Error(this._dijitName + " suggest queryFeatures error"));
                            c.reject(a)
                        }))
                    }
                }))
            } else c.resolve();
            return c.promise
        }
    });
});