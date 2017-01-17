define(function(require) {
	"use strict";
	var _self;

	function TicketVisibleGroup() {
		_self = this;
		_self.id = "ticketVisibleGroup";
	}
	
	TicketVisibleGroup.prototype.show = function(group, commonInfo) {
		_self.commonInfo = commonInfo;
		_self.group = group.split(',');
		app.utils.loadPanel(_self.id, {loadfunc:_self.id+"=onLoad", modal:"true"});
	};
	TicketVisibleGroup.prototype.onLoad = function() {
		_self.showPanel();
	};
    TicketVisibleGroup.prototype.release = function() {
        _self.commonInfo = null;
        _self.group = null;
    };
	TicketVisibleGroup.prototype.showPanel = function() {
		var arr = _self.commonInfo.priv_cat;
		var list = [];
		for (var i=0; i<arr.length; i++) {
			var checked = false;
			for (var j in _self.group) {
				if (_self.group[j].trim() == arr[i].key) {
					checked = true;
					break;
				}
			}
			var item = {key:arr[i].key, name:arr[i].name, checked:checked};
			list.push(item);
		}
		var html = '<div class="input-group">';
			for (var i=0; i<list.length; i++) {
                if (list[i].checked) {
                    html += '<input id="tvg_group_' + i + '" type="checkbox" name="tvg_group" value="' + list[i].key + '" checked><label for="tvg_group_' + i + '">' + list[i].name + '</label>';
                } else {
                    html += '<input id="tvg_group_' + i + '" type="checkbox" name="tvg_group" value="' + list[i].key + '"><label for="tvg_group_' + i + '">' + list[i].name + '</label>';
                }
            }
        html += '</div>';

		$("#tvg_from").html(html);
	};
	TicketVisibleGroup.prototype.setTicketVisibleGroup = function() {
		var ret = "";
		$("input[type=checkbox][name='tvg_group']:checked").each(function(){
			if (ret != "") {
				ret += ",";
			}
			ret += $(this).val(); 
		});  
		require('ticketIssue').setVisibleGroup(ret);
        app.utils.hideModal();
	};
	return new TicketVisibleGroup();
});
