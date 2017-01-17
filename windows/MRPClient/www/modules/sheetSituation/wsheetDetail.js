/**
 * Created by panyun on 2015/1/21.
 */
define(function(require) {
	"use strict";
    var _self;

    function WsheetDetail() {
        _self = this;
        _self.id = "wsheetDetail";
    }

    WsheetDetail.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    WsheetDetail.prototype.release = function(data) {
        _self.data = null;
    };
    WsheetDetail.prototype.onLoad = function() {
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
        html += TDH+DIVCH+LC('创建日期:')+RCOLH+BLUE(data.create_time)+RCOLT+DIVT+TDT;
        html += TDH+LC('加工单:')+RCOLH+CC(data.wsh_name)+RCOLT+TDT;
        html += TDH+LC('版本:')+RCOLH+CC(data.version)+RCOLT+TDT;
        html += TDH+LC('优先级:')+RCOLH+CC(data.priority)+RCOLT+TDT;
        html += TDH+LC('加工状态:')+RCOLH+CC(data.status)+RCOLT+TDT;
        html += TDH+LC('加工数量:')+RCOLH+GREEN(data.require_qty+"PNL")+RCOLT+TDT;
        html += TDH+LC('面积:')+RCOLH+GREEN(data.require_area+"m<sup>2</sup>")+RCOLT+TDT;
        html += TDH + LC('投料数量:') + RCOLH + CC(data.feed_qty+"PNL") + RCOLT + TDT;
        html += TDH + LC('完工数量:') + RCOLH + CC(data.comp_qty+"PNL") + RCOLT + TDT;
        html += TDH+LC('报废数量:')+RCOLH+CC(data.disd_qty+"PCS")+RCOLT+TDT;
        html += TDH+LC('计划开始时间:')+RCOLH+CC(data.plan_begin_time)+RCOLT+TDT;
        html += TDH+LC('计划结束时间:')+RCOLH+CC(data.plan_finish_time)+RCOLT+TDT;
        html += TDH+LC('实际开始时间:')+RCOLH+CC(data.real_begin_time)+RCOLT+TDT;
        html += TDH+LC('最后更新时间:')+RCOLH+CC(data.updatetime)+RCOLT+TDT;
        html += TDH+LC('加工对象:')+RCOLH+CC(data.workitem_name)+RCOLT+TDT;
        var order_name = "";
        for(var i in data.order_name){
            if(order_name)
                order_name += "<br/>"+data.order_name[i];
            else order_name += data.order_name[i];
        }
        html += TDH+LC('订单:')+RCOLH+CC(data.order_name)+RCOLT+TDT;
        html += TDH+LC('订单下单时间:')+RCOLH+CC(order_name)+RCOLT+TDT;
        html += TDH+LC('订单期望时间:')+RCOLH+CC(data.order_expect_time)+RCOLT+TDT;
        html += TDH+LC('材料:')+RCOLH+CC(data.material)+RCOLT+TDT;
        var panel_unit_qty = "";
        for(var i in data.panel_unit_qty){
            if(panel_unit_qty)
                panel_unit_qty += "<br/>"+data.panel_unit_qty[i];
            else panel_unit_qty += data.panel_unit_qty[i];
        }
        html += TDH+LC('PNL单元数:')+RCOLH+CC(panel_unit_qty)+RCOLT+TDT;
        var set_unit_qty = "";
        for(var i in data.set_unit_qty){
            if(set_unit_qty)
                set_unit_qty += "<br/>"+data.set_unit_qty[i];
            else set_unit_qty += data.set_unit_qty[i];
        }
        html += TDH+LC('SET单元数:')+RCOLH+CC(set_unit_qty)+RCOLT+TDT;
        html += TDH+LC('开料尺寸:')+RCOLH+CC(data.cutting_size+"mm")+RCOLT+TDT;
        html += TDH+LC('层数:')+RCOLH+CC(data.layer)+RCOLT+TDT;
        html += TDH+LC('产品类型:')+RCOLH+CC(data.product_type)+RCOLT+TDT;
        html += TDH+LC('铜厚:')+RCOLH+CC(data.cop_weight)+RCOLT+TDT;
        html += TDH+LC('板厚:')+RCOLH+CC(data.thickness)+RCOLT+TDT;
        html += TDH+LC('创建人:')+RCOLH+CC(data.create_user)+RCOLT+TDT;
        html += '</li>';
        //console.log(html);
        $('#wsheet_detail').html(html);
    };
    return new WsheetDetail();
});
