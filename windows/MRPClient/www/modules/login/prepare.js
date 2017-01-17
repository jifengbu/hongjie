define(function(require) {
	"use strict";
	var _self;
    var auto_check_update = false;
	function Prepare() {
		_self = this;
		_self.id = "prepare";
	}

	Prepare.prototype.show = function() {
        app.utils.loadPanel(_self.id, {header:"none", footer:"none", transition:"none", loadfunc:_self.id+"=onLoad"});
	};
	Prepare.prototype.onLoad = function () {
		console.log("Prepare onLoad");
		$.ui.clearHistory();
        _self.checkCompany();
	};
	//判断公司口令是否设置
    Prepare.prototype.checkCompany = function () {
        navigator.utils.getLocalValue("US_COMPANY", function(company){
            app.utils.uiBlockType = 3; //UI_BOLCK_ALL
            if (company) {
                app.route.company = company;
                app.route.setProbeUrl(company);
                _self.checkNetworkType();
            } else {
                _self.popup_inst = $("#afui").popup({
                    title: "请输入公司口令",
                    message: "<input type='text' id='app_input_company' class='af-ui-forms' style='color:black;font-weight:bold;'>",
                    cancelText: "取消",
                    cancelCallback: function () {
                        _self.popup_inst = null;
                        navigator.utils.exitApp();
                    },
                    doneText: "确定",
                    doneCallback: function () {
                        var company = $("#app_input_company").val().trim();
                        if (app.route.checkCompany(company)) {
                            app.route.setProbeUrl(company);
                            _self.popup_inst.hide();
                            _self.popup_inst = null;
                            _self.checkNetworkType();
                        } else {
                            app.utils.toast("错误的公司口令");
                        }
                    },
                    autoCloseDone: false
                });
                navigator.splashscreen.hide();
            }
        });
    };
	Prepare.prototype.checkNetworkType = function () {
        if (!app.utils.checkNetwork()) {
            $("#afui").popup({
                title: "警告",
                message: "现在没有网络，不能进入系统。",
                cancelText: "确定",
                cancelCallback: function () {
                    navigator.utils.exitApp();
                },
                cancelOnly : true
            });
        } else {
            app.utils.setWait("正在检测网络状态...");
            app.utils.uiBlockType = 3; //UI_BOLCK_ALL
            app.utils.ajax({
                type: "GET",
                url: app.route.probeUrl,
                timeout: 5000,
                nosound: true,
                success: _self.onCheckNetworkTypeSuccess,
                error: _self.onCheckNetworkTypeError
            });
        }
	};
	Prepare.prototype.onCheckNetworkTypeSuccess = function(data) {
        console.log("use inner network");
        app.utils.clearWait();
        app.route.netType = app.route.INNER_NET_TYPE;
        app.route.setUrls();
        _self.startApp();
	};
    Prepare.prototype.onCheckNetworkTypeError = function(ret, type) {
        console.log("use outter network");
        app.utils.clearWait();
        app.route.netType = app.route.OUTTER_NET_TYPE;
        app.route.setUrls();
        _self.startApp();
        return true;
    };
    Prepare.prototype.startApp = function() {
        console.log("App startApp");
        app.utils.uiBlockType = 0;//UI_NOT_BOLCK
        navigator.splashscreen.hide();

        if (localStorage.US_AUTO_CHECK_UPDATE == null) {
            auto_check_update = true;
            app.us.setBooleanData('US_AUTO_CHECK_UPDATE', true);
        } else {
            auto_check_update = app.us.getBooleanData('US_AUTO_CHECK_UPDATE');
        }
        if (auto_check_update) {
            console.log("update modules first time");
            var update = require('update');
            update.show(update.FROM_APP_START);
        } else {
            console.log("don't need update here");
            app.login.show();
        }
    };

	return new Prepare();
});
