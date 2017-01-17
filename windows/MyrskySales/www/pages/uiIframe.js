define(function(require) {
	"use strict";
	var _self;

	function UIIframe() {
		_self = this;
		_self.id = "uiIframe";
	}
	
	UIIframe.prototype.show = function(title, url) {
        _self.title = title;
        _self.url = url;
		app.utils.loadPanel(_self.id, {footer:"none", transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
        app.utils.setReleasePanel(_self);
	};
    UIIframe.prototype.release = function() {
		app.utils.setReleasePanel(null);
        _self.title = null;
        _self.url = null;
    };
	UIIframe.prototype.onLoad = function() {
        _self.getRemotePage();
    };
	UIIframe.prototype.onUnload = function() {
        $('uiiframe_title').val(_self.title);
        _self.destoryPanel();
    };
    UIIframe.prototype.createPanel = function() {
        var html = '';
    };
    UIIframe.prototype.destoryPanel = function() {
        var iframe = $('#uiiframe_content').get(0);
        iframe.src = 'about:blank';
        try{
            iframe.contentWindow.document.write('');
            iframe.contentWindow.document.clear();
        }catch(e){}
    };
    UIIframe.prototype.getRemotePage = function() {
        app.utils.setWait(" ");
        var iframe = $('#uiiframe_content').get(0);
        iframe.onload = function() {
            app.utils.clearWait();
        }
        iframe.src = _self.url;
    };
	return new UIIframe();
});
