define(function(require) {
	"use strict";
	var _self;
	var PER_GET_PAGE_NUM = 20;
	
	function Ticket() {
		_self = this;
		_self.id = "ticket";
		
		_self.INVALID_OPER = -1;
		_self.GET_COMMON_INFO_OPER = 0;
		_self.GET_PRIV_INFO_OPER = 1;
		_self.GET_TICKET_HOME_SHOW_OPER = 2;
		_self.GET_TICKET_LIST_OPER = 3;
		_self.GET_TICKET_ITEM_OPER = 4;
		_self.ISSUE_TICKET_OPER = 5;
		_self.REPLY_TICKET_OPER = 6;
		_self.GET_FOLLOW_TICKET_OPER = 7;
		_self.oper = _self.INVALID_OPER;
		
		_self.UPDATE_NONE_TYPE = 0;
		_self.UPDATE_LIST_TYPE = 1;
		_self.UPDATE_ALL_TYPE = 2;
		_self.updateType = _self.UPDATE_ALL_TYPE;
		
		_self.token_date = 0;
		_self.expires_in = 0;
		_self.itemIndex = -1;

        _self.token_appid = "1";
        _self.token_secret = "time";

        _self.default_status = ["open", "pending", "accept", "processing", "completed", "reopen", "close"];
        _self.status = _self.default_status.slice();
		_self.data = [];
	}
	Ticket.prototype.show = function() {
        _self.un_read_myself = 1;
		app.utils.loadPanel(_self.id, {footer:'none', transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
	};
	Ticket.prototype.onLoad = function() {
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉更新...", callback:_self.updateTicketList}, {info:"上拉加载更多...", callback:_self.nextPage});

		if (_self.updateType == _self.UPDATE_ALL_TYPE) {
			_self.updateType = _self.UPDATE_NONE_TYPE;
			_self.getPrivInfo();
		} else if (_self.updateType == _self.UPDATE_LIST_TYPE) {
            _self.updateType = _self.UPDATE_NONE_TYPE;
            _self.updateTicketList();
		}
	};
    Ticket.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    Ticket.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.updateType = _self.UPDATE_ALL_TYPE;
        _self.itemIndex = -1;
        _self.data = [];
        require('ticketDetail').release();
        require('ticketIssue').release();
        require('ticketReply').release();
        require('ticketFollowTicket').release();
        require('ticketVisibleGroup').release();
        require('ticketDetail').release();
    };
    Ticket.prototype.updateTicketList = function() {
        _self.itemIndex = -1;
        _self.data = [];
        _self.getTicketList();
        $('#pn_ticket_list').html('');
        $.ui.scrollToTop(app.utils.panelID(_self.id), 0);
    };
	Ticket.prototype.useridToUsername = function(userid) {
        var username = userid;
        var inner_user = _self.commonInfo.inner_user;
        for (var key in inner_user) {
            var arr = inner_user[key];
            for (var i = 0, len = arr.length; i < len; i++) {
                var item = arr[i];
                var tmp = item[userid];
                if (tmp) {
                    username = tmp.replace(/@.*/, '');
                }
            }
        }
        return username;
    };
	Ticket.prototype.showTicketList = function() {
        var RED = app.color.RED,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            html = '',
            data = _self.data;
        for (var i=0,len=data.length; i<len; i++) {
            var style = 'style="color:black;"';
            if (data[i].readed) {
                style = 'style="color:lightsteelblue;"';
            }
            html += '<li onclick="app.ticket.showTicketItem('+data[i].id+')">';
            html += '<a href="#">';
            html += '<span style="font-size:0.8em; color:darkgreen">'+data[i].id+':<span style="font-size:0.9em;color:mediumpurple; ">['+data[i].input_date+']</span></span><br>';
            html += '<h5 id="tk_list_title_'+data[i].id+'" '+style+'>'+data[i].subject+'</h5>';
            html += '</a>';
            html += '</li>';
        }
		//console.log(html);
		$('#pn_ticket_list').html(html);
	};
	Ticket.prototype.showPopupInputBox = function() {
        app.utils.popup({
			title: "请输入ticket id:",
			message: "<input type='text' id='tk_input_ticket_id' class='af-ui-forms' style='color:black;font:bold;'>",
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
				var ticket_id = $("#tk_input_ticket_id").val();
				if (ticket_id.length == 0) {
					app.utils.toast("ticket id不能为空");
				} else {
					_self.showTicketItem(ticket_id);
				}
			},
			cancelOnly: false
		});
	};
	Ticket.prototype.showFilterSelectBox = function() {
        var html = '',
            list = _self.default_status,
            status = _self.status,
            index = 0;

        html += '<div>状态</div>';
        html += '<table width="100%">';
        for(var i=0; i<list.length; i++){
            if (!(index&1)) {
                html += '<tr width="100%">';
            }
            html += '<td width="50%">';
            var checked = (status.indexOf(list[i])!=-1)?"checked":"";
            html += '<input id="tk_filter_'+i+'" type="checkbox" name="tk_filter" value="'+list[i]+'"'+checked+'><label for="tk_filter_'+i+'">'+list[i]+'</label>';
            html += '</td>';
            if (index&1) {
                html += '</tr>';
            }
            index++;
        }
        if (!(index&1)) {
            html += '<tr width="100%">';
        }
        html += '<td>';
        var checked = (status.length == list.length)?"checked":"";
        html += '<input id="tk_filter_all" type="checkbox" name="tk_filter_all" '+checked+'><label for="tk_filter_all">all</label>';
        html += '</td>';
        if (index&1) {
            html += '</tr>';
        }
        html += '</table>';
        html += '<div>未读标记</div>';
        html += '<table width="100%"><tr>';
        var checked_unread = "", checked_unread_all = "checked";
        if (_self.un_read_myself) {
            checked_unread = "checked";
            checked_unread_all = "";
        }
        html += '<td><input id="tk_filter_ur" type="radio" name="tk_filter_ur" value="1" '+checked_unread+'><label for="tk_filter_ur">未读</label></td>';
        html += '<td><input id="tk_filter_ur_all" type="radio" name="tk_filter_ur" value="0" '+checked_unread_all+'><label for="tk_filter_ur_all">全部</label></td>';
        html += '</td></tr></table>';
        //console.log(html);
        app.utils.popup({
			title: "过滤",
			message: html,
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
                var status = [];
                $('input[type="checkbox"][name="tk_filter"]:checked').each(function() {
                    status.push($(this).val());
                });
                var unread = $('input[type="radio"][name="tk_filter_ur"]:checked').val();
				if (status.sort().toString() != _self.status.sort().toString() || _self.un_read_myself != unread) {
                    _self.status = status;
                    _self.un_read_myself = unread*1;
                    _self.updateTicketList();
				}
			},
			cancelOnly: false,
            addCssClass: 'wide'
		});

        $('input[type="checkbox"][name="tk_filter"]').change(function(){
            var checked = ($('input[type="checkbox"][name="tk_filter"]:checked').length == _self.default_status.length);
            $('input[type="checkbox"][name="tk_filter_all"]').prop("checked", checked);
        });
        $('input[type="checkbox"][name="tk_filter_all"]').change(function(){
            var checked = $(this).prop("checked");
            $('input[type="checkbox"][name="tk_filter"]').each(function() {
                $(this).prop("checked", checked);
            });
        });
	};
	Ticket.prototype.showSheetMenu = function() {
        app.utils.actionsheet = $("#afui").actionsheet([{
				text: '查询',
				cssClasses: '',
				handler: function () {
                    $.ui.actionsheetShow = false;
					_self.showPopupInputBox();
				}
			}, {
				text: '过滤',
				cssClasses: '',
				handler: function () {
                    $.ui.actionsheetShow = false;
					_self.showFilterSelectBox();
				}
			}, {
				text: '新建',
				cssClasses: '',
				handler: function () {
                    $.ui.actionsheetShow = false;
					require('ticketIssue').show(_self.privInfo, _self.commonInfo);
				}
		}]);
	};
	Ticket.prototype.onNetError = function(data, type) {
        _self.release();
		$.ui.goBack();
	};
	Ticket.prototype.getTicketToken = function() {
		var param = {
			appid:_self.token_appid,
			secret:_self.token_secret
		};
        var url = app.route.ticketTokenUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在获取令牌...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetTicketTokenSuccess,
			error : _self.onNetError
		});
	};
	Ticket.prototype.onGetTicketTokenSuccess = function(data) {
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(data.errmsg);
			app.utils.clearWait();
			return;
		}
		console.log("token:"+data.access_token);
		_self.access_token = data.access_token;
		_self.expires_in = (data.expires_in-120)*1000; //ms
		_self.token_date = new Date().getTime();
		app.utils.clearWait();
		if (_self.oper == _self.GET_COMMON_INFO_OPER) {
			_self.doGetCommonInfo();
		} else if (_self.oper == _self.GET_PRIV_INFO_OPER) {
			_self.doGetPrivInfo();
		} else if (_self.oper == _self.GET_TICKET_HOME_SHOW_OPER) {
			_self.doGetTicketHomeShow();
		} else if (_self.oper == _self.GET_TICKET_LIST_OPER) {
			_self.doGetTicketList();
		} else if (_self.oper == _self.GET_TICKET_ITEM_OPER) {
			_self.doGetTicketItem();
		} else if (_self.oper == _self.ISSUE_TICKET_OPER) {
			var ticketIssue = require('ticketIssue');
			ticketIssue.doIssueTicket();
		} else if (_self.oper == _self.REPLY_TICKET_OPER) {
			var ticketReply = require('ticketReply');
			ticketReply.doReplyTicket();
		} else if (_self.oper == _self.GET_FOLLOW_TICKET_OPER) {
			var ticketFollowTicket = require('ticketFollowTicket');
			ticketFollowTicket.doGetFollowTicket();
		}
	};
	Ticket.prototype.checkTokenTimeoutForOper = function(oper) {
		if (_self.token_date + _self.expires_in < new Date().getTime()) {
			_self.oper = oper;
			_self.getTicketToken();
			return true;
		}
		return false;
	};
	//获取公用信息
	Ticket.prototype.getCommonInfo = function() {
		if (!_self.checkTokenTimeoutForOper(_self.GET_COMMON_INFO_OPER)) {
			_self.doGetCommonInfo();
		}
	};
	Ticket.prototype.doGetCommonInfo = function() {
		var param = {
			token:_self.access_token,
			lan:"zh",
			generator:-1,
			notice_place:-1,
			comment_source:-1,
			// category:-1,
            // priv_cat:-1,
            // inner_user:-1
			status:-1
		};
        var url = app.route.ticketCommUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在获取公用信息...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetCommonInfoSuccess,
			error : _self.onNetError
		});
	};
	Ticket.prototype.onGetCommonInfoSuccess = function(data) {
		console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(data.errmsg);
			app.utils.clearWait();
			return;
		}
		_self.commonInfo = data;
		app.utils.clearWait();
		_self.getTicketList();
	};
	//获取权限信息
	Ticket.prototype.getPrivInfo = function() {
		if (!_self.checkTokenTimeoutForOper(_self.GET_PRIV_INFO_OPER)) {
			_self.doGetPrivInfo();
		}
	};
	Ticket.prototype.doGetPrivInfo = function() {
		var param = {
			token:_self.access_token,
			user_id:app.login.username,
			lan:"zh"
		};
        var url = app.route.ticketPrivUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在权限信息...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetPrivInfoSuccess,
			error : _self.onNetError
		});
	};
	Ticket.prototype.onGetPrivInfoSuccess = function(data) {
		console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(data.errmsg);
			app.utils.clearWait();
			return;
		}
		_self.privInfo = data;
		app.utils.clearWait();
		_self.getCommonInfo();
	};
	Ticket.prototype.nextPage = function() {
		_self.getTicketList();
	};
	//获取汇总信息
	Ticket.prototype.getTicketHomeShow = function() {
		if (!_self.checkTokenTimeoutForOper(_self.GET_TICKET_HOME_SHOW_OPER)) {
			_self.doGetTicketHomeShow();
		}
	};
	Ticket.prototype.doGetTicketHomeShow = function() {
		var param = {
			token:_self.access_token,
			user_id:app.login.username,
			unread:20,
			unread_reply:20,
			chat:20
		};
        var url = app.route.ticketHomeShowUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在获取Ticket汇总信息...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetTicketHomeShowSuccess,
			error : _self.onNetError
		});
	};
	Ticket.prototype.onGetTicketHomeShowSuccess = function(data) {
		console.log(data);
	};
	//获取消息列表
	Ticket.prototype.getTicketList = function() {
		if (!_self.checkTokenTimeoutForOper(_self.GET_TICKET_LIST_OPER)) {
			_self.doGetTicketList();
		}
	};
	Ticket.prototype.doGetTicketList = function() {
		var start = _self.itemIndex+1;
		var param = {
			token:_self.access_token,
			user_id:app.login.username,
			from:start,
			len:PER_GET_PAGE_NUM
		};
        var data = {
            status:_self.status,
            un_read_myself:_self.un_read_myself?"yes":"no"
        };

		var url = app.route.ticketListUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在获取Ticket列表...");
		app.utils.ajax({
			type : "POST",
			url : url,
			data : JSON.stringify(data),
			success : _self.onGetTicketListSuccess,
			error : _self.onNetError
		});
	};
    Ticket.prototype.checkReaded = function(reading) {
        reading = reading.replace(/\[|\]/g, "");
        reading = reading.split(",");
        for (var i in reading) {
            if (app.login.username == reading[i]) {
                return true;
            }
        }
        return false;
    };
    Ticket.prototype.setReaded = function(ticket_id) {
        var needSet = false;
        var reading = "";
        for (var i in _self.data) {
            if (_self.data[i].id == ticket_id) {
                if (!_self.data[i].readed) {
                    if (_self.data[i].reading) {
                        reading = _self.data[i].reading+",["+app.login.username+"]";
                    } else {
                        reading = "["+app.login.username+"]";
                    }
                    needSet = true;
                }
                break;
            }
        }


        if (needSet) {
            var param = {
                token:_self.access_token,
                user_id:app.login.username
            };
            var data = {
                reading:reading,
                id:ticket_id
            };
            var url = app.route.ticketUpdateUrl+"?"+ $.param(param);
            app.utils.ajax({
                type : "POST",
                url : url,
                data : JSON.stringify(data),
                success : function() {
                    for (var i in _self.data) {
                        if (_self.data[i].id == ticket_id) {
                            _self.data[i].readed = true;
                            _self.data[i].reading = reading;
                            $("#tk_list_title_"+ticket_id).css("color", "lightsteelblue");
                            break;
                        }
                    }
                },
                error : function(){return true;}
            });
        }
    };
	Ticket.prototype.onGetTicketListSuccess = function(data) {
		console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(data.errmsg);
			app.utils.clearWait();
			if (_self.data.length == 0) {
				$('#pn_ticket_list').html("");
			}
			return;
		}
		_self.itemIndex += data.length;
		for (var i in data) {
			_self.data.push({
				id: data[i].main_ticket.id,
				subject:  $.base64.decode(data[i].main_ticket.subject, true),
                readed: _self.checkReaded(data[i].main_ticket.reading||""),
                reading: data[i].main_ticket.reading,
                input_date: data[i].main_ticket.input_date
			});
		}
		_self.showTicketList();
		app.utils.clearWait();
	};
	//获取消息详情
	Ticket.prototype.showTicketItem = function(id) {
		_self.select_ticket_id = id;
		_self.getTicketItem();
	};
	Ticket.prototype.getTicketItem = function() {
		if (!_self.checkTokenTimeoutForOper(_self.GET_TICKET_ITEM_OPER)) {
			_self.doGetTicketItem();
		}
	};
	Ticket.prototype.doGetTicketItem = function() {
		var param = {
			token:_self.access_token,
			user_id:app.login.username,
			ticket_id:_self.select_ticket_id
		};
        var url = app.route.ticketItemUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在获取Ticket详情...");
		console.log(app.route.ticketItemUrl+'?'+$.param(param));
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetTicketItemSuccess,
			error : _self.onNetError
		});
	};
	Ticket.prototype.onGetTicketItemSuccess = function(data) {
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(data.errmsg);
			app.utils.clearWait();
			return;
		}
		data.main_ticket.subject = $.base64.decode(data.main_ticket.subject, true);
		data.main_ticket.message = $.base64.decode(data.main_ticket.message, true);
		
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
			item.sub = sub;
		}
		console.log(data);
		require('ticketDetail').show(data, _self.commonInfo);
        _self.setReaded(_self.select_ticket_id);
		app.utils.clearWait();
	};
	return new Ticket();
});
