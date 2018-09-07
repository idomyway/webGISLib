/**
 * @summary 提供基础工具条的方法
 * @module must/MapHandler
 * @example require(["must/MapTool"],function(MapTool){     });
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
    "esri/geometry/geometryEngine",
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
    "esri/geometry/normalizeUtils",
    "esri/tasks/BufferParameters",
    "esri/tasks/LengthsParameters",
    "esri/tasks/AreasAndLengthsParameters",
    "esri/geometry/Extent",
    "esri/geometry/webMercatorUtils",
    "esri/InfoTemplate",
    "esri/dijit/InfoWindow",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/tasks/IdentifyResult",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "dijit/popup",
    "esri/geometry/Multipoint",
    "esri/layers/MapImageLayer",
    "esri/layers/MapImage"
],function(
    on,
    domConstruct,
    domAttr,
    declare,
    array,
    lang,
    number,
    domStyle,
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
    geometryEngine,
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
    normalizeUtils,
    BufferParameters,
    LengthsParameters,
    AreasAndLengthsParameters,
    Extent,
    webMercatorUtils,
    InfoTemplate,
    InfoWindow,
    IdentifyTask,
    IdentifyParameters,
    IdentifyResult,
    QueryTask,
    Query,
    dijitPopup,
    Multipoint,
    MapImageLayer,
    MapImage
)
{
    var obj = declare([Navigation],{
        _map:null,
        _font:new Font('12px').setWeight(Font.WEIGHT_BOLD),
        _clickQuery : false,//点击查询
        _clickUrl : null,
        _clickIds : null,
        _drawEndHandler:null,
        _mapClickHandler:null,
        _geometryService:null,
        totalDistance:0.0,
        totalGraphic:null,
        _infoWindow:null,
        _dialog : null,
        _clickTree : null,
        markerSymbol : new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 7, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 1), new Color([255,0,0])),
        _draw:null,
        _distanceMeasure:false,//取消距离测量
        _areaMeasure : false,//取消面积测量
        graphicsLayer:null,
        levelGraphicsLayer:null,
        inputPoints:[],
        /**
         * @memberOf module:must/Toolbar#
         * @constructor Toolbar
         * @param {Object} map -地图对象
         * @example var toolbar=new Toolbar(map)
         */
        constructor: function(map){
            var me = this;
            me._map=map;
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
                //this.graphicsLayer.on('mouse-over',function(evt){me.mouseOverCallback(evt,me);});
                //this.graphicsLayer.on("mouse-out", function(evt){me.mouseOutCallback(evt,me);});
                map.addLayer(this.graphicsLayer);
            }
            if(this.levelGraphicsLayer == null){
                this.levelGraphicsLayer = new GraphicsLayer({id:"levelSymbolLayer"});
                this.levelGraphicsLayer.on('click',function(evt){me.clickCallback(evt,me);});
                //this.levelGraphicsLayer.on('mouse-over',function(evt){me.mouseOverCallback(evt,me);});
                //this.levelGraphicsLayer.on("mouse-out", function(evt){me.mouseOutCallback(evt,me);});
                map.addLayer(this.levelGraphicsLayer);
            }
            me._draw = new Draw(map);
            //画图完成后的事件
            if(this._draw){
                this._draw.on("draw-end", function(evt){
                    //停止绘图事件
                    me.addToMap(evt,me);
                    me._draw.deactivate();
                    if(me._distanceMeasure){//距离测量
                        me._distanceMeasure = false;
                    }
                    if(me.onshow){
                        for(var i = 0; i < me.onshow.length; i++){
                            me.onshow[i](evt);//调用事件处理程序
                        }
                    }
                });
            }

            map.on("click",function(evt){me.myMapClick(evt,me);});
            this._geometryService = new GeometryService($config.gisConfig.geometryService);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description  绘画完成后触发的事件
         * @event
         * @param _eHandler
         */
        addEventOnDrawEnd : function (_eHandler){
            //用数组存储绑定的事件处理程序引用
            this.onshow = this.onshow || [];
            this.onshow.push(_eHandler);
        },
        /*    	subscribe:function(fn){
         this.fns.push(fn);
         },*/
        /**
         * @memberOf module:must/Toolbar#
         * @description 距离测量
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
         * @memberOf module:must/Toolbar#
         * @description 面积测量
         */
        areaMeasure :function(){//面积测量
            //this._map.disableMapNavigation();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = true;
            this._clickQuery = false;
            this._draw.activate(Draw.POLYGON);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 仅删除测量过程中绘制的图形信息
         */
        clearMeasure:function(){
            this._map.graphics.clear();
            this.customDeactivate();//撤销地图绘制功能
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);//启用地图漫游
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 画点
         */
        drawPoint:function(){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.POINT);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 画多点
         */
        drawMultiPoint:function(){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.MULTI_POINT);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 画多边形面
         */
        drawPolygon:function(){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.POLYGON);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 画折线
         */
        drawPolyline:function(){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.POLYLINE);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 画简单线
         */
        drawLine:function(){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.LINE);
        },

        /*  drawExtent:function(){
         this._map.enableScrollWheelZoom();
         this.activate(Navigation.PAN);
         this._distanceMeasure = false;
         this._areaMeasure = false;
         this._clickQuery = false;
         this._draw.activate(Draw.EXTENT);
         },*/
        /**
         * @memberOf module:must/Toolbar#
         * @description 画圆
         */
        drawCircle:function(){
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
            this._distanceMeasure = false;
            this._areaMeasure = false;
            this._clickQuery = false;
            this._draw.activate(Draw.CIRCLE);
        },

        /**
         * @memberOf module:must/Toolbar#
         * @description 地图放大
         */
        mapZoomIn : function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.ZOOM_IN);//地图放大
        },

        /**
         * @memberOf module:must/Toolbar#
         * @description 地图缩小
         */
        mapZoomOut : function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.ZOOM_OUT);
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description 地图全副显示
         */
        fullMap : function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.zoomToFullExtent();
        },
        /**
         * @memberOf module:must/Toolbar#
         * @description  地图平移漫游
         */
        mapPan :function(){
            this.customDeactivate();
            this._map.enableScrollWheelZoom();
            this.activate(Navigation.PAN);
        },
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
         * @memberOf module:must/Toolbar#
         * @description 地图居中并放大到某个级别
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
         * 点定位
         * attributes为object对象：{ID:1,NAME:"name"}
         */
        locationByPoint:function(x,y,level,attributes){
            var mapPoint = new Point(x,y,this._map.spatialReference);
            if(!mapPoint.spatialReference.equals(this._map.spatialReference)){
                mapPoint.spatialReference=this._map.spatialReference;
            }
            this.addGraphicsToMap(mapPoint,attributes);
            if(level){
                this._map.centerAndZoom(mapPoint,level);
            }else{
                this._map.centerAt(mapPoint);

            }

        },
        /**
         * 线定位
         */
        locationByLine:function(){

        },
        /**
         * 面定位
         */
        locationByPolygon:function(){

        },
        /**
         * 根据属性删除点定位
         */
        removeGraphicByAttribute:function(key,value){
            var me=this;
            var graphicArray = me._map.graphics.graphics;
            var containGraphic = array.map(graphicArray,function(graphic){
                if(graphic.attributes!=undefined){
                    if(graphic.attributes[key]==value){
                        me._map.graphics.remove(graphic);
                    }
                }

            });
        },
        //
        geographicToWebMercator : function(geometry){
            return webMercatorUtils.geographicToWebMercator(geometry);
        },

        webMercatorToGeographic : function(geometry){
            return webMercatorUtils.webMercatorToGeographic(geometry);
        },

        xyToLngLat : function(x,y){
            return webMercatorUtils.xyToLngLat(x,y);
        },

        lngLatToXY : function(long,lat){
            return webMercatorUtils.lngLatToXY(long,lat);
        },

        /**
         * 地图点击事件
         */
        myMapClick:function(evt,me){
            if(me._distanceMeasure){//距离测量
                me._distanceMeasureHandler(evt.mapPoint);
            }else if(me._areaMeasure){//面积测量

            }else if(me._clickQuery){//点击查询
                me.identifyQuery(me._clickUrl,me._clickIds,evt.mapPoint,function(results,map){
                    if(results.length > 0){
                        //利用hashtable进行对应的生成，获取相同名称的属性值，并放到同一个key对应的value中
                        var hashtable = new Dictionary();
                        //这里生成新的数组，获取名字相同的图层名
                        for(var i = 0; i < results.length; i++){
                            if(!hashtable.containsKey(results[i].layerName)) {
                                hashtable.add(results[i].layerName, [results[i].feature]);
                            }
                            else {
                                var arrayFeature = hashtable.item(results[i].layerName);
                                arrayFeature.push(results[i].feature);
                            }
                        }
                        if(me._clickTree){
                            me._clickTree.destroy();
                        }
                        me.handler_click_query(hashtable,evt,me);
                        me.addGraphicsToMap(evt.mapPoint,false,false,{clickQueryFlag:'clickQuery'});
                    }else{
                        alert("当前点未查询到任何元素");
                    }
                });
            }else {
                if(lang.isFunction(me._mapClickHandler)){
                    me._mapClickHandler(evt);
                }
            }
        },

        //处理点击查询 hashtable key 为图层名称 value 为 feature数组
        handler_click_query:function(hashtable,evt,me){
            var table_tree = "<div style=\"height:260px;overflow:hidden;\"><div id=\"pointQueryResult\" style=\"padding-left:0px;overflow:visible\" > <table width=\"375\" cellpadding=\"0\" style=\"border-width: 1px;border-color: #666666;border-collapse: collapse;\"><tr><th style=\"border:1px solid #666666;\">图层列表</th><th style=\"border:1px solid #666666;\">详细信息</th></tr><tr valign=\"top\">" +
                "<td style=\"width:140px;height:242px;vertical-align: top;border:1px solid #666666;\">" +
                "<div id=\"showLayerResult\" style=\"overflow:auto;width:100%;height:100%;margin:0px;padding:0px;\">";
            var treeData = [];
            hashtable.forEach(function(entry){
                var item = {};
                //item.id = entry.value[0].attributes.OBJECTID;
                item.id = entry.key;
                item.name = entry.key;//应该换成汉语
                item.type = "pipe";
                item.children = [];
                treeData.push(item);
                for(var i = 0; i < entry.value.length; i++){
                    var featureId = entry.value[i].attributes["FID"] ? entry.value[i].attributes["FID"] : entry.value[i].attributes['OBJECTID'];
                    item.children.push({_reference : entry.key + featureId});
                    treeData.push({id:entry.key + featureId,name:featureId,type:"feature"});
                }
            });
            var data = {
                identifier: 'id',
                label: 'name',
                items: treeData
            };
            var store = new ItemFileReadStore({data: data});
            var treeModel = new ForestStoreModel({
                store: store,
                query: {type: "pipe"},
                childrenAttrs: ["children"]
            });

            table_tree += "<div id='treeThree'></div>";
            table_tree += "</div>";
            table_tree += "</div>";
            table_tree += "<td style=\"width:250px;height:242px;vertical-align: top;border: 1px solid #666666;\"><div style=\"overflow:auto;width:100%;height:100%;margin:0px;padding:0px;\" id='show_panel_attributes'>";
            table_tree += "</div></td></tr></table></div></div>";
            me.map.infoWindow.setTitle("点击选择查询");
            me.map.infoWindow.setContent(table_tree);
            var tree = new Tree({
                model: treeModel,
                autoExpand:true,
                //openOnClick:true,
                showRoot:false
            }, "treeThree");
            tree.startup();
            tree.on("click",function(item,node,evt){
                // 获取当前点击的tree的id值
                if(!node.hasChildren()){//判断有没有子节点
                    var selectId = item.id[0];//当前的objectid
                    var selectName = item.name[0];
                    var parentId = node.getParent(selectId).item.id[0];//图层名称
                    var featureArray = hashtable.item(parentId);
                    for(var i = 0; i < featureArray.length; i++){
                        if(selectName == /*featureArray[i].attributes['FID'] ? featureArray[i].attributes['FID'] :*/ featureArray[i].attributes['OBJECTID']){
                            //然后调用对应的单击事件方法
                            var content = me._doFeatureForClickQuery(featureArray[i]);
                            domAttr.set('show_panel_attributes','innerHTML',content);
                            break;
                        }
                    }
                }
            });
            tree.on("load",function(){
                var childrenArray = tree.rootNode.getChildren();
                if(childrenArray.length > 0){
                    var key = childrenArray[0].item.id[0];
                    var featureArray = hashtable.item(key);
                    if(featureArray.length > 0) {
                        var content = me._doFeatureForClickQuery(featureArray[0]);
                        domAttr.set('show_panel_attributes','innerHTML',content);
                    }
                }
            });
            me._clickTree = tree;
            me.map.infoWindow.resize(388,300);
            me.map.infoWindow.show(evt.screenPoint,me.map.getInfoWindowAnchor(evt.screenPoint));
        },

        _doFeatureForClickQuery : function(feature){
            var contents = "";
            contents += "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse;\">";
            var flag = 0;
            for(var p in feature.attributes){
                if(p.toString().toLowerCase().indexOf('shape') != -1)
                    continue;
                contents += "<tr>";
                if(flag == 0){
                    contents += "<td height=\"20\" width=\"70\" style=\"border-bottom:1px solid #666666;border-right:1px solid #666666;text-align:right;\">";
                } else {
                    contents += "<td height=\"20\" width=\"70\" style=\"border-top:1px solid #666666;border-bottom:1px solid #666666;border-right:1px solid #666666;text-align:right;\">";
                }
                contents += p;
                contents += "</td>";
                if(flag == 0){
                    contents += "<td width=\"125\" style=\"border-bottom:1px solid #666666;border-left:1px solid #666666;border-right:1px solid #666666;padding-left:2px;\">";
                }else{
                    contents += "<td width=\"125\" style=\"border:1px solid #666666;padding-left:2px;\">";
                }
                flag++;
                if(feature.attributes[p] ==null || feature.attributes[p]==undefined )
                {
                }else
                    contents += feature.attributes[p];
                contents += "</td>";
                contents += "</tr>";
            }
            contents += "</table>";
            return contents;
        },
        addToMap:function(evt,me){

            if(me._distanceMeasure || me._areaMeasure){//如果是距离测量或者面积测量
                var geometry = evt.geometry; //绘制的 geometry
                me.addGraphicsToMap(geometry);//将绘制的图形加到地图中去
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
                        console.log(area);
                    }else{
                        area=geometryEngine.planarArea(evt.geometry,"square-kilometers");
                    }
                    var font = new Font("18px", Font.STYLE_NORMAL,Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var areaResult = new TextSymbol(number.format(area,{pattern: '#.000'})+"平方千米", font, new Color([204, 102, 51]));
                    var spoint = new Point(geometry.getExtent().getCenter().x, geometry.getExtent().getCenter().y, me.map.spatialReference);
                    me._map.graphics.add(new Graphic(spoint, areaResult));//在地图上显示测量的面积

                }
            }else {
                var geometry = evt.geometry; //绘制的 geometry
                me.addGraphicsToMap(geometry);//将绘制的图形加到地图中去
                /*if(lang.isFunction(me._drawEndHandler)){
                 me._drawEndHandler(evt);
                 }*/
            }
        },

        //业务相关的方法
        addGraphicsToMap :function(geometry,attributes,infoTemplate){
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
            var _graphic = this._map.graphics.add(new Graphic(geometry, symbol));
            if(lang.isObject(attributes)){
                _graphic.setAttributes(attributes);
            }
            if(infoTemplate){
                _graphic.setInfoTemplate(infoTemplate);
            }
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
        /**
         *点击查询
         * param url 点击查询的url，具体的是查询那个地图服务地址
         * param ids 一个数组，标识点击查询需要查询的图层序列号 [0,1,2,3]
         */
        clickQuery : function(url,ids){
            if(url){
                this._clickUrl = url;
            } else {
                if(this._map.layerIds.length > 0)
                    this._clickUrl = this._map.getLayer(this._map.layerIds[0]).url;
            }
            if(ids){
                this._clickIds = ids;
            } else {
                if(this._map.layerIds.length > 0)
                    this._clickIds = array.map(this._map.getLayer(this._map.layerIds[0]).layerInfos,function(item){return item.id},this);
            }
            this._clickQuery = true;
        },
        identifyQuery : function(url,layerIds,geometry,bufferCallback){
            var identifyTask = new IdentifyTask(url);
            var identifyParams = new IdentifyParameters();
            identifyParams.returnGeometry = true;
            identifyParams.tolerance = 5;
            identifyParams.layerIds = layerIds;
            identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;//LAYER_OPTION_VISIBLE
            identifyParams.geometry = geometry;
            identifyParams.width = this._map.width;
            identifyParams.height = this._map.height;
            identifyParams.mapExtent = this._map.extent;
            identifyParams.spatialReference = this._map.spatialReference;
            identifyTask.execute(identifyParams, lang.hitch(this,function(results){
                if(lang.isFunction(bufferCallback)){
                    bufferCallback(results,this._map);
                }
            }),function(err){});
        }
    });
    return obj;
});