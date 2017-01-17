define(function(require) {
	"use strict";
    var _self;
	function UIHome() {
        _self = this;
        _self.loaded = false;
	}
    UIHome.prototype.onLoad = function() {
        if (!_self.loaded) {
            _self.loaded = true;
        }
    };
	return new UIHome();
});
