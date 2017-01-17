define(function(require) {
	"use strict";
	var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
	var MAX_PAGE_CACHE = 20;
	var PER_GET_PAGE_NUM = 10;

	var _self;
	function GoodsStorageList() {
		_self = this;
		_self.id = "goodsStorageList";
	}

	GoodsStorageList.prototype.show = function() {
		_self.searchInfo = {
			delivery_time:{op:"",value:{value1:$.dateFormat(new Date(),"yyyy-MM")+"-01",value2:$.dateFormat(new Date(),"yyyy-MM-dd")}}
		};

		_self.data_list = [];
		_self.applyData = [];
		_self.pageIndex = -1;
		_self.maxPageIndex = -1;
		_self.dir = INC_DIR;

		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	GoodsStorageList.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		_self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});
		if (!_self.loaded) {
			_self.loaded = true;
			if (_self.pageIndex == -1) {
				_self.getItemStockList(0, PER_GET_PAGE_NUM);
			}
		}
	};
	GoodsStorageList.prototype.onUnload = function () {
		app.utils.uninitialPullRefresh(_self.scroller);
	};
	GoodsStorageList.prototype.release = function () {
		_self.searchInfo = null;
		_self.showData = null;
		app.goodsListSearch && app.goodsListSearch.release();
	};
	GoodsStorageList.prototype.refreshItemStockList = function() {
		_self.data_list = [];
		_self.applyData = [];
		_self.pageIndex = -1;
		_self.maxPageIndex = -1;
		_self.dir = INC_DIR;
		_self.getItemStockList(0, PER_GET_PAGE_NUM);
	};
	//计算当前页的方法是total-tail
	//total = min(loaded+1, MAX_PAGE_CACHE)
	//tail = loaded+1-index
	//如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
	//如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
	GoodsStorageList.prototype.onCurPage = function(data) {
		var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
		var tail = _self.loadedPageIndex+1-_self.pageIndex;
		var curIndex = total-tail;
		for (var i=0; i<data.length; i++) {
			_self.data_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
		}
		_self.showItemStockList(_self.pageIndex);
	};
	GoodsStorageList.prototype.nextPage = function() {
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
			_self.showItemStockList(curIndex);
			return;
		}
		_self.getItemStockList(_self.pageIndex+1, PER_GET_PAGE_NUM);
	};
	GoodsStorageList.prototype.onNextPage = function(data) {
		if (!data || data.length == 0) {
			if (_self.pageIndex == -1) {
				_self.showItemStockListWithNoData();
			} else {
				_self.maxPageIndex = _self.pageIndex;
				app.utils.toast("已经是最后一页了");
			}
			return;
		}
		_self.pageIndex++;
		if (data.length < PER_GET_PAGE_NUM) {
			_self.maxPageIndex = _self.pageIndex;
		}
		_self.data_list = _self.data_list.concat(data);
		_self.loadedPageIndex = _self.pageIndex;
		if (_self.loadedPageIndex >= MAX_PAGE_CACHE) {
			_self.data_list  = _self.data_list.slice(PER_GET_PAGE_NUM);
		}
		var curIndex = Math.min(_self.loadedPageIndex, MAX_PAGE_CACHE-1);
		_self.showItemStockList(curIndex);
	};
	GoodsStorageList.prototype.prePage = function() {
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
			_self.showItemStockList(curIndex);
			return;
		}
		_self.getItemStockList(_self.pageIndex-1, PER_GET_PAGE_NUM);
	};
	GoodsStorageList.prototype.onPrePage = function(data) {
		_self.pageIndex--;
		_self.loadedPageIndex--;
		_self.data_list = data.concat(_self.data_list);
		_self.data_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
		_self.showItemStockList(0);
	};
	GoodsStorageList.prototype.showItemStockListWithNoData = function() {
		_self.scroller.downRefresh = false;
		_self.scroller.upRefresh = false;

		$('#gostl_list').html("无数据");
	};
	GoodsStorageList.prototype.showItemStockList = function (pageIndex) {
		var PURPLE = app.color.PURPLE,
			BLUE = app.color.BLUE,
			LC = app.color.OLIVEDRAB,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			COUNT_COLOR = app.color.COUNT_COLOR,
			CC = app.color.GRAY,
			DIVH = '<div style="margin-bottom: 6px;">',
			DIVCH = '<div style="margin-bottom: 6px;text-align: center;">',
			DIVT = '</div>',
			stageType = app.route.stageType,

			html = '';

		var data_list;
		if (pageIndex == -1) {
			data_list = _self.showData;
		} else {
			data_list = _self.data_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
			_self.showData = data_list;
		}

		_self.scroller.upRefresh = (_self.pageIndex>0);
		_self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+data_list.length<_self.totalInfo.count);

		html += DIVCH+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+data_list.length)+')'+DIVT;

		var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
		var len=data_list.length;
		for (var i=0, len=data_list.length; i<len; i++) {
			var item = data_list[i];
			html += '<li>';
			html += '<a href="#" onclick="app.goodsStorageList.showDetail('+i+');">';
			html += '<div style="word-break: break-all">' + RED(i+startIndex) + ':&nbsp;'+GREEN(item.order_name)+'&nbsp;['+PURPLE(item.req)+']'+'</div>';
			html += '<div>'+CC('数量：')+'['+'需:'+PURPLE(item.required_quantity||0)+'|产:'+BLUE(item.produced_quantity||0)+'|存:'+GREEN(item.stock_quantity||0)+'|收:'+LC(item.only_receive||0)+'|出:'+RED(item.outstock_quantity||0)+']</div>';
			html += '<div>'+CC('仓库：')+BLUE(item.depot_name)+'&nbsp;&nbsp;'+CC('客户：')+GREEN(item.customer_id)+'</div>';
			html += '</a>';
			html += '</li>';
		}
		//console.log(html);
		$('#gostl_list').html(html);
		if (_self.dir == DEC_DIR) {
			_self.scroller.scrollToBottom(1000);
		} else {
			setTimeout(function(){
				_self.scroller.scrollToTop(1000);
			}, 100);
		}
	};
	GoodsStorageList.prototype.doSearch = function () {
		require('goodsListSearch').show(_self);
	};
	GoodsStorageList.prototype.getItemStockList = function (pageNum, num) {
		var start = pageNum*PER_GET_PAGE_NUM;
		var param = {
			from:start,
			len:num
		};
		_self.maxPageIndex == -1&&(param.has_total = 1);
		var url = app.route.crmGetItemStockList+"?"+ $.param(param);
		console.log(url);

		var data = {};
		var searchInfo = _self.searchInfo;
		searchInfo.pn && (data.pn = searchInfo.pn);
		searchInfo.part_no && (data.part_no = searchInfo.part_no);
		searchInfo.po && (data.po = searchInfo.po);
		searchInfo.customer_id && (data.customer_id = searchInfo.customer_id);
		searchInfo.product_no && (data.product_no = searchInfo.product_no);
		searchInfo.customer_delivery && (data.customer_delivery = searchInfo.customer_delivery);
		searchInfo.loca_code && (data.loca_code = searchInfo.loca_code);
		searchInfo.country && (data.country = searchInfo.country);
		searchInfo.factory && (data.factory = searchInfo.factory);
		searchInfo.req && (data.req = searchInfo.req);
		searchInfo.need_to_delivery && (data.need_to_delivery = searchInfo.need_to_delivery);
		searchInfo.has_stock && (data.has_stock = searchInfo.has_stock);
		searchInfo.no_stock && (data.no_stock = searchInfo.no_stock);
		searchInfo.has_customer_stock && (data.has_customer_stock = searchInfo.has_customer_stock);
		if (searchInfo.delivery_time.op) {
			data.filter_date = searchInfo.delivery_time.op;
			data.date_begin = searchInfo.delivery_time.value1;
			data.date_end = searchInfo.delivery_time.value2;
		}
		console.log(data);

		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(data),
			success: _self.onGetItemStockListSuccess
		});
	};
	GoodsStorageList.prototype.onGetItemStockListSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		if (_self.maxPageIndex == -1) {
			_self.totalInfo = {};
			_self.totalInfo.count = data.tot*1;
			_self.maxPageIndex = Math.floor((data.tot*1-1)/PER_GET_PAGE_NUM);
		}
		if (_self.dir == DEC_DIR) {
			_self.onPrePage(data.list);
		} else if (_self.dir == INC_DIR) {
			_self.onNextPage(data.list);
		} else {
			_self.onCurPage(data.list);
		}
	};
	GoodsStorageList.prototype.showDetail = function (index) {
		require('goodsStorageListDetail').show(_self.showData[index]);
	};

	return new GoodsStorageList();
});
