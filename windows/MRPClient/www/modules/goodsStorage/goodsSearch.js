define(function(require) {
	"use strict";
    var _self;

    function GoodsSearch() {
        _self = this;
        _self.id = "goodsSearch";
    }

    GoodsSearch.prototype.show = function(parent) {
        _self.parent = parent;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft",loadfunc:_self.id+"=onLoad"});
    };
    GoodsSearch.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel();
        }
    };
    GoodsSearch.prototype.release = function() {
        _self.parent = null;
    };
    GoodsSearch.prototype.showPanel = function() {
        var searchInfo = _self.parent.searchInfo;

        _self.changeTimeOper(searchInfo.delivery_time.op);
        $("#gosh_time_op option[value='"+searchInfo.delivery_time.op+"']").attr("selected", "selected");
        $('#gosh_pn').val(searchInfo.pn||'');
        $('#gosh_part_no').val(searchInfo.part_no||'');
        $('#gosh_po').val(searchInfo.po||'');
        $('#gosh_customer').val(searchInfo.customer||'');
        $('#gosh_product_no').val(searchInfo.product_no||'');
        $('#gosh_qo_item_id').val(searchInfo.qo_item_id||'');
        $('#glsh_req').val(searchInfo.req||'');
    };
    GoodsSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        var type = $("#gosh_time_op").val();
        if(type == "between")
            searchInfo.delivery_time = {op:type,value:{value1:$("#gosh_time_1").val(),value2:$("#gosh_time_2").val()}};
        else{
            searchInfo.delivery_time = {op:type,value:{value1:$("#gosh_time_3").val()}};
        }

        searchInfo.pn = $("#gosh_pn").val();
        searchInfo.part_no = $("#gosh_part_no").val();
        searchInfo.po = $("#gosh_po").val();
        searchInfo.customer = $("#gosh_customer").val();
        searchInfo.product_no = $("#gosh_product_no").val();
        searchInfo.qo_item_id = $("#gosh_qo_item_id").val();
        searchInfo.req = $("#gosh_req").val();

        _self.parent.refreshItemWaitRecList();
        $.ui.goBack();
    };
    GoodsSearch.prototype.changeTimeOper = function(op) {
        var searchInfo = _self.parent.searchInfo;
        switch(op){
            case "":
                $("#gosh_time_between").hide();
                $("#gosh_time_other").hide();
                break;
            case "between":
                $("#gosh_time_1").val(searchInfo.delivery_time.value.value1);
                $("#gosh_time_2").val(searchInfo.delivery_time.value.value2);
                $("#gosh_time_between").show();
                $("#gosh_time_other").hide();
                break;
            default:
                $("#gosh_time_3").val(searchInfo.delivery_time.value.value1);
                $("#gosh_time_between").hide();
                $("#gosh_time_other").show();
        }
    };
    GoodsSearch.prototype.showPopMenu = function(el) {
        var d = el.value.split('-');
        navigator.utils.datePickerDialog(function(date){
            el.value = app.utils.dateToString(date);
        },d[0], d[1], d[2]);
    };
    return new GoodsSearch();
});
