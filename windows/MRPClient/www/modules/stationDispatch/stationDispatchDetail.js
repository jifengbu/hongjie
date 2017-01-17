define(function(require) {
	"use strict";
    var _self;

    function StationDispatchDetail() {
        _self = this;
		_self.id = "stationDispatchDetail";
    }

    StationDispatchDetail.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StationDispatchDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (_self.data) {
            var data = _self.data;
            _self.data = null;
            $('#stds_detail_title').html(data.Workdispatch);
            _self.showStationDispatchDetail(data);
        }
    };
    StationDispatchDetail.prototype.showStationDispatchDetail = function(data) {
        var AREA_COLOR = app.color.AREA_COLOR,
            PRICE_COLOR = app.color.PRICE_COLOR,
            PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            COUNT_COLOR = app.color.COUNT_COLOR,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '';

        var fixNull = function (value) {
            return value?GREEN(value):RED("无");
        }

        html += '<li>';
        html += DIVH+'工序名称:'+fixNull(data.Name)+DIVT;
        var pnl_name = data.pnl_name||"";
        pnl_name = pnl_name.replace(/<.*>(.*)<.*>/, '$1');
        html += DIVH+'拼版名称:'+fixNull(pnl_name)+DIVT;
        var WsheetName = data.WsheetName||"";
        WsheetName = WsheetName.replace(/<.*>(.*)<.*>/, '$1');
        html += DIVH+'加工单名称:'+fixNull(WsheetName)+DIVT;
        html += DIVH+'计划开始时间:'+fixNull(data.TimestartRequired)+DIVT;
        html += DIVH+'计划结束时间:'+fixNull(data.TimeendRequired)+DIVT;
        html += DIVH+'指派给:'+fixNull(data.AssignTo)+DIVT;
        html += DIVH+'类型:'+fixNull(data.DispType)+DIVT;
        html += DIVH+'工作量:'+fixNull(data.Workload)+DIVT;
        html += '</li><li>';
        html += DIVH+'加工时间:'+fixNull(data.WorkloadProcess)+DIVT;
        html += DIVH+'开始时间:'+fixNull(data.TimeStart)+DIVT;
        html += DIVH+'最后更新时间:'+fixNull(data.updatetime)+DIVT;
        html += DIVH+'计划数量:'+fixNull(data.RequireQty)+DIVT;
        html += DIVH+'在制数量:'+fixNull(data.OnMake)+DIVT;
        html += DIVH+'未接收数量:'+fixNull(data.NoRecvQty)+DIVT;
        html += DIVH+'完工数量:'+fixNull(data.CompQty)+DIVT;
        html += '</li><li>';
        var other_parameter = data.par||"";
        other_parameter = other_parameter.replace(/\n/g, "<br />");
        html += DIVH+'其他参数:'+PURPLE(other_parameter)+DIVT;
        html += '</li><li>';
        html += DIVH+'物料单:'+fixNull(data.bom)+DIVT;
        html += DIVH+'文件:'+fixNull(data.file)+DIVT;
        html += DIVH+'过数类型:'+fixNull(data.product_configuration)+DIVT;
        html += DIVH+'特别要求:'+fixNull(data.special_requirement)+DIVT;
        html += DIVH+'备注:'+fixNull(data.Note)+DIVT;
        html += '</li>';
        $('#stds_detail_list').html(html);
        $.ui.scrollToTop(app.utils.panelID(_self.id), 0);
    };

    return new StationDispatchDetail();
});
