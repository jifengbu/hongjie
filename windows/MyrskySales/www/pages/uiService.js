define(function(require) {
	"use strict";
    var _self;
    function UIService() {
        _self = this;
        _self.loaded = false;
    }

    UIService.prototype.onLoad = function() {
        if (!_self.loaded) {
            var config = require('servicePanelConfig');
            var html = "";
            for (var i=0; i<config.length; i++) {
                html += '<a href="#" onclick="_call([\'uiIframe\',\'show\', \''+config[i].label+'\', \''+config[i].url+'\'])" class="menuicon '+config[i].icon+'">'+config[i].label+'</a>';
            }
            $('#uiservice_menu_list').html(html);
            _self.loaded = true;
        }
    };

    return new UIService();
});
