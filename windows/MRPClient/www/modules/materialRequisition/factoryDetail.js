define(function(require) {
	"use strict";

	var _self;
	function FactoryDetail() {
		_self = this;
		_self.id = "factoryDetail";
	}

	FactoryDetail.prototype.show = function(data) {
		_self.data = data;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	FactoryDetail.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (_self.data) {
			_self.showPanel();
		}
	};
	FactoryDetail.prototype.onUnload = function () {
		_self.data = null;
	};
	FactoryDetail.prototype.showPanel = function () {
		var data = _self.data;
		$('#facd_no').val(data.factory_id);
		$('#facd_name').val(data.name);
		$('#facd_phone').val(data.phone);
		$('#facd_fax').val(data.fax);
		$('#facd_email').val(data.email);
		$('#facd_address').val(data.address);
	};

	return new FactoryDetail();
});
