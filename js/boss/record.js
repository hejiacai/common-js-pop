// 获取录音记录
// <a href="#" onclick="getRecord(日志编号);return false;" >[听]</a>
// 

var g_record = new Object();
var cur_rec,g_x,g_y;
var exit = false;

function getRecord(logid)
{
	exit = false;
	createDiv();
	var e = getEvent();
	g_x = e.layerX || e.x;
    g_y = e.layerY || e.y;
	var s = document.createElement('script');
	s.src = remoteUrl + "?logid="+logid+"&f=showRecord";
	document.body.appendChild(s);
} 

function getRecordFile(logid)
{
	var s = document.createElement('script');
	s.src = remoteUrl + "?logid="+logid+"&f=downloadRecord";
	document.body.appendChild(s);
} 

function createDiv()
{
	if(!document.getElementById('newDiv'))
	{
		var div=document.createElement('div');
		//div.id = "newDiv";
		div.innerHTML = "<div onmousedown=\"fDragging(this, event, true);\" style='padding:1px; display:none;float:left; position:absolute; background:#EFEFEF; border:1px solid #860001; z-index=9999;' id=newDiv>数据</div>";
		document.body.appendChild(div);	
	}	
}


function getEvent()
{
    var i = 0;
    if(document.all) return window.event;
    func = getEvent.caller;
    while(func != null)
    {
        var arg0 = func.arguments[0];
        if(arg0)
        {
            if(arg0.constructor == MouseEvent)
            {
                return arg0;
            }
        }
        func = func.caller;
    }
    return null;
}

function showRecord(record)
{
	var x = g_x;
    var y = g_y;
    var scrollPos;
	var scrollPos_left;
    if (typeof window.pageYOffset != 'undefined') {
        scrollPos = window.pageYOffset;
		scrollPos_left = window.pageXOffset;
    }
    else if (typeof document.compatMode != 'undefined' &&
         document.compatMode != 'BackCompat') {
        scrollPos = document.documentElement.scrollTop;
		scrollPos_left = document.documentElement.scrollLeft;
    }
    else if (typeof document.body != 'undefined') {
        scrollPos = document.body.scrollTop;
		scrollPos_left = document.body.scrollLeft;
    }
	var newdiv = document.getElementById('newDiv');
	var content = "";	

	if (record.count==0)
	{
		alert('无录音记录');
		return;
	}
	g_record = record;
	//创建表格
	content += "<TABLE border=0>";
	content += "<TR style=\"cursor:move\">";
	content += "	<TD align=right><a href='javascript:closeRecord();void(0)'>关闭</a><\/TD>";
	content += "<\/TR>";
	content += "<TR>";
	content += "	<TD bgcolor=\"#000000\"><font color=\"#FFFFFF\"><span id=\"recordInfo\">正在播放第条电话记录</span></font><\/TD>";
	content += "<\/TR>";
	content += "<TR>";
	content += "	<TD>";
	
	//加入播放器
	content += "<object classid=\"clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95\" id=\"MediaPlayer1\" width=\"200\" height=\"65\">";
	content += "  <param name=\"AudioStream\" value=\"-1\">";
	content += "  <param name=\"AutoSize\" value=\"0\">";
	content += "  <param name=\"AutoStart\" value=\"-1\">";
	content += "  <param name=\"AnimationAtStart\" value=\"0\">";
	content += "  <param name=\"AllowScan\" value=\"-1\">";
	content += "  <param name=\"AllowChangeDisplaySize\" value=\"-1\">";
	content += "  <param name=\"AutoRewind\" value=\"0\">";
	content += "  <param name=\"Balance\" value=\"0\">";
	content += "  <param name=\"BaseURL\" value>";
	content += "  <param name=\"BufferingTime\" value=\"5\">";
	content += "  <param name=\"CaptioningID\" value>";
	content += "  <param name=\"ClickToPlay\" value=\"-1\">";
	content += "  <param name=\"CursorType\" value=\"0\">";
	content += "  <param name=\"CurrentPosition\" value=\"-1\">";
	content += "  <param name=\"CurrentMarker\" value=\"0\">";
	content += "  <param name=\"DefaultFrame\" value>";
	content += "  <param name=\"DisplayBackColor\" value=\"#4E565C\">";
	content += "  <param name=\"DisplayForeColor\" value=\"16777215\">";
	content += "  <param name=\"DisplayMode\" value=\"0\">";
	content += "  <param name=\"DisplaySize\" value=\"0\">";
	content += "  <param name=\"Enabled\" value=\"-1\">";
	content += "  <param name=\"EnableContextMenu\" value=\"-1\">";
	content += "  <param name=\"EnablePositionControls\" value=\"-1\">";
	content += "  <param name=\"EnableFullScreenControls\" value=\"0\">";
	content += "  <param name=\"EnableTracker\" value=\"-1\">";
	content += "  <param name=\"Filename\" value=\"\">";
	content += "  <param name=\"InvokeURLs\" value=\"-1\">";
	content += "  <param name=\"Language\" value=\"-1\">";
	content += "  <param name=\"Mute\" value=\"0\">";
	content += "  <param name=\"PlayCount\" value=\"1\">";
	content += "  <param name=\"PreviewMode\" value=\"0\">";
	content += "  <param name=\"Rate\" value=\"1\">";
	content += "  <param name=\"SAMILang\" value>";
	content += "  <param name=\"SAMIStyle\" value>";
	content += "  <param name=\"SAMIFileName\" value>";
	content += "  <param name=\"SelectionStart\" value=\"-1\">";
	content += "  <param name=\"SelectionEnd\" value=\"-1\">";
	content += "  <param name=\"SendOpenStateChangeEvents\" value=\"-1\">";
	content += "  <param name=\"SendWarningEvents\" value=\"-1\">";
	content += "  <param name=\"SendErrorEvents\" value=\"-1\">";
	content += "  <param name=\"SendKeyboardEvents\" value=\"-\">";
	content += "  <param name=\"SendMouseClickEvents\" value=\"0\">";
	content += "  <param name=\"SendMouseMoveEvents\" value=\"0\">";
	content += "  <param name=\"SendPlayStateChangeEvents\" value=\"0\">";
	content += "  <param name=\"ShowCaptioning\" value=\"0\">";
	content += "  <param name=\"ShowControls\" value=\"-1\">";
	content += "  <param name=\"ShowAudioControls\" value=\"-1\">";
	content += "  <param name=\"ShowDisplay\" value=\"0\">";
	content += "  <param name=\"ShowGotoBar\" value=\"0\">";
	content += "  <param name=\"ShowPositionControls\" value=\"-1\">";
	content += "  <param name=\"ShowStatusBar\" value=\"-1\">";
	content += "  <param name=\"ShowTracker\" value=\"-1\">";
	content += "  <param name=\"TransparentAtStart\" value=\"0\">";
	content += "  <param name=\"VideoBorderWidth\" value=\"0\">";
	content += "  <param name=\"VideoBorderColor\" value=\"0\">";
	content += "  <param name=\"VideoBorder3D\" value=\"0\">";
	content += "  <param name=\"Volume\" value=\"-320\">";
	content += "  <param name=\"WindowlessVideo\" value=\"0\">";
	content += "<\/object>";	
	content += "	<TD><\/TD>";
	content += "<\/TR>";
	content += "<TR>";

	content += "	<TD>录音记录 ";
	for (var i=0; i<record.items.length; i++)
	{
		content += "	<a href=\"javascript:mediaPlay(" + i + ")\" id='rec_id" + i + "'>" + record.items[i].length + "</a>";		
	}
	content += "<\/TD>";
	
	content += "<\/TR>";
	content += "<\/TABLE>";	
	
	//alert(window.screen.availHeight);
	//alert(scrollPos);
	//alert(y)
	if (x-200<=20)
	{
		x = 20;
	}
	else
	{
		x = x-200;
	}	
	if(document.all)
	{
		//IE
		if (y + 160 >= document.body.clientHeight)
		{
			y = y - 153 + scrollPos;
		}
		else
		{
			y = y + scrollPos + 3;
		}
	}
	else
	{
		//其他
		if (y -scrollPos+160>=document.body.clientHeight)
		{
			y = y - 153 ; 
		}
		else
		{
			y = y + 3; 
		}
	}		
	newdiv.innerHTML = content;
	newDiv.style.left = x;
	newDiv.style.top = y;
	newDiv.style.width = 180 + "px";
	newDiv.style.display = 'block';	
	//打开时默认播放第一条					
	mediaPlay(0);
	loopPlay();	
}

function convertTimepan(span)
{
	var days,hours,minutes,seconds; 
	var ret = "";
	days = Math.floor(span / (24*3600));
	span = span % (24*3600);
	hours = Math.floor(span / 3600);
	var remainSeconds = span % 3600;
	minutes =  Math.floor(remainSeconds / 60);
	seconds = span - hours * 3600 - minutes * 60;
	if (days>0)
	{
		ret += days + "d";
	}
	if(hours>0)
	{
		ret += hours + "h";
	}
	if(minutes>0)
	{
		ret += minutes + "m";
	}
	if(seconds>=0)
	{
		ret += seconds + "s";
	}
	return ret;
}

function mediaPlay(i)
{
	//获取录音信息
	if (i >= g_record.items.length)
	{
		i = 0;
	}
	cur_rec = i;
	var item = g_record.items[i];
	setFont(i)
	document.getElementById('MediaPlayer1').Filename=item.path;		
	var info = "";
	//info += "<marquee derection=\"left\" scrollamount=2>";
	info += convertDateTime(item.callTime) + "  ";
	if (typeof (not_show_record_phone) == 'undefined')
	{
		if (item.out)
		{
			info += item.callerid + "==>" + item.phone;
		}
		else
		{
			info += item.phone + "==>" + item.callerid;
		}
	}
	else
	{
		if (!not_show_record_phone)
		{
			if (item.out)
			{
				info += item.callerid + "==>" + item.phone;
			}
			else
			{
				info += item.phone + "==>" + item.callerid;
			}
		}
	}
	//info += "</marquee>";
	document.getElementById('recordInfo').innerHTML=info;	
}

function convertDateTime(time){
   return time.replace(/(.*)\s(.*)/ig,"$2")
}

function setFont(cur)
{
	for (var i=0; i<g_record.items.length; i++)
	{
		if (cur == i)
		{
			document.getElementById('rec_id' + i).innerHTML = "<font color='red' size=+2>" +  convertTimepan(g_record.items[i].length) + "</font>";	
		}
		else
		{
			document.getElementById('rec_id' + i).innerHTML = convertTimepan(g_record.items[i].length);	
		}
	}
}

function loopPlay(){
	var media = document.getElementById('MediaPlayer1');
	if(media.playState == 0) mediaPlay(cur_rec+1);
	if(!exit)
	{
		setTimeout("loopPlay()", 1000);
	}
	else
	{
		media.Filename = "";
	}
}

function closeRecord() {
	//关闭媒体播放器
	exit = true;
	document.getElementById('MediaPlayer1').Filename = "";	
	//隐藏层
    document.getElementById('newDiv').style.display = 'none';
}

//拖拽
function fDragging(obj, e, limit){ 
    if(!e) e=window.event; 
    var x=parseInt(obj.style.left); 
    var y=parseInt(obj.style.top); 
     
    var x_=e.clientX-x; 
    var y_=e.clientY-y; 
     
    if(document.addEventListener){ 
        document.addEventListener('mousemove', inFmove, true); 
        document.addEventListener('mouseup', inFup, true); 
    } else if(document.attachEvent){ 
        document.attachEvent('onmousemove', inFmove); 
        document.attachEvent('onmouseup', inFup); 
    } 
     
    inFstop(e);     
    inFabort(e) 

    function inFmove(e){ 
        var evt; 
        if(!e)e=window.event; 
         
        if(limit){ 
            var op=obj.parentNode; 
            var opX=parseInt(op.style.left); 
            var opY=parseInt(op.style.top); 
             
            if((e.clientX-x_)<0) return false; 
            else if((e.clientX-x_+obj.offsetWidth+opX)>(opX+op.offsetWidth)) return false; 
             
            if(e.clientY-y_<0) return false; 
            else if((e.clientY-y_+obj.offsetHeight+opY)>(opY+op.offsetHeight)) return false; 
            //status=e.clientY-y_; 
        } 
         
        obj.style.left=e.clientX-x_+'px'; 
        obj.style.top=e.clientY-y_+'px'; 
         
        inFstop(e); 
    } // shawl.qiu script 
    function inFup(e){ 
        var evt; 
        if(!e)e=window.event; 
         
        if(document.removeEventListener){ 
            document.removeEventListener('mousemove', inFmove, true); 
            document.removeEventListener('mouseup', inFup, true); 
        } else if(document.detachEvent){ 
            document.detachEvent('onmousemove', inFmove); 
            document.detachEvent('onmouseup', inFup); 
        } 
         
        inFstop(e); 
    } // shawl.qiu script 

    function inFstop(e){ 
        if(e.stopPropagation) return e.stopPropagation(); 
        else return e.cancelBubble=true;             
    } // shawl.qiu script 
    function inFabort(e){ 
        if(e.preventDefault) return e.preventDefault(); 
        else return e.returnValue=false; 
    } // shawl.qiu script 
} 