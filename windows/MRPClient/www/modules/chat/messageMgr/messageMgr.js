define(function(require) {
    "use strict";
    var _self;

    function MessageMgr() {
        _self = this;
        _self.msgid = localStorage.msgid||1;

        //message type
        _self.TEXT_TYPE = 0;
        _self.IMAGE_TYPE = 1;
        _self.AUDIO_TYPE = 2;
        _self.VIDEO_TYPE = 3;

        //user type
        _self.USER_TYPE = 0;
        _self.GROUP_TYPE = 1;
        _self.SUPERIOR_TYPE = 2;

        //message per count
        _self.PER_COUNT = 10;
    }

    MessageMgr.prototype.increaseMsgId = function() {
        _self.msgid++;
        if (!_self.msgid) {
            _self.msgid = 1;
        }
        localStorage.msgid = _self.msgid;
    };
    MessageMgr.prototype.getNewestMessage = function(callback) {
        app.login.newest_message_db.find(function (err, docs) {
            callback(_.sortBy(docs, function(obj) {
                return obj.time;
            }));
        });
    };
    MessageMgr.prototype.getUserMessage = function(userid, time, callback) {
        if ('function' == typeof time) {
            callback = time;
            time = null;
        }
        var query = {
            type: _self.USER_TYPE,
            userid: userid
        };
        if (time) {
            query.time = {$lt: time};
        }
        app.login.history_message_db.find(query,
            function (err, docs) {
                callback(_.sortBy(docs, function (obj) {
                    return -obj.time;
                }).slice(0, _self.PER_COUNT));
            });
    };
    MessageMgr.prototype.getGroupMessage = function(name, time, callback) {
        if ('function' == typeof time) {
            callback = time;
            time = null;
        }
        var query = {
            type: _self.GROUP_TYPE,
            username: name
        };
        if (time) {
            query.time = {$lt: time};
        }
        app.login.history_message_db.find(query,
            function (err, docs) {
                callback(_.sortBy(docs, function (obj) {
                    return -obj.time;
                }).slice(0, _self.PER_COUNT));
            });
    };

    MessageMgr.prototype.getSuperiorMessage = function(name, time, callback) {
        if ('function' == typeof time) {
            callback = time;
            time = null;
        }
        var query = {
            type: _self.SUPERIOR_TYPE
        };
        if (time) {
            query.time = {$lt: time};
        }
        app.login.history_message_db.find(query,
            function (err, docs) {
                callback(_.sortBy(docs, function (obj) {
                    return -obj.time;
                }).slice(0, _self.PER_COUNT));
            });
    };

    MessageMgr.prototype.showNewestMessage = function(type, userid, username, time, msg, msgtype, send, touserid) {
        if (type == _self.USER_TYPE) {
            app.uiMessage.increaseUserUnreadNotify(userid);
            app.uiMessage.updateNewMessage(type, userid, username, time, msg, msgtype);
            if (app.messageInfo) {
                app.messageInfo.showUserNewestMessage(userid, username, time, msg, msgtype, send);
            }
        } else if (type == _self.GROUP_TYPE) {
            app.uiMessage.increaseGroupUnreadNotify(username, touserid);
            app.uiMessage.updateNewMessage(type, userid, username, time, msg, msgtype, touserid);
            if (app.messageInfo) {
                app.messageInfo.showGroupNewestMessage(userid, username, time, msg, msgtype, send, touserid);
            }
        } else {
            app.uiMessage.updateNewMessage(type, userid, username, time, msg, msgtype, touserid);
            if (app.messageInfo) {
                app.messageInfo.showSuperiorNewestMessage(userid, username, time, msg, msgtype, send, touserid);
            }
        }
        if (type == _self.SUPERIOR_TYPE) {
            app.login.newest_message_db.upsert({type: type}, {userid:userid,username: username, time: time,
                msg: msg, msgtype: msgtype, touserid: touserid});
        } else {
            app.login.newest_message_db.upsert({type: type, userid: userid}, {username: username, time: time,
                msg: msg, msgtype: msgtype, touserid: touserid});
        }
        console.log("update newest_message_db", {type: type, userid: userid}, {username: username,time: time,
            msg: msg, msgtype:msgtype});
        var doc = {type:type, userid:userid, username:username, time:time, msg:msg, msgtype:msgtype};
        if (send != null ) {
            doc.send = send;
        }
        if (touserid) {
            doc.touserid = touserid;
        }
        console.log("update history_message_db", doc);
        app.login.history_message_db.insert(doc);
    };
    MessageMgr.prototype.sendUserMessage = function(users, msg, msgtype) {
        _self.increaseMsgId();

        app.emit('USER_SEND_MESSAGE_RQ', {type:_self.USER_TYPE, to:users, msg:msg, msgtype:msgtype, msgid:_self.msgid});

        var list = users.split(',');
        var time = Date.now();
        var allUsers = app.userMgr.users;

        //在传送的同时，需要将上级领料也传进去.
        for (var i= 0,len=list.length; i<len; i++) {
            var userid = list[i];
            _self.showNewestMessage(_self.USER_TYPE, userid, allUsers[userid].username, time, msg, msgtype, _self.msgid);
        }

        var uplever_user = app.userMgr.getupleverusers(users);
        if(uplever_user){
            console.log(uplever_user);
            var uplever_user_arr = uplever_user.split(",");
            var uplever_user_join = "[" + uplever_user_arr.join("][") +"]";
            //传送ticket
            var param = {
            };
            var url = app.route.crmTicketIssueUrl+"?"+$.param(param);
            console.log(url);
            var data = {
                subject: '[AUTO]UserID:' + app.login.userid + ' send to ' + userid + ' message',
                message: msg,
                is_notify:'no',
                category: 'root',
                purpose_category:'message',
                generator: 'auto',
                other_id: '',
                input_date: $.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
                visible: '',
                visible_person: uplever_user_join,
                grade: 5,
                reading: '',
                comment_source: 'directly',
                writer_id: app.login.userid
            };

            console.log(data);

            app.utils.ajax({
                type : "POST",
                url : url,
                data : JSON.stringify(data),
                success : _self.onIssueTicketSuccess
            });


            _self.sendSuperiorMessage(uplever_user,msg,msgtype,users);
        }
    };
    MessageMgr.prototype.sendSuperiorMessage = function(superiors, msg, msgtype, touserid) {
        console.log(superiors);
        _self.increaseMsgId();
        app.emit('USER_SEND_MESSAGE_RQ', {type:_self.SUPERIOR_TYPE, to:superiors, msg:msg, msgtype:msgtype, msgid:_self.msgid, touserid:touserid});
//        var time = Date.now();
//        _self.showNewestMessage(_self.SUPERIOR_TYPE, app.login.userid, superiors, time, msg, msgtype, _self.msgid, touserid);
    };
    MessageMgr.prototype.sendGroupMessage = function(group, msg, msgtype, touserid) {
        _self.increaseMsgId();
        app.emit('USER_SEND_MESSAGE_RQ', {type:_self.GROUP_TYPE, to:group, msg:msg, msgtype:msgtype, msgid:_self.msgid, touserid:touserid});
        var time = Date.now();
        _self.showNewestMessage(_self.GROUP_TYPE, app.login.userid, group, time, msg, msgtype, _self.msgid, touserid);
    };
    MessageMgr.prototype.onSendUserMessage = function(obj) {
        if (obj.error) {
            console.error(error);
        } else {
            console.log("send to "+obj.to+" ["+obj.msgid+"]", obj.time, "server success");
        }
    };
    MessageMgr.prototype.showUserMessage = function(obj) {
        console.log(obj);
        if(obj.type != _self.SUPERIOR_TYPE){    //发给上级的信息不用提醒.
            app.utils.playSound(app.resource.aud_message_tip);
            app.updateChatPageBadge(true);
        }

        if (obj.type == _self.USER_TYPE) {
            var allUsers = app.userMgr.users;
            var username = allUsers[obj.from].username;
            app.utils.addMessageNotification(username||obj.from, obj.msg);
            _self.showNewestMessage(_self.USER_TYPE, obj.from, username, obj.time, obj.msg, obj.msgtype);
            console.log('['+obj.from+']','['+obj.msgid+']:', obj.msg, obj.msgtype, obj.time);
        }else if(obj.type == _self.GROUP_TYPE){
            app.utils.addMessageNotification(obj.group, obj.msg, true);
            _self.showNewestMessage(_self.GROUP_TYPE, obj.from, obj.group, obj.time, obj.msg, obj.msgtype, null, obj.touserid);
            console.log(' group:'+obj.group, ' ['+obj.from+']',' ['+obj.msgid+']:', obj.msg, obj.msgtype, obj.time, obj.touserid);
        } else if(obj.type == _self.SUPERIOR_TYPE){
            _self.showNewestMessage(_self.SUPERIOR_TYPE, obj.from, obj.superior, obj.time, obj.msg, obj.msgtype, null, obj.touserid);
            console.log('['+obj.from+']','['+obj.msgid+']:', obj.msg, obj.msgtype, obj.time, obj.touseride);
        }
    };
    MessageMgr.prototype.onUserMessageReceived = function(obj) {
        console.log(' ['+obj.msgid+']:',  obj.to, 'received');
    };
    MessageMgr.prototype.showOfflineMessage = function(obj) {
        if (!app.uiMessage.hasUpdateLogMessage) {
            setTimeout(function() {
                _self.showOfflineMessage(obj);
            }, 200);
        } else {
            var len = obj.length;
            var allUsers = app.userMgr.users;
            if (len) {
                app.utils.noticeNewMessage();
            }
            for (var i = 0; i < len; i++) {
                var item = obj[i];
                if (item.type == _self.GROUP_TYPE) {
                    console.log(' [' + item.group + ']', ' [' + item.from + '][' + item.time + ']:', item.msg);
                    _self.showNewestMessage(_self.GROUP_TYPE, item.from, item.group, new Date(item.time).getTime(), item.msg, item.msgtype, null, item.touserid);
                } else if(item.type == _self.USER_TYPE){
                    console.log(' [' + item.from + '][' + new Date(item.time).getTime() + ']:', item.msg);
                    _self.showNewestMessage(_self.USER_TYPE, item.from, allUsers[item.from].username, new Date(item.time).getTime(), item.msg, item.msgtype);
                } else if(item.type == _self.SUPERIOR_TYPE){
                    console.log(' [' + item.from + '][' + new Date(item.time).getTime() + ']:', item.msg);
                    _self.showNewestMessage(_self.SUPERIOR_TYPE, item.from, item.to, new Date(item.time).getTime(), item.msg, item.msgtype,null, item.touserid);
                }
            }
        }
    };
    MessageMgr.prototype.getUserMessageFromServer = function(counter, time, _id) {
        app.emit('USER_GET_MESSAGE_RQ', {type:_self.USER_TYPE, counter:counter, time:time, cnt:_self.PER_COUNT, _id:_id});
    };
    MessageMgr.prototype.getGroupMessageFromServer = function(counter, time, _id) {
        app.emit('USER_GET_MESSAGE_RQ', {type:_self.GROUP_TYPE, counter:counter, time:time, cnt:_self.PER_COUNT, _id:_id});
    };
    MessageMgr.prototype.onGetMessage = function(obj) {
        if (app.messageInfo && app.utils.isActivePanel(app.messageInfo.id)) {
            app.messageInfo.showServerMessage(obj.type, obj.msg, obj._id);
        }
    };

    return new MessageMgr();
});


