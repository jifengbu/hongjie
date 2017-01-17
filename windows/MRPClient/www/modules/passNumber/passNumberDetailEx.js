define(function(require) {
	"use strict";
	var _self;

	function PassNumberDetailEx() {
		_self = this;
		_self.id = "passNumberDetailEx";
	}
	
	PassNumberDetailEx.prototype.show = function(parent) {
        _self.parent = parent;
        _self.select_stage = null;
        _self.disdInfo = {};
        _self.time = $.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	PassNumberDetailEx.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.data) {
            _self.getPassNumberList();
        }
	};
    PassNumberDetailEx.prototype.release = function() {
        app.utils.setReleasePanel(null);
        _self.parent = null;
        _self.data = null;
        _self.time = null;
        _self.select_stage = null;
        _self.disdInfo = null;
        app.stationDispatchRecv&&app.stationDispatchRecv.release();
        app.stationDispatchComp&&app.stationDispatchComp.release();
        app.stationDispatchSearch&&app.stationDispatchSearch.release();
        $('#pnd_detail_list_ex').html("");
    };
	PassNumberDetailEx.prototype.showPassNumberDetailEx = function() {
        var PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '';

        var selectable_stages = _self.data.selectable_stages;
        var stages_list = DIVH+'工序：';
        stages_list += '<select id="pnd_stages_list" onchange="app.passNumberDetailEx.showStages(this.value)" style="width: 60%;">';
        for (var key in selectable_stages) {
            if (!_self.select_stage) {
                _self.select_stage = key;
            }
            var select = "";
            if (_self.select_stage == key) {
                select = 'selected="selected"';
            }
            var item = selectable_stages[key];
            for (var itemkey in item) {
                stages_list += '<option '+select+' value="'+key+'">'+item[itemkey]+'</option>';
                break;
            }
        }
        stages_list += '</select>'+DIVT;

        var data = _self.data.recv_com_info[_self.select_stage];
        var recv_info =  data.recv_info;
        if (!recv_info) {
            app.utils.toast("错误数据不能正常显示");
            return;
        }

        html += '<li>';
        html += DIVCH+'当前时间：'+GREEN(_self.time)+DIVT;
        html += DIVH+'条形码：'+GREEN(_self.parent.scan_id)+DIVT;
        html += DIVH+'派工单名称：'+GREEN(recv_info.wdisp_name)+DIVT;
        html += DIVH+'加工单名称：'+GREEN(recv_info.wsh_name)+DIVT;
        html += DIVH+'板名称：'+GREEN(recv_info.witem_name)+DIVT;
        html += stages_list;

        html += DIVH+'上工序：'+GREEN(data.pre_stgmeta)+DIVT;
        html += DIVH+'下工序：'+GREEN(data.next_stgmeta)+DIVT;

        var other_parameter = recv_info.other_parameter||"";
        other_parameter = other_parameter.replace(/\n/g, "<br />");
        html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \'pndt_other_params\')">其他参数</li>';
        html += '<li>';
        html += '<div id="pndt_other_params" style="display: none">'+PURPLE(other_parameter)+DIVT;
        html += '</li>';

        html += '<li>';
        if (recv_info.piece) {
            var piece = recv_info.piece;
            for (var key in piece) {
                var item = piece[key];
                var title = item.mark+'('+PURPLE(item.order_id)+')：';
                var unit = RED('&nbsp;&nbsp;'+((item.unit=="piece"||item.unit=="Piece")?"Pcs":"Set"));
                html += DIVCH+'订单号：'+PURPLE(key)+DIVT;
                html += DIVH+title+GREEN(item.wait_qty)+'('+RED(item.max_qty)+')'+unit+DIVT;
                html += _self.getOnMakeQtyByWorkitemId();
            }
        } else {
            var panel = recv_info.panel;
            var unit = RED('&nbsp;&nbsp;'+'PNL');
            for (var key in panel) {
                var item = panel[key];
                html += DIVH+'等待数量(最大)：'+GREEN(item.wait_qty)+'('+RED(item.max_qty)+')'+unit+DIVT;
                html += _self.getOnMakeQtyByWorkitemId();
            }
        }

        html += '<div style="margin-bottom: 6px;" id="pndt_list_'+data.wdisp_id+'">';
        if (_self.disdInfo[data.wdisp_id]==null) {
            html += '报废信息：<a class="icon magnifier text_green" onclick="app.passNumberDetailEx.getDisdNum(\''+data.wdisp_id+'\')"></a>';
        } else {
            html += _self.updateDisdNum(data.wdisp_id, true);
        }
        html += DIVT;
        html += '</li>';

        if (data.is_oustsource == "1") {
            html += DIVH+'外发单：'+GREEN(data.oustsource_name)+DIVT;
        } else {
            html += app.utils.buttonHtml([
                {text: '接收', click: 'app.passNumberDetailEx.getStationDispatchRecv(' + data.wdisp_id + ')'},
                {text: '完工', click: 'app.passNumberDetailEx.getStationDispatchComp(' + data.wdisp_id + ')'}
            ]);
        }
        $('#pnd_detail_list_ex').html(html);
	};
    PassNumberDetailEx.prototype.getOnMakeQtyByWorkitemId = function() {
        var html = '',
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            GREEN = app.color.GREEN;
        var comp_info = _self.data.recv_com_info[_self.select_stage].comp_info;
        if (comp_info.piece) {
            var piece = comp_info.piece;
            for (var key in piece) {
                var item = piece[key];
                var title = item.mark+'('+PURPLE(item.order_id)+')：';
                var unit = RED('&nbsp;&nbsp;'+((item.unit=="piece"||item.unit=="Piece")?"Pcs":"Set"));
                html += DIVH + title + GREEN(item.on_make_qty) + unit + DIVT;
            }
        } else {
            var panel = comp_info.panel;
            var unit = RED('&nbsp;&nbsp;'+'PNL');
            for (var key in panel) {
                var item = panel[key];
                html += DIVH + '在制数量：' + GREEN(item.on_make_qty) + unit + DIVT;
            }
        }
        return html;
    };
    PassNumberDetailEx.prototype.showStages = function(stage) {
        _self.select_stage = stage;
        _self.showPassNumberDetailEx();
    };
    PassNumberDetailEx.prototype.getPassNumberList = function() {
        var param = {
            uid: app.login.userid,
            lot_no: _self.parent.scan_id,
            op: 12
        };
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("正在更新...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetPassNumberListSuccess
        });
    };
    PassNumberDetailEx.prototype.onGetPassNumberListSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            $.ui.goBack();
            return;
        }
        if (data.selectable_stages && data.recv_com_info) {
            _self.parent.addPassNumberHistoryList();
            _self.data = data;
            _self.showPassNumberDetailEx();
        } else {
            app.utils.toast("该单没有可以过数的派工单");
            $.ui.goBack();
        }
    };
    PassNumberDetailEx.prototype.getStationDispatchDetail = function() {
        var param = {
            uid: app.login.userid,
            wdisp_id: _self.data.recv_com_info[_self.select_stage].wdisp_id,
            op: 8
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
    PassNumberDetailEx.prototype.onGetStationDispatchDetailSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        require('stationDispatchDetail').show(data.databasic);
        app.utils.clearWait();
    };
    PassNumberDetailEx.prototype.getStationDispatchRecv = function(wdisp_id) {
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
    PassNumberDetailEx.prototype.onGetStationDispatchRecvSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }

        var stage = _self.data.selectable_stages[_self.select_stage];
        for (var key in stage) {
            data.recv_info.stage = stage[key];
            break;
        }
        require('stationDispatchRecv').show(data.recv_info, _self.id);
        app.utils.clearWait();
    };
    PassNumberDetailEx.prototype.getStationDispatchComp = function(wdisp_id) {
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
    PassNumberDetailEx.prototype.onGetStationDispatchCompSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }

        var stage = _self.data.selectable_stages[_self.select_stage];
        for (var key in stage) {
            data.comp_info.stage = stage[key];
            break;
        }
        require('stationDispatchComp').show(data.comp_info, _self.id);
        _self.select_stage = null;
        app.utils.clearWait();
    };
    PassNumberDetailEx.prototype.getDisdNum = function(wdisp_id) {
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
    PassNumberDetailEx.prototype.onGetDisdNumSuccess = function(data) {
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
    PassNumberDetailEx.prototype.updateDisdNum = function(wdisp_id, needReturn) {
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
            $('#pndt_list_'+wdisp_id).html(html);
        }
        return html;
    };
	return new PassNumberDetailEx();
});
