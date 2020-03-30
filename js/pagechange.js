//a左栏需减去的高度
//b右栏需减去的高度
//c右栏的宽度
//d外部容器总宽度
function pagechange(a,b,c,d){
	var win = $(window);
	var pL = $('#left');
	var pR = $('#right');
	var con = $('#content');
	var head = $('#head');
	var con = $('#content');
	pL.height((win.height())-(head.height())-a);
	pR.height((win.height())-(head.height())-b);
	pR.width((win.width())-(pL.width()));
	if(pR.width()<=c){
		pR.width(c);
		con.width(d);
	}else{con.width('auto')}
	
}