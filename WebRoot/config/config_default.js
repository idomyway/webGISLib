var $config = (function($) {	
	/** 
	 * 配置默认地图信息 
	 */
    $.gisConfig = {
        center:[13037575.612928802,4389701.630159834],
        level:10,
        //10.10.70.117:8890为代理服务的地址；最好跟该项目放到同一个Tomcat下
        proxyurl:"http://10.10.70.147:9086/Java/proxy.jsp",
        //10.10.70.175:6080修改为地图服务发布的IP地址和端口号
        geometryService: 'http://10.10.70.117:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer',
        mapServers: [
            {
                id:'cldx',
                url:'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer',
                type:'tiled'
            } 
        ],
        quickQuery:{
            queryAll:{enable:true,placeholder:'请输入查询内容'},
            position:'top:20px;right: 74px;',
            queryInfo:[{
                url:'http://10.10.70.117:6080/arcgis/rest/services/ntps/ntdx/MapServer/1',
                name:'道路名称查询',
                placeholder:'输入道路名称',
                searchFields:["NAME"],
                displayField:"NAME",
                outFields:["NAME"]
            },{
                url:'http://10.10.70.117:6080/arcgis/rest/services/ntps/ntdx/MapServer/0',
                name:'按兴趣点查询',
                placeholder:'输入兴趣点名称',
                searchFields:["NAME"],
                displayField:"NAME",
                outFields:["NAME"]
            }]
        }
    };  
    
    return $;
})(window.$config||{});