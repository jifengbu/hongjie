define(function(require) {
	"use strict";
    var _self;

    function stageNotifyListDetail() {
        _self = this;
        _self.id = "stageNotifyListDetail";
    }

    stageNotifyListDetail.prototype.show = function(from,notify) {
		_self.parent = from;
        _self.notify = notify;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"leftSwipe", loadfunc:_self.id+"=onLoad"});
    };
    stageNotifyListDetail.prototype.release = function(data) {
        _self.notify = null;
    };
    stageNotifyListDetail.prototype.onLoad = function() {
        if (!_self.loaded) {
            _self.loaded = true;
            if (app.login.isManage == null) {
                _self.getManageUserInfo();
            } else {
                _self.showPanel();
            }
        }
    };
    stageNotifyListDetail.prototype.showPanel = function() {
		app.updateChatPageBadge(_self.id);
        var PURPLE = app.color.PURPLE,
		BLUE = app.color.BLUE,
		LC = app.color.OLIVEDRAB,
		RED = app.color.RED,
		GREEN = app.color.GREEN,
		DIVH = '<div style="margin-bottom: 6px;">',
		DIVT = '</div>',
		html = '',
        notify = _self.notify;

        html += '<li>';
        html += DIVH+'发出人：'+notify.author+DIVT;
        html += DIVH+'工位：'+notify.stg_name+DIVT;
		html += DIVH+'提醒类别：'+notify.type_name+DIVT;
		html += DIVH+'状态:'+notify.status+DIVT;
		html += DIVH+'Ticket:'+notify.crm_ticket+DIVT;
        html += DIVH+'提醒内容：<br>'+$.base64.decode(notify.msg, true)+DIVT+"<br>";
		
        html += '</li>';
		var btn_name = '打开提醒';
		if(notify.status == 'open'){
			btn_name = '关闭提醒';		
		}
		html +=  app.utils.buttonHtml([
			{text:btn_name, click:'app.stageNotifyListDetail.changeStaus('+notify.id+')'}
		]);
        $('#stbod_notify_detail').html(html);
    };
    stageNotifyListDetail.prototype.changeStaus  = function(id){
		var param = {
            uid: app.login.userid,
			nt_id:id,
			oper:'changestatus'
        };	
		 var url = app.route.stgNotifysUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onchangeStaus
        });
    }
	 stageNotifyListDetail.prototype.onchangeStaus = function(data) {
       if (!data.success) {
            app.utils.showError(app.error.SERVER_ERROR);
            app.utils.clearWait();
            return;
       }
	    app.utils.toast("更新成功!");
	    $.ui.goBack();
        _self.parent.refreshNotifys();
    };
	
    stageNotifyListDetail.prototype.getManageUserInfo = function() {
        var param = {
            user_id: app.login.userid,
            is_manage: 1
        };
        var url = app.route.crmGetManageUserInfo+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetManageUserInfoSuccess
        });
    };
    stageNotifyListDetail.prototype.onGetManageUserInfoSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        app.login.isManage = (data==1);
        _self.showPanel();
    };
    return new stageNotifyListDetail();
});
