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
                html += '<a href="#" onclick="_call([\''+config[i].module+'\',\'show\'])">'+config[i].label+'</a>'
                html += '</li>'
            }

			//console.log(html);
			var title = app.utils.isTestVersion()?'<span style="color:red;">测试</span>':(app.utils.isDevelopVersion()?'<span style="color:red;">开发</span>':'');
            $('#about_version').html(title+" v"+app.info.verName);
			$('#more_menu_list').html(html);
			if (_from != "web") {
				$('#more_version_update').show();
			}
			_self.loaded = true;
		}
	};
	UIMore.prototype.doCheckUpdate = function() {
        var update = require('update');
        update.show(update.FROM_MORE_PAGE);
	}
	return new UIMore();
});