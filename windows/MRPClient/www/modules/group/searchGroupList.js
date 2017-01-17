define(function(require) {
	"use strict";
	var _self;
	function SearchGroupList() {
		_self = this;
		_self.id = "searchGroupList";
		_self.users = [];
	}
	SearchGroupList.prototype.show = function(list) {
        _self.list = list;
        app.utils.loadPanel(_self.id, {footer:"none", transition:"slideLeft", loadfunc:_self.id+"=onLoad"});
	};
	SearchGroupList.prototype.onLoad = function() {
		if (_self.list) {
			_self.addGroupList(_self.list);
			_self.list = null;
			_self.updateAlphaTable();
		}
	};
	SearchGroupList.prototype.updateAlphaTable = function() {
		$("#search_group_list_content").alphatable( $("#search_group_list_content").scroller(), {
			listCssClass:"tableListContainer",
			letterBoxCssClass: 'letterBox',
			prefix:"search_group_anchor_"
		});
	};
	SearchGroupList.prototype.addGroupItem = function(name, type, creator) {
		var BLUE = app.color.BLUE,
			RED = app.color.RED,
			GREEN = app.color.GREEN,
			html = '';
		html += '<li onclick="app.searchGroupList.doAddGroup(\''+name+'\')">';
		html += '<div class="chat_head chat_head_contact group_head default_head user_head_'+creator+'"></div>';
		html += '<span class="chat_contact">';
		if (creator == app.login.userid) {
			html += BLUE(name);
		} else if (type) {
			html += RED(name);
		} else {
			html += GREEN(name);
		}
		html += '</span>';
		html += '</li>';
		return html;
	};
	SearchGroupList.prototype.addAlphaGroup = function(alpha, groupArr) {
		var html = '';
		html += '<div class="tableHeader" id="search_group_anchor_'+alpha+'">&nbsp;'+alpha+'</div>';
		for (var i=0,len=groupArr.length; i<len; i++) {
			var item = groupArr[i];
			html += _self.addGroupItem(item.name, item.type, item.creator);
		}
		return html;
	};
	SearchGroupList.prototype.addGroupList = function(groups) {
		var html = '';
		var alphas = $.alphas;

		html += '<div id="search_group_list_content" style="color:black;overflow:hidden;">';
		for (var i=0,len=alphas.length; i<len; i++) {
			var alpha = alphas[i];
			if (groups.hasOwnProperty(alpha)) {
				html += _self.addAlphaGroup(alpha, groups[alpha]);
			}
		}
		html += '<div><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
		html += '</div>'

		$('#search_group_list').html(html);
	};
	SearchGroupList.prototype.doAddGroup = function(name) {
		require('groupDetail').show(name, 1);
	};

	return new SearchGroupList();
});