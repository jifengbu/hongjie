define(function(require) {
	"use strict";
	var _self;

	function TicketDetail() {
		_self = this;
		_self.id = "ticketDetail";
		
		_self.FROM_TICKET_LIST = 0;
		_self.FROM_TICKET_REPLY = 1;
		_self.from = _self.FROM_TICKET_LIST;
	}
	
	TicketDetail.prototype.show = function(data, commonInfo) {
		_self.data = data;
        _self.commonInfo = commonInfo;
		if (_self.from == _self.FROM_TICKET_REPLY) {
			_self.from = _self.FROM_TICKET_LIST;
			_self.onLoad();
		} else {
			app.utils.loadPanel(_self.id, {footer:"none", loadfunc:_self.id+"=onLoad"});
		}
	};
	TicketDetail.prototype.onLoad = function() {
		var html = '',
            data = _self.data;

        var show_persons = '';
        if (_self.data.main_ticket.visible_person) {
            var persons = _self.data.main_ticket.visible_person.split(',');
            for (var i = 0, len = persons.length; i < len; i++) {
                var person = persons[i];
                if (person) {
                    person = person.substr(1, person.length - 2)
                    show_persons += ', ' + app.ticket.useridToUsername(person);
                }
            }
        }
        show_persons = show_persons.substr(1);


        html += '<div class="leftd">';
        html += '<h2 style="height:auto;">'+data.main_ticket.subject+'</h2>';
        html += '<div>编号:'+data.main_ticket.id+'</div>';
        html += '<div>发布人:'+app.ticket.useridToUsername(data.main_ticket.writer_id)+'</div>';
        html += '<div style="word-break:break-all;" >发布时间:'+data.main_ticket.input_date+'</div>';
        html += '<div>状态:'+data.main_ticket.status+'</div>';
        html += '<div>可见范围： <span class="icon down" onclick="app.utils.showHideEx(this, \'tk_visible_persons\')"></span></div>';
        html += '<div id="tk_visible_persons" style="display: none;">';
        html += '<div style="word-break:break-all;" ><span style="visibility:hidden">可见</span>群组:'+data.main_ticket.visible+'</div>';
        if (data.main_ticket.visible_person) {
            html += '<div style="word-break:break-all;" ><span style="visibility:hidden">可见</span>人员:' + show_persons + '</div>';
        }
        html += '</div>';
        html += '<div class="speech left">'+data.main_ticket.message+'</div>';
        html += '</div>';
        for (var key in data.follow_ticket) {
            if (data.follow_ticket[key].answer_id == "0") {
                html += '<div class="rightd">';
                html += '<h2 style="height:auto;">' + data.follow_ticket[key].subject + '</h2>';
                html += '<div>回复人:' + app.ticket.useridToUsername(data.follow_ticket[key].writer_id) + '</div>';
                html += '<div>回复时间:' + data.follow_ticket[key].input_date + '</div>';
                html += '<div class="speech right" id="tk_follow_ticket_' + data.follow_ticket[key].id + '" onclick="app.ticketDetail.showFollowTicket(\'' + data.follow_ticket[key].id + '\')">' + data.follow_ticket[key].message + '</div>';
                html += '</div>';
            }
        }
        html += '<div><a href="#" class="button gray" style="width:99%" onclick="app.ticketDetail.replyTicketItem()">回复</a></div>';

		//console.log(html);
		$('#pn_ticket_detail_list').html(html);
		var follow_ticket = _self.data.follow_ticket;
		for (var i in follow_ticket) {
			if (follow_ticket[i].answer_id == "0" && follow_ticket[i].sub) {
				$.ui.updateBadge("#tk_follow_ticket_"+follow_ticket[i].id, follow_ticket[i].sub, "tr", 'red');
			}
		}
		
		$.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
	};
    TicketDetail.prototype.release = function() {
        _self.data = null;
        _self.commonInfo = null;
    };
	TicketDetail.prototype.replyTicketItem = function() {
		require('ticketReply').show(_self.data.main_ticket.id);
	};
	TicketDetail.prototype.showFollowTicket = function(follow_id) {
		require('ticketFollowTicket').show(follow_id, _self.data);
	};
	
	return new TicketDetail();
});
