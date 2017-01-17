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
            //resource
            resource: "resource/resource",
            //pages
			uiMessage: "pages/uiMessage",
			uiContact: "pages/uiContact",
			uiWork: "pages/uiWork",
			uiMore: "pages/uiMore",
            uiRelevant: "pages/uiRelevant",
            uiAllWork: "pages/uiAllWork",
            workNotify: "pages/workNotify",
            //config
			error: "_config/errorConfig",
			route: "_config/routeConfig",
			extend: "_config/extendConfig",
			workPanelConfig: "_config/workPanelConfig",
			morePanelConfig: "_config/morePanelConfig",
            crmRequestConfig: "_config/crmRequestConfig",
            //style
            menuIcons: "_style/menuIcons",
            mystyle: "_style/style",
            screen: "_style/screen",
            color: "_style/color",
            //login
            prepare: "_login/prepare",
            login: "_login/login",
            //more
            personalInfo: "_more/personalInfo",
            setting: "_more/setting",
            about: "_more/about",
            help: "_more/help",
            update: "_more/update",
            //chat
            socketMgr: '_chat/socketMgr/socketMgr',
            chatRouter: '_chat/socketMgr/router',
            onlineUserMgr: '_chat/userMgr/onlineUserMgr',
            userMgr: '_chat/userMgr/userMgr',
            notifyMgr: '_chat/userMgr/notifyMgr',
            messageMgr: '_chat/messageMgr/messageMgr',
            groupMgr: '_chat/groupMgr/groupMgr',
            callMgr: '_chat/callMgr/callMgr',
            //contact
            contactInfo: '_contact/contactInfo',
            selectMultiUsers: '_contact/selectMultiUsers',
            //group
            groupList: '_group/groupList',
            createGroup: '_group/createGroup',
            searchGroup: '_group/searchGroup',
            searchGroupList: '_group/searchGroupList',
            groupDetail: '_group/groupDetail',
            selectGroupUser: '_group/selectGroupUser',
            //message
            messageInfo: '_message/messageInfo',
            sendMultiMessage: '_message/sendMultiMessage',
            //call
            videoCall: '_call/videoCall',
            audioCall: '_call/audioCall',
            //common
            selectPerson: "_common/selectPerson",
			selectPersonByDisp: "_common/selectPersonByDisp",
            selectGroup: "_common/selectGroup",
            imageDisplay: "_common/imageDisplay",
            //orderlist
			orderlist: "_orderlist/orderlist",
			scheduleDetail: "_orderlist/scheduleDetail",
			paramDetail: "_orderlist/paramDetail",
            //yesterdayReport
			yesterdayReport: "_yesterdayReport/yesterdayReport",
            //ticket
			ticket: "_ticket/ticket",
			ticketDetail: "_ticket/ticketDetail",
            ticketSearch: "_ticket/ticketSearch",
			ticketIssue: "_ticket/ticketIssue",
            //passNumber
			passNumber: "_passNumber/passNumber",
			passNumberDetail: "_passNumber/passNumberDetail",
			passNumberDetailEx: "_passNumber/passNumberDetailEx",
            passNumberRecv: "_passNumber/passNumberRecv",
            passNumberComp: "_passNumber/passNumberComp",
            //produceReport
            produceReport: "_produceReport/produceReport",
            produceReportDetail: "_produceReport/produceReportDetail",
            produceReportDetailEx: "_produceReport/produceReportDetailEx",
            produceReportVisibleStage: "_produceReport/produceReportVisibleStage",
            //crmorder
            crmorder: "_crmorder/crmorder",
            //mrporder
            mrporder: "_mrporder/mrporder",
            //produceNotice
            produceNotice: "_produceNotice/produceNotice",
            produceNoticeItem: "_produceNotice/produceNoticeItem",
            produceNoticeDetail: "_produceNotice/produceNoticeDetail",
            //inoutReport
            inoutReport: "_inoutReport/inoutReport",
            inoutReportDetail: "_inoutReport/inoutReportDetail",
            //stationDispatch
            stationDispatch: "_stationDispatch/stationDispatch",
            stationDispatchDetail: "_stationDispatch/stationDispatchDetail",
            stationDispatchRecv: "_stationDispatch/stationDispatchRecv",
            stationDispatchComp: "_stationDispatch/stationDispatchComp",
            stationDispatchRework: "_stationDispatch/stationDispatchRework",
            stationDispatchSearch: "_stationDispatch/stationDispatchSearch",
            stationDispatchDisd: "_stationDispatch/stationDispatchDisd",
            //stationReport
            stationReport: "_stationReport/stationReport",
            stationReportDetail: "_stationReport/stationReportDetail",
            //witemDispatch
            witemDispatch: "_witemDispatch/witemDispatch",
            witemDispatchDetail: "_witemDispatch/witemDispatchDetail",
            //produceReportEx
            produceReportEx:"_produceReportEx/produceReportEx",
            produceReportExVisibleStage: "_produceReportEx/produceReportExVisibleStage",
            //stationComp
            stationComp:"_stationComp/stationComp",
            stationCompSearch: "_stationComp/stationCompSearch",
            //stationCompSummary
            stationCompSummary:"_stationCompSummary/stationCompSummary",
            stationCompSummarySearch: "_stationCompSummary/stationCompSummarySearch",
            stationCompDetail: "_stationCompSummary/stationCompDetail",
            stationCompDetailSearch: "_stationCompSummary/stationCompDetailSearch",
            batchListInfo: "_stationCompSummary/batchListInfo",
            //stagePlan
            stagePlan:"_stagePlan/stagePlan",
            //stageBoard
            stageBoard: "_stageBoard/stageBoard",
            stageBoardDetail: "_stageBoard/stageBoardDetail",
            stageBoardSearch: "_stageBoard/stageBoardSearch",
			stageNotifyList: "_stageBoard/stageNotifyList",
            stageNotifyListDetail: "_stageBoard/stageNotifyListDetail",
			stageNotifyListSearch: "_stageBoard/stageNotifyListSearch",
			stageNotifyAddNew: "_stageBoard/stageNotifyAddNew",
            //stagePlanComp
            stagePlanComp:"_stagePlanComp/stagePlanComp",
            stagePlanCompAddTask:"_stagePlanComp/stagePlanCompAddTask",
            stagePlanCompOtherTask:"_stagePlanComp/stagePlanCompOtherTask",
            stagePlanCompSumup:"_stagePlanComp/stagePlanCompSumup",
            stagePlanCompSumupDetail:"_stagePlanComp/stagePlanCompSumupDetail",
            stagePlanCompSumupHistory:"_stagePlanComp/stagePlanCompSumupHistory",
            stagePlanCompSumupHistorySearch:"_stagePlanComp/stagePlanCompSumupHistorySearch",
            //sheetSituation
            sheetSituationSearch:"_sheetSituation/sheetSituationSearch",
            sheetSituation:"_sheetSituation/sheetSituation",
            wsheetDetail:"_sheetSituation/wsheetDetail",
            //materialRequisition
            materialMain:"_materialRequisition/materialMain",
            materialRequisition:"_materialRequisition/materialRequisition",
            materialSubmit:"_materialRequisition/materialSubmit",
            materialSearch:"_materialRequisition/materialSearch",
            factoryList:"_materialRequisition/factoryList",
            factoryDetail:"_materialRequisition/factoryDetail",
            otherInfo:"_materialRequisition/otherInfo",
            materialList:"_materialRequisition/materialList",
            materialListSearch:"_materialRequisition/materialListSearch",
            materialListDetail:"_materialRequisition/materialListDetail",
            materialInvestigate:"_materialRequisition/materialInvestigate",
            partDetail:"_materialRequisition/partDetail",
            //goodsStorage
            goodsMain: "_goodsStorage/goodsMain",
            goodsStorage: "_goodsStorage/goodsStorage",
            goodsSearch: "_goodsStorage/goodsSearch",
            goodsStorageDetail: "_goodsStorage/goodsStorageDetail",
            goodsStorageList: "_goodsStorage/goodsStorageList",
            goodsListSearch: "_goodsStorage/goodsListSearch",
            goodsStorageListDetail: "_goodsStorage/goodsStorageListDetail",
            goodsTake: "_goodsStorage/goodsTake",
            goodsTakeOtherInfo: "_goodsStorage/goodsTakeOtherInfo",
            goodsStorageResult: "_goodsStorage/goodsStorageResult",
            //test
            test: "_test/test"
        }
    },
	paths: {
        _config: "modules/config",
        _style: "modules/style",
        _login: "modules/login",
        _more: "modules/more",
        _chat: "modules/chat",
        _contact: "modules/contact",
        _group: "modules/group",
        _message: "modules/message",
        _call: "modules/call",
        _common: "modules/common",
        _orderlist: "modules/orderlist",
        _yesterdayReport: "modules/yesterdayReport",
        _ticket: "modules/ticket",
        _passNumber: "modules/passNumber",
        _produceReport: "modules/produceReport",
        _crmorder: "modules/crmorder",
        _mrporder: "modules/mrporder",
        _produceNotice: "modules/produceNotice",
        _inoutReport: "modules/inoutReport",
        _stationDispatch: "modules/stationDispatch",
        _stationReport: "modules/stationReport",
        _witemDispatch: "modules/witemDispatch",
        _produceReportEx: "modules/produceReportEx",
        _stationComp: "modules/stationComp",
        _stationCompSummary: "modules/stationCompSummary",
        _stagePlan: "modules/stagePlan",
        _stageBoard: "modules/stageBoard",
        _stagePlanComp: "modules/stagePlanComp",
        _sheetSituation: "modules/sheetSituation",
        _materialRequisition: "modules/materialRequisition",
        _goodsStorage: "modules/goodsStorage",
        _test: "modules/test"
	}
});
