var time = 5;
var a = function() {	
	if(time == 0) {
		location.href='//www.huibo.com';
	}	
	time -=1;	
	setTimeout(a,1000);
}
a();