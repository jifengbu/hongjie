module.exports = (function() {
    var _self;

    function MessageMgr() {
        _self = this;
        _self.USER_TYPE = 0;
        _self.GROUP_TYPE = 1;
		_self.SUPERIOR_TYPE = 2;
    }

    MessageMgr.prototype.send = function(socket, obj) {
        console.log(obj);
        obj.time = Date.now();
        if (obj.type == _self.USER_TYPE) {
            _self.sendMessageToUsers(socket, obj);
        }else if(obj.type == _self.SUPERIOR_TYPE){
			_self.sendMessageToSuperior(socket, obj);
		}else if (obj.type == _self.GROUP_TYPE) {
            _self.sendMessageToGroup(socket, obj);
        }
    };
    MessageMgr.prototype.sendMessageToUsers = function(socket, obj) {
        var to = obj.to;
        var users = to.split(',');
        socket.emit('USER_SEND_MESSAGE_RS', {to:to, msgid:obj.msgid, time:obj.time});
        for (var i=0,len=users.length; i<len; i++) {
            _self.sendMessageToUser(socket, users[i], obj);
        }
        app.db.Logger._logMessage(socket.userid, obj.to, obj.msg, obj.time);
    };
    MessageMgr.prototype.sendMessageToSuperior = function(socket, obj) {		
		
        var superiors = obj.to;
        var users = superiors.split(',');
        socket.emit('USER_SEND_MESSAGE_RS', {to:superiors, msgid:obj.msgid, time:obj.time});
        for (var i=0,len=users.length; i<len; i++) {
            _self.sendMessageToUser(socket, users[i], obj);
        }
        app.db.Logger._logMessage(socket.userid, obj.to, obj.msg, obj.time);
    };
    MessageMgr.prototype.sendMessageToGroup = function(socket, obj) {
        console.log(obj);
        var group = obj.to;
        socket.emit('USER_SEND_MESSAGE_RS', {to:group, msgid:obj.msgid, time:obj.time});
        app.groupMgr.getGroupUsers(group, function(users) {
            for (var i=0,len=users.length; i<len; i++) {
                if (socket.userid != users[i]) {
                    _self.sendMessageToUser(socket, users[i], obj);
                }
            }
        });
        app.db.Logger._logMessage(socket.userid, obj.to, obj.msg, obj.time);
    };
    MessageMgr.prototype.sendMessageToUser = function(socket, userid, obj) {
		console.log('testresult');
		console.log(obj);
		
        app.db.OfflineMessage._add(socket.userid, userid, obj.msg, obj.msgtype, obj.msgid, obj.type, obj.to, obj.time, obj.touserid);
        app.db.Message._add(socket.userid, userid, obj.msg, obj.msgtype, obj.msgid, obj.type, obj.to, obj.time, obj.touserid);
        var client = app.onlineUserMgr.getClient(userid);
        if (client) {
            var rec = {from:socket.userid, msg:obj.msg, msgtype:obj.msgtype, msgid:obj.msgid, type:obj.type, time:obj.time, touserid:obj.touserid};
            if (obj.type == _self.GROUP_TYPE) {
                 rec.group = obj.to;
            }else if(obj.type == _self.SUPERIOR_TYPE){
				 rec.superior = obj.to;
			}
            app.io.to(client.socketid).emit('USER_MESSAGE_NF', rec);
        }
    };
    MessageMgr.prototype.sendOfflineMessage = function(socket) {
        app.db.OfflineMessage._get(socket.userid, function(docs){
            if (docs.length) {
                console.log("send offline message to "+ socket.userid);
				//console.log(docs);
                socket.emit('USER_OFFONLINE_MESSAGE_NF', docs);
            }
        });
    };
    MessageMgr.prototype.onUserReceivedMessage = function(socket, obj) {
        console.log("received", obj);
        var client = app.onlineUserMgr.getClient(obj.from);
        if (client) {
            app.io.to(client.socketid).emit('USER_MESSAGE_RECEIVED_NF', {to:socket.userid, msgid:obj.msgid});
        }
        app.db.OfflineMessage._remove(socket.userid, obj.from, obj.msgid);
    };
    MessageMgr.prototype.deleteOfflineMessage = function(socket) {
        app.db.OfflineMessage._remove(socket.userid);
    };
    MessageMgr.prototype.getHistoryMessage = function(socket, obj) {
        if (obj.type == _self.USER_TYPE) {
            app.db.Message._getByUser(socket.userid, obj.counter, obj.time, obj.cnt, function(docs) {
                socket.emit('USER_GET_MESSAGE_RS', {type:obj.type, msg:docs, _id:obj._id});
            });
        } else {
            app.db.Message._getByGroup(socket.userid, obj.counter, obj.time, obj.cnt, function(docs) {
                socket.emit('USER_GET_MESSAGE_RS', {type:obj.type, msg:docs, _id:obj._id});
            });
        }
    };

    return new MessageMgr();
})();


