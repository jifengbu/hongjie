define(function(require) {
	"use strict";
    var _self;
    function StagePlanCompSumupHistorySearch() {
        _self = this;
        _self.id = "stagePlanCompSumupHistorySearch";
    }

    StagePlanCompSumupHistorySearch.prototype.show = function(parent) {
        _self.parent = parent;
        if (!_self.stageLists) {
            _self.stageLists = {};
            _self.stageLists = app.stagePlanComp.stage_info;
        }
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
    };
    StagePlanCompSumupHistorySearch.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel();
        }
    };
    StagePlanCompSumupHistorySearch.prototype.release = function() {
		_self.parent = null;
        _self.stageLists = null;
    };
    StagePlanCompSumupHistorySearch.prototype.showPanel = function() {
        var searchInfo = _self.parent.searchInfo;
        $("#spcshs_person").val(searchInfo.operator_id);
        $("#spcshs_time_start option[value='"+searchInfo.time_start+"']").attr("selected", "selected");
        $('#spcshs_time_value').val(app.utils.dateToString(searchInfo.date));
        _self.updateWorkStage(searchInfo.operator_id);
    };
    StagePlanCompSumupHistorySearch.prototype.showPopMenu = function() {
        var date = app.utils.stringToDate($("#spcshs_time_value").val());
        navigator.utils.datePickerDialog(function(date){
            $("#spcshs_time_value").val(app.utils.dateToString(date));
        }, date.year, date.month, date.day);
    };
    StagePlanCompSumupHistorySearch.prototype.removePerson = function() {
        $("#spcshs_person").val('');
    };
    StagePlanCompSumupHistorySearch.prototype.resetPerson = function() {
        $("#spcshs_person").val(app.login.userid);
    };
    StagePlanCompSumupHistorySearch.prototype.selectPerson = function() {
        var searchInfo = _self.parent.searchInfo;
        require('selectPersonByDisp').show($('#spcshs_person').val(), $('#spcshs_stage').val(),$("#spcshs_time_value").val(),
		function(userid) {
			$("#spcshs_person").val(userid);
			if (!_self.stageLists) {
				_self.cur_userid = userid;
				_self.getWorkStageForPerson(userid);
			} else {
				_self.updateWorkStage(userid);
			}
		});
    };
    StagePlanCompSumupHistorySearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        searchInfo.time_start = $("#spcshs_time_start").val();
        searchInfo.stage_name = $("#spcshs_stage").val();
        searchInfo.date = app.utils.stringToDate($("#spcshs_time_value").val());
        searchInfo.operator_id = $('#spcshs_person').val();
        _self.parent.getSumupHistory();
        $.ui.goBack();
    };
    StagePlanCompSumupHistorySearch.prototype.updateWorkStage = function(userid) {
        var searchInfo = _self.parent.searchInfo;
        var stage_info = _self.stageLists;
        var stage_name = searchInfo.stage_name;
        var selected = '';
        if (!stage_name) {
            selected = ' selected';
        }
		console.log("stage_name",stage_name);
        var html = '<option value=""'+selected+'></option>';
        for (var i in stage_info) {
            selected = '';
            if (stage_name == stage_info[i]) {
                selected = ' selected';
            }
            html += ' <option value="'+stage_info[i]+'"'+selected+'>'+stage_info[i]+'</option>';
        }
        $('#spcshs_stage').html(html);
    };
    StagePlanCompSumupHistorySearch.prototype.getWorkStageForPerson = function(userid) {
        var param = {
            oper: 10,
            uid: app.login.userid,
            operator_id: userid
        };
        console.log(param);
        var url = app.route.stagePlanComUrl+'?'+ $.param(param);
        console.log(url);
        app.utils.setWait("正在提交...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetWorkStageForPersonSuccess
        });
    };
    StagePlanCompSumupHistorySearch.prototype.onGetWorkStageForPersonSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (!data["success"]) {
            app.utils.showError(app.error.DATA_ERROR);
            return;
        }
        _self.stageLists = data.stage_list||[];
        _self.updateWorkStage(_self.cur_userid);
        _self.cur_userid = null
    };

    return new StagePlanCompSumupHistorySearch();
});
