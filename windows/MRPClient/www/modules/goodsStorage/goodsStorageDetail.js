define(function(require) {
	"use strict";
	var _self;

	function GoodsStorageDetail() {
		_self = this;
		_self.id = "goodsStorageDetail";
	}

	GoodsStorageDetail.prototype.show = function(data) {
		_self.data = data;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	GoodsStorageDetail.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			var data = _self.data;
			_self.data = null;
			_self.showPanel(data);
		}
	};
	GoodsStorageDetail.prototype.showPanel = function (data) {
		var GREEN = app.color.GREEN,
			BLUE = app.color.BLUE,
			html = '';
		console.log(data);
		html += '<li>';
		html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">基本信息:</h2>';
		html += '<div style="margin-bottom: 6px;">订单号:'+GREEN(data.items)+'</div>';
		html += '<div style="margin-bottom: 6px;">产品类型:'+GREEN(data.req)+'</div>';
		html += '<div style="margin-bottom: 6px;">状态:'+BLUE(data.status)+'</div>';
		html += '<div style="margin-bottom: 6px;">交期:'+GREEN(data.expected_time)+'</div>';
		html += '<div style="margin-bottom: 6px;">加急层度:'+BLUE(data.urgency_level)+'</div>';
		html += '<div style="margin-bottom: 6px;">客户ID:'+GREEN(data.customer_id)+'</div>';
		html += '<div style="margin-bottom: 6px;">工厂编号:'+GREEN(data.factory_id)+'</div>';
		html += '</li>';
		html += '<li>';
		html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">数量信息:</h2>';
		html += '<div style="margin-bottom: 6px;">描述:'+BLUE(data.description)+'</div>';
		html += '<div style="margin-bottom: 6px;">订购数量:'+BLUE(data.required_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">生产数量:'+GREEN(data.produced_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">未接收数量:'+GREEN(data.no_receive_qty)+'</div>';
		html += '<div style="margin-bottom: 6px;">已接收数量:'+BLUE(data.receive_qty)+'</div>';
		html += '</li>';
		html += '<li>';
		html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">其他信息:</h2>';
		html += '<div style="margin-bottom: 6px;">客户产品编号:'+GREEN(data.part_no)+'</div>';
		html += '<div style="margin-bottom: 6px;">内部产品编号:'+GREEN(data.produced_no)+'</div>';
		html += '<div style="margin-bottom: 6px;">ITEM唯一ID:'+BLUE(data.qo_item_id)+'</div>';
		html += '<div style="margin-bottom: 6px;">关联fab:'+BLUE(data.fab_item_id)+'</div>';
		html += '</li>';
		$('#gostd_list').html(html);
	};
	return new GoodsStorageDetail();
});
