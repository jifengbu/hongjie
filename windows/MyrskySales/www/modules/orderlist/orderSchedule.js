define(function(require) {
	"use strict";
	var _self;

	function OrderSchedule() {
		_self = this;
		_self.id = "orderSchedule";
	}
	
	OrderSchedule.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {footer:"none", loadfunc:_self.id+"=onLoad"});
	};
	OrderSchedule.prototype.onLoad = function() {
		var data = _self.data,
            html = '';

        if (!data) {
            $('#pn_order_schedule_list').html('<div class="center_div">没有获取到进度信息</div>');
            return;
        }
        var arr = data.split(',');
        html += '<li>';
        for (var i in arr) {
            html += '<div style="margin-left:20%">'+arr[i]+'</div>';
        }
        html += '</li>';
        $('#pn_order_schedule_list').html(html);
	};
    OrderSchedule.prototype.release = function() {
        _self.data = null;
    };
	return new OrderSchedule();
});
