define(function(require) {
	"use strict";
    var _self;
    var US_MYWORK_CONFIG = "US_MYWORK_CONFIG";
    var STATE_NONE = 0;
    var STATE_ITEM_SHOW = 1;

	function UIWork() {
        _self = this;
        _self.loaded = false;
        _self.hasBind = false;
        _self.config = [];
        _self.menuItemIds = [];
        _self.state = STATE_NONE;
        _self.getConfig();
	}
	
	UIWork.prototype.onLoad = function() {
        if (!_self.hasBind) {
            _self.hasBind = true;
            _self.showMenuItems();
            $("#ui_work").bind("longTap",function(){
                _self.onLongTap();
            });
        }
    };
    UIWork.prototype.onUnload = function() {
        if (_self.state == STATE_ITEM_SHOW) {
            _self.removeMenuitemAddIcon();
        }
    };
	UIWork.prototype.update = function() {
        _self.loaded = false;
        _self.showMenuItems();
    };
	UIWork.prototype.reset = function() {
        _self.loaded = false;
    };
	UIWork.prototype.showMenuItems = function() {
        var permissions = app.login.permission;

        if (!_self.loaded) {
            _self.loaded = true;
            var config = _self.config;
            var html = "";
            _self.menuItemIds = [];

            for (var i=0; i<config.length; i++) {
                var show = false;
                if (!config[i].permission) {
                    show = true;
                } else {
                    for (var j=0; j<permissions.length; j++) {
                        if (permissions[j] == config[i].permission) {
                            show = true;
                            break;
                        }
                    }
                }
                if (show) {
                    var itemId = "mywork_item_"+config[i].module;
                    _self.menuItemIds.push(itemId);
                    html += '<a href="#" id="'+itemId+'" onclick="app.uiWork.showModulePage(\''+config[i].module+'\')" class="menuicon '+config[i].icon+'">'+config[i].label+'</a>';
                }
            }
            _self.showTip = false;
            if (!html) {
                _self.showTip = true;
                if (_self.state == STATE_NONE ) {
                    html = '<div style="top:40%;position:absolute;">温馨提示:长按屏幕进入添加工作模式，添加完成长按屏幕进入正常模式</div>';
                } else {
                    html = '<div style="top:40%;position:absolute;">温馨提示:点击添加按钮添加工作</div>';
                }
            }

            html = '<a id="mywork_item_notify" href="#" onclick="app.uiWork.showWorkNotify()" class="menuicon workNotify">工作提醒</a>' + html;
            $('#work_menu_list').html(html);
            app.workNotify.updateBadge();

            if (_self.state == STATE_ITEM_SHOW) {
                _self.menuitemAddIcon = $('<a href="#" onclick="app.uiWork.addWork()" class="menuicon menuitem_add">添加工作</a>');
                $('#work_menu_list').append(_self.menuitemAddIcon);
                for (var i in _self.menuItemIds) {
                    _self.addItemDeleteIcon('#' + _self.menuItemIds[i], i);
                }
            }
        }
	};
    UIWork.prototype.getConfig = function () {
        _self.config = app.us.getObjectData(US_MYWORK_CONFIG)||[];
    };
    UIWork.prototype.setConfig = function (config) {
        _self.loaded = false;
        this.config = config;
        app.us.setObjectData(US_MYWORK_CONFIG, config);
    };
    UIWork.prototype.addWork = function () {
        var workPanelConfig = require('workPanelConfig');
        var config = _self.config;
        var uiRelevant = app.uiRelevant||require('uiRelevant');
        var relevantConfig = uiRelevant.config;
        var permissions = app.login.permission;
        var html = '';

        for (var i=0,len=workPanelConfig.length; i<len; i++){
            var show = false;
            if (!workPanelConfig[i].permission) {
                show = true;
            } else {
                for (var j=0; j<permissions.length; j++) {
                    if (permissions[j] == workPanelConfig[i].permission) {
                        show = true;
                        break;
                    }
                }
            }
            if (show) {
                for (var j=0; j<config.length; j++) {
                    if (config[j].module == workPanelConfig[i].module) {
                        show = false;
                        break;
                    }
                }
                if (show) {
                    for (var j=0; j<relevantConfig.length; j++) {
                        if (relevantConfig[j].module == workPanelConfig[i].module) {
                            show = false;
                            break;
                        }
                    }
                }
            }
            if (show) {
                html += '<input id="myw_config_' + i + '" type="checkbox" name="myw_config" value="' + i + '"><label for="myw_config_' + i + '">' + workPanelConfig[i].label + '</label>';
            }
        }

        if (!html) {
            html = '<div style="width=100%;text-align:center">没有工作可以添加<div>';
        } else {
            html = '<div class="input-group">'+html+'</div>';
        }

        app.utils.popupEx(html, "添加我的工作",
            function () {
                var workPanelConfig = require('workPanelConfig');
                var len = _self.config.length;
                $("input[type=checkbox][name='myw_config']:checked").each(function(){
                    var sel =  $(this).val();
                    _self.config.push(workPanelConfig[sel]);
                });
                if (len != _self.config.length) {
                    _self.setConfig(_self.config);
                    _self.showMenuItems();
                }
            }
        );
    };
    UIWork.prototype.removeModule = function (index) {
        _self.config.splice(index, 1);
        _self.setConfig(_self.config);
        _self.showMenuItems();
    };
    UIWork.prototype.showModulePage = function (md) {
        if (_self.state == STATE_NONE) {
            app.showModulePage(md);
        }
    };
    UIWork.prototype.addMenuitemAddIcon = function () {
        _self.state = STATE_ITEM_SHOW;
        app.utils.setRemoveMenuitemPanel(_self);
        if (_self.showTip) {
            var html = '<div style="top:40%;position:absolute;">温馨提示:点击添加按钮添加工作</div>';
            html = '<a id="mywork_item_notify" href="#" onclick="app.uiWork.showWorkNotify()" class="menuicon workNotify">工作提醒</a>' + html;
            $('#work_menu_list').html(html);
            app.workNotify.updateBadge();
        }
        _self.menuitemAddIcon = $('<a href="#" onclick="app.uiWork.addWork()" class="menuicon menuitem_add">添加工作</a>');
        $('#work_menu_list').append(_self.menuitemAddIcon);
        for (var i in _self.menuItemIds) {
            _self.addItemDeleteIcon('#'+_self.menuItemIds[i], i);
        }
    };
    UIWork.prototype.removeMenuitemAddIcon = function () {
        _self.state = STATE_NONE;
        app.utils.setRemoveMenuitemPanel(null);
        _self.menuitemAddIcon.remove();
        for (var i in _self.menuItemIds) {
            _self.removeItemDeleteIcon('#'+_self.menuItemIds[i]);
        }
        if (_self.showTip) {
            var html = '<div style="top:40%;position:absolute;">温馨提示:长按屏幕进入添加工作模式，添加完成长按屏幕进入正常模式</div>';
            html = '<a id="mywork_item_notify" href="#" onclick="app.uiWork.showWorkNotify()" class="menuicon workNotify">工作提醒</a>' + html;
            $('#work_menu_list').html(html);
            app.workNotify.updateBadge();
        }
    };
    UIWork.prototype.onLongTap = function () {
        if (_self.state == STATE_NONE) {
            _self.addMenuitemAddIcon();
        } else if (_self.state == STATE_ITEM_SHOW) {
            _self.removeMenuitemAddIcon();
        }
    };
    UIWork.prototype.addItemDeleteIcon = function(target, i) {
        var $target = $(target);
        var icon = $target.find("span.delete-icon");
        if (icon.length === 0) {
            if ($target.css("position") !== "absolute") $target.css("position", "relative");
            icon = $.create("span", {
                className: "delete-icon",
                html: "-",
                onclick: function(){_self.removeModule(i);return false;}
            });
            $target.append(icon);
        }
    };
    UIWork.prototype.removeItemDeleteIcon = function(target) {
        $(target).find("span.delete-icon").remove();
    };
    UIWork.prototype.showWorkNotify = function(target) {
        require('workNotify').show();
    };

	return new UIWork();
});
