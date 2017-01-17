define(function(require) {
	"use strict";
	var _self;
	function UIMore() {
		_self = this;
		_self.loaded = false;
	}

	UIMore.prototype.onLoad = function() {
		if (!_self.loaded) {
			var config = require('morePanelConfig'),
			    html = '';
            for (var i=0; i<config.length; i++) {
                html += '<li>'
                html += '<a href="#" onclick="_call([\''+config[i].module+'\',\'show\'])" langID=\''+config[i].label+'\'>'+T(config[i].label)+'</a>'
                html += '</li>'
            }

			//console.log(html);
            var title = app.utils.isTestVersion(app.version.verCode)?'<span style="color:red;">'+T("common.test")+'</span>':'';
            $('#about_version').html(title+" v"+app.version.verName);
			$('#more_menu_list').html(html);
			_self.loaded = true;
		}
        app.setLanguage("#ui_more *");
	};
	UIMore.prototype.doCheckUpdate = function() {
        var update = require('update');
        update.show(update.FROM_MORE_PAGE);
	}
	return new UIMore();
});