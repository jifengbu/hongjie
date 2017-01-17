define(function(require) {
	"use strict";
	var _self;

	function SelectPerson() {
		_self = this;
		_self.id = "selectPerson";
	}

	SelectPerson.prototype.show = function(uids, callback) {
		_self.multi = _.isArray(uids);
		_self.uids = _self.multi?_.map(uids, function(item) {return item*1;}):uids*1;
		_self.callback = callback;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	SelectPerson.prototype.onLoad = function() {
		app.crm.checkCommonInfo(_self.showPanel);
	};
	SelectPerson.prototype.showPanel = function() {
		var inner_user = app.crm.commonInfo.inner_user,
			USERNAME_COLOR = app.color.USERNAME_COLOR,
			uids = _self.uids,
			html = '',
			type = _self.multi ? 'checkbox':'radio';
		var allusers = app.userMgr.users;

		_self.uids = null;
		for (var group in inner_user) {
			html += '<li>';
			html += '<div class="formGroupHead">' + group + '</div>';
			html += '<div>';
			html += '<div class="input-group">';
			var users = inner_user[group];
			for (var i in users) {
				var user = users[i];
				for (var id in user) {
					var checked = (_self.multi?_.contains(uids, id*1):uids==id)?' checked':' ';
					var username = (allusers[id]?allusers[id].username:'')||user[id].replace(/@.*/, '');
					html += '<input id="selp_usr_' + id + '" type="'+type+'" name="selp_person" value="' + id + '"'+checked+'><label for="selp_usr_' + id + '">' + USERNAME_COLOR(id, username) + '</label>';
					break;
				}
			}
			html += '</div>';
			html += '</div>';
			html += '</li>';
		}
		$("#selp_list").html(html);
	};
	SelectPerson.prototype.setSelectPerson = function() {
		var callback = _self.callback;
		_self.callback = null;

		if (_self.multi) {
			var users = [];
			$("input[type=checkbox][name=selp_person]").each(function () {
				var el = $(this);
				if (el.prop('checked')) {
					users.push(el.val()*1);
				}
			});
			callback(users);
		} else {
			var user = $("input[type=radio][name=selp_person]:checked").val()*1;
			callback(user);
		}
		app.utils.hideModal();
	};
	return new SelectPerson();
});
