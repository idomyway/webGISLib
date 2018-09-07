/**
 * @description 提供地图加载方法，及地图上控件的控制
 * @summary 提供地图加载方法，及地图上控件的控制
 * @module must/LoadMap
 * @example require(["must/LoadMap"],function(LoadMap){     });
 */
define([
	 "dojo/_base/lang",
	 "dojo/_base/declare",
	 "dojo/_base/array", 
	 "dojo/topic",
     "esri/config",
     "esri/map", 
     "esri/tasks/GeometryService",
     "esri/layers/ArcGISTiledMapServiceLayer",
     "esri/layers/ArcGISDynamicMapServiceLayer",
     "esri/layers/FeatureLayer",
     "must/layers/TianDiTiledMapServiceLayer",
     "esri/Color",
     "esri/symbols/Font",
     "esri/SpatialReference",
     "esri/dijit/OverviewMap",
     "esri/geometry/Extent",
     "esri/geometry/Point",
     "esri/InfoTemplate",
     "must/Search/Search",
     "dojo/_base/xhr",
	 "dojo/dom",
     "dojo/dom-construct",
     "dojo/_base/window",
     "dojo/dom-geometry",
     "must/InfoWindow",
     
],function(
	  lang,
	  declare,
	  arrayUtil, 
	  topic,
	  esriConfig,
	  Map, 
	  GeometryService,
	  ArcGISTiledMapServiceLayer,
	  ArcGISDynamicMapServiceLayer,
	  FeatureLayer,
      TianDiTiledMapServiceLayer,
	  Color,
	  Font,
	  SpatialReference,
	  OverviewMap,
	  Extent,
      Point,
	  InfoTemplate,
      Search,
	  xhr,
	  dom,
	  domConstruct,
	  win,
	  domGeometry,
	  InfoWindow
)
{
    var obj = declare(null,{
    	_map:null ,
    	_mapDivObj:null,
        _mapDivId:null,
        _initFunction:null,
        /**
         * @description 构造方法
         * @memberOf module:must/LoadMap#
         * @constructor  LoadMap
         * @param {Object} mapDivId -承载地图的DIV的ID
         * @example var loadMap=new LoadMap("mapDivId")
         */
        constructor : function(mapDivId,initFunction){
    		console.log("LoadMap");
        	var me=this;
        	me._mapDivId=mapDivId;
        	me._initFunction=initFunction;
        	me._map = new Map(mapDivId,{
                logo: false,
                slider: false,                
                isScrollWheelZoom: true
        	});
        	
        	me._map.on('load',lang.hitch(this,function(evt){
        		 me.mapLoadHandler(evt);
        		 if(lang.isFunction(me._initFunction)){
                     me._initFunction(evt);
                     me._initFunction=null;
                 }

             	
            }));
        	var mapServers=$config.gisConfig.mapServers;        	
            if(mapServers != "undefined"){
                arrayUtil.forEach(mapServers,function(item){
                    if(item.url){
                        var layer = this.createLayer(item);
                        if(layer){
                            this._map.addLayer(layer);
                        }
                    }
                },this);
            }
     		//添加代理
            var proxyurl=$config.gisConfig.proxyurl;  
	       	 if(lang.isString(proxyurl) && proxyurl != ""&&proxyurl!="undefined"){
	       		 esriConfig.defaults.io.proxyUrl = proxyurl;
	       		 esriConfig.defaults.io.alwaysUseProxy = false;
	       	 }else{
	       		
	       	 } 

        },
        mapLoadHandler:function(evt){
        	 console.log("mapLoadHandler");
        	 var map=evt.map;
        	/* var center=$config.gisConfig.center;    
        	 var level=$config.gisConfig.level;    
             var mapPoint = new Point(center[0],center[1],map.spatialReference);
             map.setLevel(level);
             map.centerAt(mapPoint);*/
        	 
        },  
        /**
         * @description   在地图div中添加一个工具条
         * @memberOf module:must/LoadMap#
         * @param {Object} mapTool  -地图工具条对象
         * @param {String} domId    -承载工具条的DIV的ID
         */
        addMapToolToMapDiv:function(mapTool,domId){
                var me=this;
                me._mapDivObj=dom.byId(me._mapDivId);
                var mapToolDiv = domConstruct.create('div');
                mapToolDiv.id = domId;
                mapTool.placeAt(mapToolDiv);
                me._mapDivObj.appendChild(mapToolDiv);
        },
        /**
         * @description -删除根据ID地图上的某个工具条
         * @memberOf module:must/LoadMap#
         * @param {String} domId   -承载工具条的DIV的ID         *
         */
        deleteMapToolFromMapDiv:function(domId){
            var me=this;
            var node = dom.byId(domId);
            if(node!=null){
                domConstruct.destroy(domId);
            }
        },

        //创建图层
        createLayer : function (layerCreationProperties) {
            var layerType = layerCreationProperties.type.toLowerCase();
            if (layerType == "tiled"){
                return this.createTiledLayer(layerCreationProperties);
            } else if (layerType == "dynamic"){
                return this.createDynamicLayer(layerCreationProperties);
            } else if (layerType == "feature"){
                return this.createFeatureLayer(layerCreationProperties);
            } else if (layerType == "image"){
                return this.createImageLayer(layerCreationProperties);
            }else if (layerType == "tianditiled"){
                return this.createTianDiTiledMapServiceLayer(layerCreationProperties);
            }else {
                return null;
            }
        },
        /**
         * @description 创建ArcGIS mapserver动态切片图层服务
         * @protected
		 * @memberOf module:must/LoadMap#
         * @param {object} layerCreationProperties -生成地图图层需要的参数
         * @returns {object} layer -生成的地图图层
         */
        createTiledLayer : function(layerCreationProperties){
            var tiledLayer = new ArcGISTiledMapServiceLayer(layerCreationProperties.url);
            tiledLayer.opacity = !isNaN(layerCreationProperties.opacity) ? layerCreationProperties.opacity : 1;
            tiledLayer.id = layerCreationProperties.id;
            tiledLayer.name = layerCreationProperties.label;
            if(layerCreationProperties.visible == undefined)
                tiledLayer.visible = true;
            else
                tiledLayer.visible = layerCreationProperties.visible;
            if (!isNaN(layerCreationProperties.minScale)){
                featureLayer.minScale = layerCreationProperties.minScale;
            }
            if (!isNaN(layerCreationProperties.maxScale)){
                featureLayer.maxScale = layerCreationProperties.maxScale;
            }
            return tiledLayer;
        },

        /**
         * @description  创建ArcGIS mapserver 动态图层服务
         * @protected
         * @memberOf module:must/LoadMap#
         * @param {object} layerCreationProperties -生成地图图层需要的参数
         * @returns {object} layer -生成的地图图层
         */
        createDynamicLayer : function(layerCreationProperties){
        	var dynLayer = new ArcGISDynamicMapServiceLayer(layerCreationProperties.url);
        	dynLayer.opacity = !isNaN(layerCreationProperties.opacity) ? layerCreationProperties.opacity : 1;
	        dynLayer.id = layerCreationProperties.id;
	        dynLayer.name = layerCreationProperties.label;
	        dynLayer.disableClientCaching = layerCreationProperties.disableClientCaching ? layerCreationProperties.disableClientCaching : false;
	        if(layerCreationProperties.visible == undefined)//节点不存在
	        	dynLayer.visible = true;
	        else
	        	dynLayer.visible = layerCreationProperties.visible;
	        if (!isNaN(layerCreationProperties.minScale)){
	            featureLayer.minScale = layerCreationProperties.minScale;
	        }
	        if (!isNaN(layerCreationProperties.maxScale)){
	            featureLayer.maxScale = layerCreationProperties.maxScale;
	        }	        
	        return dynLayer;
        },
        //创建天地图离线切片地图服务
        createTianDiTiledMapServiceLayer : function(layerCreationProperties){
            var dynLayer = new TianDiTiledMapServiceLayer(layerCreationProperties.url);
            dynLayer.id = layerCreationProperties.id;
            return dynLayer;
        }

    });
    return obj;
});