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
        levelGraphicsLayer:null,
        _map : null,
		_font:new Font('10px').setWeight(Font.WEIGHT_BOLD),//字体大小
		_bgColor:new Color([35,144,211,1]),//蓝底
		_outlinecolor:new Color([35,144,211,1]),
		_textColor : new Color([0,0,0]),//白字
		_clickFunction : null,
		_mouseOverFunction:null,
		_mouseOutFunction:null,
		_graphicPointArray:[],
		_twinkle:[],
		_pointTextBgArray:[],
		_multilineGraphic:[],	
		_par:6,
		_lineColor:new Color([34,139,34,0.6]),//绘制线轨迹使用的线条颜色
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
        
        clearGraphicLayer: function(){
        	this.levelGraphicsLayer.clear();
        	this.graphicsLayer.clear();
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
		
		addImagePointForLevelShow :function(info,level){
			var me=this;
			for(var i = 0; i < info.length; i++){
				addPointToMap(info[i].x,info[i].y,info[i].attributes,info[i].infoTemplate);
			}		
			addImagePoint(info);
			_level = level - 1;
			zoomEndFunction({level:me._map.getLevel()});
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
		//[{x:1,y:1},{x:2,y:2}]
		removeGraphicByXYArray : function(xyArray){
			var graphicArray = this.graphicsLayer.graphics;
			var levelGraphicArray = this.levelGraphicsLayer.graphics;	
			for(var i = 0; i< xyArray.length; i++){				
				var containGraphic = array.map(graphicArray,function(item){
					var geo = item.geometry;
					if(geo.type == 'point'){
						if(geo.x == xyArray[i].x && geo.y == xyArray[i].y){
							return item;
						}
					}
				});
				
				var levelContainGraphic = array.map(levelGraphicArray,function(item){
					var geo = item.geometry;
					if(geo.type == 'point'){
						if(geo.x == xyArray[i].x && geo.y == xyArray[i].y){
							return item;
						}
					}
				});

				//删除符合条件的 Graphic
				array.forEach(containGraphic,function(item){
					//this._pointTextBgArray 记录了背景信息，需要删除
					if(item){
						var index = -1;
						for(var k = 0; k < this._pointTextBgArray.length; k++){
							if(this._pointTextBgArray[k].x == item.geometry.x && this._pointTextBgArray[k].y == item.geometry.y){//寻找位置
								index = k;
								break;
							}
						}
						if(index != -1)
							this._pointTextBgArray.splice(index, 1);//删除找到的元素
						index = -1;//重置
						for(var z = 0 ; z < this._graphicPointArray.length;z++){
							var g = this._graphicPointArray[z];
							if(g.geometry.x == item.geometry.x && g.geometry.y == item.geometry.y){
								index = z;
								break;
							}
						}
						if(index != -1)
							this._graphicPointArray.splice(index, 1);//删除找到的元素
						
						this.graphicsLayer.remove(item);//删除图层中的Graphic
					}
				},this); //end 删除图层中的Graphic
				
				array.forEach(levelContainGraphic,function(item){
					if(item){
						this.levelGraphicsLayer.remove(item);//删除图层中的Graphic
					}
				},this);//end 删除levelGraphicLyaer 中的数据
			}
		}, 
		//根据X Y 返回对应的Graphic 
		getImgGraphic :function(x,y){
			var graphicbg = null;
			for(var i = 0 ; i < this._graphicPointArray.length;i++){
				var g = this._graphicPointArray[i];
				if(g.geometry.x == x && g.geometry.y == y){
					graphicbg = g;
					break;
				}
			}
			return graphicbg;
		},
		//改变背景颜色info [{x,y,bgcolor:[255,0,0,1],outlineColor:[255,0,0,1]},{x,y,bgcolor,outlineColor}]
		changeBackgroundColor:function(info){
			for(var j = 0; j < info.length; j++){
				var item = info[j];
				var graphic = null;
				for(var i = 0; i < this._pointTextBgArray.length; i++){
					if(this._pointTextBgArray[i].x == item.x && this._pointTextBgArray[i].y == item.y){
						graphic = this._pointTextBgArray[i].graphic;
						break;
					}
				}
				if(graphic){
					var oc = item.bgcolor;
					if(item.outlineColor){
						oc = item.outlineColor;
					}
					graphic.symbol.outline.color = Color.fromArray(oc);
					graphic.symbol.color = Color.fromArray(item.bgcolor);
					graphic.draw();
				}
			}
		}, 
		//改变多行文本的颜色
		//info [{x,y,bgcolor:[255,0,0,1],outlineColor:[255,0,0,1]},{x,y,bgcolor,outlineColor}]
		changeMultilineBackgroundColor:function(info){
			array.forEach(info,function(item){
				var x = item.x,y=item.y;
				var outlineColor = item.bgcolor;
				if(item.outlineColor){
					outlineColor = item.outlineColor;
				}
				for(var i = 0; i < this._multilineGraphic.length;i++){
					var graphicMultilinebg = this._multilineGraphic[i].bgGraphic;
					if(graphicMultilinebg.geometry.x == x && graphicMultilinebg.geometry.y == y){//查询对应的Graphic
						graphicMultilinebg.symbol.outline.color = Color.fromArray(outlineColor);
						graphicMultilinebg.symbol.color = Color.fromArray(item.bgcolor);
						graphicMultilinebg.draw();
						break;
					}
				}
			},this);
		}, 
		//info [{x:1,y:1},{x:1,y:1}]
		//闪烁PointGraphic
		twinklePointImg : function(info){
			for(var i = 0; i < info.length;i++){
				var item = info[i];
				var graphicpoint = this.getImgGraphic(item.x,item.y);
				if(graphicpoint){
					graphicpoint.hide();//先隐藏
					var rest = setInterval(function(){
						if(graphicpoint.visible)
							graphicpoint.hide();
						else			
							graphicpoint.show();
					},500);
					
					if(this._twinkle.length == 0){
						this._twinkle.push({graphic:graphicpoint,handler:rest});
					} else {
						var hasSameOne = false;
						for(var j = 0; j < this._twinkle.length; j++){
							var g = this._twinkle[j];							
							if(g.graphic.geometry.x == graphicpoint.geometry.x && g.graphic.geometry.y == graphicpoint.geometry.y){
								hasSameOne = true;
								break;
							}
						}
						if(!hasSameOne){
							this._twinkle.push({graphic:graphicpoint,handler:rest});
						}
					}
					
				}
			}
		},
		//停止闪烁	//info [{x:1,y:1},{x:1,y:1}]
		stopTwinklePointImg : function(info){
			for(var i = 0; i < info.length;i++){
				var item = info[i];
				var currentGraphic = null;
				var handler = null;
				for(var j = 0; j < this._twinkle.length; j++){
					if(this._twinkle[j].graphic.geometry.x == item.x && this._twinkle[j].graphic.geometry.y == item.y){
						currentGraphic = this._twinkle[j].graphic;
						handler = this._twinkle[j].handler;
						this._twinkle.splice(j,1);
						break;
					}
				}
				if(currentGraphic){
					if(handler) {
						clearInterval(handler);		
						if(!currentGraphic.visible)
							currentGraphic.show();
					}
				}
			}
		},
		
		removePolylineWithDirection : function(){
			array.forEach(this._polylineWithDirectionArray,function(item){
                this.graphicsLayer.remove(item);
            },this);
			this._polylineWithDirectionArray.splice(0,this._polylineWithDirectionArray.length); //删除数组中的所有元素		
		},
		
		//pointArray [{x:1,y:1},{x:1,y:1}]
		addPolylineWithDirection :function(pointArray){			
			var polyline = new Polyline(this._map.spatialReference);
			var ppa = array.map(pointArray,function(item){
				return new Point(item.x,item.y,this._map.spatialReference);
			},this);
			polyline.addPath(ppa);
			var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, this._lineColor, this._par);
			var lg = this.graphicsLayer.add(new Graphic(polyline,lineSymbol));	
			this._polylineWithDirectionArray.push(lg);
			//加入文字
			//var textSymbol = new TextSymbol({text:'起',yoffset:5,color:new Color([255,0,0])});
			//this.graphicsLayer.add(new Graphic(ppa[0],textSymbol));	
			//加入箭头			
			for(var i = 0; i < ppa.length - 1; i++){
				this.addLineWithDirection(ppa[i],ppa[i+1]);
			}
			return polyline.getExtent();
		},
		
		setLineColor : function(c){
			if(c)
				this._lineColor = Color.fromArray(c);
		},
		setArrowColor:function(c){
			if(c)
				this._arrowColor = Color.fromArray(c);
		},
		setLineWidth:function(width){
			this._par = width;
		},	
		//添加带方向的线
		addLineWithDirection : function(p1,p2){
			var middlePoint = this.calMiddlePoint(p1,p2);
			var m1 = this.calMiddlePoint(p1,middlePoint);			
			var m2 = this.calMiddlePoint(middlePoint,p2);
			this.calMiddlePoint(p1,m1);
			this.calMiddlePoint(m2,p2);
			this.calMiddlePoint(m1,middlePoint);
			this.calMiddlePoint(middlePoint,m2);
		},
		
		/*
		计算两点之间的中点坐标，并生成path
		*/
		calMiddlePoint : function(p1,p2){			
			var path = "";
			var par = this._par;
			//var slopy = Math.atan2((y1-y2),(x1-x2));
			//必须转换成屏幕坐标， 否则用JS角度计算有问题
			var sp1 = this._map.toScreen(p1);
			var sp2 = this._map.toScreen(p2);
			//求角度
			var slopy = Math.atan2((sp1.y-sp2.y),(sp1.x-sp2.x));
			var x1 = p1.x;
			var x2 = p2.x;
			var y1 = p1.y;
			var y2 = p2.y;
			var cosy = Math.cos(slopy);   
			var siny = Math.sin(slopy);
			var x3 = (x1 + x2) / 2;
			var y3 = (y1 + y2) / 2;
			
			var mp1x = x3 + par * cosy - (par / 2.0 * siny);
			var mp1y = y3 + par * siny + (par / 2.0 * cosy);
			var mp2x = x3 + (par*cosy + par / 2.0 * siny);
			var mp2y = y3 - (par / 2.0 * cosy - par*siny);			
			/*
			var polylineJson = {
				"paths":[[[mp1x,mp1y],[x3,y3],[mp2x,mp2y]]],
				"spatialReference":this._map.spatialReference
			};			
			var polyline = new Polyline(polylineJson);
			var ss = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]),2);
			this.graphicsLayer.add(new Graphic(polyline,ss));
			*/
			var centPoint = new Point(x3,y3,this._map.spatialReference);
			path += "M" + x3 + "," + y3;			
			path += " L " + mp1x + "," + mp1y;		
			path += " M" + x3 + "," + y3;
			path += " L " + mp2x + "," + mp2y;			
			var ss = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, this._arrowColor,2);		
			var ps = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_PATH,par - 2,ss,null);
			ps.setPath(path);
			var pg = this.graphicsLayer.add(new Graphic(centPoint,ps));			
			this._polylineWithDirectionArray.push(pg);
			return new Point(x3,y3,this._map.spatialReference);
		},
		/*
		addImageAtXY:function(x,y,imgurl,imgwidth,imgheigth){
			this.addImagePoint([{url:imgurl,width:imgwidth,height:imgheigth,x:x,y:y}]);
		},	*/
		/*
		var info = [
		            {url:'images/map_bujian_1.png',width:29,height:29,x:13026362.41741002,y:4386447.261975755,infoTemplate:template,attributes:attributes,textInfo:{color:"",text:"我的测试",position:'top',background:{bgcolor:[128,0,0,0.5],outlinecolor:[128,0,0,0.5]}}},
		            {url:'images/map_bujian_1.png',width:29,height:29,x:13026362.17794821924,y:4367072.645576343,infoTemplate:template,textInfo:{color:"",text:"我的测试",position:'bottom',background:{bgcolor:[128,0,0,0.5],outlinecolor:[128,0,0,0.5]}}}
		         ];
		*/
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
	            		yoffset = -25;
	            	}
	            	var textSymbol = new TextSymbol({
	            								text:info[i].textInfo.text,
	            								xoffset:0,yoffset:yoffset,
	            								color:textcolor,font:this._font,
	            								verticalAlignment:'baseline'});
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
	            //上部文本
	            if(lang.isObject(info[i].textInfoTop)){
	            	var textcolor = this._textColor;
	            	//添加文本
	            	if(info[i].textInfoTop.color){
	            		textcolor = Color.fromArray(info[i].textInfoTop.color);
	            	}
	            	var yoffset = 13;
	            	if(info[i].textInfoTop.position == 'bottom'){
	            		yoffset = -25;
	            	}
	            	var textSymbol = new TextSymbol({
	            								text:info[i].textInfoTop.text,
	            								xoffset:0,yoffset:yoffset,
	            								color:textcolor,font:this._font,
	            								verticalAlignment:'baseline'});
	            	//如果有背景色，需要添加背景色
/*	            	if(lang.isObject(info[i].textInfo.background)){
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
	            	}*/
	            	
	    			this.graphicsLayer.add(new Graphic(p,textSymbol));
	            }
	            //左侧类似柱状图的背景色
	            if(lang.isObject(info[i].themeChartRight)){
                     //--themeChartRight.color
	            	//--themeChartRight.height
	            	//--themeChartRight.width
	            	//--themeChartRight.size  
	            		var bgc =  Color.fromArray(info[i].themeChartRight.color);
	            		var outc = this._outlinecolor; 		
	            		//var ppt = "M0,0 H " + 300 + " V " + 300 + " H 0 Z";
	            		var  ppt ="M0,0 L70,0 L70,400 ,L0,400 Z"; 
	    				var bg = new SimpleMarkerSymbol().setPath(ppt);
	    				bg.setOffset(25, 10)
	    				//bg.setSize(50);
	    				bg.setColor(bgc);    			 			
	        			var bgGraphic = this.graphicsLayer.add(new Graphic(p,bg));
	            		 
	            }
			}
		},
		getMaxlengthAtArray : function(arry){
			var sortedArray = array.map(arry,function(t){
				var tempt = t.replace(/[a-zA-Z0-9]*/g, "");//汉字的像素值和字母数字的像素个数不一致，防止太宽
				var tl = 0;
				if(tempt){
					tl = t.length - tempt.length;
				}
				return t.length + "#" + tl;
			});
			sortedArray.sort(function(v1,v2){//升序排序
				return parseInt(v1.split('#')[0]) - parseInt(v2.split('#')[0]);
			});
			return sortedArray[sortedArray.length - 1];//返回最大的那个字符串长度
		},
		//[{x:,y:,textArray:[1,2,3]},{x,y,textArray}]
		changeMultilineText : function(infoArray){
			var posArray = [];
			for(var pos = 0; pos < this._multilineGraphic.length; pos++){
				var item = this._multilineGraphic[pos];
				for(var j = 0 ; j < infoArray.length; j++){					
					var textObj = infoArray[j];
					if(item.bgGraphic.geometry.x == textObj.x && item.bgGraphic.geometry.y == textObj.y){
						textObj.textInfo = {};						
						for(var i = 0; i < item.textGraphic.length; i++){
							textObj.textInfo.color = item.textGraphic[i].symbol.color.toRgb();		
							this.graphicsLayer.remove(item.textGraphic[i]);
						}							
						textObj.textInfo.text = textObj.textArray;
						textObj.background = {};
						textObj.background.bgcolor = item.bgGraphic.symbol.color.toRgba();
						textObj.background.outlinecolor = item.bgGraphic.symbol.outline.color.toRgba();
						this.graphicsLayer.remove(item.bgGraphic);
						posArray.unshift(pos);
						break;
					}
				}				
			}
			for(var p = 0; p < posArray.length;p++){
				this._multilineGraphic.splice(posArray[p],1);
			}
			this.addMultilineText(infoArray);
		},
		//添加多行文本 color:[255,0,0],font:'12px' 不传，此时采用默认字体和颜色
		/*
		var infoArray = [
				    {x:13026362.41741002,y:4386447.261975755,textInfo:{color:[255,0,0],font:'12px',text:['我的测试','我的测试','我的测试二','我的测试二']},background:{bgcolor:[0,0,255,0.5],outlinecolor:[128,0,0,0.5]}},
				    {x:13026362.17794821924,y:4367072.645576343,textInfo:{color:[255,0,0],font:'12px',text:['我的测试','我的测试','我的测试二','我的测试二我的','我的测试二']},background:{bgcolor:[128,0,0,0.5],outlinecolor:[128,0,0,0.5]}}
				];
		*/
		addMultilineText : function(infoArray){
			for(var i = 0; i < infoArray.length; i++){
				var info = infoArray[i];				
				var _max = this.getMaxlengthAtArray(info.textInfo.text).split('#');
				var maxlength = parseInt(_max[0]);
				var enlength = parseInt(_max[1]);
				var textFont = this._font;
				if(info.textInfo.font){
					textFont = new Font(info.textInfo.font).setWeight(Font.WEIGHT_BOLD);
				}
				var textColor = this._textColor;
				if(info.textInfo.color){
					textColor = Color.fromArray(info.textInfo.color);
				}
				
				var p = new Point(info.x,info.y,this._map.spatialReference);
				//如果有背景色，需要添加背景色
				var yoffset = -25;
				var _xoffset = -25;
				var bgGraphic = null;
            	if(lang.isObject(info.background)){
            		var bgc = this._bgColor;
            		var outc = this._outlinecolor;
            		if(info.background.bgcolor){
            			bgc = Color.fromArray(info.background.bgcolor);
            			outc = bgc;
            		}	            		
            		if(info.background.outlinecolor){
            			outc = Color.fromArray(info.background.outlinecolor);
            		}
    				//计算背景颜色的高度
    				var _height	= (parseInt(textFont.size) * 1.5) * info.textInfo.text.length + 18;	
    				var _width = maxlength * Math.floor(textFont.size * 1.5) + 10 - enlength * 10;
					
    				_xoffset = -_width / 2 + 15;
					
					var bgyoffset = -_height/2 + yoffset + textFont.size + 1;
					if(info.textInfo.text.length == 1) {
						_width = (info.textInfo.text[0].length - enlength + 1) * Math.floor(textFont.size * 1.5);
						_height = parseInt(textFont.size) + 8;
						bgyoffset = yoffset > 0 ? yoffset * 1.6: yoffset * 1.1 - 1;
					}					
    				var ppt = "M0,0 H " + _width + " V " + _height + " H 0 Z";
    				var bg = new SimpleMarkerSymbol().setPath(ppt).setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,outc,1));
    				bg.setSize(_width);
    				bg.setColor(bgc);
    				bg.setOffset(0, bgyoffset);				
    				bgGraphic = this.graphicsLayer.add(new Graphic(p,bg));
            	}
            	var tempArray = [];
				array.forEach(info.textInfo.text,function(item){
					var textSymbol = new TextSymbol({text:item,xoffset:_xoffset,yoffset:yoffset,color:textColor,font:textFont});
					if(info.textInfo.text.length == 1){
						textSymbol = new TextSymbol({text:item,xoffset:0,yoffset:yoffset,color:textColor,font:textFont,verticalAlignment:'baseline'});
					} else {
						textSymbol.setHorizontalAlignment('left');
						yoffset = yoffset - textFont.size - 2;	
					}
					var g = this.graphicsLayer.add(new Graphic(p,textSymbol));
					tempArray.push(g);
				},this);
				this._multilineGraphic.push({textGraphic:tempArray,bgGraphic:bgGraphic});
			}
		}
    });

    return obj;
});