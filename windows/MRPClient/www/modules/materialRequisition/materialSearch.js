define(function(require) {
	"use strict";
	var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
	var MAX_PAGE_CACHE = 20;
	var PER_GET_PAGE_NUM = 10;

	var _self;
	function MaterialSearch() {
		_self = this;
		_self.id = "materialSearch";
	}

	MaterialSearch.prototype.show = function(data_list) {
		_self.data_list = data_list;
		_self.loaded = false;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	MaterialSearch.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		_self.scroller = app.utils.initialPullRefresh("#mash_list_content", {
			info: "下拉获取上一页",
			callback: _self.prePage
		}, {info: "上拉获取下一页", callback: _self.nextPage});

		$("#mash_search").val(_self.search_key||'');
		if (!_self.loaded) {
			_self.loaded = true;

			_self.info_list = [];
			_self.pageIndex = -1;
			_self.maxPageIndex = -1;
			_self.dir = INC_DIR;

			if (_self.pageIndex == -1) {
				_self.getPartInfo(0, PER_GET_PAGE_NUM);
			}
		} else {
			_self.showPartInfo(_self.pageIndex);
		}
	};
	MaterialSearch.prototype.onUnload = function () {
		app.utils.uninitialPullRefresh(_self.scroller);
	};
	MaterialSearch.prototype.release = function () {
		_self.showData = null;
		_self.info_list = null;
		_self.data_list = null;
	};
	MaterialSearch.prototype.refreshPartInfo = function() {
		_self.info_list = [];
		_self.pageIndex = -1;
		_self.maxPageIndex = -1;
		_self.dir = INC_DIR;
		_self.getPartInfo(0, PER_GET_PAGE_NUM);
	};
	//计算当前页的方法是total-tail
	//total = min(loaded+1, MAX_PAGE_CACHE)
	//tail = loaded+1-index
	//如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
	//如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
	MaterialSearch.prototype.onCurPage = function(data) {
		var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
		var tail = _self.loadedPageIndex+1-_self.pageIndex;
		var curIndex = total-tail;
		for (var i=0; i<data.length; i++) {
			_self.info_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
		}
		_self.showPartInfo(_self.pageIndex);
	};
	MaterialSearch.prototype.nextPage = function() {
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
			_self.showPartInfo(curIndex);
			return;
		}
		_self.getPartInfo(_self.pageIndex+1, PER_GET_PAGE_NUM);
	};
	MaterialSearch.prototype.onNextPage = function(data) {
		if (!data || data.length == 0) {
			if (_self.pageIndex == -1) {
				_self.showPartInfoWithNoData();
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
		_self.info_list = _self.info_list.concat(data);
		_self.loadedPageIndex = _self.pageIndex;
		if (_self.loadedPageIndex >= MAX_PAGE_CACHE) {
			_self.info_list  = _self.info_list.slice(PER_GET_PAGE_NUM);
		}
		var curIndex = Math.min(_self.loadedPageIndex, MAX_PAGE_CACHE-1);
		_self.showPartInfo(curIndex);
	};
	MaterialSearch.prototype.prePage = function() {
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
			_self.showPartInfo(curIndex);
			return;
		}
		_self.getPartInfo(_self.pageIndex-1, PER_GET_PAGE_NUM);
	};
	MaterialSearch.prototype.onPrePage = function(data) {
		_self.pageIndex--;
		_self.loadedPageIndex--;
		_self.info_list = data.concat(_self.info_list);
		_self.info_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
		_self.showPartInfo(0);
	};
	MaterialSearch.prototype.showPartInfoWithNoData = function() {
		_self.scroller.downRefresh = false;
		_self.scroller.upRefresh = false;

		$('#mash_list').html("无数据");
	};
	MaterialSearch.prototype.showPartInfo = function (pageIndex) {
		var PURPLE = app.color.PURPLE,
			BLUE = app.color.BLUE,
			LC = app.color.OLIVEDRAB,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			COUNT_COLOR = app.color.COUNT_COLOR,
			LIGHTBLUE = app.color.LIGHTBLUE,
			DARKOLIVEGREEN = app.color.DARKOLIVEGREEN,
			STEELBLUE = app.color.STEELBLUE,
			CC = app.color.GRAY,
			DIVH = '<div style="margin-bottom: 6px;">',
			DIVCH = '<div style="margin-bottom: 6px;text-align: center;">',
			DIVT = '</div>',
			stageType = app.route.stageType,
			space = '&nbsp;&nbsp;&nbsp;&nbsp;',
			html = '';

		var info_list;
		if (pageIndex == -1) {
			info_list = _self.showData;
		} else {
			info_list = _self.info_list.slice(pageIndex*PER_GET_PAGE_NUM, (pageIndex+1)*PER_GET_PAGE_NUM);
			_self.showData = info_list;
		}

		_self.scroller.upRefresh = (_self.pageIndex>0);
		_self.scroller.downRefresh = (_self.pageIndex*PER_GET_PAGE_NUM+info_list.length<_self.totalInfo.count);

		html += DIVCH+LC('总条数:')+GREEN(_self.totalInfo.count)+'('+(_self.pageIndex*PER_GET_PAGE_NUM+1)+'-'+(_self.pageIndex*PER_GET_PAGE_NUM+info_list.length)+')'+DIVT;

		var startIndex = _self.pageIndex*PER_GET_PAGE_NUM+1;
		var len=info_list.length;
		for (var i=0, len=info_list.length; i<len; i++) {
			var item = info_list[i];
			var style = '';
			if (_.filter(_self.data_list, function(data){return item.part_id== data.part_id&& item.myro_name==data.myro_name}).length) {
				style = ' style="background-color:#FFB5C5"';
				console.log(style);
			}

			html += '<li onclick="app.materialSearch.selectToApply(this, '+i+');event.stopPropagation();"'+style+'>';
			html += '<div style="word-break: break-all">' + RED(i+startIndex) + ':&nbsp;'+PURPLE(item.part_id)+'('+BLUE(item.my_model)+(item.myro_name?(':'+STEELBLUE(item.myro_name)):'')+')</div>';
			html += '<div style="word-break: break-all">' +LC("物料类型：")+ DARKOLIVEGREEN(item.material_type) +space+ LC("元件类型：")+ STEELBLUE(item.category) + '</div>';
			html += '<div style="word-break: break-all">' +LC("描述：")+ LIGHTBLUE(item.description) + '</div>';
			html += '<div>数量:&nbsp;' + CC(item.ours_amount_in_stock)+(item.unit?('('+COUNT_COLOR(item.qty_unit_name)+ ')'):'')+'</div>';
			html += '</li>';
		}
		//console.log(html);
		$('#mash_list').html(html);
		if (_self.dir == DEC_DIR) {
			_self.scroller.scrollToBottom(1000);
		} else {
			setTimeout(function(){
				_self.scroller.scrollToTop(1000);
			}, 100);
		}
	};
	MaterialSearch.prototype.selectToApply = function (el, index) {
		var data = _self.showData[index];
		el = $(el);
		var flag = el.attr("data-flag")*1;
		if (flag) {
			el.attr("data-flag", 0);
			el.css("background-color", "");
			_self.data_list = _.reject(_self.data_list, function(item){return item.part_id== data.part_id&& item.myro_name==data.myro_name});
		} else {
			el.attr("data-flag", 1);
			el.css("background-color", "#FFB5C5");
			_self.data_list.push(data);
		}
	};
	MaterialSearch.prototype.doSearchFromKeyBoard = function (el, e) {
		if (e.which==13 || e.keyCode==13) {
			_self.doSearch();
			el.blur();
		}
	};
	MaterialSearch.prototype.doSearch = function () {
		_self.search_key = $("#mash_search").val();
		_self.refreshPartInfo();
	};
	MaterialSearch.prototype.doSelect = function () {
		console.log(_self.data_list);
		app.materialRequisition.data_list = _self.data_list;
		app.materialRequisition.showPartInfo();
		$.ui.goBack();
	};
	MaterialSearch.prototype.getPartInfo = function (pageNum, num) {
		var start = pageNum+1;
		var param = {
			token: app.crm.token,
			page:start,
			record:num,
			search_key: _self.search_key||''
		};
		var url = app.route.crmGetPartInfo+"?"+ $.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetPartInfoSuccess
		});
	};
	MaterialSearch.prototype.onGetPartInfoSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		if (_self.maxPageIndex == -1) {
			_self.totalInfo = {};
			_self.totalInfo.count = data.total_records*1;
			_self.maxPageIndex = Math.floor((data.total_records*1-1)/PER_GET_PAGE_NUM);
		}
		if (_self.dir == DEC_DIR) {
			_self.onPrePage(data.part_info);
		} else if (_self.dir == INC_DIR) {
			_self.onNextPage(data.part_info);
		} else {
			_self.onCurPage(data.part_info);
		}
	};

	return new MaterialSearch();
});
