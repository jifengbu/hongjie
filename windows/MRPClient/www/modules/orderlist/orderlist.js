define(function(require) {
	"use strict";
	var _self;
	var DEC_DIR = 0, INC_DIR = 1;
	var MAX_PAGE_CACHE = 5;
	var PER_GET_PAGE_NUM = 5;
    var COLOR_MAP = {
        "黄色":"yellow",
        "绿色":"green",
        "深绿":"darkgreen",
        "浅绿":"lightgreen",
        "红色":"red",
        "蓝色":"blue",
        "紫色":"purple",
        "黑色":"black"
    };
    var STATES = ["open", "plan", "assigned", "inprogress", "canceled", "finished", "closed","planned"];
    var FILTERS = ["pn", "customer_id", "project_name", "factory_self_no","work_item_name"];
    var search_filters = ["订单号:","客户ID:","客户型号:","本厂编号:","加工对象号:"];
    var order_status = ["打开","计划","已分配","加工中","取消","完成","关闭"];

    function Orderlist() {
		_self = this;
		_self.id = "orderlist";
	}
	
	Orderlist.prototype.show = function() {
        _self.searchInfo = {};
        _self.orderList = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;

		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
	};
	Orderlist.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        _self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});

        if (_self.pageIndex == -1) {
            _self.getOrderList(0, PER_GET_PAGE_NUM);
        }
	};
    Orderlist.prototype.onUnload = function() {
        app.utils.uninitialPullRefresh(_self.scroller);
    };
    Orderlist.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.loaded = false;
        _self.orderList = null;
        _self.totalInfo = null;
        _self.searchInfo = null;
        app.scheduleDetail&&app.scheduleDetail.release();
        app.paramDetail&&app.paramDetail.release();

    };
    Orderlist.prototype.refreshgetOrderList = function() {
        _self.orderList = [];
        _self.pageIndex = -1;
        _self.maxPageIndex = -1;
        _self.dir = INC_DIR;
        _self.getOrderList(0, PER_GET_PAGE_NUM);
    };
	Orderlist.prototype.doSearch = function() {
        var html = '';
        var si =  _self.searchInfo||{};
        //var filter_value = si.//.filter_value == "undefined" ? "" : si.filter_value;
        html += '<table  width="100%" style="font: inherit;">';
        html += '<tr><td width="40%">';
        html += '<select id="orderlist_search_filters">';
        for(var i in search_filters){
            var select = (i==si.filter)?'selected="selected"':'';
            html += '<option value="'+i+'"'+select+'>'+search_filters[i]+'</option>';
        }
        /*html += '<option value="0">订单号:</option>';
        html += '<option value="1">客户ID:</option>';
        html += '<option value="2">客户型号:</option>';
        html += '<option value="3">本厂编号:</option>';
        html += '<option value="4">加工对象号:</option>';*/
        html += '</select>';
        html += '</td><td width="60%"><input id="orderlist_search_filter_value" type="text" ></td></tr>';
        html += '<tr><td>';
        html += '状态:';
        html += '</td><td>';
        html += '<select id="orderlist_search_states">';
        for(var i in order_status){
            var select = (i==si.state)?'selected="selected"':'';
            html += '<option value="'+i+'"'+select+'>'+order_status[i]+'</option>';
        }

        /*html += '<option value="0">打开</option>';
        html += '<option value="1">计划</option>';
        html += '<option value="2">已分配</option>';
        html += '<option value="3">加工中</option>';
        html += '<option value="4">取消</option>';
        html += '<option value="5">完成</option>';
        html += '<option value="6">关闭</option>';*/
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

        //var si =  _self.searchInfo||{};
        //$("#orderlist_search_filters option[value='"+si.filter+"']").attr("selected", "selected");
        //$("#orderlist_search_states option[value='"+si.state+"']").attr("selected", "selected");
        $("#orderlist_search_filter_value").val(si.filter_value);
    };
	Orderlist.prototype.nextPage = function() {
        if (_self.pageIndex == -1) {
            app.utils.toast("没有更多的数据了");
            return;
        }
		if (_self.pageIndex == _self.maxPageIndex) {
			app.utils.toast("已经是最后一页了");
			return;
		}
        _self.dir = INC_DIR;
		if (_self.pageIndex < _self.loadedPageIndex) {
			_self.pageIndex++;
            var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
            var tail = _self.loadedPageIndex+1-_self.pageIndex;
            var curIndex = total-tail;
			_self.showOrderList(curIndex);
			return;
		}
		_self.getOrderList(_self.pageIndex+1, PER_GET_PAGE_NUM);
	};
	Orderlist.prototype.onNextPage = function(data) {
		if (!data || data.length == 0) {
            if (_self.pageIndex == -1) {
                app.utils.toast("没有相关数据");
            } else {
                _self.maxPageIndex = _self.pageIndex;
                app.utils.toast("已经是最后一页了");
            }
			return;
		}
		_self.pageIndex++;
		if (data.length < PER_GET_PAGE_NUM) {
            _self.total_count = _self.pageIndex*PER_GET_PAGE_NUM+data.length;
			_self.maxPageIndex = _self.pageIndex;
		}
		
		_self.orderList = _self.orderList.concat(data);
		_self.loadedPageIndex = _self.pageIndex;
		if (_self.loadedPageIndex >= MAX_PAGE_CACHE) {
			_self.orderList  = _self.orderList.slice(PER_GET_PAGE_NUM);
		}
		var curIndex = Math.min(_self.loadedPageIndex, MAX_PAGE_CACHE-1);
		_self.showOrderList(curIndex);
	};
	Orderlist.prototype.prePage = function() {
        if (_self.pageIndex == -1) {
            app.utils.toast("没有更多的数据了");
            return;
        }
		if (_self.pageIndex == 0) {
			app.utils.toast("已经是第一页了");
			return;
		}
        _self.dir = DEC_DIR;
        var tail = _self.loadedPageIndex+1-_self.pageIndex;
        if (MAX_PAGE_CACHE > tail) {
            _self.pageIndex--;
            var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
            tail = _self.loadedPageIndex+1-_self.pageIndex;
            var curIndex = total-tail;
            _self.showOrderList(curIndex);
			return;
		}
		_self.getOrderList(_self.pageIndex-1, PER_GET_PAGE_NUM);
	};
	Orderlist.prototype.onPrePage = function(data) {
		_self.pageIndex--;
		_self.loadedPageIndex--;
		_self.orderList = data.concat(_self.orderList);
		_self.orderList.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
		_self.showOrderList(0);
	};
	Orderlist.prototype.showOrderList = function(pageIndex) {
        var PURPLE = app.color.PURPLE,
            RED = app.color.RED,
            WHITE = app.color.WHITE,
            BLUE = app.color.BLUE,
            GREEN = app.color.GREEN,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            SP = app.utils.SP,
            TDH = '<table width="100%" style="border-spacing:0px;color: inherit;font: inherit;"><tr><td><div>',
            TDT = '</div></td></tr></table>',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVH = '<div>',
            DIVT = '</div>',
            html = '',
            data = _self.orderList.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);

        _self.scroller.upRefresh = (_self.pageIndex>0);
        _self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data.length<_self.total_count);
        html += '<li>';
        html += DIVCH+LC('定单款数：')+GREEN(_self.total_count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data.length)+')'+DIVT;

        html += DIVH+LC("未加工：")+GREEN(_self.totalInfo.total_open)+'/'+RED(_self.totalInfo.total_open_area)+DIVT;
        html += DIVH+LC("加工中：")+GREEN(_self.totalInfo.total_in)+'/'+RED(_self.totalInfo.total_in_area)+DIVT;
        html += DIVH+LC("当日完成：")+GREEN(_self.totalInfo.total_comp)+'/'+RED(_self.totalInfo.total_comp_area)+DIVT;
        html += '</li>';
        for (var i=0,len=data.length; i<len; i++) {
            var item = data[i];
            html += '<li>';
            html += TDH+LC('订单号：')+CC(item.pn)+SP(2)+LC('版本：')+CC(item.version)+TDT;
            html += TDH+LC('订单数量：')+GREEN(item.qty)+RED("PCS")+SP(2)+LC('总面积:')+GREEN(item.area)+TDT;
            html += TDH+LC('材料：')+BLUE(item.layers)+SP(2)+GREEN(item.material)+SP(2)+PURPLE(item.material_thickness)
            +TDT;

            html += TDH;
            var color1 = COLOR_MAP[item.lpi_color];
            if (color1) {
                html += '<span style="background-color:'+color1+';">'+WHITE(item.lpi_color+'阻焊')+'</span>';
            } else {
                html += CC(item.lpi_color+'阻焊');
            }
            html += SP(2)+CC(item.mask)+SP(2);
            var color2 = COLOR_MAP[item.silkscreen_color];
            if (color2) {
                html += '<span style="background-color:'+color2+';">'+WHITE(item.silkscreen_color+'字符')+'</span>';
            } else {
                html += CC(item.silkscreen_color+'字符');
            }
            html += TDT;

            html += TDH+LC('状态：')+CC(item.status)+SP(2)+LC('交期:')+RED(item.expected_time)+TDT;
            html += TDH+LC('客户ID：')+CC(item.customer_id)+SP(2)+LC('客户型号：')+CC(item.project_name)+TDT;
            html += TDH+LC('本厂编号：')+CC(item.factory_self_no)+TDT;
            html +=  app.utils.buttonHtml([
                {text:'详细参数', click:'app.orderlist.showDetailParam('+i+', '+pageIndex+')'},
                {text:'详细进度', click:'app.orderlist.showDetailSchedule('+i+', '+pageIndex+')'}
            ]);
        }
        //console.log(html);
		$('#uworderlist').html(html);
        if (_self.dir == DEC_DIR) {
            $.ui.scrollToBottom(app.utils.panelID(_self.id), 1000);
        } else {
            setTimeout(function(){
                $.ui.scrollToTop(app.utils.panelID(_self.id), 1000);
            }, 100);
        }
	};
	Orderlist.prototype.getOrderList = function(pageNum, num) {
		var start = pageNum*PER_GET_PAGE_NUM;
        var param = {
            uid: app.login.userid,
            start:start,
            limit:num
        };
        if (_self.searchInfo.state) {
            param.order_status = STATES[_self.searchInfo.state];
        }
        if (_self.searchInfo.filter_value) {
            param.search_key = FILTERS[_self.searchInfo.filter];
            param.search_value = _self.searchInfo.filter_value;
        }
        console.log(param);
		var url = app.route.orderlistUrl+'?'+ $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetOrderListSuccess,
			error : _self.onGetOrderListError
		});
	};
	Orderlist.prototype.onGetOrderListSuccess = function(data) {
		console.log(data);
		if (_self.maxPageIndex == -1) {
            _self.totalInfo = {};
            for (var key in data) {
                if (key != 'orders') {
                    _self.totalInfo[key] = data[key];
                }
            }
            _self.total_count = data.total_count;
			_self.maxPageIndex = Math.floor((data.total_count-1)/PER_GET_PAGE_NUM);
		}
		if (_self.dir == DEC_DIR) {
			_self.onPrePage(data.orders);
		} else {
			_self.onNextPage(data.orders);
		}
		app.utils.clearWait();
	};
	Orderlist.prototype.onGetOrderListError = function(data, type) {
		if (_self.pageIndex == -1) {
            _self.release();
			$.ui.goBack();
		}
	};
	Orderlist.prototype.showDetailParam = function(index, pageIndex) {
        index = index + pageIndex * PER_GET_PAGE_NUM;
        var order = _self.orderList[index];
        var param = {
            uid: app.login.userid,
            id:order.id,
            item_id:order.item_id
        };
        console.log(param);
        var url = app.route.orderlistParamDetailUrl + '?' + $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetOrderListParamDetailSuccess
		});
	};
	Orderlist.prototype.onGetOrderListParamDetailSuccess = function(data) {
		console.log(data);
		if (!data.success) {
			app.utils.showError(app.error.DATA_ERROR);
		} else {
			var paramDetail = require('paramDetail');
			paramDetail.show(data.detail_info);
		}
		app.utils.clearWait();
	};
	Orderlist.prototype.showDetailSchedule = function(index, pageIndex) {
        index = index + pageIndex * PER_GET_PAGE_NUM;
        var order = _self.orderList[index];
        _self.curOrder = order;
        var param = {
            uid: app.login.userid,
            id:order.id,
            item_id:order.item_id
        };
        console.log(param);
		var url = app.route.orderlistScheduleDetailUrl + '?' + $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetOrderListScheduleDetailSuccess
		});
	};
	Orderlist.prototype.onGetOrderListScheduleDetailSuccess = function(data) {
		console.log(data);
		if (!data.success) {
			app.utils.showError(app.error.DATA_ERROR);
		} else {
			var scheduleDetail = require('scheduleDetail');
            var order = _self.curOrder;
            _self.curOrder = null;
			scheduleDetail.show(data, order);
		}
		app.utils.clearWait();
	};
	return new Orderlist();
});
