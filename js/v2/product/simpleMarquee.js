define('product.simpleMarquee', function(require, exports, module){
	
	var $ = module['jquery'],
		shape = module['base.shape'],
		util = require('base.util');
	
	var simpleMarquee = shape(function(o){
			simpleMarquee.parent().call(this, util.merge({
				element: $('#hbPopuList'),
				timeout: 1000
			}, o));
			this.init();
		});
	
	simpleMarquee.implement({
		init: function(){
			var element = this.get('element');
			if(util.type.isString(element) || !element.length)
				return;
			this.updateItem();
			this.run();
			this._initEvents();
		},
		isScroll: function(){
			this._itemHeight = this.get('item').outerHeight(true);
			var element = this.get('element'),
				length = this.get('item').length,
				viewHeight = element.outerHeight(true),
				totalHeight = length * this._itemHeight;
			return viewHeight < totalHeight;
		},
		run: function(){
			this.updateItem();
			if(this.isScroll()){
				this.timer = setInterval(util.bind(this._scroll, this), this.get('timeout'));
			}
		},
		stop: function(){
			if(this.timer){
				clearInterval(this.timer);
				this.timer = null;
			}
		},
		updateItem: function(){
			this.set('item', this.get('element').children());
		},
		_initEvents: function(){
			var element = this.get('element'),
				self = this;
			element.on('mouseenter', function(){
				self.stop();
			}).on('mouseleave', function(){
				self.run();
			});
		},
		_scroll: function(){
			var item = this.get('item'),
				element = this.get('element'),
				cloneItem = item.eq(0).clone();
				
			item.eq(0).remove();
			element.append(cloneItem);
			this.updateItem();
		}
	});
	
	return simpleMarquee;
});