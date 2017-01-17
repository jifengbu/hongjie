define(function(require) {
	"use strict";
    var _self;

    function CRMRequest() {
        _self = this;
    }
    //获取公用信息
    CRMRequest.prototype.checkCommonInfo = function(callback) {
        if (_self.commonInfo) {
            callback();
        } else {
            _self.checkCommonInfoCallback = callback;
            _self.doGetCommonInfo();
        }
    };
    //获取所有组织架构的信息.
    CRMRequest.prototype.deGetOrginizationManageInfo = function(){
        var url = app.route.crmGetOrnizationManageInfo;
        console.log(url);
       // app.utils.setWait("正在获取公共信息...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetOrinationManageInfoSuccess
        });
    };

    CRMRequest.prototype.onGetOrinationManageInfoSuccess = function(data){
       // app.utils.clearWait();
        app.OrinazationManageInfo = data;
        app.userMgr.setOrganizeInfo();
    };

    CRMRequest.prototype.doGetCommonInfo = function() {
        var param = {
            lan:"zh",
	    user_id:app.login.userid,
            //generator:-1,
            //notice_place:-1,
            //comment_source:-1,
            //category:-1,
            //priv_cat:-1,
            //inner_user:-1,
            //status:-1,
	        //purpose:-1,
        };
        var url = app.route.crmTicketCommUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("正在获取公共信息...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetCommonInfoSuccess,
            error : _self.onNetError
        });
    };
    CRMRequest.prototype.onGetCommonInfoSuccess = function(data) {
        if (data.errcode) {
            console.log(data.errcode+":"+data.errmsg);
            app.utils.showError(data.errmsg);
            app.utils.clearWait();
            return;
        }
        var res = {};
        var category = data.category;
        for (var i= 0,len=category.length; i<len; i++) {
            var item = category[i];
            var key = _.keys(item)[0];
            res[key] = item[key];
        }
        data.category = res;
		
	var res = {};
        var purpose = data.purpose;
        for (var i= 0,len=purpose.length; i<len; i++) {
            var item = purpose[i];
            var key = _.keys(item)[0];
            res[key] = item[key];
        }
        data.purpose = res;
		
        console.log(data);
        _self.commonInfo = data;		
        app.utils.clearWait();
        var callback = _self.checkCommonInfoCallback;
        callback();
        _self.checkCommonInfoCallback = null;
    };



    return new CRMRequest();
});
