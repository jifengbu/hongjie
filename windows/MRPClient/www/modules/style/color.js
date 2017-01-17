define(function(require) {
	"use strict";
	var _self;
	function Color() {
		_self = this;
		_self.id = "color";

        if (_os == 'desktop' || _from == 'web') {
            require(['order!css!menuIcons', 'order!css!mystyle', 'order!less!screen'], function() {
                if (app && app.prepare && app.prepare.popup_inst) {
                    app.prepare.popup_inst.positionPopup();
                }
            });
        }
        else if (_os == "ios" || _os == "android") {
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            var cssPath = app.info.documentPath+"www/modules/style/";
            var cssFile = "screen.css";
            console.log("[install]cssPath:" + cssPath+cssFile);
            console.log("[install]:genScreenCss winWidth=" + winWidth + " winHeight=" + winHeight);
            navigator.utils.genScreenCss(cssPath, cssFile, winWidth, winHeight);
            console.log("[install]:genScreenCss complete");
            require(['order!css!menuIcons', 'order!css!mystyle', 'order!css!screen'], function() {
                if (app && app.prepare && app.prepare.popup_inst) {
                    app.prepare.popup_inst.positionPopup();
                }
            });
        } else {
            require(['order!css!menuIcons', 'order!css!mystyle', 'order!less!screen'], function() {
                if (app && app.prepare && app.prepare.popup_inst) {
                    app.prepare.popup_inst.positionPopup();
                }
            });
        }
	}
	
    Color.prototype.RED = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:red'>"+val+"</span>";
    };
    Color.prototype.WHITE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:#ffffff'>"+val+"</span>";
    };
    Color.prototype.BLUE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:blue'>"+val+"</span>";
    };
    Color.prototype.GREEN = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:green'>"+val+"</span>";
    };
    Color.prototype.LIGHTBLUE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:lightblue'>"+val+"</span>";
    };
    Color.prototype.DARKOLIVEGREEN = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:darkolivegreen'>"+val+"</span>";
    };
    Color.prototype.OLIVEDRAB = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:olivedrab'>"+val+"</span>";
    };
    Color.prototype.STEELBLUE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:steelblue'>"+val+"</span>";
    };
    Color.prototype.PURPLE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:magenta'>"+val+"</span>";
    };
    Color.prototype.GRAY = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:gray'>"+val+"</span>";
    };
    Color.prototype.GOLD = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:gold'>"+val+"</span>";
    };
    Color.prototype.AREA_COLOR = function(val) {
        val = val||0;
        val = Math.round(val*100)/100;
        return "<span style='color:red'>"+val+"</span>";
    };
    Color.prototype.PRICE_COLOR = function(val) {
        val = val||0;
        val = Math.round(val*100)/100;
        return "<span style='color:darkorange'>"+val+"</span>";
    };
    Color.prototype.PNL_COLOR = function(val) {
        val = val||0;
        return "<span style='color:seagreen'>"+val+"</span>";
    };
    Color.prototype.PCS_COLOR = function(val) {
        val = val||0;
        return "<span style='color:darkgoldenrod'>"+val+"</span>";
    };
    Color.prototype.COUNT_COLOR = function(val) {
        val = val||0;
        return "<span style='color:dodgerblue'>"+val+"</span>";
    };
    Color.prototype.DATE_COLOR = function(val) {
        val = val||'无';
        return "<span style='color:coral'>"+val+"</span>";
    };
    Color.prototype.USERNAME_COLOR = function(userid, username) {
        var onlineUsers = app.onlineUserMgr.onlineUsers,
            color = 'gray';
        if (userid == app.login.userid) {
            color = 'blue';
        } else if (onlineUsers.hasOwnProperty(userid)) {
            color = 'green';
        }
        return '<span style="color:'+color+'" class=\'chat_username\' data-userid=\''+userid+'\' >'+username+'</span>';
    };
    Color.prototype.updateUserNameColor = function(userid, color) {
        var el = $('.chat_username[data-userid="'+userid+'"]');
        el.css('color', color);
    };
    Color.prototype.updateUserName = function(userid, name) {
        var el = $('.chat_username[data-userid="'+userid+'"]');
        el.html(name);
    };
	return new Color();
});
