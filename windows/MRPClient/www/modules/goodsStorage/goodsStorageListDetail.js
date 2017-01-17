define(function(require) {
	"use strict";
	var _self;

	function GoodsStorageListDetail() {
		_self = this;
		_self.id = "goodsStorageListDetail";
	}

	GoodsStorageListDetail.prototype.show = function(data) {
		_self.data = data;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	GoodsStorageListDetail.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			var data = _self.data;
			_self.data = null;
			_self.showPanel(data);
		}
	};
	GoodsStorageListDetail.prototype.showPanel = function (data) {
		var GREEN = app.color.GREEN,
			BLUE = app.color.BLUE,
			html = '';
		console.log(data);
		html += '<li>';
		html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">基本信息:</h2>';
		html += '<div style="margin-bottom: 6px;">订单号:'+GREEN(data.order_name)+'</div>';
		html += '<div style="margin-bottom: 6px;">客户ID:'+BLUE(data.customer_id)+'</div>';
		html += '<div style="margin-bottom: 6px;">产品类型:'+GREEN(data.req)+'</div>';
		html += '<div style="margin-bottom: 6px;">交期:'+BLUE(data.expected_time)+'</div>';
		html += '<div style="margin-bottom: 6px;">收货日期:'+GREEN(data.rec_time)+'</div>';
		html += '<div style="margin-bottom: 6px;">工厂编号:'+BLUE(data.factory_contact_id)+'</div>';
		html += '<div style="margin-bottom: 6px;">检测人:'+GREEN(data.verify_user)+'</div>';
		html += '</li>';
		html += '<li>';
		html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">数量信息:</h2>';
		html += '<div style="margin-bottom: 6px;">订购数量:'+GREEN(data.required_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">生产数量:'+BLUE(data.produced_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">订购数量:'+GREEN(data.required_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">接收但未入库数量:'+BLUE(data.only_receive)+'</div>';
		html += '<div style="margin-bottom: 6px;">入库数量:'+GREEN(data.instock_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">出库数量:'+BLUE(data.outstock_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">现有库存:'+GREEN(data.stock_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">现有客户库存数量:'+BLUE(data.customer_stock_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;">报废数量:'+GREEN(data.discard_qty)+'</div>';
		html += '<div style="margin-bottom: 6px;">申请报废数量:'+BLUE(data.apply_discard_qty)+'</div>';
		html += '</li>';
		html += '<li>';
		html += '<h2 style="background-color:#D3D3D3; margin-bottom: 6px;">其他信息:</h2>';
		html += '<div style="margin-bottom: 6px;">客户产品编号:'+GREEN(data.part_no)+'</div>';
		html += '<div style="margin-bottom: 6px;">内部产品编号:'+BLUE(data.produced_no)+'</div>';
		html += '<div style="margin-bottom: 6px;">是否可以发货:'+GREEN(data.deliver_enable)+'</div>';
		html += '<div style="margin-bottom: 6px;">item唯一ID:'+BLUE(data.qo_item_id)+'</div>';
		html += '<div style="margin-bottom: 6px;">库位代码:'+GREEN(data.loca_code)+'</div>';
		html += '<div style="margin-bottom: 6px;">仓库名称:'+BLUE(data.depot_name)+'</div>';
		html += '<div style="margin-bottom: 6px;">国家代码:'+GREEN(data.country)+'</div>';
		html += '<div style="margin-bottom: 6px;">关联fab:'+BLUE(data.fab_item_id)+'</div>';
		html += '<div style="margin-bottom: 6px;">关联part:'+GREEN(data.part_item_id)+'</div>';
		html += '<div style="margin-bottom: 6px;">关联assemble:'+BLUE(data.ass_item_id)+'</div>';
		html += '</li>';
		$('#gostld_list').html(html);
	};
	return new GoodsStorageListDetail();
});
