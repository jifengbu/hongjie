define(function(require) {
	"use strict";
	var _self;
	function PersonalInfo() {
		_self = this;
		_self.id = "personalInfo";
	}
	PersonalInfo.prototype.show = function() {
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	PersonalInfo.prototype.onLoad = function() {
        var info = app.login.userInfo;
        $('#psi_user_id').val(app.login.username);
        $('#psi_user_name').val(info.user_name);
        $('#psi_priv_cat').val(info.priv_cat);
        $('#psi_cellphone').val(info.cellphone);
        $('#psi_phone').val(info.phone);
        $('#psi_email').val(info.email);
        $('#psi_fax').val(info.fax);
	};
	PersonalInfo.prototype.doLogout = function() {
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
	return new PersonalInfo();
});