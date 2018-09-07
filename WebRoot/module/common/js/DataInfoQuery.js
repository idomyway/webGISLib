/*
 * 同步请求获取数据 
 */

/**
 * 获取GIS图层数据
 */
function getGisLayersData(contextPath) {
	var gisLayers = [];
	 Ext.Ajax.request({
        url : contextPath + '/lib/gis/map.json',
        method : 'POST',
        async: false,
        waitMsg : '正在执行...',
        params : {  },
        success : function(response) {
        	var obj = eval('(' + response.responseText + ')')
            gisLayers = obj.map.layers;
            console.log('map.json load success.')
        },
        failure : function(response) {
			console.log('map.json load fail.')
        }
    });
	return gisLayers;
}


/**
 * 通用数据（Array）对象获取function
 * 
 * @param url
 * @param valueName
 * @param valueData
 * or 
 * @param url
 * @param keyName
 * @param keyData
 * @param valueName
 * @param valueData
 * @returns {Array}
 */
function getDataInfo(url, keyName, keyData, valueName, valueData) {
	if(undefined == valueName) {
		valueData = keyData;
		valueName = keyName;
		keyName = 'id';
		keyData = 'id';
	}
	var dataInfo = [];
	$.ajax({
		url: url,
		async: false, // 异步设为 false
		dataType: 'json',
		success: function(data, textStatus, jqXHR) {
			for(var i=0; i<data.length; i++) {
				var item = {};
				item[keyName] = data[i][ keyData ];
				item[valueName] = data[i][ valueData ];
				dataInfo.push(item);
			}
		},
		error:function(xhr,textStatus){
		    console.log('错误')
		    console.log(textStatus)
		},
		complete:function(){
		    console.log('结束')
		}
	});
	return dataInfo;
}

/**
 * 获取用户数据 组成 key-value数组
 * return [{id: 'id', username: 'username' }]
 */

function getUserData() {
	var userData = []; // [{id: 'id', username: 'userName' }]
	$.ajax({
		url: contextPath + '/sysUser/getAllData',
		async: false, // 异步设为 false
		dataType: 'json',
		success: function(data, textStatus, jqXHR) {
			for(var i=0; i<data.length; i++) {
				var item = {id: data[i]['id'], username: data[i]['userName'] };
				userData.push(item);
			}
		},
		error:function(xhr,textStatus){
		    console.log('错误')
		    console.log(textStatus)
		},
		complete:function(){
		    console.log('结束')
		}
	});
	return userData;
}


/**
 * 通用数据（Array）对象获取function
 * 
 * @param url
 * @param valueName
 * @param valueData
 * or 
 * @param url
 * @param keyName
 * @param keyData
 * @param valueName
 * @param valueData
 * @returns {Array}
 */
function getDataInfo(url, keyName, keyData, valueName, valueData) {
	if(undefined == valueName) {
		valueData = keyData;
		valueName = keyName;
		keyName = 'id';
		keyData = 'id';
	}
	var dataInfo = [];
	$.ajax({
		url: url,
		async: false, // 异步设为 false
		dataType: 'json',
		success: function(data, textStatus, jqXHR) {
			for(var i=0; i<data.length; i++) {
				var item = {};
				item[keyName] = data[i][ keyData ];
				item[valueName] = data[i][ valueData ];
				dataInfo.push(item);
			}
		},
		error:function(xhr,textStatus){
		    console.log('错误')
		    console.log(textStatus)
		},
		complete:function(){
		    console.log('结束')
		}
	});
	return dataInfo;
}
