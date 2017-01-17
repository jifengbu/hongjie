define(function(require) {
	"use strict";
    var _self;

    function CRMRequest() {
        _self = this;

        _self.INVALID_OPER = -1;
        _self.LOGIN_OPER = 0;
        _self.OL_GET_LIST_OPER = 1;
        _self.OL_GET_USER_INFO_OPER = 2;
        _self.OL_GET_DETAIL_OPER = 3;
        _self.OL_GET_SCHEDULE_OPER = 4;
        _self.oper = _self.INVALID_OPER;

        _self.token_date = 0;
        _self.expires_in = 0;

        _self.token_appid = "1";
        _self.token_secret = "time";
    }
    CRMRequest.prototype.onNetError = function(data, type) {
        app.utils.toast("获取令牌失败");
        $.ui.goBack();
    };
    CRMRequest.prototype.getCRMRequestToken = function() {
        var param = {
            appid:_self.token_appid,
            secret:_self.token_secret
        };
        var url = app.route.crmTokenUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("正在获取令牌...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetCRMRequestTokenSuccess,
            error : _self.onNetError
        });
    };
    CRMRequest.prototype.onGetCRMRequestTokenSuccess = function(data) {
        if (data.errcode) {
            console.log(data.errcode+":"+data.errmsg);
            app.utils.showError(data.errmsg);
            app.utils.clearWait();
            return;
        }
        console.log("token:"+data.access_token);
        _self.access_token = data.access_token;
        _self.expires_in = (data.expires_in-120)*1000; //ms
        _self.token_date = new Date().getTime();
        app.utils.clearWait();
        if (_self.oper == _self.LOGIN_OPER) {
            app.login.doLogin();
        } else if (_self.oper == _self.OL_GET_LIST_OPER) {
            app.orderlist.doGetOrderListList();
        } else if (_self.oper == _self.OL_GET_USER_INFO_OPER) {
            app.orderlist.doGetUserInfo();
        } else if (_self.oper == _self.OL_GET_DETAIL_OPER) {
            app.orderlist.getOrderListDetail();
        } else if (_self.oper == _self.OL_GET_SCHEDULE_OPER) {
            app.orderlist.getOrderListSchedule();
        }
    };
    CRMRequest.prototype.checkToken = function(oper) {
        if (_self.token_date + _self.expires_in < new Date().getTime()) {
            _self.oper = oper;
            _self.getCRMRequestToken();
            return true;
        }
        return false;
    };
    return new CRMRequest();
});
