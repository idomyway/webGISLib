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
    "esri/layers/GraphicsLayer",
    "esri/InfoTemplate"
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
    GraphicsLayer,
    InfoTemplate
)
{
    var obj = declare(null,{
        graphicsLayer:null,
        levelGraphicsLayer:null,
        _map : null,
		_font:new Font('10px').setWeight(Font.WEIGHT_BOLD),//字体大小
		_bgColor:new Color([35,144,211,1]),//蓝底
		_outlinecolor:new Color([35,144,211,1]),
		_textColor : new Color([255,255,255]),//白字
		_clickFunction : null,
		_mouseOverFunction:null,
		_mouseOutFunction:null,
		_graphicPointArray:[],
		_pointTextBgArray:[],
		_twinkle:[],
		_multilineGraphic:[],	
		_par:6,
		_lineColor:new Color([255,0,0,0.75]),//绘制线轨迹使用的线条颜色
		_arrowColor:new Color([255,255,255,0.8]),//线轨迹中使用的箭头颜色
		_polylineWithDirectionArray : [],
       
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
        mouseOverCallback:function(evt,me){
			if(lang.isFunction(me._mouseOverFunction)){
				if(evt.graphic.getLayer().id == "cusSymbolLayer"){				
					if(evt.graphic.symbol.type == "picturemarkersymbol"){
						me._mouseOverFunction(evt);
					}
				} else if(evt.graphic.getLayer().id == "levelSymbolLayer"){
					if(evt.graphic.symbol.type == "simplemarkersymbol"){
						me._mouseOverFunction(evt);
					}
				}
			}
		},
		mouseOutCallback:function(evt,me){
			if(lang.isFunction(me._mouseOutFunction)){
				if(evt.graphic.getLayer().id == "cusSymbolLayer"){				
					if(evt.graphic.symbol.type == "picturemarkersymbol"){
						me._mouseOutFunction(evt);
					}
				} else if(evt.graphic.getLayer().id == "levelSymbolLayer"){
					if(evt.graphic.symbol.type == "simplemarkersymbol"){
						me._mouseOutFunction(evt);
					}
				}
			}
		},
		clickCallback:function(evt,me){
			if(lang.isFunction(me._clickFunction)){
				if(evt.graphic.getLayer().id == "cusSymbolLayer"){				
					if(evt.graphic.symbol.type == "picturemarkersymbol"){
						me._clickFunction(evt);
					}			
				} else if(evt.graphic.getLayer().id == "levelSymbolLayer"){
					if(evt.graphic.symbol.type == "simplemarkersymbol"){
						me._clickFunction(evt);
					}				
				}
			}
		},
		
		setMouseOverFunction:function(mouseOverFunction){
			this._mouseOverFunction = mouseOverFunction;
		},
		setMouseOutFunction : function(mouseOutFunction){
			this._mouseOutFunction = mouseOutFunction;
		},
		setClickFunction:function(clickFunction){
			this._clickFunction = clickFunction;
		},
		setFont : function(font){//设置文本字体
			this._font = font;
		},

		setBackgroundColor:function(color){
			this._bgColor = color;
		},
		setbgOutlineColor:function(color){
			this._outlinecolor = color;
		},
		setTextColor:function(textColor){
			this._textColor = textColor;
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
		
		getMap : function() {
			return this._map;
		},
		
		getInfoTemplate : function(){
			return new InfoTemplate();
		},
		
		
		addImagePoint : function(info){
			for(var i = 0; i < info.length; i++){
				var p = new Point(info[i].x,info[i].y,this._map.spatialReference);	
	            var pmsimg = new PictureMarkerSymbol(info[i].url,info[i].width,info[i].height);			
	            var g = this.graphicsLayer.add(new Graphic(p,pmsimg));
				if(lang.isObject(info[i].infoTemplate)){
					g.setInfoTemplate(info[i].infoTemplate);
				}
				if(lang.isObject(info[i].attributes)){
					g.setAttributes(info[i].attributes);
				}
	            this._graphicPointArray.push(g);
	            if(lang.isObject(info[i].textInfo)){
	            	var textcolor = this._textColor;
	            	//添加文本
	            	if(info[i].textInfo.color){
	            		textcolor = Color.fromArray(info[i].textInfo.color);
	            	}
	            	var yoffset = 18;
	            	if(info[i].textInfo.position == 'bottom'){
	            		if(info[i].textInfo.yoffset != undefined) {
	            			yoffset = info[i].textInfo.yoffset;
	            		} else {
		            		yoffset = -25;
	            		}
	            	}
	            	var textSymbol = new TextSymbol({text:info[i].textInfo.text,xoffset:0,yoffset:yoffset,color:textcolor,font:this._font,verticalAlignment:'baseline'});
	            	//如果有背景色，需要添加背景色
	            	if(lang.isObject(info[i].textInfo.background)){
	            		var bgc = this._bgColor;
	            		var outc = this._outlinecolor;
	            		if(info[i].textInfo.background.bgcolor){
	            			bgc = Color.fromArray(info[i].textInfo.background.bgcolor);
	            			outc = bgc;
	            		}	            		
	            		if(info[i].textInfo.background.outlinecolor){
	            			outc = Color.fromArray(info[i].textInfo.background.outlinecolor);
	            		}
						
	        			var svgWidth = textSymbol.text.length * Math.floor(this._font.size * 1.5);
						var ppt = "M0,0 H " + svgWidth + " V " + (parseInt(this._font.size) + 8) + " H 0 Z";
	        			var marker = new SimpleMarkerSymbol().setPath(ppt).setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,outc,1));
	        			marker.setColor(bgc);
	        			marker.setOffset(0,yoffset > 0 ? yoffset * 1.6: yoffset * 1.1 - 1);
	        			marker.setSize(svgWidth);
	        			var markerGraphic = this.graphicsLayer.add(new Graphic(p, marker));
	        			this._pointTextBgArray.push({graphic:markerGraphic,x:p.x,y:p.y});//保存
	            	}
	            	
	    			this.graphicsLayer.add(new Graphic(p,textSymbol));
	            }
			}
		},
		clearImagePoint:function(){
			this.graphicsLayer.clear();
		}
		
		
    });

    return obj;
});