define(function(require) {
	"use strict";
    var US_USERID = "US_USERID";
    var US_PASSWORD = "US_PASSWORD";
    var US_AUTOLOGIN = "US_AUTOLOGIN";

	var _self;
	function Login() {
		_self = this;
		_self.id = "login";
        _self.permission = [];
	}

	Login.prototype.show = function() {
        app.socketMgr.start(app.route.chatUrl);
        navigator.utils.getLocalValue("US_LOGOUT", function(tag){
            if (tag == "true") {
                navigator.utils.setLocalValue("US_LOGOUT", "");
                _self.userid = "";
                _self.password = "";
                _self.autologin = false;
                app.us.setStringData(US_USERID, "");
                app.us.setStringData(US_PASSWORD, "");
                app.us.setBooleanData(US_AUTOLOGIN, false);
            } else {
                _self.userid = app.us.getStringData(US_USERID);
                _self.password = app.us.getStringData(US_PASSWORD);
                _self.autologin = app.us.getBooleanData(US_AUTOLOGIN);
            }
            app.utils.loadPanel(_self.id, {header:"none", footer:"none",  transition:"none", loadfunc:_self.id+"=onLoad"});
        });
	};
	Login.prototype.onLoad = function () {
		console.log("Login onLoad");
		$.ui.clearHistory();

        var title = app.utils.isTestVersion()?'<span style="color:red;">测试</span>':(app.utils.isDevelopVersion()?'<span style="color:red;">开发</span>':'');
        $("#login_company_version").html("MRP客户端"+title+" V"+app.info.verName);
		$("#login_userid").val(_self.userid);
		$("#login_password").val(_self.password);

		if (_self.password) {
			$("#login_password_record").prop("checked", true);
			if (_self.autologin) {
				$("#login_auto_login").prop("checked", true);
				_self.doLogin();
			}
		}

        if (_from != "web") {
            $("#login_clear_company").css("display", "inline");
        }
	};
    Login.prototype.doCleanupCompany = function() {
        app.utils.popup({
            title: "警告",
            message: "清除公司口令后会<span style='color:red'>退出程序</span>并需要重新输入公司口令，确定清除吗?",
            cancelText: "取消",
            cancelCallback: function () {},
            doneText: "确定",
            doneCallback: function () {
                app.route.setCompany("");
                if (_os == "ios") {
                    app.utils.clearLocalStorage(["installVerCode", "documentPath"]);
                } else {
                    app.utils.clearLocalStorage(["installVerCode"]);
                }
                window.close();
                app.utils.toast("程序在1秒后重启");
                setTimeout(function(){
                    navigator.utils.restart();
                }, 1000);
            }
        });
    };
    Login.prototype.doLogout = function() {
        app.utils.popup({
            title: "警告",
            message: "注销登陆后会<span style='color:red'>退出程序</span>并需要重新登陆，确定注销登陆吗?",
            cancelText: "取消",
            cancelCallback: function () {},
            doneText: "确定",
            doneCallback: function () {
                navigator.utils.setLocalValue("US_LOGOUT", "true");
                app.utils.toast("程序在1秒后重启");
                setTimeout(function(){
                    navigator.utils.restart();
                }, 1000);
            }
        });
    };
	Login.prototype.doLogin = function() {
        var userid = $("#login_userid").val();
        var password = $("#login_password").val();

        if (!userid) {
            app.utils.toast("用户名不能为空");
            return;
        }
        if (!password) {
            app.utils.toast("密码不能为空");
            return;
        }
        _self.doLoginMRPServer(userid, password);
    };
    Login.prototype.onLoginError = function(error) {
        app.utils.showChatError(error);
        app.utils.clearWait();
    };
    Login.prototype.doLoginMRPServer = function(userid, password) {
        var param = "uid=" + userid + "&password=" + password;
        console.log(app.route.loginUrl+'?'+param);
        app.utils.setWait("登陆中...");
        app.utils.ajax({
            type : "POST",
            url : app.route.loginUrl,
            data : param,
            success : _self.onLoginMRPServerSuccess,
            error : _self.onLoginMRPServerError
        });
    };
	Login.prototype.onLoginMRPServerSuccess = function(data) {
		if (!data) {
            app.mrpconnect = false;
            _self.onLoginError('INVALID_ACCOUNT');
			return;
		}
		if (!data.success) {
            app.mrpconnect = false;
            _self.onLoginError('PASSWORD_ERROR');
			return;
		}
        app.mrpconnect = true;
        var permission = [], perms = data.permission;
        for (var key in perms) {
            if (/^android.*/.test(key) && perms[key]) {
                permission.push(key);
            }
        }
        console.log(permission);
        _self.permission = permission;

        var userid = $("#login_userid").val();
        var password = $("#login_password").val();
        var recordpwd = $("#login_password_record").prop("checked");
        var autologin = $("#login_auto_login").prop("checked");

        _self.setUserName(userid);
        _self.setPassword(password, recordpwd);
        _self.setAutoLogin(autologin);

        //创建缓存数据库
        var option = {
            indexes: [{name:"time", unique:false}]
            ,capped: {name:"time", max:1000, direction:1, strict:true}
        };
        _self.history_message_db = indexed('history_message_'+userid).create(option);
        _self.newest_message_db = indexed('newest_message_'+userid).create();
        _self.user_head_db = indexed('user_head_'+userid).create();
        _self.user_head_db.find(function (err, docs) {
            _.each(docs, function (obj) {
                $.insertStyleSheet(app.userHeadCss, '.user_head_' + obj.userid, 'background-image:url(' + obj.head + ')');
            });
        });


        if (app.chatconnect) {
            _self.doLoginChatServer(userid);
        } else {
            app.utils.toast('聊天服务器连接失败');
            $.ui.loadContent("#ui_work", true, false, "fade");
            app.utils.clearWait();
        }
	};
    Login.prototype.onLoginMRPServerError = function(data) {
        app.mrpconnect = false;
        return true;
    };
    Login.prototype.doLoginChatServer = function(userid) {
        var reconnect = !userid;
        userid = userid||_self.userid;
        if (!userid) {
            console.log("reconnect without user");
            return;
        }
        var param = {
            userid: userid,
            reconnect: reconnect
        };
        app.socket.emit('USER_LOGIN_RQ', param);
    };
    Login.prototype.onLoginChatServer = function(obj) {
        console.log(obj);
        if (!obj.error) {
            console.log("login chat success");
            _self.info = obj.info;
            app.onlineUserMgr.updateOnlineUsers(obj.list);
            app.groupMgr.addList(obj.info.groups);
            $.ui.loadContent(app.utils.isDevelopVersion()?"#ui_work":"#ui_message", true, false, "fade");
            app.chatLogin = true;
            app.utils.clearWait();
            if ((!_self.info.username || !_self.info.phone) && !app.utils.isDevelopVersion()) {
                setTimeout(function(){
                    app.utils.popup({
                        title: "温馨提示",
                        message: '亲，你还没有完善资料哦，现在就去<span style="color:green">更多</span><span style="color:green">个人信息</span>设置你的个性资料',
                        cancelText: "以后设置",
                        cancelCallback: function () {},
                        doneText: "马上就去",
                        doneCallback: function () {
                            require('personalInfo').show();
                        },
                        cancelOnly: false,
                        cancelClass: 'button text_red',
                        doneClass: 'button text_green'
                    });
                }, 500);
            }
        } else {
            _self.onLoginError(obj.error);
        }
    };
    Login.prototype.setUserName = function (userid) {
        if (_self.userid != userid) {
            _self.userid = userid;
            app.us.setStringData(US_USERID, userid);
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
