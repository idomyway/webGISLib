var $config = (function($) {
	$.gisConfig = {
		level:13,
        center:[121.0569700755,32.0720665161],
		mapServers: [
            {
            	id:'ntBase',
            	url:'http://10.10.70.85:6090/huarun',
				type:'tianditiled'
            }

		]
	};
	return $;
})(window.$config||{});