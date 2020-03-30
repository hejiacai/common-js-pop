// JavaScript Document

define('product.jobMenu', 
	['widge.changeClass','product.sideMenu.sideSortMenuGroup'],
 function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		changeClass = module['widge.changeClass'],
		sideSortMenuGroup = module['product.sideMenu.sideSortMenuGroup'],
		util = require('base.util'),
		lteIE8 = /\bMSIE [678]\.0\b/.test(navigator.userAgent);
	
	var jobMenu = shape(function(o){
			jobMenu.parent().call(this, util.merge({
				container: $('#side_menu'),
				loader: '.loader',
				element: '.side_menu_list_cont',
				normal:{
					trigger: '.title',
					className: 'side_menu_click',
					otherTrigger: $('#side_menu_items')
				},
				menuGroup: {
					trigger: '.side_menu_list',
					elementItem: '.child_item',
					triggerMenu: 'ul',
					triggerItem: 'li',
					className: 'hover',
					selectedClassName: 'item_selected',
					delay: 120,
					url: {
						host: 'http://119.84.79.102',
						path: '/jobsearch/index/',
						param: null,
						alias: 'alias',
						selectId: null
					}
				},
				one: {
					trigger: '#mutil_btn',
					className: null,
					isParent: false,
					switchClass: '.side_menu_list'
				},
				mutil: {
					trigger: '#cancel_btn',
					className: null,
					isParent: false,
					switchClass: '.mutil_select_group'
				}
			}, o));
			this.init();
		});
	
	jobMenu.implement({
		init: function(){
			this.isInit = true;
			this._initElements();
			this._initMenuGroup();
			this._initEvents();
		},
		_initElements: function(){
			if(!this.get('normal')){
				throw new Error('product.jobMenu: 配置不正确');
			}
			this._loader = this.get('container').find(this.get('loader'));
			this._element = this.get('container').find(this.get('element'));
			this._changeClass = new changeClass(
				$.extend(this.get('normal'), {
					container: this.get('container'),
					triggerType: 'click',
					isDocument: true
				})
			);
			if(util.type.isPlainObject(this.get('one'))){
				this._oneSwitch = this.get('one').switchClass;
				delete this.get('one').switchClass;
				this._oneClass = new changeClass(
					$.extend(this.get('one'), {
						container: this.get('container'),
						triggerType: 'click'
					})
				);
			}
			if(util.type.isPlainObject(this.get('mutil'))){
				this._mutilSwitch = this.get('mutil').switchClass;
				delete this.get('mutil').switchClass;
				this._mutilClass = new changeClass(
					$.extend(this.get('mutil'), {
						container: this.get('container'),
						triggerType: 'click'
					})
				);
			}
		},
		_initMenuGroup: function(){
			if(util.type.isPlainObject(this.get('menuGroup'))){
				var trigger = this.get('container').find(this.get('menuGroup').trigger);
				if(!trigger.length) return;
				this._menuGroup = new sideSortMenuGroup($.extend(
					this.get('menuGroup'), {
						element: this.get('normal').otherTrigger,
						trigger: trigger
					})
				);
				var self = this;
				this._menuGroup.after('_renderTemplate', function(){
					self._loader.hide();
					self._element.show();
				})
			}
		},
		_initEvents: function(){
			var container = this.get('container'),
				oneElement = this._oneSwitch,
				mutilElement = this._mutilSwitch,
				self = this;
			this._changeClass.on('click', function(){
				if(self.isInit){
					setTimeout(function(){
						self._menuGroup.init();
					}, lteIE8 ? 1 : 0);
					delete self.isInit;
				}
			});
			if(oneElement && mutilElement){
				oneElement = container.find(oneElement);
				mutilElement = container.find(mutilElement);
				this._oneClass && this._oneClass.on('click', function(e){
					if(e.status){
						oneElement.hide();
						mutilElement.show();
					}
				});
				
				this._mutilClass && this._mutilClass.on('click', function(e){
					if(e.status){
						mutilElement.hide();
						oneElement.show();
					}
				});
			}
		}
	});
	
	return jobMenu;
});