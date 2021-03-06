<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<HTML>  
<HEAD>  
<TITLE>Map Of MJ</TITLE>  


<%@ include file="../common/include.jsp" %>  
<%@ include file="/../../gis/common.jsp" %>  
<script type="text/javascript" src="${pageContext.request.contextPath}/module/extjs/MapWin.js"></script>
 
<script type="text/javascript"> 

var gis = {};
var gisWin = {};
  
Ext.onReady(function(){
	/* function afterDrawEnd(evt){
		console.log(evt);
		return evt;
	}
	function afterDrawEnd2(evt){
		console.log(evt);
		return evt;
		
	} */
	
    require([
        "esri/map",
        "dojo/parser", 
        "must/LoadMap",
        "must/Toolbar",  
        "must/mapHandle/MapHandle",
        "dojo/domReady!"
    ], function (
        Map, 
        parser,
        LoadMap,        
        Toolbar,
        MapHandle
         ) {
	  		parser.parse();  
		    gis.loadMap = new LoadMap("map",function(evt){
		    	console.log(evt);
		    	var map=evt.map;
		    	gis.toolbar = new Toolbar(map);
		    	var opts={
		    			map:map,
		    			toolbar:gis.toolbar,
		    			layerStr:null,
		    			contextPath:null		    			
		    	};
		    	var mapHandle=new MapHandle(opts);
		    	 gis.loadMap.addMapToolToMapDiv(mapHandle,"mapHandleDiv");
		     
		    }); 
			
		}
    );  
	//var map = gis.loadMap.getMap(); 
	//gis.symbol = new Symbol(map);
	//gis.toolbar = new Toolbar(map); 
	//gis.toolbar.addEventOnDrawEnd(afterDrawEnd);
	//gis.toolbar.locationByPoint(59271.35842539875,52091.61494352455);
    //var p=new Point(115.96419532600342,36.44415627147825, map.spatialReference);
    //map.setZoom(11);
    //map.centerAt(p);
 
	 
	Ext.create('Ext.Viewport', {
        layout: 'border',
        defaults: {
            margin: 2
        },
        items: [
            {
               	xtype:'panel',
               	title:'Ext功能面板',
               	region:'west',
               	//layout:'fit',
               	width:300,
               	items:[
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '放大' ,
	                    listeners :{  
	                        click : function(){  
	                        	gis.toolbar.mapZoomIn();
	                        }  
	                    }  
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '缩小',
	                    listeners :{  
	                        click : function(){  
	                        	gis.toolbar.mapZoomOut();
	                        }  
	                    } 
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '平移',
	                    listeners :{  
	                        click : function(){  
	                        	gis.toolbar.mapPan();
	                        }  
	                    }
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '画点'  ,
	                    listeners :{  
	                        click : function(){  
	                        	gis.toolbar.drawPoint(function(evt){
	                        		console.log("画点");
	                        		console.log(evt);
	                        	});
	                        	//var a = afterDrawEnd();
	                        	//console.log(a);
	                         	//alert("111");  
	                       }  
	                    }  
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '画线'  ,
	                    listeners :{  
	                        click : function(){  
	                        	gis.toolbar. drawPolyline(function(evt){
	                        		console.log("画线");
	                        		console.log(evt);
	                        	});
	                        }  
	                    }  
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '画面',
	                    listeners :{  
	                        click : function(){  
	                        	gis.toolbar.drawPolygon(function(evt){
	                        		console.log("画面");
	                        		console.log(evt);
	                        	});
	                        }  
	                    }  
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '属性查询'  
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '空间查询'  
	                },
	                {
	                	xtype: 'button',
	                	margin:'1 1 1 1 ',
	                    text : '弹出新的地图窗口'  ,
	                    listeners :{  
	                        click : function(){
	                        	var mapWin = Ext.create('MapWin', {			
	                        		margin: '2 2 2 2',
	                        		contextPath:'${pageContext.request.contextPath}',	
	                        		listeners: {
	                        			afterrender:function(){
	                        				//alert();
	                        		 		require([
	                         		            "esri/map",
	                          	 		        "dojo/parser", 
	                          	 		        "must/LoadMap",  
	                          	 		        "must/Toolbar", 
	                          	 		     	"must/mapHandle/MapHandle",
	                          	 		        "dojo/domReady!"
	                            	 		], function (
	                            	 		    Map, 
	                           	 		    	parser,
	                            	 		    LoadMap,
	                            	 		    Toolbar,
	                            	 		   	MapHandle
	                            	 		) { 
	                            	 			  parser.parse();  
	                            	 			  
	                            	 			  var mapTool =new MapHandle();
	                            	 	 		  gisWin.loadMap=new LoadMap("mapWin", mapTool);
	                            	 	 		 
	                            	 	 		 /*  var map=gisWin.loadMap.getMap(); 
	                            	 			  gisWin.toolbar=new Toolbar(map);
	                            	 			  gisWin.toolbar.addEventOnDrawEnd(afterDrawEnd2);
	                            	 			  gisWin.toolbar.locationByPoint(59212.35842539875,52012.61494352455);
	                            	 			  mapWin.abc(gisWin); */
	                            	 		}); 
	                        			}
	                        		}
	                        	});
	                    	 	mapWin.show(); 
	                       	}  
	                   	}  
	                },
	                {
	                	xtype: 'button',
	                	margin: '1 1 1 1 ',
	                    text : '清空图层',
	                    listeners :{  
	                        click : function(){ 
	                        	   gis.toolbar.clearMeasure(); 
	                        	   gis.toolbar.clearCustomerGraphicsLayer();
	                        }  
	                    }  
	                },
	                {
	                	xtype: 'button',
	                	margin: '1 1 1 1 ',
	                    text: '默认视图',
	                    listeners: {  
	                        click: function(){ 
	                        	gis.toolbar.fullMap(); 
	                        }  
	                    }  
	                },
	                {
                	    xtype: 'button',
                	    margin: '1 1 1 1 ',
                        text : '测量距离',
                        listeners :{  
                            click : function(){
                        	    gis.toolbar.distancMeasure(); 
                            }  
                        }  
	                },
	                {
                	    xtype: 'button',
                	    margin: '1 1 1 1 ',
                        text : '测量面积',
                        listeners :{  
                            click : function(){
                        	    gis.toolbar.areaMeasure(); 
                            }  
                        }  
	                },
	                {
                	    xtype: 'button',
                	    margin: '1 1 1 1 ',
                        text : '删除工具条',
                        listeners :{  
                            click : function(){
                        	    gis.loadMap.deleteMapToolFromMapDiv("mapHandleDiv"); 
                            }  
                        }  
	                },
	                {
                	    xtype: 'button',
                	    margin: '1 1 1 1 ',
                        text : '添加自定义点',
                        listeners :{  
                            click : function(){
                            	/* */
                            	gis.toolbar.drawPointNoAddToMap(function(evt){
                            		//
                            		var info= {
                                        x:evt.geometry.x,
                                        y:evt.geometry.y,
                                        url:'../../gis/images/map_bujian_3.png',
                                        width:30,
                                        height:30,
                                        infoTemplate:{
                                        	title:'标题',
                                        	content:"内容"
                                        },
                                        attributes:{},
                                        textInfo:[
                                            {
                                                text:"text",
                                                color:[5,140,254],
                                                xoffset:0,
                                                yoffset:13
                                            }
                                        ]
                                  }
                            		var infoArray=new Array();
                            		infoArray.push(info);
                            		gis.toolbar.addCustomPointToMap(infoArray);
                            		

                            		
                            	});
                            	
                            	
                            	
                            	
                            	
                            }  
                        }  
	                }
       	        ]
            },
            {
             	xtype: 'panel',
             	region: 'center',
             	layout: 'fit',
                html: '<div id="map" class="tundra" style="width:100%;height:100%; border:solid 4px blue;" ></div>',
            }
        ]
    });	  
});  
  
</script>  
</HEAD>  
<body>  
</body>  
</html>  