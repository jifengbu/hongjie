define(function(require) {
	"use strict";
	var _self;

	function SelectPersonByDisp() {
		_self = this;
		_self.id = "selectPersonByDisp";
	}

	SelectPersonByDisp.prototype.show = function(uids, stg,date,callback) {
		_self.multi = _.isArray(uids);
		_self.uids = _self.multi?_.map(uids, function(item) {return item*1;}):uids*1;
		_self.callback = callback;
		_self.stg = stg;
		_self.date = date;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	SelectPersonByDisp.prototype.onLoad = function() {
		_self.loadPerson();
	};
	SelectPersonByDisp.prototype.loadPerson = function(){
		var param = {
            oper:"6",
			stg:_self.stg,
			date:_self.date,
			uid:app.login.userid,
        };
		var url = app.route.stagePlanComUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("正在获取已过数用户...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onloadPersonSuccess
        });		
	}
	SelectPersonByDisp.prototype.onloadPersonSuccess = function(data){
		 if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
        }
		app.utils.clearWait();
		if(!data.list){
			app.utils.toast("该工序和日期没有人员过数");
            app.utils.clearWait();
			$("#selpbd_list").html('');
            return;	
		}
		_self.persons = data.list;
		_self.showPanel();
	}
	SelectPersonByDisp.prototype.showPanel = function() {
		var users = _self.persons,
			USERNAME_COLOR = app.color.USERNAME_COLOR,
			uids = _self.uids,
			html = '',
			type = _self.multi ? 'checkbox':'radio';

		_self.uids = null;
		console.log(type);
		html += '<li>';
		html += '<div class="input-group">';
		for (var idx in users) {
			
			console.log(users[idx]);
			var checked = (_self.multi?_.contains(uids, users[idx].id*1):uids==users[idx].id)?' checked':' ';
			var username = users[idx].name||users[idx].email.replace(/@.*/, '');
			html += '<input id="selpbd_usr_' + users[idx].id + '" type="'+type+'" name="selpbd_person" value="' + users[idx].id + '"'+checked+'><label for="selpbd_usr_' + users[idx].id + '">' 
			+ USERNAME_COLOR(users[idx].id, users[idx].name) + 
			'</label>';
			
		}
		html += '</div>';
		html += '</li>';
		$("#selpbd_list").html(html);
	};
	SelectPersonByDisp.prototype.setSelectPerson = function() {
		var callback = _self.callback;
		_self.callback = null;

		if (_self.multi) {
			var users = [];
			$("input[type=checkbox][name=selpbd_person]").each(function () {
				var el = $(this);
				if (el.prop('checked')) {
					users.push(el.val()*1);
				}
			});
			callback(users);
		} else {
			var user = $("input[type=radio][name=selpbd_person]:checked").val()*1;
			callback(user);
		}
		app.utils.hideModal();
	};
	return new SelectPersonByDisp();
});
