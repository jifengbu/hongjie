define(function(require) {
	"use strict";

	var _self;
	function GoodsTakeOtherInfo() {
		_self = this;
		_self.id = "goodsTakeOtherInfo";
	}

	GoodsTakeOtherInfo.prototype.show = function(parent) {
		_self.parent = parent;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	GoodsTakeOtherInfo.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			_self.showPanel();
		}
	};
	GoodsTakeOtherInfo.prototype.release = function () {
		_self.parent = null;
	};
	GoodsTakeOtherInfo.prototype.showPanel = function () {
		var parent = _self.parent;
		if (parent.flag) {
			$('#gtoi_fine_set_qty_content').show();
		}
		var otherInfo = parent.otherInfo;
		var data = parent.data;
		var userid = app.login.userid;
		var date = $.dateFormat(new Date(),"yyyy-MM-dd hh:mm:ss");

		//$('#gtoi_receiver').val(otherInfo.receiver||userid);
		//$('#gtoi_receive_time').val(otherInfo.receive_time||date);
		//$('#gtoi_check_user').val(otherInfo.check_user||userid);
		//$('#gtoi_check_time').val(otherInfo.check_time||date);
		var num = $('#gotk_receive_qty').val();
		$('#gtoi_check_qty').val(otherInfo.check_qty==null?num:otherInfo.check_qty);
		$('#gtoi_fine_qty').val(otherInfo.fine_qty==null?num:otherInfo.fine_qty);
		$('#gtoi_fine_set_qty').val(otherInfo.fine_set_qty||'');
		$('#gtoi_fail_qty').val(otherInfo.fail_qty||0);
		$('#gtoi_return_qty').val(otherInfo.return_qty||0);
		$('#gtoi_unit_weight').val(otherInfo.unit_weight||'');
		$('#gtoi_batch_qty').val(otherInfo.batch_qty||'');
		$('#gtoi_package_num').val(otherInfo.package_num||'');
		$('#gtoi_comment').val(otherInfo.comment||'');
		$('#gtoi_assoc_pcb').val(otherInfo.assoc_pcb||'');
	};
	GoodsTakeOtherInfo.prototype.setGoodsTakeOtherInfo = function () {
		var data = {
			//receiver: $('#gtoi_receiver').val(),
			//receive_time: $('#gtoi_receive_time').val(),
			//check_user: $('#gtoi_check_user').val(),
			//check_time: $('#gtoi_check_time').val(),
			check_qty: $('#gtoi_check_qty').val(),
			fine_qty: $('#gtoi_fine_qty').val(),
			fail_qty: $('#gtoi_fine_set_qty').val(),
			return_qty: $('#gtoi_return_qty').val(),
			unit_weight: $('#gtoi_unit_weight').val(),
			batch_qty: $('#gtoi_batch_qty').val(),
			package_num: $('#gtoi_package_num').val(),
			comment: $('#gtoi_comment').val(),
			assoc_pcb: $('#gtoi_assoc_pcb').val()
		};
		_self.parent.otherInfo = data;
		$.ui.goBack();
	};
	GoodsTakeOtherInfo.prototype.setTime = function (el) {
		var d = el.value.split('-');
		navigator.utils.datePickerDialog(function(date){
			el.value = app.utils.dateToString(date);
		},d[0], d[1], d[2]);
	};
	GoodsTakeOtherInfo.prototype.setPerson = function (el) {
		var userid = el.value;
		require('selectPerson').show(userid, function(person){
			el.value = person;
		});
	};

	return new GoodsTakeOtherInfo();
});
