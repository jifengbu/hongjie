define(function(require) {
	"use strict";
	var _self;
	function MessageInfo() {
		_self = this;
		_self.id = "messageInfo";
        _self.canSend = false;
        _self.emojiPageIndex = 0;
        _self.emojsMaxNum = 105;
        _self.emojsMaxPageIndex = Math.ceil(_self.emojsMaxNum/30);
	}
	MessageInfo.prototype.show = function(from, type, username, userid) {
        _self.from = from;
        _self.type = type;
        _self.userid = (type == app.messageMgr.USER_TYPE)?userid:null;
        _self.username = username;
        _self.navbarHeight = $('#navbar').height();

        _self.loaded = false;
        _self.localStorageEnd = false;
        _self.msgTime = null;
        _self.requestServerId = 0;
        _self.clearSendGroupUserId();

        if (type == app.messageMgr.USER_TYPE) {
            app.uiMessage.clearUserUnreadNotify(userid);
        } else if(type == app.messageMgr.GROUP_TYPE){
            app.uiMessage.clearGroupUnreadNotify(username);
        }else{
            app.uiMessage.clearGroupUnreadNotify(username);

        }
        app.utils.loadPanel(_self.id, {transition:"up", loadfunc:_self.id+"=onLoad",unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
	};
    MessageInfo.prototype.onLoad = function() {
        if (!_self.loaded) {
            _self.loaded = true;
            if (app.historySave) { //如果是从module进来的，需要保留history
            } else {
                $.ui.history.splice(1);
            }
            _self.more_panel_height = 0;

            if (app.useDiv) {
                _self.$editor = $('#message_input_div');
                if (_self.type == app.messageMgr.USER_TYPE && _self.lastUserId != _self.userid) {
                    _self.$editor.html('');
                    _self.lastUserId = _self.userid;
                } else if (_self.type == app.messageMgr.GROUP_TYPE && _self.lastUserName != _self.username) {
                    _self.$editor.html('');
                    _self.lastUserName = _self.username;
                }
            } else {
                _self.$editor = $('#message_input_textarea');
                if (_self.type == app.messageMgr.USER_TYPE && _self.lastUserId != _self.userid) {
                    _self.$editor.val('');
                    _self.lastUserId = _self.userid;
                } else if (_self.type == app.messageMgr.GROUP_TYPE && _self.lastUserName != _self.username) {
                    _self.$editor.val('');
                    _self.lastUserName = _self.username;
                }
            }
            _self.placeCaretAtEnd();
            _self.$editor.show();

            $("#send_message_control").show();

            if (_self.type == app.messageMgr.USER_TYPE) {
                $('#mi_title').html('和' + _self.username + '聊天中');
                _self.autoFixInputBox();
                _self.showUserHistoryMessage();
            } else if(_self.type == app.messageMgr.GROUP_TYPE){
                $('#mi_title').html('群组' + _self.username + '聊天中');
                _self.autoFixInputBox();
                _self.showGroupHistoryMessage();
            }else if(_self.type == app.messageMgr.SUPERIOR_TYPE){
                $('#mi_title').html('部门信息');
                $("#send_message_control").hide();
                _self.autoFixInputBox();
                _self.showSuperiroHistoryMessage();
            }
        } else {
            _self.autoFixInputBox();
        }
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取更多...", callback:_self.showMoreMessage});
        $(app.utils.panelID(_self.id)).on('click', function(){_self.clearSendGroupUserId()});
    };
    MessageInfo.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
        _self.hideMoreSelect();
        $('#navbar').css('height', _self.navbarHeight+'px');
        $(app.utils.panelID(_self.id)).off('click');
    };
    MessageInfo.prototype.release = function() {
        _self.lastTime = null;
        _self.canSend = false;
        $('#msg_log_list').html('');
    };
    MessageInfo.prototype.autoTextareaHeight = function(elem) {
        var html;
        if (app.useDiv) {
            html = elem[0].innerHTML;
        } else {
            var el = elem[0];
            el.style.height = 'auto';
            el.scrollTop = 0;
            el.style.height = el.scrollHeight + 'px';
            html = elem.val();
        }
        var sendButton = $('#mi_send_button');
        var moreButton = $('#mi_more_button');
        $('#navbar').css('height', (elem.height() + 20 + _self.more_panel_height) + 'px');
        sendButton.css('top', (elem.height() - sendButton.height()) / 2 + 'px');
        moreButton.css('top', (elem.height() - sendButton.height()) / 2 + 'px');
        if (html.length && app.chatLogin) {
            sendButton.css('background', 'green');
            _self.canSend = true;
        } else {
            sendButton.css('background', 'darkgrey');
            _self.canSend = false;
        }
        $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
    };
    MessageInfo.prototype.autoFixInputBox = function() {
        _self.autoTextareaHeight(_self.$editor);
        _self.$editor.unbind('input').bind('input', function(){
            _self.autoTextareaHeight(_self.$editor);
        });
    };
    MessageInfo.prototype.toggleMoreSelect = function(force) {
        if (_self.more_panel_show) {
            _self.hideMoreSelect();
        } else {
            _self.showMoreSelect();
        }
    };
    MessageInfo.prototype.showMoreSelect = function(force) {
        _self.more_panel_show = true;
        $('#mi_more_panel').show();
        _self.more_panel_height = $('#mi_more_panel').height();
        _self.autoTextareaHeight(_self.$editor);
        _self.setMoreMainPanel();
    };
    MessageInfo.prototype.hideMoreSelect = function(force) {
        _self.more_panel_show = false;
        $('#mi_more_panel').hide();
        _self.more_panel_height = 0;
        _self.autoTextareaHeight(_self.$editor);
    };
    MessageInfo.prototype.setMoreMainPanel = function() {
        var html = '';
        if (app.useDiv) {
            html += '<a href="#" class="smenuicon img_emoji" onclick="app.messageInfo.showEmojiPanel()">表情</a>';
        }
        html += '<a href="#" class="smenuicon img_photo_library" onclick="app.messageInfo.sendPictureFromPhotoLibrary()">图片</a>';
        if (_os == "ios") {
            html += '<a href="#" class="smenuicon img_photo_album" onclick="app.messageInfo.sendPictureFromSavedPhotoalbum()">相册</a>';
        }
        html += '<a href="#" class="smenuicon img_camera" onclick="app.messageInfo.sendPictureFromCamera()">拍照</a>';
        html += '<a href="#" class="smenuicon img_group_sendto" onclick="app.messageInfo.showSendGroupUserId()">发送给</a>';
        html += '<a href="#" class="smenuicon img_contact" onclick="app.messageInfo.showContactPanel()">联系人</a>';
        html += '<a href="#" class="smenuicon img_common_sentence" onclick="app.messageInfo.showCommonSentencePanel()">常用语</a>';
        $('#mi_more_panel').html(html);
    };
    MessageInfo.prototype.placeCaretAtEnd = function() {
        var el = _self.$editor[0];
        el.focus();
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };
    MessageInfo.prototype.insertEmoji = function(i) {
        _self.$editor.focus();
        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        var node = $('<img class="semoji emoji_'+i+'" src='+app.resource.img_transparent+'>')[0];
        range.deleteContents();
        range.insertNode(node);
        range.setStartAfter(node);
        range.setEndAfter(node);
        sel.removeAllRanges();
        sel.addRange(range);

        _self.autoTextareaHeight(_self.$editor);
    }
    MessageInfo.prototype.showEmojis = function() {
        var html = '';
        var start = _self.emojiPageIndex*30;
        var end = Math.min((_self.emojiPageIndex+1)*30, _self.emojsMaxNum);
        for (var i=start,ss=start+30; i<ss; i++) {
            if (i<end) {
                html += '<div class="emoji emoji_' + i + '" onclick="app.messageInfo.insertEmoji(' + i + ');"></div>';
            } else {
                html += '<div class="emoji"></div>';
            }
        }
        for (var i=0; i<_self.emojsMaxPageIndex; i++) {
            var cls = "";
            if (i==_self.emojiPageIndex) {
                cls = " selected";
            }
            html += '<span class="carousel'+cls+'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
        }

        $('#mi_more_panel').html(html);
    };
    MessageInfo.prototype.showEmojiPanel = function() {
        _self.showEmojis();

        var el = $('#mi_more_panel');
        el.unbind("swipeLeft").bind("swipeLeft", function(){
            _self.emojiNextPage();
        }).unbind("swipeRight").bind("swipeRight", function(){
            _self.emojiPrePage();
        });
    };
    MessageInfo.prototype.emojiPrePage = function() {
        _self.emojiPageIndex--;
        if (_self.emojiPageIndex == -1) {
            _self.emojiPageIndex = _self.emojsMaxPageIndex-1;
        }
        _self.showEmojis();
    };
    MessageInfo.prototype.emojiNextPage = function() {
        _self.emojiPageIndex++;
        if (_self.emojiPageIndex == _self.emojsMaxPageIndex) {
            _self.emojiPageIndex = 0;
        }
        _self.showEmojis();
    };
    MessageInfo.prototype.sendPictureFromPhotoLibrary = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.sendPicture("data:image/jpeg;base64," + imageData);
            _self.hideMoreSelect();
        }, function () {
            console.log('camera cancelled');
        }, {
            quality: 50,
            allowEdit: true,
            targetWidth: 320,
            targetHeight: 320,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
    MessageInfo.prototype.sendPictureFromSavedPhotoalbum = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.sendPicture("data:image/jpeg;base64," + imageData);
            _self.hideMoreSelect();
        }, function () {
            console.log('camera cancelled');
        }, {
            quality: 50,
            allowEdit: true,
            targetWidth: 320,
            targetHeight: 320,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
    MessageInfo.prototype.sendPictureFromCamera = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.sendPicture("data:image/jpeg;base64," + imageData);
            _self.hideMoreSelect();
        }, function () {
            console.log('camera cancelled');
        }, {
            quality: 50,
            allowEdit: true,
            targetWidth: 320,
            targetHeight: 320,
            correctOrientation: true,
            sourceType: Camera.PictureSourceType.CAMERA,
            cameraDirection: Camera.Direction.FRONT,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
    MessageInfo.prototype.showSendGroupUserId = function() {
        _self.hideMoreSelect();
        require('selectGroupUser').show(_self.username);
    };
    MessageInfo.prototype.showContactPanel = function() {
        app.utils.toast("工程师正在施工中...");
        _self.hideMoreSelect();
    };
    MessageInfo.prototype.showCommonSentencePanel = function() {
        app.utils.toast("工程师正在施工中...");
        _self.hideMoreSelect();
    };
    MessageInfo.prototype.sendPicture = function(imageData) {
        var mgr = app.messageMgr;
        if (_self.type == mgr.USER_TYPE) {
            mgr.sendUserMessage(_self.userid, imageData, mgr.IMAGE_TYPE);
        } else {
            mgr.sendGroupMessage(_self.username, imageData, mgr.IMAGE_TYPE, _self.sendGroupUserId);
        }
    };
    MessageInfo.prototype.getShowTime = function(time) {
        var lastTime = _self.lastTime||new Date(0).getTime();
        var date = new Date(time);
        var last = new Date(lastTime);
        _self.lastTime = time;

        date.setSeconds(0);date.setMilliseconds(0);
        last.setSeconds(0);last.setMilliseconds(0);
        if (last.getTime() == date.getTime()) {
            return null;
        }
        return app.utils.getShowDateTime(time);
    };
    MessageInfo.prototype.showChatTimeLine = function(timeStr, noshow) {
        var html = '';
        html += '<div class="message_time_line" data-time="'+timeStr+'">';
        html += '<span style="background-color:#ADADAD;color: white;padding:2px 4px ; border-radius: 3px">'+timeStr+'</span>';
        html += '</div>';
        if (!noshow) {
            $('#msg_log_list').append(html);
        }
        return {html:html, time:timeStr};
    };
    MessageInfo.prototype.showUserNewestMessage = function(userid, username, time, msg, msgtype, send) {
        if (_self.userid == userid && app.utils.isActivePanel(_self.id)) {
            _self.showTimeMessage(userid, username, msg, msgtype,time, send);
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        }
    };
    MessageInfo.prototype.showGroupNewestMessage = function(userid, username, time, msg, msgtype, send, touserid) {
        if (_self.username == username && app.utils.isActivePanel(_self.id)) {
            _self.showTimeMessage(userid, username, msg, msgtype, time, send, null, touserid);
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        }
    };
    MessageInfo.prototype.showSuperiorNewestMessage = function(userid, username, time, msg, msgtype, send, touserid) {
        if (_self.username == username && app.utils.isActivePanel(_self.id)) {
            _self.showTimeMessage(userid, username, msg, msgtype, time, send, null, touserid);
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        }
    };
    MessageInfo.prototype.showMoreMessage = function() {
        if (_self.type == app.messageMgr.USER_TYPE) {
            _self.showUserMoreMessage();
        } else {
            _self.showGroupMoreMessage();
        }
    };
    MessageInfo.prototype.prependMoreMessage = function(docs) {
        var html = '';
        var maxTimeLine, minTimeLine;
        var len = docs.length;
        if (len) {
            _self.msgTime =  docs[len - 1].time;
        } else {
            _self.localStorageEnd = true;
        }
        _self.lastTime = null;
        for (var i=len-1; i>=0; i--) {
            var doc = docs[i];
            var ret = _self.showTimeMessage(doc.userid, doc.username, doc.msg, doc.msgtype, doc.time, doc.send, true);

            if (ret.timeline) {
                if (!minTimeLine) {
                    minTimeLine = ret.timeline;
                }
                maxTimeLine = ret.timeline;
                html = ret.timeline.html+html;
            }
            html = ret.html+html;

            if (i==0) {
                if (_self.lastTimeLine) {
                    console.log(_self.lastTimeLine.time, maxTimeLine.time, minTimeLine.time);
                    if (_self.lastTimeLine.time == maxTimeLine.time) {
                        $('.message_time_line[data-time="' + maxTimeLine.time + '"]').remove();
                    }
                }
                _self.lastTimeLine = minTimeLine;
            }
        }
        $('#msg_log_list').prepend(html);
    };
    MessageInfo.prototype.showServerMessage = function(type, docs, _id) {
        if (_self.requestServerId == _id) {
            if (docs.length == 0) {
                return;
            }
            var selfid = app.login.userid;
            var arr = _.map(docs, function(item) {
                var from = item.from;
                var to = item.to;
                if (from == selfid) {
                    return {userid:to, msg:item.msg, msgtype:item.msgtype, time:new Date(item.time).getTime(), send:item.msgid};
                } else {
                    return {userid:from, msg:item.msg, msgtype:item.msgtype, time:new Date(item.time).getTime()};
                }
            });
            //app.login.history_message_db.insert(doc);
            _self.prependMoreMessage(arr);
            _self.scroller.upRefresh = true;
        }
    };
    MessageInfo.prototype.showUserMoreMessage = function() {
        if (_self.localStorageEnd) {
            _self.scroller.upRefresh = false;
            _self.requestServerId++;
            app.messageMgr.getUserMessageFromServer(_self.userid, _self.msgTime||Date.now(), _self.requestServerId);
            return;
        }
        app.messageMgr.getUserMessage(_self.userid, _self.msgTime, function(docs){
            _self.prependMoreMessage(docs);
        });
    };
    MessageInfo.prototype.showGroupMoreMessage = function() {
        if (_self.localStorageEnd) {
            _self.scroller.upRefresh = false;
            _self.requestServerId++;
            app.messageMgr.getGroupMessageFromServer(_self.username, _self.msgTime||Date.now(), _self.requestServerId);
            return;
        }
        app.messageMgr.getGroupMessage(_self.username, _self.msgTime, function(docs){
            if (docs.length) {
                _self.prependMoreMessage(docs);
            } else {
                _self.localStorageEnd = true;
                _self.showGroupMoreMessage();
            }
        });
    };
    MessageInfo.prototype.showUserHistoryMessage = function() {
        app.messageMgr.getUserMessage(_self.userid, function(docs){
            var len = docs.length;
            if (len) {
                _self.msgTime =  docs[len - 1].time;
            } else {
                _self.localStorageEnd = true;
            }
            for (var i=len-1; i>=0; i--) {
                var doc = docs[i];
                var ret = _self.showTimeMessage(doc.userid, doc.username, doc.msg, doc.msgtype, doc.time, doc.send);
                if (i==len-1) {
                    _self.lastTimeLine = ret.timeline;
                }
            }
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        });
    };
    MessageInfo.prototype.showGroupHistoryMessage = function() {
        app.messageMgr.getGroupMessage(_self.username, function(docs){
            var len = docs.length;
            if (len) {
                _self.msgTime =  docs[len - 1].time;
            } else {
                _self.localStorageEnd = true;
            }
            for (var i=len-1; i>=0; i--) {
                var doc = docs[i];
                var ret = _self.showTimeMessage(doc.userid, doc.username, doc.msg, doc.msgtype, doc.time, doc.send, null, doc.touserid);
                if (i==len-1) {
                    _self.lastTimeLine = ret.timeline;
                }
            }
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        });
    };
    MessageInfo.prototype.showSuperiroHistoryMessage = function() {
        app.messageMgr.getSuperiorMessage(_self.username, function(docs){
            var len = docs.length;
            if (len) {
                _self.msgTime =  docs[len - 1].time;
            } else {
                _self.localStorageEnd = true;
            }
            for (var i=len-1; i>=0; i--) {
                var doc = docs[i];
                var ret = _self.showTimeMessage(doc.userid, doc.username, doc.msg, doc.msgtype, doc.time, doc.send, null, doc.touserid);
                if (i==len-1) {
                    _self.lastTimeLine = ret.timeline;
                }
            }
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        });
    };


    //文本消息和带普通表情的消息
    MessageInfo.prototype.showMessage = function(userid, username, msg, msgtype, send, noshow, time, touserid) {
        var selfid = app.login.userid;
        var msgmgr = app.messageMgr;
        if (_self.type == msgmgr.USER_TYPE) {
            var html = '';
            html += '<div class="' + (send ? 'chat_rightd default_head user_head_'+selfid : 'chat_leftd default_head user_head_'+userid) + '" onclick="app.messageInfo.showContactItem(\''+userid+'\', '+send+')">';
            if (msgtype == msgmgr.TEXT_TYPE) {
                html += '<div class="speech ' + (send ? "right" : "left") + '" onclick="event.stopPropagation()">' +msg+ '</div>';
            } else if (msgtype == msgmgr.IMAGE_TYPE) {
                html += '<div class="speech ' + (send ? "right" : "left") + '" onclick="event.stopPropagation()"><img class="message_info_image" src="' + msg + '" onclick="app.messageInfo.showLargeImage(this)"></div>';
            }
            html += '</div>';
        } else if(_self.type == msgmgr.GROUP_TYPE){
            var USERNAME_COLOR = app.color.USERNAME_COLOR;
            var users = app.userMgr.users;
            var username = users[userid].username||userid;
            var tousername = (users[touserid])?users[touserid].username||touserid:touserid;
            var html = '';
            var title = USERNAME_COLOR(userid, (userid==app.login.userid)?'我':username, app.login.userid);
            if (touserid) {
                title +=  '对'+USERNAME_COLOR(touserid, (touserid==app.login.userid)?'我':tousername, app.login.userid);
                title += '说';
            }
            html += '<div class="' + (send ? 'chat_rightd default_head user_head_'+userid : 'chat_leftd default_head user_head_'+userid) + '"      onclick="app.messageInfo.showGroupContactItem(\''+userid+'\', '+send+')"><span class="'+(send ? 'chat_username_rightd' : 'chat_username_leftd')+'">'+title+'</span>';
            if (msgtype == msgmgr.TEXT_TYPE) {
                html += '<div class="speech ' + (send ? "right" : "left") + '" onclick="app.messageInfo.setSendGroupUserId(\''+userid+'\', \''+username+'\', '+(touserid?'\''+touserid+'\'':null)+', \''+tousername+'\', '+(!!send)+');event.stopPropagation()">' + msg + '</div>';
            } else if (msgtype == msgmgr.IMAGE_TYPE) {
                html += '<div class="speech ' + (send ? "right" : "left") + '" onclick="event.stopPropagation()"><img class="message_info_image" src="' + msg + '" onclick="app.messageInfo.showLargeImage(this)"></div>';
            }
            html += '</div>';
        }else if(_self.type == msgmgr.SUPERIOR_TYPE){
            var USERNAME_COLOR = app.color.USERNAME_COLOR;
            var users = app.userMgr.users;
            var username = users[userid].username||userid;
            var tousername = (users[touserid])?users[touserid].username||touserid:touserid;
            var html = '';
            var title = '<span onclick="app.messageInfo.showGroupContactItem(\''+userid+'\', '+send+')">' + USERNAME_COLOR(userid, (userid==app.login.userid)?'我':username, app.login.userid) + '</span>';
            if (touserid) {
                title +=  '对'+ '<span onclick="app.messageInfo.showGroupContactItem(\''+touserid+'\', '+send+')">' + USERNAME_COLOR(touserid, (touserid==app.login.userid)?'我':tousername, app.login.userid) + '</span>';
                title += '说';
            }
            html += '<div class="' + (send ? 'chat_rightd default_head user_head_'+userid : 'chat_leftd default_head user_head_'+userid) + '" onclick="app.messageInfo.showGroupContactItem(\''+userid+'\', '+send+')"><span class="'+(send ? 'chat_username_rightd' : 'chat_username_leftd')+'">'+title+'</span>';
            if (msgtype == msgmgr.TEXT_TYPE) {
                html += '<div class="speech ' + (send ? "right" : "left") + '" onclick="event.stopPropagation()">' + msg + '</div>';
            } else if (msgtype == msgmgr.IMAGE_TYPE) {
                html += '<div class="speech ' + (send ? "right" : "left") + '" onclick="event.stopPropagation()"><img class="message_info_image" src="' + msg + '" onclick="app.messageInfo.showLargeImage(this)"></div>';
            }
            html += '</div>';
        }
        if (!noshow) {
            $('#msg_log_list').append(html);
        }
        return html;
    };
    //文本消息和带普通表情的消息
    MessageInfo.prototype.showTimeMessage = function(userid, username, msg, msgtype, time, send, noshow, touserid) {
        var timeline = null;
        var timeStr = _self.getShowTime(time);
        if (timeStr) {
            timeline = _self.showChatTimeLine(timeStr, noshow);
        }
        var html = _self.showMessage(userid, username, msg, msgtype, send, noshow, time, touserid);
        return {html:html, timeline:timeline};
    };
    MessageInfo.prototype.sendSimpleMessage = function() {
        var el = _self.$editor;
        if (_self.canSend) {
            _self.canSend = false;
            var text;
            if (app.useDiv) {
                text = el[0].innerHTML;
                el.html('');
            } else {
                text = el.val();
                text = text.replace(/\n+$/, '');
                text = $.escape(text);
                el.val('');
            }

            _self.autoTextareaHeight(el);
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
            var mgr = app.messageMgr;
            if (_self.type == mgr.USER_TYPE) {
                mgr.sendUserMessage(_self.userid, text, mgr.TEXT_TYPE);
            } else {
                mgr.sendGroupMessage(_self.username, text, mgr.TEXT_TYPE, _self.sendGroupUserId);
            }
            if (_self.more_panel_show) {
                _self.hideMoreSelect();
            }
        }
    };
    MessageInfo.prototype.showContactItem = function(userid, send) {
        if (!send) {
            require('contactInfo').show(userid);
        } else {
            require('personalInfo').show();
        }
    };
    MessageInfo.prototype.showGroupContactItem = function(userid, send) {
        if (!send) {
            require('contactInfo').show(userid);
        } else {
            require('personalInfo').show();
        }
    };
    MessageInfo.prototype.showLargeImage = function(el) {
        require('imageDisplay').show(el.src);
    };
    MessageInfo.prototype.updatePlaceholder = function(placeholder) {
        if (_self.$editor) {
            _self.$editor.attr('placeholder', placeholder);
        }
    }
    MessageInfo.prototype.setSendGroupUserId = function(userid, username, touserid, tousername, send) {
        if (send) {
            if (!touserid) {
                _self.clearSendGroupUserId();
            } else {

                _self.sendGroupUserId = touserid;
                _self.updatePlaceholder('回复' + tousername);
            }
        } else {
            _self.sendGroupUserId = userid;
            _self.updatePlaceholder('回复' + username);
        }
    };
    MessageInfo.prototype.clearSendGroupUserId = function() {
        _self.sendGroupUserId = null;
        _self.updatePlaceholder('');
    };
	return new MessageInfo();
});
