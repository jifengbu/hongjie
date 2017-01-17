define(function(require) {
	"use strict";
    var _self;

    function StationDispatchComp() {
        _self = this;
		_self.id = "stationDispatchComp";
    }

    StationDispatchComp.prototype.show = function(data, from) {
        _self.data = data;
        _self.from = from;
        _self.work_sheet = {};
        _self.reworkInfo = {};
        _self.reworkInfo.auto_wdisps = [];
        _self.reworkInfo.scrap_ids = {};
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StationDispatchComp.prototype.onLoad = function() {
        app.updateChatPageBadge(_self.id);
        if ((_self.from == 'stationDispatch'&&app.stationDispatch.disdInfo[_self.data.wdisp_id] == null) ||
            (_self.from == 'witemDispatchDetail'&&app.witemDispatchDetail.disdInfo[_self.data.wdisp_id] == null)||
            (_self.from == 'passNumberDetailEx'&&app.passNumberDetailEx.disdInfo[_self.data.wdisp_id] == null)
            || _self.needUpate) {
            _self.getDisdNum();
        } else {
            _self.showStationDispatchComp();
        }
    };
    StationDispatchComp.prototype.release = function() {
        _self.work_sheet = null;
        _self.data = null;
        _self.rework_workitem_id = null;
        _self.type_out = null;
        _self.reworkInfo = null;
        app.stationDispatchRework&&app.stationDispatchRework.release();
        app.stagePlanCompSumup&&app.stagePlanCompSumup.release();
    };
    StationDispatchComp.prototype.showStationDispatchComp = function() {
        var LC = app.color.OLIVEDRAB,
            PNL_COLOR = app.color.PNL_COLOR,
            PCS_COLOR = app.color.PCS_COLOR,
            PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVRH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '';
        var data = _self.data;
        html += '<li>';
        html += DIVCH+'报工工位：'+GREEN(data.stage)+DIVT;
        html += DIVH+'报工派工单：'+GREEN(data.wsh_name+"-"+data.wdisp_id)+DIVT;
        html += DIVH+'当前时间：'+($.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"))+DIVT;
        html += DIVH+'加工时间：'+GREEN(data.manufactory_time)+DIVT;
        html += DIVH+'生产标记：'+GREEN(data.witem_name)+DIVT;
        var other_parameter = data.other_parameter||"";
        other_parameter = other_parameter.replace(/\n/g, "<br />");

        if (data.piece) {
            _self.type_out = "piece";
            var piece = data.piece;
            for (var key in piece) {
                var item = piece[key];
                var comp_id = "stds_comp_input_"+key;
                var rework_id = "stds_rework_input_"+key;

                var title = item.mark+'('+PURPLE(item.order_id)+')：';
                var unit = RED('&nbsp;&nbsp;'+((item.unit=="piece"||item.unit=="Piece")?"Pcs":"Set"));
                _self.work_sheet[key] = {comp_id:comp_id, rework_id:rework_id, on_make_qty:item.on_make_qty, unit:unit};

                html += DIVCH+'订单号：'+PURPLE(key)+DIVT;
                html += DIVH+title+GREEN(item.on_make_qty)+unit+DIVT;
                html += DIVRH+'<label for="'+comp_id+'" style="width:auto; padding-left:0px;">完工数量：</label><input id="'+comp_id+'" type="number" value="'+item.on_make_qty+'" style="width: 30%;">'+unit+DIVT;
                html += DIVRH+'<label for="'+comp_id+'" style="width:auto; padding-left:0px;">返工数量：</label><input id="'+rework_id+'" type="number" value="0" style="width: 30%;" disabled="disabled">'+unit+'&nbsp;&nbsp;<a class="button icon pencil" style="border: 0px" onclick="app.stationDispatchComp.getReworkInfo('+key+')"></a>'+DIVT;
            }
        } else {
            var panel = data.panel;
            var unit = RED('&nbsp;&nbsp;'+'PNL');
            _self.type_out = "panel";
            for (var key in panel) {
                var item = panel[key];
                var comp_id = "stds_comp_input_"+key;
                var rework_id = "stds_rework_input_"+key;
                _self.work_sheet[key] = {comp_id:comp_id, rework_id:rework_id, on_make_qty:item.on_make_qty, unit:unit};
                html += DIVH+'在制数量：'+GREEN(item.on_make_qty)+unit+DIVT;
                html += DIVRH+'<label for="'+comp_id+'" style="width:auto; padding-left:0px;">完工数量：</label><input id="'+comp_id+'" type="number" value="'+item.on_make_qty+'" style="width: 30%;">'+unit+DIVT;
                html += DIVRH+'<label for="'+comp_id+'" style="width:auto; padding-left:0px;"">返工数量：</label><input id="'+rework_id+'" type="number" value="0" style="width: 30%;" disabled="disabled">'+unit+'&nbsp;&nbsp;<a class="button icon pencil" style="border: 0px" onclick="app.stationDispatchComp.getReworkInfo('+key+')"></a>'+DIVT;
            }
        }
        html += DIVRH+'<label style="width:auto; padding-left:0px;"">报废：</label>'+'<a class="button icon add" style="border: 0px" onclick="app.stationDispatchComp.doDisd()"></a>'+DIVT;
        if (_self.from == 'stationDispatch') {
            var disd = app.stationDispatch.disdInfo[_self.data.wdisp_id];
            if (disd) {
                html += app.stationDispatch.updateDisdNum(_self.data.wdisp_id, true);
            }
        } else if (_self.from == 'witemDispatchDetail') {
            var disd = app.witemDispatchDetail.disdInfo[_self.data.wdisp_id];
            if (disd) {
                html += app.witemDispatchDetail.updateDisdNum(_self.data.wdisp_id, true);
            }
        } else if (_self.from == 'passNumberDetailEx') {
            var disd = app.passNumberDetailEx.disdInfo[_self.data.wdisp_id];
            if (disd) {
                html += app.passNumberDetailEx.updateDisdNum(_self.data.wdisp_id, true);
            }
        }

        html += '</li>';
        html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \'stds_comp_other_params\')">其他参数</li>';
        html += '<li>';
        html += '<div id="stds_comp_other_params" style="display: none">'+PURPLE(other_parameter)+DIVT;
        html +=  app.utils.buttonHtml([
            {text:'提交', click:'app.stationDispatchComp.submitComp()'}
        ]);
        html += '</li>';
        $('#stds_comp_list').html(html);
        $.ui.scrollToTop(app.utils.panelID(_self.id), 0);
    };
    StationDispatchComp.prototype.updateStationDispatchComp = function() {
        _self.getStationDispatchComp(_self.data.wdisp_id);
    };
    StationDispatchComp.prototype.getStationDispatchComp = function(wdisp_id) {
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
    StationDispatchComp.prototype.onGetStationDispatchCompSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        var stage = _self.data.stage;
        _self.data = data.comp_info;
        _self.data.stage = stage;
        _self.showStationDispatchComp();
        app.utils.clearWait();
    };
    StationDispatchComp.prototype.submitComp = function() {
        var sends = [];
        for (var workitem_id in _self.work_sheet) {
            var item = _self.work_sheet[workitem_id];
            var compNum = $('#'+item.comp_id).val()*1;
            var reworkNum = $('#'+item.rework_id).val()*1;
            if (compNum < 0) {
                app.utils.toast("加工单"+workitem_id+"的完工数量不能小于0");
                return;
            }
            if (reworkNum < 0) {
                app.utils.toast("加工单"+workitem_id+"的返工数量不能小于0");
                return;
            }
            if (compNum+reworkNum > item.on_make_qty) {
                app.utils.toast("加工单"+workitem_id+"的完工数量+返工数量不能大于在制数量");
                return;
            }
            if (compNum>0||reworkNum>0) {
                sends.push({workitem_id:workitem_id, compNum:compNum, reworkNum:reworkNum});
            }
        }
        if (!sends.length) {
            app.utils.toast("完工数量和返工数量不能都为0");
            return;
        }
        var comp_info = {};
        var comp = {};
        var rewk = {};
        for (var i=0,len=sends.length; i<len; i++) {
            comp[sends[i].workitem_id] = sends[i].compNum;
            rewk[sends[i].workitem_id] = sends[i].reworkNum;
        }
        comp_info.comp = comp;
        comp_info.rewk = rewk;
        comp_info.auto = _self.reworkInfo.auto_wdisps;
        comp_info.scrap_ids = _self.reworkInfo.scrap_ids;

        var param = {
            wdisp_id: _self.data.wdisp_id,
            type_out:_self.type_out,
            create_info: JSON.stringify(comp_info),
            op: 7,
            uid: app.login.userid,
            from:(_self.from==='stagePlanComp')?3:0
        }
        console.log(param);
        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onSubmitCompSuccess
        });
    };
    StationDispatchComp.prototype.onSubmitCompSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        app.utils.clearWait();

        if (_self.from === 'stationDispatch') {
            $.ui.goBack();
            app.stationDispatch.refreshCurPage();
        } else if (_self.from === 'passNumberDetailEx') {
            $.ui.goBack();
            app.passNumberDetailEx.getPassNumberList();
        } else if (_self.from === 'witemDispatchDetail') {
            if (app.witemDispatchDetail.from == 'stagePlanComp') {
                $.ui.goBack(2);
                app.stagePlanComp.updateList();
            } else {
                $.ui.goBack();
                app.witemDispatchDetail.updateWitemDispatchList();
            }
        }
    };
    StationDispatchComp.prototype.getReworkInfo = function(workitem_id) {
        _self.rework_workitem_id = workitem_id;
        var param = {
            wdisp_id: _self.data.wdisp_id,
            op: 6,
            uid: app.login.userid
        }

        var url = app.route.stationDispatchUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetReworkInfoSuccess
        });
    };
    StationDispatchComp.prototype.onGetReworkInfoSuccess = function(data) {
        console.log(data);
        if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
        app.utils.clearWait();
        require('stationDispatchRework').show(data.rework_defect, _self);
    };
    StationDispatchComp.prototype.getDisdNum = function() {
        var param = {
            wdisp_id: _self.data.wdisp_id,
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
    StationDispatchComp.prototype.onGetDisdNumSuccess = function(data) {
        app.utils.clearWait();
        console.log(data);
        if (data.success==0) {
            app.utils.showError(app.error.SERVER_ERROR);
            return;
        }

        if (_self.from == 'stationDispatch') {
            app.stationDispatch.disdInfo[_self.data.wdisp_id] = data.result;
            app.stationDispatch.updateDisdNum(_self.data.wdisp_id);
        } else if (_self.from == 'witemDispatchDetail') {
            app.witemDispatchDetail.disdInfo[_self.data.wdisp_id] = data.result;
            app.witemDispatchDetail.updateDisdNum(_self.data.wdisp_id);
        } else if (_self.from == 'passNumberDetailEx') {
            app.passNumberDetailEx.disdInfo[_self.data.wdisp_id] = data.result;
            app.passNumberDetailEx.updateDisdNum(_self.data.wdisp_id);
        }
        if (_self.needUpate) {
            _self.needUpate = null;
            _self.updateStationDispatchComp();
        } else {
            _self.showStationDispatchComp();
        }
    };
    StationDispatchComp.prototype.doDisd = function() {
        require('stationDispatchDisd').show(_self.data.wdisp_id);
    };

    return new StationDispatchComp();
});
