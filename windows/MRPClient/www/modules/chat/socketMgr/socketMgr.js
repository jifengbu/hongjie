define(function(require) {
    "use strict";
    var _self;

    function SocketMgr() {
        _self = this;
    }

    SocketMgr.prototype.start = function(url) {
        app.socket = io.connect(url, {
            connect_timeout: 3000
        });
        app.socket.on('connect', function(obj) {
            console.log("connect to server");
            app.chatRouter.ON_CONNECT();
        }).on('disconnect', function(obj) {
            console.log("disconnect to server");
            app.chatRouter.ON_DISCONNECT();
        }).on('connect_error', function(obj) {
            console.error("connect to server error");
            //app.utils.showError(app.error.CANNOT_CONNECT_CHAT_SERVER);
        }).on('connect_timeout', function(obj) {
            console.error("connect to server timeout");
        }).on('reconnect', function(obj) {
            console.log(" reconnect to server");
            app.chatRouter.ON_RECONNECT();
        }).on('reconnect_error', function(obj) {
            console.error("reconnect to server error");
            //app.utils.showError(app.error.CANNOT_CONNECT_CHAT_SERVER);
        }).on('reconnect_failed', function(obj) {
            console.error("reconnect to server failed");
            //app.utils.showError(app.error.CANNOT_CONNECT_CHAT_SERVER);
        }).on('USER_LOGIN_RS', function(obj) {
            app.chatRouter.ON_USER_LOGIN_RS(obj);
        }).on('USER_LOGOUT_NF', function(obj) {
            app.chatRouter.ON_USER_LOGOUT_NF(obj);
        }).on('USER_LOGIN_NF', function(obj) {
            app.chatRouter.ON_USER_LOGIN_NF(obj);
        }).on('USERS_LIST_NF', function(obj) {
            app.chatRouter.ON_USERS_LIST_NF(obj);
	    }).on('USERS_NOTIFY_NF', function(obj) {
            app.chatRouter.ON_USERS_NOTIFY_NF(obj);
        }).on('USER_SEND_MESSAGE_RS', function(obj) {
            app.chatRouter.ON_USER_SEND_MESSAGE_RS(obj);
        }).on('USER_MESSAGE_NF', function(obj) {
            app.chatRouter.ON_USER_MESSAGE_NF(obj);
        }).on('USER_MESSAGE_RECEIVED_NF', function(obj) {
            app.chatRouter.ON_USER_MESSAGE_RECEIVED_NF(obj);
        }).once('USER_OFFONLINE_MESSAGE_NF', function(obj) {
            app.chatRouter.ON_USER_OFFONLINE_MESSAGE_NF(obj);
        }).on('USER_GET_MESSAGE_RS', function(obj) {
            app.chatRouter.ON_USER_GET_MESSAGE_RS(obj);
	    }).on('USERS_UPDATE_HEAD_RS', function(obj) {
            app.chatRouter.ON_USERS_UPDATE_HEAD_RS(obj);
        }).on('USERS_UPDATE_HEAD_NF', function(obj) {
            app.chatRouter.ON_USERS_UPDATE_HEAD_NF(obj);
        }).on('USERS_GET_HEAD_RS', function(obj) {
            app.chatRouter.ON_USERS_GET_HEAD_RS(obj);
        }).on('USERS_UPDATE_USERINFO_RS', function(obj) {
            app.chatRouter.ON_USERS_UPDATE_USERINFO_RS(obj);
        }).on('USERS_UPDATE_USERINFO_NF', function(obj) {
            app.chatRouter.ON_USERS_UPDATE_USERINFO_NF(obj);
        }).on('GROUP_LIST_RS', function(obj) {
            app.chatRouter.ON_GROUP_LIST_RS(obj);
        }).on('GROUP_INFO_RS', function(obj) {
            app.chatRouter.ON_GROUP_INFO_RS(obj);
        }).on('GROUP_CREATE_RS', function(obj) {
            app.chatRouter.ON_GROUP_CREATE_RS(obj);
        }).on('GROUP_MODIFY_RS', function(obj) {
            app.chatRouter.ON_GROUP_MODIFY_RS(obj);
        }).on('GROUP_DELETE_RS', function(obj) {
            app.chatRouter.ON_GROUP_DELETE_RS(obj);
        }).on('GROUP_DELETE_NF', function(obj) {
            app.chatRouter.ON_GROUP_DELETE_NF(obj);
        }).on('GROUP_JOIN_RS', function(obj) {
            app.chatRouter.ON_GROUP_JOIN_RS(obj);
        }).on('GROUP_JOIN_NF', function(obj) {
            app.chatRouter.ON_GROUP_JOIN_NF(obj);
        }).on('GROUP_LEAVE_RS', function(obj) {
            app.chatRouter.ON_GROUP_LEAVE_RS(obj);
        }).on('GROUP_LEAVE_NF', function(obj) {
            app.chatRouter.ON_GROUP_LEAVE_NF(obj);
        }).on('GROUP_PULL_IN_RS', function(obj) {
            app.chatRouter.ON_GROUP_PULL_IN_RS(obj);
        }).on('GROUP_PULL_IN_NF', function(obj) {
            app.chatRouter.ON_GROUP_PULL_IN_NF(obj);
        }).on('GROUP_FIRE_OUT_RS', function(obj) {
            app.chatRouter.ON_GROUP_FIRE_OUT_RS(obj);
        }).on('GROUP_FIRE_OUT_NF', function(obj) {
            app.chatRouter.ON_GROUP_FIRE_OUT_NF(obj);
        }).on('TICKET_ISSUE_NF', function(obj) {
            app.chatRouter.ON_TICKET_ISSUE_NF(obj);
        }).on('TICKET_REPLY_NF', function(obj) {
            app.chatRouter.ON_TICKET_REPLY_NF(obj);
        }).on('WORK_NOTICE_NF', function(obj) {
            app.chatRouter.ON_WORK_NOTICE_NF(obj);
        }).on('CALL_WEBRTC_SIGNAL_NF', function(obj) {
            app.chatRouter.ON_CALL_WEBRTC_SIGNAL_NF(obj);
        }).on('CALL_OUT_RS', function(obj) {
            app.chatRouter.ON_CALL_OUT_RS(obj);
        }).on('CALL_IN_NF', function(obj) {
            app.chatRouter.ON_CALL_IN_NF(obj);
        }).on('CALL_IN_REPLY_NF', function(obj) {
            app.chatRouter.ON_CALL_IN_REPLY_NF(obj);
        }).on('CALL_HANGUP_RS', function(obj) {
            app.chatRouter.ON_CALL_HANGUP_RS(obj);
        }).on('CALL_HANGUP_NF', function(obj) {
            app.chatRouter.ON_CALL_HANGUP_NF(obj);
        });
    };
    return new SocketMgr();
});
