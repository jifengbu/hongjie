define(function(require) {
    "use strict";
    var _self;
    var stateTypes = ["prev_workstage_comp", "prev_stage_recev", "urgent_work_sheet", ""];
    var stateTypeNames = ["上工序完工", "将到加工单", "加急单", "全部"];
    var filterNames = ["", "witem_name", "wdisp_name", "factory_self_no"];
    var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
    var MAX_PAGE_CACHE = 5;
    var PER_GET_PAGE_NUM = 30;

    function StageBoard() {
        _self = this;
        _self.id = "stageBoard";
    }

    StageBoard.prototype.show = function(from) {
        _self.from = from;
        if (!from) {
            _self.searchInfo = {
                stage:app.us.getIntData("STDS_SEARCH_STAGE")||1,
                state:0,
                filter:0
            };
        }
        _self.wdisp_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;

        _self.disdInfo = {};
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
		
    };
    StageBoard.prototype.onLoad = function() {
        app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getStageBoard(0, PER_GET_PAGE_NUM);
        }
		
    };
    StageBoard.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StageBoard.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.loaded = false;
        _self.wdisp_list = null;
        _self.stage_info = null;
        _self.delivery = null;
        _self.searchInfo = null;
        _self.totalInfo = null;
        _self.from = null;
        _self.disdInfo = null;

        _self.showData = null;
        app.stageBoardSearch&&app.stageBoardSearch.release();
        app.stageBoardDetail&&app.stageBoardDetail.release();
    };
    StageBoard.prototype.refreshCurPage = function() {
        _self.dir = REFRESH_DIR;
        _self.getStageBoard(_self.pageIndex, PER_GET_PAGE_NUM);
    };
    StageBoard.prototype.refreshStageBoard = function() {
        _self.wdisp_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        app.us.setIntData("STDS_SEARCH_STAGE", _self.searchInfo.stage);
        _self.getStageBoard(0, PER_GET_PAGE_NUM);
    };
    //计算当前页的方法是total-tail
    //total = min(loaded+1, MAX_PAGE_CACHE)
    //tail = loaded+1-index
    //如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
    //如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
    StageBoard.prototype.onCurPage = function(data) {
        var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        var curIndex = total-tail;
        for (var i=0; i<data.length; i++) {
            _self.wdisp_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
        }
        _self.showStageBoard(_self.pageIndex);
    };
    StageBoard.prototype.nextPage = function() {
        if (_self.pageIndex == -1) {
            app.utils.toast("没有更多的数据了");
            return;
        }
        if (_self.pageIndex == _self.maxPageIndex) {
            app.utils.toast("已经是最后一页了");
            return;
        }
        _self.dir = INC_DIR;
        if (_self.pageIndex < _self.loadedPageIndex) {
            _self.pageIndex++;
            var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
            var tail = _self.loadedPageIndex+1-_self.pageIndex;
            var curIndex = total-tail;
            _self.showStageBoard(curIndex);
            return;
        }
        _self.getStageBoard(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    StageBoard.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showStageBoardWithNoData();
            } else {
                _self.maxPageIndex = _self.pageIndex;
                app.utils.toast("已经是最后一页了");
            }
            return;
        }
        _self.pageIndex++;
        if (data.length < PER_GET_PAGE_NUM) {
            _self.maxPageIndex = _self.pageIndex;
        }

        _self.wdisp_list = _self.wdisp_list.concat(data);
        _self.loadedPageIndex = _self.pageIndex;
        if (_self.loadedPageIndex >= MAX_PAGE_CACHE) {
            _self.wdisp_list  = _self.wdisp_list.slice(PER_GET_PAGE_NUM);
        }
        var curIndex = Math.min(_self.loadedPageIndex, MAX_PAGE_CACHE-1);
        _self.showStageBoard(curIndex);
    };
    StageBoard.prototype.prePage = function() {
        if (_self.pageIndex == -1) {
            app.utils.toast("没有更多的数据了");
            return;
        }
        if (_self.pageIndex == 0) {
            app.utils.toast("已经是第一页了");
            return;
        }
        _self.dir = DEC_DIR;
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        if (MAX_PAGE_CACHE > tail) {
            _self.pageIndex--;
            var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
            tail = _self.loadedPageIndex+1-_self.pageIndex;
            var curIndex = total-tail;
            _self.showStageBoard(curIndex);
            return;
        }
        _self.getStageBoard(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    StageBoard.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.wdisp_list = data.concat(_self.wdisp_list);
        _self.wdisp_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showStageBoard(0);
    };
    StageBoard.prototype.showFilterSearch = function() {
        require('stageBoardSearch').show(_self);
    };
	StageBoard.prototype.showNotifyList = function(type,name) {
		var stg = app.us.getIntData("STDS_SEARCH_STAGE")||1;
        require('stageNotifyList').show(_self,'',stg,true,name);
    };
    StageBoard.prototype.showStageBoardWithNoData = function() {
        var BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        _self.scroller.downRefresh = false;
        _self.scroller.upRefresh = false;
        html += DIVCH+RED(_self.stage_info[_self.searchInfo.stage])+'['+BLUE(stateTypeNames[_self.searchInfo.state])+']'+LC('派工单款数:')+GREEN(_self.totalInfo.count)+'('+0+'-'+0+')';

        var delivery = _self.delivery;
        html += DIVCH;
        for (var key in delivery) {
            html += key+'小时('+delivery[key]+') ';
        }
        html += DIVT;
        $('#stbd_list').html(html);
    };
    StageBoard.prototype.showStageBoard = function(pageIndex) {
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 5px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="30%"',
            WD2 = 'width="10%"',
            WD3 = 'width="15%"',
            WD4 = 'width="40%"',
            html = '';

        var info_list = _self.wdisp_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
        _self.showData = info_list;

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+info_list.length<_self.totalInfo.count);

        html += DIVCH+RED(_self.stage_info[_self.searchInfo.stage])+'['+BLUE(stateTypeNames[_self.searchInfo.state])+']'+LC('派工单款数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+info_list.length)+')'+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+'>板名称</th><th '+WD2+'>数量</th><th '+WD3+'>状态</th><th '+WD4+'>'+'备注</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;

        var len=info_list.length;
        for (var i=0, len=info_list.length; i<len; i++) {
            var item = info_list[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'; height:2em" onclick="app.stageBoard.showDetail('+i+')">';
            html += '<td '+WD0+'>' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'>' + CC(item.witem_name) + '</td>';
            html += '<td '+WD2+'>' +RED(item.wait_qty)+'/'+GREEN(item.no_comp_qty) + '</td>';
            html += '<td '+WD3+'>' + CC(item.state)+'</td>';
            html += '<td '+WD4+'>' + CC(item.note) + '</td>';
            html += '</tr>';
        }
        html += '</table>';

        //console.log(html);
        $('#stbd_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StageBoard.prototype.getWshPriority = function(priority, end_time) {
        if(end_time && (new Date(end_time) < new Date())){
            priority = 0;
        }
        return priority;
    };
    StageBoard.prototype.getStageBoard = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var param = {
            start: start,
            limit: num,
            op: 1,
            delivery: true,
            stage_meta_id: _self.searchInfo.stage,
            selection: stateTypes[_self.searchInfo.state],
            uid: app.login.userid
        };
        if (_self.maxPageIndex == -1) {
            param.is_first = 1;
        }
        if (_self.searchInfo.filter) {
            param[filterNames[_self.searchInfo.filter]] = _self.searchInfo.filter_value;
        }

        console.log(param);
        var url = app.route.stageBoardUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStageBoardSuccess
        });
    };
    StageBoard.prototype.onGetStageBoardSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        if (_self.maxPageIndex == -1) {
            _self.delivery = data.delivery;
            _self.stage_info = data.stage_info;
            _self.totalInfo = {};
            _self.totalInfo.count = data.count;
            _self.maxPageIndex = Math.floor((data.count-1)/PER_GET_PAGE_NUM);
        }
        if (_self.dir == DEC_DIR) {
            _self.onPrePage(data.wdisp_list);
        } else if (_self.dir == INC_DIR) {
            _self.onNextPage(data.wdisp_list);
        } else {
            _self.onCurPage(data.wdisp_list);
        }
        app.utils.clearWait();
		_self.getNotifyFirst(true);
    };
    StageBoard.prototype.showDetail = function(index) {
        require('stageBoardDetail').show(_self.showData[index]);
    };
	StageBoard.prototype.getNotifyFirst = function(notshowload) {
        var param = {
            uid: app.login.userid,
            oper: 'first',
			stg:_self.searchInfo.stage
        };
        var url = app.route.stgNotifysUrl+'?'+$.param(param);
		console.log("StageBoard======onGetNotifyFirstSuccess",url);
        console.log(url);
		if(!notshowload){
			app.utils.setWait("请稍后...");
		}
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetNotifyFirstSuccess
        });
    };
    StageBoard.prototype.onGetNotifyFirstSuccess = function(data) {//todo 取第一条和未读数
        console.log("StageBoard======onGetNotifyFirstSuccess",data);
		if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        app.utils.clearWait();
        //app.login.isManage = (data==1);
		var stbd_leader_first = data.first.leader.msg;
		var stbd_prod_first = data.first.prod.msg
		var stbd_admin_notice_first = data.first.admin_notice.msg
		//if(app.login.isManage){
		var ul = "<ul class='list' id='stbd_notify_list' >";
		var notify_btn = '';
		var totals = 0;
		if(data.first.leader.num>0){
			notify_btn += 	"<li><a style='background-color:#8C9EB5' href='#' onclick=\"app.stageBoard.showNotifyList('leader','组长提醒')\">"+
				"<div id='stbd_leader_num' class='icon message'>组长提醒</div>"+
				"<div id='stbd_leader_first' class='marquee' data-marquee='"+stbd_leader_first+"'></div>"+
				"</a>"+
				"</li>";
			console.log(data.first.leader.num);	
				
			totals++;
		}	
		if(data.first.prod.num>0){
			notify_btn += 	"<li><a  style='background-color:#5B5B5B;color:white' href='#' onclick=\"app.stageBoard.showNotifyList('prod','上下生产提醒')\">"+
				"<div id='stbd_prod_num' class='icon message'>上下生产提醒</div>"+
				"<div id='stbd_prod_first' class='marquee' data-marquee='"+stbd_prod_first+"'></div>"+
				"</a>"+
				"</li>";
				
			totals++;
		}	
		if(data.first.admin_notice.num>0){
			notify_btn += 	"<li><a style='background-color:#33B5E5' href='#' onclick=\"app.stageBoard.showNotifyList('admin_notice','行政通知')\">"+
				"<div id='stbd_admin_notice_num' class='icon message'>行政通知</div>"+
				"<div id='stbd_admin_notice_first' class='marquee' data-marquee='"+stbd_admin_notice_first+"'></div>"+
				"</a>"+
				"</li>";
			
			totals++;
		}
		var ul_end = "</ul>";	
		if(totals>0){
			notify_btn = ul+notify_btn+ul_end;	
		}
		else{
			notify_btn = '';		
		}			
		$("#stbd_notify_list_div").html(notify_btn);
		if(totals>0){
			if(data.first.leader.num>0){
				$.ui.updateBadge('#stbd_leader_num',data.first.leader.num, "tr", 'red');
			}
			if(data.first.prod.num>0){
				$.ui.updateBadge('#stbd_prod_num',data.first.prod.num, "tr", 'red');
			}
			if(data.first.admin_notice.num>0){
				$.ui.updateBadge('#stbd_admin_notice_num',data.first.admin_notice.num, "tr", 'red');
			}
		}			
		//}						
    };
    return new StageBoard();
});
