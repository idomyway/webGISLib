define([
// 这个模块需要用到dojo/dom模块，所以要把它放进依赖模块列表中。
'dojo/dom'
], function(dom){
	// 一旦依赖模块列表中的模块全都加载完成，就会调用这个函数来定义demo/myModule模块。
	//
	// dojo/dom 作为第一个参数传递给这个函数，依赖列表中的其他模块会作为随后的参数传入。
	var oldText = {};
	// 这个返回的对象成为该模块定义的值
	return {
		setText: function (id, text) {
			var node = dom.byId(id);
			oldText[id] = node.innerHTML;
			node.innerHTML = text;
		},
		restoreText: function (id) {
			var node = dom.byId(id);
			node.innerHTML = oldText[id];
			delete oldText[id];
		}
	};
});