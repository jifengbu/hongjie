/**
 * Created by panyun on 2015/1/20.
 */
define(function(require) {
	"use strict";
    var _self;
    var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
    var MAX_PAGE_CACHE = 20;
    var PER_GET_PAGE_NUM = 20;

    function SheetSituation() {
        _self = this;
        _self.id = "sheetSituation";
    }

    SheetSituation.prototype.show = function(from) {
        _self.from = from;
        _self.protityOrderClass = 'down';
        _self.showType = 1;
        if (!from) {
            _self.searchInfo = {
                create_time:{op:"between",value:{value1:$.dateFormat(new Date(),"yyyy-MM")+"-01",value2:$.dateFormat(new Date(),"yyyy-MM-dd")}},
                wsh_name:'',
                uid: app.login.userid,
                workitem_name:'',
                order_name:''
            };
        }
        _self.info_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;

        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    SheetSituation.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        var scroller = $(app.utils.panelID(_self.id)).scroller();
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getSheetSituation(0, PER_GET_PAGE_NUM);
        }

    };
    SheetSituation.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    SheetSituation.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.info_list = null;
        _self.searchInfo = null;
        _self.totalInfo = null;
        _self.from = null;
        _self.showData = null;

        //app.stationDispatchRecv&&app.stationDispatchRecv.release();
        //app.stationDispatchComp&&app.stationDispatchComp.release();
        app.sheetSituationSearch&&app.sheetSituationSearch.release();
    };
    SheetSituation.prototype.refreshCurPage = function() {
        _self.dir = REFRESH_DIR;
        _self.getSheetSituation(_self.pageIndex, PER_GET_PAGE_NUM);
    };
    SheetSituation.prototype.refreshSheetSituation = function() {
        _self.info_list = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        _self.getSheetSituation(0, PER_GET_PAGE_NUM);
    };
    //计算当前页的方法是total-tail
    //total = min(loaded+1, MAX_PAGE_CACHE)
    //tail = loaded+1-index
    //如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
    //如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
    SheetSituation.prototype.onCurPage = function(data) {
        var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        var curIndex = total-tail;
        for (var i=0; i<data.length; i++) {
            _self.info_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
        }
        _self.showSheetSituation(_self.pageIndex);
    };
    SheetSituation.prototype.nextPage = function() {
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
            _self.showSheetSituation(curIndex);
            return;
        }
        _self.getSheetSituation(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    SheetSituation.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showSheetSituationWithNoData();
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
        _self.showSheetSituation(curIndex);
    };
    SheetSituation.prototype.prePage = function() {
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
            _self.showSheetSituation(curIndex);
            return;
        }
        _self.getSheetSituation(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    SheetSituation.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.info_list = data.concat(_self.info_list);
        _self.info_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showSheetSituation(0);
    };
    SheetSituation.prototype.showFilterSearch = function() {
        require('sheetSituationSearch').show(_self);
    };
    SheetSituation.prototype.changeProtityOrder = function() {
        if (_self.protityOrderClass == 'down') {
            _self.protityOrderClass = 'up';
        } else {
            _self.protityOrderClass = 'down';
        }
        _self.showSheetSituation(-1);
    };
    SheetSituation.prototype.showSheetSituationWithNoData = function() {
        var BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        _self.scroller.downRefresh = false;
        _self.scroller.upRefresh = false;

        $('#wsheet_list').html("无数据");
    };
    SheetSituation.prototype.showSheetSituation = function(pageIndex) {
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
            WD1 = 'width="22%"',
            WD2 = 'width="29%"',
            WD3 = 'width="18%"',
            WD4 = 'width="14%"',
            WD5 = 'width="8%"',
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

        html += DIVCH+RED('合计:')+LC('加工数量:')+GREEN(_self.totalInfo.info.total_wsh_require_qty)+LC('&nbsp;加工面积:')+PURPLE(_self.totalInfo.info.total_wsh_require_area+"m<sup>2</sup>")+DIVT;
        html += DIVCH+LC('投料:')+BLUE(_self.totalInfo.info.total_feed_qty)+LC('&nbsp;完工:')+GREEN(_self.totalInfo.info.total_comp_qty)+LC('&nbsp;报废:')+RED(_self.totalInfo.info.total_disd_qty)+DIVT;

        html += DIVCH+LC('总条数：')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+info_list.length)+')'+DIVT;

        html += '<table style="border:1px;color:inherit;width: 100%">';
        var tname, tclass;
        if (!_self.showType) {
            tname = '加工单';
            tclass = 'left';
        } else {
            tname = '加工对象';
            tclass = 'right';
        }

        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+'>提交日期</th><th '+WD2+' class="icon '+tclass+'" onclick="app.sheetSituation.changeShowType(this)">'+tname+'</th><th '+WD3+'>加工数量</th><th '+WD4+'>状态</th><th '+WD5+' class="icon '+_self.protityOrderClass+'" onclick="app.sheetSituation.changeProtityOrder()">'+'优先级</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;

        if (_self.protityOrderClass == "down") {
            info_list.sort(function (a, b) {
                return (a.priority<b.priority)?1:(a.priority==b.priority)?0:-1;
            });
        } else {
            info_list.sort(function (a, b) {
                return (a.priority>b.priority)?1:(a.priority==b.priority)?0:-1;
            });
        }
        console.log(info_list);

        var len=info_list.length;
        for (var i=0, len=info_list.length; i<len; i++) {
            var dispatch = info_list[i];
            var background = (i&1)?"lightgray":"wheat";
            html += '<tr style="background-color:'+background+'; height:2em" onclick="app.sheetSituation.showWsheetDetail('+i+')">';
            html += '<td '+WD0+'>' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'>' + CC(dispatch.create_time) + '</td>';
            html += '<td '+WD2+' class="ss_variable_col" data_index='+i+'>' + CC(((_self.showType)?dispatch.workitem_name:dispatch.wsh_name)) + '</td>';
            html += '<td '+WD3+'>' + CC(dispatch.require_qty) +'PNL</td>';
            html += '<td '+WD4+'>' + CC(dispatch.status) + '</td>';
            html += '<td '+WD5+'>' + CC(dispatch.priority) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#wsheet_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    SheetSituation.prototype.changeShowType = function(el) {
        var CC = app.color.GRAY;
        var info_list =  _self.showData;
        var type;

        el = $(el);
        var className = el.get(0).className;
        if (!_self.showType) {
           el.replaceClass('left', 'right');
           el.html('加工对象');
            type = 'workitem_name';
            _self.showType = 1;
        } else {
            el.replaceClass('right', 'left');
            el.html('加工单');
            type = 'wsh_name';
            _self.showType = 0;
        }
        $('.ss_variable_col').forEach(function(item){
            item = $(item);
            var index = item.attr('data_index');
            var dispatch = info_list[index];
            item.html(CC(dispatch[type]));
        });
    };
    SheetSituation.prototype.getSheetSituation = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var param = {
            start: start,
            limit: num,
            create_time: JSON.stringify(_self.searchInfo.create_time),
            wsh_name: _self.searchInfo.wsh_name,
            work_item_name: _self.searchInfo.workitem_name,
            order_name: _self.searchInfo.order_name,
            uid: app.login.userid
        };

        console.log(param);
        var url = app.route.sheetSituationUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetSheetSituationSuccess
        });
    };
    SheetSituation.prototype.onGetSheetSituationSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        if (_self.maxPageIndex == -1) {
            _self.totalInfo = {};
            _self.totalInfo.info = data.total_info;
            _self.totalInfo.count = data.total_count;
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
    SheetSituation.prototype.showWsheetDetail = function(index) {
        require('wsheetDetail').show(_self.showData[index]);
    };
    return new SheetSituation();
});

