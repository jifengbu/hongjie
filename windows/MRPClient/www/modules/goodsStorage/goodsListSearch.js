define(function(require) {
	"use strict";
    var _self;

    function GoodsListSearch() {
        _self = this;
        _self.id = "goodsListSearch";
    }

    GoodsListSearch.prototype.show = function(parent) {
        _self.parent = parent;
        _self.loaded = false;
        app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft",loadfunc:_self.id+"=onLoad"});
    };
    GoodsListSearch.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.loaded) {
            _self.loaded = true;
            _self.showPanel();
        }
    };
    GoodsListSearch.prototype.release = function() {
        _self.parent = null;
    };
    GoodsListSearch.prototype.showPanel = function() {
        var searchInfo = _self.parent.searchInfo;

        _self.changeTimeOper(searchInfo.delivery_time.op);
        $("#glsh_time_op option[value='"+searchInfo.delivery_time.op+"']").attr("selected", "selected");
        $('#glsh_pn').val(searchInfo.pn||'');
        $('#glsh_part_no').val(searchInfo.part_no||'');
        $('#glsh_po').val(searchInfo.po||'');
        $('#glsh_customer_id').val(searchInfo.customer_id||'');
        $('#glsh_product_no').val(searchInfo.product_no||'');
        $('#glsh_customer_delivery').val(searchInfo.customer_delivery||'');
        $('#glsh_loca_code').val(searchInfo.loca_code||'');
        $('#glsh_country').val(searchInfo.country||'');
        $('#glsh_factory').val(searchInfo.factory||'');
        $('#glsh_req').val(searchInfo.req||'');
        $('#glsh_need_to_delivery').val(searchInfo.need_to_delivery||'');
        $('#glsh_has_stock').val(searchInfo.has_stock||'');
        $('#glsh_no_stock').val(searchInfo.no_stock||'');
        $('#glsh_has_customer_stock').val(searchInfo.has_customer_stock||'');
    };
    GoodsListSearch.prototype.doFilterSearch = function() {
        var searchInfo = _self.parent.searchInfo;
        var type = $("#glsh_time_op").val();
        if(type == "between")
            searchInfo.delivery_time = {op:type,value:{value1:$("#glsh_time_1").val(),value2:$("#glsh_time_2").val()}};
        else{
            searchInfo.delivery_time = {op:type,value:{value1:$("#glsh_time_3").val()}};
        }

        searchInfo.pn = $("#glsh_pn").val();
        searchInfo.part_no = $("#glsh_part_no").val();
        searchInfo.po = $("#glsh_po").val();
        searchInfo.customer_id = $("#glsh_customer_id").val();
        searchInfo.product_no = $("#glsh_product_no").val();
        searchInfo.customer_delivery = $("#glsh_customer_delivery").val();
        searchInfo.loca_code = $("#glsh_loca_code").val();
        searchInfo.country = $("#glsh_country").val();
        searchInfo.factory = $("#glsh_factory").val();
        searchInfo.req = $("#glsh_req").val();
        searchInfo.need_to_delivery = $("#glsh_need_to_delivery").prop('checked');
        searchInfo.has_stock = $("#glsh_has_stock").prop('checked');
        searchInfo.no_stock = $("#glsh_no_stock").prop('checked');
        searchInfo.has_customer_stock = $("#glsh_has_customer_stock").prop('checked');

        _self.parent.refreshItemStockList();
        $.ui.goBack();
    };
    GoodsListSearch.prototype.changeTimeOper = function(op) {
        var searchInfo = _self.parent.searchInfo;
        switch(op){
            case "":
                $("#glsh_time_between").hide();
                $("#glsh_time_other").hide();
                break;
            case "between":
                $("#glsh_time_1").val(searchInfo.delivery_time.value.value1);
                $("#glsh_time_2").val(searchInfo.delivery_time.value.value2);
                $("#glsh_time_between").show();
                $("#glsh_time_other").hide();
                break;
            default:
                $("#glsh_time_3").val(searchInfo.delivery_time.value.value1);
                $("#glsh_time_between").hide();
                $("#glsh_time_other").show();
        }
    };
    GoodsListSearch.prototype.showPopMenu = function(el) {
        var d = el.value.split('-');
        navigator.utils.datePickerDialog(function(date){
            el.value = app.utils.dateToString(date);
        },d[0], d[1], d[2]);
    };
    return new GoodsListSearch();
});
