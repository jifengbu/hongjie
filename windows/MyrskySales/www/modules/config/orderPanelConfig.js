define(function(require) {
	"use strict";
	return [
        {
            label: "订单",
            icon: 'orderlist',
            module: 'orderlist'
        },
        {
            label: "消息提示",
            icon: 'ticket',
            module: 'ticket',
            permission: 'android_ticket'
        }
	];
});