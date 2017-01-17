define(function(require) {
	"use strict";
    var _self;
    var stateTypes = ["prev_workstage_comp", "current_stage_recev", ""];
    var stateTypeNames = ["上工序完工", "已接收", "全部"];
    var filterNames = ["", "witem_name", "wdisp_name", "factory_self_no"];
    var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
    var MAX_PAGE_CACHE = 5;
    var PER_GET_PAGE_NUM = 5;

    function StationDispatch() {
        _self = this;
		_self.id = "stationDispatch";
    }

    StationDispatch.prototype.show = function(from) {
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
    StationDispatch.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getStationDispatch(0, PER_GET_PAGE_NUM);
        }

    };
    StationDispatch.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StationDispatch.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.loaded = false;
        _self.wdisp_list = null;
        _self.stage_info = null;
        _self.delivery = null;
        _self.searchInfo = null;
        _self.totalInfo = null;
        _self.from = null;
        _self.disdInfo = null;

        app.stationDispatchRecv&&app.stationDispatchRecv.release();
        app.stationDispatchComp&&app.stationDispatchComp.release();
        app.stationDispatchSearch&&app.stationDispatchSearch.release();
    };
    StationDispatch.prototype.refreshCurPage = function() {
        _self.dir = REFRESH_DIR;
        _self.getStationDispatch(_self.pageIndex, PER_GET_PAGE_NUM);
    };
    StationDispatch.prototype.refreshStationDispatch = function() {
        _self.wdisp_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        app.us.setIntData("STDS_SEARCH_STAGE", _self.searchInfo.stage);
        _self.getStationDispatch(0, PER_GET_PAGE_NUM);
    };
    //计算当前页的方法是total-tail
    //total = min(loaded+1, MAX_PAGE_CACHE)
    //tail = loaded+1-index
    //如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
    //如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
    StationDispatch.prototype.onCurPage = function(data) {
        var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        var curIndex = total-tail;
        for (var i=0; i<data.length; i++) {
            _self.wdisp_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
        }
        _self.showStationDispatch(_self.pageIndex);
    };
    StationDispatch.prototype.nextPage = function() {
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
            _self.showStationDispatch(curIndex);
            return;
        }
        _self.getStationDispatch(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    StationDispatch.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showStationDispatchWithNoData();
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
        _self.showStationDispatch(curIndex);
    };
    StationDispatch.prototype.prePage = function() {
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
            _self.showStationDispatch(curIndex);
            return;
        }
        _self.getStationDispatch(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    StationDispatch.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.wdisp_list = data.concat(_self.wdisp_list);
        _self.wdisp_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showStationDispatch(0);
    };
    StationDispatch.prototype.showFilterSearch = function() {
        require('stationDispatchSearch').show(_self);
    };
    StationDispatch.prototype.showStationDispatchWithNoData = function() {
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
        $('#stds_list').html(html);
    };
    StationDispatch.prototype.showStationDispatch = function(pageIndex) {
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            stageType = app.route.stageType,
            html = '';

        var wdisp_list =  _self.wdisp_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+wdisp_list.length<_self.totalInfo.count);

        html += DIVCH+RED(_self.stage_info[_self.searchInfo.stage])+'['+BLUE(stateTypeNames[_self.searchInfo.state])+']'+LC('派工单款数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+wdisp_list.length)+')'+DIVT;

        var delivery = _self.delivery;
        html += DIVCH;
        for (var key in delivery) {
            html += key+'小时('+delivery[key]+') ';
        }
        html += DIVT;

        for (var i=0, len=wdisp_list.length; i<len; i++) {
            var wdisp = wdisp_list[i];
            html += '<li>';
            html += DIVH+'板名称：'+GREEN(wdisp.witem_name)+DIVT;
            var priority = _self.getWshPriority(wdisp.priority, wdisp.wsh_timeend_required);
            html += DIVH+'状态：'+GREEN(wdisp.state)+'&nbsp;&nbsp;&nbsp;优先级：<sup>'+ RED(wdisp.priority)+'</sup><span class="worksheet_priority worksheet_priority_'+priority+'"></span>'+DIVT;
            html += DIVH+'计划数量：'+GREEN(wdisp.plan_qty)+'&nbsp;&nbsp;&nbsp;在制数量：'+GREEN(wdisp.wait_qty)+DIVT;
            html += DIVH+'未接收数量(最大)：'+GREEN(wdisp.no_comp_qty)+'('+RED(wdisp.max_qty)+')'+DIVT;
            html += DIVH+'订单号(本厂编号)：'+GREEN(wdisp.order_info)+DIVT;
            html += '<div style="margin-bottom: 6px;" id="stdm_list_'+wdisp.wdisp_id+'">';
            if (_self.disdInfo[wdisp.wdisp_id]==null) {
                html += '报废信息：<a class="icon magnifier text_green" onclick="app.stationDispatch.getDisdNum(\''+wdisp.wdisp_id+'\')"></a>';
            } else {
                html += _self.updateDisdNum(wdisp.wdisp_id, true);
            }
            html += DIVT;
            html += '</li>';

            var other_parameter = wdisp.other_parameter||"";
            other_parameter = other_parameter.replace(/\n/g, "<br />");
            html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \'stdm_other_params\')">其他参数</li>';
            html += '<li>';
            html += '<div id="stdm_other_params" style="display: none">'+PURPLE(other_parameter)+DIVT;

            if(wdisp.outsource == "1"){
                html += DIVH+'外发单:'+ GREEN(wdisp.outsource_name)+DIVT;
                html +=  app.utils.buttonHtml([
                    {text:'详细信息', click:'app.stationDispatch.getStationDispatchDetail('+wdisp.wdisp_id+')'}
                ]);
            } else {
                if (stageType == 0 || stageType == 2) {
                    var buttons = [
                        {text: '详细信息', click: 'app.stationDispatch.getStationDispatchDetail(' + wdisp.wdisp_id + ')'}
                    ];
                    if (wdisp.no_comp_qty>0||wdisp.wait_qty>0) {
                        buttons.push({text: '接收并完工', click: 'app.stationDispatch.getStationDispatchRecvComp(' + (pageIndex * PER_GET_PAGE_NUM + i) + ')'});
                    }
                    html += app.utils.buttonHtml(buttons);
                } else {
                    var buttons = [
                        {text: '详细信息', click: 'app.stationDispatch.getStationDispatchDetail(' + wdisp.wdisp_id + ')'}
                    ];
                    if (wdisp.no_comp_qty>0) { //未接收
                        buttons.push({text: '接收', click: 'app.stationDispatch.getStationDispatchRecv(' + wdisp.wdisp_id + ')'});
                    }
                    if (wdisp.wait_qty>0) { //在制
                        buttons.push({text: '完工', click: 'app.stationDispatch.getStationDispatchComp(' + wdisp.wdisp_id + ')'});
                    }
                    html += app.utils.buttonHtml(buttons);
                }
            }

            html += '</li>';
        }
        //console.log(html);
        $('#stds_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StationDispatch.prototype.getWshPriority = function(priority, end_time) {
        if(end_time && (new Date(end_time) < new Date())){
            priority = 0;
        }
        return priority;
    };
    StationDispatch.prototype.getStationDispatch = function(pageNum, num) {
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
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationDispatchSuccess
        });
    };
    StationDispatch.prototype.onGetStationDispatchSuccess = function(data) {
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
        if (_self.needUpateDispatchComp) {
            var callback = _self.needUpateDispatchComp;
            _self.needUpateDispatchComp = null;
            callback();
        }
    };
    StationDispatch.prototype.getStationDispatchDetail = function(wdisp_id) {
        var param = {
            wdisp_id: wdisp_id,
            op: 8,
            uid: app.login.userid
        };

        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationDispatchDetailSuccess
        });
    };
    StationDispatch.prototype.onGetStationDispatchDetailSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        require('stationDispatchDetail').show(data.databasic);
        app.utils.clearWait();
    };
    StationDispatch.prototype.getStationDispatchRecvComp = function(index) {
        var wdisp = _self.wdisp_list[index];
        var lot_no = wdisp.witem_name.substr(0, 4)+wdisp.wsh_name.substr(0, 4)+wdisp.lot_id;
        console.log(lot_no);
        var from = _self.from;
        require('passNumberDetail').show(null, lot_no, from);
    };
    StationDispatch.prototype.getStationDispatchRecv = function(wdisp_id) {
        var param = {
            wdisp_id: wdisp_id,
            op: 2,
            uid: app.login.userid
        }

        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationDispatchRecvSuccess
        });
    };
    StationDispatch.prototype.onGetStationDispatchRecvSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        data.recv_info.stage = _self.stage_info[_self.searchInfo.stage];
        require('stationDispatchRecv').show(data.recv_info, _self.id);
        app.utils.clearWait();
    };
    StationDispatch.prototype.getStationDispatchComp = function(wdisp_id) {
        var param = {
            wdisp_id: wdisp_id,
            op: 3,
            uid: app.login.userid
        }

        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationDispatchCompSuccess
        });
    };
    StationDispatch.prototype.onGetStationDispatchCompSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        data.comp_info.stage = _self.stage_info[_self.searchInfo.stage];
        require('stationDispatchComp').show(data.comp_info, _self.id);
        app.utils.clearWait();
    };
    StationDispatch.prototype.getDisdNum = function(wdisp_id) {
        if (_self.disdInfo[wdisp_id]!=null) {
            _self.updateDisdNum(wdisp_id);
            return;
        }
        _self.select_wdisp_id = wdisp_id;
        var param = {
            wdisp_id: wdisp_id,
            uid: app.login.userid
        }

        var url = app.route.getDisd+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetDisdNumSuccess
        });
    };
    StationDispatch.prototype.onGetDisdNumSuccess = function(data) {
        app.utils.clearWait();
        console.log(data);
        if (data.success==0) {
            app.utils.showError(app.error.SERVER_ERROR);
            return;
        }
        _self.disdInfo[_self.select_wdisp_id] = data.result;
        _self.updateDisdNum(_self.select_wdisp_id);
        _self.select_wdisp_id = null;
    };
    StationDispatch.prototype.updateDisdNum = function(wdisp_id, needReturn) {
        var PNL_COLOR = app.color.PNL_COLOR,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            PCS_COLOR = app.color.PCS_COLOR,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>';
        var html = '';
        var data = _self.disdInfo[wdisp_id];
        if (data) {
            var witemtotal = data.witemtotal;
            html += DIVH + '报废信息：' + DIVT;
            html += '<ul class="list inset">';
            for (var i in witemtotal) {
                var item = witemtotal[i];
                html += DIVH + LC(item[1]) + ': ' + PNL_COLOR(item[0]) + RED('PNL') + DIVT;
            }
            var order = data.order;
            for (var i in order) {
                var item = order[i];
                html += DIVH + LC(item[2]) + ': ' + PCS_COLOR(item[0]) + RED('PCS') + DIVT;
            }
            html += '</ul>';
        }
        if (!needReturn) {
            $('#stdm_list_'+wdisp_id).html(html);
        }
        return html;
    };
    return new StationDispatch();
});
