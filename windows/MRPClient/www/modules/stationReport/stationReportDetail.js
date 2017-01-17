define(function(require) {
	"use strict";
    var _self;

    function StationReportDetail() {
        _self = this;
		_self.id = "stationReportDetail";
    }

    StationReportDetail.prototype.show = function(data, type, stage_meta_id, stage_name) {
        _self.data = data;
        _self.type = type;
        _self.stage_name = stage_name;
        _self.stage_meta_id = stage_meta_id;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StationReportDetail.prototype.release = function(data) {
        _self.data = null;
        _self.stage_name = null;
    };
    StationReportDetail.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            PURPLE = app.color.PURPLE,
            LC = app.color.OLIVEDRAB,
            CC = app.color.STEELBLUE,
            PNL_COLOR = app.color.PNL_COLOR,
            PCS_COLOR = app.color.PCS_COLOR,
            TDH = '<table width="100%" style="border-spacing:0px;color: inherit;font: inherit;"><tr><td><div>',
            TDT = '</div></td></tr></table>',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            RCOLH = '<span class="rightcol">',
            RCOLT = '</span>',
            html = '',
            data = _self.data;

        html += '<li>';
        html += TDH+DIVCH+LC('工序:')+RCOLH+BLUE(_self.stage_name)+RCOLT+DIVT+TDT;
        html += TDH+LC('派工单号:')+RCOLH+CC(data.disp_name)+RCOLT+TDT;
        html += TDH+LC('派工单名称:')+RCOLH+CC(data.dispatch_name)+RCOLT+TDT;
        html += TDH+LC('板名称:')+RCOLH+CC(data.witem_name)+RCOLT+TDT;
        html += TDH+LC('本厂编号:')+RCOLH+CC(data.factory_self_no)+RCOLT+TDT;
        html += TDH+LC('开料尺寸:')+RCOLH+GREEN(data.cutting_size_length+"*"+data.cutting_size_width+data.cutting_size_unit)+RCOLT+TDT;
        html += TDH+LC('面积:')+RCOLH+GREEN(data.pro_area)+RCOLT+TDT;

        if (data.unit == "PNL") {
            html += TDH+LC('数量:')+RCOLH+PNL_COLOR(data.qty)+RED(data.unit)+RCOLT+TDT;
        } else {
            html += TDH+LC('数量:')+RCOLH+PCS_COLOR(data.qty)+RED(data.unit)+PURPLE("("+data.order_id+")")+RCOLT+TDT;
        }
        html += TDH + LC('更新时间:') + RCOLH + CC(data.timestamp) + RCOLT + TDT;
        html += TDH + LC('投产时间:') + RCOLH + CC(data.time_start) + RCOLT + TDT;
        html += TDH+LC('上工序:')+RCOLH+CC(data.pre_stgmeta)+RCOLT+TDT;
        if (data.pre_stgmeta_comp_time) {
            html += TDH + LC('上工序完工时间:') + RCOLH + CC(data.pre_stgmeta_comp_time) + RCOLT + TDT;
        }
        html += TDH+LC('下工序:')+RCOLH+CC(data.next_stgmeta)+RCOLT+TDT;
        if (data.next_stgmeta_recv_time) {
            html += TDH + LC('下工序接收时间:') + RCOLH + CC(data.next_stgmeta_recv_time) + RCOLT + TDT;
        }
        html += TDH+LC('状态:')+RCOLH+CC(data.state)+RCOLT+TDT;
        html += TDH+LC('交期:')+RCOLH+CC(data.expected_time)+RCOLT+TDT;
        html += '</li>';

        if (!data.wsheet_outsource) {
            if (_self.type == 0/*计划*/ ||
                (_self.type == 3/*全部*/ && data.state_type != "complete" && data.state_type != "closed" && data.state_type != "cancelled" && data.isremoved == "0" && data.wsheet_state != "completed" && data.wsheet_state != "closed" && data.wsheet_state != "stop" && data.wsheet_state != "canceled" && data.wsheet_state != "cancelled" && data.wsheet_state != "hold")) {
                html += app.utils.buttonHtml([
                    {text: '报工', click: 'app.stationReportDetail.showDispatch()'}
                ]);
            }
        }

        //console.log(html);
        $('#strpd_list').html(html);
    };
    StationReportDetail.prototype.showDispatch = function() {
        //_self.data.wdisp_id
        var stationDispatch = require('stationDispatch');
        stationDispatch.searchInfo = {
            stage:_self.stage_meta_id,
            state:2,
            filter:2,
            filter_value:_self.data.dispatch_name
        };
        console.log(stationDispatch.searchInfo);
        require('stationDispatch').show(1);
    };
    return new StationReportDetail();
});
