define(function(require) {
	"use strict";
	var _self;
	var PER_GET_PAGE_NUM = 20;
	
	function Ticket() {
		_self = this;
		_self.id = "ticket";
		
		_self.UPDATE_NONE_TYPE = 0;
		_self.UPDATE_LIST_TYPE = 1;
		_self.UPDATE_ALL_TYPE = 2;
		_self.updateType = _self.UPDATE_ALL_TYPE;

		_self.TYPE_ALL = 0;
		_self.TYPE_PERSONAL = 1;
		_self.TYPE_NEW_TICKET = 2;
		_self.TYPE_REPLY_TICKET = 3;
		_self.TYPE_PERSONAL_NEW_TICKET = 4;
		_self.TYPE_PERSONAL_REPLY_TICKET = 5;
		_self.showType = _self.TYPE_ALL;

		_self.FIRST_LOAD_STATE = 0;
		_self.NORMAL_STATE = 1;
		_self.FROM_DETSIL_UPDATE_STATE = 2;
		_self.FROM_DETSIL_ADD_STATE = 3;
		_self.state = _self.FIRST_LOAD_STATE;

		_self.itemIndex = -1;
		_self.data = [];
	}
	Ticket.prototype.show = function(writer_id, ticket_ids, type) {
		_self.writer_id = writer_id;
		_self.ticket_ids = ticket_ids;
		_self.showType = _self.TYPE_ALL;
		_self.state = _self.FIRST_LOAD_STATE;

		_self.initialSearchInfo();

		if (type == 0) {
			if (writer_id) {
				_self.showType = _self.TYPE_PERSONAL_NEW_TICKET;
			} else {
				_self.showType = _self.TYPE_NEW_TICKET;
			}
		} else if (type == 1) {
			if (writer_id) {
				_self.showType = _self.TYPE_PERSONAL_REPLY_TICKET;
			} else {
				_self.showType = _self.TYPE_REPLY_TICKET;
			}
		}
		if (writer_id && type == null) {
			_self.showType = _self.TYPE_PERSONAL;
		}

		app.utils.loadPanel(_self.id, {
			footer: 'none',
			transition: "fade",
			loadfunc: _self.id + "=onLoad",
			unloadfunc: _self.id + "=onUnload"
		});
		app.utils.setReleasePanel(_self);
	};
	Ticket.prototype.onLoad = function() {
		if (_self.state == _self.FIRST_LOAD_STATE) {
			_self.state = _self.NORMAL_STATE;
			if (_self.showType == _self.TYPE_PERSONAL || _self.showType == _self.TYPE_PERSONAL_NEW_TICKET || _self.showType == _self.TYPE_PERSONAL_REPLY_TICKET) {
				var user = app.userMgr.users[_self.writer_id];
				$('#ticket_title').html(user ? user.username || _self.writer_id : _self.writer_id + '的系统消息');
			} else if (_self.showType == _self.TYPE_NEW_TICKET) {
				$('#ticket_title').html('查看最新消息');
			} else if (_self.showType == _self.TYPE_REPLY_TICKET) {
				$('#ticket_title').html('查看回复消息');
			} else {
				$('#ticket_title').html('系统消息');
			}
			if (_self.writer_id == null || _self.writer_id != _self.old_writer_id) {
				_self.old_writer_id = _self.writer_id;
				if (_self.updateType == _self.UPDATE_ALL_TYPE) {
					_self.updateType = _self.UPDATE_NONE_TYPE;
					_self.getTicketList();
				} else if (_self.updateType == _self.UPDATE_LIST_TYPE) {
					_self.updateType = _self.UPDATE_NONE_TYPE;
					_self.updateTicketList();
				}
			}
			_self.addUserHead();
			$.ui.scrollToTop(app.utils.panelID(_self.id), 0);
		} else if (_self.state == _self.FROM_DETSIL_UPDATE_STATE) {
			_self.state = _self.NORMAL_STATE;
			_self.aheadCurrentTicket(null, _self.select_ticket_index);
		}

		_self.scroller = app.utils.initialPullRefresh(_self.id, {
			info: "下拉更新...",
			callback: _self.updateTicketList
		}, {info: "上拉加载更多...", callback: _self.nextPage});
	};
    Ticket.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    Ticket.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.updateType = _self.UPDATE_ALL_TYPE;
        _self.itemIndex = -1;
        _self.data = [];
		_self.ticket_ids = null;
        app.ticketDetail&&app.ticketDetail.release();
        app.ticketIssue&&app.ticketIssue.release();
        app.ticketSearch&&app.ticketSearch.release();
        app.ticketDetail&&app.ticketDetail.release();
    };
    Ticket.prototype.initialSearchInfo = function() {
		_self.searchInfo = {
			generator:'manual',
			category: 'all',
			un_read_myself:1&&!app.utils.isDevelopVersion()//1表示不显示已读 0表示需要显示已读
		};
	};
    Ticket.prototype.addUserHead = function() {
		var html = '';
		var userid = _self.writer_id||app.login.userid;
		html = '<div class="big_user_head default_head ticket_info_head user_head_'+userid+'" id="cti_head"></div>';
		$('#ticket_background').html(html);
	};
    Ticket.prototype.updateTicketList = function() {
        _self.itemIndex = -1;
        _self.data = [];
        _self.getTicketList();
        $('#pn_ticket_list').html('');
        $.ui.scrollToTop(app.utils.panelID(_self.id), 0);
    };
	Ticket.prototype.aheadCurrentTicket = function(ticket, index) {
		console.log(ticket);
		var data = _self.data;
		if (ticket != null) {
			index = _.findIndex(data, function(item) {return item.id == ticket.id});
			if (index == -1) {
				ticket.subject = $.base64.decode(ticket.subject, true);
				ticket.input_date = app.utils.adjustDate(ticket.input_date);
				ticket.readed = _self.checkReaded(ticket.reading||"");
				_self.prependNewData(ticket);
			}
		}
		if (index>0) {
			var tmp = data.splice(index, 1)[0];
			if (tmp != null) {
				data.unshift(tmp);
			}
		}
		_self.showTicketList();
		if (ticket) {
			$.ui.updateBadge('#tk_list_title_' + ticket.id, '新', "tr", 'red');
		}
		$.ui.scrollToTop(app.utils.panelID(_self.id), 0);
	};
	Ticket.prototype.getTicketDate = function(date) {
		date = new Date(date);
		var mon = date.getMonth()+1;
		var day = date.getDate();
		if (day < 10) {
			day = '0'+day;
		}
		return day+''+mon;
	};
	Ticket.prototype.getTicketDateHtml = function(date) {
		var day = date.substr(0, 2);
		var mon = date.substr(2);
		var mon = date.substr(2);
		return '<span  class="ticket_category_date"><span class="ticket_category_day">'+day+'</span><span class="ticket_category_month">'+mon+'月</span></span>';
	};
	Ticket.prototype.prependNewData = function(ticket) {
		_self.data.unshift(ticket);
		_self.itemIndex++;
	};
	Ticket.prototype.prependNewTicket = function(ticket) {
		if (_self.writer_id) {
			_self.prependPersonalTicket(ticket);
		} else {
			_self.prependAllTicket(ticket);
		}
	};
	Ticket.prototype.prependPersonalTicket = function(ticket) {
		if (ticket.writer_id != _self.writer_id) {
			return;
		}
		ticket.subject = $.base64.decode(ticket.subject, true);
		ticket.input_date = app.utils.adjustDate(ticket.input_date);
		var html = '';
		var style = 'style="color:black;"';
		var date = _self.getTicketDate(ticket.input_date);

		var el = $('.ticket_category[data-date="' + date + '"]');
		if (el.length) {
			html += '<div class="ticket_item" onclick="app.ticket.showTicketItem(' + ticket.id + ', 0)">';
			html += '<span ' + style + ' id="tk_list_title_' + ticket.id + '">' + ticket.subject + '</span>';
			$(html).insertAfter(el.find('.ticket_category_date'));
		} else {
			html += '<div class="ticket_category">';
			html += _self.getTicketDateHtml(date);
			html += '<div class="ticket_item" onclick="app.ticket.showTicketItem(' + ticket.id + ', 0)">';
			html += '<span ' + style + ' id="tk_list_title_' + ticket.id + '">' + ticket.subject + '</span>';
			html += '</div>';
			$('#pn_ticket_list').prepend(html);
		}
		_self.prependNewData(ticket);
		$.ui.updateBadge('#tk_list_title_' + ticket.id, '新', "tr", 'red');
	};
	Ticket.prototype.prependAllTicket = function(ticket) {
		var html = '',
			USERNAME_COLOR = app.color.USERNAME_COLOR,
			getShowDateTime = app.utils.getShowDateTime,
			users = app.userMgr.users;
		var style = 'style="color:black;"';
		var time = getShowDateTime(ticket.input_date);
		var userid = ticket.writer_id;
		var user = users[userid];
		var username = user?user.username||userid:userid;

		ticket.subject = $.base64.decode(ticket.subject, true);
		ticket.input_date = app.utils.adjustDate(ticket.input_date);

		html += '<li onclick="app.ticket.showTicketItem('+ticket.id+', 0)">';
		html += '<div class="chat_head chat_head_message default_head user_head_'+userid+'" onclick="event.stopPropagation();"></div>';
		html += '<span><span class="chat_message_username">' + USERNAME_COLOR(userid, username) + '</span><span class="chat_message_time">' + time + '</span></span>';
		html += '<div class="ticket_detail_follow_message" '+style+' id="tk_list_title_'+ticket.id+'">' + ticket.subject + '</div>';
		html += '</li>';
		$('#pn_ticket_list').prepend(html);

		_self.prependNewData(ticket);
		$.ui.updateBadge('#tk_list_title_' + ticket.id, '新', "tr", 'red');
	};
	Ticket.prototype.showTicketList = function() {
		if (_self.writer_id) {
			_self.showPersonalTicketList();
		} else {
			_self.showAllTicketList();
		}
	};
	Ticket.prototype.showPersonalTicketList = function() {
        var html = '',
            data = _self.data;

		var lastDate = null;
        for (var i=0,len=data.length; i<len; i++) {
			var item = data[i];
            var style = 'style="color:black;"';
            if (item.readed) {
                style = 'style="color:lightsteelblue;"';
            }

			var date = _self.getTicketDate(item.input_date);
			if (lastDate != date) {
				if (lastDate) {
					html += '</div>';
				}
				lastDate = date;
				html += '<div class="ticket_category" data-date="'+date+'">';
				html += _self.getTicketDateHtml(date);
			}

			html += '<div class="ticket_item" onclick="app.ticket.showTicketItem('+item.id+','+i+')">';
			html += '<span '+style+' id="tk_list_title_'+item.id+'">'+item.subject+'</span>';
			html += '</div>';
        }
		//console.log(html);
		$('#pn_ticket_list').html(html);
	};
	Ticket.prototype.showAllTicketList = function() {
		var html = '',
			data = _self.data,
			USERNAME_COLOR = app.color.USERNAME_COLOR,
			getShowDateTime = app.utils.getShowDateTime,
			users = app.userMgr.users;

		for (var i=0,len=data.length; i<len; i++) {
			var item = data[i];
			var style = 'style="color:black;"';
			var time = getShowDateTime(item.input_date);
			var userid = item.writer_id;
			var user = users[userid];
			var username = user?user.username||userid:userid;

			if (item.readed) {
				style = 'style="color:lightsteelblue;"';
			}

			html += '<li onclick="app.ticket.showTicketItem('+item.id+','+i+')">';
			html += '<div class="chat_head chat_head_message default_head user_head_'+userid+'" onclick="event.stopPropagation();"></div>';
			html += '<span><span class="chat_message_username">' + USERNAME_COLOR(userid, username) + '</span><span class="chat_message_time">' + time + '</span></span>';
			html += '<div class="ticket_detail_follow_message" '+style+' id="tk_list_title_'+item.id+'">' + item.subject + '</div>';
			html += '</li>';
		}
		//console.log(html);
		$('#pn_ticket_list').html(html);
	};
	Ticket.prototype.showPopupInputBox /*todo*/ = function() {
        app.utils.popup({
			title: "请输入ticket id:",
			message: "<input type='text' id='tk_input_ticket_id' class='af-ui-forms' style='color:black;font-weight:bold;'>",
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
	Ticket.prototype.showTicketSearch = function() {
        require('ticketSearch').show(_self);
	};
	Ticket.prototype.showTicketIssue = function() {
		require('ticketIssue').show();
	};
	Ticket.prototype.onNetError = function(data, type) {
        _self.release();
		$.ui.goBack();
	};
	Ticket.prototype.nextPage = function() {
		_self.getTicketList();
	};
	//获取汇总信息
	Ticket.prototype.getTicketHomeShow = function() {
		var param = {
			token:app.crm.token,
			user_id:app.login.userid,
			unread:20,
			unread_reply:20,
			chat:20
		};
        var url = app.route.crmTicketHomeShowUrl+"?"+ $.param(param);
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
		var start = _self.itemIndex+1;
		var param = {
			token:app.crm.token,
			user_id:app.login.userid,
			order_by:'last_revert_time desc',
			from:start,
			len:PER_GET_PAGE_NUM
		};
		var searchInfo = _self.searchInfo;
        var data = {
			//include_file: 1,
            un_read_myself:searchInfo.un_read_myself?"yes":"no"
        };
		if (_self.writer_id) {
			data.writer_id = _self.writer_id;
		} else if (searchInfo.writer_id) {
			data.writer_id = searchInfo.writer_id;
		}
		if (_self.ticket_ids) {
			data.ticket_ids = _self.ticket_ids;
		} else if (searchInfo.ticket_ids) {
			data.ticket_ids = searchInfo.ticket_ids;
		}
		if (searchInfo.status) {
			data.status = searchInfo.status;
		}
		if (searchInfo.generator!=='all') {
			data.generator = searchInfo.generator;
			if (searchInfo.generator==='manual') {
				data.no_auto = true;
			}
		}
		if (searchInfo.category!=='all') {
			data.category = searchInfo.category;
		}
		if (searchInfo.purpose!=='all') {
			data.purpose = searchInfo.purpose;
		}
		console.log(data);

		var url = app.route.crmTicketListUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在获取Ticket列表...");
		app.utils.ajax({
			type : "POST",
			url : url,
			data : JSON.stringify(data),
			success : _self.onGetTicketListSuccess,
			error : _self.onGetTicketListError
		});
	};
	Ticket.prototype.onGetTicketListError = function(data, type) {
		if (_self.showType == _self.TYPE_NEW_TICKET) {
			app.uiMessage.clearNewTicketNotify();
		} else if (_self.showType == _self.TYPE_REPLY_TICKET) {
			app.uiMessage.clearReplyTicketNotify();
		} else if (_self.showType == _self.TYPE_PERSONAL_NEW_TICKET) {
			app.contactInfo.clearNewTicketNotify();
		} else if (_self.showType == _self.TYPE_PERSONAL_REPLY_TICKET) {
			app.contactInfo.clearReplyTicketNotify();
		}
		_self.release();
		$.ui.goBack();
	};
    Ticket.prototype.checkReaded = function(reading) {
        reading = reading.replace(/\[|\]/g, "");
        reading = reading.split(",");
        for (var i in reading) {
            if (app.login.userid == reading[i]) {
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
                        reading = _self.data[i].reading+",["+app.login.userid+"]";
                    } else {
                        reading = "["+app.login.userid+"]";
                    }
                    needSet = true;
                }
                break;
            }
        }


        if (needSet) {
            var param = {
					token:app.crm.token,
                    user_id:app.login.userid
            };
            var data = {
                reading:reading,
                id:ticket_id,
				no_update_time:1
            };
            var url = app.route.crmTicketUpdateUrl+"?"+ $.param(param);
            app.utils.ajax({
                type : "POST",
                url : url,
                data : JSON.stringify(data),
                timeout : app.route.timeout,
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
		if (_self.showType == _self.TYPE_NEW_TICKET) {
			app.uiMessage.clearNewTicketNotify();
		} else if (_self.showType == _self.TYPE_REPLY_TICKET) {
			app.uiMessage.clearReplyTicketNotify();
		} else if (_self.showType == _self.TYPE_PERSONAL_NEW_TICKET) {
			app.contactInfo.clearNewTicketNotify();
		} else if (_self.showType == _self.TYPE_PERSONAL_REPLY_TICKET) {
			app.contactInfo.clearReplyTicketNotify();
		}
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
			var main_ticket = data[i].main_ticket;
			_self.data.push({
				id: main_ticket.id,
				subject:  $.base64.decode(main_ticket.subject, true),
                readed: _self.checkReaded(main_ticket.reading||""),
                reading: main_ticket.reading,
                input_date: app.utils.adjustDate(main_ticket.input_date),
				writer_id: main_ticket.writer_id
			});
		}
		_self.showTicketList();
		app.utils.clearWait();
	};
	//获取消息详情
	Ticket.prototype.showTicketItem = function(id, index) {
		_self.select_ticket_id = id;
		_self.select_ticket_index = index;
		_self.getTicketItem();
	};
	Ticket.prototype.getTicketItem = function() {
		var param = {
			token:app.crm.token,
			user_id:app.login.userid,
			ticket_id:_self.select_ticket_id
		};
        var url = app.route.crmTicketItemUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait("正在获取Ticket详情...");
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
		require('ticketDetail').show(data);
        _self.setReaded(_self.select_ticket_id);
		app.utils.clearWait();
	};
	return new Ticket();
});
