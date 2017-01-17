/**
 * Created by panyun on 2015/1/12.
 */
define(function(require) {
	"use strict";
    var _self;
    var DEC_DIR = 0, INC_DIR = 1;
    var MAX_PAGE_CACHE = 20;
    var PER_GET_PAGE_NUM = 40;

    function StationCompDetail() {
        _self = this;
        _self.id = "stationCompDetail";
    }

    StationCompDetail.prototype.show = function(searchInfo) {
        _self.info_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.searchInfo = searchInfo;
        _self.dir = INC_DIR;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    StationCompDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getStationCompDetail(0, PER_GET_PAGE_NUM);
        }
    };
    StationCompDetail.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StationCompDetail.prototype.release = function() {
        _self.info_list = null;
        _self.searchInfo = null;
        _self.totalInfo = null;
        _self.showData = null;
        _self.loaded = false;
    };
    StationCompDetail.prototype.refreshStationCompDetail = function() {
        _self.info_list = [];
        _self.showData = null;
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        _self.getStationCompDetail(0, PER_GET_PAGE_NUM);
    };
    StationCompDetail.prototype.showFilterSearch = function() {
        require('stationCompSummarySearch').show(_self, 1);
    };
    StationCompDetail.prototype.nextPage = function() {
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
            _self.showStationCompDetail(curIndex);
            return;
        }
        _self.getStationCompDetail(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    StationCompDetail.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showStationCompDetailWithNoData();
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

        _self.info_list = _self.info_list.concat(data);
        _self.loadedPageIndex = _self.pageIndex;
        if (_self.loadedPageIndex >= MAX_PAGE_CACHE) {
            _self.info_list  = _self.info_list.slice(PER_GET_PAGE_NUM);
        }
        var curIndex = Math.min(_self.loadedPageIndex, MAX_PAGE_CACHE-1);
        _self.showStationCompDetail(curIndex);
    };
    StationCompDetail.prototype.prePage = function() {
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
            _self.showStationCompDetail(curIndex);
            return;
        }
        _self.getStationCompDetail(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    StationCompDetail.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.info_list = data.concat(_self.info_list);
        _self.info_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showStationCompDetail(0);
    };
    StationCompDetail.prototype.showStationCompDetailWithNoData = function() {
        var BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        _self.scroller.downRefresh = false;
        _self.scroller.upRefresh = false;
        html += DIVCH+LC('无数据')+DIVT;

        $('#detail_info_list').html(html);
    };
    StationCompDetail.prototype.showStationCompDetail = function(pageIndex) {
        var showType = (_self.searchInfo.operator_id?2:0)|(_self.searchInfo.stage_name?1:0);
        switch (showType) {
            case 0:
                _self.showStationCompDetailBoth(pageIndex);
                break;
            case 1:
                _self.showStationCompDetailPerson(pageIndex);
                break;
            case 2:
                _self.showStationCompDetailStage(pageIndex);
                break;
            case 3:
                _self.showStationCompDetailOnly(pageIndex);
                break;
        }
    };
    StationCompDetail.prototype.showStationCompDetailOnly = function(pageIndex) {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="35%"',
            WD2 = 'width="20%"',
            WD3 = 'width="20%"',
            WD4 = 'width="20%"',
            html = '',
            data;
        if (pageIndex == -1) {
            data = _self.showData;
        } else {
            data = _self.info_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
            _self.showData = data
        }
        console.log(data);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data.length<_self.totalInfo.count);

        html += DIVCH+RED(_self.searchInfo.operator_name)+'['+BLUE(_self.searchInfo.stage_name)+']'+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data.length)+')'+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+' >加工对象</th><th '+WD2+'>'+'数量</th><th '+WD3+'>计划工时<br>(分钟)</th><th '+WD4+'>'+'实际工时<br>(分钟)</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" onclick="app.stationCompDetail.showBatchListInfo('+item.wdisp_id+')">';
            html += '<td '+WD0+'style="text-align:center">' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'style="text-align:center">' + CC(item.workitem_name)+ '</td>';
            html += '<td '+WD2+'style="text-align:center">' + CC(item.qty);
            html += '<td '+WD3+'style="text-align:center">' + CC(item.workload) + '</td>';
            html += '<td '+WD4+'style="text-align:center">' + CC(item.hold_time) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#detail_info_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StationCompDetail.prototype.showStationCompDetailPerson = function(pageIndex) {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="15%"',
            WD2 = 'width="30%"',
            WD3 = 'width="15%"',
            WD4 = 'width="15%"',
            WD5 = 'width="15%"',
            html = '',
            data;
        if (pageIndex == -1) {
            data = _self.showData;
        } else {
            data = _self.info_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
            _self.showData = data
        }
        console.log(data);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data.length<_self.totalInfo.count);

        html += DIVCH+BLUE(_self.searchInfo.stage_name)+' '+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data.length)+')'+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+'>操作者</th><th '+WD2+' >加工对象</th><th '+WD3+'>'+'数量</th><th '+WD4+'>计划工时<br>(分钟)</th><th '+WD5+'>'+'实际工时<br>(分钟)</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" onclick="app.stationCompDetail.showBatchListInfo('+item.wdisp_id+')">';
            html += '<td '+WD0+'style="text-align:center">' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'style="text-align:center">' + CC(item.operator_name)+ '</td>';
            html += '<td '+WD2+'style="text-align:center">' + CC(item.workitem_name)+ '</td>';
            html += '<td '+WD3+'style="text-align:center">' + CC(item.qty);
            html += '<td '+WD4+'style="text-align:center">' + CC(item.workload) + '</td>';
            html += '<td '+WD5+'style="text-align:center">' + CC(item.hold_time) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#detail_info_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };

    StationCompDetail.prototype.showStationCompDetailStage = function(pageIndex) {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="15%"',
            WD2 = 'width="30%"',
            WD3 = 'width="15%"',
            WD4 = 'width="15%"',
            WD5 = 'width="15%"',
            html = '',
            data;
        if (pageIndex == -1) {
            data = _self.showData;
        } else {
            data = _self.info_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
            _self.showData = data
        }
        console.log(data);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data.length<_self.totalInfo.count);

        html += DIVCH+RED(_self.searchInfo.operator_name)+' '+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data.length)+')'+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+'>工序</th><th '+WD2+' >加工对象</th><th '+WD3+'>'+'数量</th><th '+WD4+'>计划工时<br>(分钟)</th><th '+WD5+'>'+'实际工时<br>(分钟)</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" onclick="app.stationCompDetail.showBatchListInfo('+item.wdisp_id+')">';
            html += '<td '+WD0+'style="text-align:center">' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'style="text-align:center">' + CC(item.stage_name)+ '</td>';
            html += '<td '+WD2+'style="text-align:center">' + CC(item.workitem_name)+ '</td>';
            html += '<td '+WD3+'style="text-align:center">' + CC(item.qty);
            html += '<td '+WD4+'style="text-align:center">' + CC(item.workload) + '</td>';
            html += '<td '+WD5+'style="text-align:center">' + CC(item.hold_time) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#detail_info_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StationCompDetail.prototype.showStationCompDetailBoth = function(pageIndex) {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="15%"',
            WD2 = 'width="15%"',
            WD3 = 'width="25%"',
            WD4 = 'width="15%"',
            WD5 = 'width="10%"',
            WD6 = 'width="15%"',
            html = '',
            data;
        if (pageIndex == -1) {
            data = _self.showData;
        } else {
            data = _self.info_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
            _self.showData = data
        }
        console.log(data);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data.length<_self.totalInfo.count);

        html += DIVCH+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data.length)+')'+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+'>操作者</th><th '+WD2+'>工序</th><th '+WD3+' >加工对象</th><th '+WD4+'>'+'数量</th><th '+WD5+'>计划工时<br>(分钟)</th><th '+WD6+'>'+'实际工时<br>(分钟)</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" onclick="app.stationCompDetail.showBatchListInfo('+item.wdisp_id+')">';
            html += '<td '+WD0+'style="text-align:center">' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'style="text-align:center">' + CC(item.operator_name)+ '</td>';
            html += '<td '+WD2+'style="text-align:center">' + CC(item.stage_name)+ '</td>';
            html += '<td '+WD3+'style="text-align:center">' + CC(item.workitem_name)+ '</td>';
            html += '<td '+WD4+'style="text-align:center">' + CC(item.qty);
            html += '<td '+WD5+'style="text-align:center">' + CC(item.workload) + '</td>';
            html += '<td '+WD6+'style="text-align:center">' + CC(item.hold_time) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#detail_info_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StationCompDetail.prototype.getStationCompDetail = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var searchInfo = _self.searchInfo;
        var param = {
            uid: app.login.userid,
            start:start,
            limit:num,
            op:2,
            operator_id: searchInfo.operator_id||'',
            time_start: searchInfo.time_start,
            date: app.utils.dateToString(searchInfo.date),
            stage_name:searchInfo.stage_name||'',
            work_item_name: searchInfo.work_item_name
        };
        if (_self.maxPageIndex == -1) {
            param.is_first = 1;
        }
        var url = app.route.stationCompSummaryUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationCompDetailSuccess,
            error : _self.onGetStationCompDetailError
        });
    };
    StationCompDetail.prototype.onGetStationCompDetailSuccess = function(data) {
        console.log(data);
        if (_self.maxPageIndex == -1) {
            _self.totalInfo = {};
            _self.totalInfo.count = data.total_count;
            _self.maxPageIndex = Math.floor((data.total_count-1)/PER_GET_PAGE_NUM);
        }
        app.utils.clearWait();
        var info_list = data.info_list;
        if (!info_list) {
            _self.showStationCompDetailWithNoData();
            return;
        }

        if (_self.dir == DEC_DIR) {
            _self.onPrePage(data.info_list);
        } else {
            _self.onNextPage(data.info_list);
        }
    };
    StationCompDetail.prototype.onGetStationCompDetailError = function(data, type) {
        if (_self.pageIndex == -1) {
            _self.release();
            $.ui.goBack();
        }
    };
    StationCompDetail.prototype.showBatchListInfo = function(wdisp_id) {
        require('batchListInfo').show(wdisp_id,_self.searchInfo.stage_name);
    };
    return new StationCompDetail();
});
