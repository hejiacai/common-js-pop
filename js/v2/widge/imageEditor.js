// JavaScript Document

define('widge.imageEditor', 'widge.imageCrop, widge.fileUploader', function(require, exports, module){

	var $ = module['jquery'],
		util = require('base.util'),
		shape = module['base.shape'],
		ImageCroper = module['widge.imageCrop'],
		FileUploader = module['widge.fileUploader'],
		doc = document,
		win = window;
	
	var imageEditor = shape(function(o){
		imageEditor.parent().call(this, util.merge({
			imageCroperConfig: null,
			fileUploaderConfig: null,
			trigger: $('#upload_submit')
		}, o));
		
		this.init();
	});
	
	imageEditor.implement({
		init: function(){
			this._createFileUpload();
			this._createImageCroper();
			this._initEvent();
		},
		_createFileUpload: function(){
			this.fileUploader = new FileUploader(
				this.get('fileUploaderConfig')
			);
		},
		_createImageCroper: function(){
			this.imageCroper = new ImageCroper(
				this.get('imageCroperConfig')
			);
			this._targetImage = this.imageCroper.targetImage;
		},
		_initEvent: function(){
			var self = this;
			this.fileUploader.on('startUpload', function(e){
				self.trigger('startUpload', e);
			});
			this.fileUploader.on('progresed', function(e){
				if(!self.trigger('progresed', e))
					self.imageCroper.loadImage(e.url);
			});
			this.fileUploader.on('progressError', function(e){
				self.trigger('progressError', e);
			});
			var trigger = this.get('trigger');
			if(trigger && !util.type.isString(trigger) && trigger[0]){
				var handle = this.imageCroper.get('handle'),
					fixId = this.imageCroper.targetImage.attr('id');
					targetImage = this.imageCroper.targetImage = $('#' + fixId);
				
				trigger.on('click', function(e){
					e.url = self.imageCroper.get('src');
					e.cropX = parseInt(handle.position().left - targetImage.position().left);
					e.cropY = parseInt(handle.position().top - targetImage.position().top);
					e.previews = self.imageCroper.views;
					e.cropW = parseInt(handle.outerWidth());
					e.cropH = parseInt(handle.outerHeight());
					e.cropPW = parseInt(self.imageCroper.scalWidth);
					e.cropPH = parseInt(self.imageCroper.scalHeight);
					self.trigger('save', e);
				});
			}
		},
		loadImage: function (url) {
		    this.imageCroper.loadImage(url);
		},
		addPreview: function(view, w, h){
			if(view && !util.type.isString(view) && view[0]){
				this.imageCroper.addPreview(view, w, h);
			}
		},
		destory: function(){
			this.imageCroper.destory();
			this.fileUploader.destory();
			imageEditor.parent('destory').call(this);
		}
	});
	
	return imageEditor;
});