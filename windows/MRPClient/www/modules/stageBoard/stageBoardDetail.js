define(function(require) {
	"use strict";
    var _self;

    function StageBoardDetail() {
        _self = this;
        _self.id = "stageBoardDetail";
    }

    StageBoardDetail.prototype.show = function(wdisp) {
        _self.wdisp = wdisp;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"leftSwipe", loadfunc:_self.id+"=onLoad"});
    };
    StageBoardDetail.prototype.release = function(data) {
        _self.wdisp = null;
        _self.note = null;
    };
    StageBoardDetail.prototype.onLoad = function() {
        if (!_self.loaded) {
            _self.loaded = true;
            if (app.login.isManage == null) {
                _self.getManageUserInfo();
            } else {
                _self.showPanel();
            }
        }
    };
    StageBoardDetail.prototype.showPanel = function() {
		app.updateChatPageBadge(_self.id);
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            LC = app.color.OLIVEDRAB,
            RED = app.color.RED,
            GREEN = app.color.GREEN,
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '',
            wdisp = _self.wdisp;

        html += '<li>';
        html += DIVH+'板名称：'+GREEN(wdisp.witem_name)+DIVT;
        var priority = _self.getWshPriority(wdisp.priority, wdisp.wsh_timeend_required);
        html += DIVH+'状态：'+GREEN(wdisp.state)+'&nbsp;&nbsp;&nbsp;优先级：<sup>'+ RED(wdisp.priority)+'</sup><span class="worksheet_priority worksheet_priority_'+priority+'"></span>'+DIVT;
        html += DIVH+'计划数量：'+GREEN(wdisp.plan_qty)+'&nbsp;&nbsp;&nbsp;在制数量：'+GREEN(wdisp.wait_qty)+DIVT;
        html += DIVH+'未接收数量(最大)：'+GREEN(wdisp.no_comp_qty)+'('+RED(wdisp.max_qty)+')'+DIVT;
        html += DIVH+'订单号(本厂编号)：'+GREEN(wdisp.order_info)+DIVT;
        html += '</li>';

        var other_parameter = wdisp.other_parameter||"";
        other_parameter = other_parameter.replace(/\n/g, "<br />");
        html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \'stbod_other_params\')">其他参数</li>';
        html += '<li>';
        html += '<div id="stbod_other_params" style="display: none">'+PURPLE(other_parameter)+DIVT;
        if(wdisp.outsource == "1"){
            html += DIVH+'外发单:'+ GREEN(wdisp.outsource_name)+DIVT;
        }
        html += '</li>'

        html += '<li class="divider">备注</li>';
        html += '<textarea id="stbod_note" rows="2" style="width: 90%;margin-left: 5%;" class="input_style"  placeholder="请输入备注信息">'+(wdisp.note||"无")+'</textarea>';
        if (app.login.isManage) {
            html +=  app.utils.buttonHtml([
                {text:'保存备注', click:'app.stageBoardDetail.saveNote()'}
            ]);
        }
        html += '</li>';

        $('#stbod_detail').html(html);
    };
    StageBoardDetail.prototype.getWshPriority = function(priority, end_time) {
        if(end_time && (new Date(end_time) < new Date())){
            priority = 0;
        }
        return priority;
    };
    StageBoardDetail.prototype.saveNote = function() {
        var note = $('#stbod_note').val();
        _self.note = note;
        var param = {
            op: 2,
            user_id: app.login.userid,
            stginst_id: _self.wdisp.stginst_id,
            note: note
        };
        var url = app.route.stageBoardUrl+'?'+$.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onSaveNoteSuccess
        });
    };
    StageBoardDetail.prototype.onSaveNoteSuccess = function(data) {
        app.utils.clearWait();
        app.utils.toast("更改成功");
        $('#stbod_note').val(_self.note);
        _self.note = null;
        app.stageBoard.refreshCurPage();
    };
    StageBoardDetail.prototype.getManageUserInfo = function() {
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
    StageBoardDetail.prototype.onGetManageUserInfoSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        app.login.isManage = (data==1);
        _self.showPanel();
    };
    return new StageBoardDetail();
});
