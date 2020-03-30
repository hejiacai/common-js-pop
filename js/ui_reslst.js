//调用方法  $.fn.reslst({offTop:97,defSub:199,scrollSub:102});

(function($){
$.fn.reslst = function(options){
	var a = $(window),
		b = $(document),
		c = a.height(),
		d = a.width(),
		e = c-(options.defSub),     //获得列表非滚动预期高度
		f = c-(options.scrollSub),  //获得列表滚动时预期高度
		g = $('#datLst'),           //获得列表对象
		h = g.find('ul').height();  //获得列表实际高度
		rL = $('#recL');
		j = $('#datPer');
		k = $('#datPerBg');
		l = rL.width(),
		m = $('#content').outerWidth(),
		n = $('#recR'),
		isChange = false;
	var defaults = {
		offTop:97,    //浏览器高度减去该值,获得的左侧数据列表高度
		defSub:199,  //获取数据列表默认状态需减去的高度
		scrollSub:250  //获取数据列表滚动状态需减去的高度
	};
	var options = $.extend(defaults, options);
	this.setLayout = function(){
		if(b.scrollTop() >= options.offTop){
			isChange = true;
			g.css({'height':f});
			if(h>f){
				g.css({'overflow-y':'scroll'});
			}else{
				g.css({'overflow-y':'inherit'});
			}
			rL.css({'position':'fixed','left':(d-m)/2,'top':'0'});
			j.css({'position':'fixed','left':((d-m)/2)+l+1,'top':'0'});
			k.css({'display':'block'});
		}else{
			var _h = e+a.scrollTop();
			var top = g.scrollTop();
			g.css({'height':_h});
			if(h>e){
				g.css({'overflow-y':'scroll'});
			}else{
				g.css({'overflow-y':'inherit'});
			}
			if(isChange&&top>options.offTop) {
				g.scrollTop((top+(f-_h)));
			}
			isChange = false;
			rL.css({'position':'static'});
			j.css({'position':'static'});
			k.css({'display':'none'});
		};
		if(n.height()<(c-97)){
			n.height(c-options.offTop);
		}//初始化设置右侧高度
	};
	var self = this;
	this.action = function(){
		self.setLayout();
		a.scroll(function(){
			self.setLayout();
		});
	};
	/*
	if (!($.browser.msie&&$.browser.version<=6.0)){	
		this.action();
	}*/
	this.action();
};
})(jQuery); 