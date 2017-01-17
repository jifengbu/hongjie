define(function(require) {
	"use strict";
	var _self;

	function GoodsStorageResult() {
		_self = this;
		_self.id = "goodsStorageResult";
	}

	GoodsStorageResult.prototype.show = function(data) {
		_self.data = data;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	GoodsStorageResult.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			$.ui.history.splice(-1);
			var data = _self.data;
			_self.data = null;
			_self.showPanel(data);
		}
	};
	GoodsStorageResult.prototype.showPanel = function (data) {
		var GREEN = app.color.GREEN,
			BLUE = app.color.BLUE,
			RED = app.color.RED,
			html = '';
		console.log(data);

		html += '<li class="divider">失败操作的item id:</li>';
		var failed = data.failed;
		for (var i in failed) {
			html += '<li>';
			html += '<div style="margin-bottom: 6px;">'+LC('item id')+': '+GREEN(failed[i].id)+'</div>';
			html += '<div style="margin-bottom: 6px;">'+LC('失败信息')+': '+GREEN(failed[i].msg)+'</div>';
			html += '</li>';
		}

		$('#gostr_list').html(html);
	};

	return new GoodsStorageResult();
});
