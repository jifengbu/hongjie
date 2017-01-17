define(function(require) {
	"use strict";
    var _self;
    var US_RELEVANT_CONFIG = "US_RELEVANT_CONFIG";
    var STATE_NONE = 0;
    var STATE_ITEM_SHOW = 1;
	function UIRelevant() {
        _self = this;
        _self.hasBind = false;
        _self.config = [];
        _self.menuItemIds = [];
        _self.state = STATE_NONE;
        _self.getConfig();
        _self.id = "uiRelevant";
	}
    UIRelevant.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
    };
	UIRelevant.prototype.onLoad = function() {
        if (!_self.hasBind) {
            _self.hasBind = true;
            $(app.utils.panelID(_self.id)).bind("longTap",function(){
                _self.onLongTap();
            });
        }
        _self.showMenuItems();
    };
    UIRelevant.prototype.onUnload = function() {
        if (_self.state == STATE_ITEM_SHOW) {
            _self.removeMenuitemAddIcon();
        }
    };
    UIRelevant.prototype.reset = function() {
        _self.loaded = false;
    }
	UIRelevant.prototype.showMenuItems = function() {
        var permissions = app.login.permission;

        if (permissions) {
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
                    var itemId = "relevant_item_"+config[i].module;
                    _self.menuItemIds.push(itemId);
                    html += '<a href="#" id="'+itemId+'" onclick="app.uiRelevant.showModulePage(\''+config[i].module+'\')" class="menuicon '+config[i].icon+'">'+config[i].label+'</a>';
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

            $('#relevant_menu_list').html(html);

            if (_self.state == STATE_ITEM_SHOW) {
                _self.menuitemAddIcon = $('<a href="#" onclick="app.uiRelevant.addWork()" class="menuicon menuitem_add">添加工作</a>');
                $('#relevant_menu_list').append(_self.menuitemAddIcon);
                for (var i in _self.menuItemIds) {
                    _self.addItemDeleteIcon('#' + _self.menuItemIds[i], i);
                }
            }
        }
	};
    UIRelevant.prototype.getConfig = function () {
        _self.config = app.us.getObjectData(US_RELEVANT_CONFIG)||[];
    };
    UIRelevant.prototype.setConfig = function (config) {
        this.config = config;
        app.us.setObjectData(US_RELEVANT_CONFIG, config);
    };
    UIRelevant.prototype.addWork = function () {
        var workPanelConfig = require('workPanelConfig');
        var config = _self.config;
        var uiWork = app.uiWork||require('uiWork');
        var myworkConfig = uiWork.config;
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
                    for (var j=0; j<myworkConfig.length; j++) {
                        if (myworkConfig[j].module == workPanelConfig[i].module) {
                            show = false;
                            break;
                        }
                    }
                }
            }
            if (show) {
                html += '<input id="rlv_config_' + i + '" type="checkbox" name="rlv_config" value="' + i + '"><label for="rlv_config_' + i + '">' + workPanelConfig[i].label + '</label>';
            }
        }

        if (!html) {
            html = '<div style="width=100%;text-align:center">没有工作可以添加<div>';
        } else {
            html = '<div class="input-group">'+html+'</div>';
        }

        app.utils.popupEx(html, "添加相关工作",
            function () {
                var workPanelConfig = require('workPanelConfig');
                var len = _self.config.length;
                $("input[type=checkbox][name='rlv_config']:checked").each(function(){
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
    UIRelevant.prototype.removeModule = function (index) {
        _self.config.splice(index, 1);
        _self.setConfig(_self.config);
        _self.showMenuItems();
    };
    UIRelevant.prototype.showModulePage = function (md) {
        if (_self.state == STATE_NONE) {
            app.showModulePage(md);
        }
    };
    UIRelevant.prototype.addMenuitemAddIcon = function () {
        _self.state = STATE_ITEM_SHOW;
        app.utils.setRemoveMenuitemPanel(_self);
        if (_self.showTip) {
            var html = '<div style="top:40%;position:absolute;">温馨提示:点击添加按钮添加工作</div>';
            $('#relevant_menu_list').html(html);
        }
        _self.menuitemAddIcon = $('<a href="#" onclick="app.uiRelevant.addWork()" class="menuicon menuitem_add">添加工作</a>');
        $('#relevant_menu_list').append(_self.menuitemAddIcon);
        for (var i in _self.menuItemIds) {
            _self.addItemDeleteIcon('#'+_self.menuItemIds[i], i);
        }
    };
    UIRelevant.prototype.removeMenuitemAddIcon = function () {
        _self.state = STATE_NONE;
        app.utils.setRemoveMenuitemPanel(null);
        _self.menuitemAddIcon.remove();
        for (var i in _self.menuItemIds) {
            _self.removeItemDeleteIcon('#'+_self.menuItemIds[i]);
        }
        if (_self.showTip) {
            var html = '<div style="top:40%;position:absolute;">温馨提示:长按屏幕进入添加工作模式，添加完成长按屏幕进入正常模式</div>';
            $('#relevant_menu_list').html(html);
        }
    };
    UIRelevant.prototype.onLongTap = function () {
        if (_self.state == STATE_NONE) {
            _self.addMenuitemAddIcon();
        } else if (_self.state == STATE_ITEM_SHOW) {
            _self.removeMenuitemAddIcon();
        }
    };
    UIRelevant.prototype.addItemDeleteIcon = function(target, i) {
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
    UIRelevant.prototype.removeItemDeleteIcon = function(target) {
        $(target).find("span.delete-icon").remove();
    };

	return new UIRelevant();
});
