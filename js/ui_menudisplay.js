// JavaScript说明
// a为父级
// b为指向对象
// c为显示对象
// dClass为d需追加的class
function menuDis(a,b,c,dClass){
	var d = $(a).find(b);//找到指向的对象
	var e = $(a).find(c);
	d.click(function(){
		$(this).addClass(dClass);
		e.bind('mouseleave',function(){
			d.removeClass(dClass);
		});
		d.bind('mouseleave',function(){
			d.removeClass(dClass);
		});
	});
}