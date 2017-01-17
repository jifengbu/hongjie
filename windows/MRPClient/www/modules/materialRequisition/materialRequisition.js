define(function(require) {
	"use strict";
	var _self;
	function MaterialRequisition() {
		_self = this;
		_self.id = "materialRequisition";
	}

	MaterialRequisition.prototype.show = function(from, data_list, info) {
		_self.date = app.utils.newDate();

		_self.from = from;
		_self.data_list = data_list||[];
		_self.info = info||{};
		_self.loaded = false;

		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	MaterialRequisition.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			_self.showPartInfo();
		}
	};
	MaterialRequisition.prototype.onUnload = function () {
	};
	MaterialRequisition.prototype.release = function () {
		_self.date = null;
		_self.organizeUserInfo = null;
		_self.last_organ_id = null;
		_self.data_list = null;
		app.factoryList && app.factoryList.release();
		app.otherInfo && app.otherInfo.release();
		app.materialSubmit && app.materialSubmit.release();
		app.materialSearch && app.materialSearch.release();
	};
	MaterialRequisition.prototype.doSearch = function () {
		require('materialSearch').show(_self.data_list);
	};
	MaterialRequisition.prototype.showPartInfo = function () {
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
			html = '';

		var data_list = _self.data_list;

		data_list.length?(html += DIVCH+LC('总条数:')+GREEN(data_list.length)+DIVT):(html += DIVCH+'没有选择的数据，点击添加按钮添加'+DIVT);

		var len=data_list.length;
		for (var i=0, len=data_list.length; i<len; i++) {
			var item = data_list[i];
			html += '<li>';
			html += '<div style="word-break: break-all">' + RED(i) + ':&nbsp;'+GREEN(item.myro_name)+'('+BLUE(item.my_model)+':'+PURPLE(item.part_id)+')</div>';
			if (item.description) {
				html += '<div style="word-break: break-all">' + LC('描述：') + CC(item.description) + '</div>';
			}
			html += '<div>数量:&nbsp;' + CC(item.real_amount_in_stock)+(item.unit?('('+COUNT_COLOR(item.unit)+ ')'):'')+'&nbsp;&nbsp;';
			var val;
			if (item.apply_quantity) {
				val= item.apply_quantity;
			} else {
				val = item.real_amount_in_stock;
			}
			html += '<input type="text" value="'+val+'" style="width:28%;"  class="input_style" readonly onclick="app.materialRequisition.setPartInfoNumber(this, '+val+', '+i+');event.stopPropagation();">';
			html += '</span><span class="icon remove" style="padding:20px 15px;color:red;float: right;" onclick="app.materialRequisition.deleteItem(this, '+i+');event.stopPropagation();"></span></div>';
			html += '<div>'+LC('工序/加工单/领用工序:')+'&nbsp;&nbsp;<span class="icon pencil" style="padding:20px 15px;color:green;" onclick="app.materialRequisition.addOtherInfo(this, '+i+');event.stopPropagation();"></div>';

			var otherData = item.otherData;
			if (otherData) {
				if (otherData.part_finished) {
					html += '<div>工艺:&nbsp;' + LC(otherData.part_finished) + '</div>';
				}
				if (otherData.process_id) {
					html += '<div>领用工序:&nbsp;' + LC(otherData.process_id) + '</div>';
				}
				if (otherData.process_other) {
					html += '<div>领用工序(其他):&nbsp;' + LC(otherData.process_other) + '</div>';
				}
				if (otherData.processing_no) {
					html += '<div>加工单:&nbsp;' + LC(otherData.processing_no) + '</div>';
				}
				if (otherData.comment) {
					html += '<div>备注:&nbsp;' + LC(otherData.comment) + '</div>';
				}
			}
			html += '</li>';
		}
		html +=  app.utils.buttonHtml([
			{text:'添加', click:'app.materialRequisition.doSearch()'}
		]);
		//console.log(html);
		$('#marq_list').html(html);
	};
	MaterialRequisition.prototype.deleteItem = function (el, index) {
		_self.data_list.splice(index, 1);
		_self.showPartInfo();
	};
	MaterialRequisition.prototype.setPartInfoNumber = function (el, val, index) {
		app.utils.popup({
			title: "输入申请数量:",
			message: "<input type='number' id='marq_input_quantity' class='af-ui-forms' style='color:black;font-weight:bold;' value="+val+">",
			cancelText: "取消",
			cancelCallback: function () {},
			doneText: "确定",
			doneCallback: function () {
				var value = $("#marq_input_quantity").val()||0;
				_self.data_list[index].apply_quantity = value;
				$(el).val(value);
			},
			cancelOnly: false
		});
	};
	MaterialRequisition.prototype.addOtherInfo = function (el, index) {
		require('otherInfo').show(el, index, _self.data_list[index].otherData);
	};
	MaterialRequisition.prototype.setOtherInfo = function (el, index, otherData) {
		var html = '';
		var fillel = $(el.parentElement.lastChild);
		var LC = app.color.OLIVEDRAB;

		if (otherData.part_finished) {
			html += '<div>工艺:&nbsp;' + LC(otherData.part_finished)+ '</div>';
		}
		if (otherData.process_id) {
			html += '<div>领用工序:&nbsp;' + LC(otherData.process_id)+ '</div>';
		}
		if (otherData.process_other) {
			html += '<div>领用工序(其他):&nbsp;' + LC(otherData.process_other)+ '</div>';
		}
		if (otherData.processing_no) {
			html += '<div>加工单:&nbsp;' + LC(otherData.processing_no)+ '</div>';
		}
		if (otherData.comment) {
			html += '<div>备注:&nbsp;' + LC(otherData.comment)+ '</div>';
		}

		fillel.html(html);
		_self.data_list[index].otherData = otherData;
	};
	MaterialRequisition.prototype.showSubmit = function () {
		require('materialSubmit').show();
	};

	return new MaterialRequisition();
});
