define(function(require) {
	"use strict";
	var _self;
	function FileSystem() {	
		_self = this;
	}
	FileSystem.prototype.writeText = function(path, text, success, fail) {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
			fs.root.getFile(path, {create: true, exclusive: false}, 
			function(fileEntry){
				fileEntry.createWriter(function(writer){
					writer.onwriteend = function(evt){
						console.log("write success");
						success();
					}
					writer.write(text);
				}, fail);
			}, fail);
		});
	};
	FileSystem.prototype.readText = function(path, success, fail) {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
			fs.root.getFile(path, null,
				function(fileEntry){
					fileEntry.file(function(file){
						var reader = new FileReader();
						reader.onloadend = function(evt){
							success(evt.target.result);
						}
						reader.readAsText(file);
						}, fail); 
				}, fail);
			}, fail);
	};
	return new FileSystem();
});
