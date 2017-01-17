define(function(require) {
	"use strict";
    var _self;

    function CRMRequest() {
        _self = this;

        _self.INVALID_OPER = -1;
        _self.GET_ORDER_LIST_OPER = 0;
        _self.GET_ORDER_DETAIL_OPER = 1;
        _self.oper = _self.INVALID_OPER;

        _self.token_date = 0;
        _self.expires_in = 0;

        _self.token_appid = "1";
        _self.token_secret = "time";
    }
    CRMRequest.prototype.onNetError = function(data, type) {
        app.utils.toast(T("common.get_token_failed"));
        $.ui.goBack();
    };
    CRMRequest.prototype.getCRMRequestToken = function() {
        var param = {
            appid:_self.token_appid,
            secret:_self.token_secret
        };
        var url = app.route.crmTokenUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait(T("common.getting_token")+"...");
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
        if (_self.oper == _self.GET_ORDER_LIST_OPER) {
            require('orderlist').doGetOrderListList();
        } else if (_self.oper == _self.GET_ORDER_DETAIL_OPER) {
        }
    };
    CRMRequest.prototype.checkTokenTimeoutForOper = function(oper) {
        if (_self.token_date + _self.expires_in < new Date().getTime()) {
            _self.oper = oper;
            _self.getCRMRequestToken();
            return true;
        }
        return false;
    };
    return new CRMRequest();
});
