define(function(require) {
	"use strict";
	var _self;
	function About() {
		_self = this;
		_self.id = "about";
	}
	About.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	About.prototype.onLoad = function() {
	};
	return new About();
});