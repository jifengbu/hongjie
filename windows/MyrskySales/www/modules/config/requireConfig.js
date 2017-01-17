//LOCAL是本地模块，一些稳定的模块使用LOCAL，不再需要从服务器获取模块
//如果需要更新该模块，但是不更新apk，可以将LOCAL改为SERVER，并在服务器端配置需要更新的模块
var SERVER =  _external+"modules/",
    LOCAL = _root+"modules/";
requirejs.config({
	baseUrl: ".",
	map: {
		"*": {
            //thirdparty
			css: "thirdparty/requirejs/css",
			less: "thirdparty/requirejs/less/less",
			order: "thirdparty/requirejs/order",
			//app
			app: "app",
            //utils
			utils: "utils/utils",
			fs: "utils/fs",
			usersetting: "utils/userSetting",
            //pages
			uiHome: "pages/uiHome",
			uiOrder: "pages/uiOrder",
            uiService: "pages/uiService",
            uiMore: "pages/uiMore",
            uiIframe: "pages/uiIframe",
            //config
			error: "_config/errorConfig",
			route: "_config/routeConfig",
			extend: "_config/extendConfig",
			orderPanelConfig: "_config/orderPanelConfig",
            servicePanelConfig: "_config/servicePanelConfig",
			morePanelConfig: "_config/morePanelConfig",
            crmRequestConfig: "_config/crmRequestConfig",
            //style
            menuIcons: "_style/menuIcons",
            mystyle: "_style/style",
            //android only depend _external
            screen: ((_os=="android")?_external+"modules/style/screen":"_style/screen"),
            color: "_style/color",
            //login
            login: "_login/login",
            //more
            personalInfo: "_more/personalInfo",
            setting: "_more/setting",
            about: "_more/about",
            help: "_more/help",
            update: "_more/update",
            //orderlist
            orderlist: "_orderlist/orderlist",
            orderDetail: "_orderlist/orderDetail",
            orderSchedule: "_orderlist/orderSchedule",
            billDetail: "_orderlist/billDetail",
            //ticket
            ticket: "_ticket/ticket",
            ticketDetail: "_ticket/ticketDetail",
            ticketIssue: "_ticket/ticketIssue",
            ticketReply: "_ticket/ticketReply",
            ticketFollowTicket: "_ticket/ticketFollowTicket",
            ticketVisiblePerson: "_ticket/ticketVisiblePerson",
            ticketVisibleGroup: "_ticket/ticketVisibleGroup",
            //test
            test: "_test/test"
		}
    },
	paths: {
        _config: LOCAL+"config",
        _style: LOCAL+"style",
        _login: LOCAL+"login",
        _more: LOCAL+"more",
        _orderlist: LOCAL+"orderlist",
        _ticket: LOCAL+"ticket",
        _test: LOCAL+"test"
	}
});
