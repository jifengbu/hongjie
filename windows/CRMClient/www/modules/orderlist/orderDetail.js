define(function(require) {
	"use strict";
	var _self;

	function OrderDetail() {
		_self = this;
		_self.id = "orderDetail";
	}
	
	OrderDetail.prototype.show = function(data) {
        _self.data = data;
        app.utils.loadPanel(_self.id, {footer:"none", loadfunc:_self.id+"=onLoad"});
	};
	OrderDetail.prototype.onLoad = function() {
		var html = '',
            data = _self.data;
	};
    OrderDetail.prototype.release = function() {
        _self.data = null;
    };
	return new OrderDetail();
});
