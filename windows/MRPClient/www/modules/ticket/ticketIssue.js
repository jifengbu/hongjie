define(function(require) {
	"use strict";
	var _self;

	function TicketIssue() {
		_self = this;
		_self.id = "ticketIssue";
	}
	
	TicketIssue.prototype.show = function() {
		_self.attachments = [];
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", transition:"leftSlide", footer:"none"});
	};
	TicketIssue.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			app.crm.checkCommonInfo(_self.showPanel);
		}
	};
    TicketIssue.prototype.release = function() {
        _self.addOptions = null;
		_self.attachments = null;
    };
	TicketIssue.prototype.showPanel = function() {
		if (!_self.addOptions) {
			_self.addOptions = true;
			var category = app.crm.commonInfo.category;
			var options = '';
			for (var key in category) {
				options += "<option value='" + key + "'>" + category[key] + "</option>";
			}
			$("#ti_track_type").html(options);
			
			var purpose = app.crm.commonInfo.purpose;
			var options = '';
			for (var key in purpose) {
				options += "<option value='" + key + "'>" + purpose[key] + "</option>";
			}
			$("#ti_purpose").html(options);
		}

		$.ui.scrollToTop(app.utils.panelID(_self.id), 0);
	};
	TicketIssue.prototype.addAttachments = function() {
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
					_self.appendAttachments(attachments);
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
				_self.appendAttachments(attachments);
			});
		}
	};
	TicketIssue.prototype.appendAttachments = function(attachments) {
		_self.attachments.push(attachments);
		_self.showAttachmentsList();
	};
	TicketIssue.prototype.deleteAttachments = function(index) {
		_self.attachments.splice(index, 1);
		_self.showAttachmentsList();
	};
	TicketIssue.prototype.showAttachmentsList = function() {
		var html = '';
		var attachments = _self.attachments;
		for (var i in attachments) {
			var item = attachments[i];
			html += '<li>';
			html += '<span class="icon remove" style="color:red" onclick="app.ticketIssue.deleteAttachments('+i+')"></span>';
			html += '<span>'+item.file_name+'</span>';
			html += '</li>';
		}
		if (html) {
			$('#ti_files_list').html(html);
			$('#ti_files_list').show();
		} else {
			$('#ti_files_list').hide();
		}
	};
	TicketIssue.prototype.showVisibleGroup = function() {
		var group = $("#ti_visible_group").val().trim();
		require('selectGroup').show(group.split(','), _self.setVisibleGroup);
	};
	TicketIssue.prototype.setVisibleGroup = function(groups) {
		$("#ti_visible_group").val(groups.join(','));
	};
	TicketIssue.prototype.showVisiblePerson = function() {
		var persons = $("#ti_visible_person").val();
		require('selectPerson').show(persons.split(','), _self.setVisiblePerson);
	};
	TicketIssue.prototype.setVisiblePerson = function(persons) {
		$("#ti_visible_person").val(persons.join(','));
	};
	TicketIssue.prototype.issueTicket = function() {
		var title = $("#ti_title").val();
		var content = $("#ti_content").val();
		var ticket = require('ticket');
		
		if (title.trim().length == 0) {
			app.utils.toast("主题不能为空");
			return;
		}
		if (content.trim().length == 0) {
			app.utils.toast("内容不能为空");
			return;
		}
		
		var grade = $("#ti_emergency_level").val(); 
		var visible_group = $("#ti_visible_group").val();
		var visible_person = $("#ti_visible_person").val();
		var category = $("#ti_track_type").val();
        // var purpose_category = "message";
        // if(category == "daily_report"){
            // purpose_category = "message_7";
        // }
        var other_id = $("#ti_track_other_id").val();
		visible_person = visible_person.split(',');
		var selfid = app.login.userid;
		var persons = "["+selfid+"]";
		var reading = persons;
		for (var i=0; i<visible_person.length; i++) {
			var person = visible_person[i].trim();
			if (person.length > 0) {
				if (person != selfid) {
					persons += ",["+person+"]";
				}
			}
		}
		var purpose = $("#ti_purpose").val();
		var param = {
		};
		var url = app.route.crmTicketIssueUrl+"?"+$.param(param);
		console.log(url);
		var data = {
			subject: title,
			message: content,
			category: category,
            purpose_category:purpose,
			generator: 'manual',
			other_id: other_id.trim(),
			input_date: $.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
			visible: visible_group,
			visible_person: persons,
			grade: grade,
			reading: reading,
			comment_source: 'directly',
			writer_id: app.login.userid
		};
		if (_self.attachments.length) {
			data.uploadfile = _self.attachments;
		}
		console.log(data);
		app.utils.setWait("正在发布...");
		app.utils.ajax({
			type : "POST",
			url : url,
			data : JSON.stringify(data),
			success : _self.onIssueTicketSuccess
		});
	};
	TicketIssue.prototype.onIssueTicketSuccess = function(data) {
		console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(app.error.SERVER_ERROR);
			app.utils.clearWait();
			return;
		}
		$("#ti_title").val("");
		$("#ti_content").val("");
		app.utils.toast("发布成功");
		app.utils.clearWait();
		var ticket = app.ticket;
		ticket.updateType = ticket.UPDATE_LIST_TYPE;
		ticket.state = ticket.FIRST_LOAD_STATE;
		$.ui.goBack();
	};
	
	TicketIssue.prototype.getWorkLog = function(){
		app.utils.setWait("正在努力获取数据,请稍候...");	
		var url = app.route.crmGetWorkLog+'?user_id='+app.login.userid+"&type=engineer";
		console.log(url);
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetWorkLogSuccess,
			error : _self.onGetWorkLogError
		});
	};
	
	TicketIssue.prototype.onGetWorkLogSuccess = function(data){
		
		console.log(data);
		if (data.errcode) {
			if(data.errcode == 40015){
				app.utils.toast(data.errmsg);
			}
			else{
				console.log(data.errcode+":"+data.errmsg);
				app.utils.showError(app.error.SERVER_ERROR);
			}
			app.utils.clearWait();
			return;
		}
		app.utils.clearWait();
		data.message = $.base64.decode(data.message, true);
		data.subject = $.base64.decode(data.subject, true);
		var message = data.message.replace(/\\r\\n/g, '\r\n');
		if($("#ti_content").val()){	
			$("#ti_content").val($("#ti_content").val()+'\r\n'+unescape(message.replace(/\\u/g, "%u")));					
		}
		else{
			$("#ti_content").val(unescape(message.replace(/\\u/g, "%u")));		
		}
		var elem = $("#ti_content");
		var el = elem[0];
		el.style.height = 'auto';
		el.scrollTop = 0;
		el.style.height = el.scrollHeight + 'px';
		$("#ti_title").val(data.subject);
	};
	
	TicketIssue.prototype.onGetWorkLogError = function(data, type){
		app.utils.clearWait();
		app.utils.toast("获取失败，请检查网络!");
	};
	
	return new TicketIssue();
});
