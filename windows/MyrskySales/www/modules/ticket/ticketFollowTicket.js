define(function(require) {
	"use strict";
	var _self;

	function TicketFollowTicket() {
		_self = this;
		_self.id = "ticketFollowTicket";
	}
	
	TicketFollowTicket.prototype.show = function(current_id, data) {
		_self.current_id = ~~current_id;
		_self.data = data;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", footer:"none"});
	};
	TicketFollowTicket.prototype.onLoad = function() {
		//_self.getFollowTicket();
		_self.showPanel();
	};
    TicketFollowTicket.prototype.release = function() {
        _self.data = null;
    };
	TicketFollowTicket.prototype.showPanel = function() {
		var html = '';

        var this_follow_ticket;
        var follow_ticket = _self.data.follow_ticket;
        for (var i in follow_ticket) {
            if (follow_ticket[i].id == _self.current_id) {
                this_follow_ticket = follow_ticket[i];
                break;
            }
        }
        console.log(this_follow_ticket);

		if (~~_self.parent_id) {
            html += '<a class="button icon up" style="float:right;" onclick="app.ticketFollowTicket.showParentTicket(\'' + _self.parent_id + '\')"></a>';
        }
        html += '<div class="leftd">';
        html += '<h2 style="height:auto;">'+this_follow_ticket.subject+'</h2>';
        html += '<div>编号:'+this_follow_ticket.id+'</div>';
        html += '<div>完整编号:'+this_follow_ticket.full_id+'</div>';
        html += '<div>发布人:'+app.ticket.useridToUsername(this_follow_ticket.writer_id)+'</div>';
        html += '<div>发布时间:'+this_follow_ticket.input_date+'</div>';
        html += '<div>可见范围:'+this_follow_ticket.visible+'</div>';
		if (this_follow_ticket.visible_person) {
            html += '<div>可见人员： <span class="icon down" onclick="app.utils.showHideEx(this, \'tfk_visible_persons\')"></span></div>';
            html += '<div id="tfk_visible_persons" style="display: none;word-break:break-all;">' + this_follow_ticket.visible_person + '</div>';
        }
        html += '<div class="speech left">'+this_follow_ticket.message+'</div>';
        html += '</div>';
		for(var key in follow_ticket) {
            if (follow_ticket[key].answer_id == this_follow_ticket.id) {
                html += '<div class="rightd">';
                html += '<h2 style="height:auto;">' + follow_ticket[key].subject + '</h2>';
                html += '<div>回复人:' + app.ticket.useridToUsername(follow_ticket[key].writer_id) + '</div>';
                html += '<div>回复时间:' + follow_ticket[key].input_date + '</div>';
                html += '<div class="speech right" id="tfk_follow_ticket_' + follow_ticket[key].id + '" onclick="app.ticketFollowTicket.showFollowTicket(\'' + follow_ticket[key].id + '\')">' + follow_ticket[key].message + '</div>';
                html += '</div>';
            }
        }
        html += '<div><a href="#"class="button gray" style="width:99%" onclick="app.ticketFollowTicket.replyTicketItem(\''+this_follow_ticket.id+'\')">回复</a></div>';

//		console.log(html);
		$('#tft_follow_list').html(html);
		for (var i in follow_ticket) {
			if (follow_ticket[i].answer_id == this_follow_ticket.id && follow_ticket[i].sub) {
				$.ui.updateBadge("#tfk_follow_ticket_"+follow_ticket[i].id, follow_ticket[i].sub, "tr", 'red');
			}
		}
		$.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
	};
	TicketFollowTicket.prototype.replyTicketItem = function(answer_id) {
		require('ticketReply').show(_self.data.main_ticket.id, answer_id);
	};
	TicketFollowTicket.prototype.showFollowTicket = function(follow_id) {
		_self.parent_id = _self.current_id;
		_self.current_id = ~~follow_id;
		_self.showPanel();
	};
	TicketFollowTicket.prototype.showParentTicket = function(parent_id) {
		_self.current_id = ~~parent_id;
		var this_follow_ticket;
		var follow_ticket = _self.data.follow_ticket;
		for (var i in follow_ticket) {
			if (follow_ticket[i].id == _self.current_id) {
				this_follow_ticket = follow_ticket[i];
				break;
			}
		}
		_self.parent_id = this_follow_ticket.answer_id;
		_self.showPanel();
	};
	TicketFollowTicket.prototype.getFollowTicket = function() {
		var ticket = require('ticket');
		if (!ticket.checkTokenTimeoutForOper(ticket.GET_FOLLOW_TICKET_OPER)) {
			_self.doGetFollowTicket();
		}
	};
	TicketFollowTicket.prototype.doGetFollowTicket = function() {
		var ticket = require('ticket');
		var param = {
			token: ticket.access_token,
			user_id: app.login.username,
			ticket_id: _self.data.main_ticket.id,
			reply: _self.current_id
		};
        var url = app.route.ticketGetReplyUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在发送...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetFollowTicketSuccess,
			error : _self.onGetFollowTicketError
		});
	};
	TicketFollowTicket.prototype.onGetFollowTicketSuccess = function(data) {
		console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
			return;
		}
		//_self.showPanel();
		app.utils.clearWait();
	};
	TicketFollowTicket.prototype.onGetFollowTicketError = function(data, type) {
		$.ui.goBack();
	};
	return new TicketFollowTicket();
});
