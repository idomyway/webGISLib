Ext.define('MapPanel',{  
	id:'mapPanel',
    extend:'Ext.panel.Panel',
    layout: {  
        type: 'border'  
    },  
    
    constructor: function() {
		var me = this; 
		me.callParent(arguments);
	},
	initComponent: function() {
		var me = this;
		
		Ext.apply(me,{
		    items: [{  
                region: 'center',  
                //地图显示窗口  
                xtype: 'panel',  
                html: '<div id="map" class="tundra" style="width:100%; height:100%;">'
                      +'<div id="handlewidget"></div>'             	
                	  +'</div>'  
            }
		    ]
			         
		});
		
		me.callParent(arguments);
	}
    
    
});  