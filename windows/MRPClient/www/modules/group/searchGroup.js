define(function(require) {
	"use strict";
	var _self;
	function SearchGroup() {
		_self = this;
		_self.id = "searchGroup";
		_self.users = [];
	}
	SearchGroup.prototype.show = function() {
		_self.creator = null;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	SearchGroup.prototype.onLoad = function() {
		$.ui.scrollingDivs[app.utils.panelID(_self.id).replace('#', '')].disable();
	};
	SearchGroup.prototype.deleteMember = function(el, userid) {
		$(el.remove());
		_self.users = _.without(_self.users, userid);
		_self.addMembers(_self.users);
	};
	SearchGroup.prototype.doAddCreator = function() {
		var username = $('#sg_search_creator').val();
		var userid = app.userMgr.getUseridByUsername(username);
		require('selectMultiUsers').show(3, userid?[userid]:[], true);
	};
	SearchGroup.prototype.addCreator = function(userid) {
		var user = app.userMgr.users[userid];
		_self.creator = user.userid;
		$('#sg_search_creator').val(user.username);
	};
	SearchGroup.prototype.doAddMembers = function() {
		require('selectMultiUsers').show(2, _self.users);
	};
	SearchGroup.prototype.addMembers = function(userids) {
		var users = app.userMgr.users;
		var html = '';
		var selfid = app.login.userid;
		_self.users = userids;
		for (var i=0,len=userids.length; i<len; i++) {
			var userid = userids[i];
			if (userid == selfid) {
				continue;
			}
			html += '<span onclick="app.searchGroup.deleteMember(this, \''+userid+'\')" style="border:solid 1px; border-radius: 4px; border-color: #00AEEF">';
			html += users[userid].username;
			html += '&nbsp;<span class="icon close"></span>';
			html += "</span>&nbsp;&nbsp;&nbsp;"
		}
		if (!html) {
			html = '<br><br>';
		}
		$('#sg_search_users').html(html);
	};
	SearchGroup.prototype.doSearchGroup = function() {
		app.utils.setWait("正在获取群组列表");
		if (!_self.creator) {
			var username = $('#sg_search_creator').val();
			_self.creator = app.userMgr.getUseridByUsername(username);
		}
		var name = $('#sg_search_name').val();
		app.groupMgr.getGroupList(name, _self.creator, _self.users);
	};
	SearchGroup.prototype.updateGroupList = function(groups) {
		app.utils.clearWait();
		if (!groups.length) {
			app.utils.toast("没有符合条件的群组");
			return;
		}
		_self.list = {};
		var list = {};
		for (var i=0,len=groups.length; i<len; i++) {
			var group = groups[i];
			var name = group.name;
			var type = group.type;
			var creator = group.creator;
			var alpha = $.fisrtPinyin(name);

			_self.list[name] = group;
			if (!list[alpha]) {
				list[alpha] = [];
			}
			list[alpha].push({name:name, type:type, creator:creator});
		}
		require('searchGroupList').show(list);
	};

	return new SearchGroup();
});