/**
 * UUID
 * @returns
 */
function UUID() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

/**
 * @param val
 * @returns
 */
function dgDataStringOnlyDate(val){
	if(null == val || "" == val){
		return "";
	}
	if(val.indexOf(":") > 0){
		return val.split(" ")[0];
	}
	else{
		return val;
	}
}

/**
 * 状态码 字义（语义）转换
 * value : 当前记录值
 * data  : 语义数据字典
 */
function rendererState(value, data) {
	if(null == value || '' == value) {
		return '';
	}
	for(var i=0; i< data.length; i++) {
		if(value == data[i].id) {
			return data[i].name;
		}
	}
	return '';
}

/**
 * code > value
 * @param value : 当前记录值
 * @param data  : 语义数据字典
 * @param key   : key-value > key
 * @param val   : key-value > value
 * @returns
 */
function rendererKey2Value(value, data, key, val) {
	if(null == value || '' == value) {
		return '';
	}
	for(var i=0; i< data.length; i++) {
		if(value == data[i][key]) {
			return data[i][val];
		}
	}
	return '';
}