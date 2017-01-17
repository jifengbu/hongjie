define(function(require) {
	"use strict";
	var _self;
	function SendMultiMessage() {
		_self = this;
		_self.id = "sendMultiMessage";
        _self.users = [];
        _self.emojiPageIndex = 0;
        _self.emojsMaxNum = 105;
        _self.emojsMaxPageIndex = Math.ceil(_self.emojsMaxNum/30);
        _self.canSend = false;
	}
	SendMultiMessage.prototype.show = function() {
        _self.navbarHeight = $('#navbar').height();
        app.utils.loadPanel(_self.id, {transition:"slideLeft", loadfunc:_self.id+"=onLoad",unloadfunc:_self.id+"=onUnload"});
	};
    SendMultiMessage.prototype.onLoad = function() {
        _self.more_panel_height = 0;
        if (app.useDiv) {
            _self.$editor = $('#smm_input_div');
        } else {
            _self.$editor = $('#smm_input_textarea');
        }
        $.ui.history.splice(1);
        _self.placeCaretAtEnd();
        _self.$editor.show();
        _self.autoFixInputBox();
    };
    SendMultiMessage.prototype.onUnload = function() {
        _self.hideMoreSelect();
        $('#navbar').css('height', _self.navbarHeight+'px');
    };
    SendMultiMessage.prototype.autoTextareaHeight = function(elem) {
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
        var sendButton = $('#smm_send_button');
        var moreButton = $('#smm_more_button');
        $('#navbar').css('height', (elem.height() + 20 + _self.more_panel_height) + 'px');
        sendButton.css('top', (elem.height() - sendButton.height()) / 2 + 'px');
        moreButton.css('top', (elem.height() - sendButton.height()) / 2 + 'px');
        if (html.length && _self.users.length && app.chatLogin) {
            sendButton.css('background', 'green');
            _self.canSend = true;
        } else {
            sendButton.css('background', 'darkgrey');
            _self.canSend = false;
        }
    };
    SendMultiMessage.prototype.autoFixInputBox = function() {
        _self.autoTextareaHeight(_self.$editor);
        _self.$editor.unbind('input').bind('input', function(){
            _self.autoTextareaHeight(_self.$editor);
        });
    };
    SendMultiMessage.prototype.toggleMoreSelect = function(force) {
        if (_self.more_panel_show) {
            _self.hideMoreSelect();
        } else {
            _self.showMoreSelect();
        }
    };
    SendMultiMessage.prototype.showMoreSelect = function(force) {
        _self.more_panel_show = true;
        $('#smm_more_panel').show();
        _self.more_panel_height = $('#smm_more_panel').height();
        _self.autoTextareaHeight(_self.$editor);
        _self.setMoreMainPanel();
    };
    SendMultiMessage.prototype.hideMoreSelect = function(force) {
        _self.more_panel_show = false;
        $('#smm_more_panel').hide();
        _self.more_panel_height = 0;
        _self.autoTextareaHeight(_self.$editor);
    };
    SendMultiMessage.prototype.setMoreMainPanel = function() {
        var html = '';
        if (app.useDiv) {
            html += '<a href="#" class="smenuicon img_emoji" onclick="app.sendMultiMessage.showEmojiPanel()">表情</a>';
        }
        html += '<a href="#" class="smenuicon img_photo_library" onclick="app.sendMultiMessage.sendPictureFromPhotoLibrary()">图片</a>';
        if (_os == "ios") {
            html += '<a href="#" class="smenuicon img_photo_album" onclick="app.sendMultiMessage.sendPictureFromSavedPhotoalbum()">相册</a>';
        }
        html += '<a href="#" class="smenuicon img_camera" onclick="app.sendMultiMessage.sendPictureFromCamera()">拍照</a>';
        html += '<a href="#" class="smenuicon img_contact" onclick="app.sendMultiMessage.showContactPanel()">联系人</a>';
        html += '<a href="#" class="smenuicon img_common_sentence" onclick="app.sendMultiMessage.showCommonSentencePanel()">常用语</a>';
        $('#smm_more_panel').html(html);
    };
    SendMultiMessage.prototype.placeCaretAtEnd = function() {
        var el = _self.$editor[0];
        el.focus();
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };
    SendMultiMessage.prototype.insertEmoji = function(i) {
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
    SendMultiMessage.prototype.showEmojis = function() {
        var html = '';
        var start = _self.emojiPageIndex*30;
        var end = Math.min((_self.emojiPageIndex+1)*30, _self.emojsMaxNum);
        for (var i=start,ss=start+30; i<ss; i++) {
            if (i<end) {
                html += '<div class="emoji emoji_' + i + '" onclick="app.sendMultiMessage.insertEmoji(' + i + ');"></div>';
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

        $('#smm_more_panel').html(html);
    };
    SendMultiMessage.prototype.showEmojiPanel = function() {
        _self.showEmojis();

        var el = $('#smm_more_panel');
        el.unbind("swipeLeft").bind("swipeLeft", function(){
            _self.emojiNextPage();
        }).unbind("swipeRight").bind("swipeRight", function(){
            _self.emojiPrePage();
        });
    };
    SendMultiMessage.prototype.emojiPrePage = function() {
        _self.emojiPageIndex--;
        if (_self.emojiPageIndex == -1) {
            _self.emojiPageIndex = _self.emojsMaxPageIndex-1;
        }
        _self.showEmojis();
    };
    SendMultiMessage.prototype.emojiNextPage = function() {
        _self.emojiPageIndex++;
        if (_self.emojiPageIndex == _self.emojsMaxPageIndex) {
            _self.emojiPageIndex = 0;
        }
        _self.showEmojis();
    };
    SendMultiMessage.prototype.sendPictureFromPhotoLibrary = function() {
        if (!_self.users.length) {
            app.utils.toast('请先选择发送方');
            return;
        }
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
    SendMultiMessage.prototype.sendPictureFromSavedPhotoalbum = function() {
        if (!_self.users.length) {
            app.utils.toast('请先选择发送方');
            return;
        }
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
    SendMultiMessage.prototype.sendPictureFromCamera = function() {
        if (!_self.users.length) {
            app.utils.toast('请先选择发送方');
            return;
        }
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
    SendMultiMessage.prototype.showContactPanel = function() {
        if (!_self.users.length) {
            app.utils.toast('请先选择发送方');
            return;
        }
        app.utils.toast("工程师正在施工中...");
        _self.hideMoreSelect();
    };
    SendMultiMessage.prototype.showCommonSentencePanel = function() {
        if (!_self.users.length) {
            app.utils.toast('请先选择发送方');
            return;
        }
        app.utils.toast("工程师正在施工中...");
        _self.hideMoreSelect();
    };
    SendMultiMessage.prototype.sendPicture = function(imageData) {
        var mgr = app.messageMgr;
        mgr.sendUserMessage(_self.users.join(','), imageData, mgr.IMAGE_TYPE);
    };
    SendMultiMessage.prototype.checkCanSend = function(contentLength) {
        var el = $('#smm_send_button');
        if (contentLength == null) {
            contentLength = _self.contentLength;
        } else {
            _self.contentLength = contentLength;
        }
        if (contentLength!=0 && _self.users.length) {
            el.css('background', 'green');
            _self.canSend = true;
        } else {
            el.css('background', 'darkgrey');
        }
    };
    SendMultiMessage.prototype.sendSimpleMessage = function() {
        if (_self.canSend) {
            _self.canSend = false;
            var el = _self.$editor;
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
            app.messageMgr.sendUserMessage(_self.users.join(','), text, app.messageMgr.TEXT_TYPE);
            _self.hideMoreSelect();
            _self.autoTextareaHeight(el);
            $.ui.goBack();
        }
    };
    SendMultiMessage.prototype.deleteMember = function(el, userid) {
        $(el.remove());
        _self.users = _.without(_self.users, userid);
        _self.addMembers(_self.users);
    };
    SendMultiMessage.prototype.addMembers = function(userids) {
        var users = app.userMgr.users;
        var html = '';
        var selfid = app.login.userid;
        _self.users = userids;
        _self.checkCanSend();
        for (var i=0,len=userids.length; i<len; i++) {
            var userid = userids[i];
            if (userid == selfid) {
                continue;
            }
            html += '<span onclick="app.sendMultiMessage.deleteMember(this, \''+userid+'\')" style="border:solid 1px; border-radius: 4px; border-color: #00AEEF">';
            html += users[userid].username||userid;
            html += '&nbsp;<span class="icon close"></span>';
            html += "</span>&nbsp;&nbsp;&nbsp;"
        }
        if (!html) {
            html = '<br><br>';
        }
        $('#smm_users').html(html);
    };
    SendMultiMessage.prototype.doAddReceivers = function() {
        require('selectMultiUsers').show(1, _self.users);
    };

	return new SendMultiMessage();
});
