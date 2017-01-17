module.exports = (function() {
    var _self;
    function NotifyMgr() {
        _self = this;
    }
    NotifyMgr.prototype.sendUserNotify = function(socket) {
        app.db.UserNotify._get(socket.userid, function (doc) {
            if (doc) {
                app.db.UserInfo._get(doc.head, function(docs) {
                    socket.emit('USERS_NOTIFY_NF', {head:docs, reply_ticket:doc.reply_ticket, new_ticket:doc.new_ticket, work_notice:doc.work_notice});
                });
            } else {
                socket.emit('USERS_NOTIFY_NF', {head:[], reply_ticket:[], new_ticket:[], work_notice:[]});
            }
        });
    };
    NotifyMgr.prototype.add = function(userid) {
        app.db.UserNotify._init(userid);
    };
    NotifyMgr.prototype.addNotify = function(userid, type) {
        var mgr = app.onlineUserMgr;
        var onlineUsers = mgr.onlineUsers;
        var users = [];
        for (var id in onlineUsers) {
            users.push(id);
        }
        var allusers = [];
        app.db.User.find(function (err, docs) {
            _.map(docs, function(doc){
                allusers.push(doc.userid);
            });
            app.db.UserNotify._add(type, _.difference(allusers, users), userid);
        });
    };
    NotifyMgr.prototype.clearNotify = function(socket) {
        app.db.UserNotify._clear(socket.userid);
    };
    NotifyMgr.prototype.dealTicketIssueNotify = function(users, msg) {
        var writer_id = ~~(msg.writer_id);
        var onlineUsers = _.map(_.keys(app.onlineUserMgr.onlineUsers), function(n){return ~~n;});
        users = _.without(_.map(users, function(n){return ~~n;}), writer_id);
        var nfusers = _.intersection(onlineUsers, users);
        var snusers = _.difference(users, onlineUsers);
        var ticket_id = msg.id;
        console.log("issue ticket send", ticket_id, nfusers.join(','));
        console.log("issue ticket save", ticket_id, snusers.join(','));
        app.db.UserNotify.update({userid:{$in: snusers}}, {$addToSet:{new_ticket:{ticket_id:ticket_id, writer_id:writer_id}}}, {multi:true}, function(err, num, effect){
            app.socketMgr.notifyOtherUsers(nfusers, '', 'TICKET_ISSUE_NF', {ticket_id:ticket_id, writer_id:writer_id, ticket:msg});
        });
    };
    NotifyMgr.prototype.dealTicketReplyNotify = function(users, msg) {
        var userid = ~~users[0];
        users = _.uniq(_.map(users, function(n){return ~~n;}));
        var writer_id = ~~(msg.writer_id);
        var ticket_id = msg.theme_id;
        var theme_writer_id = ~~(msg.theme_ticket.main_ticket.writer_id);

        var onlineUsers = _.map(_.keys(app.onlineUserMgr.onlineUsers), function(n){return ~~n;});
        var nfusers = _.intersection(onlineUsers, users);


        console.log("reply ticket send ticket_id =", ticket_id, "userid =", userid);
        app.socketMgr.notifyOtherUsers(nfusers, writer_id, 'TICKET_REPLY_NF', {ticket_id:ticket_id, theme_writer_id:theme_writer_id, ticket:msg, userid:userid});

        var client = app.onlineUserMgr.getClient(userid);
        if (!client) {
            console.log("reply ticket save ticket_id =", ticket_id, "userid =", userid);
            app.db.UserNotify.update({userid:userid}, {$addToSet:{reply_ticket:{ticket_id:ticket_id, theme_writer_id:theme_writer_id}}}, function(err, num, effect){
            });
        }
    };
    NotifyMgr.prototype.dealWorkNotice = function(users, msg) {
        users = _.uniq(_.map(users, function(n){return ~~n;}));
        var onlineUsers = _.map(_.keys(app.onlineUserMgr.onlineUsers), function(n){return ~~n;});
        var nfusers = _.intersection(onlineUsers, users);
        var snusers = _.difference(users, nfusers);

        console.log("work notice with title="+msg.title+" msg="+msg.msg+" time="+msg.time+" module="+msg.module);
        app.socketMgr.notifyOtherUsers(nfusers, null, 'WORK_NOTICE_NF', msg);

        app.db.UserNotify.update({userid:{$in:snusers}}, {$push:{work_notice:msg}}, {multi:true}, function(err, num, effect){
        });
    };
    NotifyMgr.prototype.dealMrpNotify = function(type, users, msg) {
        switch (type) {
            case 'NOTIFY_TICKET_ISSUE':
                _self.dealTicketIssueNotify(users, msg);
                break;
            case 'NOTIFY_TICKET_REPLY':
                _self.dealTicketReplyNotify(users, msg);
                break;
            case 'NOTIFY_WORK_NOTICE':
                _self.dealWorkNotice(users, msg);
                break;
            default:
                return false;
        }
        return true;
    };

    return new NotifyMgr();
})();


