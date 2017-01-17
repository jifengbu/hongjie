module.exports = (function() {
    var _self;
    function UserMgr() {
        _self = this;
    }
    UserMgr.prototype.login = function(socket, obj) {
        if (!obj.userid) {
            socket.emit('USER_LOGIN_RS', { error:app.error.USER_ID_NOT_EXIST});
            return;
        }
        app.db.User.findOneAndUpdate({userid:obj.userid}, {}, {upsert:true, new:true, select:'-_id -__v'}, function(err, doc){
            app.notifyMgr.add(obj.userid);
            if (doc.username) {
                app.onlineUserMgr.add(socket, doc);
            } else {
                var url = app.config.USER_INFO_API+"?uid="+obj.userid;
                app.expressMgr.get_remote(url, function(res){
                    res.setEncoding('utf8');
                    res.on('data', function (data) {
                        data = JSON.parse(data);
                        if (data) {
                            doc.username = data.name;
                            console.log("use mrp username:"+data.name);
                            app.db.User.findOneAndUpdate({userid:obj.userid}, {username:data.name}, function(){});
                        }
                        app.onlineUserMgr.add(socket, doc);
                    });
                });
            }
        });
    };
    UserMgr.prototype.sendUserList = function(socket) {
        app.db.User.find({}, '-_id -__v -groups', function (err, docs) {
            console.log(docs);
            socket.emit('USERS_LIST_NF', docs);
        });
    };
    UserMgr.prototype.updateHead = function(socket, obj) {
        app.db.UserInfo._update(socket.userid, obj.head, function() {
            socket.emit('USERS_UPDATE_HEAD_RS', {error:null});
            app.socketMgr.notifyOnlineUsers(socket.userid, 'USERS_UPDATE_HEAD_NF', {userid:socket.userid, head:obj.head});
            app.notifyMgr.addNotify(socket.userid, 'head');
        });
    };
    UserMgr.prototype.getHead = function(socket, users) {
        app.db.UserInfo._get(users, function(docs) {
            socket.emit('USERS_GET_HEAD_RS', docs);
        });
    };
    UserMgr.prototype.updateUserInfo = function(socket, obj) {
        app.db.User._updateUserInfo(socket.userid, obj, function(){
            socket.emit('USERS_UPDATE_USERINFO_RS', obj);
            app.socketMgr.notifyOnlineUsers(socket.userid, 'USERS_UPDATE_USERINFO_NF', {userid:socket.userid, username:obj.username, phone:obj.phone, sign:obj.sign});
        });
    };

    return new UserMgr();
})();


