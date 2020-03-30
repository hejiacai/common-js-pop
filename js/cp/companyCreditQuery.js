var gtselect_person = "<select id=gtselect name=gtselect style='width:132px' onchange='creditChangeSelect(this)'>";
    gtselect_person += "<option value=varqymc selected>字号名称</option>";
    gtselect_person += "<option value=varzs>经营场所</option>";
    gtselect_person += "<option value=varzch>工商注册号</option>";
    gtselect_person += "<option value=varfddbr>经营者姓名</option>";
    gtselect_person += "</select>";

var gtselect_company = "<select id=gtselect name=gtselect style='width:132px' onchange='creditChangeSelect(this)'>";
    gtselect_company += "<option value=varqymc selected>企业(机构)名称</option>";
    gtselect_company += "<option value=varzs>住所(经营场所)</option>";
    gtselect_company += "<option value=varzch>工商注册号</option>";
    gtselect_company += "<option value=varfddbr>法定代表人(负责人)</option>";
    gtselect_company += "</select>";

var Query_company_name_key;

var Query_licence_id;

function creditQueryShow(company_name_key,licence_id,company_name)
{	
	Query_company_name_key = company_name_key;
	Query_licence_id = licence_id;
	if(!document.getElementById('CreditQueryDiv'))
	{
		var div=document.createElement('div');
		div.innerHTML = "<div onmousedown=\"fDragging(this, event, true);\" style='padding:1px; display:none;float:left; position:absolute; background:#EFEFEF; border:1px solid #860001; z-index=9998;' id=CreditQueryDiv>数据</div>";
		document.body.appendChild(div);	
	}	
	var scrollPos;
	var scrollPos_left;
	var e = getEvent();
	var x = e.layerX || e.x;
    var y = e.layerY || e.y;
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
	var CreditQueryDiv = document.getElementById('CreditQueryDiv');	
	var content = "";	
	
	//创建表格
	content += "<TABLE width=\"270\" border=0>";
	content += "<TR style=\"cursor:move\">";
	content += "	<TD colspan=2 align=center><strong>重庆工商局查询</strong><\/TD>";
	content += "<\/TR>";	
	content += "<TR>";
	content += "	<TD align=right><\/TD><TD><input onclick='creditChangeType(this)' type='radio' value='1' checked name='creditQueryType' id='creditQueryType'>企业<input onclick='creditChangeType(this)' value='0' type='radio' name='creditQueryType' id='creditQueryType'>个人<\/TD>";
	content += "<\/TR>";
	content += "<TR>";
	content += "	<TD align=right>类型<\/TD><TD><span id='span_gtselect'>" + gtselect_company + "</span><\/TD>";
	content += "<\/TR>";
	content += "<TR>";
	content += "	<TD align=right>关键字<\/TD><TD><input type='text' name='creditQueryKey' id='creditQueryKey' value='" + company_name_key + "' onkeydown='{var i=event.keyCode;if(i==13){document.getElementById(\"querytag\").click();return false;}}'><\/TD>";
	content += "<\/TR>";
	content += "<TR>";
	content += "	<TD colspan=2 align=center><a href='#' onclick=\"localCreditQuery(this,'"+ company_name +"')\" id='localQuery' target=_blank>本地查询</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='creditQuery(this)' id='querytag' target=_blank>工商网查询</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick=\"closeQueryShow()\">关闭</a><\/TD>";
	content += "<\/TR>";
	content += "<\/TABLE>";	

	//if (x - 280 <= 20)
	//{
	//	x = 20;
	//}
	//else
	//{
	//	x = x-280;
	//}	
	
	// if (x-200<=20)
	// {
	// 	x = 20;
	// }
	// else
	// {
	// 	x = x-200;
	// }	
	// if(document.all)
	// {
	// 	//IE
	// 	if (y + 160 >= document.body.clientHeight)
	// 	{
	// 		y = y - 153 + scrollPos;
	// 	}
	// 	else
	// 	{
	// 		y = y + scrollPos + 3;
	// 	}
	// }
	// else
	// {
	// 	//其他
	// 	if (y -scrollPos+160>=document.body.clientHeight)
	// 	{
	// 		y = y - 153 ; 
	// 	}
	// 	else
	// 	{
	// 		y = y + 3; 
	// 	}
	// }		

	CreditQueryDiv.innerHTML = content;
	CreditQueryDiv.style.left = 848+ "px";
	CreditQueryDiv.style.top = 139+ "px";
	CreditQueryDiv.style.width = 270 + "px";
	CreditQueryDiv.style.display = 'block';	
}

function creditChangeSelect(obj)
{
	var	sTypeValue = obj[obj.selectedIndex].value;
	var objSearch = document.getElementById('creditQueryKey');
	if (sTypeValue == "varqymc")
	{
		objSearch.value = Query_company_name_key;
	}
	else if (sTypeValue == "varzch")
	{
		objSearch.value = Query_licence_id;
	}
}

function creditChangeType(obj)
{
	var creditType = obj.value;
	//1 company 0 person
	if (creditType == "1")
	{
		document.getElementById("span_gtselect").innerHTML = gtselect_company;
		document.getElementById("localQuery").style.display = "";
		//document.getElementById("localQuery").disabled = "";
		//document.getElementById("localQuery").target = "_blank";
	}
	else if(creditType == "0")
	{
		document.getElementById("span_gtselect").innerHTML = gtselect_person;
		document.getElementById("localQuery").style.display = "none";
		//document.getElementById("localQuery").disabled = "disabled";
		//document.getElementById("localQuery").target = "";
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

function closeQueryShow() 
{
	//隐藏层
    document.getElementById('CreditQueryDiv').style.display = 'none';
}

function creditQuery(obj)
{
	var url = "";
	var QueryTypeObj = document.getElementsByName('creditQueryType');
	var QueryTypeValue = "";
	for (var i=0; i<QueryTypeObj.length; i++)
    {
        if (QueryTypeObj[i].checked)
        {
            QueryTypeValue = QueryTypeObj[i].value;
			if (QueryTypeValue == "1")
			{
				QueryTypeValue = "qy"
				
				url = "//gsxt.cqgs.gov.cn/?a=b"
			}
			else if (QueryTypeValue == "0")
			{
				QueryTypeValue = "gt"
				url = "//202.98.60.118:8088/lhzx/gtinfoAction.do?method=creditQuery"
			}
            break;
        }
    }
	var searchTxt = document.getElementById('creditQueryKey').value;
	var sTypeObj = document.getElementById('gtselect');
	var	sTypeValue = sTypeObj[sTypeObj.selectedIndex].value;
	var querytj = sTypeObj.selectedIndex+1;
	var param = "&varzch=" + ((sTypeValue=="varzch") ? searchTxt : "") + "&varqymc=" + ((sTypeValue=="varqymc") ? searchTxt : "") + "&varfddbr=" + ((sTypeValue=="varfddbr") ? searchTxt : "") + "&varzcdz=" + ((sTypeValue=="varzs") ? searchTxt : "") ;
	param = "&sType="+ sTypeValue +"&key="+ encodeURI(searchTxt) +"&querytj=" + querytj + "&querytype=" + QueryTypeValue + param +"&intzt=1&message=";
	obj.href = url + param;
}

function localCreditQuery(obj,company_name)
{
	var isDisabled = document.getElementById('localQuery').disabled;
	if(isDisabled)	return false;
	var sTypeObj = document.getElementById('gtselect');
	var	sTypeValue = sTypeObj[sTypeObj.selectedIndex].value;
	var sear_type = "";
	switch (sTypeValue)
	{
		case "varqymc":
			sear_type = "company_name";
			break;
		case "varzs":
			sear_type = "company_addr";
			break;
		case "varzch":
			sear_type = "licence_id";
			break;
		case "varfddbr":
			sear_type = "charge_man";
			break;
	}
	var param = document.getElementById('creditQueryKey').value;
	obj.href = "//crm.boss.huibo.com/outer_com/companyCommerceList.asp?sear_type=" + sear_type + "&Keyword=" + escape(param) + "&real_company_name=" + escape(company_name);
}
