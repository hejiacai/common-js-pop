// JavaScript Document

define("widge.pageless", function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util'),
		doc = document,
		win = window;
	
	var pageless = shape(function(o){
			pageless.parent().call(this, util.merge({
				element: $('#pageless_container'),
				content: 'ul',
				loader: '.loading',
				url: win.location.href,
				data: null,
				dataType: 'json',
				type: 'post',
				dataValue: 'data',
				distance: 200,
				loadHTML: '<img src="../../img/common/loading.gif" />正在加载...',
				errorHTML: '加载失败',
				errorClass: 'error',
				end: null,
				page: 1,
				isAdmin: false,
				isClick: false
			}, o));
			this.init();
		});
		
	pageless.implement({
		init: function(){
			var element = this.get('element');
			this.setEnabled(true);
			if(util.type.isString(this.get('content'))){
				this.set('content', element.find(this.get('content')));
			}
			if(util.type.isString(this.get('loader'))){
				this.set('loader', element.find(this.get('loader')));
			}
			this._page = this.get('page');
			this.isLoading = this.hasNext() ? false : true;
			if(this.isLoading || !this.get('end')){
				this.get('loader').remove()
				return;
			}
			var self = this;
			setTimeout(function(){
				self.trigger('init');
			}, 1);
			this._initEvents();
		},
		_initEvents: function(){
			if (this.get('isClick')) {
				this.defaultMsg = this.get('loader').html();
				this.get('loader').on('click', util.bind(this.click, this));
			} else {
				$(win).on("scroll.pageless", util.bind(this.scroll, this));
			}
			this.get('loader').show();
		},
		stopListener:function(){
			this.get('isClick') ? this.get('loader').off('click') : $(win).off(".pageless", this.scroll);
		},
		click: function(){
			var status = 'click';
			if(!this.isLoading){
				this.loadMsg();
			} else {
				status = 'wait';
			}
			this.trigger(status);
		},
		scroll:function () {
			if(this.hasNext()){
				var c = $(doc).scrollTop() + $(win).height() >= $(doc).height() - this.get('distance');
				if(c && !this.isLoading){
					this.loadMsg();
				}
			} else {
				this.stop();
				this.trigger('stop');
			}
		},
		stop:function(b){
			this.stopListener();
			this.loading(b);
		},
		loading:function (c) {
			var loader = this.get('loader');
			if(!this.get('isClick')){
				if(c === true){
					loader.fadeIn("normal");
				} else {
					loader.fadeOut("normal");
				}
			} else {
				if(c === true){
					this.showStatus();
				} else {
					loader.html(this.defaultMsg);
				}
				if(!this.hasNext()){
					loader.fadeOut("normal");
				}
			}
			this.isLoading = c;
		},
		loadMsg:function(){
			var self = this;
			this.showStatus();
			this.loading(true);
			this._page++;
			
			$.ajax({
				url: this.get('url').replace('{}', this._page),
				type: this.get('type'),
				dataType: this.get('dataType'),
				data: this.get('data'),
				success: util.bind(this._success, this),
				error: util.bind(this._error, this)
			});
		},
		_success: function(e){
			if(this.data(e, true)){
				this.render(this.data(e), true);
				this.trigger('success', e);
				if(!this.hasNext()){
					this.stop();
				}
			} else {
				this.stop();
			}
			this.loading(false);
			this.trigger('flush');
		},
		_error: function(e){
			this.showStatus(true);
			this._page--;
			this.trigger('error', e);
		},
		data:function(data, b){
			var f;
			switch(this.get('dataType')){
				case "json":
					try {
						return b ? json && this.getJsonParam(data, "msg") : this.getJsonParam(data);
					} catch(e) {
						return b ? data && this.getJsonParam(data, "msg") : this.getJsonParam(data);
					}
					break;
				default:
					return data;
					break;
			}
		},
		getJsonParam:function(data, param){
			var f;
			if(param){
				f = data[param];
			}else{
				f = data[this.get('dataValue')];
			}
			return f;
		},
		render:function(msg, b){
			var wrapper = this.get('isAdmin') ? $('<div></div>').css('opacity',0).appendTo(this.get('content')) : this.get('content');
			this.loading(false);
			wrapper.append(msg);
			this.get('isAdmin') && wrapper.stop(true, false).animate({'opacity':1}, 500);
			
			var self = this;
			b && setTimeout(function(){
				self.trigger('update');
			}, 1);
		},
		showStatus:function(b){
			var loader = this.get('loader');
			if(b){
				loader.addClass(this.get('errorClass')).html(this.get('errorHTML'));
			} else {
				loader.removeClass(this.get('errorClass')).html(this.get('loadHTML'));
			}
		},
		hasNext: function(){
			return this._page < this.get('end');
		},
		setEnabled: function(b){
			this.set('enabled', b);
		}
	});
		
	return pageless;
});