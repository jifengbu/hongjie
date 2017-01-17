define(function(require) {
	"use strict";
	var _self;

	function StationDispatchSearch() {
		_self = this;
		_self.id = "stationDispatchSearch";
	}
	
	StationDispatchSearch.prototype.show = function(parent) {
		_self.parent = parent;
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	StationDispatchSearch.prototype.onLoad = function() {
		_self.showPanel();
	};
    StationDispatchSearch.prototype.release = function() {
        _self.parent = null;
        _self.addOptions = null;
        $('#stds_search_filter_value').val('');
    };
	StationDispatchSearch.prototype.showPanel = function() {
        if (!_self.addOptions) {
            _self.addOptions = true;
            var stages = _self.parent.stage_info;
            var options = '';
            for (var stage_id in stages) {
                options += '<option value=' + stage_id + '>'+stages[stage_id]+'</option>';
            }
            $("#stds_search_stages").html(options);
        }
        var searchInfo = _self.parent.searchInfo;

        $("#stds_search_stages option[value='"+searchInfo.stage+"']").attr("selected", "selected");
        $("#stds_search_states option[value='"+searchInfo.state+"']").attr("selected", "selected");
        $("#stds_search_filters option[value='"+searchInfo.filter+"']").attr("selected", "selected");
        $("#stds_search_filter_value").val(searchInfo.filter_value);

	};
	StationDispatchSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        searchInfo.stage = $("#stds_search_stages").val();
        searchInfo.state = $("#stds_search_states").val();
        searchInfo.filter = $("#stds_search_filters").val();
        searchInfo.filter_value = $("#stds_search_filter_value").val();
        _self.parent.refreshStationDispatch();
		app.utils.hideModal();
	};
	return new StationDispatchSearch();
});
