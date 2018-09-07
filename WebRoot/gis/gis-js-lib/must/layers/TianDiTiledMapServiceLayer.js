define([
    "esri/request",
    "esri/layers/TileInfo",
    "esri/layers/TiledMapServiceLayer",
    "dojo/_base/lang",
    "dojo/_base/declare"
], function(
    esriRequest,
    TileInfo,
    TiledMapServiceLayer,
    lang,
    declare
){
return declare([TiledMapServiceLayer], {
    declaredClass: "must.layers.TianDiTiledMapServiceLayer",
    constructor: function(a,c) {
        c && (c.roundrobin && (m.deprecated(this.declaredClass + " : Constructor option 'roundrobin' deprecated. Use option 'tileServers'."), c.tileServers = c.roundrobin), this._setTileServers(c.tileServers),
            this._loadCallback = c.loadCallback);
        this._url={};
        //this._url.path="http://10.10.70.175:6080/arcgis/rest/services/hmcs/jnhmcsTiled195401/MapServer";
        this._url.path=a+"/test.json";
        this._url.query={};
        this._params = lang.mixin({}, this._url.query);
        this._initLayer = lang.hitch(this, this._initLayer);
        var b = c && c.resourceInfo;
        b ? this._initLayer(b) : (this._load = lang.hitch(this, this._load), this._load())

        },
        _load: function() {
            esriRequest({
                url: '../../config/test.json',
                content: lang.mixin({
                        f:'json'
                }, this._params),
                //callbackParamName: "callback",
                load: this._initLayer,
                error: this._errorHandler
            })
        },
        _initLayer:function(url,options){
            this.inherited(arguments);
            this.spatialReference = new esri.SpatialReference({ wkid:4326 });
            this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, this.spatialReference));
            this.fullExtent=new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, this.spatialReference);
            this.tileInfo = new TileInfo({
                "rows" : 256,
                "cols" : 256,
                "compressionQuality" : 0,
                "origin" : {
                    "x" : -180,
                    "y" : 90
                },
                "spatialReference" : {
                    "wkid" : 4326
                },
                "lods" : [

                    { "level": 2, "resolution": 0.3515625, "scale": 147748796.52937502 },
                    { "level": 3, "resolution": 0.17578125, "scale": 73874398.264687508 },
                    { "level": 4, "resolution": 0.087890625, "scale": 36937199.132343754 },
                    { "level": 5, "resolution": 0.0439453125, "scale": 18468599.566171877 },
                    { "level": 6, "resolution": 0.02197265625, "scale": 9234299.7830859385 },
                    { "level": 7, "resolution": 0.010986328125, "scale": 4617149.8915429693 },
                    { "level": 8, "resolution": 0.0054931640625, "scale": 2308574.9457714846 },
                    { "level": 9, "resolution": 0.00274658203125, "scale": 1154287.4728857423 },
                    { "level": 10, "resolution": 0.001373291015625, "scale": 577143.73644287116 },
                    { "level": 11, "resolution": 0.0006866455078125, "scale": 288571.86822143558 },
                    { "level": 12, "resolution": 0.00034332275390625, "scale": 144285.93411071779 },
                    { "level": 13, "resolution": 0.000171661376953125, "scale": 72142.967055358895 },
                    { "level": 14, "resolution": 8.58306884765625e-005, "scale": 36071.483527679447 },
                    { "level": 15, "resolution": 4.291534423828125e-005, "scale": 18035.741763839724 },
                    { "level": 16, "resolution": 2.1457672119140625e-005, "scale": 9017.8708819198619 },
                    { "level": 17, "resolution": 1.0728836059570313e-005, "scale": 4508.9354409599309 }
                ]
            });
            this.loaded = !0;
            this.onLoad(this);
        },
        _errorHandler:function(){
            console.error("TianDiTiledMapServiceLayer _load 方法执行失败");
        },
        getTileUrl: function(level, row, col) {
          //return "http://t" + col%8 + ".tianditu.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX="+level+"&TILEROW="+row+"&TILECOL="+col+"&FORMAT=tiles";
          //return "http://t" + col%8 + ".tianditu.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX="+level+"&TILEROW="+row+"&TILECOL="+col+"&FORMAT=tiles";
 		  return  this.url+"/"+level+"/"+col+"/"+row+".jpg";
        }
      });
      });