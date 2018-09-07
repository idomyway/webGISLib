/**
 * 定义静态（字典）数据信息 
 */

Ext.define('common.StaticInfoConst', {
    statics : {
    	/**
    	 * 巡检任务 任务状态
    	 * task_state
    	 * 01:未执行 02:执行中 03:已完成 04:未完成 05:已撤销 
    	 */
    	TASK_STATE: [
			{ id: '01', name: '未执行' },
			{ id: '02', name: '执行中' },
			{ id: '03', name: '已完成' },
			{ id: '04', name: '未完成' },
			{ id: '05', name: '已撤销' }
    	],
    	
    	/**
    	 * 巡检任务 任务类型
    	 * task_type
    	 */
    	TASK_TYPE: [
			{ id: '01', name: '周期性' },
			{ id: '02', name: '临时性' }
    	],
    	
    	/**
    	 * 巡检项目 > （检查）录入类型
    	 * input_type    
    	 */
    	INPUT_TYPE: [
			{ 'id':'01', 'name':'文本' },
			{ 'id':'02', 'name':'数字' },
			{ 'id':'03', 'name':'时间' },
			{ 'id':'04', 'name':'单选' },
			{ 'id':'05', 'name':'勾选' },
			{ 'id':'06', 'name':'下拉框'}             
    	],

    	
    	
        	
    	
		/**
		 * 设备管理 设备状态
		 * device_state    
		 */
		DEVICE_STATE: [
			{ id: '01', name: '在用' },
			{ id: '02', name: '停用' },
			{ id: '03', name: '库存' },
			{ id: '04', name: '报废' }               
		],
		
		/**
		 * 巡检计划状态
		 * plan_state    
		 */
		PLAN_STATE: [
			{ id: '01', name: '暂存' },
			{ id: '02', name: '未生成任务' },
			{ id: '04', name: '已过期' } ,
			{ id: '05', name: '已生成任务' }
			//{ id: '03', name: '已完成' },
			
		],
		/**
		 * 巡检类型
		 * patrol_type   
		 */
		PATROL_TYPE: [
			{ id: '01', name: '现场签到' },
			{ id: '02', name: '现场拍照' },
			{ id: '03', name: '信息上报' }
		],
		
		/**
		 * 巡检问题 严重程度
		 */
		ISSUE_LEVEL: [
		    { id: '01', name: '一般' },
		    { id: '02', name: '严重' }
		],
		
		/**
		 * 巡检问题状态
		 */
		ISSUE_STATE: [
		    { id: '00', name: '未处理' },
		    { id: '01', name: '处理中' },
		    { id: '02', name: '已处理' }
		]

    },
    // 配置别名,方便调用静态属性
    alternateClassName : 'StaticInfoConst'
});