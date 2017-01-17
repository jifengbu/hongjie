define(function(require) {
	"use strict";
	var DEC_DIR = 0, INC_DIR = 1, REFRESH_DIR=2;
	var MAX_PAGE_CACHE = 20;
	var PER_GET_PAGE_NUM = 10;

	var _self;
	function MaterialList() {
		_self = this;
		_self.id = "materialList";
	}

	MaterialList.prototype.show = function(app_number_list) {
		_self.searchInfo = {};
		_self.data_list = [];
		_self.applyData = [];
		_self.pageIndex = -1;
		_self.maxPageIndex = -1;
		_self.loaded = false;
		_self.dir = INC_DIR;
		_self.app_number_list = app_number_list;

		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	MaterialList.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		_self.scroller = app.utils.initialPullRefresh(_self.id, {info:"下拉获取上一页", callback:_self.prePage}, {info:"上拉获取下一页", callback:_self.nextPage});
		if (!_self.loaded) {
			_self.loaded = true;
			if (_self.pageIndex == -1) {
				_self.getMaterialList(0, PER_GET_PAGE_NUM);
			}
		}
	};
	MaterialList.prototype.onUnload = function () {
		app.utils.uninitialPullRefresh(_self.scroller);
	};
	MaterialList.prototype.release = function () {
		_self.searchInfo = null;
		_self.showData = null;
		_self.data_list = null;
		_self.app_number_list = null;
		app.materialRequisition && app.materialRequisition.release();
		app.materialInvestigate && app.materialInvestigate.release();
		app.materialListDetail && app.materialListDetail.release();
		app.materialListSearch && app.materialListSearch.release();
		app.partDetail && app.partDetail.release();
	};
	MaterialList.prototype.refreshCurPage = function() {
		_self.dir = REFRESH_DIR;
		_self.getMaterialList(_self.pageIndex, PER_GET_PAGE_NUM);
	};
	MaterialList.prototype.refreshMaterialList = function() {
		_self.data_list = [];
		_self.applyData = [];
		_self.pageIndex = -1;
		_self.maxPageIndex = -1;
		_self.dir = INC_DIR;
		_self.getMaterialList(0, PER_GET_PAGE_NUM);
	};
	//计算当前页的方法是total-tail
	//total = min(loaded+1, MAX_PAGE_CACHE)
	//tail = loaded+1-index
	//如[0,1,2,3];show=2 =>total=4;tail=(3+1-2)=2;cur=4-2=2
	//如[6,7,8,9,10];show=7 =>total=5;tail=(10+1-7)=4;cur=5-4=1
	MaterialList.prototype.onCurPage = function(data) {
		var total = Math.min(_self.loadedPageIndex+1, MAX_PAGE_CACHE);
		var tail = _self.loadedPageIndex+1-_self.pageIndex;
		var curIndex = total-tail;
		for (var i=0; i<data.length; i++) {
			_self.data_list[i+curIndex*PER_GET_PAGE_NUM] = data[i];
		}
		_self.showMaterialList(_self.pageIndex);
	};
	MaterialList.prototype.nextPage = function() {
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
			_self.showMaterialList(curIndex);
			return;
		}
		_self.getMaterialList(_self.pageIndex+1, PER_GET_PAGE_NUM);
	};
	MaterialList.prototype.onNextPage = function(data) {
		if (!data || data.length == 0) {
			if (_self.pageIndex == -1) {
				_self.showMaterialListWithNoData();
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
		_self.showMaterialList(curIndex);
	};
	MaterialList.prototype.prePage = function() {
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
			_self.showMaterialList(curIndex);
			return;
		}
		_self.getMaterialList(_self.pageIndex-1, PER_GET_PAGE_NUM);
	};
	MaterialList.prototype.onPrePage = function(data) {
		_self.pageIndex--;
		_self.loadedPageIndex--;
		_self.data_list = data.concat(_self.data_list);
		_self.data_list.splice(PER_GET_PAGE_NUM*MAX_PAGE_CACHE);
		_self.showMaterialList(0);
	};
	MaterialList.prototype.showMaterialListWithNoData = function() {
		_self.scroller.downRefresh = false;
		_self.scroller.upRefresh = false;

		$('#matl_list').html("无数据");
	};
	MaterialList.prototype.showMaterialList = function (pageIndex) {
		var PURPLE = app.color.PURPLE,
			BLUE = app.color.BLUE,
			LC = app.color.OLIVEDRAB,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			LIGHTBLUE = app.color.LIGHTBLUE,
			CC = app.color.GRAY,
			DIVH = '<div style="margin-bottom: 6px;">',
			DIVCH = '<div style="margin-bottom: 6px;text-align: center;">',
			DIVT = '</div>',
			stageType = app.route.stageType,
			html = '';

		var STATUS = {pengding: '未审核', inventory:'已出库', approvel:'已审核', finish:'已完成'};
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
			var result_info = item.result_info;
			var result_detail = item.result_detail;
			var check_history = item.check_history;
			var application_amount = 0;
			for (var k in result_detail) {
				application_amount += result_detail[k].application_amount*1;
			}

			html += '<li>';
			html += '<a href="#" onclick="app.materialList.doInvestigate('+i+');">';
			html += '<div style="word-break: break-all">' + RED(i+startIndex) + ':&nbsp;'+CC('申请单号:')+LIGHTBLUE(result_info.application_number)+'&nbsp;['+PURPLE(STATUS[result_info.status])+']'+'</div>';
			html += '<div>'+CC('数量：')+LC(application_amount)+'&nbsp;['+CC(result_info.application_date)+']'+'</div>';
			html += '<div style="word-break: break-all">'+CC('人员：')+BLUE(result_info.factory_name+'['+LIGHTBLUE(result_info.organization_name)+']:')+GREEN(result_info.employee_name)+'</div>';
			for (var id in check_history) {
				var history = check_history[id];
				if (history) {
					var info = history[history.length-1];
					if (info) {
						var result_info = (info.check_resault == 'pass') ? GREEN('通过') : RED('未通过');
						html += '<div style="word-break: break-all">' + CC('审核结果：') + result_info + '[审核人:' + info.check_person + ']</div>';
					}
				}
				break;
			}
			html += '</a>';
			html += '</li>';
		}
		//console.log(html);
		$('#matl_list').html(html);
		if (_self.dir == DEC_DIR) {
			_self.scroller.scrollToBottom(1000);
		} else {
			setTimeout(function(){
				_self.scroller.scrollToTop(1000);
			}, 100);
		}
	};
	MaterialList.prototype.doSearch = function () {
		require('materialListSearch').show(_self);
	};
	MaterialList.prototype.getMaterialList = function (pageNum, num) {
		var start = pageNum+1;
		var param = {
			token: app.crm.token
		};
		var url = app.route.crmGetApplicationInfo+"?"+ $.param(param);
		console.log(url);

		var data = {
			pages:start,
			record:num,
			user_id:app.login.userid
		};
		var searchInfo = _self.searchInfo;
		searchInfo.app_number && (data.app_number = searchInfo.app_number);
		searchInfo.use_branch && (data.use_branch = searchInfo.use_branch);
		searchInfo.purpose_comment && (data.purpose_comment = searchInfo.purpose_comment);
		searchInfo.factory_name && (data.factory_name = searchInfo.factory_name);
		searchInfo.operator_time && (data.operator_time = searchInfo.operator_time);
		searchInfo.part_id && (data.part_id = searchInfo.part_id);
		searchInfo.part_name && (data.part_name = searchInfo.part_name);
		searchInfo.status && (data.status = searchInfo.status);
		searchInfo.value && (data.value = searchInfo.value);
		_self.app_number_list && (data.app_number_list = _self.app_number_list);
		console.log(data);

		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(data),
			success: _self.onGetMaterialListSuccess
		});
	};
	MaterialList.prototype.onGetMaterialListSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		if (_self.maxPageIndex == -1) {
			_self.totalInfo = {};
			_self.totalInfo.count = data.total_record*1;
			_self.maxPageIndex = Math.floor((data.total_record*1-1)/PER_GET_PAGE_NUM);
		}
		if (_self.dir == DEC_DIR) {
			_self.onPrePage(data.app_detail);
		} else if (_self.dir == INC_DIR) {
			_self.onNextPage(data.app_detail);
		} else {
			_self.onCurPage(data.app_detail);
		}
	};
	MaterialList.prototype.doInvestigate = function (index) {
		require('materialInvestigate').show(_self.showData[index]);
	};

	return new MaterialList();
});
