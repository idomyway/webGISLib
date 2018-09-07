/*
 * 动态数据 下拉框组件
 */

/**
 * 	动态配置 Combo
 */
Ext.define('common.DynamicInfoCombo', {
	xtype: 'myDynamicInfoCombo',
	extend: 'Ext.form.field.ComboBox',
	editable: false,
	forceSelection: true,
	//pageSize: 1024,
	storeAutoLoad: true,
	isNeedAll: true,
	contextPath: '',
	url: '',
	emptyText: '请选择',
	displayField: 'name',
	valueField: 'id',
	value: '',
	fields: [ 'id', 'name' ],
	getInitParams:{},
	orderBy:'',
	
	initComponent: function() {
		var me = this;
		me.store = Ext.create('Ext.data.Store', {
			fields: me.fields,
			autoLoad: me.storeAutoLoad,
			//pageSize: me.pageSize,
			proxy: {
				type: 'ajax',
				url: me.url,
				reader: {
					type: 'json',
					root: 'list',
					totalProperty: 'total'
				}
			},
			listeners: {
				'beforeload': function(action, options) {
					options.params = new Object();
	                options.params['json']=Ext.JSON.encode(me.getInitParams);
	                options.params['orderBy']=me.orderBy;
				},
				load: function(store, records, successful, eOpts) {
					if(me.isNeedAll) {
						store.insert(0, {id:'', name: '全部'});
					}
				}
			}
		});
		Ext.apply(me, {
			store: me.store
		});
		me.callParent(arguments);
	}
});
