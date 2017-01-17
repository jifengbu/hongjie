define(function(require) {
	"use strict";
	var _self;
	function GroupDetail() {
		_self = this;
		_self.id = "groupDetail";
	}
	GroupDetail.prototype.show = function(name, from) {
		_self.name = name;
		_self.from = from;
		_self.needUpdate = true;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	GroupDetail.prototype.onLoad = function() {
		if (_self.needUpdate) {
			_self.needUpdate = false;
			_self.showGroupDetail();
		}
	};
	GroupDetail.prototype.showGroupDetail = function() {
		var RED = app.color.RED,
			BLUE = app.color.BLUE,
			GREEN = app.color.GREEN,
			PURPLE = app.color.PURPLE,
			USERNAME_COLOR = app.color.USERNAME_COLOR,
			html = '';
		var list = (_self.from==1)?app.searchGroup.list:app.groupMgr.list;
		var group = list[_self.name];
		var users = app.userMgr.users;
		var userids = group.users;
		var selfid = app.login.userid;


		$('#group_detail_name').html(PURPLE(group.name));
		$('#group_detail_creator').html(USERNAME_COLOR(group.creator, users[group.creator].username||group.creator));
		$('#group_detail_type').html(group.type?GREEN('私有群组'):RED('公有群组'));

		for (var i= 0,len=userids.length; i<len; i++) {
			var userid = userids[i];
			var username = users[userid].username||userid;
			html += '<li onclick="app.groupDetail.showContactItem(\''+userid+'\')">';
			html += '<div class="chat_head chat_head_contact default_head user_head_'+userid+'"></div>';
			html += '<span class="chat_contact">' + USERNAME_COLOR(userid, username ) + '</span>';
			html += '</li>';
		}
		if (_self.from == 0) {
			html += '<a href="#" class="button green" onclick="app.groupDetail.doGroupChat()" style="width:90%;left:5%">发消息</a>';
			if (group.creator == selfid) {
				html += '<a href="#" class="button orange" onclick="app.groupDetail.doManageGroup()" style="width:90%;left:5%">管理群组</a>';
				html += '<a href="#" class="button red" onclick="app.groupDetail.doDeleteGroup()" style="width:90%;left:5%">解散群组</a>';
			} else {
				html += '<a href="#" class="button red" onclick="app.groupDetail.doLeaveGroup()" style="width:90%;left:5%">退出群组</a>';
			}
		} else if (_self.from == 1) {
			html += '<a href="#" class="button green" onclick="app.groupDetail.doAddGroup()" style="width:90%;left:5%">加入群组</a>';
		}
		$('#group_detail_list').html(html);
	};
	GroupDetail.prototype.doGroupChat = function() {
		require('messageInfo').show(1, app.messageMgr.GROUP_TYPE, _self.name);
	};
	GroupDetail.prototype.doManageGroup = function() {
		var group = app.groupMgr.list[_self.name];
		require('createGroup').show(_self.name, group.users, group.type);
	};
	GroupDetail.prototype.doDeleteGroup = function() {
		app.utils.popup({
			title: "提示",
			message: "你确定要解散该群吗?",
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
				app.groupMgr.removeGroup(_self.name);
				$.ui.goBack();
			}
		});
	};
	GroupDetail.prototype.doLeaveGroup = function() {
		app.utils.popup({
			title: "提示",
			message: "你确定要退出该群吗?",
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
				app.groupMgr.leaveGroup(_self.name);
				$.ui.goBack();
			}
		});
	};
	GroupDetail.prototype.doAddGroup = function() {
		app.groupMgr.joinGroup(_self.name);
		$.ui.goBack(3);
	};
	GroupDetail.prototype.showContactItem = function(userid) {
		var selfid = app.login.userid;
		if (selfid == userid) {
			require('personalInfo').show();
		} else {
			require('contactInfo').show(userid);
		}
	};

	return new GroupDetail();
});