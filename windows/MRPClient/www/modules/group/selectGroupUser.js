define(function(require) {
	"use strict";
	var _self;
	function SelectGroupUser() {
		_self = this;
		_self.id = "selectGroupUser";
	}
	SelectGroupUser.prototype.show = function(name) {
		_self.name = name;
		_self.loaded = true;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideRight", loadfunc:_self.id+"=onLoad"});
	};
	SelectGroupUser.prototype.onLoad = function() {
		if (_self.loaded) {
			_self.loaded = false;
			_self.showSelectGroupUser();
		}
	};
	SelectGroupUser.prototype.showSelectGroupUser = function() {
		var USERNAME_COLOR = app.color.USERNAME_COLOR,
			html = '';
		var list = app.groupMgr.list;
		var group = list[_self.name];
		var users = app.userMgr.users;
		var userids = group.users;
		var selfid = app.login.userid;

		for (var i= 0,len=userids.length; i<len; i++) {
			var userid = userids[i];
			if (userid == selfid) {
				continue;
			}
			var username = users[userid].username||userid;
			html += '<li onclick="app.selectGroupUser.selectUser(\''+userid+'\', \''+username+'\')">';
			html += '<div class="chat_head chat_head_contact default_head user_head_'+userid+'"></div>';
			html += '<span class="chat_contact">' + USERNAME_COLOR(userid, username ) + '</span>';
			html += '</li>';
		}
		$('#sgur_list').html(html);
	};
	SelectGroupUser.prototype.selectUser = function(userid, username) {
		app.messageInfo.setSendGroupUserId(userid, username);
		$.ui.goBack();
	};

	return new SelectGroupUser();
});