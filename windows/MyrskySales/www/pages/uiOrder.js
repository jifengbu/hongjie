define(function(require) {
	"use strict";
    var _self;
    function UIOrder() {
        _self = this;
        _self.loaded = false;
    }
    UIOrder.prototype.onLoad = function() {
        if (!_self.loaded) {
            var config = require('orderPanelConfig');
            var html = "";
            for (var i=0; i<config.length; i++) {
                html += '<a href="#" onclick="_call([\''+config[i].module+'\',\'show\'])" class="menuicon '+config[i].icon+'">'+config[i].label+'</a>';
            }
            $('#uiorder_menu_list').html(html);
            _self.loaded = true;
        }
    };
    return new UIOrder();
});
