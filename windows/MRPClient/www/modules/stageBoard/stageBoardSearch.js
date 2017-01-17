define(function(require) {
    "use strict";
    var _self;

    function StageBoardSearch() {
        _self = this;
        _self.id = "stageBoardSearch";
    }

    StageBoardSearch.prototype.show = function(parent) {
        _self.parent = parent;
        app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
    };
    StageBoardSearch.prototype.onLoad = function() {
        _self.showPanel();
    };
    StageBoardSearch.prototype.release = function() {
        _self.parent = null;
        _self.addOptions = null;
        $('#stdos_search_filter_value').val('');
    };
    StageBoardSearch.prototype.showPanel = function() {
        if (!_self.addOptions) {
            _self.addOptions = true;
            var stages = _self.parent.stage_info;
            var options = '';
            for (var stage_id in stages) {
                options += '<option value=' + stage_id + '>'+stages[stage_id]+'</option>';
            }
            $("#stdos_search_stages").html(options);
        }
        var searchInfo = _self.parent.searchInfo;

        $("#stdos_search_stages option[value='"+searchInfo.stage+"']").attr("selected", "selected");
        $("#stdos_search_states option[value='"+searchInfo.state+"']").attr("selected", "selected");
        $("#stdos_search_filters option[value='"+searchInfo.filter+"']").attr("selected", "selected");
        $("#stdos_search_filter_value").val(searchInfo.filter_value);

    };
    StageBoardSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        searchInfo.stage = $("#stdos_search_stages").val();
        searchInfo.state = $("#stdos_search_states").val();
        searchInfo.filter = $("#stdos_search_filters").val();
        searchInfo.filter_value = $("#stdos_search_filter_value").val();

        _self.parent.refreshStageBoard();
        app.utils.hideModal();
    };
    return new StageBoardSearch();
});
