<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<HTML>  
<HEAD>  
<TITLE>Map Of MJ</TITLE>  

<jsp:include page="../fxyj/common/include.jsp" />
<%@ include file="common.jsp" %>   
 <script type="text/javascript">  
      var djConfig = {  
        parseOnLoad: true  
      };  
    </script>  
 <script type="text/javascript">   
  
    dojo.require("esri.map");   
      dojo.require("esri.dijit.OverviewMap");   
           dojo.require("esri.dijit.Scalebar");   
      dojo.require("dijit.dijit"); // optimize: load dijit layer  
      dojo.require("dojo.parser");  
        dojo.require("esri.toolbars.navigation");   
    var map;  
    var navToolbar;  
         
    function initialize() {   
      var startExtent = new esri.geometry.Extent(-117.125,36.672,-105.875,42.297, new esri.SpatialReference({wkid:4326}) );   
      map = new esri.Map("map", {extent:esri.geometry.geographicToWebMercator(startExtent)});   
      
   
      var layer = new esri.layers.ArcGISDynamicMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");   
      map.addLayer(layer);  
        
        navToolbar = new esri.toolbars.Navigation(map);   
          
       dojo.connect(map, 'onLoad', function(theMap) {   
          //resize the map when the browser resizes   
          dojo.connect(dijit.byId('map'), 'resize', map,map.resize);   
          //add the overview map    
          var overviewMapDijit = new esri.dijit.OverviewMap({   
            map: map,  
                  
            visible:false   
          });   
          overviewMapDijit.startup();   
          });    
            
           dojo.connect(map, 'onLoad', function(theMap) {   
          dojo.connect(dijit.byId('map'), 'resize', map,map.resize);   
          var scalebar = new esri.dijit.Scalebar({   
            map: map,   
            scalebarUnit:'english'   
          });   
          });   
            
           dojo.connect(map, "onLoad", function() {   
          //after map loads, connect to listen to mouse move & drag events   
          dojo.connect(map, "onMouseMove", showCoordinates);   
          dojo.connect(map, "onMouseDrag", showCoordinates);   
        });   
          
    }   
    function showCoordinates(evt) {   
        //get mapPoint from event   
        //The map is in web mercator - modify the map point to display the results in geographic   
         var geoPt = esri.geometry.webMercatorToGeographic(evt.mapPoint);    
        //display mouse coordinates   
        dojo.byId("info").innerHTML = geoPt.x.toFixed(2) + ", " + geoPt.y.toFixed(2);   
      }   
    dojo.addOnLoad(initialize);   
  </script>   
<script type="text/javascript">  
  
function createLayout(){  
 var viewport = new Ext.Viewport({  
    layout: 'border',  
    renderTo: Ext.getBody(),  
    items: [{  
        region: 'north',  
        xtype: 'panel',  
        height:100,  
        split: true,  
    collapsible: true,  
    collapsed :true,  
    collapseMode: 'mini',  
    hideCollapseTool:true,  
        html: 'LOGO'  
    },{  
        region: 'west',  
    split: true,  
    collapsible: false,  
    //collapseMode: 'mini'å³é­æ¶ç¶æ  
    title: '菜单',  
    bodyStyle:'padding:5px;',  
    width: 200,   
    minSize: 200,  
      
    collapsed :true,  
    //就是这个collapsed掌握了自动填充  
    //å°±æ¯è¿ä¸ªcollapsedææ¡äºèªå¨å¡«å  
    xtype: 'tabpanel',  
    activeTab: 0,  
    items: [{  
        title: '图层管理'  
    },{  
        title: '空间查询',  
        layout: 'accordion',  
    items: [{  
        title: '属性查询',  
        html:'<input type="button" value="清除" />'  
    },{  
        title: '图形查询'  
          
    },{  
        title: '高级查询'  
          
    }]  
    }]  
  
    },{  
        region: 'center',  
        layout: {  
                  type: 'border'  
            },  
            items: [{  
                region: 'center', 
                //地图显示窗口  
                //å°å¾æ¾ç¤ºçªå£  
                xtype: 'panel',  
                html: '<div id="map" class="claro" style="width:100%; height:100%; border:1px solid #000;"></div><span id="info" style="position:absolute; right:10px; bottom:1px; color:#002; z-index:50;"></span> '  
            }, {  
                 region: 'north',  
                 //工具栏  
                 //å·¥å·æ   
                 xtype: 'panel',  
                 height: 30,  
                 tbar: tbar                                   
            }]  
    }]  
});}  
  
//工具栏的定义  
//å·¥å·æ çå®ä¹  
 var tbar = Ext.create("Ext.Toolbar", {  
        height:30,  
        items: ['', "-",{ xtype: 'button', text: '放大', cls: 'x-btn-text-icon', icon: 'img/zoom-in.gif', tooltip: 'Fixed Zoom In', handler: function() {   
        navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);  } },  
                    { xtype: 'button', text: '缩小', cls: 'x-btn-text-icon', icon: 'img/zoom-out.gif', tooltip: 'Fixed Zoom Out',handler: function() {   
        navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);  } },  
                    { xtype: 'button', text: '全图', cls: 'x-btn-text-icon', icon: 'img/full-extent.gif', tooltip: 'Shows the Full Extent of Map',handler: function() {   
         navToolbar.zoomToFullExtent(); } }, {  
            xtype: "splitbutton",  
            text: "按钮"  
        }, {  
            text: "菜单",  
            menu:  
            {  
                items: [  
                    {  
                        text: '选项1'  
                    }, {  
                        text: '选项2'  
                    }, {  
                        text: '选项3',  
                        handler: function () {  
                            Ext.Msg.alert("提示","来自菜单的消息");  
                        }  
                    }  
                ]  
            }  
          }]  
    });  
  
  
  
Ext.onReady(function(){  
 createLayout();  
  
});  
  
</script>  
</HEAD>  
<body>  
</body>  
</html>  