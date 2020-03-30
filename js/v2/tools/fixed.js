// JavaScript Document

define('tools.fixed', function(require, exports, module){

	var fixed = exports,
		isIE6 = !-[1,] && !window.XMLHttpRequest,
		doc = document,
		$ = module['jquery'];
	
	if(isIE6){
		var html = doc.getElementsByTagName('html')[0];
		doc.execCommand("BackgroundImageCache", false, true);
		html.style.backgroundImage = 'url(about:blank)';
		html.style.backgroundAttachment = 'fixed';
	}
	
	fixed.pin = isIE6 ? function( elem , x, y, r, b ){
		elem = check(elem);
		var style = getStyle(elem),
			scroll = getScroll(),
			dom = '(document.documentElement || document.body)',
			x = x || getValue(style.left),
			y = y || getValue(style.top),
			left, top;
			
		if(b){
			var by = getValue(style.borderTopWidth) + getValue(style.borderBottomWidth);
			y = getValue(style.height) + by + y;
			top = 'eval(' + dom + '.scrollTop + ' + dom + '.clientHeight - ' + y + ') + "px"';
		} else {
			y = y - scroll.top;
			top = 'eval(' + dom + '.scrollTop + ' + y + ') + "px"';
		}
		
		if(r){
			var bx = getValue(style.borderLeftWidth) + getValue(style.borderRightWidth);
			x = getValue(style.width) + bx + x;
			left = 'eval(' + dom + '.scrollLeft + ' + dom + '.clientWidth - ' + x + ') + "px"';
		} else {
			x = x - scroll.left;
			left = 'eval(' + dom + '.scrollLeft + ' + x + ') + "px"';
		}
		
		style = elem.style;
		style.position = 'absolute';
		style.removeExpression('left');
		style.removeExpression('top');
		style.setExpression('left', left);
		style.setExpression('top', top);
			
	} : function( elem, x, y, r, b ){
		var elem = $(check(elem)),
			css = {position: 'fixed'};
			b = b ? 'bottom' : 'top',
			r = r ? 'right' : 'left';
		css[b] = y || 0;
		css[r] = x || 0;
		elem.css(css);
	};
	fixed.unpin = function( elem , styleObj){
		elem = check(elem);
		var style = check(elem).style;
		if(isIE6){
			style.removeExpression('left');
			style.removeExpression('top');
		}
		$(elem).css(styleObj || {
			'position': '',
			'left': 'auto',
			'top': 'auto'
		});
	}
	
	function check( elem ){
		elem = $(elem)[0];
		if(elem.nodeType !== 1){
			throw new Error('tools.fixed: 无效html标签');
		}
		return elem;
	}
	function getScroll(){
		var html = doc.getElementsByTagName('html')[0],
			dd = doc.documentElement,
			db = doc.body;
		return {
			left: Math.max(dd.scrollLeft, db.scrollLeft),
			top: Math.max(dd.scrollTop, db.scrollTop)
		}
	}
	function getStyle(elem){
		if(elem.currentStyle){
			return elem.currentStyle;
		} else {
			return getComputedStyle(elem, false);
		}
	}
	function getValue(name){
		return parseInt(name) || 0;
	}
	
	return fixed;
	
});