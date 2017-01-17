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

    //stageType类型:
    // 0默认为接收并完工，可配置
    // 1默认为接收后完工，可配置
    // 2默认为接收并完工，不可配置
    // 3默认为接收后完工，不可配置

    //网络类型:
    //实现原理，在内网能使用的情况下，优先使用内网，在登陆之前，自定义一个probe协议，就是试探内网能否连接成功，如果能连接成功，则使用内网来，否则使用外网。同时在设置里面允许用户选择内网连接还是外网连接。
    //netType: INNER_NET_TYPE：内网 OUTTER_NET_TYPE：外网
    //探针url以内网为准
	var URLS = {
		local:
		{
            outer_mrp:"http://mrp.myropcb.com",
            inner_mrp:"http://mrp.myropcb.com",
            outer_crm:"http://dep.myropcb.com/myro_api/",
            inner_crm:"http://dep.myropcb.com/myro_api/",
            stageType:1
        },
        snow8:{
            outer_mrp:"http://192.168.211.8",
            inner_mrp:"http://192.168.211.8",
            outer_crm:"http://192.168.211.8:4000",
            inner_crm:"http://192.168.211.8:4000",
            stageType:1
        },
        snow7:{
            outer_mrp:"http://192.168.211.7:8080",
            inner_mrp:"http://192.168.211.7:8080",
            outer_crm:"http://192.168.211.7:4000",
            inner_crm:"http://192.168.211.7:4000",
            inner_chat:"http://192.168.211.7:3000",
            outer_chat:"http://192.168.211.7:3000",
            stageType:1
        },
        snow:{
            outer_mrp:"http://snowerp.myropcb.com",
            inner_mrp:"http://snowerp.myropcb.com",
            outer_crm:"http://snow.myropcb.com/myro_api",
            inner_crm:"http://snow.myropcb.com/myro_api",
            stageType:1
        },
        tjmyrsky:{
            outer_mrp:"http://tj.myrsky.com.cn:8089",
            inner_mrp:"http://192.26.1.5:8089",
            outer_crm:"http://tj.myrsky.com.cn:8088/myro_api",
            inner_crm:"http://192.26.1.6:8088/myro_api",
            outer_chat:"http://tj.myrsky.com.cn:3000",
            inner_chat:"http://192.26.1.5:3000",
            stageType:1
        },
        szhspcb:{
            outer_mrp:"http://crm.hspcb.com:8089",
            inner_mrp:"http://192.168.0.151:8089",
            outer_crm:"http://crm.hspcb.com:8088/myro_api",
            inner_crm:"http://192.168.0.150:8088/myro_api",
            outer_chat:"http://crm.hspcb.com:3000",
            inner_chat:"http://192.168.0.151:3000",
            stageType:0
        },
        jjhspcb:{
            outer_mrp:"http://jjcrm.hspcb.com:8089",
            inner_mrp:"http://192.168.88.10:8089",
            outer_crm:"http://jjcrm.hspcb.com:8088/myro_api",
            inner_crm:"http://192.168.88.10:8088/myro_api",
            outer_chat:"http://jjcrm.hspcb.com:3000",
            inner_chat:"http://192.168.88.10:3000",
            stageType:0
        },
        szmyrsky:{
            outer_mrp:"http://mrp6.myrsky.com.cn",
            inner_mrp:"http://192.168.0.5:80",
            outer_crm:"http://erp.myrsky.com.cn:8088/ERP/myro_api",
            inner_crm:"http://192.168.0.7:80/ERP/myro_api",
            outer_chat:"http://mrp6.myrsky.com.cn:3000",
            inner_chat:"http://192.168.0.5:3000",
            stageType:1
        }
    };
//	var DOWNLOAD_URL = "http://67.224.83.75:3000/"; //美国服务器

    function Route() {
        _self = this;

        _self.INNER_NET_TYPE = 0; //内网网络环境
        _self.OUTTER_NET_TYPE = 1; //外网网络环境

        _self.us = require("usersetting");
        _self.timeout = _self.us.getIntData(US_TIMEOUT)||DEFAILT_TIMEOUT;
        _self.netType = _self.INNER_NET_TYPE;
	}
    Route.prototype.setChatRoutes = function(url) {
        app.utils.isDevelopVersion()&&(url='http://192.168.211.7:3000');
        _self.chatUrl = url;
    };
    Route.prototype.setServerRoutes = function(url) {
        _self.loginUrl = url+"/android/signin/";
        _self.permissionUrl = url+"/maf/ANDROID_PERMISSION/";
        _self.orderlistUrl = url+"/maf/android_orderlist/";
        _self.orderlistParamDetailUrl = url+"/maf/ANDROID_ORDER_PARAM_DETAIL/";
        _self.orderlistScheduleDetailUrl = url+"/maf/ANDROID_ORDERSTATUSDETAIL/";
        _self.yesterdayReportUrl = url+"/maf/ANDROID_YESTERDAY_REPORT/";
        _self.produceReportUrl = url+"/maf/ANDROID_PRODUCEREPORT/";
        _self.produceReportDetailUrl = url+"/maf/ANDROID_PRODUCEREPORTDETAIL/";
        _self.produceReportDetailUrlEx = url+"/maf/ANDROID_PRODUCEREPORTDETAIL_EX/";
        _self.crmorderUrl = url+"/maf/ANDROID_CRM_ORDERRECEIVINGINFO/";
        _self.mrporderUrl = url+"/maf/ANDROID_ORDERRECEIVINGINFO/";
        _self.produceNoticeUrl = url+"/maf/ANDROID_NOTICE_TICKET/";
        _self.inoutReportUrl = url+"/maf/ANDROID_INOUTREPORT/";
        _self.stationDispatchUrl = url+"/maf/ANDROID_REPORT_STAGE/";
        _self.stationReportUrl = url+"/maf/ANDROID_STAGE_REPORT/";
        _self.produceReportExUrl = url+"/maf/ANDROID_PRODUCEREPORT_EX/";
        _self.stationCompUrl = url+"/maf/ANDROID_STATIONCOMP/";
        _self.stationCompSummaryUrl = url+"/maf/ANDROID_STATIONCOMPSUMMARY/";
        _self.stagePlanUrl = url+"/maf/ANDROID_STAGEPLAN/";
        _self.stagePlanComUrl = url+"/maf/ANDROID_STAGECOMP/";
        _self.sheetSituationUrl = url+"/maf/ANDROID_SHEETSITUATION/";
        //discard
        _self.getReadyForDisd = url+"/maf/GET_READY_FOR_DISD/";
        _self.getDefect = url+"/maf/GET_DEFECT/";
        _self.applyDisd = url+"/maf/APPLY_DISD/";
        _self.getDisd = url+"/maf/GET_DISD/";
        //stage_board
        _self.stageBoardUrl = url+ "/maf/STAGE_BOARD/";
		_self.stgNotifysUrl = url+ "/maf/ANDROID_STG_NOTIFY/";
    };
    Route.prototype.setCRMRoutes = function(url) {
        //crm common
        _self.crmTokenUrl = url+"/get_token.php";
        _self.crmUserInfoUrl = url+"/get_user_info.php";
        //ticket
        _self.crmTicketCommUrl = url+"/get_comm.php";
        _self.crmTicketPrivUrl = url+"/get_priv.php";
        _self.crmTicketListUrl = url+"/get_tk_list.php";
        _self.crmTicketItemUrl = url+"/get_tk.php";
        _self.crmTicketUpdateUrl = url+"/update_tk.php";
        _self.crmTicketIssueUrl = url+"/add_tk.php";
        _self.crmTicketReplyUrl = url+"/add_tk_reply.php";
        _self.crmTicketGetReplyUrl = url+"/get_tk_reply.php";
        _self.crmTicketHomeShowUrl = url+"/get_tk_homeshow.php";
        _self.crmTicketFileInfoUrl = url+"/get_tk_att.php";
        _self.crmTicketFileDownloadUrl = url+"/tk_att_download.php";
        _self.crmTicketAddFileUrl = url+"/add_tk_file.php";
        //meterail
        _self.crmGetPartInfo = url+"/get_part_info.php";
        _self.crmGetPartDetail = url+"/get_part_detail.php";
        _self.crmGetFactoryList = url+"/get_factory_list.php";
        _self.crmGetOrganizeInfo = url+"/get_orginaze_info.php";
        _self.crmGetOrganizeUserInfo = url+"/get_orginaze_user_info.php";
        _self.crmGetProcessList = url+"/get_process_list.php";
        _self.crmAddApplication = url+"/add_application.php";
        _self.crmGetApplicationInfo = url+"/get_application_info.php";
        _self.crmTakeOutApplication = url+"/take_out_application.php";
        _self.crmCheckApplication = url+"/check_application.php";
        //goodsStorage
        _self.crmGetItemWaitRecList = url+"/get_item_wait_rec_list.php";
        _self.crmItemCheckin = url+"/item_checkin.php";
        _self.crmGetBoxDepotList = url+"/get_box_depot_list.php";
        _self.crmGetItemStockList = url+"/get_item_stock_list.php";
        _self.crmGetBeConfig = url+"/get_be_config.php";
        //organize
        _self.crmGetManageUserInfo = url+"/get_manage_user_info.php";
		_self.crmGetOrnizationManageInfo = url+"/uri/user/get_organization_manage_info.php";
		_self.crmGetWorkLog = url+"/uri/ticket/get_worklog.php";
    };
    Route.prototype.setDownloadRoutes = function(url) {
        _self.modulesConfigUrl = url+"config";
        _self.modulesDownloadUrl = url+"modules/";
        _self.versionInfoUrl = url+"version";
        _self.androidDownloadUrl = url+"android/MRPClient.apk";
        _self.iosDownloadUrl = url+"ios/index.html";
        _self.desktopDownloadUrl = url+"desktop/desktop.zip";
        _self.wwwDownloadUrl = url+"www/www.zip";
    };
    //探针url需要单独设置
    Route.prototype.setProbeUrl = function(company) {
        _self.probeUrl = URLS[company].inner_mrp+"/download/probe";
    };
    Route.prototype.setUrls = function(company) {
        company = company || _self.company;
        var url = URLS[company];

        if (_self.netType == _self.INNER_NET_TYPE) {
            _self.setServerRoutes(url.inner_mrp);
            _self.setCRMRoutes(url.inner_crm);
            _self.setChatRoutes(url.inner_chat);
            _self.setDownloadRoutes(url.inner_mrp+"/download/");
        } else {
            _self.setServerRoutes(url.outer_mrp);
            _self.setCRMRoutes(url.outer_crm);
            _self.setChatRoutes(url.outer_chat);
            _self.setDownloadRoutes(url.outer_mrp+"/download/");
        }

        var stageType = localStorage.US_STAGE_TYPE;
        _self.stageType = (stageType==null)?url.stageType:stageType;
    };
    //设置web版本的地址
    Route.prototype.setWebUrls = function(origin) {
        var company = "";
        for (var com in URLS) {
            var server = URLS[com];
            if (origin == server.inner_chat) {
                company = com;
                _self.netType == _self.INNER_NET_TYPE;
                break;
            } else if  (origin == server.outer_chat){
                company = com;
                _self.netType == _self.OUTTER_NET_TYPE;
                break;
            }
        }
        _self.setUrls(company||'snow7');
    };
    Route.prototype.checkCompany = function(company) {
        for (var com in URLS) {
            if (com == company) {
                _self.setCompany(com);
                return true;
            }
        }
        return false;
    };
    Route.prototype.setCompany = function (company) {
        if (_self.company != company) {
            _self.company = company;
            navigator.utils.setLocalValue("US_COMPANY", company);
        }
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

