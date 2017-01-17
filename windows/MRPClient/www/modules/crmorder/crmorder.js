define(function(require) {
	"use strict";
	var _self;

	function CRMorder() {
		_self = this;
		_self.id = "crmorder";
	}
	
	CRMorder.prototype.show = function() {
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad"});
        app.utils.setReleasePanel(_self);
	};
	CRMorder.prototype.onLoad = function() {
		app.updateChatPageBadge(_self.id);
        if (!_self.date) {
            _self.date = app.utils.newDate();
        }
        if (!_self.data) {
            _self.getCRMorder();
        }
	};
    CRMorder.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.data = null;
        _self.date = null;
        _self.search_date = null;
    };
	CRMorder.prototype.showPopMenu = function() {
        navigator.utils.datePickerDialog(function(date){
            _self.date = date;
            _self.getCRMorder();
        }, _self.date.year, _self.date.month, _self.date.day);
	};
	CRMorder.prototype.showCRMorder = function(data) {
        var DATE_COLOR = app.color.DATE_COLOR,
            AREA_COLOR = app.color.AREA_COLOR,
            PRICE_COLOR = app.color.PRICE_COLOR,
            COUNT_COLOR = app.color.COUNT_COLOR,
            html = '';
        try {
            var recvinfo = data.recvinfo;
            html += '<li>';
            html += '<div style="margin-bottom: 6px;">查询日期:' + DATE_COLOR(_self.date.year + '-' + _self.date.month + '-01~') + DATE_COLOR(_self.search_date) + '</div>';
            html += '</li>';
            html += '<li>';
            html += '<div style="background-color:#D3D3D3; margin-bottom: 6px;">当日下单:' + AREA_COLOR(recvinfo.today.area) + '平米 产值:' + PRICE_COLOR(recvinfo.today.price / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">1-2层:' + AREA_COLOR(recvinfo.today.layer.area.single) + '平米 产值:' + PRICE_COLOR(recvinfo.today.layer.price.single / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">多层:' + AREA_COLOR(recvinfo.today.layer.area.double) + '平米 产值:' + PRICE_COLOR(recvinfo.today.layer.price.double / 10000) + '万元</div>';

            var area = recvinfo.today.customer.area;
            var price = recvinfo.today.customer.price;
            var customer_id, customer_area, customer_price;
            for (var key in area) {
                customer_id = key;
                customer_area = area[key];
                break;
            }
            for (var key in price) {
                customer_price = price[key];
            }
            html += '<div style="margin-bottom: 6px;">最大面积客户:' + COUNT_COLOR(customer_id) + ' 下单 ' + AREA_COLOR(customer_area) + '平米 产值:' + PRICE_COLOR(customer_price / 10000) + '万元</div>';
            html += '</li>';

            html += '<li>';
            html += '<div style="background-color:#D3D3D3; margin-bottom: 6px;">当周下单:' + AREA_COLOR(recvinfo.week.area) + '平米 产值:' + PRICE_COLOR(recvinfo.week.price / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">1-2层:' + AREA_COLOR(recvinfo.week.layer.area.single) + '平米 产值:' + PRICE_COLOR(recvinfo.week.layer.price.single / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">多层:' + AREA_COLOR(recvinfo.week.layer.area.double) + '平米 产值:' + PRICE_COLOR(recvinfo.week.layer.price.double / 10000) + '万元</div>';
            html += '</li>';

            html += '<li>';
            html += '<div style="background-color:#D3D3D3; margin-bottom: 6px;">当月下单:' + AREA_COLOR(recvinfo.month.area) + '平米 产值:' + PRICE_COLOR(recvinfo.month.price / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">1-2层:' + AREA_COLOR(recvinfo.month.layer.area.single) + '平米 产值:' + PRICE_COLOR(recvinfo.month.layer.price.single / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">多层:' + AREA_COLOR(recvinfo.month.layer.area.double) + '平米 产值:' + PRICE_COLOR(recvinfo.month.layer.price.double / 10000) + '万元</div>';
            html += '</li>';

            var deliverinfo = data.deliverinfo.deliver;
            html += '<li>';
            html += '<div style="background-color:#D3D3D3; margin-bottom: 6px;">当日发货:' + AREA_COLOR(deliverinfo.current_day.all.summry.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.current_day.all.summry.total_price_sum / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">1-2层:' + AREA_COLOR(deliverinfo.current_day.all.single_layer.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.current_day.all.single_layer.total_price / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">多层:' + AREA_COLOR(deliverinfo.current_day.all.muiti_layer.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.current_day.all.muiti_layer.total_price / 10000) + '万元</div>';
            html += '</li>';

            html += '<li>';
            html += '<div style="background-color:#D3D3D3; margin-bottom: 6px;">当周发货:' + AREA_COLOR(deliverinfo.current_week.all.summry.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.current_week.all.summry.total_price_sum / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">1-2层:' + AREA_COLOR(deliverinfo.current_week.all.single_layer.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.current_week.all.single_layer.total_price / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">多层:' + AREA_COLOR(deliverinfo.current_week.all.muiti_layer.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.current_week.all.muiti_layer.total_price / 10000) + '万元</div>';
            html += '</li>';

            html += '<li>';
            html += '<div style="background-color:#D3D3D3; margin-bottom: 6px;">当月发货:' + AREA_COLOR(deliverinfo.curreny_month.all.summry.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.curreny_month.all.summry.total_price_sum / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">1-2层:' + AREA_COLOR(deliverinfo.curreny_month.all.single_layer.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.curreny_month.all.single_layer.total_price / 10000) + '万元</div>';
            html += '<div style="margin-bottom: 6px;">多层:' + AREA_COLOR(deliverinfo.curreny_month.all.muiti_layer.area) + '平米 产值:' + PRICE_COLOR(deliverinfo.curreny_month.all.muiti_layer.total_price / 10000) + '万元</div>';
            html += '</li>';

            $('#crmo_list').html(html);
        } catch (e) {
            app.utils.showError(app.error.DATA_ERROR);
        }
	};
	CRMorder.prototype.getCRMorder = function() {
        _self.search_date = _self.date.year + "-" + _self.date.month + "-" + _self.date.day;
		var param = {
            order_time: _self.search_date,
            uid: app.login.userid
        }

		var url = app.route.crmorderUrl+'?'+$.param(param);
		console.log(url);
		app.utils.setWait("请稍后...");
		app.utils.ajax({
			type : "GET",
			url : url,
			success : _self.onGetCRMorderSuccess
		});
	};
	CRMorder.prototype.onGetCRMorderSuccess = function(data) {
        console.log(data);
		if (!data.success) {
			app.utils.showError(app.error.SERVER_ERROR);
			$.ui.goBack();
			return;
		}
		_self.data = data;
		_self.showCRMorder(data);
		app.utils.clearWait();
	};
	return new CRMorder();
});
