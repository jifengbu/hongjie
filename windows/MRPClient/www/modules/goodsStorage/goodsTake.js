define(function(require) {
	"use strict";
	var _self;

	function GoodsTake() {
		_self = this;
		_self.id = "goodsTake";
	}

	GoodsTake.prototype.show = function(data, flag) {
		console.log(data);
		_self.data = data;
		_self.flag = flag;
		_self.loaded = false;
		_self.otherInfo = {};
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	GoodsTake.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (!_self.loaded) {
			_self.loaded = true;
			if (_self.boxDepotList) {
				_self.showPanel();
			} else {
				_self.getBoxDepotList();
			}
		}
	};
	GoodsTake.prototype.release = function () {
		_self.data = null;
		_self.boxDepotList = null;
	};
	GoodsTake.prototype.showPanel = function () {
		var GREEN = app.color.GREEN,
			BLUE = app.color.BLUE,
			RED = app.color.RED,
			PURPLE = app.color.PURPLE,
			boxDepotList = _self.boxDepotList,
			data = _self.data,
			html = '';
		html += '<li>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">订单号:'+GREEN(data.items)+'</div>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">产品类型:'+BLUE(data.req)+'</div>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">客户产品编号:'+GREEN(data.part_no)+'</div>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">客户ID:'+BLUE(data.customer_id)+'</div>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">状态:'+GREEN(data.status)+'&nbsp;&nbsp;加急层度:'+BLUE(data.urgency_level)+'</div>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">交期:'+GREEN(data.expected_time)+'</div>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">订购数量:'+BLUE(data.required_quantity)+'&nbsp;&nbsp;生产数量:'+GREEN(data.produced_quantity)+'</div>';
		html += '<div style="margin-bottom: 6px;margin-left: 5%">已收数量:'+PURPLE(data.receive_qty)+'&nbsp;&nbsp;未收数量:'+RED(data.no_receive_qty)+'</div>';
		html += '<div style="margin-bottom: 6px;"><label for="gotk_receive_qty" style="width: 40%;">申请入库数量:</label>&nbsp;&nbsp;<input type="number" value="'+data.required_quantity+'" id="gotk_receive_qty" style="width:50%;" class="input_style"></div>';
		if (_self.flag) {
			html += '<div style="margin-bottom: 6px;"><label for="gotk_receive_set_qty" style="width: 40%;">收货数量SET:</label>&nbsp;&nbsp;<input type="text" value="" id="gotk_receive_set_qty" style="width:30%;" class="input_style"></div>';
		}
		html += '<div style="margin-bottom: 6px;"><label for="gotk_receive_no" style="width: 40%;">收货编号:</label>&nbsp;&nbsp;<input type="text" id="gotk_receive_no" style="width:50%;" class="input_style" placeholder="请输入收货编号"></div>';
		if (boxDepotList && boxDepotList.length>1) {
			html += '<div style="margin-bottom: 6px;"><label for="gotk_box_id" style="width: 40%;">盒子:</label>&nbsp;&nbsp;';
			html += '<select id="gotk_box_id" style="width: 50%;" class="" >';
			for (var i = 0, len = boxDepotList.length; i < len; i++) {
				var item = boxDepotList[i];
				html += '<option value="'+item.box_id+'">'+item.box_no+'</option>';
			}
			html += '</select>'
		}
		html += '</div>';
		html += '<div style="margin-bottom: 6px;"><label for="gotk_deposit_location" style="width: 40%;">库位:</label>&nbsp;&nbsp;<input type="text" id="gotk_deposit_location" style="width:50%;" class="input_style" placeholder="请输入库位"></div>';

		html +=  app.utils.buttonHtml([
			{text:'填写更多信息', click:'app.goodsTake.doShowOtherInfo()'},
			{text:'提交', click:'app.goodsTake.doSubmit()'}
		]);
		html += '</li>';
		$('#gotk_list').html(html);
	};
	GoodsTake.prototype.doShowOtherInfo = function () {
		require('goodsTakeOtherInfo').show(_self);
	};
	GoodsTake.prototype.doSubmit = function () {
		var receive_qty = $('#gotk_receive_qty').val();
		if (receive_qty*1 < 1) {
			app.utils.toast("申请入库数量不能小于1");
			return;
		}
		var receive_set_qty = $('#gotk_receive_set_qty').val();
		if (_self.flag && !receive_set_qty) {
			app.utils.toast("收货数量SET不能为空");
			return;
		}
		var receive_no = $('#gotk_receive_no').val();
		var deposit_location = $('#gotk_deposit_location').val();
		var box_id = $('#gotk_box_id').val();

		var param = {
			token: app.crm.token,
			user_id: app.login.userid
		};
		var url = app.route.crmItemCheckin+"?"+ $.param(param);
		console.log(url);
		var info = _self.data;
		var otherInfo = _self.otherInfo;
		var userid = app.login.userid;
		var date = $.dateFormat(new Date(),"yyyy-MM-dd hh:mm:ss");

		var data = [{
			'qo_item_id': info.qo_item_id, //ItemID
			'receive_no': receive_no, //收货编号
			'box_id': box_id,//库位（盒子）ID
			'deposit_location': deposit_location,//库位
			'receive_qty': receive_qty,//收货数量
			'receive_set_qty': receive_set_qty==null?0:receive_set_qty,//收货数量SET 如果系统配置 deliver_is_use_panel_qty = Y 则界面需要输入这个过来
			'receiver': otherInfo.receiver||userid,//收货人
			'receive_time': otherInfo.receive_time||date,//收货时间
			'check_user': otherInfo.check_user||userid,//核对人
			'check_time': otherInfo.check_time||date,//盘点时间
			'check_qty': otherInfo.check_qty==null?info.required_quantity:otherInfo.check_qty,//检查数量
			'fine_qty': otherInfo.fine_qty==null?info.required_quantity:otherInfo.fine_qty,//合格数量
			'fine_set_qty': otherInfo.fine_set_qty||'',//合格数量SET
			'fail_qty': otherInfo.fail_qty||0,//废品数量
			'return_qty': otherInfo.return_qty||0,//退回数量
			'unit_weight': otherInfo.unit_weight||'',//毛重
			'batch_qty': otherInfo.batch_qty||'',//毛重数量
			'package_num': otherInfo.package_num||'',//每包数量
			'comment': otherInfo.comment||'',//备注
			'assoc_pcb': otherInfo.assoc_pcb||''//关联PCB数量,如果是ASS类型有关联PCB可要求填入
		}];
		console.log(JSON.stringify(data));

		app.utils.setWait("正在提交...");
		app.utils.ajax({
			type : "POST",
			url : url,
			data: JSON.stringify(data),
			success : _self.onSumbmitSuccess
		});
	};
	GoodsTake.prototype.onSumbmitSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		if (data.failed) {
			require('goodsStorageResult').show(data);
		} else {
			app.utils.toast("提交成功");
			$.ui.goBack();
		}
	};
	GoodsTake.prototype.getBoxDepotList = function () {
		var url = app.route.crmGetBoxDepotList;
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetBoxDepotListSuccess,
			error : _self.onGetBoxDepotListError
		});
	};
	GoodsTake.prototype.onGetBoxDepotListSuccess = function (data) {
		console.log(data);
		app.utils.clearWait();
		_self.boxDepotList = data;
		_self.showPanel();
	};
	GoodsTake.prototype.onGetBoxDepotListError = function (err, data) {
		_self.showPanel();
	};

	return new GoodsTake();
});
