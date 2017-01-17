define(function(require) {
	"use strict";
	var _self;

	function OrderDetail() {
		_self = this;
		_self.id = "orderDetail";
	}
	
	OrderDetail.prototype.show = function(data, select_id) {
        _self.data = data;
        _self.select_id = select_id;
        app.utils.loadPanel(_self.id, {footer:"none", loadfunc:_self.id+"=onLoad"});
	};
    OrderDetail.prototype.release = function() {
        _self.data = null;
        _self.select_id = null;
    };
	OrderDetail.prototype.onLoad = function() {
        var data;
        for (var id in _self.data) {
            data = _self.data[id];
        }
        if (data.req == "assemble") {
            _self.showAssembleDetail(data);
        } else {
            _self.showFabDetail(data);
        }
    };
	OrderDetail.prototype.showFabDetail = function(data) {
        var RED = app.color.RED,
            PURPLE = app.color.PURPLE,
            AREA_COLOR = app.color.AREA_COLOR,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVH = '<div>',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        html += '<li>';
        html += DIVCH+LC('订单号：')+CC(data.qo_id)+((data.qo_type="order_id")?'':RED('(询价)'))+DIVT;
        html += DIVH+LC('订单类型：')+CC(data.req)+DIVT;
        html += DIVH+LC('订单数量：')+CC(data.qty)+DIVT;
        html += DIVH+LC('总面积：')+AREA_COLOR(data.size)+PURPLE("平米")+DIVT;
        html += DIVH+LC('订单时间：')+CC(data.start_time)+DIVT;
        html += DIVH+LC('工厂期望交期：')+CC(data.fact_forcast_time)+DIVT;
        html += DIVH+LC('内部期望交期：')+CC(data.internal_expected_time)+DIVT;
        html += '</li><li>';
        html += DIVH+LC('材料：')+CC(data.material)+DIVT;
        html += DIVH+LC('层数：')+CC(data.layer)+DIVT;
        html += DIVH+LC('厚度：')+CC(data.thickness)+DIVT;
        html += DIVH+LC('阻焊颜色：')+CC(data.solder_glossy_matt)+DIVT;
        html += DIVH+LC('丝印颜色：')+CC(data.silkscreen_other_color)+DIVT;
        html += DIVH+LC('丝印：')+CC(data.silk_screen)+DIVT;
        html += DIVH+LC('字符类型：')+CC(data.mask)+DIVT;
        html += DIVH+LC('阻焊颜色：')+CC(data.lpi_color)+DIVT;
        html += DIVH+LC('交期：')+CC(data.expected_time)+DIVT;
        html += DIVH+LC('客户型号：')+CC(data.part_no)+DIVT;
        html += DIVH+LC('客户ID：')+CC(data.customer_id)+DIVT;
        html += DIVH+LC('状态：')+CC(data.status)+DIVT;
        html += DIVH+LC('本厂编号：')+CC(data.produced_no)+DIVT;
        html += '</li><li>';
        html += DIVH+LC('是否拼版：')+CC(data.is_panel)+DIVT;
        html += DIVH+LC('成品铜厚：')+CC(data.cop_weight)+DIVT;
        html += DIVH+LC('拼版x*y：')+CC(data.panel_x_y)+DIVT;
        html += DIVH+LC('拼版长*宽：')+CC(data.panel_xy)+DIVT;
        html += DIVH+LC('电测：')+CC(data.e_test)+DIVT;
        html += DIVH+LC('测试方法：')+CC(data.test_method)+DIVT;
        html += DIVH+LC('钻孔数量：')+CC(data.hole_num)+DIVT;
        html += DIVH+LC('最小线宽/线距：')+CC(data.min_trace)+DIVT;
        html += DIVH+LC('最小孔：')+CC(data.smallest_hole)+DIVT;
        html += DIVH+LC('工艺：')+CC(data.finished)+DIVT;
        html += DIVH+LC('币种：')+CC(data.currency)+DIVT;
        html += DIVH+LC('返单ID：')+CC(data.reference_id)+DIVT;
        html += DIVH+LC('返单允许修改：')+CC(data.reference_allow_edit)+DIVT;
        html += DIVH+LC('工厂ID：')+CC(data.factory_contact_id)+DIVT;
        html += '</li>';
        $("#pn_order_detail_list").html(html);
	};
	OrderDetail.prototype.showAssembleDetail = function(data) {
        var RED = app.color.RED,
            PURPLE = app.color.PURPLE,
            AREA_COLOR = app.color.AREA_COLOR,
            LC = app.color.OLIVEDRAB,
            CC = app.color.GRAY,
            DIVH = '<div>',
            DIVCH = '<div style="background-color:#D3D3D3; margin-bottom: 6px;text-align: center;">',
            DIVT = '</div>',
            html = '';

        html += '<li>';
        html += DIVCH+LC('订单号：')+CC(data.qo_id)+((data.qo_type="order_id")?'':RED('(询价)'))+DIVT;
        html += DIVH+LC('订单类型：')+CC(data.req)+DIVT;
        html += DIVH+LC('订单数量：')+CC(data.qty)+DIVT;
        html += DIVH+LC('总面积：')+AREA_COLOR(data.size)+PURPLE("平米")+DIVT;
        html += DIVH+LC('订单时间：')+CC(data.start_time)+DIVT;
        html += DIVH+LC('工厂期望交期：')+CC(data.fact_forcast_time)+DIVT;
        html += DIVH+LC('内部期望交期：')+CC(data.internal_expected_time)+DIVT;
        html += '</li><li>';
        html += DIVH+LC('客户型号：')+CC(data.part_no)+DIVT;
        html += DIVH+LC('客户ID：')+CC(data.customer_id)+DIVT;
        html += DIVH+LC('本厂编号：')+CC(data.produced_no)+DIVT;
        html += DIVH+LC('材料：')+CC(data.material)+DIVT;
        html += DIVH+LC('无铅：')+CC(data.lead_free)+DIVT;
        html += DIVH+LC('状态：')+CC(data.status)+DIVT;
        html += '</li><li>';
        html += DIVH+LC('是否拼版：')+CC(data.no_coating_component_number)+DIVT;
        html += DIVH+LC('线缆焊点数：')+CC(data.wires_soldering_point)+DIVT;
        html += DIVH+LC('线缆焊点数：')+CC(data.wires_soldering_point)+DIVT;
        html += DIVH+LC('插件面：')+CC(data.pth_comp_side)+DIVT;
        html += DIVH+LC('线缆焊点数：')+CC(data.wires_soldering_point)+DIVT;
        html += DIVH+LC('BGA X-ray 测试：')+CC(data.bga_xray_test_qty)+DIVT;
        html += DIVH+LC('BGA IC 数量：')+CC(data.bga_ic_number)+DIVT;
        html += DIVH+LC('焊球数量：')+CC(data.bga_ic_balls)+DIVT;
        html += DIVH+LC('需要编程IC数量（片）：')+CC(data.programming_ic)+DIVT;
        html += DIVH+LC('手工焊接：')+CC(data.manual_solder_number)+DIVT;
        html += DIVH+LC('需要测试：')+CC(data.test_req)+DIVT;
        html += DIVH+LC('测试步骤：')+CC(data.test_step)+DIVT;
        html += DIVH+LC('ICT测具：')+CC(data.ICT_tool)+DIVT;
        html += DIVH+LC('要求上保护漆：')+CC(data.coating_require)+DIVT;
        html += DIVH+LC('贴片面：')+CC(data.smd_comp_side)+DIVT;
        html += DIVH+LC('不喷元件数：')+CC(data.no_coating_component_number)+DIVT;
        html += DIVH+LC('贴片IC脚数：')+CC(data.manual_solder_number)+DIVT;
        html += DIVH+LC('焊接元件种类：')+CC(data.component_type_total)+DIVT;
        html += DIVH+LC('插件IC脚数：')+CC(data.pth_ic_pin_number)+DIVT;
        html += DIVH+LC('贴片元件(0402,0201)数量：')+CC(data.smd_parts0402_qty)+DIVT;
        html += DIVH+LC('插件轴向元件(如电阻,电容,二极管)数量：')+CC(data.pth_axial_part_qty)+DIVT;
        html += DIVH+LC('贴片元件(0603,0805以上)数量：')+CC(data.smd_parts0603_qty)+DIVT;
        html += DIVH+LC('插件元件(TO-92封装及类似)数量：')+CC(data.pth_part_92_qty)+DIVT;
        html += DIVH+LC('#贴片元件(SOT 23封装及类似)数量：')+CC(data.smd_parts23_qty)+DIVT;
        html += DIVH+LC('插件元件连接器脚数：')+CC(data.pth_connector_pin)+DIVT;
        html += DIVH+LC('贴片连接器脚数：')+CC(data.smd_connector_pin)+DIVT;
        html += DIVH+LC('QFP 脚数：')+CC(data.qfp_pin)+DIVT;
        html += DIVH+LC('拼版长*宽：')+CC(data.sizex+"*"+data.sizey)+DIVT;
        html += DIVH+LC('币种：')+CC(data.currency)+DIVT;
        html += DIVH+LC('返单ID：')+CC(data.reference_id)+DIVT;
        html += DIVH+LC('返单允许修改：')+CC(data.reference_allow_edit)+DIVT;
        html += '</li>';
        $("#pn_order_detail_list").html(html);
	};
    //获取订单进度
    OrderDetail.prototype.getOrderListSchedule = function() {
        if (!app.crm.checkToken(app.crm.OL_GET_SCHEDULE_OPER)) {
            _self.doGetOrderListSchedule();
        }
    };
    OrderDetail.prototype.doGetOrderListSchedule = function() {
        var param = {
            token:app.crm.access_token,
            item_id: _self.select_id,
            user_id: app.login.username
        };
        var url = app.route.orderListScheduleUrl+"?"+ $.param(param);
        console.log(url);
        app.utils.setWait("请稍后...");
        app.utils.ajax({
            type : "GET",
            url : url,
            success : _self.onGetOrderListScheduleSuccess
        });
    };
    OrderDetail.prototype.onGetOrderListScheduleSuccess = function(data) {
        console.log(data);
        app.utils.clearWait();
        if (data.errcode) {
            app.utils.showError(data.errmsg);
            return;
        }
        require('orderSchedule').show(data.fac_status);
    };
	return new OrderDetail();
});
