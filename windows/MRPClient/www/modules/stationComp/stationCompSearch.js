/**
 * Created by panyun on 2015/1/6.
 */
define(function(require) {
	"use strict";
    var _self;

    function StationCompSearch() {
        _self = this;
        _self.id = "stationCompSearch";
    }

    StationCompSearch.prototype.show = function(parent) {
        _self.parent = parent;
        app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
    };
    StationCompSearch.prototype.onLoad = function() {
        _self.showPanel();
    };
    StationCompSearch.prototype.release = function() {
        _self.parent = null;
        _self.addOptions = null;
        $('#search_time').val('month');
        $('#search_uids').val(app.login.userid);
        $('#search_stages').val('');
        $('#search_disp_type').val('');
        $('#sc_search_workitem_name').val('');
    };
    StationCompSearch.prototype.showPanel = function() {
        if (!_self.addOptions) {
            _self.addOptions = true;
            var stages = _self.parent.stage_info;
            var options = '';
            for (var stage_name in stages) {
                options += '<option value=' + stage_name + '>'+stages[stage_name]+'</option>';
            }
            $("#search_stages").html(options);
            var users = _self.parent.user_info;
            var options = '';
            for (var uid in users) {
                options += '<option value=' + uid + '>'+users[uid]+'</option>';
            }
            $("#search_uids").html(options);
        }
        var searchInfo = _self.parent.searchInfo;

        $("#search_stages option[value='"+searchInfo.stage+"']").attr("selected", "selected");
        $("#search_uids option[value='"+searchInfo.uid+"']").attr("selected", "selected");
        $("#search_disp_type option[value='"+searchInfo.disp_type+"']").attr("selected", "selected");
        $("#sc_search_workitem_name").val(searchInfo.workitem_name);
    };
    StationCompSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        searchInfo.time_end = $("#search_time").val();
        searchInfo.stage = $("#search_stages").val();
        searchInfo.uid = $("#search_uids").val();
        searchInfo.disp_type = $("#search_disp_type").val();
        searchInfo.workitem_name = $("#sc_search_workitem_name").val();
        _self.parent.refreshStationComp();
        app.utils.hideModal();
    };
    return new StationCompSearch();
});
