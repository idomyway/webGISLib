/**
 * @summary 提供自定义地图操作的方法
 * @module mudules/MyBase
 * @example require(["mudules/MyBase"],function(Toolbar){     });
 */
define([
    "dojo/_base/kernel",
	"dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/symbols/TextSymbol",
    "esri/Color",
    "esri/symbols/Font",	
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/map",
    "esri/graphic",
    "esri/geometry/Point",
	"esri/geometry/Polyline",
    "esri/layers/GraphicsLayer"
],function(
    dojo,
	lang,
    declare,
    array,
    TextSymbol,
    Color,
    Font,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    Map,
    Graphic,
    Point,
	Polyline,
    GraphicsLayer
)
{
    var obj = declare(null,{
        graphicsLayer:null,
       
        constructor: function(map){				
            this._map = map;
            var layids = map.graphicsLayerIds;
            for(var i = 0; i < layids.length; i++){
				if(this.graphicsLayer != null && this.levelGraphicsLayer != null)
					break;
                if(layids[i] == "cusSymbolLayer"){
                    this.graphicsLayer = map.getLayer(layids[i]);
                } else if(layids[i] == "levelSymbolLayer"){
					this.levelGraphicsLayer = map.getLayer(layids[i]);
				}
            }
			var me = this;
            if(this.graphicsLayer == null){				
                this.graphicsLayer = new GraphicsLayer({id:"cusSymbolLayer"});
                this.graphicsLayer.on('click',function(evt){me.clickCallback(evt,me);});
                this.graphicsLayer.on('mouse-over',function(evt){me.mouseOverCallback(evt,me);});
				this.graphicsLayer.on("mouse-out", function(evt){me.mouseOutCallback(evt,me);});
                map.addLayer(this.graphicsLayer);
            }
			if(this.levelGraphicsLayer == null){
				this.levelGraphicsLayer = new GraphicsLayer({id:"levelSymbolLayer"});
                this.levelGraphicsLayer.on('click',function(evt){me.clickCallback(evt,me);});
                this.levelGraphicsLayer.on('mouse-over',function(evt){me.mouseOverCallback(evt,me);});
				this.levelGraphicsLayer.on("mouse-out", function(evt){me.mouseOutCallback(evt,me);});
                map.addLayer(this.levelGraphicsLayer);
			}
        },
        
      
		zoomEndFunction : function(obj){
			
			if(obj.level >= _level){
				this.graphicsLayer.show();
				this.levelGraphicsLayer.hide();
			} else {
				this.levelGraphicsLayer.show();
				this.graphicsLayer.hide();
			}
		},
		
		
		addPointToMap :function(x,y,attributes,infoTemplate){
			var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 1), new Color([0,255,0,0.25]));
			var geometry = new Point(x,y,this._map.spatialReference);
			var _graphic =  this.levelGraphicsLayer.add(new Graphic(geometry, symbol));
			if(lang.isObject(attributes)){
				_graphic.setAttributes(attributes);
			}
			if(infoTemplate){
				_graphic.setInfoTemplate(infoTemplate);
			}
		}
		
		
    });

    return obj;
});