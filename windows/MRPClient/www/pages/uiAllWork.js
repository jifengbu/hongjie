define(function(require) {
	"use strict";
    var _self;
	function UIAllWork() {
        _self = this;
        _self.id = "uiAllWork";
	}

    UIAllWork.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
    };
    UIAllWork.prototype.onLoad = function() {
        if (!_self.loaded ) {
            var permissions = app.login.permission;
            var config = require('workPanelConfig');
            var html = "";
            var perms = {};
            for (var i = 0; i < config.length; i++) {
                var show = false;
                if (!config[i].permission) {
                    show = true;
                } else {
                    for (var j = 0; j < permissions.length; j++) {
                        if (permissions[j] == config[i].permission) {
                            show = true;
                            break;
                        }
                    }
                }
                if (show) {
                    var type = config[i].type;
                    if (!perms[type]) {
                        perms[type] = [];
                    }
                    perms[config[i].type].push(config[i]);
                }
            }


            for (var type in perms) {
                var item = perms[type];
                html += _self.showClassMenu(type, perms[type]);
            }
            $('#all_work_menu_list').html(html);
        }
    };
    UIAllWork.prototype.showClassMenu = function(type, config) {
        var types = ['统计', '报工', '消息', '其他'];
        var html = '';
        html += '<li>';
        html += '<h5 class="expanded list_title" onclick="app.utils.showHide(this, \'all_work_type_'+type+'\')">'+types[type]+'</h5>';
        html += '<div class="grid_menu" id="all_work_type_'+type+'">';
        for (var i= 0,len=config.length; i<len; i++) {
            var c = config[i];
            html += '<a href="#" onclick="app.showModulePage(\'' + c.module + '\')" class="menuicon ' + c.icon + '">' + c.label + '</a>';
        }
        html += '</div>';
        html += '</li>';
        return html;
    };
    UIAllWork.prototype.reset = function() {
        _self.loaded = false;
    }
	
	return new UIAllWork();
});
