function opennew(newurl,windowName,width,height,scrollbars)
{
	var theLeft,theTop
	theLeft=(screen.width-width)/2-2
	theTop=(screen.height-height)/2
	if(scrollbars==0 || scrollbars==1){
		window.open(newurl,windowName,'width='+width+',height='+height+',scrollbars='+scrollbars+',status=0,toolbar=0,resizable=1,left='+theLeft+',top='+theTop+'').focus();
	}
	else{ //2
		window.open(newurl,windowName,'width='+width+',height='+height+',scrollbars=1,status=0,toolbar=0,resizable=1,left='+theLeft+',top='+theTop+'').focus();
	}
}
