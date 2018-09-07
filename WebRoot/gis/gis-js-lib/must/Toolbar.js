/**
 * @summary 提供各种地图操作的方法
 * @module must/Toolbar
 * @example require(["must/Toolbar"],function(Toolbar){     });
 */
define([
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/number",
    "dojo/dom-style",
    "dojo/keys",
    "dojox/collections/Dictionary",
    "dojo/data/ItemFileReadStore",
    "dijit/tree/ForestStoreModel",
    "dijit/Tree",
    "esri/config",
    "esri/symbols/TextSymbol",
    "esri/Color",
    "esri/symbols/Font",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/Circle",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/geometry/Multipoint",
    "esri/geometry/geometryEngine",
    "esri/geometry/normalizeUtils",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/map",
    "esri/graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/toolbars/navigation",
    "esri/toolbars/draw",
    "esri/tasks/GeometryService",
    "esri/tasks/BufferParameters",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/tasks/IdentifyResult",
    "esri/tasks/LengthsParameters",
    "esri/tasks/AreasAndLengthsParameters",
    "esri/SnappingManager",
    "esri/InfoTemplate"
],function(
    on,
    domConstruct,
    domAttr,
    declare,
    dojoArray,
    lang,
    number,
    domStyle,
    keys,
    Dictionary,
    ItemFileReadStore,
    ForestStoreModel,
    Tree,
    esriConfig,
    TextSymbol,
    Color,
    Font,
    SimpleLineSymbol,
    Circle,
    Polyline,
    Polygon,
    Multipoint,
    geometryEngine,
    normalizeUtils,
    SimpleMarkerSymbol,
    SimpleFillSymbol,
    PictureMarkerSymbol,
    Map,
    Graphic,
    GraphicsLayer,
    Point,
    Navigation,
    Draw,
    GeometryService,
    BufferParameters,
    IdentifyTask,
    IdentifyParameters,
    IdentifyResult,
    LengthsParameters,
    SnappingManager,
    AreasAndLengthsParameters,
    InfoTemplate

)
{
    var obj = declare([Navigation],{ 
    	_map:null,
        _customGraphicsLayer:null,
        _draw:null,
        _geometryService:null,
        _resultUnionExtent:null,
        _textColor : new Color([0,0,0]),//黑字
        _font:new Font('12px').setWeight(Font.WEIGHT_BOLD),//字体大小
        _bgColor:new Color([35,144,211,1]),//蓝底
        _outlinecolor:new Color([35,144,211,1]),
        _drawGeometry:null,//绘制的geometry 单个
        _drawGeometryArray:[],//绘制的Geometry 多个
        _drawEndCallBack:null,//绘制完成的返回事件

        inputPoints:[],
        totalDistance:0.0,

        //标志位
        _drawStart:false,//开启或关闭绘制的标志
        _onlyDraw:false,//只绘图不添加到地图
        _distanceMeasure :false,//开启关闭距离测量
        _areaMeasure :false,//开启关闭面积测量
		markerSymbol : new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 8, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([204, 102, 51]), 1), new Color([158, 184, 71, 0.65])),


        /**
         * @memberOf module:must/Toolbar#
         * @constructor Toolbar
         * @param {Object} map -地图对象
         * @example var toolbar=new Toolbar(map)         *
         */
        constructor: function(map){ 
        	var me = this;    
        	me._map=map;
            me._geometryService = new GeometryService($config.gisConfig.geometryService);
            var graphicsLayerIdslayids = map.graphicsLayerIds;
            if(me._customGraphicsLayer==null){
                for(var i = 0; i < graphicsLayerIdslayids.length; i++){
                    if(graphicsLayerIdslayids[i] == "customGraphicsLayer"){
                        me._customGraphicsLayer=map.getLayer(graphicsLayerIdslayids[i]);
                    }
                }
            }
            if(me._customGraphicsLayer==null){
                me._customGraphicsLayer = new GraphicsLayer({id:"customGraphicsLayer"});
                me._map.addLayer(me._customGraphicsLayer);
                me._customGraphicsLayer.on('click',function(evt){
                    me.customGraphicsLayerClickEvent(evt,me);
                });
                map.addLayer(this.graphicsLayer);
            }

            var symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CROSS,
                15,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0, 0.5]),
                    5
                ),
                null
            );
            //点击ctrl开启捕捉
            var snappingManager=new SnappingManager({
                map:map,
                layerInfos:{
                    layer:me._customGraphicsLayer
                }

            });
            map.enableSnapping();

            //开启捕捉
           /* map.enableSnapping({
                alwaysSnap:true,
                snapPointSymbol: symbol,
                tolerance: 30,
                snapKey: keys.ALT
            });*/

            me._draw = new Draw(map);
            
            //画图完成后的事件
            if(me._draw){
            	me._draw.on("draw-end", function(evt){
                	//停止绘图事件
                	me.addToMap(evt,me);
                	me._draw.deactivate();
                	if(me._distanceMeasure){//距离测量
                		me._distanceMeasure = false;
                    }
                });
            }
            map.on("click",function(evt){
                me.mapClickEvent(evt);
            });

        },

        customGraphicsLayerClickEvent:function(evt){

        },
/*        drawEndEvent:function(evt){
            var me=this;
            if(me._drawStart){
                me.addDrawGraphicToMap(evt);
                me.customDeactivate();
                me._drawStart=false;
            }
            if(me._onlyDraw){
                me.customDeactivate();
                me._onlyDraw=false;
                if(lang.isFunction(me._drawEndCallBack)){
                    me._drawEndCallBack(evt);
                    me._drawEndCallBack=null;
                }

            }
            if(me._distanceMeasure || me._areaMeasure){//如果是距离测量或者面积测量
                        var geometry = evt.geometry; //绘制的 geometry
                        me.addGraphicsToMap(geometry);//将绘制的图形加到地图中去
                        if(me._distanceMeasure){//距离测量

                            me.inputPoints.splice(0,me.inputPoints.length); //删除数组中的所有元素 数组中存放的是绘制的各个点 距离测量时使用的
                            me.totalDistance = 0.0;//重置测量总长度
                            me.totalGraphic = null;
                        }else if(me._areaMeasure){//面积测量

                    var area =geometryEngine.planarArea(geometry,"square-kilometers");
                    var font = new Font("18px", Font.STYLE_NORMAL,Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var areaResult = new TextSymbol(number.format(area,{pattern: '#.000'})+"平方公里", font, new Color([204, 102, 51]));
                    var spoint = new Point(geometry.getExtent().getCenter().x, geometry.getExtent().getCenter().y, me.map.spatialReference);
                    me._map.graphics.add(new Graphic(spoint, areaResult));//在地图上显示测量的面积

                }
            }

            if(me._distanceMeasure){

            }
            if(me._areaMeasure){



            }
        },*/

        mapClickEvent:function(evt){
            var me=this;
            if(me._distanceMeasure){//距离测量
                me._distanceMeasureHandler(evt.mapPoint);
            }else if(me._areaMeasure){//面积测量

            }else if(me._clickQuery) {//点击查询
            }
        },
        /**
         *
         *  @description 清除customer图层
         *  @memberOf module:must/Toolbar#
         */
        clearCustomerGraphicsLayer:function(){
            var me=this;
            var layer= me._map.getLayer("customGraphicsLayer");
            if(layer!=null||layer!=undefined){
                if(layer.graphics.length>0){
                    layer.clear();
                }

            }

        },

        /**
         * @description 距离测量
         * @memberOf module:must/Toolbar#
         *
         */
    	distancMeasure:function(){
            //this._map.disableMapNavigation();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = true;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.POLYLINE);
        },
        /**
         * @description 面积测量
         * @memberOf module:must/Toolbar#
         *
         */
        areaMeasure :function(){//面积测量
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = true;
            this._clickQuery = false;
            this._draw.activate(Draw.POLYGON);
        },
        /**
         * @description 仅删除测量过程中绘制的图形信息
         * @memberOf module:must/Toolbar#
         *
         */
        clearMeasure:function(){
            this._map.graphics.clear();            
            this.customDeactivate();//撤销地图绘制功能
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);//启用地图漫游
        },
        /**
         * @description 撤销地图绘制功能
         * @memberOf module:must/Toolbar#
         */
        customDeactivate:function(){
            this._draw.deactivate();
			if(this._distanceMeasure){
                this.customDrawEnd();
			    this._distanceMeasure = false;
			}
        },
		customDrawEnd:function(){
		    //测量距离恢复初始化
		    this.inputPoints.splice(0,this.inputPoints.length); //删除数组中的所有元素 数组中存放的是绘制的各个点 距离测量时使用的
		    this.totalDistance = 0.0;//重置测量总长度
		    this.totalGraphic = null;
		},
        /**
         * @description 只绘制地图，不将绘制的点添加到地图
         * @memberOf module:must/Toolbar#
         * @param {Function} callback  -返回函数能获得画的对象
         * @example drawPointNoAddToMap(function(evt){});
         */
        drawPointNoAddToMap:function(callback){
            var me=this;
            this._draw.activate(Draw.POINT);
            this._onlyDraw=true;
            me._drawEndCallBack=callback;
        },

        /**
         * @description 在地图上绘制一个单点
         * @memberOf module:must/Toolbar#
         */
        drawPoint:function(callback){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._drawStart=true;
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.POINT);
            this._drawEndCallBack=callback;
        },
        /**
         * @description 绘制多点
         * @memberOf module:must/Toolbar#
         *
         */
        drawMultiPoint:function(callback){
             this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.MULTI_POINT);
            this._drawEndCallBack=callback;
        },
        /**
         * @description 画多边形面
         * @memberOf module:must/Toolbar#
         */
        drawPolygon:function(callback){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._drawStart=true;
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.POLYGON);
            this._drawEndCallBack=callback;
        },
        /**
         * @description 画折线
         * @memberOf module:must/Toolbar#
         */
        drawPolyline:function(callback){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._drawStart=true;
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.POLYLINE);
            this._drawEndCallBack=callback;
        },
        /**
         * @description 画简单线
         * @memberOf module:must/Toolbar#
         */
        drawLine:function(callback){
             this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.LINE);
            this._drawEndCallBack=callback;
        },
        /**
         * @description 画圆
         * @memberOf module:must/Toolbar#
         */
        drawCircle:function(callback){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.CIRCLE);
            this._drawEndCallBack=callback;
        },
        
        /**
         * @description 地图放大
         * @memberOf module:must/Toolbar#
         */
        mapZoomIn : function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.ZOOM_IN);//地图放大
        },

        /**
         * @description 地图缩小
         * @memberOf module:must/Toolbar#
         */
        mapZoomOut : function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.ZOOM_OUT);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 地图全幅显示
         */
        fullMap : function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.zoomToFullExtent();
        },
        /**
         * @description  地图平移漫游
         * @memberOf module:must/Toolbar#
          */
        mapPan :function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
        },
        /**
         * @description 地图居中并放大到某个级别
         * @memberOf module:must/Toolbar#
         * @param {Number} x      -x坐标
         * @param {Number} y      -y坐标
         * @param {Number} zoom   -地图显示级别
         */
        mapCenterAt : function(x,y,zoom){
            var mapPoint = new Point(x,y,this._map.spatialReference);
            if(zoom != undefined){
                if(zoom == true){
                    this._map.centerAndZoom(mapPoint, this._map.getMaxZoom());
                } else {
                    if(!isNaN(zoom) && zoom >= 0)
                        this._map.centerAndZoom(mapPoint, zoom);
                }
            } else {
                this._map.centerAt(mapPoint);
            }
        },

        /**
         * @description 在地图上添加点（默认样式）并返回点的Extent
         * @memberOf module:must/Toolbar#
         * @param {Array} array  -点的对象数组
         * @return 点的Extent
         */
         addPointArrayToGraphicsLayer:function(array){
            var me=this;
            var extentArr = [];
             for(var i=0;i<array.length;i++){
                var mapPoint = new Point(array[i].x,array[i].y,me._map.spatialReference);
                var attribute=null;
                var infoTemplate=null;
                if(array[i].attribute!=undefined){
                    attribute=array[i].attribute;
                }
                if(array[i].infoTemplate!=undefined){
                    infoTemplate=array[i].attribute;
                }
                me.addGraphicsToMap(mapPoint,attribute,infoTemplate);
                 var pointArray = new Array();
                 pointArray.push(array[i].x);
                 pointArray.push(array[i].y);
                 extentArr.push(pointArray);
            }
            var mapJson ={
                "points":array,//[[-122.63,45.51],[-122.56,45.51],[-122.56,45.55]],
                "spatialReference":this._map.spatialReference
            };
            var multipoint = new Multipoint(mapJson);
            var extent = multipoint.getExtent();
            return extent;
         },       

        /**
         * @description 在地图上添加线并返回点的Extent
         * @memberOf module:must/Toolbar#
         * @param {Array} array  -线的对象数组
         * @return 线的Extent
         */
         addLineArrayToGraphicsLayer:function(array){
             var me=this;
             var allLineExtent=null; 
        	 for(var i=0;i<array.length;i++){
        	     var line= null;
                 if(typeof(array[i]) == "string"){
                     line=eval("("+array[i]+")");
                 }else{
                     line=array[i];
                 }
                 var polyline = new Polyline(line);
                 var attribute=null;
                 var infoTemplate=null;
                 if(line.attribute!=undefined){
                     attribute=line.attribute;
                 }
                 if(line.infoTemplate!=undefined){
                     infoTemplate=line.attribute;
                 }
                 var graphic=me.addGraphicsToMap(polyline,attribute,infoTemplate);
                 var extent=polyline.getExtent();
                 if(allLineExtent==null){

                     allLineExtent = extent;
                 }else{
                     allLineExtent=allLineExtent.union(extent);

                 }
             }
             return allLineExtent;
         },
         /**
          * @description 在地图上添加面并返回面的Extent
          * @memberOf module:must/Toolbar#
          * @param {Array} array  -面的对象数组
          * @return 面的Extent
          */
         addPolygonArrayToGraphicsLayer:function(array){
             var me=this;
             var allPolygonExtent=null;
        	 for(var i=0;i<array.length;i++){
                 var pg= null;
                 if(typeof(array[i]) == "string"){
                     pg=eval("("+array[i]+")");
                 }else{
                     pg=array[i];
                 }
                 var polygon = new Polygon(pg);
                 var attribute=null;
                 var infoTemplate=null;
                 if(pg.attribute!=undefined){
                     attribute=pg.attribute;
                 }
                 if(pg.infoTemplate!=undefined){
                     infoTemplate=pg.attribute;
                 }
                var graphic= me.addGraphicsToMap(polygon,attribute,infoTemplate);
                 var extent=polygon.getExtent();
                 if(allPolygonExtent==null){

                     allPolygonExtent = extent;
                 }else{
                     allPolygonExtent=allPolygonExtent.union(extent);
                 }
             }
             return allPolygonExtent;
         },
        /**
         * @description 重置地图的显示范围
         * @memberOf module:must/Toolbar#
         * @param {Array}extentArray -Extent对象数组
         */
         changeMapExtent:function(extentArray){
             var me=this;
             var unionExtent=null;
             if(extentArray.length>0){
                 for(var i=0;i<extentArray.length;i++){
                    if(unionExtent==null){
                        unionExtent=extentArray[i];
                    }else{
                        unionExtent.union(extentArray[i]);
                    }
                 }
                 me._map.setExtent(unionExtent.expand(1.5));
             }
         },


        /**
         * @description 在地图上添加自定义
         * @memberOf module:must/Toolbar#
         * @param {Object} info -点的属性
         * @example
         *var info1= {
                x:x,
                y:y,
                url:'../../gis/images/hollowPoint.png',
                width:32,
                height:64,
                infoTemplate:null,
                attributes:{},
                textInfo:[
                    {
                        text:"text",
                        color:[5,140,254],
                        xoffset:0,
                        yoffset:11
                    }
                ]
          }
         toolbar.addCustomPointToMap(info);
         *
         *
         */
        addCustomPointToMap:function(info){
            var me=this;
            for(var i = 0; i < info.length; i++){
                var textInfo=info[i].textInfo;
                var p = new Point(info[i].x,info[i].y,me._map.spatialReference);
                var pmsimg = new PictureMarkerSymbol(info[i].url,info[i].width,info[i].height);
                var g = me._customGraphicsLayer.add(new Graphic(p, pmsimg));
                if(lang.isObject(info[i].infoTemplate)){
                    g.setInfoTemplate(info[i].infoTemplate);
                }
                if(lang.isObject(info[i].attributes)){
                    g.setAttributes(info[i].attributes);
                }
                //如果有点的标注的话
                if(lang.isObject(textInfo)){
                    for(var j=0;j<textInfo.length;j++){
                        var textcolor= this._textColor;
                        if(textInfo[j].color){
                            textcolor = Color.fromArray(textInfo[j].color);
                        }
                        var textSymbol = new TextSymbol({
                            text:textInfo[j].text,
                            xoffset:textInfo[j].xoffset,yoffset:textInfo[j].yoffset,
                            color:textcolor,font:me._font,
                            verticalAlignment:'baseline'});
                        //如果有背景色，需要添加背景色
                        if(lang.isObject(textInfo[j].background)){
                            var bgc = this._bgColor;
                            var outc = this._outlinecolor;
                            if(textInfo[j].background.bgcolor){
                                bgc = Color.fromArray(textInfo[j].background.bgcolor);
                                outc = bgc;
                            }
                            if(textInfo[j].background.outlinecolor){
                                outc = Color.fromArray(textInfo[j].background.outlinecolor);
                            }

                            var svgWidth = textSymbol.text.length * Math.floor(me._font.size * 1.5);
                            var ppt = "M0,0 H " + svgWidth + " V " + (parseInt(me._font.size) + 8) + " H 0 Z";
                            var marker = new SimpleMarkerSymbol().setPath(ppt).setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,outc,1));
                            marker.setColor(bgc);
                            marker.setOffset(0,textInfo[j].yoffset > 0 ? textInfo[j].yoffset * 1.6: textInfo[j].yoffset * 1.1 - 1);
                            marker.setSize(svgWidth);
                            var h = me._customGraphicsLayer.add(new Graphic(p, marker));
                            if(lang.isObject(info[i].attributes)){
                                h.setAttributes(info[i].attributes);
                            }
                        }
                        var m=me._customGraphicsLayer.add(new Graphic(p,textSymbol));
                        if(lang.isObject(info[i].attributes)){
                            m.setAttributes(info[i].attributes);
                        }
                    }
                }


            }
        },
        //将绘制的图形加到地图中去
        addDrawGraphicToMap:function(evt){
            var  me=this;
            var geometry = evt.geometry; //绘制的 geometry
            me.addGraphicsToMap(geometry);
            me._drawGeometry=null;
            me._drawGeometry=geometry;
        },
        /**
         * @description -得到绘制的Geometry，绘制完成后，调用该方法可返回绘制的对象
         * @memberOf module:must/Toolbar#
         * @returns 返回绘制的对象
         */
        getDrawGeometry:function(){
            var me=this;
            var drawGeometry=me._drawGeometry;
            return  drawGeometry;
        },
        getDrawGeometryArray:function(){

        },

        addMeasureToMap:function(geometry){
            var me=this;
            var symbol = null;
            switch (geometry.type) { //point | multipoint | polyline | polygon | extent
                case "point":
                    symbol = new PictureMarkerSymbol("../../gis/images/point.png",30,30);
                    symbol.setOffset(0,13);
                    break;
                case "polyline":
                    symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0,0.8]), 2);
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
            var _graphic = me._map.graphics.add(new Graphic(geometry, symbol));

        },
        addGraphicsToMap:function(geometry,attributes,infoTemplate){
            var me=this;
            var symbol = null;
            switch (geometry.type) { //point | multipoint | polyline | polygon | extent
                case "point":
                    symbol = new PictureMarkerSymbol("../../gis/images/point.png",30,30);
                    symbol.setOffset(0,13);
                    break;
                case "polyline":
                    symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0,0.8]), 2);
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
            var _graphic = me._customGraphicsLayer.add(new Graphic(geometry, symbol));

            if(lang.isObject(attributes)){
                _graphic.setAttributes(attributes);
            }
            if(infoTemplate){
                var infoObj=new InfoTemplate(infoTemplate);
                _graphic.setInfoTemplate(infoObj);
            }
            return _graphic;
       },
        addGraphicsToMap2 :function(geometry,attributes,infoTemplate){
             var me=this;
             var symbol = null;
             switch (geometry.type) { //point | multipoint | polyline | polygon | extent
                 case "point":
                     symbol = new PictureMarkerSymbol("../../gis/images/point.png",30,30);
                     symbol.setOffset(0,13);
                     break;
                 case "polyline":
                     symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0,0.8]), 2);
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
             var _graphic =  me._map.graphics.add(new Graphic(geometry, symbol));
             if(lang.isObject(attributes)){
                 _graphic.setAttributes(attributes);
             }
             if(infoTemplate){
                 var infoObj=new InfoTemplate(infoTemplate);
                 _graphic.setInfoTemplate(infoObj);
             }
             return _graphic;
        },
        /**
         * @description 生成缓冲区  缓存区单位默认米
         * @memberOf module:must/Toolbar#
         * @param {Geometry} geometry -用于生成缓冲区的Geometry
         * @param {Number} bufferSize -缓冲区的半径
         * @param bufferCallback      -返回的方法补货生成的缓冲区对象
         */
         doBuffer : function(geometry,bufferSize,bufferCallback){
            var me=this;
            var params = new BufferParameters();
            params.bufferSpatialReference=me._map.spatialReference;
            params. distances=[bufferSize];
            params.outSpatialReference=me._map.spatialReference;
            params.unit=me._geometryService.UNIT_METER;
            normalizeUtils.normalizeCentralMeridian([geometry],me._geometryService,function(normalizedGeometries){
                var normalizedGeometry = normalizedGeometries[0];
                if (normalizedGeometry.type === "polygon") {
                    me._geometryService.simplify([normalizedGeometry], function(geometries) {
                        params.geometries = geometries;
                        me._geometryService.buffer(params, lang.hitch(this,function(bgeo){
                            //this.showBuffer(bgeo,url,layerIds,bufferCallback);
                            if(lang.isFunction(bufferCallback)){
                                bufferCallback(bgeo);
                            }
                            bufferGeometry=bgeo;

                        }),function(evt){
                            alert("生成缓冲区失败");
                        });
                    },function(evt){
                        alert("输入的多边形有误");
                    });
                } else {
                    params.geometries = [normalizedGeometry];
                    me._geometryService.buffer(params, lang.hitch(this,function(bgeo){
                        if(lang.isFunction(bufferCallback)){
                            bufferCallback(bgeo);
                        }
                    }));
                }

            },function(evt){

                alert("绘制的图形超出世界范围！");

            });

        },
        showBuffer : function(bufferedGeometries,url,layerIds,bufferCallback) {
            var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0,0.65]), 2),new Color([255,0,0,0.35]));
            array.forEach(bufferedGeometries, function(geometry){
                this._map.graphics.add(new Graphic(geometry, symbol));
                this.identifyQuery(url,layerIds,geometry,bufferCallback);//查询缓冲区的内容
            },this);
        },
        /**
         * @description  属性查询
         * @memberOf module:must/Toolbar#
         * @param {String} url -查询的地图服务url
         * @param {Array} layerIds -查询的图层编号
         * @param {Geometry} geometry -用于查询的要素对象
         * @param {String} identifyQueryCallback  -调用该方法的返回查询结果
         * @example identifyQuery("http://xxx",[0,1,2],Polygon,function(result){});
         */
        identifyQuery : function(url,layerIds,geometry,identifyQueryCallback){
             var me=this;
            var identifyTask = new IdentifyTask(url);
            var identifyParams = new IdentifyParameters();
            identifyParams.returnGeometry = true;
            identifyParams.tolerance = 5;
            identifyParams.layerIds = layerIds;
            identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;//LAYER_OPTION_VISIBLE
            identifyParams.geometry = geometry;
            identifyParams.width = me._map.width;
            identifyParams.height = me._map.height;
            identifyParams.mapExtent = me._map.extent;
            identifyParams.spatialReference = this._map.spatialReference;
            identifyTask.execute(identifyParams, lang.hitch(this,function(results){

                if(lang.isFunction(identifyQueryCallback)){
                    identifyQueryCallback(results);
                }
            }),function(err){
                if(lang.isFunction(identifyQueryCallback)){
                    identifyQueryCallback(null);
                }
            });
        },
        /**
         * @description 根据属性删除点
         * @memberOf module:must/Toolbar#
         * @param {String} key    -属性字段
         * @param {String} value  -属性值
         */
        removeGraphicByAttribute:function(key,value,callBack){
            var me=this;
            var graphicArray = me._customGraphicsLayer.graphics;
            for(var i=graphicArray.length-1;i>=0;i--){
                if(graphicArray[i].attributes!=undefined){
                    if(graphicArray[i].attributes!=null){
                        if(graphicArray[i].attributes[key]==value){
                            me._customGraphicsLayer.remove(graphicArray[i]);
                            //me.removeGraphicByAttribute(key,value);

                        }
                    }
                }
            }
            if(lang.isFunction(me.callBack)){
                callBack(null);

            }

        },

        /**
         * @description 根据点的xy坐标删除对应的点
         * @memberOf module:must/Toolbar#
         * @param {Number} x  -坐标x
         * @param {Number} y  -坐标y
         */
        removePointByXY: function(x,y) {
            var me=this;
            var graphicArray =   me._customGraphicsLayer.graphics;
            for(var i=graphicArray.length-1;i>=0;i--){
                var geo = graphicArray[i].geometry;
                if (geo.type == 'point') {
                    if (geo.x == x && geo.y == y) {
                        me._customGraphicsLayer.remove(graphicArray[i]);
                    }
                }
            }
        },
        /**
         * @description 根据要素数据类型删除点
         * @memberOf module:must/Toolbar#
         * @param {String} type -属性字段"point","polygon","polyline"
         * @param value
         */
        removeGraphicByType:function(type){
            var me=this;
            var graphicArray = me._customGraphicsLayer.graphics;
            for(var i=graphicArray.length-1;i>=0;i--){
                if(graphicArray[i].geometry.type==type){
                    me._customGraphicsLayer.remove(graphicArray[i]);
                }
            }
        },
        /**
         * @description 通过ID隐藏某一个地图服务
         * @memberOf module:must/Toolbar#
         * @param {String} serverId -地图服务的ID
         */
        hideMapServerById:function(serverIds){
            var me=this;
            var serverIdArray=serverIds.split(",");
            for(var i=0;i<serverIdArray.length;i++){
                var layer=me._map.getLayer(serverIdArray[i]);
                layer.hide();
            }

        },
        /**
         * @description  通过ID展示某一个地图服务
         * @memberOf module:must/Toolbar#
         * @param serverId
         */
        showMapServerId:function(serverIds){
            var me=this;
            var serverIdArray=serverIds.split(",");
            for(var i=0;i<serverIdArray.length;i++){
                var layer=me._map.getLayer(serverIdArray[i]);
                layer.show();
            }

        },

        /**
         * @description -通过服务ID、图层编号 控制图层的显示
         * @memberOf module:must/Toolbar#
         * @param {String} serverId -地图服务ID
         * @param {String} layerStringIds -地图图层编号1,2,3,4
         */
        showLayerByServerIdAndNum:function(serverId,layerStringIds){
            var me=this;
            var layerArray=layerStringIds.split(",");
            me._map.getLayer(serverId).setVisibleLayers(layerArray);
        },

        _distanceMeasureHandler:function(mapPoint,flag){
            this.inputPoints.push(mapPoint);//地图上添加鼠标点击处的点            
            //添加起点
            var textSymbol;
            if (this.inputPoints.length === 1) { //记录第一个点
                textSymbol = new TextSymbol("起点", this._font, new Color([204, 102, 51]));
                textSymbol.setOffset(0,-20);
                this._map.graphics.add(new esri.Graphic(mapPoint, textSymbol));
            }
            //鼠标点击处添加点，并设置其样式
            this._map.graphics.add(new Graphic(mapPoint, this.markerSymbol));
            if (this.inputPoints.length >= 2) {

                var p1 = this.inputPoints[this.inputPoints.length - 2];
                var p2 = this.inputPoints[this.inputPoints.length - 1];
                //同一个点，解决重复添加的bug
                if(p1.x == p2.x && p1.y == p2.y)
                    return;
                //在两点之间画线将两点连接起来
                var polyline = new Polyline(this._map.spatialReference);
                polyline.addPath([p1, p2]);
                //lengthParams.polylines = [polyline];
                var me = this;
                var distance=0;
                //根据参数,动态计算长度
                if (me._map.spatialReference.isWebMercator() || me._map.spatialReference.wkid == "4326") {//在web麦卡托投影和WGS84坐标系下的计算方法
                    distance=geometryEngine.geodesicLength(polyline, "meters");
                } else {//在其他投影坐标系下的计算方法
                    distance= geometryEngine.planarLength(polyline, "meters");
                }

                var _distance = number.format(distance/ 1000);
                me.totalDistance += parseFloat(_distance);//计算总长度
                var beetwentDistances = _distance + "千米";
                var tdistance = new TextSymbol(beetwentDistances, this._font, new Color([204, 102, 51]));
                tdistance.setOffset(40, -3);
                me.map.graphics.add(new Graphic(p2, tdistance));
                if (me.totalGraphic) //如果总长度存在的话,就删除总长度Graphic
                    me.map.graphics.remove(me.totalGraphic);
                var total = number.format(me.totalDistance,{pattern:"#.000"});//保留三位小数
                //设置总长度显示样式,并添加到地图上
                var totalSymbol = new TextSymbol("总长度:"+ total + "千米", this._font, new Color([204, 102, 51]));
                totalSymbol.setOffset(40,-20);
                me.totalGraphic = me._map.graphics.add(new Graphic(p2,totalSymbol));

                //绘制结束后恢复初始化参数
                if(flag){
                    me.customDrawEnd();
                }
            }
        },
        addToMap:function(evt,me){

            if(me._distanceMeasure || me._areaMeasure){//如果是距离测量或者面积测量
                var geometry = evt.geometry; //绘制的 geometry
                me.addGraphicsToMap2(geometry);//将绘制的图形加到地图中去
                if(me._distanceMeasure){//距离测量
                   var length1 = geometry.paths[0].length;
					var x1 = geometry.paths[0][length1-1]['0'];
					var y1 = geometry.paths[0][length1-1]['1'];
					var length2 = me.inputPoints.length;
					var x2 = me.inputPoints[length2-1]['x'];
					var y2 = me.inputPoints[length2-1]['y'];
                    //双击时,click事件如果未响应,绘制的polyline与inputPoints最后一个点坐标不一样
					if((x1 != x2)||(y1 != y2)){
                       var point = new Point(x1,y1,geometry.spatialReference);
						me._distanceMeasureHandler(point,true);
					}
					else{
						me.customDrawEnd();
					}
                }else if(me._areaMeasure){//面积测量

                    var geometry=evt.geometry;
                    var area=0;
                    if((geometry.spatialReference.wkid=="4326")||(geometry.spatialReference.wkid=="3785")){
                        area =geometryEngine.geodesicArea(evt.geometry,"square-kilometers");
                        //console.log(area);
                    }else{
                         area=geometryEngine.planarArea(evt.geometry,"square-kilometers");
                    }
                    var font = new Font("18px", Font.STYLE_NORMAL,Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var areaResult = new TextSymbol(number.format(area,{pattern: '#.000'})+"平方千米", font, new Color([204, 102, 51]));
                    var spoint = new Point(geometry.getExtent().getCenter().x, geometry.getExtent().getCenter().y, me.map.spatialReference);
                    me._map.graphics.add(new Graphic(spoint, areaResult));//在地图上显示测量的面积

                }                
            }else if(me._drawStart){
                me.addDrawGraphicToMap(evt);
                me.customDeactivate();
                me._drawStart=false;
                if(lang.isFunction(me._drawEndCallBack)){
                    me._drawEndCallBack(evt);
                    me._drawEndCallBack=null;
                }
            }
            else if(me._onlyDraw){
                me.customDeactivate();
                me._onlyDraw=false;
                if(lang.isFunction(me._drawEndCallBack)){
                    me._drawEndCallBack(evt);
                    me._drawEndCallBack=null;
                }

            }
            else{
	           	   var geometry = evt.geometry; //绘制的 geometry
	               me.addGraphicsToMap2(geometry);//将绘制的图形加到地图中去
	               /*if(lang.isFunction(me._drawEndHandler)){
	                    me._drawEndHandler(evt);
	               }*/
            }
         }
        });
    return obj;
});