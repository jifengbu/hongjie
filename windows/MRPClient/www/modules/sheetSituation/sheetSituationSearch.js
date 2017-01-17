/**
 * Created by panyun on 2015/1/20.
 */
define(function(require) {
	"use strict";
    var _self;

    function SheetSituationSearch() {
        _self = this;
        _self.id = "sheetSituationSearch";
    }

    SheetSituationSearch.prototype.show = function(parent) {
        _self.parent = parent;
        app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft",loadfunc:_self.id+"=onLoad"});
    };
    SheetSituationSearch.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel();
        }
    };
    SheetSituationSearch.prototype.release = function() {
        _self.parent = null;
    };
    SheetSituationSearch.prototype.showPanel = function() {
        var searchInfo = _self.parent.searchInfo;

        _self.changeTimeOper(searchInfo.create_time.op);
        $("#sssh_time_op option[value='"+searchInfo.create_time.op+"']").attr("selected", "selected");
        $("#sssh_workitem_name").val(searchInfo.workitem_name||'');
        $('#sssh_wsh_name').val(searchInfo.wsh_name||'');
        $('#sssh_order_name').val(searchInfo.order_name||'');
    };
    SheetSituationSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        var type = $("#sssh_time_op").val();
        if(type == "between")
            searchInfo.create_time = {op:type,value:{value1:$("#sssh_time_1").val(),value2:$("#sssh_time_2").val()}};
        else{
            searchInfo.create_time = {op:type,value:{value1:$("#sssh_time_3").val()}};
        }

        searchInfo.wsh_name = $("#sssh_wsh_name").val();
        searchInfo.workitem_name = $("#sssh_workitem_name").val();
        searchInfo.order_name = $("#sssh_order_name").val();
        _self.parent.refreshSheetSituation();
        $.ui.goBack();
    };
    SheetSituationSearch.prototype.changeTimeOper = function(op) {
        var searchInfo = _self.parent.searchInfo;
        switch(op){
            case "between":
                $("#sssh_time_1").val(searchInfo.create_time.value.value1);
                $("#sssh_time_2").val(searchInfo.create_time.value.value2);
                $("#sssh_time_between").show();
                $("#sssh_time_other").hide();
                break;
            default:
                $("#sssh_time_3").val(searchInfo.create_time.value.value1);
                $("#sssh_time_between").hide();
                $("#sssh_time_other").show();
                break;
        }
    };
    SheetSituationSearch.prototype.showPopMenu = function(el) {
        var d = el.value.split('-');
        navigator.utils.datePickerDialog(function(date){
            el.value = app.utils.dateToString(date);
        },d[0], d[1], d[2]);
    };
    return new SheetSituationSearch();
});
