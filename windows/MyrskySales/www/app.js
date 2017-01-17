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
        _self.login = require("login");
        _self.color = require("color");
        _self.crm = require("crmRequestConfig");
	}
	App.prototype.initialize = function() {
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
		document.addEventListener('backbutton', _self.onBackButton, false);
        navigator.utils.getVersionInfo(function(data){
                _self.version = data;
                console.log(_self.version);
                _self.startApp();
            },
            function(){
                _self.version = {
                    verCode:101,
                    verName:'1.0.1',
                    description:'没有获取到版本号'
                };
                _self.startApp();
            });
	};
	App.prototype.startApp = function() {
		console.log("App startApp");
        if (_self.version.verCode < 5000) {
            _self.route.setUrls("myrsky");
            console.log("set route to myrsky");
        } else {
            _self.route.setUrls("snow7");
            console.log("set route to snow7");
        }

        _self.utils.uiBlockType = 0;//UI_NOT_BOLCK
        var auto_check_update = false;
        if (localStorage.US_AUTO_CHECK_UPDATE == null) {
            auto_check_update = true;
            app.us.setBooleanData('US_AUTO_CHECK_UPDATE', true);
        } else {
            auto_check_update = app.us.getBooleanData('US_AUTO_CHECK_UPDATE');
        }
        if (auto_check_update) {
			console.log("update modules first time");
			_self.launchUpdate();
		} else {
			console.log("don't need update here");
			_self.launchLogin();
		}
	};
	App.prototype.launchUpdate = function() {
		$.ui.ready(function(){
            $("#afui").css("height", "100%");
            $("#afui").addClass('jfb');
			console.log("UI ready");
			app.utils.bindSwipeEvents();
			var update = require('update');
			update.show(update.FROM_APP_START);
		});
		_self.extend.initial(function(){
			$.ui.launch();
		});
	};
	App.prototype.launchLogin = function() {
		$.ui.ready(function(){
            $("#afui").css("height", "100%");
            $("#afui").addClass('jfb');
			console.log("UI ready");
			app.utils.bindSwipeEvents();
			app.login.show();
		});
		_self.extend.initial(function(){
			$.ui.launch();
		});
	};
	App.prototype.onBackButton = function(e) {
        app.utils.onBackButton(e);
	};

	app = new App();
	return app;
});
