define(function(require) {
	"use strict";
	var _self;
	function SelectMultiUsers() {
		_self = this;
		_self.id = "selectMultiUsers";
		_self.showAll = true;
	}
	SelectMultiUsers.prototype.show = function(from, users, radio) {
        _self.users = users||[];
		_self.from = from;
		_self.showAll = true;
		if (radio) {
			_self.firstItem = true;
		}
		_self.radio = radio;
		_self.navbarHeight = $('#navbar').height();
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	SelectMultiUsers.prototype.onLoad = function() {
		_self.showUserList();
	};
	SelectMultiUsers.prototype.onUnload = function() {
		$('#navbar').css('height', _self.navbarHeight+'px');
	};
	SelectMultiUsers.prototype.doSendMultiUsers = function() {
		var users = [];
		if (_self.radio) {
			users = $("input[type=radio][name=chat_contact_checkbox]:checked").val();
		} else {
			$("input[type=checkbox][name=chat_contact_checkbox]").each(function () {
				var el = $(this);
				if (el.prop('checked')) {
					users.push(el.val());
				}
			});
		}
		if (users.length == 0) {
			app.utils.toast("请选择发送的联系人");
			return;
		}
		if (_self.from == 0) {
			app.createGroup.addMembers(users);
		} else if (_self.from == 1) {
			app.sendMultiMessage.addMembers(users);
		} else if (_self.from == 2) {
			app.searchGroup.addMembers(users);
		} else if (_self.from == 3) {
			app.searchGroup.addCreator(users);
		}
		$.ui.goBack();
	};
	SelectMultiUsers.prototype.updateAlphaTable = function() {
		$("#sm_contact_content").alphatable( $("#sm_contact_content").scroller(), {
			listCssClass:"tableListContainer",
			letterBoxCssClass: 'letterBox',
			prefix:"sm_contact_anchor_"
		});
		$(".tableListContainer div").css('height', ($('#content').height()/$.alphas.length)+'px');
	};
	SelectMultiUsers.prototype.showUserList = function() {
		var users;
		if (_self.showAll) {
			users = _self.getAllUserList();
		} else {
			users = _self.getOnlineUserList();
		}
		_self.addUserList(users);
	};
	SelectMultiUsers.prototype.getOnlineUserList = function() {
		var onlineUsers = app.onlineUserMgr.onlineUsers;
		var selfid = app.login.userid;
		var list = {};
		for (var i in onlineUsers) {
			var userid = onlineUsers[i].userid;
			if (userid == selfid) {
				continue;
			}
			var username = onlineUsers[i].username||userid;
			var alpha = $.fisrtPinyin(username);
			if (!list[alpha]) {
				list[alpha] = [];
			}
			list[alpha].push({username:username, userid:userid});
		}
		return list;
	};
	SelectMultiUsers.prototype.getAllUserList = function() {
		var users = app.userMgr.users;
		var selfid = app.login.userid;
		var list = {};
		for (var i in users) {
			var item = users[i];
			var userid = item.userid;
			if (userid == selfid) {
				continue;
			}
			var username = item.username||userid;
			var alpha = $.fisrtPinyin(username);
			if (!list[alpha]) {
				list[alpha] = [];
			}
			list[alpha].push({username:username, userid:userid});
		}
		return list;
	};
	SelectMultiUsers.prototype.getUserChecked = function(userid) {
		if (!_self.radio) {
			return _self.users.indexOf(userid) != -1 ? 'checked' : '';
		}
		if (_self.users.length == 0 && _self.firstItem) {
			_self.firstItem = false;
			return 'checked';
		}
		return _self.users.indexOf(userid) != -1 ? 'checked' : '';
	};
	SelectMultiUsers.prototype.addContactItem = function(username, userid, head) {
		var USERNAME_COLOR = app.color.USERNAME_COLOR,
			RED = app.color.RED,
			html = '';

		html += '<li>';
		html += '<div class="chat_head chat_head_contact default_head user_head_'+userid+'"></div>';
		html += '<span class="chat_contact">' + USERNAME_COLOR(userid, username)+'</span>';
		if (_self.radio) {
			html += '<input class="chat_contact_checkbox" name="chat_contact_checkbox" value="' + userid + '" type="radio" ' + _self.getUserChecked(userid) + '>';
		} else {
			html += '<input class="chat_contact_checkbox" name="chat_contact_checkbox" value="' + userid + '" type="checkbox" ' + _self.getUserChecked(userid) + '>';
		}
		html += '</li>';
		return html;
	};
	SelectMultiUsers.prototype.addContactGroup = function(alpha, userArr, heads) {
		var html = '';
		html += '<div class="tableHeader" id="sm_contact_anchor_'+alpha+'">&nbsp;'+alpha+'</div>';
		for (var i=0,len=userArr.length; i<len; i++) {
			var item = userArr[i];
			html += _self.addContactItem(item.username, item.userid, heads[item.userid]);
		}
		return html;
	};
	SelectMultiUsers.prototype.changeShowOnline = function(el) {
		_self.showAll = !_self.showAll;
		_self.showUserList();
	};
	SelectMultiUsers.prototype.getChangeOnOffLine = function() {
		var html = '';
		if (_self.showAll) {
			html += '<li onclick="app.selectMultiUsers.changeShowOnline()">';
			html += '<div class="chat_head chat_head_contact img_user_online"></div>';
			html += '<span class="chat_contact" style="color: green">只显示在线用户</span>';
		} else {
			html += '<li onclick="app.selectMultiUsers.changeShowOnline()">';
			html += '<div class="chat_head chat_head_contact img_user_offline"></div>';
			html += '<span class="chat_contact" style="color: green">显示所有用户</span>';
		}
		html += '</li>';
		return html;
	};
	SelectMultiUsers.prototype.addUserList = function(users) {
		app.login.user_head_db.find(function(err, docs) {
			var heads = {};
			_.each(docs, function(obj) {
				heads[obj.userid] = obj.head;
			});

			var html = '';
			var alphas = $.alphas;
			html += _self.getChangeOnOffLine();

			html += '<div id="sm_contact_content" style="color:black;overflow:hidden;">';
			for (var i = 0, len = alphas.length; i < len; i++) {
				var alpha = alphas[i];
				if (users.hasOwnProperty(alpha)) {
					html += _self.addContactGroup(alpha, users[alpha], heads);
				}
			}
			html += '<div><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br></div>';

			$('#sm_contact_list').html(html);
			_self.updateAlphaTable()
		});
	};

	return new SelectMultiUsers();
});