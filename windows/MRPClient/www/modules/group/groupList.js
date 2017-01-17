define(function(require) {
	"use strict";
	var _self;
	function GroupList() {
		_self = this;
		_self.id = "groupList";
	}
	GroupList.prototype.show = function(userid) {
        _self.userid = userid;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"up", loadfunc:_self.id+"=onLoad"});
	};
	GroupList.prototype.onLoad = function() {
		_self.showGroupList();
	};
	GroupList.prototype.updateAlphaTable = function() {
		$("#group_list_content").alphatable( $("#group_list_content").scroller(), {
			listCssClass:"tableListContainer",
			letterBoxCssClass: 'letterBox',
			prefix:"group_anchor_"
		});
	};
	GroupList.prototype.showGroupList = function() {
		var groups = _self.getGroupList();
		_self.addGroupList(groups);
		_self.updateAlphaTable();
	};
	GroupList.prototype.getGroupList = function() {
		var groups = app.groupMgr.list;
		var list = {};
		for (var i in groups) {
			var group = groups[i];
			var name = group.name;
			var type = group.type;
			var creator = group.creator;

			var alpha = $.fisrtPinyin(name);
			if (!list[alpha]) {
				list[alpha] = [];
			}
			list[alpha].push({name:name, type:type, creator:creator});
		}
		return list;
	};
	GroupList.prototype.addGroupItem = function(name, type, creator) {
		var BLUE = app.color.BLUE,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			html = '';
		html += '<li onclick="app.groupList.showGroupItem(\''+name+'\')">';
		html += '<div class="chat_head chat_head_contact group_head default_head user_head_'+creator+'"></div>';
		html += '<span class="chat_contact">';
		if (creator == app.login.userid) {
			html += BLUE(name);
		} else if (type) {
			html += RED(name);
		} else {
			html += GREEN(name);
		}
		html += '</span>';
		html += '</li>';
		return html;
	};
	GroupList.prototype.addAlphaGroup = function(alpha, groupArr) {
		var html = '';
		html += '<div class="tableHeader" id="group_anchor_'+alpha+'">&nbsp;'+alpha+'</div>';
		for (var i=0,len=groupArr.length; i<len; i++) {
			var item = groupArr[i];
			html += _self.addGroupItem(item.name, item.type, item.creator);
		}
		return html;
	};
	GroupList.prototype.getGroupListButton = function() {
		var html = '';
		html += '<li onclick="app.groupList.createNewGroup()">';
		html += '<div class="chat_head chat_head_contact img_create_group"></div>';
		html += '<span class="chat_contact" style="color: green">新建一个群</span>';
		html += '</li>';
		html += '<li onclick="app.groupList.addToGroup()">';
		html += '<div class="chat_head chat_head_contact img_search_group"></div>';
		html += '<span class="chat_contact" style="color: green">加入群组</span>';
		html += '</li>';
		html += '<li onclick="app.groupList.sendMultiUser()">';
		html += '<div class="chat_head chat_head_contact img_send_multi"></div>';
		html += '<span class="chat_contact" style="color: green">发送给多人</span>';
		html += '</li>';
		return html;
	};
	GroupList.prototype.addGroupList = function(groups) {
		var html = '';
		var alphas = $.alphas;
		html += _self.getGroupListButton();

		html += '<div id="group_list_content" style="color:black;overflow:hidden;">';
		for (var i=0,len=alphas.length; i<len; i++) {
			var alpha = alphas[i];
			if (groups.hasOwnProperty(alpha)) {
				html += _self.addAlphaGroup(alpha, groups[alpha]);
			}
		}
		html += '<div><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
		html += '</div>'

		$('#group_chat_list').html(html);
	};
	GroupList.prototype.createNewGroup = function() {
        require('createGroup').show();
	};
	GroupList.prototype.sendMultiUser = function() {
        require('sendMultiMessage').show();
	};
	GroupList.prototype.addToGroup = function() {
        require('searchGroup').show();
	};
	GroupList.prototype.showGroupItem = function(name) {
		require('groupDetail').show(name, 0);
	};
	return new GroupList();
});