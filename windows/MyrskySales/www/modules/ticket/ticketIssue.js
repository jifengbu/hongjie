define(function(require) {
	"use strict";
	var _self;

	function TicketIssue() {
		_self = this;
		_self.id = "ticketIssue";
	}
	
	TicketIssue.prototype.show = function(privInfo, commonInfo) {
		_self.privInfo = privInfo;
		_self.commonInfo = commonInfo;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", transition:"up", footer:"none"});
	};
	TicketIssue.prototype.onLoad = function() {
        if (!_self.addOptions) {
            _self.addOptions = true;
            var category = _self.privInfo.avail_category;
            var options = '';
            for (var i = 0; i < category.length; i++) {
                options += "<option value='" + category[i].key + "'>" + category[i].key + "</option>";
                //$("#ti_track_type").append("<option value='"+category[i].key+"'>"+category[i].key+"</option>");
            }
            $("#ti_track_type").html(options);
        }
	};
    TicketIssue.prototype.release = function() {
        _self.privInfo = null;
        _self.commonInfo = null;
        _self.addOptions = null;
    };
	TicketIssue.prototype.issueTicket = function() {
		var ticket = require('ticket');
		if (!ticket.checkTokenTimeoutForOper(ticket.ISSUE_TICKET_OPER)) {
			_self.doIssueTicket();
		}
	};
	TicketIssue.prototype.showVisibleGroup = function() {
		var group = $("#ti_visible_group").val();
		require('ticketVisibleGroup').show(group, _self.commonInfo);
	};
	TicketIssue.prototype.setVisibleGroup = function(info) {
		$("#ti_visible_group").val(info);
	};
	TicketIssue.prototype.showVisiblePerson = function() {
		var persons = $("#ti_visible_person").val();
		require('ticketVisiblePerson').show(persons, _self.commonInfo);
	};
	TicketIssue.prototype.setVisiblePerson = function(info) {
		$("#ti_visible_person").val(info);
	};
	TicketIssue.prototype.doIssueTicket = function() {
		var title = $("#ti_title").val();
		var content = $("#ti_content").val();
		var ticket = require('ticket');
		
		if (title.trim().length == 0) {
			app.utils.toast("主题不能为空");
			return;
		}
		if (content.trim().length == 0) {
			app.utils.toast("内容不能为空");
			return;
		}
		
		var grade = $("#ti_emergency_level").val(); 
		var visible_group = $("#ti_visible_group").val();
		var visible_person = $("#ti_visible_person").val();
		var category = $("#ti_track_type").val();
        var purpose_category = "message";
        if(category == "daily_report"){
            purpose_category = "message_7";
        }
        var other_id = $("#ti_track_other_id").val();
		visible_person = visible_person.split(',');
		var persons = "";
		for (var i=0; i<visible_person.length; i++) {
			var person = visible_person[i].trim();
			if (person.length > 0) {
				if (persons != "") {
					persons += ",";
				}
				persons += "["+person+"]"; 
			}
		}
		var param = {
			token: ticket.access_token
		};
		var url = app.route.ticketIssueUrl+"?"+$.param(param);
		console.log(url);
		var data = {
			subject: title,
			message: content,
			category: category,
            purpose_category:purpose_category,
			generator: 'manual',
			other_id: other_id.trim(),
			input_date: $.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
			visible: visible_group,
			visible_person: persons,
			grade: grade,
			comment_source: 'directly',
			writer_id: app.login.username
		};
		console.log(data);
		app.utils.setWait("正在发布...");
		app.utils.ajax({
			type : "POST",
			url : url,
			data : JSON.stringify(data),
			success : _self.onIssueTicketSuccess
		});
	};
	TicketIssue.prototype.onIssueTicketSuccess = function(data) {
		console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
			return;
		}
		$("#ti_title").val("");
		$("#ti_content").val("");
		app.utils.toast("发布成功");
		app.utils.clearWait();
		var ticket = require('ticket');
		ticket.updateType = ticket.UPDATE_LIST_TYPE;
		$.ui.goBack();
	};
	
	return new TicketIssue();
});
