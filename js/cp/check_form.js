/************************************By Zheng Han Lin*****************************\
| 该版本用于日期格式为（yyyy-mm-dd)
| 函数名称：check_form
| 传入参数：form(表单)
| 返回值：boolean型
| 函数功能：自动验证表单的输入值。在控件里加入验证属性即可，不需要修改任何代码。
| 调用方式：onSubmit="return check_form(form1)"
| 验证属性格式：<input ... check_str="控件名称" check_type="验证类型" can_empty="Y" equal="另一个控件的名字">
|     无类型：不写check_type
|     字符串：string,10,20
|     整数型：integer,-111,120
|     浮点型：float,-2.1,10000
|     日期型：date,2003-01-01,2003-08-01
|     时间性：time,8:30,18:30
|     邮  件：email
|     身份证：idcard
|     验证属性带逗号的表示最小值和最大值，如果不指定则不写，但逗号不能省略
| 作者：郑汉林 cqhanlin@163.com
| 创建日期：2002年09月30日
|*********************************************************************************|
| 修改者：郑汉林 cqhanlin@163.com
| 修改日期：2002年10月14日
| 修改功能：增加can_empty属性，当值为"Y"时，即使有check_str，控件的值也可以为空
|	    其主要作用是：要么不输，要么输对
|*********************************************************************************|
| 修改者：郑汉林 cqhanlin@163.com
| 修改日期：2002年11月02日
| 修改功能：增加equal属性，其值为另一控件的名字，验证他们的值是否相等（必须相等）
|*********************************************************************************|
| 修改者：郑汉林 cqhanlin@163.com
| 修改日期：2007年01月04日
| 修改功能：增加not_equal属性，其值为另一控件的名字，验证他们的值是否相等（不能相等）
|*********************************************************************************|
| 修改者：郑汉林 cqhanlin@163.com
| 修改日期：2007年10月03日
| 修改功能：修改程序支持FireFox，将form1.elements[1].check_str修改为form1.elements[1].attributes["check_str"].value
|*********************************************************************************|
| 修改者：
| 修改日期：
| 修改功能：
\*********************************************************************************/

function check_form(form1)
{

//	return false;
   try
   {
	var aa = form1.elements; //document.forms(form1.name).elements;
	var obj = null;
	var jumpFromFor = false;

	for (i=0;i<aa.length;i++)
	{
		jumpFromFor = true;  //如果中途跳出，jumpFromFor的值将被保持为true,表示验证未通过
		if(aa[i].attributes["check_str"]!=null && aa[i].attributes["check_str"].value!="")
		{
			obj = aa[i];

			if(obj.value.length==0)
			{
				if(obj.attributes["can_empty"]!=null && obj.attributes["can_empty"].value=="Y")
				{
					if(i==aa.length-1){jumpFromFor = false;}
					continue;
				}else
				{
					alert("『"+obj.attributes["check_str"].value+"』不能为空，请重新输入","<br>");
					break;
				}
			}

			if(obj.attributes["equal"]!=null && obj.attributes["equal"].value.length>0)
			{
				var obj2 = eval(form1.name+"."+obj.attributes["equal"].value);
				if(obj2 != null)
				{
					if(obj.value != obj2.value)
					{
						alert("『"+obj.attributes["check_str"].value+"』" +
							"必须与『"+obj2.attributes["check_str"].value+"』相同")
						break;
					}
				}
			}

			if(obj.attributes["not_equal"]!=null && obj.attributes["not_equal"].value.length>0)
			{
				var obj2 = eval(form1.name+"."+obj.attributes["not_equal"].value);
				if(obj2 != null)
				{
					if(obj.value == obj2.value)
					{
						alert("『"+obj.attributes["check_str"].value+"』" +
							"与『"+obj2.attributes["check_str"].value+"』不能相同")
						break;
					}
				}
			}

			if(obj.attributes["check_type"]!=null)
			{
				if(obj.attributes["check_type"].value=="email")
				{
					if(!checkEmail(obj))
					{
						alert("您输入的『" + obj.attributes["check_str"].value+"』不是合法的邮件格式","<br>");
						break;
					}
				}
			
				if(obj.attributes["check_type"].value=="idcard")
				{
					if(!checkIDCard2(obj))
					{
						alert("您输入的『" + obj.attributes["check_str"].value+"』不是合法的身份证","<br>");
						break;
					}
				}
			
				if(/^string/.test(obj.attributes["check_type"].value))
				{
					tempArr = check_string(obj);
					if(!tempArr[0])
					{
						alert(tempArr[1]);
						break;
					}
				}

				if(/^float/.test(obj.attributes["check_type"].value))
				{
					tempArr = checkFloat(obj);
					if(!tempArr[0])
					{
						alert(tempArr[1]);
						break;
					}
				}

				if(/^integer/.test(obj.attributes["check_type"].value))
				{
					tempArr = checkInteger(obj);
					if(!tempArr[0])
					{
						alert(tempArr[1]);;
						break;
					}
				}
			
				if(/^date/.test(obj.attributes["check_type"].value))
				{
					tempArr = checkDate(obj);
					if(!tempArr[0])
					{
						alert(tempArr[1]);;
						break;
					}
				}
			
				if(/^time/.test(obj.attributes["check_type"].value))
				{
					tempArr = checkTime(obj);
					if(!tempArr[0])
					{
						alert(tempArr[1]);;
						break;
					}
				}
			}
			
		}
		jumpFromFor = false; //循环正常结束，未从循环中跳出,验证结果：全部满足要求			
	}
	if(jumpFromFor)
	{
		try
		{
			obj.focus();
			if(obj.type=="text") {obj.select();}
		}
		catch(aa){}
		return false;
	}
	return true;
   }
   catch(err)
   {
//	alert(err+i);
	alert(err.Description);
	return false;
   }
}

function checkEmail(obj)
{
//	if(obj.attributes["can_empty"].value=="Y" && obj.value.length==0) return true;
//	return(/^([\.\S]){1,}@([\S-]){1,}(\.([\S]){1,}){1,}$/.test(obj.value));
	return(/^\w+([-.]\w+)*@([\w-]){1,}(\.([\w]){1,}){1,}$/.test(obj.value));
}

function checkIDCard(obj)
{
//	if(obj.attributes["can_empty"].value=="Y" && obj.value.length==0) return true;
	if(obj.value.length==15)
		return(/^([0-9]){15,15}$/.test(obj.value));
	if(obj.value.length==18)
		return(/^([0-9]){17,17}([0-9xX]){1,1}$/.test(obj.value));
	return false;
}

function checkIDCard2(obj){ 
	var ID_ICCID = obj.value;
	ID_ICCID = ID_ICCID.toUpperCase();
	var Errors=new Array( 
	"正确", 
	"身份证号码位数不对!", 
	"身份证号码出生日期超出范围或含有非法字符!", 
	"身份证号码校验错误!", 
	"身份证地区非法!" 
	); 

	var area={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"}  
	var ID_ICCID,Y,JYM; 
	var S,M; 
	var ID_ICCID_array = new Array(); 
	ID_ICCID_array = ID_ICCID.split(""); 
	//地区检验 
	if(area[parseInt(ID_ICCID.substr(0,2))]==null) return false;//return Errors[4]; 
	//身份号码位数及格式检验 
	switch(ID_ICCID.length)
	{ 
		case 15: 
			if ( (parseInt(ID_ICCID.substr(6,2))+1900) % 4 == 0 || ((parseInt(ID_ICCID.substr(6,2))+1900) % 100 == 0 && (parseInt(ID_ICCID.substr(6,2))+1900) % 4 == 0 )){ 
				ereg=/^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;//测试出生日期的合法性 
			} else { 
				ereg=/^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;//测试出生日期的合法性 
			} 
			if(ereg.test(ID_ICCID)) return true;//return Errors[0]; 
			else return false;//return Errors[2]; 
			break; 
		case 18: 
			//18位身份号码检测 
			//出生日期的合法性检查  
			//闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9])) 
			//平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8])) 
			if ( parseInt(ID_ICCID.substr(6,4)) % 4 == 0 || (parseInt(ID_ICCID.substr(6,4)) % 100 == 0 && parseInt(ID_ICCID.substr(6,4))%4 == 0 )){ 
				ereg=/^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;//闰年出生日期的合法性正则表达式 
			} else { 
				ereg=/^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;//平年出生日期的合法性正则表达式 
			} 
			if(ereg.test(ID_ICCID)){//测试出生日期的合法性 
				//计算校验位 
				S = (parseInt(ID_ICCID_array[0]) + parseInt(ID_ICCID_array[10])) * 7 
				+ (parseInt(ID_ICCID_array[1]) + parseInt(ID_ICCID_array[11])) * 9 
				+ (parseInt(ID_ICCID_array[2]) + parseInt(ID_ICCID_array[12])) * 10 
				+ (parseInt(ID_ICCID_array[3]) + parseInt(ID_ICCID_array[13])) * 5 
				+ (parseInt(ID_ICCID_array[4]) + parseInt(ID_ICCID_array[14])) * 8 
				+ (parseInt(ID_ICCID_array[5]) + parseInt(ID_ICCID_array[15])) * 4 
				+ (parseInt(ID_ICCID_array[6]) + parseInt(ID_ICCID_array[16])) * 2 
				+ parseInt(ID_ICCID_array[7]) * 1  
				+ parseInt(ID_ICCID_array[8]) * 6 
				+ parseInt(ID_ICCID_array[9]) * 3 ; 
				Y = S % 11; 
				M = "F"; 
				JYM = "10X98765432"; 
				M = JYM.substr(Y,1);//判断校验位 
				if(M == ID_ICCID_array[17]) return true;//return Errors[0]; //检测ID的校验位 
				else return false;//return Errors[3]; 
			} 
			else return false;//return Errors[2]; 
			break; 
		default: 
			return false;//Errors[1]; 
			break; 
	} 
}  

function check_string(obj)
{
	var tempArr = new Array(true,"");
//	if(obj.attributes["can_empty"].value=="Y" && obj.value.length==0) return tempArr;
	var length = obj.value.length;
	
	var arr = obj.attributes["check_type"].value.split(",");
	var smallLength = parseInt(arr[1]);
	var bigLength= parseInt(arr[2]);
	
	if(length<smallLength)
	{
		tempArr[0]=false;
		tempArr[1]="『"+ obj.attributes["check_str"].value+"』长度不能小于"+smallLength+"，请重新输入";
		return tempArr;
	}
	if(length > bigLength)
	{
		tempArr[0]=false;
		tempArr[1]="『"+obj.attributes["check_str"].value+"』长度不能大于"+bigLength+"，请重新输入";
		return tempArr;
	}
	return tempArr;
}

function checkFloat(obj)
{
	var tempArr = new Array(true,"");
//	if(obj.attributes["can_empty"].value=="Y" && obj.value.length==0) return tempArr;
	if(!(/^([-]){0,1}([0-9]){1,}([.]){0,1}([0-9]){0,}$/.test(obj.value))) 
	{
		tempArr[0]=false;
		tempArr[1]="不是合法的实数，请重新输入『" + obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	var floatValue = parseFloat(obj.value);
	var arr = obj.attributes["check_type"].value.split(",");
	var smallFloat = parseFloat(arr[1]);
	var bigFloat = parseFloat(arr[2]);
	if(floatValue<smallFloat)
	{
		tempArr[0]=false;
		tempArr[1]="不能小于"+smallFloat+"，请重新输入『" + obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	if(floatValue > bigFloat)
	{
		tempArr[0]=false;
		tempArr[1]="不能大于"+bigFloat+"，请重新输入『" + obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	return tempArr;
}

function checkInteger(obj)
{
	var tempArr = new Array(true,"");
//	if(obj.attributes["can_empty"].value=="Y" && obj.value.length==0) return tempArr;
	if(!(/^([-]){0,1}([0-9]){1,}$/.test(obj.value)))
	{
		tempArr[0]=false;
		tempArr[1]="不是合法的整数，请重新输入『" + obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	var integerValue = parseInt(obj.value);
	var arr = obj.attributes["check_type"].value.split(",");
	var smallInteger = parseInt(arr[1]);
	var bigInteger = parseInt(arr[2]);
	if(integerValue<smallInteger)
	{
		tempArr[0]=false;
		tempArr[1]="不能小于"+smallInteger+"，请重新输入『" + obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	if(integerValue > bigInteger)
	{
		tempArr[0]=false;
		tempArr[1]="不能大于"+bigInteger+"，请重新输入『" + obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	return tempArr;
}

function checkDate(obj)
{
	var tempArr = new Array(true,"");
//	if(obj.attributes["can_empty"].value=="Y" && obj.value.length==0) return tempArr;
	if(!(/^([0-9]){4,4}-([0-9]){1,2}-([0-9]){1,2}$/.test(obj.value))) 
	{
		tempArr[0] = false;
		tempArr[1] = "不是合法的日期，请按\"YYYY-MM-DD\"的格式输入『"+obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	var arr = obj.value.match(/\d+/g);
	year = Number(arr[0]);
	month = Number(arr[1]);
	day = Number(arr[2]);
	var monthDay = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
	if(year%400==0||(year%4==0&&year%100!=0))	monthDay[1] = 29;
	if(year<0 || month<0 || month>12 || day>31 ||day>monthDay[month-1])
	{
		tempArr[0] = false;
		tempArr[1] = "您输入了一个不存在的日期，请重新输入『"+obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	arr = obj.attributes["check_type"].value.split(",");
	if(arr[1].length>0)
	{
		var arr2 = arr[1].match(/\d+/g);
		var smallYear = Number(arr2[0]);
		var smallMonth = Number(arr2[1]);
		var smallDay = Number(arr2[2]);
		if(smallYear>year || (smallYear==year&&smallMonth>month) || (smallYear==year&&smallMonth==month&&smallDay>day))
		{
			tempArr[0] = false;
			tempArr[1] = "日期不能小于"+arr[1]+"，请重新输入『"+obj.attributes["check_str"].value+"』";
			return tempArr;
		}
	}
	
	if(arr[2].length>0)
	{
		arr2 = arr[2].match(/\d+/g);
		var bigYear = Number(arr2[0]);
		var bigMonth = Number(arr2[1]);
		var bigDay = Number(arr2[2]);
		if(bigYear<year || (bigYear==year&&bigMonth<month) || (bigYear==year&&bigMonth==month&&bigDay<day))
		{
			tempArr[0] = false;
			tempArr[1] = "日期不能大于"+arr[2]+"，请重新输入『"+obj.attributes["check_str"].value+"』";
			return tempArr;
		}
	}
	return tempArr;
}


function checkTime(obj)
{
	var tempArr = new Array(true,"");
//	if(obj.attributes["can_empty"].value=="Y" && obj.value.length==0) return tempArr;
	if(!(/^([0-9]){1,2}:([0-9]){1,2}$/.test(obj.value))) 
	{
		tempArr[0] = false;
		tempArr[1] = "不是合法的时间，请按\"hh:mm\"的格式输入『"+obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	var arr = obj.value.match(/\d+/g);
	hour = Number(arr[0]);
	minute = Number(arr[1]);
	if(hour<0 || hour>=24 || minute <0 || minute>=60)
	{
		tempArr[0] = false;
		tempArr[1] = "您输入了一个不存在的时间，请重新输入『"+obj.attributes["check_str"].value+"』";
		return tempArr;
	}
	arr = obj.attributes["check_type"].value.split(",");
	if(arr[1].length>0)
	{
		var arr2 = arr[1].match(/\d+/g);
		var smallHour = Number(arr2[0]);
		var smallMinute = Number(arr2[1]);
		if(smallHour>hour || (smallHour==hour&&smallMinute>minute))
		{
			tempArr[0] = false;
			tempArr[1] = "时间不能小于"+arr[1]+"，请重新输入『"+obj.attributes["check_str"].value+"』";
			return tempArr;
		}
	}
	
	if(arr[2].length>0)
	{	
		arr2 = arr[2].match(/\d+/g);
		var bigHour = Number(arr2[0]);
		var bigMinute = Number(arr2[1]);
		if(bigHour<hour || (bigHour==hour&&bigMinute<minute))
		{
			tempArr[0] = false;
			tempArr[1] = "时间不能大于"+arr[2]+"，请重新输入『"+obj.attributes["check_str"].value+"』";
			return tempArr;
		}
	}
	return tempArr;
}