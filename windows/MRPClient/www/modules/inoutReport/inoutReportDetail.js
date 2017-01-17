define(function(require) {
	"use strict";
    var _self;

    function InoutReportDetail() {
        _self = this;
		_self.id = "inoutReportDetail";
    }

    InoutReportDetail.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
    };
    InoutReportDetail.prototype.onLoad = function() {
        if (_self.data) {
            var data = _self.data;
            _self.data = null;
            _self.showInoutReportDetail(data);
        }
    };
    InoutReportDetail.prototype.showInoutReportDetail = function(data) {
        var AREA_COLOR = app.color.AREA_COLOR,
            BLUE = app.color.BLUE,
            html = '';
        html += '<li>';
        html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">本期下单:</h2>';
        html += '<div style="margin-bottom: 6px;">净面积:'+AREA_COLOR(data.current_period_order.order_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">材料毛面积:'+AREA_COLOR(data.current_period_order.material_gross_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">材料净面积:'+AREA_COLOR(data.current_period_order.material_net_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">材料利用率:'+BLUE(data.current_period_order.material_ratio)+'</div>';
        html += '</li>';

        html += '<li>';
        html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">本期投产:</h2>';
        html += '<div style="margin-bottom: 6px;">投产毛面积:'+AREA_COLOR(data.current_period_produce.produce_gross_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">投产净面积:'+AREA_COLOR(data.current_period_produce.produce_net_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">材料利用率:'+BLUE(data.current_period_produce.material_ratio)+'</div>';
        html += '<div style="margin-bottom: 6px;">出货率:'+BLUE(data.current_period_produce.shipment_ratio)+'</div>';
        html += '<div style="margin-bottom: 6px;">报废毛面积:'+AREA_COLOR(data.current_period_produce.disd_gross_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">毛面积报废率:'+BLUE(data.current_period_produce.gross_area_disd_ratio)+'</div>';
        html += '<div style="margin-bottom: 6px;">报废净面积:'+AREA_COLOR(data.current_period_produce.disd_net_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">净面积报废率:'+BLUE(data.current_period_produce.net_area_disd_ratio)+'</div>';
        html += '</li>';

        html += '<li>';
        html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">本期完工:</h2>';
        html += '<div style="margin-bottom: 6px;">毛面积:'+AREA_COLOR(data.current_period_complete.gross_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">净面积:'+AREA_COLOR(data.current_period_complete.net_area)+'平米</div>';
        html += '<div style="margin-bottom: 6px;">材料利用率:'+BLUE(data.current_period_complete.material_ratio)+'</div>';
        html += '</li>';

        $('#iord_list').html(html);
    };

    return new InoutReportDetail();
});
