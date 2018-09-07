Ext.define('common.SysOrgModel', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id'},
        {name: 'text'},
        {name: 'parentId'}
    ]
});


Ext.define('common.SysOrgTreeCombo', {
	extend : 'Ext.ux.TreePicker',
	xtype : 'mySysOrgTreeCombo',
	required : ['common.SysOrgModel'],
	displayField : 'text',
	minPickerHeight : 200,
	labelAlign : 'right',
	contextPath : '',
	orgId:'',
	rootVisible : false,
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			rootVisible : me.rootVisible,
			store : Ext.create('Ext.data.TreeStore', {
				autoLoad : true,
				model : 'common.SysOrgModel',
				root : {
					expanded : true,
					id : 'root',
					parentId : ''
				},
				proxy : {
					type : 'ajax',
					url : me.contextPath + '/sysOrg/getTree',
					reader : 'json'
				},
				listeners : {
					beforeload : function(store, options, eOpts) {
				
						// 预留请求参数
						var jsonObj = {
							orgId : me.orgId
						};
						var params = {
								json:Ext.JSON.encode(jsonObj)
					    };
						Ext.apply(options.params,params);
					},
					load : function(store, records, successful,eOpts) {
						me.fireEvent('afterStoreLoad', me,
								store, records);
					}
				}
			})
		});
		me.callParent(arguments);
	}
});