define(function(require) {
	"use strict";
    var _self;
    var DEC_DIR = 0, INC_DIR = 1;
    var MAX_PAGE_CACHE = 5;
    var PER_GET_PAGE_NUM = 50;
    var SHOW_WITEM_NAME = 0;
    var SHOW_FACTORY_SELF_NO = 1;
    var TYPES = ["2", "1", "3", "all"];
    var stateTypeNames = ["计划", "完工", "暂停", "全部"];

    function StationReport() {
        _self = this;
		_self.id = "stationReport";
        _self.showType = SHOW_WITEM_NAME;
    }

    StationReport.prototype.show = function() {
        _self.searchInfo = {type:0, stage_meta_id:app.us.getIntData("STRP_SEARCH_STAGE")||1};
        _self.wdisp_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        _self.protityOrderClass = 'down';

        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    StationReport.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getStationReport(0, PER_GET_PAGE_NUM);
        }
    };
    StationReport.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StationReport.prototype.release = function() {
        _self.wdisp_list = null;
        _self.totalInfo = null;
        _self.searchInfo = null;
        _self.showData = null;
        _self.loaded = false;
        app.stationReportDetail&&app.stationReportDetail.release();
    };
    StationReport.prototype.refreshStationReport = function() {
        _self.wdisp_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        app.us.setIntData("STRP_SEARCH_STAGE", _self.searchInfo.stage_meta_id);
        _self.getStationReport(0, PER_GET_PAGE_NUM);
    };
    StationReport.prototype.doSearch = function() {
        var html = '';
        html += '<table  width="100%" style="font: inherit;">';
        html += '<tr><td width="30%">工位：</td><td width="70%">';
        html += '<select id="strp_search_stages">';
        var stages = _self.totalInfo.stage_info;
        var si =  _self.searchInfo||{};
        for (var stage_id in stages) {
            var select = (stage_id==si.stage_meta_id)?'selected="selected"':'';
            html += '<option value="'+stage_id+'" '+select+'>'+stages[stage_id]+'</option>';
        }

        html += '</select>';
        html += '</td></tr>';
        html += '<tr><td>状态:</td><td>';
        html += '<select id="strp_search_types">';
        for (var i in stateTypeNames) {
            var select = (i==si.type)?'selected="selected"':'';
            html += '<option value="'+i+'" '+select+'>'+stateTypeNames[i]+'</option>';
        }
        html += '</select>';
        html += '</td></tr>';
        html += '</table>';
        //console.log(html);

        app.utils.popup({
            title: "查询",
            message: html,
            cancelText: "取消",
            cancelCallback: function () {
            },
            doneText: "查询",
            doneCallback: function () {
                _self.release();
                _self.searchInfo = {};
                _self.searchInfo.type = $("#strp_search_types").val();
                _self.searchInfo.stage_meta_id = $("#strp_search_stages").val();
                _self.refreshStationReport();
            },
            addCssClass: 'wide'
        });
    };
    StationReport.prototype.nextPage = function() {
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
            _self.showStationReport(curIndex);
            return;
        }
        _self.getStationReport(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    StationReport.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showStationReportWithNoData();
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
        _self.showStationReport(curIndex);
    };
    StationReport.prototype.prePage = function() {
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
            _self.showStationReport(curIndex);
            return;
        }
        _self.getStationReport(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    StationReport.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.wdisp_list = data.concat(_self.wdisp_list);
        _self.wdisp_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showStationReport(0);
    };
    StationReport.prototype.showStationReportWithNoData = function() {
        var BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        _self.scroller.downRefresh = false;
        _self.scroller.upRefresh = false;
        html += DIVCH+RED(_self.totalInfo.stage_info[_self.searchInfo.stage_meta_id])+'['+BLUE(stateTypeNames[_self.searchInfo.type])+']'+LC('加工单款数:')+GREEN(_self.totalInfo.wsh_totalcount)+'('+0+'-'+0+')'+DIVT;
        html += DIVCH+LC('总面积:')+GREEN(_self.totalInfo.total_area)+DIVT;

        $('#strp_list').html(html);
    };
    StationReport.prototype.showStationReport = function(pageIndex) {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="6%"',
            WD1 = 'width="40%"',
            WD2 = 'width="20%"',
            WD3 = 'width="14%"',
            WD4 = 'width="20%"',
            html = '',
            data;
        if (pageIndex == -1) {
            data = _self.showData;
        } else {
            data = _self.wdisp_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
            _self.showData = data
        }
        if (_self.protityOrderClass == "down") {
            data.sort(function (a, b) {
                return (a.priority<b.priority)?1:(a.priority==b.priority)?(_self.showType == SHOW_WITEM_NAME? a.witem_name.localeCompare(b.witem_name):a.factory_self_no.localeCompare(b.factory_self_no)):-1;
            });
        } else {
            data.sort(function (a, b) {
                return (a.priority>b.priority)?1:(a.priority==b.priority)?(_self.showType == SHOW_WITEM_NAME? a.witem_name.localeCompare(b.witem_name):a.factory_self_no.localeCompare(b.factory_self_no)):-1;
            });
        }
        console.log(data);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data.length<_self.totalInfo.wdisp_totalcount);

        html += DIVCH+RED(_self.totalInfo.stage_info[_self.searchInfo.stage_meta_id])+'['+BLUE(stateTypeNames[_self.searchInfo.type])+']'+LC('加工单款数:')+GREEN(_self.totalInfo.wsh_totalcount)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data.length)+')'+DIVT;

        html += DIVCH+LC('总面积:')+GREEN(_self.totalInfo.total_area)+DIVT;

        var th1, th2;
        if (_self.showType == SHOW_WITEM_NAME) {
            th1 = "板名称";th2 = "面积";
        } else {
            th1 = "本厂编号";th2 = "数量";
        }

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+' class="icon pencil" onclick="app.stationReport.changeShowType()">'+th1+'</th><th '+WD2+'>'+th2+'</th><th '+WD3+' class="icon '+_self.protityOrderClass+'" onclick="app.stationReport.changeProtityOrder()">'+'优先级</th><th '+WD4+'>'+'状态</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" onclick="app.stationReport.showDetail('+i+')">';
            html += '<td '+WD0+'>' + RED(i+startIndex) + '</td>';
            var outsource = (item.wsheet_outsource)?RED('(外)'):'';
            if (_self.showType == SHOW_WITEM_NAME) {
                html += '<td '+WD1+'>' + CC(item.witem_name)+outsource+ '</td>';
                html += '<td '+WD2+'>' + CC(item.pro_area) + '</td>';
            } else {
                html += '<td '+WD1+'>' +CC(item.factory_self_no)+outsource+'</td>';
                html += '<td '+WD2+'>' +CC(item.qty)+'</td>';
            }
            html += '<td '+WD3+'>' +'<sup>'+ RED((item.priority>=10?item.priority-10:item.priority))+'</sup><span class="worksheet_priority_small worksheet_priority_'+(item.priority>=10?0:item.priority)+'"></span>'+'</td>';
            html += '<td '+WD4+'>' + CC(item.state)+'<span class="icon right" style="float:right;"><span></td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#strp_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StationReport.prototype.getWshPriority = function(priority, end_time) {
        if(end_time && (new Date(end_time) < new Date())){
            priority += 10;
        }
        return priority;
    };
    StationReport.prototype.changeShowType = function() {
        if (_self.showType == SHOW_WITEM_NAME) {
            _self.showType = SHOW_FACTORY_SELF_NO;
        } else {
            _self.showType = SHOW_WITEM_NAME;
        }
        _self.showStationReport(-1);
    };
    StationReport.prototype.changeProtityOrder = function() {
        if (_self.protityOrderClass == 'down') {
            _self.protityOrderClass = 'up';
        } else {
            _self.protityOrderClass = 'down';
        }
        _self.showStationReport(-1);
    };
    StationReport.prototype.showDetail = function(index) {
        var stage_name = _self.totalInfo.stage_info[_self.searchInfo.stage_meta_id];
        if( _self.searchInfo.stage_meta_id == "all"){
            require('stationReportDetail').show(_self.showData[index], _self.searchInfo.type, _self.showData[index].wstmeta_id, stage_name);
        }else{
            require('stationReportDetail').show(_self.showData[index], _self.searchInfo.type, _self.searchInfo.stage_meta_id, stage_name);
        }
    };
    StationReport.prototype.getStationReport = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var param = {
            uid: app.login.userid,
            start:start,
            limit:num,
            type:TYPES[_self.searchInfo.type],
            stage_meta_id:_self.searchInfo.stage_meta_id
        };
        if (_self.maxPageIndex == -1) {
            param.is_first = 1;
        }
        var url = app.route.stationReportUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationReportSuccess,
            error : _self.onGetStationReportError
        });
    };
    StationReport.prototype.onGetStationReportSuccess = function(data) {
        console.log(data);
        var info =  data.info;
        if (_self.maxPageIndex == -1) {
            _self.totalInfo = {};
            _self.totalInfo.stage_info = data.stage_info;
            _self.totalInfo.total_area = info.total_area;
            _self.totalInfo.wsh_totalcount = info.wsh_totalcount;
            _self.totalInfo.wdisp_totalcount = info.wdisp_totalcount;
            _self.maxPageIndex = Math.floor((info.wdisp_totalcount-1)/PER_GET_PAGE_NUM);
        }
        app.utils.clearWait();
        var wdisp_list = info.wdisp_list;
        if (!wdisp_list) {
            _self.showStationReportWithNoData();
            return;
        }
        for (var i= 0,len=wdisp_list.length; i<len; i++) {
            var item = wdisp_list[i];
            item.priority = _self.getWshPriority(item.priority*1, item.wsheet_timeend_required);
        }

        if (_self.dir == DEC_DIR) {
            _self.onPrePage(info.wdisp_list);
        } else {
            _self.onNextPage(info.wdisp_list);
        }
    };
    StationReport.prototype.onGetStationReportError = function(data, type) {
        if (_self.pageIndex == -1) {
            _self.release();
            $.ui.goBack();
        }
    };

    return new StationReport();
});
