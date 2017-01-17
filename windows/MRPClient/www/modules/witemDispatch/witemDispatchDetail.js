define(function(require) {
	"use strict";
    var _self;

    function WitemDispatchDetail() {
        _self = this;
		_self.id = "witemDispatchDetail";
    }

    WitemDispatchDetail.prototype.show = function(data, short_name, from) {
        _self.data = data;
        _self.from = from;
        _self.short_name = short_name;
        _self.disdInfo = {};
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    WitemDispatchDetail.prototype.onLoad = function() {
        _self.showWitemDispatchDetail(_self.data);
    };
    WitemDispatchDetail.prototype.release = function() {
        _self.data = null;
        _self.short_name = null;
        _self.cur_wstmeta_name = null;
        _self.disdInfo = null;
        app.stationDispatchRecv&&app.stationDispatchRecv.release();
        app.stationDispatchComp&&app.stationDispatchComp.release();
    };
    WitemDispatchDetail.prototype.showWitemDispatchDetail = function(data) {
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            stageType = app.route.stageType,
            wdisp_list =  data.wdisp_list,
            html = '';

        html += DIVCH+LC((_self.short_name?'['+_self.short_name+']':'')+'派工单款数:')+GREEN(wdisp_list.length)+DIVT;

        for (var i=0, len=wdisp_list.length; i<len; i++) {
            var wdisp = wdisp_list[i];
            html += '<li>';
            html += DIVCH+'当前工序：'+GREEN(wdisp.wstmeta_name)+DIVT;
            html += DIVH+'板名称：'+GREEN(wdisp.witem_name)+DIVT;
            var priority = _self.getWshPriority(wdisp.priority, wdisp.wsh_timeend_required);
            html += DIVH+'状态：'+GREEN(wdisp.state)+'&nbsp;&nbsp;&nbsp;优先级：<sup>'+ RED(wdisp.priority)+'</sup><span class="worksheet_priority worksheet_priority_'+priority+'"></span>'+DIVT;
            html += DIVH+'计划数量：'+GREEN(wdisp.plan_qty)+'&nbsp;&nbsp;&nbsp;在制数量：'+GREEN(wdisp.wait_qty)+DIVT;
            html += DIVH+'未接收数量(最大)：'+GREEN(wdisp.no_comp_qty)+'('+RED(wdisp.max_qty)+')'+DIVT;
            html += DIVH+'订单号(本厂编号)：'+GREEN(wdisp.order_info)+DIVT;
            html += '<div style="margin-bottom: 6px;" id="wddt_list_'+wdisp.wdisp_id+'">';
            if (_self.disdInfo[wdisp.wdisp_id]==null) {
                html += '报废信息：<a class="icon magnifier text_green" onclick="app.witemDispatchDetail.getDisdNum(\''+wdisp.wdisp_id+'\')"></a>';
            } else {
                html += _self.updateDisdNum(wdisp.wdisp_id, true);
            }
            html += DIVT;
            html += '</li>';

            var other_parameter = wdisp.other_parameter||"";
            other_parameter = other_parameter.replace(/\n/g, "<br />");
            html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \'wdsd_other_params\')">其他参数</li>';
            html += '<li>';
            html += '<div id="wdsd_other_params" style="display: none">'+PURPLE(other_parameter)+DIVT;

            if (wdisp.outsource == "1") {
                html += DIVH+'外发单：'+PURPLE(wdisp.outsource_name)+DIVT;
                html +=  app.utils.buttonHtml([
                    {text:'详细信息', click:'app.witemDispatchDetail.getWitemDispatchDetailDetail('+wdisp.wdisp_id+')'}
                ]);
            } else {
                if (stageType == 0 || stageType == 2) {
                    html +=  app.utils.buttonHtml([
                        {text:'详细信息', click:'app.witemDispatchDetail.getWitemDispatchDetailDetail('+wdisp.wdisp_id+')'},
                        {text:'接收并完工', click:'app.witemDispatchDetail.getWitemDispatchDetailRecvComp('+i+')'}
                    ]);
                    var buttons = [
                        {text:'详细信息', click:'app.witemDispatchDetail.getWitemDispatchDetailDetail('+wdisp.wdisp_id+')'}
                    ];
                    if (wdisp.no_comp_qty>0||wdisp.wait_qty>0) {
                        buttons.push({text:'接收并完工', click:'app.witemDispatchDetail.getWitemDispatchDetailRecvComp('+i+')'});
                    }
                    html += app.utils.buttonHtml(buttons);
                } else {
                    var buttons = [
                        {text:'详细信息', click:'app.witemDispatchDetail.getWitemDispatchDetailDetail('+wdisp.wdisp_id+')'}
                    ];
                    if (wdisp.no_comp_qty>0) { //未接收
                        buttons.push({text:'接收', click:'app.witemDispatchDetail.getWitemDispatchDetailRecv('+i+')'});
                    }
                    if (wdisp.wait_qty>0) { //在制
                        buttons.push({text:'完工', click:'app.witemDispatchDetail.getWitemDispatchDetailComp('+i+')'});
                    }
                    html += app.utils.buttonHtml(buttons);
                }
            }
            html += '</li>';
        }
        //console.log(html);
        $('#witemd_list').html(html);
    };
    WitemDispatchDetail.prototype.getWshPriority = function(priority, end_time) {
        if(end_time && (new Date(end_time) < new Date())){
            priority = 0;
        }
        return priority;
    };
    WitemDispatchDetail.prototype.updateWitemDispatchList = function() {
        $('#witemd_list').html("");
        var param = {
            op: 16,
            is_first: 1,
            workitem_short_name:_self.short_name,
            uid: app.login.userid
        };
        console.log(param);
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("更新中...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onUpdateWitemDispatchListSuccess,
            error : _self.onUpdateWitemDispatchListError
        });
    };
    WitemDispatchDetail.prototype.onUpdateWitemDispatchListSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            $.ui.goBack();
            return;
        }
        if (!data.wdisp_list || !data.wdisp_list.length) {
            app.utils.toast("该加工对象已经全部过数");
            $.ui.goBack();
        } else {
            _self.showWitemDispatchDetail(data);
        }
    };
    WitemDispatchDetail.prototype.onUpdateWitemDispatchListError = function(data, type) {
        $.ui.goBack();
    };
    WitemDispatchDetail.prototype.getWitemDispatchDetailDetail = function(wdisp_id) {
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
            success : _self.onGetWitemDispatchDetailDetailSuccess
        });
    };
    WitemDispatchDetail.prototype.onGetWitemDispatchDetailDetailSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        require('stationDispatchDetail').show(data.databasic);
        app.utils.clearWait();
    };
    WitemDispatchDetail.prototype.getWitemDispatchDetailRecvComp = function(index) {
        var wdisp = _self.data.wdisp_list[index];
        var lot_no = wdisp.witem_name.substr(0, 4)+wdisp.wsh_name.substr(0, 4)+wdisp.lot_id;
        console.log(lot_no);
        require('passNumberDetail').show(null, lot_no, 2);
    };
    WitemDispatchDetail.prototype.getWitemDispatchDetailRecv = function(index) {
        var wdisp = _self.data.wdisp_list[index];
        var param = {
            wdisp_id: wdisp.wdisp_id,
            op: 2,
            uid: app.login.userid
        }
        _self.cur_wstmeta_name = wdisp.wstmeta_name;
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetWitemDispatchDetailRecvSuccess
        });
    };
    WitemDispatchDetail.prototype.onGetWitemDispatchDetailRecvSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        data.recv_info.stage = _self.cur_wstmeta_name;
        require('stationDispatchRecv').show(data.recv_info, _self.id);
        app.utils.clearWait();
    };
    WitemDispatchDetail.prototype.getWitemDispatchDetailComp = function(index) {
        var wdisp = _self.data.wdisp_list[index];
        var param = {
            wdisp_id: wdisp.wdisp_id,
            op: 3,
            uid: app.login.userid
        }
        _self.cur_wstmeta_name = wdisp.wstmeta_name;
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetWitemDispatchDetailCompSuccess
        });
    };
    WitemDispatchDetail.prototype.onGetWitemDispatchDetailCompSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        data.comp_info.stage = _self.cur_wstmeta_name;
        require('stationDispatchComp').show(data.comp_info, _self.id);
        app.utils.clearWait();
    };
    WitemDispatchDetail.prototype.getDisdNum = function(wdisp_id) {
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
    WitemDispatchDetail.prototype.onGetDisdNumSuccess = function(data) {
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
    WitemDispatchDetail.prototype.updateDisdNum = function(wdisp_id, needReturn) {
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
            $('#wddt_list_'+wdisp_id).html(html);
        }
        return html;
    };
    return new WitemDispatchDetail();
});
