/**
 * Created by panyun on 2015/1/5.
 */
define(function(require) {
	"use strict";
    var _self;
    var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
    var MAX_PAGE_CACHE = 20;
    var PER_GET_PAGE_NUM = 20;

    function StationComp() {
        _self = this;
        _self.id = "stationComp";
    }

    StationComp.prototype.show = function(from) {
        _self.from = from;
        if (!from) {
            _self.searchInfo = {
                time_end:'month',
                uid: app.login.userid,
                stage:'',
                workitem_name:'',
                disp_type:''
            };
        }
        _self.info_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        _self.showType = 1;

        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    StationComp.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getStationComp(0, PER_GET_PAGE_NUM);
        }

    };
    StationComp.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StationComp.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.info_list = null;
        _self.stage_info = null;
        _self.user_info = null;
        _self.searchInfo = null;
        _self.totalInfo = null;
        _self.from = null;
        _self.showData = null;

        app.stationCompSearch&&app.stationCompSearch.release();
    };
    StationComp.prototype.refreshCurPage = function() {
        _self.dir = REFRESH_DIR;
        _self.getStationComp(_self.pageIndex, PER_GET_PAGE_NUM);
    };
    StationComp.prototype.refreshStationComp = function() {
        _self.info_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        _self.getStationComp(0, PER_GET_PAGE_NUM);
    };
    //计算当前页的方法是total-tail
    //total = min(loaded+1, MAX_PAGE_CACHE)
    //tail = loaded+1-index
    //如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
    //如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
    StationComp.prototype.onCurPage = function(data) {
        var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        var curIndex = total-tail;
        for (var i=0; i<data.length; i++) {
            _self.info_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
        }
        _self.showStationComp(_self.pageIndex);
    };
    StationComp.prototype.nextPage = function() {
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
            _self.showStationComp(curIndex);
            return;
        }
        _self.getStationComp(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    StationComp.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showStationCompWithNoData();
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
        _self.showStationComp(curIndex);
    };
    StationComp.prototype.prePage = function() {
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
            _self.showStationComp(curIndex);
            return;
        }
        _self.getStationComp(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    StationComp.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.info_list = data.concat(_self.info_list);
        _self.info_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showStationComp(0);
    };
    StationComp.prototype.showFilterSearch = function() {
        require('stationCompSearch').show(_self);
    };
    StationComp.prototype.showStationCompWithNoData = function() {
        var BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        _self.scroller.downRefresh = false;
        _self.scroller.upRefresh = false;

        $('#station_infos_list').html("无数据");
    };
    StationComp.prototype.showStationComp = function(pageIndex) {
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            CC = app.color.GRAY,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            stageType = app.route.stageType,
            WD0 = 'width="5%"',
            WD1 = 'width="10%"',
            WD2 = 'width="10%"',
            WD3 = 'width="30%"',
            WD4 = 'width="15%"',
            WD5 = 'width="10%"',
            WD6 = 'width="20%"',
            html = '';


        var info_list;
        if (pageIndex == -1) {
            info_list = _self.showData;
        } else {
            info_list = _self.info_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
            _self.showData = info_list;
        }

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+info_list.length<_self.totalInfo.count);

        html += DIVCH+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+info_list.length)+')'+DIVT;
        html += DIVCH+LC('面积合计:')+GREEN(_self.totalInfo.total_area+"m<sup>2</sup>")+DIVT;
        var delivery = _self.delivery;
        html += DIVCH;
        for (var key in delivery) {
            html += key+'小时('+delivery[key]+') ';
        }
        html += DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        var tname, tclass;
        if (!_self.showType) {
            tname = '加工单';
            tclass = 'left';
        } else {
            tname = '板名称/订单号';
            tclass = 'right';
        }

        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+'>报工时间</th><th '+WD2+'>报工类型</th><th '+WD3+' class="icon '+tclass+'" onclick="app.stationComp.changeShowType(this)">'+tname+'</th><th '+WD4+'>工位</th><th '+WD5+'>数量</th><th '+WD6+'>面积</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        var len=info_list.length;
        for (var i=0, len=info_list.length; i<len; i++) {
            var dispatch = info_list[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'" >';
            html += '<td '+WD0+'>' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'>' + CC(dispatch.time_end_d) + '</td>';
            html += '<td '+WD2+'>' + CC(dispatch.operate_type) + '</td>';
            html += '<td '+WD3+' class="sc_variable_col" data_index='+i+'>' + CC(((_self.showType)?dispatch.workitem_name_order_id:dispatch.wsh_name)) + '</td>';
            html += '<td '+WD4+'>' + CC(dispatch.stage_name) + '</td>';
            html += '<td '+WD5+'>' + CC(dispatch.qty) + '</td>';
            html += '<td '+WD6+'>' + CC(dispatch.area)  +'m<sup>2</sup>'+'</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#station_infos_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StationComp.prototype.changeShowType = function(el) {
        var CC = app.color.GRAY;
        var info_list =  _self.showData;
        var type;

        el = $(el);
        var className = el.get(0).className;
        if (!_self.showType) {
            el.replaceClass('left', 'right');
            el.html('板名称/订单号');
            type = 'workitem_name_order_id';
            _self.showType = 1;
        } else {
            el.replaceClass('right', 'left');
            el.html('加工单');
            type = 'wsh_name';
            _self.showType = 0;
        }
        $('.sc_variable_col').forEach(function(item){
            item = $(item);
            var index = item.attr('data_index');
            var dispatch = info_list[index];
            item.html(CC(dispatch[type]));
        });
    };
    StationComp.prototype.getStationComp = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var param = {
            start: start,
            limit: num,
            time_end: _self.searchInfo.time_end,
            stage_name: _self.searchInfo.stage,
            disp_type: _self.searchInfo.disp_type,
            work_item_name: _self.searchInfo.workitem_name,
            uid: app.login.userid//_self.searchInfo.uid
        };
        if (_self.maxPageIndex == -1) {
            param.is_first = 1;
        }

        console.log(param);
        var url = app.route.stationCompUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStationCompSuccess
        });
    };
    StationComp.prototype.onGetStationCompSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        if (_self.maxPageIndex == -1) {
            _self.user_info = data.user_info;
            _self.stage_info = data.stage_info;
            _self.totalInfo = {};
            _self.totalInfo.count = data.total_count;
            _self.totalInfo.total_area = data.total_info.total_area;
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
    return new StationComp();
});

