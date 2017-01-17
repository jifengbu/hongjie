define(function(require) {
	"use strict";

	var _self;
	function OtherInfo() {
		_self = this;
		_self.id = "otherInfo";
	}

	OtherInfo.prototype.show = function(el, index, data) {
		if (data) {
			_self.data = data;
		}
		_self.parentInfo = {el:el, index:index};
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	OtherInfo.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (_self.processList) {
			_self.showProcessList();
		} else {
			_self.getProcessList();
		}
	};
	OtherInfo.prototype.onUnload = function () {
		_self.parentInfo = null;
	};
	OtherInfo.prototype.release = function () {
		_self.processList = null;
	};
	OtherInfo.prototype.onWorkstageChange = function (el) {
		var val = el.value;
		if (val == -1) {
			el.style.display = 'none';
			$('#moti_workstage_other')[0].style.display = '';
		}
	};
	OtherInfo.prototype.onWorkstageOtherChange = function (el) {
		var val = el.value;
		if (val.length==0) {
			el.style.display = 'none';
			$('#moti_workstage')[0].style.display = '';
		}
	};
	OtherInfo.prototype.showProcessList = function () {
		var moti_workstage = $('#moti_workstage');
		var moti_workstage_other = $('#moti_workstage_other');
		var list = _self.processList;
		var html = '';
		for (var i in list) {
			var item = list[i];
			console.log(item);
			html += '<option value="'+item.process_id+'">'+item.process_name+'</option>';
		}
		html += '<option value="'+-1+'">其他</option>';
		moti_workstage.html(html);

		var data = _self.data||{};
		$('#moti_technology').val(data.part_finished||'');
		$('#moti_worksheet').val(data.processing_no||'');
		moti_workstage.val(data.process_id||'-1');
		moti_workstage_other.val(data.process_other||'');
		$('#moti_remark').val(data.comment||'');
		if (!data.process_other){
			moti_workstage[0].style.display = '';
			moti_workstage_other[0].style.display = 'none';
		} else {
			moti_workstage[0].style.display = 'none';
			moti_workstage_other[0].style.display = '';
		}
	};
	OtherInfo.prototype.getProcessList = function (organ_id) {
		var param = {
			token: app.crm.token
		};
		var url = app.route.crmGetProcessList+"?"+ $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetProcessListSuccess
		});
	};
	OtherInfo.prototype.onGetProcessListSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		_self.processList = data;
		_self.showProcessList();
	};
	OtherInfo.prototype.setOtherInfo = function () {
		var part_finished = $('#moti_technology').val();
		var processing_no = $('#moti_worksheet').val();
		var process_id = $('#moti_workstage').val();
		var process_other = $('#moti_workstage_other').val();
		var comment = $('#moti_remark').val();

		if (process_id == -1) {
			process_id = "";
		} else {
			process_other = "";
		}

		_self.data = {
			part_finished: part_finished,
			processing_no: processing_no,
			process_id: process_id,
			process_other: process_other,
			comment: comment
		};
		app.materialRequisition.setOtherInfo(_self.parentInfo.el, _self.parentInfo.index, _self.data);
		$.ui.goBack();
	};

	return new OtherInfo();
});
