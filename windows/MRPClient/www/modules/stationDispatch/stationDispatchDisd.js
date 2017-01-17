define(function(require) {
	"use strict";
    var _self;

    function StationDispatchDisd() {
        _self = this;
		_self.id = "stationDispatchDisd";
    }

    StationDispatchDisd.prototype.show = function(wdisp_id) {
        _self.wdisp_id = wdisp_id;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StationDispatchDisd.prototype.onLoad = function() {
        if (_self.last_wdisp_id != _self.wdisp_id) {
            _self.last_wdisp_id = _self.wdisp_id;
            _self.otherInfo = {};
            _self.getReadyForDisd();
        } else {
           _self.showStationDispatchDisd();
        }
    };
    StationDispatchDisd.prototype.release = function() {
        _self.wdisp_id = null;
        _self.last_wdisp_id = null;
        _self.data = null;
        _self.otherInfo = null;
    };
    StationDispatchDisd.prototype.showStationDispatchDisd = function() {
        var html, type;
        var data = _self.data;

        var witem_type = data.witem_type;
        html = '';
        for (var i in witem_type) {
            var item = witem_type[i];
            var select = '';
            if (item[2]*1) {
                select = ' selected';
                type = item[0];
            }
            html += '<option value="'+item[0]+'"'+select+'>'+item[1]+'</option>';
        }
        $('#sdpd_witem_type').html(html);

        _self.changeWitemType(type||'panel');

        _self.changeDefectList(data.defect_list);

        var scrap_wstage = data.scrap_wstage;
        html = '';
        for (var i in scrap_wstage) {
            var item = scrap_wstage[i];
            var select = '';
            if (item[3]*1) {
                _self.otherInfo[item[0]] = data.defect_list;
                select = ' selected';
            }
            html += '<option value="'+item[0]+'"'+select+'>'+item[1]+'</option>';
        }
        $('#sdpd_scrap_wstage').html(html);
    };
    StationDispatchDisd.prototype.changeWitemType = function(type) {
        var data = _self.data;
        var html = '';
        var index = (type==='piece')?4:2;
        var witem = data.obj_list[type];
        for (var i in witem) {
            var item = witem[i];
            var select = '';
            if (item[index]*1) {
                select = ' selected';
            }
            html += '<option value="'+item[0]+'"'+select+'>'+item[1]+'</option>';
        }
        if (type == 'accumulative') {
            $('#sdpd_defect_content').hide();
        } else {
            $('#sdpd_defect_content').show();
        }
        $('#sdpd_witem').html(html);
    };
    StationDispatchDisd.prototype.changeWstage = function(wshstg_id) {
        if (!_self.otherInfo[wshstg_id]) {
            _self.getDefect(wshstg_id);
        } else {
            _self.changeDefectList(_self.otherInfo[wshstg_id]);
        }
    };
    StationDispatchDisd.prototype.changeDefectList = function(defect_list) {
        var html = '';
        for (var i in defect_list) {
            var item = defect_list[i];
            html += '<option value="'+item[0]+'">'+item[1]+'</option>';
        }
        $('#sdpd_defect').html(html);
    };
    StationDispatchDisd.prototype.getReadyForDisd = function() {
        var param = {
            wdisp_id: _self.wdisp_id,
            uid: app.login.userid
        }

        var url = app.route.getReadyForDisd+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetReadyForDisdSuccess
        });
    };
    StationDispatchDisd.prototype.onGetReadyForDisdSuccess = function(data) {
        app.utils.clearWait();
        console.log(data);
        if (data.success==0) {
            app.utils.showError(app.error.SERVER_ERROR);
            return;
        }
        _self.data = data.result;
        _self.showStationDispatchDisd();
    };
    StationDispatchDisd.prototype.getDefect = function(wshstg_id) {
        _self.select_wshstg_id = wshstg_id;
        var param = {
            wshstg_id: wshstg_id,
            uid: app.login.userid
        };
        var url = app.route.getDefect+'?'+$.param(param);
        console.log(url);

        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetDefectSuccess
        });
    };
    StationDispatchDisd.prototype.onGetDefectSuccess = function(data) {
        app.utils.clearWait();
        console.log(data);
        if (data.success==0) {
            app.utils.showError(app.error.SERVER_ERROR);
            return;
        }
        _self.otherInfo[_self.select_wshstg_id] = data.result;
        _self.select_wshstg_id = null;
        _self.changeDefectList(data.result);
    };
    StationDispatchDisd.prototype.applyDisd = function() {
        var disd_qty = $('#sdpd_disd_qty').val();
        if (disd_qty <= 0) {
            app.utils.toast("报废数量不能为0或负数");
            return;
        }
        var witem_type = $('#sdpd_witem_type').val();
        var object_id = $('#sdpd_witem').val();
        var wshstg_id = (witem_type==='accumulative')?'':$('#sdpd_scrap_wstage').val();
        var defect_id = $('#sdpd_defect').val();
        var note = $('#sdpd_note').val();

        var param = {
            wdisp_id: _self.wdisp_id,
            uid: app.login.userid
        };
        var url = app.route.applyDisd+'?'+$.param(param);
        console.log(url);

        var data = {
            list:JSON.stringify([
                {
                    witem_type:witem_type,
                    object_id:object_id,
                    wshstg_id:wshstg_id,
                    defect_id:defect_id,
                    disd_qty:disd_qty
                }
            ]),
            note:note
        };
        console.log(data);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "POST",
            url : url,
            data : $.param(data),
            success : _self.onApplyDisdSuccess
        });
    };
    StationDispatchDisd.prototype.onApplyDisdSuccess = function(data) {
        app.utils.clearWait();
        console.log(data);
        if (data.success==0) {
            app.utils.showError(data.result);
            return;
        }
        app.stationDispatchComp.needUpate = true;
        if (app.stationDispatchComp.from == "stationDispatch") { //如果是来自派工单，需要更新,否则只更新上一个界面
            $.ui.goBack(2);
            app.stationDispatch.needUpateDispatchComp = function() {
                app.stationDispatch.getStationDispatchComp(_self.wdisp_id);
            };
            app.stationDispatch.refreshCurPage();
        } else {
            $.ui.goBack();
        }
    };
    return new StationDispatchDisd();
});
