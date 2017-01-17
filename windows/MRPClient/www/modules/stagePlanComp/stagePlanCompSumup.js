define(function(require) {
	"use strict";
    var _self;
    function StagePlanCompSumup() {
        _self = this;
        _self.id = "stagePlanCompSumup";
    }

    StagePlanCompSumup.prototype.show = function(data,comp_data){
        _self.data = data;
		_self.comp_data = comp_data;
		console.log("log_comp_data",_self.comp_data);
		console.log("log_comp_datastage_info",app.stagePlanComp.stage_info);
		console.log("log_comp_datastage_meta_id",app.stagePlanComp.stage_meta_id);
        _self.totalInfo = {};
        _self.loaded = false;
        _self.totalInfo.head_man = localStorage["STAGE_PLAN_COMP_SUMUP_HEAD_MAN"]||'';
        _self.totalInfo.director = localStorage["STAGE_PLAN_COMP_SUMUP_DIRECTOR"]||'';
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StagePlanCompSumup.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel();
        }
    };
    StagePlanCompSumup.prototype.release = function() {
		_self.data = null;
        _self.totalInfo = null;
    };
    StagePlanCompSumup.prototype.showPanel = function() {
        var RED = app.color.RED,
            PURPLE = app.color.PURPLE,
            STEELBLUE = app.color.STEELBLUE,
            GREEN = app.color.GREEN,
            COUNT_COLOR = app.color.COUNT_COLOR,
            DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVH = '<div style="margin-bottom: 6px;">',
            DIVT = '</div>',
            html = '',
            data = _self.data;

        var total_vol = data.total_vol,
            total_time = data.total_time,
            efficiency = data.efficiency,
            total_undo = data.total_undo;

        console.log(data);
        html += '<li class="divider">汇总信息</li>';
        html += '<ul class="list inset">';
        html += DIVH + CC('产量合计：') + COUNT_COLOR(total_vol) +'&nbsp;'+ RED(data.total_vol_unit) +DIVT;
        html += DIVH + CC('工作准备时间：') + '<input id="spcs_prepare_time" type="text" placeholder="准备时间" class="input_style" style="width:30%" value="0">小时' + DIVT;
        html += DIVH + CC('工作生产时间：') + DARKOLIVEGREEN(app.utils.timeToStr(total_time)) + DIVT;
        html += DIVH + CC('生产效率：') + COUNT_COLOR(efficiency) +'&nbsp;'+RED(data.total_vol_unit)+'/'+STEELBLUE('小时')+DIVT;
        html += DIVH + CC('结存：') + COUNT_COLOR(total_undo) +'&nbsp;'+RED(data.total_undo_unit)+ DIVT;
        html += DIVH + CC('设备问题：')+ DIVT;
        html += '<textarea id="spcs_equipment" rows="2" placeholder="如有设备问题请输入相关问题" style="width: 80%;" class="input_style" ></textarea>'+ DIVT;

        html += DIVH + CC('组长：') + '<input id="spcs_head_man" type="text" style="width: 60%;" readonly onclick="app.stagePlanCompSumup.setHeadMan(this)" value="'+_self.totalInfo.head_man+'" class="input_style">' + '<a class="button icon add" style="border:0" onclick="app.stagePlanCompSumup.setHeadMan()"></a>'+DIVT;
        html += DIVH + CC('主管：') + '<input  id="spcs_director" type="text" style="width: 60%;" readonly onclick="app.stagePlanCompSumup.setDirector(this)" value="'+_self.totalInfo.director+'" class="input_style">' +'<a class="button icon add" style="border:0" onclick="app.stagePlanCompSumup.setDirector()"></a>'+ DIVT;
        if (total_vol > 0) {
            html += app.utils.buttonHtml([{text: '提交', click: 'app.stagePlanCompSumup.doSubmit()'}]);
        }
        html += '</li></ul>';
        var space = '&nbsp;&nbsp;&nbsp;';
        var history = app.stagePlanComp.history[app.stagePlanComp.stage_info[app.stagePlanComp.stage_meta_id]];
        if (history) {
            html += '<li class="divider collapsed" onclick="app.utils.showHide(this, \'spcs_history_detail\')">该工序今日提交历史 ('+RED(history.length)+')</li>';
            html += '<ul class="list inset" id="spcs_history_detail" style="display: none">';
            for (var i in history) {
                var item = history[i];
                html += '<li class="small_font">';
                html += DIVH + CC('完成：') + COUNT_COLOR(item.total_vol) +'&nbsp;'+ RED(item.total_vol_unit) +space+ CC('结存：') + COUNT_COLOR(item.total_undo) +'&nbsp;'+RED(item.total_undo_unit)+DIVT;
                html += DIVH +CC('共耗时：') + DARKOLIVEGREEN(app.utils.timeToStr(item.total_time))+space+CC('效率：') + COUNT_COLOR(item.efficiency) +'&nbsp;'+RED(item.total_vol_unit)+'/'+STEELBLUE('小时')+DIVT;
                html += DIVH +CC('准备时长：') + DARKOLIVEGREEN(app.utils.timeToStr(item.prepare_time))+space+CC('提交时间：') + DARKOLIVEGREEN(item.time)+DIVT;
                if (item.equipment) {
                    html += DIVH + CC('设备问题：') + RED(item.equipment) + DIVT;
                }
            }
            html += '</ul>';
        }

        $('#stps_list').html(html);
        _self.totalInfo = _.extend(_self.totalInfo, {
            efficiency: efficiency,
            total_time: total_time,
            total_vol: total_vol,
            total_undo: total_undo,
            total_vol_unit: data.total_vol_unit
        });
    };
    StagePlanCompSumup.prototype.showDetail = function () {
        require('stagePlanCompSumupDetail').show(_self.data);
    };
    StagePlanCompSumup.prototype.setHeadMan = function (el) {
        el = el || $('#spcs_head_man')[0];
        var userid = el.value;
        require('selectPerson').show(userid, function(person){
            el.value = person;
            _self.totalInfo.head_man= person;
        });
    };
    StagePlanCompSumup.prototype.setDirector = function (el) {
        el = el || $('#spcs_director')[0];
        var userid = el.value;
        require('selectPerson').show(userid, function(person){
            el.value = person;
            _self.totalInfo.director= person;
        });
    };
    StagePlanCompSumup.prototype.doSubmit = function() {
        if (localStorage["STAGE_PLAN_COMP_SUMUP_HEAD_MAN"] != _self.totalInfo.head_man) {
            localStorage["STAGE_PLAN_COMP_SUMUP_HEAD_MAN"] = _self.totalInfo.head_man;
        }
        if (localStorage["STAGE_PLAN_COMP_SUMUP_DIRECTOR"] != _self.totalInfo.director) {
            localStorage["STAGE_PLAN_COMP_SUMUP_DIRECTOR"] = _self.totalInfo.director;
        }
        var prepare_time = $('#spcs_prepare_time').val()||0;
        var equipment = $('#spcs_equipment').val()||'';
        //if (!_self.totalInfo.head_man) {
        //    app.utils.toast("请选择组长");
        //    return;
        //}
        //if (!_self.totalInfo.director) {
        //    app.utils.toast("请选择主管");
        //    return;
        //}
        var param = {
            oper: 3,
            uid: app.login.userid
        };

        var url = app.route.stagePlanComUrl+'?'+ $.param(param);
        console.log(url);
		console.log('doSubmit',app.stagePlanComp.stage_info[app.stagePlanComp.stage_meta_id]);
        var data = _.extend(_self.totalInfo, {
            prepare_time: prepare_time*3600,
            equipment: equipment,
            stage: app.stagePlanComp.stage_info[app.stagePlanComp.stage_meta_id],
			comp_dara:JSON.stringify(_self.comp_data)
        });
		
        _self.submitData = data;
        console.log(data);
        app.utils.setWait("正在提交...");
        app.utils.ajax({
            type : "POST",
            url : url,
            data: $.param(data),
            success : _self.onSubmitSuccess
        });
    };
    StagePlanCompSumup.prototype.onSubmitSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data["success"]) {
            app.utils.showError("你的小结已经被审核，不能再提交");
            return;
        }
        app.utils.toast("提交成功");
        $.ui.goBack();
        var history = app.stagePlanComp.history;
        var submitData = _self.submitData;
        var item = {
            date: app.utils.dateToString(app.stagePlanComp.date),
            efficiency: submitData.efficiency,
            total_time: submitData.total_time,
            total_vol: submitData.total_vol,
            total_vol_unit: submitData.total_vol_unit,
            total_undo: submitData.total_undo,
            total_undo_unit: submitData.total_undo_unit,
            equipment: submitData.equipment,
            prepare_time: submitData.prepare_time,
            time: $.dateFormat(new Date(), 'hh:mm:ss')
        };
        var stage = submitData.stage;
        history[stage] = history[stage] || [];
        history[stage].push(item);
        localStorage["STAGE_PLAN_COMP_HISTORY"] = JSON.stringify(history);
        $('#stpc_dumbit_times').html('已提交'+history[stage].length+'次');
        _self.submitData = null;
    };

    return new StagePlanCompSumup();
});
