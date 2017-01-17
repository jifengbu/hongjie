define(function(require) {
	"use strict";
	var _self;

	function MaterialInvestigate() {
		_self = this;
		_self.id = "materialInvestigate";
	}

	MaterialInvestigate.prototype.show = function(data) {
		_self.data = data;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	MaterialInvestigate.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			if (!_self.getPartInfo()) {
				_self.showPanel();
			}
		}
	};
	MaterialInvestigate.prototype.release = function () {
		_self.data = null;
		_self.part_list_str = null;
	};
	MaterialInvestigate.prototype.showPanel = function () {
		var BLUE = app.color.BLUE,
			GREEN = app.color.GREEN,
			PURPLE = app.color.PURPLE,
			RED = app.color.RED,
			DIVH = '<div style="margin-bottom: 6px;">',
			DIVT = '</div>',
			data = _self.data,
			html = '';
		var result_info = data.result_info;
		var result_details = data.result_detail;
		var check_history = data.check_history;
		var STATUS = {pengding: '未审核', inventory:'已出库', approvel:'已审核', finish:'已完成'};
		var space = '&nbsp;&nbsp;&nbsp;&nbsp;';

		html += '<li>';
		html += DIVH+'申请单号:'+GREEN(result_info.application_number)+'&nbsp;['+PURPLE(STATUS[result_info.status])+']'+DIVT;
		html += DIVH+'部门:'+GREEN(result_info.organization_name)+'['+BLUE(result_info.use_organization_id)+']'+DIVT;
		html += DIVH+'工厂编号:'+GREEN(result_info.factory_name)+'['+BLUE(result_info.factory_id)+']'+DIVT;
		html += DIVH+'员工ID:'+GREEN(result_info.employee_name)+'['+BLUE(result_info.employee_id)+']'+DIVT;
		html += DIVH+'提交时间:'+BLUE(result_info.application_date)+DIVT;
		html += DIVH+'用途说明:'+GREEN(result_info.purpose_comment)+DIVT;
		html += '</li>'
		html += '<ul class="list inset" style="background-color:#F0FFF0">';
		for (var k in result_details) {
			var result_detail = result_details[k];
			html += '<li>';
			html += '<a href="#" onclick="app.materialInvestigate.showPartDetail(\''+result_detail.part_id+'\')">';
			html += DIVH+'原件ID:'+PURPLE(result_detail.part_id)+'&nbsp;&nbsp;&nbsp;&nbsp;申请数量:'+GREEN(Math.ceil(result_detail.application_amount))+DIVT;
			html += DIVH+'物料编号:'+BLUE(result_detail.application_number)+DIVT;
			var part_info = _self.partInfo.part_info;
			for (var j in part_info) {
				var item = part_info[j];
				if (item.part_id == result_detail.part_id) {
					html += DIVH+'Myro Model:'+GREEN(item.my_model)+DIVT;
					html += DIVH+'Myro No.:'+GREEN(item.myro_name)+DIVT;
					html += DIVH+'类型:'+GREEN(item.category)+space+'剩余数量:'+GREEN(item.real_amount_in_stock-result_detail.application_amount)+DIVT;
					html += DIVH+'描述:'+GREEN(item.description)+DIVT;
					break;
				}
			}
			html += '</a>';
			html += '</li>';
		}
		html += '</ul>';

		var buttons = [
			{text:'详情', click:'app.materialInvestigate.showDetail()'}
		];
		if (result_info.is_check === '1') {
			buttons.push({text:'修改', click:'app.materialInvestigate.doModify()'});
			buttons.push({text:'审核', click:'app.materialInvestigate.doInvestigate()'});
		};
		html +=  app.utils.buttonHtml(buttons);
		$('#maiti_list').html(html);
	};
	MaterialInvestigate.prototype.showPartDetail = function (part_id) {
		require('partDetail').show(_self.data, _self.partInfo.part_info, part_id);
	};
	MaterialInvestigate.prototype.showDetail = function () {
		require('materialListDetail').show(_self.data, _self.partInfo.part_info);
	};
	MaterialInvestigate.prototype.getPartInfo = function () {
		var result_details = _self.data.result_detail;
		var part_list_str = '';
		for (var i in result_details) {
			var result_detail = result_details[i];
			part_list_str += (((!part_list_str)?'':',')+result_detail.part_id);
		}
		if (_self.part_list_str == part_list_str && !_self.partInfo) {
			_self.part_list_str = part_list_str;
			return false;
		}

		var param = {
			token: app.crm.token,
			page:0,
			record:1000,
			part_list_str: part_list_str
		};
		var url = app.route.crmGetPartInfo+"?"+ $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetPartInfoSuccess
		});
		return true;
	};
	MaterialInvestigate.prototype.onGetPartInfoSuccess = function (data) {
		console.log(data);
		_self.partInfo = data;
		app.utils.clearWait();
		_self.showPanel();
	};

	MaterialInvestigate.prototype.doModify = function () {
		if (_self.data.result_info.employee_id != app.login.userid) {
			app.utils.toast("你的权限不足");
			return;
		}
		var result_info = _self.data.result_info;
		var data_list = _self.partInfo.part_info;
		var info = {
			factory_name: result_info.factory_name,
			factory_id: result_info.factory_id,
			organize_name: result_info.organization_name,
			organize_id: result_info.use_organization_id,
			employee_id: result_info.employee_id,
			date: result_info.application_date,
			comment: result_info.purpose_comment||'',
			id:result_info.id
		};

		var otherData = {};
		var result_details = _self.data.result_detail;
		for (var i in result_details) {
			var result_detail = result_details[i];
			otherData[result_detail.part_id] = {
				"part_finished": result_detail.part_finished,   //工艺，需要手动输入
				"process_id": result_detail.process_id,         //工序，选择已有的process_id
				"process_other": result_detail.process_other,         //工序，process值为other,输入新的工序值时.
				"processing_no": result_detail.processing_no,   //加工单，需要手动输入
				"need_num":result_detail.application_amount,        //申请数量，需要手动输入整数
				"comment":result_detail.comment    //备注，需要手动输入
			};
		}
		for (var i in data_list) {
			var item = data_list[i];
			item.otherData = otherData[item.part_id];
			item.apply_quantity = otherData[item.part_id].need_num;
		}
		console.log(data_list, info);
		require('materialRequisition').show(1, data_list, info);
	};
	MaterialInvestigate.prototype.doInvestigate = function () {
		var html = '';
		html += '<div style="float: left">审核意见:</div>';
		html += '<textarea id="maig_agree_comment" rows="3" style="width: 100%;" class="input_style" placeholder="请输入审核意见"></textarea>';
		html += '<label style="width: 50%;">同意:</label><input id="maig_agree" type="checkbox" name="maig_agree" value="0" class="toggle"><label for="maig_agree" data-on="是" data-off="否" style="left:50%"><span></span></label>';
		app.utils.popup({
			title: "审核:",
			message: html,
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
				_self.doSubmit($('#maig_agree').prop('checked'), $('#maig_agree_comment').val());
			},
			cancelOnly: false,
			addCssClass: 'wide'
		});
	};
	MaterialInvestigate.prototype.doSubmit = function (check_result, check_desc) {
		var param = {
			token: app.crm.token
		};
		var url = app.route.crmCheckApplication+"?"+ $.param(param);
		console.log(url);
		var result_info = _self.data.result_info;
		var data = {
			user_id: app.login.userid,
			id: result_info.id,     //申请单号ID,必须传入
			check_result: (check_result*1)?'pass':'nopass',   //pass/nopass 两种选项
			check_desc: check_desc  		//审核意见
		};
		console.log(data);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(data),
			success: _self.onSubmitSuccess
		});
	};
	MaterialInvestigate.prototype.onSubmitSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		if (data.check_result==1) {
			app.utils.toast("审核成功");
			$.ui.goBack();
			app.workNotify.removeWorkNotify('MATERIAL_CHECK', {app_number:_self.data.result_info.application_number})
			app.materialList.refreshCurPage();
		} else {
			app.utils.toast("审核失败");
		}
	};

	return new MaterialInvestigate();
});
