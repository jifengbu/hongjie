define(function(require) {
	"use strict";
    var _self;

    function StationDispatchRework() {
        _self = this;
		_self.id = "stationDispatchRework";
    }

    StationDispatchRework.prototype.show = function(data, parent) {
        _self.data = data;
        _self.parent = parent;
        app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
    };
    StationDispatchRework.prototype.onLoad = function() {
       _self.showStationDispatchRework(_self.data);
    };
    StationDispatchRework.prototype.release = function() {
        _self.data = null;
        _self.parent = null;
    };
    StationDispatchRework.prototype.showStationDispatchRework = function(data) {
        var AREA_COLOR = app.color.AREA_COLOR,
            PRICE_COLOR = app.color.PRICE_COLOR,
            PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;">',
            DIVT = '</div>',
            input_id = "stds_rework_input",
            html = '';

        var workitem_id = _self.parent.rework_workitem_id;
        var unit = RED('&nbsp;&nbsp;'+_self.parent.work_sheet[workitem_id].unit);
        var reworkNum =  $('#'+_self.parent.work_sheet[workitem_id].rework_id).val();

        var checked = "";
        var auto_wdisps = _self.parent.reworkInfo.auto_wdisps;
        for (var i=0,len=auto_wdisps.length; i<len; i++) {
            if (auto_wdisps[i] == workitem_id) {
                checked = "checked";
                break;
            }
        }

        html += '<li>';
        html += DIVCH+'报工工位：'+GREEN(_self.parent.data.stage)+DIVT;
        html += DIVH+'加工单号：'+GREEN(_self.parent.rework_workitem_id)+DIVT;
        html += DIVH+'返工派工单：'+GREEN(_self.parent.data.wdisp_name)+DIVT;
        html += DIVH+'在制数量：'+_self.parent.work_sheet[_self.parent.rework_workitem_id].on_make_qty+unit+DIVT;
        html += DIVH+'<label for="'+input_id+'" style="width:auto; padding-left:0px;">返工数量：</label><input id="'+input_id+'" type="number" value="'+reworkNum+'" style="width: 30%;">'+unit+DIVT;

        html += DIVH+'<label for="stds_rework_bug" style="width:auto; padding-left:0px;">缺陷名称：</label><select id="stds_rework_bug" style="width: 60%;">';
        for (var scrap_id in data) {
            html += '<option value="'+scrap_id+'">'+data[scrap_id]+'</option>';
        }
        html += '</select>'+DIVT;

        html += DIVH+'<input id="stds_rework_auto_wdisp" type="checkbox" '+checked+'><label for="stds_rework_auto_wdisp" style="float:left;width:auto;left:1em;">自动创建返工派工单</label>'+DIVT;
        html += '<input type="text" style="visibility: hidden;">';
        html +=  app.utils.buttonHtml([
            {text:'确定', click:'app.stationDispatchRework.doSetReworkNum()'}
        ]);
        html += '</li>';
        $('#stds_rework_list').html(html);
    };
    StationDispatchRework.prototype.doSetReworkNum = function() {
        var workitem_id = _self.parent.rework_workitem_id;
        var max = _self.parent.work_sheet[_self.parent.rework_workitem_id].on_make_qty;
        var rework_qty = $("#stds_rework_input").val();
        if (rework_qty <= 0) {
            app.utils.toast("报废数量不能小于或等于0");
            return;
        }
        if (rework_qty > max) {
            app.utils.toast("报废数量不能大于在制数量");
            return;
        }
        $('#'+_self.parent.work_sheet[workitem_id].rework_id).val(rework_qty);

        var auto_wdisp = $("#stds_rework_auto_wdisp").prop("checked");
        var auto_wdisps = _self.parent.reworkInfo.auto_wdisps;
        var scrap_ids = _self.parent.reworkInfo.scrap_ids;

        if (auto_wdisp) {
            auto_wdisps.push(workitem_id);
        } else {
            for (var i=0,len=auto_wdisps.length; i<len; i++) {
                if (auto_wdisps[i] == workitem_id) {
                    auto_wdisps.splice(i, 1);
                    break;
                }
            }
        }

        var rework_bug = $("#stds_rework_bug").val()||"";
        scrap_ids[workitem_id] = rework_bug;
        app.utils.hideModal();
    };
    return new StationDispatchRework();
});
