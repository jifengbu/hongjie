define(function(require) {
	"use strict";
    //类别：0 统计 1 报工 2 消息 3 其他
	return [
		{
			label: "生产订单",
			icon: 'orderlist',
			module: 'orderlist',
            type: 3,
            permission: 'android_order_list'
		},
		{
			label: "昨日生产状态",
			icon: 'yesterdayReport',
			module: 'yesterdayReport',
            type: 0,
            permission: 'android_yesterday_report'
		},
		{
			label: "消息",
			icon: 'ticket',
			module: 'ticket',
            type: 2,
            permission: 'android_ticket'
		},
		{
			label: "扫描过数",
			icon: 'passNumber',
			module: 'passNumber',
            type: 1,
            permission: 'android_receive_report'
		},
		{
			label: "生产统计",
			icon: 'produceReport',
			module: 'produceReportEx',
            type: 0,
            permission: 'android_produce_report'
		},
        {
            label: "工厂订单信息",
            icon: 'crmorder',
            module: 'crmorder',
            type: 0,
            permission: 'android_crm_order_statistic'
        },
        {
            label: "生产订单信息",
            icon: 'mrporder',
            module: 'mrporder',
            type: 0,
            permission: 'android_mrp_order_statistic'
        },
        {
            label: "生产提醒",
            icon: 'produceNotice',
            module: 'produceNotice',
            type: 2,
            permission: 'android_notice_ticket'
        },
		 {
            label: "组长提醒",
            icon: 'produceNotice',
            module: 'stageNotifyList',
            type: 2,
            permission: 'android_notice_ticket'
        },
        {
            label: "投入产出",
            icon: 'inoutReport',
            module: 'inoutReport',
            type: 0,
            permission: 'android_inout_report'
        },
        {
            label: "派工单",
            icon: 'stationDispatch',
            module: 'stationDispatch',
            type: 1,
            permission: 'android_station_dispatch'
        },
        {
            label: "今日任务",
            icon: 'stationReport',
            module: 'stationReport',
            type: 1,
            permission: 'android_station_report'
        },
        {
            label: "板名称过数",
            icon: 'witemDispatch',
            module: 'witemDispatch',
            type: 1,
            permission: 'android_receive_report'
        },
        {
            label: "工位完工统计",
            icon: 'stationComp',
            module: 'stationComp',
            type: 0,
            permission: 'android_station_comp'
        },
        {
            label: "工号完工统计",
            icon: 'stationCompSummary',
            module: 'stationCompSummary',
            type: 0,
            permission: 'android_station_comp_summary'
        },
        {
            label: "今日计划",
            icon: 'stagePlan',
            module: 'stagePlan',
            type: 3,
            permission: 'android_stage_plan'
        },
        {
            label: "个人工作",
            icon: 'stagePlanComp',
            module: 'stagePlanComp',
            type: 1,
            permission: 'android_production_timesheet_stage'
        },
        {
            label: "加工单一览表",
            icon: 'sheetSituation',
            module: 'sheetSituation',
            type: 0,
            permission: 'android_sheet_situation'
        },
        {
            label: "工序看板",
            icon: 'stageBoard',
            module: 'stageBoard',
            type: 1,
            //permission: 'android_stage_board'
        },
        {
            label: "领料申请",
            icon: 'materialRequisition',
            module: 'materialMain',
            type: 3,
            permission: 'android_material_requisition'
        },
        {
            label: "成品入库",
            icon: 'goodsStorage',
            module: 'goodsMain',
            type: 3,
            permission: 'android_goods_storage'
        }
        //,
        //{
        //    label: "测试",
        //    icon: 'materialRequisition',
        //    module: 'ticketIssue',
        //    type: 1,
        //    //permission: 'android_material_requisition'
        //    permission: 'android_sheet_situation'
        //}
	];
});