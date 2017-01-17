define(function(require) {
	"use strict";
	var _self;

	function TicketReply() {
		_self = this;
		_self.id = "ticketReply";
	}
	
	TicketReply.prototype.show = function(theme_id, answer_id) {
        theme_id = ~~theme_id;
        answer_id = ~~answer_id;
		_self.needUpdate = (_self.theme_id != theme_id || _self.answer_id != answer_id);
		_self.theme_id = theme_id;
		_self.answer_id = answer_id;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	TicketReply.prototype.onLoad = function() {
		if (_self.needUpdate) {
			$("#tr_title").val("");
			$("#tr_content").val("");
		}
		if (_self.answer_id) {
			$("#tr_title_info").html("回复"+_self.theme_id+"["+_self.answer_id+"]");
		} else {
			$("#tr_title_info").html("回复"+_self.theme_id);
		}
	};
    TicketReply.prototype.release = function() {
    };
	TicketReply.prototype.replyTicket = function() {
		var ticket = require('ticket');
		if (!ticket.checkTokenTimeoutForOper(ticket.REPLY_TICKET_OPER)) {
			_self.doReplyTicket();
		}
	};
	TicketReply.prototype.doReplyTicket = function() {
		var title = $("#tr_title").val();
		var content = $("#tr_content").val();
		var ticket = require('ticket');
		
		if (title.trim().length == 0) {
			title = "REQ";
		}
		if (content.trim().length == 0) {
			app.utils.toast("内容不能为空");
			return;
		}
		
		var param = {
			token: ticket.access_token,
			user_id:app.login.username
		};
		var url = app.route.ticketReplyUrl+"?"+$.param(param);
		console.log(url);
		var data = {
			subject: title,
			message: content,
			theme_id: _self.theme_id,
			input_date: $.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
			answer_id: _self.answer_id,
			writer_id: app.login.username
		};
		
		console.log(data);
		app.utils.setWait("正在发送...");
		app.utils.ajax({
			type : "POST",
			url : url,
			data : JSON.stringify(data),
			success : _self.onReplyTicketSuccess
		});
	};
	TicketReply.prototype.onReplyTicketSuccess = function(data) {
		//console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
			return;
		}
		app.utils.toast("回复成功");
		$("#tr_title").val("");
		$("#tr_content").val("");
		app.utils.clearWait();
		app.utils.hideModal();

        if (_self.answer_id) {
            $.ui.goBack();
        }
        var ticket = require('ticket');
        var ticketDetail = require('ticketDetail');
        ticketDetail.from = ticketDetail.FROM_TICKET_REPLY;
        ticket.getTicketItem();
	};
	
	return new TicketReply();
});
