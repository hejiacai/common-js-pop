//只输入指定字符串
function keyFilter(theStr){
var tempStr;
tempStr=theStr;
if (event.keyCode == 13) return;
for (i=0;i<tempStr.length;i++){
	if (event.keyCode==tempStr.charCodeAt(i)){
		return;
	}
}
event.returnValue = false;
}

//只输入实数
function keyFilterFloat(me)
{
	if (event.keyCode == 13) return;
	if ((event.keyCode>=48 && event.keyCode<=57) || (event.keyCode==46 && tempStr.indexOf(".")==-1))
		return;
	event.returnValue = false;
}

//只输入整数
function keyFilterInteger(me)
{
	if (event.keyCode == 13) return;
	if (event.keyCode>=48 && event.keyCode<=57)
		return;
	event.returnValue = false;
}