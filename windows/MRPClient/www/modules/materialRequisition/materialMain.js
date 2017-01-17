define(function(require) {
	"use strict";

	var _self;
	function MaterialMain() {
		_self = this;
		_self.id = "materialMain";
	}

	MaterialMain.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	MaterialMain.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
	};
	MaterialMain.prototype.showMaterialRequisition = function () {
		require('materialRequisition').show(0);
	};
	MaterialMain.prototype.showMaterialList = function () {
		require('materialList').show();
	};
	MaterialMain.prototype.showMaterialTakeout = function () {
		app.utils.toast("工程师正在努力开发中...");
	};

	return new MaterialMain();
});
