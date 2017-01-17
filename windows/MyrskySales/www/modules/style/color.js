define(function(require) {
	"use strict";
	var _self;
	function Color() {
		_self = this;
		_self.id = "color";

        if (_os == "android") {
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            var cssPath = _external + "modules/style/";
            var cssFile = "screen.css";
            console.log("[install]:genScreenCss winWidth=" + winWidth + " winHeight=" + winHeight);
            navigator.utils.genScreenCss(cssPath, cssFile, winWidth, winHeight);
            console.log("[install]:genScreenCss complete");
            require(['order!css!menuIcons', 'order!css!mystyle', 'order!css!screen']);
        } if (_os == "ios") {
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            var cssPath = navigator.utils.getWorkPath()+"www/modules/style/";
            var cssFile = "screen.css";
            console.log("[install]:genScreenCss winWidth=" + winWidth + " winHeight=" + winHeight);
            navigator.utils.genScreenCss(cssPath, cssFile, winWidth, winHeight);
            console.log("[install]:genScreenCss complete");
            require(['order!css!menuIcons', 'order!css!mystyle', 'order!css!screen']);
        } else {
            require(['order!css!menuIcons', 'order!css!mystyle', 'order!less!screen'],  function () {
                window.require('nw.gui').Window.get().show();
            });
        }
	}
	
    Color.prototype.RED = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:red'>"+val+"</span>";
    };
    Color.prototype.WHITE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:#ffffff'>"+val+"</span>";
    };
    Color.prototype.BLUE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:blue'>"+val+"</span>";
    };
    Color.prototype.GREEN = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:green'>"+val+"</span>";
    };
    Color.prototype.LIGHTBLUE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:lightblue'>"+val+"</span>";
    };
    Color.prototype.DARKOLIVEGREEN = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:darkolivegreen'>"+val+"</span>";
    };
    Color.prototype.OLIVEDRAB = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:olivedrab'>"+val+"</span>";
    };
    Color.prototype.STEELBLUE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:steelblue'>"+val+"</span>";
    };
    Color.prototype.PURPLE = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:magenta'>"+val+"</span>";
    };
    Color.prototype.GRAY = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:gray'>"+val+"</span>";
    };
    Color.prototype.GOLD = function(val) {
        val = (val===0)?val:(val?val:'无');
        return "<span style='color:gold'>"+val+"</span>";
    };
    Color.prototype.AREA_COLOR = function(val) {
        val = val||0;
        val = Math.round(val*100)/100;
        return "<span style='color:red'>"+val+"</span>";
    };
    Color.prototype.PRICE_COLOR = function(val) {
        val = val||0;
        val = Math.round(val*100)/100;
        return "<span style='color:darkorange'>"+val+"</span>";
    };
    Color.prototype.PNL_COLOR = function(val) {
        val = val||0;
        return "<span style='color:seagreen'>"+val+"</span>";
    };
    Color.prototype.PCS_COLOR = function(val) {
        val = val||0;
        return "<span style='color:darkgoldenrod'>"+val+"</span>";
    };
    Color.prototype.COUNT_COLOR = function(val) {
        val = val||0;
        return "<span style='color:dodgerblue'>"+val+"</span>";
    };
    Color.prototype.DATE_COLOR = function(val) {
        val = val||'无';
        return "<span style='color:coral'>"+val+"</span>";
    };

	return new Color();
});
