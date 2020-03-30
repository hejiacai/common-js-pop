$(document).ready(function(){
	$('.drop').bind('click',function(e){
		var dropThis = $(this);
		$('.drop').css({'z-index':'1'});
		$('.drop').removeClass('dropShow');
		$(this).addClass('dropShow').css({'z-index':'3'});
		$(this).find('.dropLst').find('li').click(function(e){
			var setdropVal = $(this).text();
			dropThis.find('.dropSeld').text(setdropVal).removeClass('gray');
			dropThis.removeClass('dropShow').css({'z-index':'1'});
			e.stopPropagation();
		})
		e.stopPropagation();		
	});
	$('body').bind('click',function(e){
		$('.drop').removeClass('dropShow').css({'z-index':'1'});
	})
}); 