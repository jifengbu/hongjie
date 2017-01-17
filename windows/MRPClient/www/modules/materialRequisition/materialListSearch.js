define(function(require) {
	"use strict";
    var _self;

    function MaterialListSearch() {
        _self = this;
        _self.id = "materialListSearch";
    }

    MaterialListSearch.prototype.show = function(parent) {
        _self.parent = parent;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft",loadfunc:_self.id+"=onLoad"});
    };
    MaterialListSearch.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel();
        }
    };
    MaterialListSearch.prototype.release = function() {
        _self.parent = null;
    };
    MaterialListSearch.prototype.showPanel = function() {
        var searchInfo = _self.parent.searchInfo;
        $('#mtls_app_number').val(searchInfo.app_number||'');
        $('#mtls_use_branch').val(searchInfo.use_branch||'');
        $('#mtls_purpose_comment').val(searchInfo.purpose_comment||'');
        $('#mtls_factory_name').val(searchInfo.factory_name||'');
        $('#mtls_operator_time').val(searchInfo.operator_time||$.dateFormat(new Date(),"yyyy-MM-dd"));
        $('#mtls_part_id').val(searchInfo.part_id||'');
        $('#glsh_part_name').val(searchInfo.part_name||'');
        $('#mtls_status').val(searchInfo.status||'pengding');
        $('#glsh_value').val(searchInfo.value||'');
    };
    MaterialListSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        searchInfo.app_number = $("#mtls_app_number").val();
        searchInfo.use_branch = $("#mtls_use_branch").val();
        searchInfo.purpose_comment = $("#mtls_purpose_comment").val();
        searchInfo.factory_name = $("#mtls_factory_name").val();
        searchInfo.operator_time = $("#mtls_operator_time").val();
        searchInfo.part_id = $("#mtls_part_name").val();
        searchInfo.part_name = $("#mtls_part_name").val();
        searchInfo.status = $("#mtls_status").val();
        searchInfo.value = $("#mtls_value").val();

        console.log(searchInfo);
        _self.parent.refreshMaterialList();
        $.ui.goBack();
    };
    MaterialListSearch.prototype.showPopMenu = function(el) {
        var d = el.value.split('-');
        navigator.utils.datePickerDialog(function(date){
            el.value = app.utils.dateToString(date);
        },d[0], d[1], d[2]);
    };
    MaterialListSearch.prototype.clearDate = function() {
        $('#mtls_operator_time').val('');
    };
    return new MaterialListSearch();
});
