define(function(require) {
    "use strict";
    var _self;

    function UIMessage() {
        _self = this;
        if (!localStorage["message_badges"]) {
            localStorage["message_badges"] = '{}';
        }
        if (!localStorage["group_message_badges"]) {
            localStorage["group_message_badges"] = '{}';
        }
        if (!localStorage["new_ticket_notify"]) {
            localStorage["new_ticket_notify"] = '[]';
        }
        if (!localStorage["reply_ticket_notify"]) {
            localStorage["reply_ticket_notify"] = '[]';
        }
    }

    UIMessage.prototype.onLoad = function() {
        if (!_self.loaded) {
            _self.loaded = true;
            $("#message_list_container").scroller().enable();
            async.until(
                function(){return app.userMgr.init && app.groupMgr.init},
                function(cb) {setTimeout(cb, 100)},
                function() {_self.showLogMessageList()}
            );
        }
        if (app.historySave) {
            $('#ui_message_back_work').show();
        } else {
            $('#ui_message_back_work').hide();
        }
    };
    UIMessage.prototype.onUnload = function() {
        if (app.historySave && $.ui.history.length < app.historySave.length) {
            app.historySave = null;
        }
        app.clearChatPageBadge();
    };
    UIMessage.prototype.updateNewMessage = function(type, userid, username, time, msg, msgtype, touserid) {
        var msgmgr = app.messageMgr;

        if (type == msgmgr.USER_TYPE) {
            var id = 'message_newest_' + userid;
            var el = $('li#' + id);
            var USERNAME_COLOR = app.color.USERNAME_COLOR,
                html = '';

            if (el) {
                el.remove();
            }
            username = username||userid;
            html += '<li id="' + id + '" onclick="app.uiMessage.showMessageItem('+type+', \'' + userid + '\', \'' + username + '\')">';
            html += '<div class="chat_head chat_head_message default_head user_head_'+userid+'" onclick="app.uiMessage.showContactItem(\''+userid+'\');event.stopPropagation();"></div>';
            html += '<span><h5 class="chat_message_username">' + USERNAME_COLOR(userid, username) + '</h5><span class="chat_message_time">' + app.utils.getShowDate(time) + '</span></span>';
            if (msgtype==msgmgr.TEXT_TYPE) {
                html += '<span class="chat_message">' + msg.replace(/(.*?)<div.*/, '$1').replace(/(.*?)<br.*/, '$1') + '</span>';
            } else if (msgtype==msgmgr.IMAGE_TYPE) {
                html += '<span class="chat_message"><img class="new_message_image" src="' + msg + '"></span>';
            }
            html += '</li>';
            $('#message_list').prepend(html);
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
            _self.updateUserUnreadNotify(userid);
        } else if(type == msgmgr.GROUP_TYPE){
            var name = username;
            var id = 'message_newest_' + name;
            var el = $('li#' + id);
            var users = app.userMgr.users;
            var user = users[userid];
            var PURPLE = app.color.PURPLE,
                RED = app.color.RED,
                GREEN = app.color.GREEN,
                USERNAME_COLOR = app.color.USERNAME_COLOR,
                html = '';
            var list = app.groupMgr.list;
            var group = list[name];

            if (el) {
                el.remove();
            }
            html += '<li id="' + id + '" onclick="app.uiMessage.showMessageItem('+type+',\'' + userid + '\', \'' + name + '\')">';
            html += '<div class="chat_head chat_head_message group_head default_head user_head_'+group.creator+'" onclick="app.uiMessage.showGroupContactItem(\''+username+'\');event.stopPropagation();"></div>';
            html += '<span><h5 class="chat_message_username">' + PURPLE(name) + '</h5><span class="chat_message_time">' + app.utils.getShowDate(time) + '</span></span>';

            var title = USERNAME_COLOR(userid, (userid==app.login.userid)?'我':(user?user.username||userid:userid));
            var obj = JSON.parse(localStorage["GROUP_CHAT_AT_NUMBERS"]||"{}");
            if (touserid) {
                var tousername = (users[touserid])?users[touserid].username||touserid:touserid;
                var touser = app.userMgr.users[touserid];
                title += '对'+USERNAME_COLOR(touserid, (touserid==app.login.userid)?'我':tousername, app.login.userid);
                title += '说';
            }
            if (obj[name]) {
                title = '<span class="group_message_at_me">['+RED("@我 ")+'<span class="af-badge_ex" style="position: relative">'+obj[name]+'</span>] </span> '+title;
            }
            if (msgtype==msgmgr.TEXT_TYPE) {
                html += '<span class="chat_message">' + title + ':' + msg.replace(/(.*?)<div.*/, '$1').replace(/(.*?)<br.*/, '$1') + '</span>';
            } else if (msgtype==msgmgr.IMAGE_TYPE) {
                html += '<span class="chat_message">' + title + ':<img class="new_message_image" src="' + msg + '")</span>';
            }
            html += '</li>';
            $('#message_list').prepend(html);
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
            _self.updateGroupUnreadNotify(name);
        }else if(type == msgmgr.SUPERIOR_TYPE){
            var name = username;
            //var id = 'message_newest_' + name;
            var id = 'message_newest_superior';
            var el = $('li#' + id);
            var users = app.userMgr.users;
            var user = users[userid];
            var PURPLE = app.color.PURPLE,
                RED = app.color.RED,
                GREEN = app.color.GREEN,
                USERNAME_COLOR = app.color.USERNAME_COLOR,
                html = '';
            var list = app.groupMgr.list;
            var group = list[name];

            if (el) {
                el.remove();
            }
            html += '<li id="' + id + '" onclick="app.uiMessage.showMessageItem('+type+',\'' + userid + '\', \'' + name + '\')">';
//            html += '<div class="chat_head chat_head_message group_head default_head user_head_'+group.creator+'" onclick="app.uiMessage.showGroupContactItem(\''+username+'\');event.stopPropagation();"></div>';
            html += '<div class="chat_head chat_head_message superior_head default_head user_head_'+''+'" onclick="app.uiMessage.showGroupContactItem(\''+username+'\');event.stopPropagation();"></div>';
            html += '<span><h5 class="chat_message_username">' + '部门信息' + '</h5><span class="chat_message_time">' + app.utils.getShowDate(time) + '</span></span>';

            var title = USERNAME_COLOR(userid, (userid==app.login.userid)?'我':(user?user.username||userid:userid||username));
            var obj = JSON.parse(localStorage["GROUP_CHAT_AT_NUMBERS"]||"{}");
            if (touserid) {
                var tousername = (users[touserid])?users[touserid].username||touserid:touserid;
                var touser = app.userMgr.users[touserid];
                title += '对'+USERNAME_COLOR(touserid, (touserid==app.login.userid)?'我':tousername, app.login.userid);
                title += '说';
            }
            if (obj[name]) {
                title = '<span class="group_message_at_me">['+RED("@我 ")+'<span class="af-badge_ex" style="position: relative">'+obj[name]+'</span>] </span> '+title;
            }
            if (msgtype==msgmgr.TEXT_TYPE) {
                html += '<span class="chat_message">' + title + ':' + msg.replace(/(.*?)<div.*/, '$1').replace(/(.*?)<br.*/, '$1') + '</span>';
            } else if (msgtype==msgmgr.IMAGE_TYPE) {
                html += '<span class="chat_message">' + title + ':<img class="new_message_image" src="' + msg + '")</span>';
            }
            html += '</li>';
            console.log("Superior_show");
            $('#message_list').prepend(html);
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
            _self.updateGroupUnreadNotify(name);
        }
    };
    UIMessage.prototype.increaseUserUnreadNotify = function(userid) {
        if (app.messageInfo && app.messageInfo.userid == userid && app.utils.isActivePanel(app.messageInfo.id)) {
            return;
        }
        var obj = JSON.parse(localStorage["message_badges"]);
        if (!obj[userid]) {
            obj[userid] = 1;
        } else {
            obj[userid]++;
        }
        localStorage["message_badges"] = JSON.stringify(obj);

    };
    UIMessage.prototype.increaseGroupUnreadNotify = function(name, touserid) {
        if (app.messageInfo && app.messageInfo.username == name && app.utils.isActivePanel(app.messageInfo.id)) {
            return;
        }
        var obj = JSON.parse(localStorage["group_message_badges"]);
        if (!obj[name]) {
            obj[name] = 1;
        } else {
            obj[name]++;
        }
        localStorage["group_message_badges"] = JSON.stringify(obj);
        obj = JSON.parse(localStorage["GROUP_CHAT_AT_NUMBERS"]||"{}");
        if (touserid == app.login.userid) {
            obj[name] = obj[name] || 0;
            obj[name]++;
            localStorage["GROUP_CHAT_AT_NUMBERS"] = JSON.stringify(obj);
        }

    };
    UIMessage.prototype.clearUserUnreadNotify = function(userid) {
        var obj = JSON.parse(localStorage["message_badges"]);
        obj[userid] = 0;
        localStorage["message_badges"] = JSON.stringify(obj);
        _self.updateUserUnreadNotify(userid);
    };
    UIMessage.prototype.clearGroupUnreadNotify = function(name) {
        var obj = JSON.parse(localStorage["group_message_badges"]);
        obj[name] = 0;
        localStorage["group_message_badges"] = JSON.stringify(obj);
        obj = JSON.parse(localStorage["GROUP_CHAT_AT_NUMBERS"]||"{}");
        delete obj[name];
        localStorage["GROUP_CHAT_AT_NUMBERS"] = JSON.stringify(obj);
        _self.updateGroupUnreadNotify(name, true);
    };
    UIMessage.prototype.updateUserUnreadNotify = function(userid) {
        var id = 'li#message_newest_'+userid;
        var obj = JSON.parse(localStorage["message_badges"]);
        var value = obj[userid];
        if (value) {
            $.ui.updateBadge(id, value, "tr", 'red');
        } else {
            $.ui.removeBadge(id);
        }
    };
    UIMessage.prototype.updateGroupUnreadNotify = function(name) {
        var id = 'li#message_newest_'+name;
        var obj = JSON.parse(localStorage["group_message_badges"]);
        var value = obj[name];
        if (value) {
            $.ui.updateBadge(id, value, "tr", 'red');
        } else {
            $.ui.removeBadge(id);
        }
        obj = JSON.parse(localStorage["GROUP_CHAT_AT_NUMBERS"]||'{}');
        if (!obj[name]) {
            $(id).find(".group_message_at_me").remove();
        }
    };
    UIMessage.prototype.showLogMessageList = function() {
        app.messageMgr.getNewestMessage(function(message){
            var msgmgr = app.messageMgr;
            var len = message.length;
            var supper_exist = 0;
            for (var i=0; i<len; i++) {
                var item = message[i];

                if(item.type == msgmgr.SUPERIOR_TYPE){
                    if(supper_exist == 0){
                        _self.updateNewMessage(item.type, item.userid, item.username, item.time, item.msg, item.msgtype, item.touserid);
                        //supper_exist = 1;
                    }

                }else{
                    _self.updateNewMessage(item.type, item.userid, item.username, item.time, item.msg, item.msgtype, item.touserid);
                }


            }
            _self.hasUpdateLogMessage = true;
        });
    };
    UIMessage.prototype.showMessageItem = function(type, userid, username) {
        require('messageInfo').show(0, type, username, userid);
    };
    UIMessage.prototype.showContactItem = function(userid) {
        require('contactInfo').show(userid);
    };
    UIMessage.prototype.showGroupContactItem = function(name) {
        require('groupDetail').show(name, 0);
    };
    UIMessage.prototype.showAllTicket = function() {
        require('ticket').show();
    };
    UIMessage.prototype.showNewTickets = function() {
        var obj = JSON.parse(localStorage["new_ticket_notify"]);
        var arr = _.map(obj, function(item) {return item.ticket_id});
        require('ticket').show(null, arr, 0);
    };
    UIMessage.prototype.showReplyTickets = function() {
        var obj = JSON.parse(localStorage["reply_ticket_notify"]);
        var arr = _.map(obj, function(item) {return item.ticket_id});
        require('ticket').show(null, arr, 1);
    };
    UIMessage.prototype.increaseNewTicketNotify = function(ticket) {
        var obj = JSON.parse(localStorage["new_ticket_notify"]);
        if (_.isArray(ticket)) {
            obj = ticket.concat(obj);
        } else if (ticket) {
            if ((app.ticketDetail && app.utils.isActivePanel(app.ticketDetail.id))||
                (app.ticket && app.utils.isActivePanel(app.ticket.id))) {
                app.ticket.prependNewTicket(ticket.ticket);
            } else {
                var ret = {ticket_id: ticket.ticket_id, writer_id: ticket.writer_id}
                obj.unshift(ret);
            }
        }
        localStorage["new_ticket_notify"] = JSON.stringify(obj);
        _self.updateNewTicketNotify(obj.length);
        if (app.contactInfo && app.utils.isActivePanel(app.contactInfo.id)) {
            app.contactInfo.updateNewTicketNotify();
        }
    };
    UIMessage.prototype.clearNewTicketNotify = function() {
        var obj = [];
        localStorage["new_ticket_notify"] = JSON.stringify(obj);
        _self.updateNewTicketNotify(0);
    };
    UIMessage.prototype.updateNewTicketNotify = function(n) {
        var html = '';
        var el = $('#ui_message_ticket');
        $('#message_new_ticket').remove();
        if (n > 0) {
            $('#message_no_new').remove();
            html += '<div id="message_new_ticket" class="new_notify" onclick="app.uiMessage.showNewTickets();event.stopPropagation();">系统消息有 <span class="notify_number">'+n+'</span> 新发布消息</div>';
        }
        html += el.html();
        if (!html || html.trim().length == 0) {
            html = '<div id="message_no_new">点击进入<span class="message_ticket_enter">系统消息</span></div>';
        }
        el.html(html);
    };
    UIMessage.prototype.increaseReplyTicketNotify = function(ticket) {
        var obj = JSON.parse(localStorage["reply_ticket_notify"]);
        if (_.isArray(ticket)) {
            obj = ticket.concat(obj);
        } else  if (ticket) {
            if (app.ticketDetail && app.utils.isActivePanel(app.ticketDetail.id) &&
                app.ticketDetail.data.main_ticket.id == ticket.ticket_id) {
                var t = ticket.ticket;
                var users = ticket.users;
                app.ticketDetail.appendReply(t.writer_id, ticket.userid, app.utils.adjustDate(t.input_date), $.base64.decode(t.message, true), t.id, t.answer_id, ticket.att);
            } else if (app.ticket && app.utils.isActivePanel(app.ticket.id)) {
                app.ticket.aheadCurrentTicket(ticket.ticket.theme_ticket.main_ticket);
            } else {
                var ret = {ticket_id: ticket.ticket_id, theme_writer_id: ticket.theme_writer_id}
                obj.unshift(ret);
            }
        }
        localStorage["reply_ticket_notify"] = JSON.stringify(obj);
        _self.updateReplyTicketNotify(obj.length);
        if (app.contactInfo && app.utils.isActivePanel(app.contactInfo.id)) {
            app.contactInfo.updateNewTicketNotify();
        }
    };
    UIMessage.prototype.clearReplyTicketNotify = function() {
        var obj = [];
        localStorage["reply_ticket_notify"] = JSON.stringify(obj);
        _self.updateReplyTicketNotify(0);
    };
    UIMessage.prototype.updateReplyTicketNotify = function(n) {
        var html = '';
        var el = $('#ui_message_ticket');
        $('#message_reply_ticket').remove();
        if (n > 0) {
            $('#message_no_new').remove();
            html += '<div id="message_reply_ticket" class="new_notify"  onclick="app.uiMessage.showReplyTickets();event.stopPropagation();">系统消息有 <span class="notify_number">'+n+'</span>条回复消息</div>';
        }
        html += el.html();
        if (!html || html.trim().length == 0) {
            html = '<div id="message_no_new">点击进入<span class="message_ticket_enter">系统消息</span></div>';
        }
        el.html(html);
    };


    return new UIMessage();
});

