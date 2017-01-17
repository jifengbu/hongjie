/**
 * Created by panyun on 2015/1/8.
 */
define(function(require) {
	"use strict";
    var _self;
    var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
    var MAX_PAGE_CACHE = 5;
    var PER_GET_PAGE_NUM = 40;
    var TYPE = ["","层数","材料","处理工艺"];

    function StationCompSummary() {
        _self = this;
        _self.id = "stationCompSummary";
    }

    StationCompSummary.prototype.show = function(from) {
        _self.from = from;
        if (!from) {
            _self.searchInfo = {
                type:'',
                time_start:'day',
                date: app.utils.newDate(),
                operator_id: app.login.userid,
                workitem_name:''
            };
        }
        _self.info_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;

        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    StationCompSummary.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getStationCompSummary(0, PER_GET_PAGE_NUM);
        }

    };
    StationCompSummary.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StationCompSummary.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.info_list = null;
        _self.searchInfo = null;
        _self.totalInfo = null;
        _self.from = null;

        app.stationCompSummarySearch&&app.stationCompSummarySearch.release();
    };
    StationCompSummary.prototype.refreshCurPage = function() {
        _self.dir = REFRESH_DIR;
        _self.getStationCompSummary(_self.pageIndex, PER_GET_PAGE_NUM);
    };
    StationCompSummary.prototype.refreshStationCompSummary = function(remote) {
        _self.info_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        remote||_self.getStationCompSummary(0, PER_GET_PAGE_NUM);
    };
    //计算当前页的方法是total-tail
    //total = min(loaded+1, MAX_PAGE_CACHE)
    //tail = loaded+1-index
    //如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
    //如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
    StationCompSummary.prototype.onCurPage = function(data) {
        var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        var curIndex = total-tail;
        for (var i=0; i<data.length; i++) {
            _self.info_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
        }
        _self.showStationCompSummary(_self.pageIndex);
    };
    StationCompSummary.prototype.nextPage = function() {
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
            _self.showStationCompSummary(curIndex);
            return;
        }
        _self.getStationCompSummary(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    StationCompSummary.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showStationCompSummaryWithNoData();
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
        _self.showStationCompSummary(curIndex);
    };
    StationCompSummary.prototype.prePage = function() {
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
            _self.showStationCompSummary(curIndex);
            return;
        }
        _self.getStationCompSummary(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    StationCompSummary.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.info_list = data.concat(_self.info_list);
        _self.info_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showStationCompSummary(0);
    };
    StationCompSummary.prototype.showFilterSearch = function() {
        require('stationCompSummarySearch').show(_self, 0);
    };
    StationCompSummary.prototype.showHelp = function() {
        var html = '';

        html += '<div class="list">';
        html += '<div style="text-align: left;padding-bottom: 10px;">&nbsp;&nbsp;&nbsp;&nbsp;点击<span style="color:red">操作者</span>栏显示<span style="color:green">该操作者的所有工序</span>的工号完工详情</div>';
        html += '<div style="text-align: left;padding-bottom: 10px;">&nbsp;&nbsp;&nbsp;&nbsp;点击<span style="color:red">工序</span>栏显示<span style="color:green">操作该工序的所有操作者</span>的工号完工详情</div>';
        html += '<div style="text-align: left;padding-bottom: 10px;">&nbsp;&nbsp;&nbsp;&nbsp;点击<span style="color:red">其他区域</span>显示<span style="color:green">该行对应的操作者和工序</span>的工号完工详情</div>';
        html += '</div>';

        app.utils.popup({
            title: "帮助信息",
            message: html,
            cancelText: "知道了",
            cancelCallback: function () {},
            cancelOnly: true,
            addCssClass: 'wide'
        });
    };
    StationCompSummary.prototype.showStationCompSummaryWithNoData = function() {
        var BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        _self.scroller.downRefresh = false;
        _self.scroller.upRefresh = false;

        $('#station_info_list').html("无数据");
    };
    StationCompSummary.prototype.showStationCompSummary = function(pageIndex) {
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="5%"',
            WD1 = 'width="23%"',
            WD2 = 'width="23%"',
            WD3 = 'width="15%"',
            WD4 = 'width="17%"',
            WD5 = 'width="17%"',
            html = '';

        var info_list =  _self.info_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+info_list.length<_self.totalInfo.count);

        html += DIVCH+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+info_list.length)+')'+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+'>操作者</th><th '+WD2+'>工序</th><th '+WD3+'>数量</th><th '+WD4+'>面积</th><th '+WD5+'>停留时间</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        var len=info_list.length;
        for (var i=0, len=info_list.length; i<len; i++) {
            var dispatch = info_list[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" onclick="app.stationCompSummary.showStationCompDetailByPersonAndStage('+(i-1+startIndex)+')">';
            html += '<td '+WD0+'>' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+' onclick="app.stationCompSummary.showStationCompDetailByPerson('+(i-1+startIndex)+');event.stopPropagation();">' + CC(dispatch.operator_name) + '</td>';
            html += '<td '+WD2+' onclick="app.stationCompSummary.showStationCompDetailByStage('+(i-1+startIndex)+');event.stopPropagation();">' + CC(dispatch.stage_name) + '</td>';
            html += '<td '+WD3+'>' + CC(dispatch.qty) + '</td>';
            html += '<td '+WD4+'>' + CC(dispatch.area) +'m<sup>2</sup>'+'</td>';
            html += '<td '+WD5+'>' + CC(dispatch.hold_time) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#station_info_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StationCompSummary.prototype.getStationCompSummary = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var searchInfo = _self.searchInfo;
        var param = {
            start: start,
            limit: num,
            op:1,
            type: searchInfo.type,
            operator_id: searchInfo.operator_id||'',
            time_start: searchInfo.time_start,
            date: app.utils.dateToString(searchInfo.date),
            stage_name:searchInfo.stage_name||'',
            work_item_name: searchInfo.workitem_name,
            uid: app.login.userid
        };
        if (_self.maxPageIndex == -1) {
            param.is_first = 1;
        }

        console.log(param);
        var url = app.route.stationCompSummaryUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationCompSummarySuccess
        });
    };
    StationCompSummary.prototype.onGetStationCompSummarySuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        if (_self.maxPageIndex == -1) {
            _self.totalInfo = {};
            _self.totalInfo.stage_info = data.stage_info;
            _self.totalInfo.count = Math.max(data.total_count, data.info_list?data.info_list.length:0);
            _self.maxPageIndex = Math.floor((data.total_count-1)/PER_GET_PAGE_NUM);
        }
        if (_self.dir == DEC_DIR) {
            _self.onPrePage(data.info_list);
        } else if (_self.dir == INC_DIR) {
            _self.onNextPage(data.info_list);
        } else {
            _self.onCurPage(data.info_list);
        }
        app.utils.clearWait();
    };
    StationCompSummary.prototype.showStationCompDetailByPerson = function(index) {
        var searchInfo = _self.searchInfo;
        var info = {
            operator_id: _self.info_list[index].operator_id,
            operator_name: _self.info_list[index].operator_name,
            time_start: searchInfo.time_start,
            date: searchInfo.date,
            work_item_name:_self.searchInfo.workitem_name
        };
        require('stationCompDetail').show(info);
    };
    StationCompSummary.prototype.showStationCompDetailByStage = function(index) {
        var searchInfo = _self.searchInfo;
        var info = {
            time_start: searchInfo.time_start,
            date: searchInfo.date,
            stage_name:_self.info_list[index].stage_name,
            work_item_name:_self.searchInfo.workitem_name
        };
        require('stationCompDetail').show(info);
    };
    StationCompSummary.prototype.showStationCompDetailByPersonAndStage = function(index) {
        var searchInfo = _self.searchInfo;
        var info = {
            operator_id: _self.info_list[index].operator_id,
            operator_name: _self.info_list[index].operator_name,
            time_start: searchInfo.time_start,
            date: searchInfo.date,
            stage_name:_self.info_list[index].stage_name,
            work_item_name:_self.searchInfo.workitem_name
        };
        require('stationCompDetail').show(info);
    };
    return new StationCompSummary();
});

