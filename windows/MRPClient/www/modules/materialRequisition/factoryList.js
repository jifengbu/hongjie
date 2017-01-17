define(function(require) {
	"use strict";

	var _self;
	function FactoryList() {
		_self = this;
		_self.id = "factoryList";
	}

	FactoryList.prototype.show = function(data, factory_id) {
		_self.data = data;
		_self.factory_id = factory_id;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	FactoryList.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (_self.data) {
			_self.showPanel();
		}
	};
	FactoryList.prototype.release = function () {
		_self.data = null;
		_self.factory_id = null;
	};
	FactoryList.prototype.showPanel = function () {
		var DATE_COLOR = app.color.DATE_COLOR,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			COUNT_COLOR = app.color.COUNT_COLOR,
			html = '';
		var data = _self.data;
		var factory_id = _self.factory_id;

		for (var fid in data) {
			var item = data[fid];
			var color = (fid==factory_id)?' style="background-color:#FAF0E6"':'';

			html += '<li'+color+' onclick="app.factoryList.setFactoryId(\''+item.factory_id+'\',\''+item.name+'\')">';
			html += GREEN(item.name)+'&nbsp;('+RED(item.factory_id)+')';
			html += '<label style="width: 10%;float:right;text-align: center"  onclick=" app.factoryList.showDetail(\''+item.factory_id+'\');event.stopPropagation();"><a class="icon info" style="color:lightblue;"></a></label>';
			html += '</li>';
		}
		$("#factory_list").html(html);
	};
	FactoryList.prototype.showDetail = function (factory_id) {
		require('factoryDetail').show(_self.data[factory_id]);
	};
	FactoryList.prototype.setFactoryId = function (factory_id, name) {
		$('#masu_factory').val(name + '('+factory_id+')');
		$('#masu_factory').attr('data-factory-id', factory_id);
		$.ui.goBack();
	};

	return new FactoryList();
});
