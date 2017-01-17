define(function(require) {
	"use strict";

	var _self;
	function GoodsMain() {
		_self = this;
		_self.id = "goodsMain";
	}

	GoodsMain.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	GoodsMain.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
	};
	GoodsMain.prototype.showGoodsStorage = function () {
		require('goodsStorage').show(0);
	};
	GoodsMain.prototype.showGoodsStorageList = function () {
		require('goodsStorageList').show();
	};

	return new GoodsMain();
});
