define(function(require) {
	"use strict";
	var _self;

	function BillDetail() {
		_self = this;
		_self.id = "billDetail";
	}
	
	BillDetail.prototype.show = function(data, type) {
        _self.data = data;
        _self.type = type;
        app.utils.loadPanel(_self.id, {footer:"none", loadfunc:_self.id+"=onLoad"});
	};
    BillDetail.prototype.release = function() {
        _self.data = null;
        _self.type = null;
    };
	BillDetail.prototype.onLoad = function() {
        var RED = app.color.RED,
            GREEN = app.color.GREEN,
            PRICE_COLOR = app.color.PRICE_COLOR,
            DIVH = '<div>',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            titles = ["应收款详情","已收款详情","未收款详情"],
            html = '',
            data = _self.data;

        $("#orbd_title").html(titles[_self.type]);

        for (var id in data) {
            var item = data[id];
            html += '<li>';
            html += DIVH+"发票号:"+RED(id)+DIVT;
            html += DIVH+'币种:'+GREEN(item.currency_id)+" 应收:"+PRICE_COLOR(item.total_charge)+' 已收:'+PRICE_COLOR(item.pay_amount)+DIVT;
            var orders = item.orders;
            html += DIVH+'相关订单:'+DIVT;
            html += '<ul class="list inset" style="margin-left:12%">';
            for (var key in orders) {
                var order = orders[key]
                html += '<li onclick="app.orderlist.showDetail('+key+')">';
                html += '<a href="#">';
                html += DIVH+'类型:'+order.req+DIVT;
                html += DIVH+'订单号:'+order.order_id+(order.order_item_id?'-'+order.order_item_id:'')+DIVT;
                html += DIVH+'客户:'+order.customer_id+DIVT;
                html += '</a>';
                html += '</li>';
            }
            html += '</ul>';
            html += '</li>';
        }
        $("#orbd_detail_list").html(html);
	};
	return new BillDetail();
});
