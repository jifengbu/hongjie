define(function(require) {
	"use strict";
	var _self;
	function MaterialSubmit() {
		_self = this;
		_self.id = "materialSubmit";
	}

	MaterialSubmit.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	MaterialSubmit.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		_self.getOrganizeInfo();
		_self.showFactoryAndComment();
	};
	MaterialSubmit.prototype.onUnload = function () {
	};
	MaterialSubmit.prototype.release = function () {
		_self.date = null;
		_self.factoryData = null;
		_self.organizeInfo = null;
	};
	MaterialSubmit.prototype.showFactoryAndComment = function () {
		var parent = app.materialRequisition;
		if (parent.from == 1) {
			var info = parent.info;
			$('#masu_factory').val(info.factory_name + '(' + info.factory_id + ')');
			$('#masu_factory').attr('data-factory-id', info.factory_id);
			$('#masu_comment').val(info.comment);
		}
	};
	MaterialSubmit.prototype.getFactoryList = function () {
		if (_self.factoryData) {
			_self.showFactoryList();
			return;
		}
		var param = {
			token: app.crm.token
		};
		var url = app.route.crmGetFactoryList+"?"+ $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetFactoryListSuccess
		});
	};
	MaterialSubmit.prototype.onGetFactoryListSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		_self.factoryData = data;
		_self.showFactoryList();
	};
	MaterialSubmit.prototype.showFactoryList = function () {
		require('factoryList').show(_self.factoryData, $('#masu_factory').attr("data-factory-id"));
	};
	MaterialSubmit.prototype.getOrganizeInfo = function () {
		if (_self.organizeInfo) {
			_self.showOrganizeInfo();
			return;
		}
		var param = {
			token: app.crm.token,
			user_id: app.login.userid
		};
		var url = app.route.crmGetOrganizeInfo+"?"+ $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetOrganizeInfoSuccess
		});
	};
	MaterialSubmit.prototype.onGetOrganizeInfoSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		_self.organizeInfo = data;
		_self.organizeInfo.result *= 1;
		_self.showOrganizeInfo();
	};
	MaterialSubmit.prototype.showOrganizeInfo= function () {
		if (_self.organizeInfo.result) {
			$('#masu_user').val(app.login.info.username);
			$('#masu_organize').val(_self.organizeInfo.organization_name ? (_self.organizeInfo.organization_name + '(' + _self.organizeInfo.organization_id + ')') : _self.organizeInfo.organization_id);
			$('#masu_date').val(app.utils.dateToString(app.utils.newDate()));
		} else {
			app.utils.toast("你的权限不足");
			$.ui.goBack();
		}
	};
	MaterialSubmit.prototype.doSubmit = function () {
		var parent = app.materialRequisition;
		var factory_id = $('#masu_factory').attr("data-factory-id");
		if (!factory_id) {
			app.utils.toast("请选择工程编号");
			return;
		}
		var expect_lead_time = $('#masu_date').val();
		var data_list = parent.data_list;
		if (!data_list.length) {
			app.utils.toast("没有选择领料数据");
			$.ui.goBack();
			return;
		}
		var apply_goods = [];
		for (var i in data_list) {
			var item = data_list[i];
			var data = {part_id:item.part_id};
			if (item.apply_quantity) {
				data.need_num = item.apply_quantity;
			} else {
				data.need_num = item.real_amount_in_stock;
			}

			var otherData = item.otherData||{};
			if (otherData.part_finished) {
				data.part_finished = otherData.part_finished;
			}
			if (otherData.processing_no) {
				data.processing_no = otherData.processing_no;
			}
			if (otherData.process_id) {
				data.process = otherData.process_id;
			}
			if (otherData.process_other) {
				data.process_other = otherData.process_other;
			}
			if (otherData.comment) {
				data.comment = otherData.comment;
			}
			apply_goods.push(data);
		}

		var param = {
			token: app.crm.token
		};
		var data = {
			factory_id:factory_id,     //选择的factoryID.
			expect_lead_time:expect_lead_time, //"2015-05-21"
			organization:_self.organizeInfo.organization_id,  //选择的组织机构ID
			user_id_tex:app.login.userid,  //选择的组织机构员工
			use_msg:"",  				//需要手动输入
			user_id:app.login.userid,    //当前系统的ID.
			apply_goods:apply_goods
		};
		if (_from == 1) {
			data.id = _self.info.id;
		}
		console.log(data);

		var url = app.route.crmAddApplication+"?"+ $.param(param);
		console.log(url);
		app.utils.setWait("正在提交...");
		app.utils.ajax({
			type : "POST",
			url : url,
			data: JSON.stringify(data),
			success : _self.onSubmitSuccess
		});
	};
	MaterialSubmit.prototype.onSubmitSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		if (data.apply_result==1) {
			app.utils.toast("申请成功");
			$.ui.goBack(2);
		} else {
			app.utils.toast("申请失败");
		}
	};

	return new MaterialSubmit();
});
