define(function(require) {
	"use strict";
	var _self;
	function CantactInfo() {
		_self = this;
		_self.id = "contactInfo";
	}
	CantactInfo.prototype.show = function(userid) {
        _self.userid = userid;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"up", loadfunc:_self.id+"=onLoad"});
	};
	CantactInfo.prototype.onLoad = function() {
		var user = app.userMgr.users[_self.userid];
        $('#cti_userid').html('账号:'+user.userid);
        $('#cti_name').html(user.username||user.userid);
		if (user.phone) {
			$('#cti_phonenum_ex').show();
			$('#cti_phonenum').html(user.phone);
			if (user.phone) {
				$('#cti_phone').css('color', 'green');
				$('#cti_message').css('color', 'green');
			} else {

				$('#cti_phone').css('color', 'gray');
				$('#cti_message').css('color', 'gray');
			}
		} else {
			$('#cti_phonenum').html('&nbsp;');
			$('#cti_phonenum_ex').hide();
		}
		$('#cti_sign').val(user.sign || '');
		app.utils.changeUserHead($('#cti_head')[0], _self.userid);
		_self.updateNewTicketNotify();
		_self.updateReplyTicketNotify();
	};
	CantactInfo.prototype.updateNewTicketNotify = function() {
		var html = '';
		var obj = JSON.parse(localStorage["new_ticket_notify"]);
		var t = _.filter(obj, function(item){return item.writer_id == _self.userid});
		var arr = _.map(t, function(item) {return item.ticket_id});
		var n = arr.length;
		var user = app.userMgr.users[_self.userid];
		var USERNAME_COLOR = app.color.USERNAME_COLOR;
		var el = $('#cti_ticket');
		$('#cti_new_ticket').remove();
		$('#cti_no_new').remove();
		if (n > 0) {
			html += '<div id="cti_new_ticket" class="new_notify" onclick="app.contactInfo.showPersonalNewTickets();event.stopPropagation();">'+USERNAME_COLOR(user.userid, user.username||user.userid)+'的系统消息有 <span class="notify_number">'+n+'</span> 新发布消息</div>';
		}
		html += el.html();
		if (!html || html.trim().length == 0) {
			html = '<div id="cti_no_new">点击进入'+USERNAME_COLOR(user.userid, user.username||user.userid)+'的<span class="message_ticket_enter">系统消息</span></div>';
		}
		el.html(html);
	};
	CantactInfo.prototype.updateReplyTicketNotify = function() {
		var html = '';
		var obj = JSON.parse(localStorage["reply_ticket_notify"]);
		var t = _.filter(obj, function(item){return item.theme_writer_id == _self.userid});
		var arr = _.map(t, function(item) {return item.ticket_id});
		var n = arr.length;
		var user = app.userMgr.users[_self.userid];
		var USERNAME_COLOR = app.color.USERNAME_COLOR;
		var el = $('#cti_ticket');
		$('#cti_reply_ticket').remove();
		$('#cti_no_new').remove();
		if (n > 0) {
			html += '<div id="cti_reply_ticket" class="new_notify"  onclick="app.contactInfo.showPersonalReplyTickets();event.stopPropagation();">'+USERNAME_COLOR(user.userid, user.username||user.userid)+'的系统消息有 <span class="notify_number">'+n+'</span>条回复消息</div>';
		}
		html += el.html();
		if (!html || html.trim().length == 0) {
			html = '<div id="cti_no_new">点击进入'+USERNAME_COLOR(user.userid, user.username||user.userid)+'的<span class="message_ticket_enter">系统消息</span></div>';
		}
		el.html(html);
	};
	CantactInfo.prototype.showPersonalNewTickets = function() {
		var obj = JSON.parse(localStorage["new_ticket_notify"]);
		var t = _.filter(obj, function(item){return item.writer_id == _self.userid});
		var arr = _.map(t, function(item) {return item.ticket_id});
		require('ticket').show(_self.userid, arr, 0);
	};
	CantactInfo.prototype.showPersonalReplyTickets = function() {
		var obj = JSON.parse(localStorage["reply_ticket_notify"]);
		var t = _.filter(obj, function(item){return item.theme_writer_id == _self.userid});
		var arr = _.map(t, function(item) {return item.ticket_id});
		require('ticket').show(_self.userid, arr, 1);
	};
	CantactInfo.prototype.clearNewTicketNotify = function() {
		var obj = JSON.parse(localStorage["new_ticket_notify"]);
		var t = _.filter(obj, function(item){return item.writer_id != _self.userid});
		localStorage["new_ticket_notify"] = JSON.stringify(t);
		app.uiMessage.updateNewTicketNotify(t.length);
		_self.updateNewTicketNotify();
	};
	CantactInfo.prototype.clearReplyTicketNotify = function() {
		var obj = JSON.parse(localStorage["reply_ticket_notify"]);
		var t = _.filter(obj, function(item){return item.theme_writer_id != _self.userid});
		localStorage["reply_ticket_notify"] = JSON.stringify(t);
		app.uiMessage.updateReplyTicketNotify(t.length);
		_self.updateReplyTicketNotify();
	};
	CantactInfo.prototype.showPersonalAllTicket = function() {
		require('ticket').show(_self.userid);
	};
	CantactInfo.prototype.doMessageChat = function() {
		var user = app.userMgr.users[_self.userid];
		require('messageInfo').show(0, app.messageMgr.USER_TYPE, user.username||_self.userid, _self.userid);
	};
    CantactInfo.prototype.doPhoneCall = function() {
	var user = app.userMgr.users[_self.userid];
        navigator.utils.callNumber(user.phone);
    };
    CantactInfo.prototype.doPhoneMessage = function() {
    	var user = app.userMgr.users[_self.userid];
        navigator.utils.sendSms(user.phone);
    };
    CantactInfo.prototype.doAudioChat = function() {
		if (!app.chatLogin) {
			app.utils.toast("你没有登陆聊天服务器");
			return;
		}
		if (!app.onlineUserMgr.onlineUsers[_self.userid]) {
			app.utils.toast("对方不在线");
			return;
		}
		if (_from == 'web' && !navigator.getUserMedia) {
			app.utils.toast("你的浏览器支持音频聊天");
			return;
		}
		require('audioCall').show(_self.userid);
    };
    CantactInfo.prototype.doVideoChat = function() {
		if (!app.chatLogin) {
			app.utils.toast("你没有登陆聊天服务器");
			return;
		}
		if (!app.onlineUserMgr.onlineUsers[_self.userid]) {
			app.utils.toast("对方不在线");
			return;
		}
		if (_from == 'web' && !navigator.getUserMedia) {
			app.utils.toast("你的浏览器支持音频聊天");
			return;
		}
        require('videoCall').show(_self.userid);
    };
	return new CantactInfo();
});