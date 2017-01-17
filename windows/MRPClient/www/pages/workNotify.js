define(function(require) {
	"use strict";
	var _self;
	var US_WORK_NOTIFY = "US_WORK_NOTIFY";

	function WorkNotify() {
		_self = this;
		_self.id = "workNotify";
	}
	WorkNotify.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer: "none", transition: "slideRight", loadfunc: _self.id + "=onLoad"});
	};
	WorkNotify.prototype.onLoad = function() {
		_self.updateWorkNotify();
	};
	WorkNotify.prototype.getNotifies = function() {
		if (!_self.notifies) {
			_self.notifies = require("usersetting").getObjectData(US_WORK_NOTIFY) || {};
			var num = 0;
			var notifies = _self.notifies[app.login.userid]||{};
			for (var type in notifies) {
				num += notifies[type].length;
			}
			_self.notifiesNum = num;
		}
	};
	//{TYPE1:[{}, {}],TYPE2:[{}, {}]}
	//{userid1:{TYPE1:[{}, {}],TYPE2:[{}, {}]}, ...}
	WorkNotify.prototype.addWorkNotify = function(obj) {
		var selfid = app.login.userid;
		_self.getNotifies();
		if (!obj) {
			return;
		}
		if (!_.isArray(obj)) {
			obj = [obj];
		}
		if (!_self.notifies[selfid]) {
			_self.notifies[selfid] = {};
		}
		for (var i in obj) {
			var item = obj[i];
			var type = item.type;
			var notifies = _self.notifies[selfid];
			if (!notifies[type]) {
				notifies[type] = [];
			}
			item.uuid = $.uuid();
			notifies[type].push(item);
			_self.notifiesNum++;

		}
		app.us.setObjectData(US_WORK_NOTIFY, _self.notifies);
		if (app.utils.isActivePanel(_self.id)) {
			_self.updateWorkNotify();
		}
		_self.updateBadge();
	};
	WorkNotify.prototype.removeWorkNotify = function(type, data) {
		var selfid = app.login.userid;
		if (type === 'MATERIAL_CHECK') {
			var notifies = _self.notifies[selfid][type];
			console.log(notifies);
			var newnotifies = _.reject(notifies, function(item){return item.data===data.app_number});

			var len1 = newnotifies.length, len2 = notifies.length;
			console.log(newnotifies, len1, len2);
			if (len2 != len1) {
				_self.notifiesNum-=(len2-len1);
				_self.notifies[selfid][type] = newnotifies;
				app.us.setObjectData(US_WORK_NOTIFY, _self.notifies);
				_self.updateBadge();
			}
		}

	};
	WorkNotify.prototype.clearWorkNotify = function(type) {
		var selfid = app.login.userid;
		_self.notifiesNum -= _self.notifies[selfid][type].length;
		delete _self.notifies[selfid][type];
		_self.updateWorkNotify();
		app.us.setObjectData(US_WORK_NOTIFY, _self.notifies);
		_self.updateBadge();
	};
	WorkNotify.prototype.clearNotifies = function(type) {
		app.utils.popup({
			title: "温馨提示",
			message: '你确定要清除所有该类通知吗?',
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确认",
			doneCallback: function () {
				_self.clearWorkNotify(type);
			},
			cancelOnly: false,
			cancelClass: 'button text_green',
			doneClass: 'button text_red'
		});
	};
	WorkNotify.prototype.updateWorkNotify = function() {
		var html = '';
		var notifies = _self.notifies[app.login.userid];
		for (var type in notifies) {
			var notify = notifies[type];
			var icon, label, title, msg, time;
			if (type === 'MATERIAL_CHECK') {
				icon = 'materialRequisition';
				label = '领料申请';
			} else {
				continue;
			}
			html += '<li class="divider">' + label + '<span class="icon trash" style="float: right;color:red;" onclick="app.workNotify.clearNotifies(\''+type+'\')"></span></li>';
			for (var i in notify) {
				var item = notify[i];
				if (type === 'MATERIAL_CHECK') {
					title = '领料申请审核';
					msg = '申请单:'+item.data;
				}
				html += '<li onclick="app.workNotify.doModuleNotify(\''+type+'\',\''+item.uuid+'\')">';
				html += '<a href="#">';
				html += '<div class="chat_head chat_head_message menuicon ' + icon + '"></div>';
				html += '<span><h5 class="chat_message_username">' + title + '</h5><span class="chat_message_time">' + app.utils.getShowDate(item.time*1) + '</span></span>';
				html += '<span class="chat_message">' + msg + '</span>';
				html += '</a>';
				html += '</li>';
			}
		}
		if (html) {
			$('#work_notify_list').html(html);
		} else {
			$('#work_notify_list').html('<li class="divider">你没有需要被提醒处理的工作</li>');
		}
	};
	WorkNotify.prototype.doModuleNotify = function(type, uuid) {
		var data;
		if (type === 'MATERIAL_CHECK') {
			var notifies = _self.notifies[app.login.userid][type];
			var app_number_list = _.map(notifies, function(item){return item.data}).join(',');
			console.log(app_number_list);
			require('materialList').show(app_number_list);
		}
	};
	WorkNotify.prototype.updateBadge = function(module) {
		_self.getNotifies();
		if (_self.notifiesNum) {
			$.ui.updateBadge('#mywork_item_notify', _self.notifiesNum, "tr", 'red');
		} else {
			$.ui.removeBadge('#mywork_item_notify');
		}
	};
	return new WorkNotify();
});