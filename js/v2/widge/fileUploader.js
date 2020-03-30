// JavaScript Document

define('widge.fileUploader', function(require, exports, module){

	var $ = module['jquery'],
		util = require('base.util'),
		shape = module['base.shape'],
		doc = document,
		win = window;
	
	var fileUploader = shape(function(o){
		fileUploader.parent().call(this, util.merge({
			trigger: $('#fileBtn'),//目标按钮区域
			fileName: 'imageFile',//文件上传名
			fileExt: '.jpg,.png',//上传允许文件名
			maxSize: 52100,//文件最大尺寸 ，单位KB 默认10M
			isMutilple: false,//标记是否有多个上传，默认为true
			domain: '', 
			uploadURL: '/company/uploadImage',//上传文件地址
			imageURL: 'http://upload.abc.com/CompanyImages/TempTemplateImage/',
			uploadData: null,
			totalParam: 'Count',
			progressURL: null,//检查文件进度的上传地址
			isRepeat: true,
			buttonClass: 'ui_upload',
			fileInputClass: 'ui_upload_btn',
			urlParam: null,
			max: 9999//设置上传文件个数，默认为true为无限
		}, o));
		
		this.init();
	});
	
	var uid = 0;
	function creatProgressID(){
		return 'progres-'+ (++uid);
	}
	
	fileUploader.template = {
		file: function(className, file, id){
			return [
				'<input class= "'+ className + '" type="file" ',
				'size="100" name="' + file + '" ',
				'id="' + file + '" ',
				'data-progressID="'+ id + '" />'
			].join('');
		},
		hidden: function(name, val){
			return '<input type="hidden" value="' + val + '" name="' + name + '" />';
		},
		iframe: function(name){
			return [
				'<iframe id="' + name + '" name="' + name + '" width="0" height="0" frameborder="0" style="display:none;">',
				'</iframe>'
			].join('')
		},
		form: function(url, name){
			return [
				'<form action="' + url + '" target="' + name + '" method="post" ',
				'enctype="multipart/form-data" style="display:none;"></form>'
			].join('')
		}
	}
	
	fileUploader.implement({
		init: function(){
			var trigger = this.get('trigger');
			if(!(trigger && !util.type.isString(trigger) && trigger[0])){
				return;
			}
			this._contNumber = 0;
			this._uploading  = false;//标记是否在上传中
			this._queue = [];//上传队列
			this._queueFile = {};//上传队列的文件
			this._fileCache = {};//不能上传相同的图
			this._render();
			this._createFile();
		},
		_render: function(){
			this.get('buttonClass') && this.get('trigger').addClass(this.get('buttonClass'));
		},
		_createFile: function(){
			this.progressID = creatProgressID();
			if(this.buttonFile){
				this.buttonFile.off('change');
				this.buttonFile.remove();
			}
			this.buttonFile = $(fileUploader.template.file(this.get('fileInputClass'), this.get('fileName'), this.progressID)).appendTo(this.get('trigger'));
			
			var self = this;
			this.buttonFile.on('click', function(e){
				self.trigger('click', e);
			})
			this.buttonFile.on('change', function(e){
				//判断文件名
				var file = $(this).val();
				e.url = e.value = file;
				e.progress = self.progressID;
				e.target = $(this);
				
				self.trigger('select', e);
				
				if(!self.isFileExt(file)){
					e.errorMsg = '不允许上传此类型文件';
					if(!self.trigger('progressError', e)){
						alert(e.errorMsg);
					}
					return;
				}
				if (!self.get('isRepeat') && self._fileCache[file] ) {
					e.errorMsg = '当前文件已经存在';
					
					if(!self.trigger('progressError', e)){
						alert(e.errorMsg);
					}
					return;
				}
				//不允许多个上传的情况
				if (!self.get('isMutilple') && self._uploading){
					e.errorMsg = '多个文件不能同时上传';
					
					if(!self.trigger('progressError', e)){
						alert(e.errorMsg);
					}
					
					return;
				}
				
				/*
				if (!self.get('max')){
					self.buttonFile && self.buttonFile.hide();
					
				  	alert("上传文件数量不能超过" + self.get('max') + "个");
					self._createFile();
				  	return false;
				}*/
				
				self._fileCache[file] = 1;
				self._fileCache[self.progressID] = file;
				self.trigger('startUpload', e);
				
				if(self._isCancel){
					return;
				}
				
				self._onProgresreading();
				
			});
		},
		setCancel: function(b){
			if(b){
				this._isCancel = true;
			} else {
				delete this._isCancel;
			}
		},
		
		//当准备开始上传
		_onProgresreading: function(){
			var self = this,
				max = this.get('max'),
				progressID = this.progressID,
				e = {};
				
			if(util.type.isBoolean(max)){
				this.set('max', max - 1);			 
			}
			e.target = this.buttonFile;
			e.id = this.progressID;
			var value = e.url = this.buttonFile.val();
			if(this._queue.length){
				this.trigger('progressReadQueue', e);
				this.queue.push({
					progressID : this.progressID,
					file : this.buttonFile
				});
				return this._createFile();
			} else if( this._uploading ) {
				return false;
			}
			
			this._queueFile[value] = true;
			
			//准备上传
			value.indexOf('\\') < 0 ? value : value.substring(value.lastIndexOf('\\') + 1);
			this.trigger('progressReading', e);
			
			if(this._isCancel){
				return;
			}
			
			//开始上传,当前没有开始一个上传的时候
			if(!this._uploading) {
				this._createFormIFrame();
				this.buttonFile.appendTo(this._form);
				this._uploading = true;
				this._nowProgressID = progressID;
				if(this.get('uploadData')){
					$.each(this.get('uploadData'), function(name, val){
						self._form.prepend(fileUploader.template.hidden(name, val));
					});
				}
				this._form.prepend(fileUploader.template.hidden(this.get('totalParam'), this.get('maxNumber')));
				
				try{
					this._form.submit();
				} catch (e){
					alert('请用IE6以上浏览器传附件!');
				}
				//是否显示上传进度
				this.get('progressURL') && this._onProgressstart(progressID);
			}			
			this._createFile();
		},
		//开始上传
		_onProgresstart: function(progressID){
			//正常请求次数
			var self = this,
				startTime = new Date;
			
			this._progresNumber = 0;
			this._nocancel = true;
			
            (function(){
                var callee = arguments.callee,
					url, type;
                if(self.get('progressURL').indexOf(win.location.host) == -1){
                    url = self.get('progressURL') + '?X-Progress-ID=' + progressID + '&jsonpcallback=?';
                    type = 'jsonp';
                } else {
                    url = self.get('progressURI') + '?X-Progress-ID='+ progressID;
                    type = 'get';
                }
                $.ajax({
                    url: url,
                    type: type,
                    dataType: 'json',
                    success:function(e){
                        if (!self._nocancel)
							return;
                        if (e.state == 'uploading'){
                            // 上传数据完毕之后不一定上传成功，后台还需要拷贝,等待拷贝的时间里设置进度为99%
                            if (parseFloat(e.received) >= parseFloat(e.size)){
                                self._onProgresing(99 ,100, progressID);
                                //self._uploading = false;
                            } else {
                                self._onProgresing(parseFloat(e.received), parseFloat(e.size), progressID);
                            }
                            if(++self._progresNumber == 1){
                                self._progresstime = (+new Date) - startTime;
                            }
                            self._uploading && callee();
                        } else if (e.state == 'done') {
							self.setCancel();
                            self._uploading = false;
                        } else {
                            setTimeout(function(){
								self._uploading && callee();
							}, 2000);
                        }
                    }
                });
            })();
		},
		//上传中
		_onProgresing: function(uploaded , total , progressID , time){
			//第一次成功返回数据的时候判断大小
			var e = {
				progress:progressID,
				target: this.buttonFile,
				value: this.buttonFile.val()
			}
			if ( this._progresNumber == 1 ) {
				if ( this.get('maxSize') * 1024 < total ) {
					e.errorMsg = '上传尺寸超过最大值:'+(this.get('maxSize') / 1024) + 'M';
					if(!this.trigger('progressError', e)){
						alert(e.errorMsg);
					}
					this._uploading = false;
					this.setCancel();
					return this._onCancelUpload(progressID);
				}
			}
			
			e.uploaded = uploaded;
			e.total = total;
			e.time = time || this._progressTime || 1000;
			this.trigger('progressing', e);
		},
		_onProgresed: function(url, e){
			var self = this,
				obj = {
					progressID: this._nowProgressID,
					url: url,
					data: e,
					target: this.buttonFile
				};
			this._removeFormIFrame();
			//调用上传结束的处理
			if(this._progresNumber == 0 ){
				//这里处理图片太小没有进度条的情况
				this._onProgresing(Math.random(),1 ,this._nowProgressID ,1000);
				(function(nowProgressID, url){
					setTimeout(function(){
						//上传结束
						self.trigger('progresed', obj);
                        self._uploading = false;
						self._progresNumber = 0;
					}, 1000);
				})(this._nowProgressID, url);
			} else {
				this.trigger('progresed', obj);
				this.setCancel();
                this._uploading = false;
				this._progresNumber = 0;
			}
		},
		_onCancelUpload: function( progressID ){
			for(var len = this._queue.length - 1; len >= 0 ; len--){
				if (this._queue[len].progressID == progressID){
					this._queue.splice(len, 1);
				}
			}
			delete this._fileCache[this._fileCache[progressID]];
			
			var max = this.get('max');
			if(typeof(max) != "boolean"){
				this.set('max', max + 1);			 
			}
			
			if (this._nowProgressID == progressID){
				this._nocancel = false;
				this._removeFormIFrame();
				this.trigger('cancelUpload',{
					progress: progressID,
					target: this.buttonFile,
					url: this.buttonFile.val()
				});
				this._uploading = false;
				this.setCancel();
				this._progresNumber = 0;
				//上传剩下的队列
				this._uploadQueue();
			}	
		},
		_onProgressError: function(url, e){
			this.trigger('progressError',{
				progress:this._nowProgressID,
				data: e,
				url: url,
				target: this.buttonFile
			});
		},
		//上传队列中的数据
		_uploadQueue: function(){
			//当存在queue的情况下
			if ( this._queue.length ) {
				var shift = this._queue.shift(),
					self = this;
				this._createFormIFrame();
                // 改变FOMR的X-Progress-ID,队列才能获取进度
                this._form.attr('action', this._form.attr('action').replace(/(X-Progress-ID=)([0-9.]+)$/,'$1' + shift.progressID));
				shift.file.appendTo(this.form);
				$.each(this.get('uploadData'), function(name, value){
					self._form.prepend(fileUploader.template.hidden(name, val));
				});
				this._form.prepend(fileUploader.template.hidden(this.get('totalParam'), this.get('max')));
				this.trigger('progressReading',{
					progress: shift.progressID,
					url: shift.file.val(),
					target: this.buttonFile
				});
				
				this._uploading = true;
				setTimeout(function(){
					self._nowProgressID = shift.progressID;
					self._form.submit();
				},100);
				
				this.options.progressURL && this._onProgresstart(shift.progressID);
			}
		},
		//创建上传代理文件
		_createFormIFrame: function(){
			if (!this._iframe) {
				var name = 'uploadpRrogress_'+( +new Date ) , 
					self = this;
				
				var domain = '',
					callback = this.callback = 'uploadSuccess'+(+new Date);
				if (this.get('domain') && doc.domain.indexOf(this.get('domain')) > -1){
					doc.domain = this.get('domain');
					domain = 'domain=' + doc.domain;
				}
				//var url = this.options.uploadURL + (this.options.uploadURL.indexOf('?') > -1 ? '&':'?') + domain + '&jsonpcallback=' + callback + "&X-Progress-ID=" + this.progressID;
				var url =  this.get('uploadURL');
				
				/*
				window[callback] = function(e){
					self.uploading = false;
					self.removeFormIframe();
					if(e.state == 1){
						self.onProgresed(e.msg || e.img, e);
					//上传失败
					} else {
						self.onProgressError(e.msg);
					}
					self.uploadQueue();
				};
				*/
				
				this._iframe = $(fileUploader.template.iframe(name)).appendTo(doc.body);
				this._form = $(fileUploader.template.form(url, name)).appendTo(doc.body);
				this._getResponse(function(e){
					self._removeFormIFrame();
					var url = self.get('param') ? e[self.get('param')] : self.get('imageURL') + (e.fileName || '');
					if(e.status == 1){
						self._onProgresed(url, e);
					//上传失败
					} else {
						self._onProgressError(url, e);
					}
					self._uploading = false;
					self.setCancel();
					self._uploadQueue();
				});
			}			
		},
		_getResponse: function(func){
			var self = this,
				iframe = this._iframe[0],
				response;
			this._iframe.on('load', function(){
                var idoc = iframe.contentDocument ? iframe.contentDocument : win.frames[iframe.id].document;

                // fixing Opera 9.26,10.00
                if (idoc.readyState && idoc.readyState != 'complete') {
                    return;
                }
                // fixing Opera 9.64
                if (idoc.body && idoc.body.innerHTML == "false") {
                    return;
                }

                if (idoc.XMLDocument) {
                    // response is a xml document Internet Explorer property
                    response = idoc.XMLDocument;

                } else if (idoc.body) {
                    // response is html document or plain text
                    response = idoc.body.innerHTML;
					if (idoc.body.firstChild && idoc.body.firstChild.nodeName.toUpperCase() == 'PRE') {
						response = idoc.body.firstChild.firstChild.nodeValue;
					}

					if (response) {
						response = eval("(" + response + ")");
					} else {
						response = {};
					}
					
                    //判断是否加有<pre>标签
                    if (idoc.body.firstChild.nodeName.toUpperCase() == 'PRE') {
                        response = idoc.body.firstChild.firstChild.nodeValue;
					}
                } else {
                    response = idoc;
                }
				func.call(self, response);
			});
		},
		//删除代理
		_removeFormIFrame: function(){			
			if(this._iframe){
				this._iframe.remove();
				this._form.remove();
				this._iframe = this._form = null;				
			}
		},
		_refreshNum:function(num){
			var max = this.get('max');	
			if(typeof(max) != "boolean"){
				this.set('max', num || max + 2);
			}
			if(this.get('max') >= 1){
			  	this.buttonFile && this.buttonFile.show();
			}
		},
		isFileExt: function(file){
			// 获取后缀
			var fileExt = file.substring(file.lastIndexOf('.'), file.length).toLowerCase();
			if(this.get('fileExt').indexOf(fileExt) == -1){
				return false;
			}
			return true;
		},
		destory: function(){
			this.buttonFile.off('change').remove();
			this._removeFormIFrame();
			fileUploader.parent('destory').call(this);
		}
	});
	
	return fileUploader;
});