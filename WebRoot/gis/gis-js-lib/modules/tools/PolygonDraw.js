define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_Templated",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/_OnDijitClickMixin",
        "dojo/text!./PolygonDraw.html",
        "dojo/on",
        "dojo/query",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dijit/registry",
        "dijit/Dialog",
        "dojo/aspect",
        "dojo/dom",
        "must/Toolbar",  
        "dojo/io/script",
        "dojo/dom-attr",
        "dojo/dom-geometry",
        "dijit/layout/ContentPane",
        "dijit/layout/TabContainer"
        ],function(
        		declare,
        		WidgetBase,
        		Templated,
        		WidgetsInTemplateMixin,
        		OnDijitClickMixin,
        		templateString, 
        		on,
        		query,
        		array,
        		lang,
        		registry,
        		Dialog,
        		aspect,
        		dom,
        		Toolbar,
        		script,
        		domAttr,
        		domGeometry,
        		ContentPane,
        		TabContainer){
	return declare([WidgetBase,Templated,WidgetsInTemplateMixin,OnDijitClickMixin],{
		opts:{
			map:null,
			toolbar:null,
			layerStr:null,
			contextPath:null
		},  
		mouseAnim: null,   
		toolbar:null,
	    constructor : function(params){
	    	lang.mixin(this.opts,params);
	       //this.toolbar=new Toolbar(map);
		   this.templateString = templateString;
	 
	    },
	    _drawPolyline:function(){//划线
			this.opts.toolbar.clearCustomerGraphicsLayer();
	    	this.opts.toolbar.drawPolyline();
	    },
	    _drawPolygon:function(){//画面
            this.opts.toolbar.clearCustomerGraphicsLayer();
            this.opts.toolbar.drawPolygon();
		},
	    _mapZoomIn:function(){//放大
	    	this.opts.toolbar.mapZoomIn();
	    },
	    _mapZoomOut:function(){//缩小
	    	this.opts.toolbar.mapZoomOut();
	    },
	    _fullMap:function(){//全图
	    	this.opts.toolbar.fullMap();
	    },  
	    //测量距离
	    _distancMeasure:function(){
	    	this.opts.toolbar.distancMeasure(); 
	    },
	    _areaMeasure:function(){//测量面积
	    	this.opts.toolbar.areaMeasure(); 
	    },
	    _clearMeasure:function(){//清空图层
	    	this.opts.toolbar.clearCustomerGraphicsLayer();
	    	this.opts.toolbar._drawGeometry=null;
	    },
        _mapPan:function(){//地图平移
            this.opts.toolbar.mapPan();
        },

        removeWidget:function(layerKeyWord){//清除原有的legend
			 layerKeyWord = layerKeyWord.split("#")[1];
			 var legendLeftWidget = dom.byId(layerKeyWord+"_legend");
			 array.forEach(dijit.findWidgets(legendLeftWidget), function(w) {
	    		    w.destroyRecursive();
	    	 });
		 },
		 deleteWidget:function(){
				var widget  = registry.findWidgets(dom.byId("legendDia"));
				array.forEach(widget,function(w){
					 w.destroyRecursive();
				});
				registry.byId("legendDia").destroyRecursive();
		}
	});
});