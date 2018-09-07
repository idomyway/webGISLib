<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<HTML>  
<HEAD>  
<TITLE>Map Of MJ</TITLE>  

<jsp:include page="../fxyj/common/include.jsp" />
<%@ include file="common.jsp" %>  
<script type="text/javascript" src="${pageContext.request.contextPath}/gis/MapPanel.js"></script>

 
<script type="text/javascript"> 
require(["esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "dojo/domReady!"], function (Map, ArcGISTiledMapServiceLayer) {
    // 以下是创建地图与加入底图的代码
    var map = new Map("mapDiv");
    var agoServiceURL = "http://10.10.70.117:6080/arcgis/rest/services/nantong/ntbase02/MapServer";
    var agoLayer = new ArcGISTiledMapServiceLayer(agoServiceURL);
    map.addLayer(agoLayer);
});
 
</script>  
</HEAD>  
<body class="tundra">  
 
    <div id="mapDiv"></div>
 
</body>  
</html>  