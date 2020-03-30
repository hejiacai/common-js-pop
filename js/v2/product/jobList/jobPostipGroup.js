// JavaScript Document
define('product.jobList.jobPostipGroup', 'product.jobList.jobPostip', function(require, exports, module){
	
	var $ = module['jquery'],
		jobPostip = module['product.jobList.jobPostip'],
		shape = module['base.shape'],
		util = require('base.util'),
		doc = document;
		
	var jobPostipGroup = shape(function(o){
			this._config = util.merge({
				container: $('#job_list_table'),
				element: '.pos_overlay',
				arrow: '.pos_overlay_arrow',
				trigger: '.des_title',
				className: 'jobPostip',
				padding: 20, 
				width: 400,
				height: 'auto',
				delay: 300,
				showDelay: 600,
				isFix: false
			}, o);
			jobPostipGroup.parent().call(this, this._config);
			this.init();
		});
	
	jobPostipGroup.implement({
		init: function(){
			var self = this,
				container = this.get('container');
				
			this._element = container.find(this.get('element')),
			this._trigger = container.find(this.get('trigger'));
			delete this._config.element;
			this._config['trigger'] = this._trigger;
			delete this._config.arrow;
			this._jobPostip = new jobPostip(this._config);
			delete this._config;
			this._initEvents();
		},
		_initEvents: function(){
			var self = this, 
				container = this.get('container');
			
			if(!this.get('isFix')){
				container.on('mouseenter', this.get('trigger'), function(e){
					self._switchContent(e);
				}).on('mouseleave', this.get('trigger'), function(){
					self._leaveHandle();
				});
			}
			this.updateTrigger();
			
			this._jobPostip.get('element').on('mouseenter', function(){
				self._enterHandle();
			}).on('mouseleave', function(){
				self._leaveHandle();
			});
		},
		_enterHandle: function(){
			this._jobPostip.show();
		},
		_leaveHandle: function(){
			this._timer && clearTimeout(this._timer);
			this._jobPostip.hide();
		},
		_switchContent: function(e){
			var self = this;
			var container = this.get('container');
			this._trigger = container.find(this.get('trigger'));
			var index = this._trigger.index($(e.currentTarget));
			
			this._jobPostip.set('trigger', $(e.currentTarget));

			this._timer = setTimeout(function(){
				self._jobPostip.setContent(container.find(self.get('element')).eq(index).html());
				self._jobPostip.setPosition();
				self._enterHandle();
			}, this.get('showDelay'));
		},
		getElement: function(){
			return this._jobPostip.get('element');
		},
		updateTrigger: function(){
			if(!this.get('isFix')) return;
			var container = this.get('container');
			var self = this;
			
			this._trigger.off('mouseenter mouseleave');
			this._trigger = container.find(this.get('trigger'));
			
			this._trigger.on('mouseenter', function(e){
				self._switchContent(e);
			}).on('mouseleave', function(){
				self._leaveHandle();
			});
		},
		destory: function(){
			delete this._items;
			delete this._element;
			delete this._trigger;
			jobPostipGroup.parent('destory').call(this);
		}
	});
	
	function getIndex(trigger, element, target){
		var index = trigger.index(target);
		if(index < 0){
			index = element.index(target);
		}
		return index;
	}
	
	return jobPostipGroup;
});