 
var  gis={};
require(["esri/map",
         "dojo/parser", 
         "must/LoadMap",  
         "must/Toolbar",  
         "dojo/domReady!"
         ], function (
          Map, 
          parser,
          LoadMap,
          Toolbar
          ) { 
	  parser.parse(); 
	  
	  gis.loadMap=  new LoadMap("map");
	  
	  var map=gis.loadMap.getMap();
	  
	  gis.toolbar=new Toolbar(map);
});