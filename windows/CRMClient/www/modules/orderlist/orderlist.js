define(function(require) {
	"use strict";
	var _self;
	var PER_GET_PAGE_NUM = 20;
	
	function OrderList() {
		_self = this;
		_self.id = "orderlist";
		_self.data = [];
        _self.searchInfo = {time_type :'current_day'};
	}
	OrderList.prototype.show = function() {
        var date = new Date();
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate();

        _self.searchInfo.date = {year: year, month: month, day: day};
		app.utils.loadPanel(_self.id, {footer:'none', transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
	};
	OrderList.prototype.onLoad = function() {
        var scroller = $(app.utils.panelID(_self.id)).scroller();
        scroller.setRefreshContentPullDown(T("common.pull_down")+"...");
        scroller.setRefreshContentPullUp(T("common.pull_up")+"...");
        scroller.addPullToRefresh();
        scroller.runCB = true;
        scroller.upRefresh = true;
        _self.scroller = scroller;

        $.bind(scroller, "refresh-trigger", function () {
            _self.refresh_trigger = true;
        });
        $.bind(scroller, "refresh-cancel", function () {
            _self.refresh_trigger = false;
        });
        $.bind(scroller, "refresh-release", function () {
            var that = this;
            if (_self.refresh_trigger) {
                _self.refresh_trigger = false;
                _self.updateOrderListList();
            }
            setTimeout(function () {
                that.hideRefresh();
            }, 0);
            return false;
        });
        scroller.enable();
        app.setLanguageForPanel(_self.id);
         _self.updateOrderListList();
	};
    OrderList.prototype.onUnload = function() {
        var scroller = _self.scroller;
        $.unbind(scroller, "refresh-trigger");
        $.unbind(scroller, "refresh-cancel");
        $.unbind(scroller, "refresh-release");
    };
    OrderList.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = [];
        require('orderDetail').release();

    };
    OrderList.prototype.updateOrderListList = function() {
        _self.data = [];
        _self.getOrderListList();
        $('#pn_order_list').html('');
        $.ui.scrollToTop(app.utils.panelID(_self.id), 0);
    };
	OrderList.prototype.showSubData = function(data, html, DIVH, DIVT, LC, BLUE, RED) {
        for(var key in data) {
            var item = data[key];
            if ($.isObject(item)) {
                html += _self.showSubData(item, html, DIVH, DIVT, LC, BLUE, RED);
            } else {
                html += DIVH+LC(T("order."+key))+'： '+(item?BLUE(item):RED(T("common.none")))+DIVT;
            }
        }
        return html;
    };
	OrderList.prototype.showOrderListList = function(data) {
        var PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            WHITE = app.color.WHITE,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVH = '<div>',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        var cnt=0;
        if (data.has_receivables) {
            var id= "ol_type_info"+cnt;
            html += '<li>';
            html += '<h2 class="expanded" onclick="app.utils.showHide(this, \''+id+'\')" style="background-color:#D3D3D3;">'+T("order.has_receivables")+'</h2>';
            html += '<div id="'+id+'">';
            var item = data.has_receivables[_self.searchInfo.time_type]['summry'];
            for (var key in item) {
                var item1 = item[key];
                if (item1) {
                    html += DIVH + LC(T("order." + key)) + '： ' + (item1["2"] ? BLUE(item1["2"]) : RED(T("common.none"))) + DIVT;
                }
            }
            html += '</div>';
            html += '</li>';
            cnt++;
        }

        if (data.receivables) {
            var id= "ol_type_info"+cnt;
            html += '<li>';
            html += '<h2 class="expanded" onclick="app.utils.showHide(this, \''+id+'\')" style="background-color:#D3D3D3;">'+T("order.receivables")+'</h2>';
            html += '<div id="'+id+'">';
            var item = data.receivables[_self.searchInfo.time_type]['summry'];
            for (var key in item) {
                var item1 = item[key];
                if (item1) {
                    html += DIVH + LC(T("order." + key)) + '： ' + (item1["2"] ? BLUE(item1["2"]) : RED(T("common.none"))) + DIVT;
                }
            }
            html += '</div>';
            html += '</li>';
            cnt++;
        }

        for(var key in data){
            if (key == "has_receivables" || key == "receivables") {
                continue;
            }
            var id= "ol_type_info"+cnt;
            html += '<li>';
            html += '<h2 class="expanded" onclick="app.utils.showHide(this, \''+id+'\')" style="background-color:#D3D3D3;">'+T("order."+key)+'</h2>';
            html += '<div id="'+id+'">';
            var item = data[key][_self.searchInfo.time_type];
            if (item.single_layer && item.muiti_layer) {
                html += DIVCH+T('order.single_layer')+DIVT;
                html += _self.showSubData(item.single_layer, '', DIVH, DIVT, LC, BLUE, RED);
                html += DIVCH+T('order.muiti_layer')+DIVT;
                html += _self.showSubData(item.muiti_layer, '', DIVH, DIVT, LC, BLUE, RED);
            } else if (item.summry) {
                html += _self.showSubData(item.summry, '', DIVH, DIVT, LC, BLUE, RED);
            }
            html += '</div>';
            html += '</li>';
            cnt++;
        }
        //console.log(html);
        $('#pn_order_list').html(html);
	};
    OrderList.prototype.doSelectDate = function() {
        var d = _self.searchInfo.date;
        if (_os == "windows") {
            app.utils.popup_inst.remove();
        }
        navigator.utils.datePickerDialog(function(date){
            _self.searchInfo.date = date;
            if (_os == "windows") {
                _self.doSearch();
            } else {
                $('#orderlist_date_show').val();
            }
        }, d.year, d.month, d.day);
    };
    OrderList.prototype.doSearch = function() {
        var html = '';
        html += '<table  width="100%" style="font: inherit;">';
        html += '<tr><td  width="40%">';
        html += '日期:';
        html += '</td><td>';
        html += '<input id="orderlist_date_show" type="input" value="2014-01-03" readonly onclick="app.orderlist.doSelectDate()">';
        html += '</td></tr>';
        html += '<tr><td  width="40%">';
        html += '日期类型:';
        html += '</td><td>';
        html += '<select id="orderlist_search_states">';
        html += '<option value="0">本日</option>';
        html += '<option value="1">本周</option>';
        html += '<option value="2">本月</option>';
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
                _self.searchInfo = {};
                _self.searchInfo.state = $("#orderlist_search_states").val();
                _self.searchInfo.filter = $("#orderlist_search_filters").val();
                _self.searchInfo.filter_value = $("#orderlist_search_filter_value").val();
                _self.refreshgetOrderList();
            },
            cancelOnly: false,
            addCssClass: 'wide'
        });

        var si =  _self.searchInfo||{};
    };
	OrderList.prototype.onNetError = function(data, type) {
        _self.release();
		$.ui.goBack();
	};
	//获取消息列表
	OrderList.prototype.getOrderListList = function() {
		if (!app.crm.checkTokenTimeoutForOper(app.crm.GET_ORDER_LIST_OPER)) {
			_self.doGetOrderListList();
		}
	};
	OrderList.prototype.doGetOrderListList = function() {
		var param = {
			token:app.crm.access_token,
            time_type :_self.searchInfo.time_type
        };

		var url = app.route.orderListUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait(T("order.getting_order_list")+"...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetOrderListListSuccess,
			error : _self.onNetError
		});
	};
	OrderList.prototype.onGetOrderListListSuccess = function(data) {
		console.log(data);
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(data.errmsg);
			app.utils.clearWait();
			if (!data) {
				$('#pn_order_list').html("");
			}
			return;
		}
		_self.showOrderListList(data);
		app.utils.clearWait();
	};
	//获取消息详情
	OrderList.prototype.showOrderListDetail = function(id) {
		_self.select_order_id = id;
		_self.getOrderListDetail();
	};
	OrderList.prototype.getOrderListDetail = function() {
		if (!app.crm.checkTokenTimeoutForOper(_self.GET_ORDER_DETAIL_OPER)) {
			_self.doGetOrderListDetail();
		}
	};
	OrderList.prototype.doGetOrderListDetail = function() {
		var param = {
			token:_self.access_token,
            order_id:_self.select_order_id
		};
        var url = app.route.orderDetailUrl+"?"+ $.param(param);
        console.log(url);
		app.utils.setWait(T("order.getting_order_detail")+"...");
		console.log(app.route.orderDetailUrl+'?'+$.param(param));
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetOrderListDetailSuccess,
			error : _self.onNetError
		});
	};
	OrderList.prototype.onGetOrderListDetailSuccess = function(data) {
		if (data.errcode) {
			console.log(data.errcode+":"+data.errmsg);
			app.utils.showError(data.errmsg);
			app.utils.clearWait();
			return;
		}
		console.log(data);
		require('orderDetail').show(data);
		app.utils.clearWait();
	};
	return new OrderList();
});
