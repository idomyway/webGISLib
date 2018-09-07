Ext.define('MapWin', {
    extend: 'Ext.window.Window',
    requires: [],
    layout: 'border',
    modal: true,
    border: false,
    closable: true,
    width: 300,
	height: 200,
	gisWin:{},
	maximizable:true,
	maximized:true,
    closeAction: 'destroy',
    title: '地图窗口',
    initComponent: function() {
        var me = this;
        
        this.addEvents({
           // 'refreshData': true
        });
        
        me.formItems = [
           
        ];
      

        
        Ext.apply(me,{
            items:[
                   {
                   	xtype:'panel',
                   	title:'Ext功能面板',
                   	region:'west',
                   	//layout:'fit',
                   	width:300,
                   	items:[
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '放大' ,
   			                       listeners :{  
   			                           click : function(){  
   			                        	   gis.toolbar.aaa();
   			                         //  alert("111");  
   			                           }  
   			                       }  
   			                	
   			                },
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '缩小'  
   			                	
   			                },
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '平移'  
   			                	
   			                },
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '画点'  ,
   			                       listeners :{  
   			                           click : function(){  
   			                        	   gisWin.toolbar.drawPoint();
   			                         
   			                           }  
   			                       }  
   			                	
   			                },
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '画线'  ,
   			                       listeners :{  
   			                           click : function(){  
   			                        	   gisWin.toolbar. drawPolyline();
   			                         //  alert("111");  
   			                           }  
   			                       }  
   			                       
   			                    	  
   			                	
   			                },
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '画面',
   			                       listeners :{  
   			                           click : function(){  
   			                        	   gisWin.toolbar.drawPolygon();
   			                         //  alert("111");  
   			                           }  
   			                       }  
   			                       
   			                       
   			                    	   
   			                	
   			                },
   			                
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '属性查询'  
   			                	
   			                },
   			                
   			                
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '空间查询'  
   			                	
   			                },
   			                 
   			                
   			                
   			                
   			                
   			                {
   			                	   xtype: 'button',
   			                	   margin:'1 1 1 1 ',
   			                       text : '弹出新的地图窗口'  
   			                	
   			                }
   			                
                   	       ]
                   },
                   {
                	     region: 'center',  
                         //地图显示窗口  
                         xtype: 'panel',  
                         html: '<div id="mapWin" class="tundra" style="width:100%; height:100%;"></div>'  
                	   
                   }
                   
                   
                   ],
            buttonAlign: 'center',
            buttons: [
         
            ],
            abc:function(gisWin){
             this.gisWin=    gisWin;
             console.log(this.gisWin);
            }
        });
        me.callParent(arguments);
    },
   

   

 

    

    
});