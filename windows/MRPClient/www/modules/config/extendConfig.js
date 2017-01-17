define(function(require) {
	"use strict";
	function ExtendConfig() {
	}

	ExtendConfig.prototype.initial = function(callback) {
		//add extend functions to here
		if (_os == 'desktop' && _from != "web") {
			navigator.utils.setupSysMenu();
			navigator.utils.setupAudio();
			navigator.utils.setupFileChooser();
		} else if (_from == "web") {
			navigator.utils.setupAudio();
			navigator.utils.setupFileChooser();
		}
		callback();
	};

	return new ExtendConfig();
});
