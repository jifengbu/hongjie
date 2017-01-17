define(function(require) {
	"use strict";
    var US_USERNAME = "US_USERNAME";
    var US_PASSWORD = "US_PASSWORD";
    var US_AUTOLOGIN = "US_AUTOLOGIN";

	var _self;
	function Login() {
		_self = this;
		_self.id = "login";
	}

	Login.prototype.show = function() {
        navigator.utils.getLocalValue("US_LOGOUT", function(tag){
            if (tag == "true") {
                navigator.utils.setLocalValue("US_LOGOUT", "");
                _self.username = "";
                _self.password = "";
                _self.autologin = false;
                app.us.setStringData(US_USERNAME, "");
                app.us.setStringData(US_PASSWORD, "");
                app.us.setBooleanData(US_AUTOLOGIN, false);
            } else {
                _self.username = app.us.getStringData(US_USERNAME);
                _self.password = app.us.getStringData(US_PASSWORD);
                _self.autologin = app.us.getBooleanData(US_AUTOLOGIN);
            }
            app.utils.loadPanel(_self.id, {header:"none", footer:"none",  transition:"none", loadfunc:_self.id+"=onLoad"});
        });
	};
	Login.prototype.onLoad = function () {
		console.log("Login onLoad");
		$.ui.clearHistory();

        var title = app.utils.isTestVersion(app.version.verCode)?'<span style="color:red;">测试</span>':'';
        $("#login_company_version").html("迈瑞凯销售系统"+title+" V"+app.version.verName);
		$("#login_username").val(_self.username);
		$("#login_password").val(_self.password);

		if (_self.password) {
			$("#login_password_record").prop("checked", true);
			if (_self.autologin) {
				$("#login_auto_login").prop("checked", true);
				_self.login();
			}
		}
        console.log("UI splashscreen hide before");
        navigator.splashscreen.hide();
        console.log("UI splashscreen hide done");
        _self.setBackdoor();
	};
    Login.prototype.setBackdoor = function () {
        var flag = false;
        $("#login_company_version_right").bind("doubleTap", function(){
            flag = true;
            setTimeout(function(){flag=false}, 3000);
        }).bind("longTap", function(){
            if (flag) {
                app.crm.token_date = 0;
                var route = app.route,
                    utils = app.utils;
                if (route.target == "snow7") {
                    route.setUrls("myrsky");
                    utils.toast("切换到迈瑞凯环境");
                } else {
                    route.setUrls("snow7");
                    utils.toast("切换到测试环境");
                }
            }
        });
    };
    Login.prototype.login = function() {
        if (!app.crm.checkToken(app.crm.LOGIN_OPER)) {
            _self.doLogin();
        }
    };
	Login.prototype.doLogin = function () {
		var username = $("#login_username").val();
		var password = $("#login_password").val();
		var recordpwd = $("#login_auto_login").prop("checked");

		if (!username) {
			app.utils.toast("用户名不能为空");
			return;
		}
		if (!password) {
			app.utils.toast("密码不能为空");
			return;
		}

        var data = {
            user_email : username,
            password : password,
            token:app.crm.access_token
        };
        console.log(app.route.loginUrl +"?"+ $.param(data));
		app.utils.setWait("登录中...");
		app.utils.ajax({
			type : "POST",
			url : app.route.loginUrl,
            data : data,
			success : _self.onLoginSuccess
		});
	};
	Login.prototype.onLoginSuccess = function(data) {
        console.log(data);
        if (data.errcode) {
            app.utils.showError(app.error.PASSWORD_ERROR);
            app.utils.clearWait();
            return;
        }
        var username = $("#login_username").val();
        var password = $("#login_password").val();
        var recordpwd = $("#login_password_record").prop("checked");
        var autologin = $("#login_auto_login").prop("checked");

        _self.setUserName(username);
        _self.setPassword(password, recordpwd);
        _self.setAutoLogin(autologin);
        _self.userInfo = data;
        $.ui.loadContent("#ui_home", true, false, "fade");
        app.utils.clearWait();
    };
    Login.prototype.setUserName = function (username) {
        if (_self.username != username) {
            _self.username = username;
            app.us.setStringData(US_USERNAME, username);
        }
    };
    Login.prototype.setPassword = function (password, save) {
        if (_self.password != password) {
            _self.password = password;
            if (save) {
                app.us.setStringData(US_PASSWORD, password);
            } else {
                app.us.setStringData(US_PASSWORD, "");
            }
        }
    };
    Login.prototype.setAutoLogin = function (val) {
        if (_self.autologin != val) {
            _self.autologin = val;
            app.us.setBooleanData(US_AUTOLOGIN, val);
        }
    };
	
	return new Login();
});
