define(function(require) {
	"use strict";
	var _self;

	function PartDetail() {
		_self = this;
		_self.id = "partDetail";
	}

	PartDetail.prototype.show = function(data, partInfo, part_id) {
		_self.data = data;
		_self.partInfo = partInfo;
		_self.part_id = part_id;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	PartDetail.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			_self.showPanel();
		}
	};
	PartDetail.prototype.release = function (data) {
		_self.data = null;
		_self.partInfo = null;
		_self.part_id = null;
	};
	PartDetail.prototype.showPanel = function () {
		var BLUE = app.color.BLUE,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			LIGHTBLUE = app.color.LIGHTBLUE,
			DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
			STEELBLUE = app.color.STEELBLUE,
			PURPLE = app.color.PURPLE,
			DIVH = '<div style="margin-bottom: 6px;">',
			DIVT = '</div>',
			html = '';
		var data = _self.data;
		var result_details = data.result_detail;

		var index = 0;
		for (var i in result_details) {
			var result_detail = result_details[i];
			if (result_detail.part_id != _self.part_id) {
				continue;
			}
			html += '<li>';
			html += DIVH + '元件ID:' + BLUE(result_detail.part_id) + DIVT;
			html += DIVH + '物料款数:' + BLUE(result_detail.application_amount) + DIVT;
			html += DIVH + '返回物料款数:' + RED(result_detail.application_return_amount) + DIVT;
			/*html += DIVH+'是否提交:' + BLUE(result_detail.is_application) + DIVT;
			 html += DIVH+'动作:' + GREEN(result_detail.action) + DIVT;
			 html += DIVH+'批次号:' + BLUE(result_detail.batch_number) + DIVT;
			 html += DIVH+'收集数量:' + GREEN(result_detail.collection_amount) + DIVT;
			 html += DIVH+'添加时间:' + BLUE(result_detail.date_added) + DIVT;
			 html += DIVH+'直接给用户:' + GREEN(result_detail.direct_to_customer) + DIVT;
			 html += DIVH+'早期传送数量:' + BLUE(result_detail.early_transfer_amount) + DIVT;
			 html += DIVH+'是否早期传送:' + GREEN(result_detail.is_early_transfer) + DIVT;
			 html += DIVH+'交期:' + BLUE(result_detail.expected_time) + DIVT;
			 html += DIVH+'fab关联:' + GREEN(result_detail.fab_item_id) + DIVT;
			 html += DIVH+'工厂确认动作:' + BLUE(result_detail.factory_confirm_action) + DIVT;
			 html += DIVH+'工厂确认人:' + GREEN(result_detail.factory_confirm_user) + DIVT;
			 html += DIVH+'工厂确认数量:' + BLUE(result_detail.factory_confirm_quantity) + DIVT;
			 html += DIVH+'工厂返回数量:' + GREEN(result_detail.factory_return_amount) + DIVT;
			 html += DIVH+'最后修改时间:' + BLUE(result_detail.last_modified) + DIVT;
			 html += DIVH+'装载数量:' + BLUE(result_detail.load_amount) + DIVT;
			 html += DIVH+'返回数量:' + GREEN(result_detail.return_amount) + DIVT;
			 html += DIVH+'备注:' + BLUE(result_detail.commnet) + DIVT;*/
			html += '</li><li>';

			var part_info = _self.partInfo;
			var part = null;
			for (var j in part_info) {
				var item = part_info[j];
				if (item.part_id == result_detail.part_id) {
					html += DIVH + 'Myro Model:' + PURPLE(item.my_model) + DIVT;
					html += DIVH + 'Myro No.:' + STEELBLUE(item.myro_name) + DIVT;
					html += DIVH + '制造商:' + LIGHTBLUE(item.part_vendors) + DIVT;
					html += DIVH + '公开:' + GREEN(item.public) + DIVT;
					html += DIVH + '保质期:' + DARKOLIVEGREEN(item.guarantee_period) + RED(item.guarantee_period_unit) + DIVT;
					html += DIVH + '元件类型:' + STEELBLUE(item.category) + DIVT;
					html += DIVH + '物料类型:' + LIGHTBLUE(item.material_type) + DIVT;
					html += DIVH + '添加日期:' + GREEN(item.date_added) + DIVT;
					html += DIVH + '最后修改:' + RED(item.last_modified) + DIVT;

					part = item;
					break;
				}
			}
			html += '</li>';
			if (part) {
				html += '<li>';
				html += DIVH + '参数:' + DIVT;
				html += '<ul class="list inset">';
				var param = part.part_param;
				var colors = [STEELBLUE, LIGHTBLUE, DARKOLIVEGREEN];
				var colorIndex = 0;
				for (var key in param) {
					var value = param[key];
					if (value) {
						html += DIVH + key+' : '+ colors[colorIndex](value) + DIVT;
						colorIndex = (colorIndex===2)?0:colorIndex+1;
					}
				}
				html += '</ul>';
				html += '</li>';
			}
		}
		$('#partdt_list').html(html);
	};
	return new PartDetail();
});
