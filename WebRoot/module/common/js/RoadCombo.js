/**
 * 道路数据下拉框
 */
Ext.define('common.RoadCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'roadCombo',
    editable: false,
    emptyText: '请选择',
    displayField: 'name',
    valueField: 'id',
    contextPath: '',
    storeAutoLoad: true,
    forceSelection: true,
    //是否需要增加“全部”
    isNeedAll: true,
    initParam: {'type':'DL'}, /** DL: 道路； QL：桥梁 ； BZ:泵站 */

    initComponent: function() {
        var me = this;
        me.addEvents({'afterStoreLoad': true});
        Ext.apply(me, {
            store: Ext.create('Ext.data.Store', {
            	fields:[
					{name: 'id'},
					{name: 'name'}
				],
                autoLoad: me.storeAutoLoad,
                proxy: {
                    type: 'ajax',
                    url:  me.contextPath + '/roadCenterlinePl/getDataByCondition',
                    reader: {
                    	type: 'json',
    					root: 'list',
    					totalProperty: 'total'
                    }
                },
                listeners: {
                    beforeload: function(store, operation, eOpts) {
                        var params = {
                        	json: Ext.JSON.encode( me.initParam )
                        };
                        if (!operation.params) {
                            operation.params = {};
                        }
                        Ext.apply(operation.params, params);
                    },
                    load: function(store, records, successful, eOpts) {
                        if (me.isNeedAll) {
                             store.insert(0, {id:'', name:'全部'});
                        }
                        me.fireEvent('afterStoreLoad', me, store, records);
                    }
                }
            })
        });
        me.callParent(arguments);
    }
});
