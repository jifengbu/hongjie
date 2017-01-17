define(function(require) {
	"use strict";
	var _self;

	function MaterialListDetail() {
		_self = this;
		_self.id = "materialListDetail";
	}

	MaterialListDetail.prototype.show = function(data, partInfo) {
		_self.data = data;
		_self.partInfo = partInfo;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	MaterialListDetail.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			_self.showPanel();
		}
	};
	MaterialListDetail.prototype.release = function (data) {
		_self.data = null;
		_self.partInfo = null;
	};
	MaterialListDetail.prototype.showPanel = function () {
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
		var result_info = data.result_info;
		var result_details = data.result_detail;
		var check_history = data.check_history;
		var STATUS = {pengding: '未审核', inventory:'已出库', approvel:'已审核', finish:'已完成'};
		var space = "&nbsp;&nbsp;&nbsp;";

		html += '<li class="divider expanded" onclick="app.utils.showHide(this, \'maldet_base_info\')">基本信息:</li>';
		html += '<li id="maldet_base_info">';
		html += DIVH+'申请单号:'+GREEN(result_info.application_number)+DIVT;
		html += DIVH+'提交人ID:'+GREEN(result_info.application_user_id)+space+'状态:'+BLUE(STATUS[result_info.status])+DIVT;
		html += DIVH+'提交时间:'+BLUE(result_info.application_date)+DIVT;
		html += DIVH+'工厂:'+GREEN(result_info.factory_name)+'['+BLUE(result_info.factory_id)+']'+DIVT;
		html += DIVH+'员工:'+GREEN(result_info.employee_name)+'['+BLUE(result_info.employee_id)+']'+space+'部门:'+GREEN(result_info.organization_name)+'['+BLUE(result_info.use_organization_id)+']'+DIVT;
		html += DIVH+':用途'+GREEN(result_info.purpose_comment)+DIVT;
		html += DIVH+'是否能出库:'+BLUE(result_info.is_takeout)+space+'是否能审核:'+GREEN(result_info.is_check)+DIVT;
		html += '</li>';
		html += '<li class="divider">物料信息:</li>';
		html += '<ul class="list inset">';
		var index = 0;
		for (var i in result_details) {
			var result_detail = result_details[i];
			var id = 'maldet_'+index++;
			html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \''+id+'\')">原件ID:' + DARKOLIVEGREEN(result_detail.part_id) + '</li>';
			html += '<li id="'+id+'" style="display:none">';
			html += DIVH+'物料款数:' + BLUE(result_detail.application_amount) + DIVT;
			html += DIVH+'返回物料款数:' + RED(result_detail.application_return_amount) + DIVT;
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
			var part_info = _self.partInfo;
			var part = null;
			for (var j in part_info) {
				var item = part_info[j];
				if (item.part_id == result_detail.part_id) {
					html += DIVH+'Myro Model:'+PURPLE(item.my_model)+DIVT;
					html += DIVH+'Myro No.:'+STEELBLUE(item.myro_name)+DIVT;
					html += DIVH+'制造商:'+LIGHTBLUE(item.part_vendors)+DIVT;
					html += DIVH+'公开:'+GREEN(item.public)+DIVT;
					html += DIVH+'保质期:'+DARKOLIVEGREEN(item.guarantee_period)+RED(item.guarantee_period_unit)+DIVT;
					html += DIVH+'元件类型:'+STEELBLUE(item.category)+DIVT;
					html += DIVH+'物料类型:'+LIGHTBLUE(item.material_type)+DIVT;
					html += DIVH+'添加日期:'+GREEN(item.date_added)+DIVT;
					html += DIVH+'最后修改:'+RED(item.last_modified)+DIVT;

					part = item;
					break;
				}
			}
			if (part) {
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
			}
			html += '</li>';
		}
		html += '</ul>';
		html += '<li class="divider expanded" onclick="app.utils.showHide(this, \'maldet_check_history\')">历史审核信息:</li>';
		html += '<div id="maldet_check_history">';
		for (var id in check_history) {
			var info = check_history[id];
			html += '<ul class="list inset">';
			for (var i in info) {
				html += '<li>';
				var item = info[i];
				html += DIVH+GREEN(item.check_status_ch)+DIVT;
				html += DIVH+'审核时间:'+BLUE(item.date_added)+DIVT;
				html += DIVH+'审核人ID:'+GREEN(item.check_person)+DIVT;
				html += DIVH+'审核描述:'+BLUE(item.check_desc)+DIVT;
				var result_info = (item.check_resault=='pass')?GREEN('通过'):RED('未通过');
				html += DIVH+'是否通过:'+result_info+DIVT;
				html += '</li>';
			}
			html += '<ul>';
		}
		$('#matld_list').html(html);
	};
	return new MaterialListDetail();
});
