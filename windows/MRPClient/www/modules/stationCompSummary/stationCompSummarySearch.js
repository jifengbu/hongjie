/**
 * Created by panyun on 2015/1/8.
 */
define(function(require) {
	"use strict";
    var _self;

    function StationCompSummarySearch() {
        _self = this;
        _self.id = "stationCompSummarySearch";
    }

    StationCompSummarySearch.prototype.show = function(parent, from) {
        _self.from = from;
        _self.parent = parent;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
    };
    StationCompSummarySearch.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.showPanel();
    };
    StationCompSummarySearch.prototype.release = function() {
        _self.parent = null;
        _self.from = null;
    };
    StationCompSummarySearch.prototype.showPanel = function() {
        var searchInfo = _self.parent.searchInfo;

        if (_self.from == 0) {
            $('#tr_scss_type').show();
        } else {
            $('#tr_scss_type').hide();
        }
        $("#scss_person").val(searchInfo.operator_id);
        $("#scss_time_start option[value='"+searchInfo.time_start+"']").attr("selected", "selected");
        $('#scss_time_value').val(app.utils.dateToString(searchInfo.date));
        $("#scss_type option[value='"+searchInfo.type+"']").attr("selected", "selected");
        $("#scss_witem_name").val(searchInfo.workitem_name);

        var stage_info = app.stationCompSummary.totalInfo.stage_info;
        var stage_name = searchInfo.stage_name;
        var selected = '';
        if (!stage_name) {
            selected = ' selected';
        }
        var html = '<option value=""'+selected+'></option>';
        for (var i in stage_info) {
            selected = '';
            if (stage_name == stage_info[i]) {
                selected = ' selected';
            }
            html += ' <option value="'+stage_info[i]+'"'+selected+'>'+stage_info[i]+'</option>';
        }
        $('#scss_stage').html(html);
    };
    StationCompSummarySearch.prototype.showPopMenu = function() {
        var date = app.utils.stringToDate($("#scss_time_value").val());
        navigator.utils.datePickerDialog(function(date){
            $("#scss_time_value").val(app.utils.dateToString(date));
        }, date.year, date.month, date.day);
    };
    StationCompSummarySearch.prototype.removePerson = function() {
        $("#scss_person").val('');
    };
    StationCompSummarySearch.prototype.resetPerson = function() {
        $("#scss_person").val(app.login.userid);
    };
    StationCompSummarySearch.prototype.selectPerson = function() {
        var searchInfo = _self.parent.searchInfo;
        require('selectPerson').show(searchInfo.operator_id, function(userid) {
            var allusers = app.userMgr.users;
            $("#scss_person").val(userid);
        });
    };
    StationCompSummarySearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        searchInfo.time_start = $("#scss_time_start").val();
        if (_self.from == 0) {
            searchInfo.type = $("#scss_type").val();
        }
        searchInfo.stage_name = $("#scss_stage").val();
        searchInfo.date = app.utils.stringToDate($("#scss_time_value").val());
        searchInfo.workitem_name = $("#scss_witem_name").val();
        searchInfo.operator_id = $('#scss_person').val();
        if (_self.from == 0) {
            _self.parent.refreshStationCompSummary(true);
        } else {
            _self.parent.refreshStationCompDetail();
        }
        $.ui.goBack();
    };
    return new StationCompSummarySearch();
});
