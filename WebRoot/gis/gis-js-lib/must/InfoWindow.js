define([
	"require",
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/array",
	"dojo/query",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom",
    "esri/dijit/InfoWindow",
	"esri/domUtils"
],
function(
	require,
	declare,
	on,
	array,
	query,
	lang,
	domClass,
	domConstruct,
	domStyle,
	dom,
    InfoWindow,
	domUtils
) {
    return declare([InfoWindow], {
		imageCtx : require.toUrl("."),
		setMap: function(map){			
			var spriteArray = query(".sprite",this.domNode);
			array.forEach(spriteArray,function(item){
				//domStyle.set(item,{backgroundImage :'url('+this.imageCtx+'/images/infowindow.png)'});
				domStyle.set(item,{backgroundImage :'url(../../gis/images/infowindow.png)'});
			},this);
			var border = query(".border",this.domNode);
			//domConstruct.destroy(border);
			domStyle.set(border[0],{borderTop: '1px solid #7fb4da',borderBottom: '1px solid #7fb4da'});
			this.inherited(arguments);		
		},
		onShow: function() {
			this.removeClickGraphic();
            this.inherited(arguments);
        },
		onHide: function() {
			this.removeClickGraphic();
            this.inherited(arguments);
        },
		removeClickGraphic : function(){
			if(this.map){
				for(var i = 0; i< this.map.graphics.graphics.length;i++){
					var item = this.map.graphics.graphics[i];
					if(item.attributes){
						if(item.attributes.clickQueryFlag){
							this.map.graphics.remove(this.map.graphics.graphics[i]);//删除图层中的Graphic
							break;
						}
					}
				}
			}			
		}
      });
});
