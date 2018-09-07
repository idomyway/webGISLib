/**
 * 人员选择下拉框组件
 */

/**
 * 定义人员Model
 */
Ext.define('common.UserInfoModel', {
	extend: 'Ext.data.Model',
	fields: [
	    { name: 'id', type: 'string' },
	    { name: 'userName', type: 'string' }
	]
});

/**
 * 	定义人员Combo
 */
Ext.define('common.UserInfoCombo', {
	xtype: 'myUserInfoCombo',
	extend: 'Ext.form.field.ComboBox',
	required: ['common.UserInfoModel'],
	editable: false,
	contextPath: '',
	emptyText: '请选择',
	value: '',
	displayField: 'userName',
	valueField: 'id',
	storeAutoLoad: true,
	forceSelection: true,
	isNeedAll: true,
	getParams: {},
	
	initComponent: function() {
		var me = this;
		me.store = Ext.create('Ext.data.Store', {
			model: 'common.UserInfoModel',
			autoLoad: me.storeAutoLoad,
			pageSize:1000,
			proxy: {
				type: 'ajax',
				url: me.contextPath + '/sysUser/getDataByCondition',
				reader: {
					type: 'json',
					root: 'list',
					totalProperty: 'total'
				}
			},
			listeners: {
				'beforeload': function(action, options) {
					options.params = new Object();
	                options.params['json']=Ext.JSON.encode(me.getParams);
				},
				load: function(store, records, successful, eOpts) {
					if(me.isNeedAll) {
						store.insert(0, {id:'', username: '全部'});
					}else{
						store.insert(0, {id: '', username: ''});
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
