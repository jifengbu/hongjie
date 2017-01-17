define(function(require) {
	"use strict";
	var _self;
	function Help() {
		_self = this;
		_self.id = "help";
	}
	Help.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
    };
    Help.prototype.onLoad = function() {
        var path = require.toUrl('help').replace(/help$/, '');
        $("#panel_help img").each(function(index, item){
            var el = $(item);
            var png = el.attr('src').replace(/.*\//, '');
            el.attr('src', path+png);
        })
    };
	return new Help();
});