define(function(require) {
	"use strict";
    var _self;
    //默认网络超时为5分钟
    var DEFAILT_TIMEOUT = 300000;
    var US_TIMEOUT = "US_TIMEOUT";
	var URLS = {
        snow8:{
        },
        snow7:{
            crm_url:"http://192.168.211.7:4000",
            ticket_url:"http://192.168.211.7:4000",
            download_url: "http://192.168.211.7/ERP/download"
        },
        myrsky:{
            crm_url:"http://www.myrsky.com.cn/code/myro_api",
            ticket_url:"http://www.myrsky.com.cn/code/myro_api",
            download_url: "http://www.myrsky.com.cn/code/download"
        }
    };

    function Route() {
        _self = this;
        _self.target = "snow7";

        _self.us = require("usersetting");
        _self.timeout = _self.us.getIntData(US_TIMEOUT)||DEFAILT_TIMEOUT;
	}
    Route.prototype.setServerRoutes = function(url) {
        _self.loginUrl = url+"/login.php";
        _self.crmTokenUrl = url+"/get_token.php";
        _self.orderListUrl = url+"/get_product_info.php";
        _self.userInfoUrl = url+"/get_user_info.php";
        _self.orderListItemUrl = url+"/get_order_item.php";
        _self.orderListScheduleUrl = url+"/get_fac_status_item.php";
    };
    Route.prototype.setTicketRoutes = function(url) {
        _self.ticketCommUrl = url+"/get_comm.php";
        _self.ticketPrivUrl = url+"/get_priv.php";
        _self.ticketTokenUrl = url+"/get_token.php";
        _self.ticketListUrl = url+"/get_tk_list.php";
        _self.ticketItemUrl = url+"/get_tk.php";
        _self.ticketUpdateUrl = url+"/update_tk.php";
        _self.ticketIssueUrl = url+"/add_tk.php";
        _self.ticketReplyUrl = url+"/add_tk_reply.php";
        _self.ticketGetReplyUrl = url+"/get_tk_reply.php";
        _self.ticketHomeShowUrl = url+"/get_tk_homeshow.php";
    };
    Route.prototype.setDownloadRoutes = function(url) {
        var url_route = url+"?MyrskySales/";
        var url_download = url+"/MyrskySales/";
        _self.modulesConfigUrl = url_route+"config";
        _self.modulesDownloadUrl = url_download+"modules/";
        _self.versionInfoUrl = url_route+"version";
	    _self.apkDownloadUrl = url_download+"android/MyrskySales.apk";
        _self.wwwDownloadUrl = url_download+"www/www.zip";
    };
    Route.prototype.setUrls = function(company) {
        _self.target = company;
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

