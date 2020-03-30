//为防止报错
var jobMenu = (typeof jobMenu) == "undefined" ? eval("({companyLink:'',items:[{station:'',day:'',link:''}]})") :jobMenu;

var num = jobMenu.items.length;
var d = new Date();
var d = new Date(d.getYear(),d.getMonth(),d.getDate());

function getFlag(link){
   return link.replace(/(.*\/){0,}([^\.]+).*/ig,"$2")
}

var getArgs=(function(){
    var sc=document.getElementsByTagName('script');
	var args={},argsStr=[],param,t,name,value;
	var paramsArr=sc[sc.length-1].src.split('?');
	if(paramsArr.length>1)
	{
		paramsArr=paramsArr[1].split('&');		
		for(var ii=0,len=paramsArr.length;ii<len;ii++){
				param=paramsArr[ii].split('=');
				name=param[0],value=param[1];
				if(typeof args[name]=="undefined"){ 
					args[name]=value;
				}else if(typeof args[name]=="string"){ 
					args[name]=[args[name]]
					args[name].push(value);
				}else{  
					args[name].push(value);
				}
		}
	}
    return function(){return args;} //以json格式返回获取的所有参数
})();
num = (typeof getArgs().num) == "undefined" ? num : parseInt(getArgs().num);

if(num > jobMenu.items.length){num = jobMenu.items.length;}
var thisFlag = getFlag(document.location.href);
var count = 0;
var showCount = 0;
for(var i=0;i<jobMenu.items.length;i++)
{	
	if(dateFormat(jobMenu.items[i].day)>=d)
	{	
		if(showCount<num)
		{
			showCount++;
			if(thisFlag==getFlag(jobMenu.items[i].link))
			{			
				document.write("<li>" + jobMenu.items[i].station + "</li>");
			}
			else
			{
				document.write("<li><a href=\"" + jobMenu.items[i].link + "\" target=_blank> " + jobMenu.items[i].station + "</a></li>");
			}	
		}
		count++;
	}
}
if(showCount<count)
{
	document.write("<li class=\"menu_more\"><a href=\"" + jobMenu.companyLink + "\" target=_blank>查看更多职位</a></li>");
}

function dateFormat(date){
	var reggie = /(\d{4})-(\d{1,2})-(\d{1,2})/g;
	var dateArray = reggie.exec(date);
	var dateObject = new Date(
	(+dateArray[1]),
	(+dateArray[2])-1, // Careful, month starts at 0!
	(+dateArray[3])
	);
    return dateObject;
}