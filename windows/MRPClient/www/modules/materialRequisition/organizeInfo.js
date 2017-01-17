define(function(require) {
	"use strict";

	var _self;
	function OrganizeInfo() {
		_self = this;
		_self.id = "organizeInfo";
	}

	OrganizeInfo.prototype.show = function(data, organize_id) {
		_self.data = data;
		_self.organize_id = organize_id;
		app.utils.loadPanel(_self.id, {footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad"});
	};
	OrganizeInfo.prototype.onLoad = function () {
		app.updateChatPageBadge(_self.id);
		if (_self.data) {
			_self.showPanel();
		}
	};
	OrganizeInfo.prototype.release = function () {
		_self.data = null;
	};
	OrganizeInfo.prototype.showPanel = function () {
		var DATE_COLOR = app.color.DATE_COLOR,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			BLUE = app.color.BLUE,
			html = '';
		var data = _self.data;
		var organize_id = _self.organize_id;

		for (var i in data) {
			var item = data[i];
			var color = (item.organization_id ==organize_id)?' style="background-color:lightblue"':'';

			html += '<li'+color+' onclick="app.organizeInfo.setOrganizeId(\''+item.organization_id+'\', \''+item.organization_name+'\')">';
			var level = item.level-1;
			var pre = '<span class="tree_menu_trunck"></span>';
			for (var i=0; i<level; i++) {
				pre += '<span class="tree_menu_branch">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
			}
			html += pre+'&nbsp;'+GREEN(item.organization_name)+'&nbsp;('+RED(item.organization_id)+')';
			html += '</li>';
		}
		$("#orginaze_list").html(html);
	};
	OrganizeInfo.prototype.setOrganizeId = function (organize_id, organize_name) {
		$('#marq_organize').val(organize_name+'('+organize_id+')');
		$('#marq_organize').attr('data-organization', organize_id);
		app.materialRequisition.getOrganizeUserInfo(organize_id);
		$.ui.goBack();
	};

	return new OrganizeInfo();
});
