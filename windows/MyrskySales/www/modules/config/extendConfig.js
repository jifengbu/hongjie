define(function(require) {
	"use strict";
	function ExtendConfig() {
	}
	
	ExtendConfig.prototype.initial = function(callback) {
		//add extend functions to here
	        if (_os == "windows") {
	            navigator.utils.setSysMenu();
	        }
		callback();
	};
	
	return new ExtendConfig();
});
