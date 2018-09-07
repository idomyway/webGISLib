/**
 * 固定（静态）（字典）信息下拉框
 */

Ext.define('common.StaticInfoCombo', {
	xtype: 'myStaticInfoCombo',
	extend: 'Ext.form.field.ComboBox',
	editable: false,
	forceSelection: true,
	emptyText: '请选择',
	value: '',
	displayField: 'name',
	valueField: 'id',
	isNeedAll: false,
	fields: [ 'id', 'name'],
	data: [
	    { id: 'ID', name: 'NAME' }
    ],
	
	initComponent: function() {
		var me = this;
		me.store = Ext.create('Ext.data.Store', {
			fields: me.fields,
            proxy: {
                type : 'memory',
                reader : {
                    type : 'json'
                }
            },
            data: me.data,
			listeners: {
				load: function(store, records, successful, eOpts) {
					if(me.isNeedAll) {
						store.insert(0, {id: '', name: '全部'});
					}
					me.fireEvent('afterload', me);
				}
			}
		});
		Ext.apply(me, {
			store: me.store
		});
		me.callParent(arguments);
	},
	
	setData: function(data) {
		var me = this;
		me.data = data;
		me.store.removeAll();
		me.store.loadData(data);
	}
});
