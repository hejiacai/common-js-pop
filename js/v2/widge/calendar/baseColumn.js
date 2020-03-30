// JavaScript Document
define('widge.calendar.baseColumn', 'tools.dateFormat', function(require, exports, module){

	var $ = module['jquery'],
		shape = module['base.shape'],
		dateFormat = module['tools.dateFormat'],
		util = require('base.util'),
		currentDate = new dateFormat();
		
	var baseColumn = shape(function(o){
		baseColumn.parent().call(this, util.merge({
			template: null,
			format: 'yyyy-MM-dd',
			range: null,
			lang: {}
		}, o));
		this._focus = currentDate;
	});
	
	baseColumn.implement({
		setFocus: function(val){
			if(!val){
				return this._focus = currentDate;
			}
			if(dateFormat.isDate(val)){
				return this._focus = val;
			}
			return this._focus = new dateFormat(val);
		},
		setRange: function(val){
			if(!val){
				return this._range = null;
			}
			if(util.type.isArray(val)){
				var start = val[0];
				if((start && start.length > 4) || util.type.isDate(start)){
					start = new dateFormat(start);
				}
				var end = val[1];
				if((end && end.length > 4) || util.type.isDate(end)){
					end = new dateFormat(end);
				}
				return this._range = [start, end];
			}
			return this._range = val;
		},
		_compileTemplate: function(){
			var fn = this.get('template');
			if(!fn){
				return '';
			}
			var model = this.getModel(),
				lang = this.get('lang') || {};
			
			if(!model){
				return '';
			}
			
			
			return fn(model, {helpers: {'lang': function(key){return lang[key] || key}}});
		},
		_renderElement: function(){
			this.element = $(this._compileTemplate());
		},
		show: function(){
			this.element.show();
		},
		hide: function(){
			this.element.hide();
		},
		refresh: function() {
			this.element.html($(this._compileTemplate()).html());
		}
	});
	
	baseColumn.isInRange = function(date, range, f){
		if(range == null){
			return true;
		}
		if(f && date){
			date = date.getBegin('dd');
		}
		
		if(util.type.isArray(range)){
			var start = range[0],
				end = range[1],
				result = true;
			if(start){
				if(f){
					start = start.getBegin('dd');
				}
				result = result && date >= start;
			}
			if(end){
				if(f){
					end = end.getBegin('dd');
				}
				result = result && date <= end;
			}
			return result;
		}
		if (util.type.isFunction(range)) {
			return range(date);
		}
		return true;
	}
	
	exports.baseColumn = baseColumn;
	
});
	