// JavaScript Document
 
define('product.jobFilter.jobFilterActions',
'widge.changeClass',
function(require, exports, module){
 
	var $ = module['jquery'],
		shape = module['base.shape'],
		changeClass = module['widge.changeClass'],
		util = require('base.util');
		
	var jobFilterActions = shape(function(o){
			jobFilterActions.parent().call(this, util.merge({
				container: $('#job_filter_box'),
				menu: {
					container: '.one_sort',
					element: 'li:not(".first")',
					trigger: 'a',
					className: 'current'
				},
				changeClass: {
					element: 'tr:not(".filter_bottom")',
					className: 'mutil_mode'
				},
				normalTrigger: '.actions .mutil',
				mutilTrigger: '.actions .cancelbtn'
			}, o));

			this.init();
		});
	jobFilterActions.implement({
		init: function(){
			this._initMenu();
			this._initElements();
		},
		_initMenu: function(){
			var menuConfig = this.get('menu'),
				container = this.get('container').find(menuConfig.container);
			container.each(function(i){
				new changeClass(
					util.merge(menuConfig, {
						container: container.eq(i),
						triggerType: 'click',
						isTrigger: false
					})
				)
			});
		},
		_initElements: function(){
			var container = this.get('container');
			
			/*
			this._normalChange = new changeClass(
				util.merge(this.get('changeClass'), {
					container: container,
					triggerType: 'click',
					isAllTrigger: false,
					isTrigger: true,
					trigger: this.get('normalTrigger')
				})
			);
			this._mutilChange = new changeClass(
				util.merge(this.get('changeClass'), {
					container: container,
					trigger: this.get('mutilTrigger')
				})
			);
			*/
		}/*,		
		getNormalChange: function(){
			return this.__normalChange;
		},
		getMutilChange: function(){
			return this._mutilChange;
		}*/
	});
	function renderContent(item, content){
		item.html(content);
	}
	
	return jobFilterActions;
});