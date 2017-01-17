define(function(require) {
	"use strict";
	var _self;
    var TYPES = ["总订单", "需发货", "已发货", "发票"];
    var TYPES_EN = ["order", "need_deliver", "deliver"];
    var KINDS = {fab:"F", part:"P", assemble:"A", unkown:"U"};
    var STATES = {pending:"等待", accepted:"接收", "In-Processing":"在制", processing:"在制", finished:"完成", "FQA":"FQA", "packaging":"包装", "delivered":"发货", "received":"收货", "closed":"关闭", "cancelled":"取消"};

	function OrderList() {
		_self = this;
		_self.id = "orderlist";
	}
	OrderList.prototype.show = function() {
        var date = new Date();
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate();

        _self.searchInfo = {time_type :'current_day', sales_man:'', sales_man_name:'全体销售人员'};
        _self.searchInfo.time_date = year+"-"+((month < 10)?"0"+month:month)+"-"+((day < 10)?"0"+day:day);
        var info = app.login.userInfo;
        if (info.priv_cat == "salesman") {
            _self.searchInfo.sales_man = app.login.username;
            _self.searchInfo.sales_man_name = info.user_name;
        }
		app.utils.loadPanel(_self.id, {footer:'none', transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
	};
	OrderList.prototype.onLoad = function() {
        if (!_self.data) {
            if (app.login.userInfo.priv_cat == "admin") {
                _self.getUserInfo();
            } else {
                _self.getOrderListList();
            }
        }
	};
    OrderList.prototype.onUnload = function() {
    };
    OrderList.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
        _self.searchInfo = null;
        require('orderDetail').release();
        require('orderSchedule').release();
        require('billDetail').release();
    };
	OrderList.prototype.formatDate = function(year, month, day) {
        return year+"-"+((month < 10)?"0"+month:month)+"-"+((day < 10)?"0"+day:day);
    };
	OrderList.prototype.showOrderListList = function() {
        var PURPLE = app.color.PURPLE,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            DIVH = '<div>',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        html += '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">业务员：'+PURPLE(_self.searchInfo.sales_man_name)+'</div>';
        html += '<div  class="center_div">统计时间从 '+GREEN(_self.searchInfo.start_time)+' 到 '+BLUE(_self.searchInfo.end_time)+'</div>';
        html += _self.getSummaryContent(0);

        html += '<li id="orderlist_page" style="min-height:70%">';
        html += '<div class="carousel_content">';
        html += '<table  width="100%"><tr><td>';
        html += '<a class="carousel selected" index="0"">'+TYPES[0]+'</a></td><td>';
        html += '<a class="carousel" index="1">'+TYPES[1]+'</a></td><td>';
        html += '<a class="carousel" index="2">'+TYPES[2]+'</a></td><td>';
        html += '<a class="carousel" index="3">'+TYPES[3]+'</a></td></tr></table>';
        html += '</div>';
        html += '<div id="orderlist_screen" style="text-align: center">'+_self.getItemContent(0)+'</div>';
        html += '</li>';

        //console.log(html);
        $('#pn_order_list').html(html);
        $("#orderlist_page").bind("swipeLeft",function(){
            var el = $(".carousel.selected");
            var index = el.attr("index")*1;
            index = (index+1)>3?0:index+1;
            $('.carousel[index="'+index+'"]').addClass("selected");
            el.removeClass("selected");
            _self.onShowPage(index);
        }).bind("swipeRight",function(){
            var el = $(".carousel.selected");
            var index = el.attr("index")*1;
            index = (index-1)<0?3:index-1;
            $('.carousel[index="'+index+'"]').addClass("selected");
            el.removeClass("selected");
            _self.onShowPage(index);
        });
        $(".carousel").bind("click", function(){
            var index = $(this).attr("index");
            $(".carousel.selected").removeClass("selected");
            $('.carousel[index="'+index+'"]').addClass("selected");
            _self.onShowPage(index);
        });
	};
    OrderList.prototype.showBillItems = function(type) {
        var ts = ["receivables", "has_receivables", "no_receivables"];
        var data = _self.data[ts[type]][_self.searchInfo.time_type]["item"];
        console.log(data);
        require('billDetail').show(data, type);
    };
    OrderList.prototype.getBillItem = function(data, type) {
        var RED = app.color.RED,
            PRICE_COLOR = app.color.PRICE_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            COUNT_COLOR = app.color.COUNT_COLOR,
            DIVH = '<div  style="text-align: left">',
            DIVT = '</div>',
            html = '';

        var arr = {};
        for (var key in data.currency_num) {
            arr[key] = {};
            arr[key]["nums"] = data.currency_num[key];
        }
        var item = (type)?data.pay_amount:data.total_charge;
        for (var key in item) {
            arr[key] = arr[key] || {};
            arr[key]["bill"] = item[key];
        }
        for (var key in arr) {
            var item = arr[key];
            html += DIVH+(key?key:"未知币种")+":"+COUNT_COLOR(item.nums)+'笔&nbsp;&nbsp;金额:'+PRICE_COLOR(item.bill)+DIVT;
        }
        return html;
    };
    OrderList.prototype.updateTimePeriod = function() {
        var start = _self.searchInfo.time_date,
            end = start;
        if (_self.searchInfo.time_type == "current_week") {
            var time = new Date(_self.searchInfo.time_date);
            time.setDate(time.getDate() - time.getDay() + 1);
            start = _self.formatDate(time.getFullYear(), time.getMonth()+1, time.getDate());
            time.setDate(time.getDate() + 6);
        } else if (_self.searchInfo.time_type == "curreny_month") {
            var d = _self.searchInfo.time_date.split("-");
            start = d[0]+"-"+d[1]+"-01";
        }
        _self.searchInfo.start_time = start;
        _self.searchInfo.end_time = end;
    };
    OrderList.prototype.getBillContent = function() {
        var DIVH = '<div style="text-align: left">',
            DIVT = '</div>',
            html = '';

        var receivables = _self.data["receivables"][_self.searchInfo.time_type]["all"]["summry"];
        var has_receivables = _self.data["has_receivables"][_self.searchInfo.time_type]["all"]["summry"];
        var no_receivables = _self.data["no_receivables"][_self.searchInfo.time_type]["all"]["summry"];
        var history = _self.data["no_receivables"][_self.searchInfo.time_type]["history"]["summry"];

        html += '<ul class="list inset">';
        html += '<li>';
        html += DIVH+app.color.RED(_self.searchInfo.start_time)+'之前未款：'+DIVT;
        html += _self.getBillItem(history);
        html += '</li>';
        html +='<li onclick="app.orderlist.showBillItems(0)"><a href="#">';
        html += DIVH+'应收款：'+DIVT;
        html += _self.getBillItem(receivables);
        html += '</a></li><li onclick="app.orderlist.showBillItems(1)"><a href="#">';
        html += DIVH+'已收款：'+DIVT;
        html += _self.getBillItem(has_receivables, true);
        html += '</a></li><li onclick="app.orderlist.showBillItems(2)"><a href="#">';
        html += DIVH+'未收款：'+DIVT;
        html += _self.getBillItem(no_receivables);
        html += '</a></li></ul>';

        return html;
    };
    OrderList.prototype.getSummaryContent = function(index) {
        var PRICE_COLOR = app.color.PRICE_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            COUNT_COLOR = app.color.COUNT_COLOR,
            RED = app.color.RED,
            html = '';

        if (!_self.data[TYPES_EN[index]][_self.searchInfo.time_type]) {
            return "<div>无</div>";
        }
        var data = _self.data[TYPES_EN[index]][_self.searchInfo.time_type]["all"]["summry"];
        html += '<div class="center_div" id="order_list_summary">'+COUNT_COLOR(data.nums)+'款&nbsp;'+AREA_COLOR(data.area)+'平米&nbsp;'+PRICE_COLOR((data.total_price==null)?data.total_price_sum:data.total_price)+RED(data.currency_unit?data.currency_unit:'RMB')+'</div>';

        return html;
    };
    OrderList.prototype.updateSummaryContent = function(index) {
        var PRICE_COLOR = app.color.PRICE_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            COUNT_COLOR = app.color.COUNT_COLOR,
            RED = app.color.RED,
            html = '';

        if (index == 3) {
            html = '';
        } else {
            if (!_self.data[TYPES_EN[index]][_self.searchInfo.time_type]) {
                html = "无";
            } else {
                var data = _self.data[TYPES_EN[index]][_self.searchInfo.time_type]["all"]["summry"];
                html += COUNT_COLOR(data.nums) + '款&nbsp;' + AREA_COLOR(data.area) + '平米&nbsp;' + PRICE_COLOR((data.total_price==null)?data.total_price_sum:data.total_price)+RED(data.currency_unit?data.currency_unit:'RMB');
            }
        }
        $("#order_list_summary").html(html);
    };
    OrderList.prototype.getStatus = function(item) {
        var state = item.order_status.status;
//        var state = "1.开料:100%, 2.烤板:100%, 3.内层印湿膜:100%, 4.酸性蚀刻:100%, 5.AOI测试:100%, 6.内层中检:0%, 7.外发压板:0%, 8.锣外围:0%, 9.烤板:0%, 10.钻孔:0%, 11.除胶渣:0%, 12.沉铜:0%, 13.整板镀铜:0%, 14.外层压干膜:0%, 15.脉冲电镀:0%, 16.退膜:0%, 17.外层蚀刻:0%, 18.退锡";
        if (/%/.test(state)) {
            var arr = state.split(',');
            for (var i=0,len=arr.length; i<len; i++){
                if (/100%/.test(arr[i])) {
                    return arr[i].replace(/.*\.(.*):.*/, "$1");
                }
            }
        }
        return STATES[state];
    };
    OrderList.prototype.getItemContent = function(index) {
        var RED = app.color.RED,
            GREEN = app.color.GREEN,
            PRICE_COLOR = app.color.PRICE_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            COUNT_COLOR = app.color.COUNT_COLOR,
            CC = app.color.GRAY,
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            WD0 = 'width="6%"',
            WD1 = 'width="4%"',
            WD2 = 'width="30%"',
            WD3 = 'width="15%"',
            WD4 = 'width="15%"',
            WD5 = 'width="20%"',
            WD6 = 'width="10%"',
            html = '';

        if (!_self.data[TYPES_EN[index]][_self.searchInfo.time_type]) {
            return "没有["+TYPES[index]+"]的订单";
        }

        var data = _self.data[TYPES_EN[index]][_self.searchInfo.time_type]["item"],
            type = _self.searchInfo.sort_type,
            asce = _self.searchInfo.sort_asce,
            icon_classes = ["down", "up"],
            classes = [];
        classes[type] = 'class="icon '+icon_classes[asce]+'"';

        html += '<table style="border:1px;color:inherit;width: 100%">';
        html += '<tr style="background-color:#D3D3D3;"><th '+WD0+'>序号</th><th '+WD1+' onclick="app.orderlist.sortData(0)" id="ord_th_0" '+classes[0]+'>类型</th><th '+WD2+' onclick="app.orderlist.sortData(1)" id="ord_th_1" '+classes[1]+'>订单号</th><th '+WD3+' onclick="app.orderlist.sortData(2)" id="ord_th_2"'+classes[2]+'>数量</th><th '+WD4+' onclick="app.orderlist.sortData(3)" id="ord_th_3"'+classes[3]+'>'+'面积(m<sup>2</sup>)</th><th '+WD5+' onclick="app.orderlist.sortData(4)" id="ord_th_4"'+classes[4]+'>'+'价格</th><th '+WD6+'>'+'状态</th></tr>';

        var arr = [];
        for (var key in data) {
            var item = data[key];
            item.order_id = key;
            arr.push(item);
        }
        var types = ["req", "pn", "quantity", "area", "total_price"];
        if (asce) {
            arr.sort(function (a, b) {
                var a1,b1;
                if (type<2) {
                    a1 = a[types[type]]+"-"+a["order_item_id"];
                    b1 = b[types[type]]+"-"+b["order_item_id"];
                } else {
                    a1 = a[types[type]]*1;
                    b1 = b[types[type]]*1;
                }
                return (a1>b1)?1:((a1==b1)?0:-1);
            });
        } else {
            arr.sort(function (a, b) {
                var a1,b1;
                if (type<2) {
                    a1 = a[types[type]]+"-"+a["order_item_id"];
                    b1 = b[types[type]]+"-"+b["order_item_id"];
                } else {
                    a1 = a[types[type]]*1;
                    b1 = b[types[type]]*1;
                }
                return (a1<b1)?1:((a1==b1)?0:-1);
            });
        }

        for (var i=0,len=arr.length; i<len; i++) {
            var item = arr[i];
            var background = (i&1)?"lightgray":"wheat";
            var kind = KINDS[item.req]||"U";

            html += '<tr style="background-color:'+background+'" onclick="app.orderlist.showDetail('+item.order_id+')">';
            html += '<td '+WD0+'>' + RED(i) + '</td>';
            html += '<td '+WD1+'>' + GREEN(kind)+ '</td>';
            html += '<td '+WD2+'>' + CC(item.pn+(item.order_item_id?'-'+item.order_item_id:''))+ '</td>';
            html += '<td '+WD3+'>' + COUNT_COLOR(item.quantity) + '</td>';
            html += '<td '+WD4+'>' + AREA_COLOR(item.area) + '</td>';
            html += '<td '+WD5+'>' + PRICE_COLOR(item.total_price) +RED(item.currency_unit)+ '</td>';
            html += '<td '+WD6+'>' + CC(_self.getStatus(item)) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
//        console.log(html);
        return html;
    };
    OrderList.prototype.onShowPage = function(index) {
        var html = (index==3)?_self.getBillContent():_self.getItemContent(index);
        _self.updateSummaryContent(index);
        $("#orderlist_screen").html(html);
    };
    OrderList.prototype.sortData = function(type) {
        if (_self.searchInfo.sort_type == type) {
            var el = $('#ord_th_'+type);
            var className = el.get(0).className;
            if (/up/.test(className)) {
                _self.searchInfo.sort_type = type;
                _self.searchInfo.sort_asce = 0;
            } else {
                _self.searchInfo.sort_type = type;
                _self.searchInfo.sort_asce = 1;
            }
        } else {
            _self.searchInfo.sort_type = type;
            _self.searchInfo.sort_asce = 1;
        }
        var el = $(".carousel.selected");
        var index = el.attr("index");
        _self.onShowPage(index);
    };
    OrderList.prototype.doSelectDate = function() {
        var d = _self.searchInfo.time_date.split("-");
        navigator.utils.datePickerDialog(function(date){
            var time_date = date.year+"-"+((date.month < 10)?"0"+date.month:date.month)+"-"+((date.day < 10)?"0"+date.day:date.day);
            $('#orderlist_date_show').val(time_date);
        }, d[0]*1, d[1]*1, d[2]*1);
    };
    OrderList.prototype.showSheetMenu = function() {
        var menus = [{
            text: '时间段',
            cssClasses: '',
            handler: function () {
                $.ui.actionsheetShow = false;
                _self.doSetDate();
            }
        }];
        if (app.login.userInfo.priv_cat == "admin") {
            menus.push({
                text: '业务员',
                cssClasses: '',
                handler: function () {
                    $.ui.actionsheetShow = false;
                    _self.doSetSalesMan();
                }
            });
        }
        app.utils.actionsheet = $("#afui").actionsheet(menus);
    };
    OrderList.prototype.doSetDate = function() {
        var html = '';
        html += '<table  width="100%" style="font: inherit;">';
        html += '<tr><td  width="40%">';
        html += '开始时间:';
        html += '</td><td>';
        html += '<select id="orderlist_search_time_type">';
        var item = {current_day:"当天", current_week:"当周周一", curreny_month:"当月月初"};
        for (var key in item) {
            var selected = (key == _self.searchInfo.time_type)?"selected":"";
            html += '<option value="'+key+'" '+selected+'>'+item[key]+'</option>';
        }
        html += '</select>';
        html += '</td></tr>';
        html += '<tr><td  width="40%">';
        html += '日期:';
        html += '</td><td>';
        if (_os == "windows") {
            html += '<input type="date" id="orderlist_date_show" value="'+_self.searchInfo.time_date+'" class="af-ui-forms" style="color:black;font:bold;">';
        } else {
            html += '<input id="orderlist_date_show" type="text" value="' + _self.searchInfo.time_date + '" readonly onclick="app.orderlist.doSelectDate()">';
        }
        html += '</td></tr>';
        html += '</table>';

        app.utils.popup({
            title: "查询",
            message: html,
            cancelText: "取消",
            cancelCallback: function () {
            },
            doneText: "查询",
            doneCallback: function () {
                _self.searchInfo.time_type = $("#orderlist_search_time_type").val();
                _self.searchInfo.time_date = $("#orderlist_date_show").val();
                _self.getOrderListList();
            },
            cancelOnly: false,
            addCssClass: 'wide'
        });
    };
    OrderList.prototype.doSetSalesMan = function() {
        var html = '';
        html += '<table  width="100%" style="font: inherit;">';
        html += '<tr><td  width="30%">';
        html += '业务员:';
        html += '</td><td>';
        html += '<select id="orderlist_sales_man">';
        var list = _self.sales_man_list;
        var selected = (_self.searchInfo.sales_man)?"":" selected";
        html += '<option value=""'+selected+'>所有</option>';
        for (var id in list) {
            var item = list[id];
            selected = (id == _self.searchInfo.sales_man)?" selected":"";
            var name = item.user_name.trim();
            name = (name.length)?name:item.email;
            html += '<option value="'+id+'"'+selected+'>'+name+'</option>';
        }
        html += '</select>';
        html += '</td></tr>';
        html += '</table>';

        app.utils.popup({
            title: "查询",
            message: html,
            cancelText: "取消",
            cancelCallback: function () {
            },
            doneText: "查询",
            doneCallback: function () {
                var id = $("#orderlist_sales_man").val();
                _self.searchInfo.sales_man_name = (id)?_self.sales_man_list[id].user_name:'全体销售人员';
                _self.searchInfo.sales_man = id;
                _self.getOrderListList();
            },
            cancelOnly: false,
            addCssClass: 'wide'
        });
    };
	//获取消息列表
	OrderList.prototype.getOrderListList = function() {
		if (!app.crm.checkToken(app.crm.OL_GET_LIST_OPER)) {
			_self.doGetOrderListList();
		}
	};
	OrderList.prototype.doGetOrderListList = function() {
		var param = {
			token:app.crm.access_token,
            time_type :_self.searchInfo.time_type,
            time_date : _self.searchInfo.time_date
        };
        if (_self.searchInfo.sales_man) {
            param.salesman_id = _self.searchInfo.sales_man;
        }
		var url = app.route.orderListUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetOrderListListSuccess
		});
	};
	OrderList.prototype.onGetOrderListListSuccess = function(data) {
		console.log(data);
        app.utils.clearWait();
		if (data.errcode) {
			app.utils.showError(data.errmsg);
			return;
		}
        _self.updateTimePeriod();
        _self.data = data;
        _self.showOrderListList();
	};
    //获取消息列表
    OrderList.prototype.getUserInfo = function() {
        if (!app.crm.checkToken(app.crm.OL_GET_USER_INFO_OPER)) {
            _self.doGetUserInfo();
        }
    };
    OrderList.prototype.doGetUserInfo = function() {
        var param = {
            token:app.crm.access_token,
            visible :"salesman"
        };
        var url = app.route.userInfoUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetUserInfoSuccess
        });
    };
    OrderList.prototype.onGetUserInfoSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (data.errcode) {
            app.utils.showError(data.errmsg);
            return;
        }
        _self.sales_man_list = data;
        _self.getOrderListList();
    };
    //获取订单详情
    OrderList.prototype.showDetail = function(order_id) {
        _self.searchInfo.select_id = order_id;
        _self.getOrderListDetail();
    };
    OrderList.prototype.getOrderListDetail = function() {
        if (!app.crm.checkToken(app.crm.OL_GET_DETAIL_OPER)) {
            _self.doGetOrderListDetail();
        }
    };
    OrderList.prototype.doGetOrderListDetail = function() {
        var param = {
            token:app.crm.access_token,
            item_id: _self.searchInfo.select_id,
            user_id: app.login.username
        };
        var url = app.route.orderListItemUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetOrderListDetailSuccess
        });
    };
    OrderList.prototype.onGetOrderListDetailSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (data.errcode) {
            app.utils.showError(data.errmsg);
            return;
        }
        require('orderDetail').show(data, _self.searchInfo.select_id);
    };

	return new OrderList();
});
