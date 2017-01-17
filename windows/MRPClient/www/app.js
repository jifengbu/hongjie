var app;
define(function(require) {
	"use strict";
	var _self;
	function App(){
		_self = this;
		_self.us = require("usersetting");
		_self.extend = require("extend");
        _self.utils = require("utils");
        _self.error = require("error");
        _self.route = require("route");
        _self.resource = require("resource");
        _self.login = require("login");
        _self.color = require("color");
        _self.crm = require("crmRequestConfig");
        _self.workNotify = require("workNotify");
        _self.socketMgr = require('socketMgr');
        _self.chatRouter = require('chatRouter');
        _self.onlineUserMgr = require('onlineUserMgr');
        _self.userMgr = require('userMgr');
        _self.notifyMgr = require('notifyMgr');
        _self.messageMgr = require('messageMgr');
        _self.groupMgr = require('groupMgr');
        _self.callMgr = require('callMgr');
        _self.chatPageBadge = 0;
	}
	App.prototype.emit = function() {
        console.log(arguments[0], JSON.stringify(arguments[1]));
        if (!_self.chatLogin) {
            console.log('you are offline');
            return;
        }
        _self.socket.emit.apply(_self.socket, arguments);
    };
	App.prototype.initialize = function() {
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
        if (_os == 'desktop') {
            _self.useDiv = true;
        }
        _self.notPlaySound = app.us.getBooleanData("US_NOT_PLAY_SOUND");
        _self.notShowNotify = app.us.getBooleanData("US_NOT_SHOW_NOTIFY");

        var path = window.location.pathname;
        _self.resPath =path.replace(/index.html$/, '');
		document.addEventListener('backbutton', _self.onBackButton, false);
        document.addEventListener("pause", _self.onPause, false);
        document.addEventListener("resume", _self.onResume, false);

        _self.startPrepare();
	};
    App.prototype.bindSwipeEvents = function() {
        $("#ui_work").bind("swipeLeft",function(){
            $.ui.loadContent("#ui_contact", true, false, "slideLeft");
        });
        $("#ui_contact").bind("swipeLeft",function(){
            $.ui.loadContent("#ui_message", true, false, "slideLeft");
        }).bind("swipeRight",function(){
            $.ui.loadContent("#ui_work", true, false, "slideRight");
        });
        $("#ui_message").bind("swipeLeft",function(){
            $.ui.loadContent("#ui_more", true, false, "slideLeft");
        }).bind("swipeRight",function(){
            $.ui.loadContent("#ui_contact", true, false, "slideRight");
        });
        $("#ui_more").bind("swipeRight",function(){
            $.ui.loadContent("#ui_message", true, false, "slideRight");
        });
    };
	App.prototype.showModulePage = function(module) {
        if (_self.mrpconnect) {
            _call([module, "show"]);
        } else {
            _self.utils.toast("MRP授权没有成功，请到设置去重新授权");
        }
    };
	App.prototype.changeToChatPage = function(id, left) {
        var transition = left?"slideLeft":"slideRight";
        $.ui.pushHistory(app.utils.panelID(id), "#ui_message", transition, "");
        app.historySave = _.deepClone($.ui.history);
        $.ui.loadContent("#ui_message", true, false, transition);
        $.ui.history = _.deepClone(app.historySave);
    };
	App.prototype.updateChatPageBadge = function(param) {
        var aid;
        if (typeof param === 'string') {
            aid = 'panel_'+param;
        } else {
            _self.chatPageBadge++;
            aid = $.ui.activeDiv.id;
        }
        var el = $('header[data-parent="' + aid + '"] .message.chatbutton,header[data-parent="' + aid + '"] .message.rightchatbutton');
        if (_self.chatPageBadge) {
            $.ui.updateBadge(el, _self.chatPageBadge, "tr", 'red');
        } else {
            $.ui.removeBadge(el);
        }
    };
    App.prototype.clearChatPageBadge = function() {
        _self.chatPageBadge = 0;
    };
	App.prototype.startPrepare = function() {
		console.log("App startPrepare");
        $.ui.ready(function(){
            $("#afui").css("height", "100%");
            $("#afui").addClass('jfb');

            //增加用户头像的css
            _self.userHeadCss = $.createStyleSheet();

            console.log("UI ready");
            //_self.bindSwipeEvents();

            if (_from == "web") {
                app.route.setWebUrls(window.location.origin);
                app.login.show();
            } else {
                require('prepare').show();
            }
        });

        _self.extend.initial(function(){
            $.ui.launch();
        });
	};
	App.prototype.onPause = function(e) {
        app.pause = true;
        app.videoCall && app.videoCall.hangupVideoCall();
        app.audioCall && app.audioCall.hangupAudioCall();
        console.log("app goto background");
    };
    App.prototype.onResume = function(e) {
        navigator.utils.clearNotification();
        app.pause = false;
        console.log("app goto foreground");
    };
	App.prototype.onBackButton = function(e) {
        _self.utils.onBackButton(e);
	};

	var tmp = new App();
    tmp.info = app.info;
    app = tmp;
	return app;
});
