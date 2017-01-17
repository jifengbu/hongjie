define(function(require) {
	"use strict";
    var _self;
    //默认网络超时为5分钟
    var DEFAILT_TIMEOUT = 300000;
    var US_TIMEOUT = "US_TIMEOUT";
	//公司口令如下：
    //tjmyrsky:天津麦凯瑞
    //szhspcb:深圳华祥
    //jjhspcb:九江华翔
    //szmyrsky:深圳麦凯瑞
	var URLS = {
        snow8:{
        },
        snow7:{
            crm_url:"http://192.168.211.7:4000",
            ticket_url:"http://192.168.211.7:4000",
            download_url: "http://192.168.211.7/ERP/download"
        },
        myrsky:{
            crm_url:"http://192.168.211.7:4000",
            ticket_url:"http://192.168.211.7:4000",
            download_url: "http://192.168.211.7/ERP/download"
        }
    };

    function Route() {
        _self = this;

        _self.us = require("usersetting");
        _self.timeout = _self.us.getIntData(US_TIMEOUT)||DEFAILT_TIMEOUT;
        _self.setUrls("snow7");
//        _self.setUrls("myrsky");
	}
    Route.prototype.setServerRoutes = function(url) {
        _self.loginUrl = url+"/login";
        _self.crmTokenUrl = url+"/get_token";
        _self.orderListUrl = url+"/get_product_info";
        _self.userInfoUrl = url+"/get_user_info";
        _self.orderListItemUrl = url+"/get_order_item";
        _self.orderListScheduleUrl = url+"/get_fac_status_item";
    };
    Route.prototype.setTicketRoutes = function(url) {
        _self.ticketCommUrl = url+"/get_comm";
        _self.ticketPrivUrl = url+"/get_priv";
        _self.ticketTokenUrl = url+"/get_token";
        _self.ticketListUrl = url+"/get_tk_list";
        _self.ticketItemUrl = url+"/get_tk";
        _self.ticketUpdateUrl = url+"/update_tk";
        _self.ticketIssueUrl = url+"/add_tk";
        _self.ticketReplyUrl = url+"/add_tk_reply";
        _self.ticketGetReplyUrl = url+"/get_tk_reply";
        _self.ticketHomeShowUrl = url+"/get_tk_homeshow";
    };
    Route.prototype.setDownloadRoutes = function(url) {
        var url_route = url+"?CRMClient/";
        var url_download = url+"/CRMClient/";
        _self.modulesConfigUrl = url_route+"config";
        _self.modulesDownloadUrl = url_download+"modules/";
        _self.versionInfoUrl = url_route+"version";
	    _self.apkDownloadUrl = url_download+"android/CRMClient.apk";
        _self.wwwDownloadUrl = url_download+"www/www.zip";
    };
    Route.prototype.setUrls = function(company) {
        var url = URLS[company];

        _self.setServerRoutes(url.crm_url);
        _self.setTicketRoutes(url.ticket_url);
        _self.setDownloadRoutes(url.download_url);
    };
    Route.prototype.setTimeout = function (val) {
        val = val || DEFAILT_TIMEOUT;
        if (_self.timeout != val) {
            _self.timeout = val;
            _self.us.setIntData(US_TIMEOUT, val);
        }
    };

	return new Route();
});

