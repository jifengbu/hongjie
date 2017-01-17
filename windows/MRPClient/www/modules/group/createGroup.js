define(function(require) {
	"use strict";
	var _self;
	function CreateGroup() {
		_self = this;
		_self.id = "createGroup";
		_self.users = [];
	}
	CreateGroup.prototype.show = function(name, users, type) {
		_self.name = name;
        _self.users = users||[];
		_self.oldusers = _self.users;
        _self.type = !!type;
		_self.loaded = false
		_self.canModify = false;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	CreateGroup.prototype.onLoad = function() {
		if (!_self.loaded) {
			_self.loaded = true;
			if (_self.name) {
				$('#crgr_name').attr("readonly", "readonly");
				$('#crgr_title').html(_self.name);
				$('#crgr_name').val(_self.name);
				$('#crgr_modify_button').css('visibility', 'visible');
				$('#crgr_create_button').css('visibility', 'hidden');
				$('#crgr_type').prop("checked", _self.type);
				_self.addMembers(_self.users);
				$('input[type="checkbox"][id="crgr_type"]').change(function () {
					_self.checkCanModify();
				});
			} else {
				$('#crgr_create_button').css('visibility', 'visible');
				$('#crgr_modify_button').css('visibility', 'hidden');
			}
		}
	};
	CreateGroup.prototype.updateModifyButton = function() {
		if (_self.canModify) {
			$('#crgr_modify_button').replaceClass('gray', 'green');
		} else {
			$('#crgr_modify_button').replaceClass('green', 'gray');
		}
	};
	CreateGroup.prototype.checkCanModify = function() {
		if (_self.name) {
			var type = $('#crgr_type').prop("checked");
			if (_self.type == type && _.difference(_self.users, _self.oldusers).length == 0) {
				_self.canModify = false;
			} else {
				_self.canModify = true;
			}
			_self.updateModifyButton();
		}
	};
	CreateGroup.prototype.doCreateGroup = function() {
		if (_self.name) {
			app.groupMgr.modifyGroup(_self.name, _self.users, type);
			$.ui.goBack();
		} else {
			var name = $('#crgr_name').val().trim();
			var type = $('#crgr_type').prop("checked");
			if (!name) {
				app.utils.toast("群组名字不能为空");
			} else {
				app.groupMgr.createGroup(name, _self.users, type);
				$.ui.goBack();
			}
		}
	};
	CreateGroup.prototype.doModifyGroup = function() {
		if (_self.name) {
			app.groupMgr.modifyGroup(_self.name, _self.users);
			$.ui.goBack();
		} else {
			var name = $('#crgr_name').val().trim();
			var type = $('#crgr_type').prop("checked");
			if (!name) {
				app.utils.toast("群组名字不能为空");
			} else {
				app.groupMgr.createGroup(name, _self.users, type);
				$.ui.goBack();
			}
		}
	};
	CreateGroup.prototype.deleteMember = function(el, userid) {
		$(el.remove());
		_self.users = _.without(_self.users, userid);
		_self.addMembers(_self.users);
	};
	CreateGroup.prototype.addMembers = function(userids) {
		var users = app.userMgr.users;
		var html = '';
		var selfid = app.login.userid;
		_self.oldusers = _self.users;
		_self.users = userids;
		for (var i=0,len=userids.length; i<len; i++) {
			var userid = userids[i];
			if (userid == selfid) {
				continue;
			}
			html += '<span onclick="app.createGroup.deleteMember(this, \''+userid+'\')" style="border:solid 1px; border-radius: 4px; border-color: #00AEEF">';
			html += users[userid].username||userid;
			html += '&nbsp;<span class="icon close"></span>';
			html += "</span>&nbsp;&nbsp;&nbsp;"
		}
		if (!html) {
			html = '<br><br>';
		}
		$('#crgr_users').html(html);
		_self.checkCanModify();
	};
	CreateGroup.prototype.doAddMembers = function() {
		require('selectMultiUsers').show(0, _self.users);
	};


	return new CreateGroup();
});