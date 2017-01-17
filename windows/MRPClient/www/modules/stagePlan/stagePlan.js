/**
 * Created by panyun on 2015/1/13.
 */
define(function(require) {
	"use strict";
    var _self;
    var DEC_DIR = 0, INC_DIR = 1;
    var MAX_PAGE_CACHE = 20;
    var PER_GET_PAGE_NUM = 30;
    var SHOW_WITEM_NAME = 0;
    var SHOW_FACTORY_SELF_NO = 1;

    function StagePlan() {
        _self = this;
        _self.id = "stagePlan";
        _self.showType = SHOW_WITEM_NAME;
    }

    StagePlan.prototype.show = function() {
        _self.searchInfo = {witem_name:'', wsh_name:''};
        _self.info_list = [];
        _self.select_whstage_ids = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;

        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
    };
    StagePlan.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getStagePlan(0, PER_GET_PAGE_NUM);
        }
    };
    StagePlan.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    StagePlan.prototype.release = function() {
        _self.info_list = null;
        _self.select_whstage_ids = [];
        _self.totalInfo = null;
        _self.searchInfo = null;
        _self.showData = null;
        _self.loaded = false;
    };
    StagePlan.prototype.refreshStagePlan = function() {
        _self.info_list = [];
        _self.select_whstage_ids = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        _self.getStagePlan(0, PER_GET_PAGE_NUM);
    };
    StagePlan.prototype.doSearch = function() {
        var html = '';
        html += '<table  width="100%" style="font: inherit;">';
        html += '<tr><td>加工对象号:</td><td>';
        html += '<input id="stgp_witem_name" type="text" style="width: 100%; " value="'+_self.searchInfo.witem_name+'">';
        html += '</td></tr>';

        html += '<tr><td>加工单号:</td><td>';
        html += '<input id="search_wsh_name" type="text" style="width: 100%; " value="'+_self.searchInfo.wsh_name+'">';
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
                _self.searchInfo.witem_name = $("#stgp_witem_name").val();
                _self.searchInfo.wsh_name = $("#search_wsh_name").val();
                _self.refreshStagePlan();
            },
            addCssClass: 'wide'
        });
    };
    StagePlan.prototype.nextPage = function() {
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
            _self.showStagePlan(curIndex);
            return;
        }
        _self.getStagePlan(_self.pageIndex+1, PER_GET_PAGE_NUM);
    };
    StagePlan.prototype.onNextPage = function(data) {
        if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                _self.showStagePlanWithNoData();
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
        _self.showStagePlan(curIndex);
    };
    StagePlan.prototype.prePage = function() {
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
            _self.showStagePlan(curIndex);
            return;
        }
        _self.getStagePlan(_self.pageIndex-1, PER_GET_PAGE_NUM);
    };
    StagePlan.prototype.onPrePage = function(data) {
        _self.pageIndex--;
        _self.loadedPageIndex--;
        _self.info_list = data.concat(_self.info_list);
        _self.info_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
        _self.showStagePlan(0);
    };
    StagePlan.prototype.showStagePlanWithNoData = function() {
        var BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        _self.scroller.downRefresh = false;
        _self.scroller.upRefresh = false;
        html += '<div style="background-color:#D3D3D3; margin-bottom: 3px;text-align: center;">'+LC('计划工序：');
        html += '&nbsp;<select id="strp_plan_stage" style="width: 30%; " >';
        var stages = _self.totalInfo.stage_info;
        var si =  _self.searchInfo||{};
        for (var stage_id in stages) {
            html += '<option value="'+stage_id+'">'+stages[stage_id]+'</option>';
        }
        html += '</select>&nbsp;&nbsp;';
        html += '<input type="submit" id="submit" value="提交" style="width: 15%; " onclick="app.stagePlan.submitPlanStage()"/>';
        html += DIVT;
        html += DIVCH+LC('无数据')+DIVT;
        $('#stage_list').html(html);
    };
    StagePlan.prototype.showStagePlan = function(pageIndex) {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="6%"',
            WD1 = 'width="15%"',
            WD2 = 'width="23%"',
            WD3 = 'width="23%"',
            WD4 = 'width="15%"',
            WD5 = 'width="18%"',
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
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data.length<_self.totalInfo.total_count);

        html += '<div style="background-color:#D3D3D3; margin-bottom: 3px;text-align: center;">'+LC('计划工序：');
        html += '&nbsp;<select id="strp_plan_stage" style="width: 30%; " >';
        var stages = _self.totalInfo.stage_info;
        var si =  _self.searchInfo||{};
        for (var stage_id in stages) {
            html += '<option value="'+stage_id+'">'+stages[stage_id]+'</option>';
        }
        html += '</select>&nbsp;&nbsp;';
        html += '<input type="submit" id="submit" value="提交" style="width: 15%; " onclick="app.stagePlan.submitPlanStage()"/>';
        html += DIVT;
        html += DIVCH+LC('总条数:')+GREEN(_self.totalInfo.total_count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data.length)+')'+DIVT;

        html += '<table style="border:2px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD1+' >必做</th><th '+WD2+'>加工对象</th><th '+WD3+'>'+'加工单</th><th '+WD4+'>'+'数量</th><th '+WD5+'>'+'所在工序</th></tr>';
        var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
        for (var i=0,len=data.length; i<len; i++) {
            var checked = "";
            var item = data[i];
            var background = (i&1)?"lightgray":"wheat";
            if(item.planned == 1){
                checked ='checked = "checked" disabled';
                background = "yellow";
            }
            html += '<tr align="center" style="background-color:'+background+'" onclick="app.stagePlan.clickRow('+item.wshstag_id+')" id="tr'+item.wshstag_id+'">';
            //html += '<td '+WD0+'>' + RED(i+startIndex) + '</td>';
            html += '<td '+WD1+'><input id="child'+item.wshstag_id+'" '+checked+' type="checkbox"  value="'+item.wshstag_id+'" ><label for="checkbox" class="" >'+RED(i+startIndex)+'</label></td>';
            html += '<td '+WD2+'>' + CC(item.witem_name) + '</td>';
            html += '<td '+WD3+'>' + CC(item.wsh_name) + '</td>';
            html += '<td '+WD4+'>' + CC(item.req_qty) + '</td>';
            html += '<td '+WD5+'>' + CC(item.stage_name) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        //console.log(html);
        $('#stage_list').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
    };
    StagePlan.prototype.getStagePlan = function(pageNum, num) {
        var start = pageNum*PER_GET_PAGE_NUM;
        var param = {
            uid: app.login.userid,
            op:1,
            start:start,
            limit:num,
            witem_name:_self.searchInfo.witem_name,
            wsh_name:_self.searchInfo.wsh_name
        };
        if (_self.maxPageIndex == -1) {
            param.is_first = 1;
        }
        var url = app.route.stagePlanUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetStagePlanSuccess,
            error : _self.onGetStagePlanError
        });
    };
    StagePlan.prototype.onGetStagePlanSuccess = function(data) {
        console.log(data);
        if (_self.maxPageIndex == -1) {
            _self.totalInfo = {};
            _self.totalInfo.stage_info = data.stage_info;
            _self.totalInfo.total_count = data.total_count;
            _self.maxPageIndex = Math.floor((data.total_count-1)/PER_GET_PAGE_NUM);
        }
        app.utils.clearWait();
        var info_list = data.info_list;
        if (!info_list) {
            _self.showStagePlanWithNoData();
            return;
        }

        if (_self.dir == DEC_DIR) {
            _self.onPrePage(data.info_list);
        } else {
            _self.onNextPage(data.info_list);
        }
    };
    StagePlan.prototype.onGetStagePlanError = function(data, type) {
        if (_self.pageIndex == -1) {
            _self.release();
            $.ui.goBack();
        }
    };
    StagePlan.prototype.submitPlanStage = function() {
        var param = {
            uid: app.login.userid,
            op:2,
            stage_meta_id:$("#strp_plan_stage").val(),
            whstage_ids:_self.select_whstage_ids.toString()
        };

        if(_self.select_whstage_ids.length==0){
            app.utils.toast("请选择加工单！");
            return;
        }else{
            var url = app.route.stagePlanUrl+'?'+ $.param(param);
            console.log(url);
            app.utils.setWait("请稍后...");
            app.utils.ajax({
                type : "GET",
                url : url,
                timeout : app.route.timeout,
                success : _self.onSubmitStagePlanSuccess,
                error : _self.onSubmitStagePlanError
            });
        }
    };
    StagePlan.prototype.onSubmitStagePlanSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (data.success) {
            app.utils.toast("提交计划成功！");
            _self.refreshStagePlan();
            return;
        }else{
            app.utils.toast("提交计划失败，请重新选择正确工序提交！");
            return;
        }

    };
    StagePlan.prototype.onSubmitStagePlanError = function(data) {
        if (!data.success) {
            app.utils.toast("提交计划失败，请重新提交！");
            $.ui.goBack();
        }
    };
    StagePlan.prototype.clickRow = function(index){
        var chk = document.getElementById("child" + index);
        if(chk == null){
            return;
        }else{
            if(!chk.disabled){
                if(chk.checked){
                    chk.checked = false;
                    for(var i in _self.select_whstage_ids){
                        if(_self.select_whstage_ids[i] == index){
                            _self.select_whstage_ids.pop(i);
                            break;
                        }
                    }
                }else{
                    chk.checked = true;
                    _self.select_whstage_ids.push(index);
                }
            }
        }
    };
    return new StagePlan();
});
