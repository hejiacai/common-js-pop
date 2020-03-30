function hovChange(a,b,c){
	$(a).find(b).hover(function(){
		$(this).addClass(c);
	},function(){
		$(this).removeClass(c);
	})
} 