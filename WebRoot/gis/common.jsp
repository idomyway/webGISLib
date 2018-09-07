<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<script type="text/javascript" src="${pageContext.request.contextPath}/config/config.js"></script>
<script type="text/javascript">
 
 var contextPath = '${pageContext.request.contextPath}';
 //ArcGIS javascript API 部署地址
 //		gisapiHost: "10.10.70.130:8989\/arcgis_js_api\/library\/3.18\/3.18", 
 //var gisapiHost=$config.gisConfig.gisapiHost;
 var dojoConfig = {  
	     parseOnLoad:false,
	     packages: [
	        {  
				"name": "must",  
				"location": "${pageContext.request.contextPath}/gis/gis-js-lib/must"  
		    },
		    {  
				"name": "modules",  
				"location": "${pageContext.request.contextPath}/gis/gis-js-lib/modules"  
		    } 
	     ]  
	   };   
 
 /* document.write('<link rel="stylesheet" type="text\/css" href="http:\/\/'+gisapiHost+'\/dijit\/themes\/tundra\/tundra.css"><\/script>');
 document.write('<link rel="stylesheet" type="text\/css" href="http:\/\/'+gisapiHost+'\/esri\/css\/esri.css"><\/script>');
 document.write('<script type="text\/javascript"  src="http:\/\/'+gisapiHost+'\/init.js"><\/script>'); */

</script>
<c:set var="gisHost" value="10.10.70.85:6090/arcgis_js_api/library/3.20/3.20"/>
<link rel="stylesheet" type="text/css" href="http://10.10.70.85:6090/arcgis_js_api/library/3.20/3.20/dijit/themes/tundra/tundra.css"/>
<link rel="stylesheet" type="text/css" href="http://10.10.70.85:6090/arcgis_js_api/library/3.20/3.20/esri/css/esri.css">
<script type="text/javascript" src="http://10.10.70.85:6090/arcgis_js_api/library/3.20/3.20/init.js"></script>

