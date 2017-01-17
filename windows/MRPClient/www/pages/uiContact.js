define(function(require) {
	"use strict";
    var _self;
	function UIContact() {
        _self = this;
        _self.showAll = true;
	}

	UIContact.prototype.onLoad = function() {
        if (!_self.loaded) {
            _self.showUserList();
        }
    };
    UIContact.prototype.onUnload = function() {
    };
    UIContact.prototype.updateAlphaTable = function() {
        $("#contact_content").alphatable( $("#contact_content").scroller(), {
            listCssClass:"tableListContainer",
            letterBoxCssClass: 'letterBox',
            prefix:"contact_anchor_"
        });
        $(".tableListContainer div").css('height', ($('#content').height()/$.alphas.length)+'px');
    };
    UIContact.prototype.showUserList = function() {
        _self.loaded = true;
        var users;
        if (_self.showAll) {
            users = _self.getAllUserList();
        } else {
            users = _self.getOnlineUserList();
        }
        _self.addUserList(users);
        _self.updateAlphaTable();
    };
    UIContact.prototype.getOnlineUserList = function() {
        var onlineUsers = app.onlineUserMgr.onlineUsers;
        var selfid = app.login.userid;
        var list = {};
        for (var i in onlineUsers) {
            var userid = onlineUsers[i].userid;
            if (userid == selfid) {
                continue;
            }
            var username = onlineUsers[i].username||userid;
            var alpha = $.fisrtPinyin(username);
            if (!list[alpha]) {
                list[alpha] = [];
            }
            list[alpha].push({username:username, userid:userid});
        }
        return list;
    };
    UIContact.prototype.getAllUserList = function() {
        var users = app.userMgr.users;
        var selfid = app.login.userid;
        var list = {};
        for (var i in users) {
            var item = users[i];
            var userid = item.userid;
            if (userid == selfid) {
                continue;
            }
            var username = item.username||userid;
            var alpha = $.fisrtPinyin(username);
            if (!list[alpha]) {
                list[alpha] = [];
            }
            list[alpha].push({username:username, userid:userid});
        }
        return list;
    };
    UIContact.prototype.addContactItem = function(username, userid) {
        var USERNAME_COLOR = app.color.USERNAME_COLOR,
            html = '';

        html += '<li onclick="app.uiContact.showContactItem(\''+userid+'\')">';
        html += '<div class="chat_head chat_head_contact default_head user_head_'+userid+'"></div>';

        html += '<span class="chat_contact">' + USERNAME_COLOR(userid, username) + '</span>';
        html += '</li>';
        return html;
    };
    UIContact.prototype.addContactGroup = function(alpha, userArr) {
        var html = '';
        html += '<div class="tableHeader" id="contact_anchor_'+alpha+'">&nbsp;'+alpha+'</div>';
        for (var i=0,len=userArr.length; i<len; i++) {
            var item = userArr[i];
            html += _self.addContactItem(item.username, item.userid);
        }
        return html;
    };
    UIContact.prototype.changeShowOnline = function() {
        _self.showAll = !_self.showAll;
        _self.showUserList();
    };
    UIContact.prototype.getGroupChatButton = function() {
        var html = '';
        html += '<li onclick="app.uiContact.showGroupPage()">';
        html += '<div class="chat_head chat_head_contact img_group_chat"></div>';
        html += '<span class="chat_contact" style="color: green">群聊</span>';
        html += '</li>'
        return html;
    };
    UIContact.prototype.getChangeOnOffLine = function() {
        var html = '';
        if (_self.showAll) {
            html += '<li onclick="app.uiContact.changeShowOnline()">';
            html += '<div class="chat_head chat_head_contact img_user_online"></div>';
            html += '<span class="chat_contact" style="color: green">只显示在线用户</span>';
        } else {
            html += '<li onclick="app.uiContact.changeShowOnline()">';
            html += '<div class="chat_head chat_head_contact img_user_offline"></div>';
            html += '<span class="chat_contact" style="color: green">显示所有用户</span>';
        }
        html += '</li>';
        return html;
    };
    UIContact.prototype.addUserList = function(users) {
        var html = '';
        var alphas = $.alphas;

        html += _self.getGroupChatButton();
        html += _self.getChangeOnOffLine();

        html += '<div id="contact_content" style="color:black;overflow:hidden;">';
        for (var i=0,len=alphas.length; i<len; i++) {
            var alpha = alphas[i];
            if (users.hasOwnProperty(alpha)) {
                html += _self.addContactGroup(alpha, users[alpha]);
            }
        }
        html += '<div><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br></div>';

        $('#contact_list').html(html);
    };
    UIContact.prototype.showContactItem = function(userid) {
        require('contactInfo').show(userid);
    };
    UIContact.prototype.showGroupPage = function() {
        require('groupList').show();
    };

	return new UIContact();
});
