define(function(require) {
	"use strict";

	var _self;
	function ImageDisplay() {
		_self = this;
		_self.id = "imageDisplay";
	}

	ImageDisplay.prototype.show = function(src) {
		_self.src = src;
        app.utils.loadPanel(_self.id, {header:"none", footer:"none",  transition:"fade", loadfunc:_self.id+"=onLoad", unloadfunc:_self.id+"=onUnload"});
	};
	ImageDisplay.prototype.onLoad = function () {
		var options = {
            canvas: $('#imgd_ctx')[0],
            path: _self.src
        };
        _self.imgTouchCanvas = new $.ImgTouchCanvas(options);
		$(app.utils.panelID(_self.id)).on("singleTap", _self.onSingleTap);
		$(app.utils.panelID(_self.id)).on("longTap", _self.onLongTap);
	};
	ImageDisplay.prototype.onUnload = function () {
		$(app.utils.panelID(_self.id)).off("singleTap");
		$(app.utils.panelID(_self.id)).off("longTap");
		_self.src = null;
		_self.imgTouchCanvas = null;
	};
	ImageDisplay.prototype.onSingleTap = function () {
		$.ui.goBack();
	};
	ImageDisplay.prototype.onLongTap = function () {
		app.utils.actionsheet = $("#afui").actionsheet([{
			text: '保存原图',
			cssClasses: '',
			handler: function () {
				$.ui.actionsheetShow = false;
				_self.saveOriginImageFile();
			}
		},{
			text: '保存缩放图',
			cssClasses: '',
			handler: function () {
				$.ui.actionsheetShow = false;
				_self.saveScaleImageFile();
			}
		}, {
			text: '分享',
			cssClasses: '',
			handler: function () {
				$.ui.actionsheetShow = false;
				app.utils.toast("工程师在努力开发中...");
			}
		}]);
	};
	ImageDisplay.prototype.saveOriginImageFile = function () {
		if (/^data:base64/.test(_self.src)) {
			_self.saveBase64ImageFile(_self.src);
		} else {
			var img = new Image();
			img.src = _self.src;
			var that = this;
			img.onload = function() {
				var canvas = document.createElement('canvas');
				canvas.id     = "CursorLayer";
				canvas.width  = img.width;
				canvas.height = img.height;
				canvas.style.zIndex   = 8;
				canvas.getContext('2d').drawImage(img, 0, 0);
				_self.saveBase64ImageFile(canvas.toDataURL("image/png"));
			};
		}
	};
	ImageDisplay.prototype.saveScaleImageFile = function () {
		var src = _self.imgTouchCanvas.getDataUrl();
		_self.saveBase64ImageFile(src);
	};
	ImageDisplay.prototype.saveBase64ImageFile = function (src) {
		if (_from == 'web') {
			_self.saveBase64ImageFileForWeb(src);
		} else if (_os == 'desktop') {
			_self.saveBase64ImageFileForDesktop(src);
		} else if (_os == 'android') {
			if (!_self.showFileDialog) {
				_self.showFileDialog = true;
				_self.saveBase64ImageFileForAndroid(src);
				setTimeout(function() {
					_self.showFileDialog = null;
				}, 1000);
			}
		}
	};
	ImageDisplay.prototype.saveBase64ImageFileForWeb = function (src) {
		navigator.utils.saveasFile("default.png", src);
		app.utils.toast("保存成功");
	};
	ImageDisplay.prototype.saveBase64ImageFileForAndroid = function (src) {
		navigator.utils.chooseDirectory(localStorage.savePath, function(path) {
			var data=src.split(",");
			var accept = "gif";
			if (/image\/png/.test(data[0])) {
				accept = "png";
			} else if (/image\/jpeg/.test(data[0])) {
				accept = "jpg";
			}
			app.utils.popup({
				title: "输入文件名",
				message: '<input type="text" value="" id="imgd_file_name" placeholder="请输入文件名：如xx.'+accept+'">',
				cancelText: "取消",
				cancelCallback: function () {},
				doneText: "确定",
				doneCallback: function () {
					var filename = $("#imgd_file_name").val();
					filename = filename.replace(new RegExp("\." + accept+"$"), '');
					localStorage.savePath = path;
					_self.doSaveImageFile(path+filename+"."+accept, src.split(",")[1]);
				},
				addCssClass: 'wide'
			});
		});
	};
	ImageDisplay.prototype.saveBase64ImageFileForDesktop = function (src) {
		var data=src.split(",");
		var accept = "gif";
		if (/image\/png/.test(data[0])) {
			accept = "png";
		} else if (/image\/jpeg/.test(data[0])) {
			accept = "jpg";
		}
		navigator.utils.saveasFile("."+accept, localStorage.savePath||'', "save",  function (path) {
			if (path) {
				localStorage.savePath = path.replace(new RegExp("[^/]+\." + accept), '');
				_self.doSaveImageFile(path, data[1]);
			}
		});
	};
	ImageDisplay.prototype.doSaveImageFile = function (filename, data) {
		navigator.utils.writeFile(filename, data, function() {
			app.utils.toast("保存成功");
		}, function() {
			app.utils.toast("保存失败"+((_os=='android')?'或没有保存权限':''));
		}, "base64");
	};

	return new ImageDisplay();
});
