define(function(require) {
	"use strict";
	var _self;

	function TicketDetail() {
		_self = this;
		_self.id = "ticketDetail";
		
		_self.FROM_TICKET_LIST = 0;
		_self.FROM_TICKET_REPLY = 1;
		_self.from = _self.FROM_TICKET_LIST;

        _self.emojiPageIndex = 0;
        _self.emojsMaxNum = 105;
        _self.emojsMaxPageIndex = Math.ceil(_self.emojsMaxNum/30);
        _self.canSend = false;
	}
	
	TicketDetail.prototype.show = function(data) {
        _self.data = data;
        _self.info = {answer_id:0};
        _self.navbarHeight = $('#navbar').height();
		if (_self.from == _self.FROM_TICKET_REPLY) {
			_self.from = _self.FROM_TICKET_LIST;
			_self.onLoad();
		} else {
			app.utils.loadPanel(_self.id, {transition:"slideLeft", loadfunc:_self.id+"=onLoad",unloadfunc:_self.id+"=onUnload"});
		}
	};
	TicketDetail.prototype.onLoad = function() {
        _self.showTicketDetail();
        _self.more_panel_height = 0;
        if (app.useDiv) {
            _self.$editor = $('#tdl_input_div');
        } else {
            _self.$editor = $('#tdl_input_textarea');
        }
        $.ui.removeBadge('#tk_list_title_' + _self.data.main_ticket.id);
        _self.placeCaretAtEnd();
        _self.$editor.show();
        _self.autoFixInputBox();
    };
    TicketDetail.prototype.onUnload = function() {
        _self.hideMoreSelect();
        $('#navbar').css('height', _self.navbarHeight+'px');
    };
    TicketDetail.prototype.release = function() {
        _self.data = null;
        _self.info = null;
    };
    TicketDetail.prototype.autoTextareaHeight = function(elem) {
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
        var sendButton = $('#tdl_send_button');
        var moreButton = $('#tdl_more_button');
        $('#navbar').css('height', (elem.height() + 20 + _self.more_panel_height) + 'px');
        sendButton.css('top', (elem.height() - sendButton.height()) / 2 + 'px');
        moreButton.css('top', (elem.height() - sendButton.height()) / 2 + 'px');
        if (html.length) {
            sendButton.css('background', 'green');
            _self.canSend = true;
        } else {
            sendButton.css('background', 'darkgrey');
            _self.canSend = false;
        }
    };
    TicketDetail.prototype.autoFixInputBox = function() {
        _self.autoTextareaHeight(_self.$editor);
        _self.$editor.unbind('input').bind('input', function(){
            _self.autoTextareaHeight(_self.$editor);
        });
    };
    TicketDetail.prototype.toggleMoreSelect = function(force) {
        if (_self.more_panel_show) {
            _self.hideMoreSelect();
        } else {
            _self.showMoreSelect();
        }
    };
    TicketDetail.prototype.showMoreSelect = function(force) {
        _self.more_panel_show = true;
        $('#tdl_more_panel').show();
        _self.more_panel_height = $('#tdl_more_panel').height();
        _self.autoTextareaHeight(_self.$editor);
        _self.setMoreMainPanel();
    };
    TicketDetail.prototype.hideMoreSelect = function(force) {
        _self.more_panel_show = false;
        $('#tdl_more_panel').hide();
        _self.more_panel_height = 0;
        _self.autoTextareaHeight(_self.$editor);
    };
    TicketDetail.prototype.setMoreMainPanel = function() {
        var html = '';
        if (app.useDiv) {
            html += '<a href="#" class="smenuicon img_emoji" onclick="app.ticketDetail.showEmojiPanel()">表情</a>';
        }
        html += '<a href="#" class="smenuicon img_common_sentence" onclick="app.ticketDetail.showAttachmentsPanel()">附件</a>';
        if (_from != 'web') {
            html += '<a href="#" class="smenuicon img_camera" onclick="app.ticketDetail.replyPictureFromCamera()">拍照</a>';
            html += '<a href="#" class="smenuicon img_photo_library" onclick="app.ticketDetail.replyPictureFromPhotoLibrary()">图片</a>';
            if (_os == "ios") {
                html += '<a href="#" class="smenuicon img_photo_album" onclick="app.ticketDetail.replyPictureFromSavedPhotoalbum()">相册</a>';
            }
        }
        $('#tdl_more_panel').html(html);
    };
    TicketDetail.prototype.placeCaretAtEnd = function() {
        var el = _self.$editor[0];
        el.focus();
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };
    TicketDetail.prototype.insertEmoji = function(i) {
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
    TicketDetail.prototype.showEmojis = function() {
        var html = '';
        var start = _self.emojiPageIndex*30;
        var end = Math.min((_self.emojiPageIndex+1)*30, _self.emojsMaxNum);
        for (var i=start,ss=start+30; i<ss; i++) {
            if (i<end) {
                html += '<div class="emoji emoji_' + i + '" onclick="app.ticketDetail.insertEmoji(' + i + ');"></div>';
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

        $('#tdl_more_panel').html(html);
    };
    TicketDetail.prototype.showEmojiPanel = function() {
        _self.showEmojis();

        var el = $('#tdl_more_panel');
        el.unbind("swipeLeft").bind("swipeLeft", function(){
            _self.emojiNextPage();
        }).unbind("swipeRight").bind("swipeRight", function(){
            _self.emojiPrePage();
        });
    };
    TicketDetail.prototype.emojiPrePage = function() {
        _self.emojiPageIndex--;
        if (_self.emojiPageIndex == -1) {
            _self.emojiPageIndex = _self.emojsMaxPageIndex-1;
        }
        _self.showEmojis();
    };
    TicketDetail.prototype.emojiNextPage = function() {
        _self.emojiPageIndex++;
        if (_self.emojiPageIndex == _self.emojsMaxPageIndex) {
            _self.emojiPageIndex = 0;
        }
        _self.showEmojis();
    };
    TicketDetail.prototype.replyPictureFromPhotoLibrary = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.replyPicture(imageData);
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
    TicketDetail.prototype.replyPictureFromSavedPhotoalbum = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.replyPicture(imageData);
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
    TicketDetail.prototype.replyPictureFromCamera = function() {
        navigator.camera.getPicture(function (imageData) {
            _self.replyPicture(imageData);
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
    TicketDetail.prototype.showAttachmentsPanel = function() {
        if (_from != 'web') {
            navigator.utils.chooseFile('', localStorage.saveTicketFilePath, function (file) {
                if (!file) {
                    app.utils.toast("获取文件失败");
                    return;
                }
                navigator.utils.readFile(file, function (data) {
                    //console.log(data);
                    var filename = file.replace(/.*\\|.*\//, '');
                    localStorage.saveTicketFilePath = file.replace(/[^/\\]*$/, '');
                    var attachments = {
                        file_name: filename,
                        file_data: data,
                        file_size: data.length
                    };
                    _self.canSend = true;
                    _self.needUpdate = true;
                    _self.replyTicket(attachments);
                }, function () {
                    app.utils.toast("获取文件失败");
                }, 'base64');
            });
        } else {
            navigator.utils.readFile(function(filename, data) {
                if (!filename) {
                    app.utils.toast("获取文件失败");
                    return;
                }
                var attachments = {
                    file_name: filename,
                    file_data: data,
                    file_size: data.length
                };
                _self.canSend = true;
                _self.needUpdate = true;
                _self.replyTicket(attachments);
            });
        }
    };
    TicketDetail.prototype.replyPicture = function(data) {
        var default_name = app.login.userid+'-'+Date.now();
        app.utils.popup({
            title: "输入文件名",
            message: '<input type="text" value="" id="titd_file_name" placeholder="'+default_name+'">',
            cancelText: "取消",
            cancelCallback: function () {},
            doneText: "确定",
            doneCallback: function () {
                var filename = $("#titd_file_name").val()||default_name;
                filename = filename.replace(/\.jpg/, '')+".jpg";
                var attachments = {
                    file_name: filename,
                    file_data: data,
                    file_size: data.length
                };
                _self.canSend = true;
                _self.needUpdate = true;
                _self.replyTicket(attachments);
            },
            addCssClass: 'wide'
        });
    };
    TicketDetail.prototype.getShowPerson = function() {
        var show_persons = '';
        if (_self.data.main_ticket.visible_person) {
            var persons = _self.data.main_ticket.visible_person.split(',');
            for (var i = 0, len = persons.length; i < len; i++) {
                var person = persons[i];
                if (person) {
                    person = person.substr(1, person.length - 2);
                    show_persons += ', ' + app.ticket.useridToUsername(person);
                }
            }
        }
        show_persons = show_persons.substr(1);
        return show_persons;
    };
	TicketDetail.prototype.getReplyUserName = function(follow_ticket, answer_id, users, userid, username) {
        var USERNAME_COLOR = app.color.USERNAME_COLOR;
        for (var i= 0,len=follow_ticket.length; i<len; i++) {
            var item = follow_ticket[i];
            if (item.id == answer_id) {
                var ruserid = item.writer_id,
                    user = users[ruserid],
                    rusername = user?user.username||userid:userid;
                return USERNAME_COLOR(userid, username)+'回复'+USERNAME_COLOR(ruserid, rusername);
            }
        }
        return USERNAME_COLOR(userid, username);
    };
	TicketDetail.prototype.showTicketDetail = function(bottom) {
		var html = '',
            USERNAME_COLOR = app.color.USERNAME_COLOR,
            data = _self.data,
            main_ticket = data.main_ticket,
            follow_ticket = data.follow_ticket,
            userid = main_ticket.writer_id,
            users = app.userMgr.users,
            username = users[userid]?users[userid].username||userid:userid,
            time = app.utils.getShowDateTime(main_ticket.input_date);
		
        html += '<li style="border: none">';
        html += '<div class="chat_head chat_head_message default_head user_head_'+userid+'" onclick="event.stopPropagation();"></div>';
        html += '<span><h5 class="chat_message_username">' + USERNAME_COLOR(userid, username) + '</h5><span class="chat_message_time">' + time + '</span></span>';
        html += '<div class="ticket_detail_main" onclick="app.ticketDetail.changeReplyTarget()">';		
        html += '<div class="ticket_detail_subject">'+main_ticket.subject+'</div>';
        html += '<div class="ticket_detail_message">'+main_ticket.message.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>')+'</div>';
        if (main_ticket.att) {
            var att = main_ticket.att;
            html += '<div class="ticket_detail_file_content">';
            for (var id in att) {
                var item = att[id];
                var filename = $.base64.decode(item.file_name, true);
                html += '<div class="ticket_detail_file_name icon download" onclick="app.ticketDetail.downloadFile(\''+filename+'\', \''+item.qo_item_file_id+'\');event.stopPropagation();">'+filename+'</div>';
            }
            html += '</div>';
        }
        html += '</div>';
        html += '</li>';

        html += '<div id="ticket_detail_follow" class="ticket_detail_follow">';
        for (var i in follow_ticket) {
            var item = follow_ticket[i];
            userid = item.writer_id;
            var user = users[userid];
            username = user?user.username||userid:userid;
            time = app.utils.getShowDateTime(item.input_date);

            html += '<li onclick="app.ticketDetail.changeReplyTarget(\''+userid+'\',\''+username+'\',\''+item.id+'\')">';
            html += '<div class="chat_head chat_head_message default_head user_head_'+userid+'" onclick="event.stopPropagation();"></div>';
            var text;
            if (item.answer_id === '0') {
                text = USERNAME_COLOR(userid, username);
            } else {
                text = _self.getReplyUserName(follow_ticket, item.answer_id, users, userid, username);
            }
            html += '<span><span class="chat_message_username">' + text + '</span><span class="chat_message_time">' + time + '</span></span>';
            html += '<div class="ticket_detail_follow_message">' + item.message + '</div>';
            if (item.att) {
                var att = item.att;
                html += '<div class="ticket_detail_file_content">';
                for (var id in att) {
                    var item = att[id];
                    var filename = $.base64.decode(item.file_name, true);
                    html += '<div class="ticket_detail_file_name icon download" onclick="app.ticketDetail.downloadFile(\''+filename+'\', \''+item.qo_item_file_id+'\');event.stopPropagation();">'+filename+'</div>';
                }
                html += '</div>';
            }
            html += '</li>';
        }
        html += '</div>';

		//console.log(html);
		$('#pn_ticket_detail_list').html(html);
        if (bottom) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
        } else {
            $.ui.scrollToTop(app.utils.panelID(_self.id), 0);
        }
	};
    TicketDetail.prototype.appendReply = function(userid, ruserid, date, message, id, answer_id, att) {
        var html = '',
            USERNAME_COLOR = app.color.USERNAME_COLOR,
            users = app.userMgr.users,
            username = users[userid]?users[userid].username||userid:userid,
            time = app.utils.getShowDateTime(date);

        var ticket = app.ticket;
        if (ticket.select_ticket_index == null) {
            ticket.select_ticket_index = 0;
            _self.data.main_ticket.readed = true;
            ticket.prependNewData(_self.data.main_ticket);
        }
        ticket.state = ticket.FROM_DETSIL_UPDATE_STATE;

        html += '<li onclick="app.ticketDetail.changeReplyTarget(\'' + userid + '\',\'' + username + '\',\'' + id + '\')">';
        html += '<div class="chat_head chat_head_message default_head user_head_'+userid+'" onclick="event.stopPropagation();"></div>';

        var text;
        if (answer_id == '0'||userid==ruserid) {
            text = USERNAME_COLOR(userid, username);
        } else {
            var rusername = users[ruserid]?users[ruserid].username||ruserid:ruserid;
            text = USERNAME_COLOR(userid, username)+'回复'+USERNAME_COLOR(ruserid, rusername);
        }
        html += '<span><span class="chat_message_username">' + text + '</span><span class="chat_message_time">' + time + '</span></span>';
        html += '<div class="ticket_detail_follow_message">' + message + '</div>';
        if (att) {
            html += '<div class="ticket_detail_file_content">';
            for (var id in att) {
                var item = att[id];
                var filename = $.base64.decode(item.file_name, true);
                html += '<div class="ticket_detail_file_name icon download" onclick="app.ticketDetail.downloadFile(\''+filename+'\', \''+item.qo_item_file_id+'\');event.stopPropagation();">'+filename+'</div>';
            }
            html += '</div>';
        }
        html += '</li>';
        $('#ticket_detail_follow').append(html);
        $.ui.scrollToBottom(app.utils.panelID(_self.id), 0);
    };
    TicketDetail.prototype.updatePlaceholder = function(placeholder) {
        _self.$editor.attr('placeholder', placeholder);
    };
    TicketDetail.prototype.changeReplyTarget = function(userid, username, answer_id) {
        if (arguments.length==0 || userid == app.login.userid) {
            _self.updatePlaceholder('评论');
            _self.info.answer_id = 0;
            _self.info.ruserid = null;
            return;
        }
        _self.updatePlaceholder('回复'+username);
        _self.info.answer_id = answer_id;
        _self.info.ruserid = userid;
    };
    TicketDetail.prototype.downloadFile = function(filename, file_id) {
        var param = {
            token:app.crm.token,
            file_id:file_id
        };
        var url = app.route.crmTicketFileDownloadUrl+"?"+ $.param(param);
        console.log(url);

        if (_from == 'web') {
            _self.downloadFileForWeb(filename, url);
        } else if (_os == 'desktop') {
            _self.downloadFileForDesktop(filename, url);
        } else if (_os == 'android') {
            _self.downloadFileForAndroid(filename, url);
        }
    };
    TicketDetail.prototype.downloadFileForWeb = function (filename, url) {
        navigator.utils.saveasFile(filename, url);
    };
    TicketDetail.prototype.downloadFileForAndroid = function (filename, url) {
        navigator.utils.chooseDirectory(localStorage.saveTicketFilePath, function(path) {
            localStorage.saveTicketFilePath = path;
            _self.doDownloadFile(path+filename, url);
        });
    };
    TicketDetail.prototype.downloadFileForDesktop = function (filename, url) {
        var accept = filename.replace(/.*(\..*)/, "$1");
        if (accept === filename) {
            accept = "";
        }
        navigator.utils.saveasFile(accept, localStorage.saveTicketFilePath||'', filename,  function (path) {
            localStorage.saveTicketFilePath = path.replace(new RegExp("[^/]+\."+accept.substr(1)), '');
            _self.doDownloadFile(path, url);
        });
    };
    TicketDetail.prototype.doDownloadFile = function(path, url) {
        var fileTransfer = new FileTransfer();
        var uri = encodeURI(url);
        console.log(uri);
        app.utils.setWaitProgress("下载中...");
        fileTransfer.download(uri, path,
            function(entry) {
                console.log("download to "+entry.fullPath);
                app.utils.clearWaitProgress();
                app.utils.toast("下载成功");
            },
            function(error) {
                app.utils.clearWaitProgress();
                app.utils.toast("下载失败"+((_os=='android')?'或没有保存权限':''));
            }
        );
    };
    TicketDetail.prototype.replyTicket = function(attachments) {
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
            _self.hideMoreSelect();
            _self.autoTextareaHeight(el);
            var param = {
                token:app.crm.token,
                user_id:app.login.userid
            };
            var url = app.route.crmTicketReplyUrl+"?"+$.param(param);
            console.log(url);
            var time = $.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
            var main_ticket = _self.data.main_ticket;
            var follow_ticket = _self.data.follow_ticket||[];
            var selfid = app.login.userid;
            var data = {
                subject: '[RE('+(follow_ticket.length+1)+'):]'+main_ticket.subject,
                message: text,
                theme_id: main_ticket.id,
                input_date: time,
                answer_id: _self.info.answer_id,
                writer_id: selfid,
                reading: '['+selfid+']',
                visible: _self.data.main_ticket.visible,
                visible_person: _self.data.main_ticket.visible_person
            };

            if (attachments) {
                data.uploadfile = [attachments];
                data.message = "附件:"+attachments.file_name;
            }

            console.log(data);
            _self.info.time = time;
            _self.info.text = text;
            app.utils.setWait("正在发送...");
            app.utils.ajax({
                type : "POST",
                url : url,
                data : JSON.stringify(data),
                success : _self.onReplyTicketSuccess
            });
        }
    };
    TicketDetail.prototype.onReplyTicketSuccess = function(data) {
        app.utils.clearWait();
        if (data.errcode) {
            console.log(data.errcode+":"+data.errmsg);
            app.utils.showError(app.error.SERVER_ERROR);
            return;
        }
        if (_self.needUpdate) {
            _self.needUpdate = false;
            _self.updatePage();
        } else {
            _self.appendReply(app.login.userid, _self.info.ruserid, _self.info.time, _self.info.text, 0, _self.info.answer_id);
        }
    };
    TicketDetail.prototype.updatePage = function() {
        var param = {
            user_id:app.login.userid,
            ticket_id:_self.data.main_ticket.id
        };
        var url = app.route.crmTicketItemUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("正在刷新...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onUpdatePageSuccess,
            error : _self.onNetError
        });
    };
    TicketDetail.prototype.onUpdatePageSuccess = function(data) {
        if (data.errcode) {
            console.log(data.errcode+":"+data.errmsg);
            app.utils.showError(data.errmsg);
            app.utils.clearWait();
            return;
        }
        data.main_ticket.subject = $.base64.decode(data.main_ticket.subject, true);
        data.main_ticket.message = $.base64.decode(data.main_ticket.message, true);
        data.main_ticket.input_date = app.utils.adjustDate(data.main_ticket.input_date);

        for (var i in data.follow_ticket) {
            var item = data.follow_ticket[i];
            var sub = 0;
            for (var ii in data.follow_ticket) {
                if (!(~~data.follow_ticket[ii].answer_id)) {
                    data.follow_ticket[ii].answer_id = '0';
                }
                if (data.follow_ticket[ii].answer_id == data.follow_ticket[i].id) {
                    sub++;
                }
            }
            item.subject = $.base64.decode(item.subject, true);
            item.message = $.base64.decode(item.message, true);
            item.input_date = app.utils.adjustDate(item.input_date);
            item.sub = sub;
        }
        console.log(data);
        _self.data = data;
        _self.showTicketDetail(true);
        app.utils.clearWait();
    };

	return new TicketDetail();
});
//html += '<div class="leftd">';
//html += '<h2 style="height:auto;">'+data.main_ticket.subject+'</h2>';
//html += '<div>编号:'+data.main_ticket.id+'</div>';
//html += '<div>发布人:'+app.ticket.useridToUsername(data.main_ticket.writer_id)+'</div>';
//html += '<div style="word-break:break-all;" >发布时间:'+data.main_ticket.input_date+'</div>';
//html += '<div>状态:'+data.main_ticket.status+'</div>';
//html += '<div>可见范围： <span class="icon down" onclick="app.utils.showHideEx(this, \'tk_visible_persons\')"></span></div>';
//html += '<div id="tk_visible_persons" style="display: none;">';
//html += '<div style="word-break:break-all;" ><span style="visibility:hidden">可见</span>群组:'+data.main_ticket.visible+'</div>';
//if (data.main_ticket.visible_person) {
//    html += '<div style="word-break:break-all;" ><span style="visibility:hidden">可见</span>人员:' + show_persons + '</div>';
//}
//html += '</div>';
//html += '<div class="speech left">'+data.main_ticket.message+'</div>';
//html += '</div>';