var resumeName = (function(){
	var nameVaild;
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			nameVaild = $('#formResumeName').validate({
			    rules: {
					txtResumeName: { required: true, maxlength: 12, remote:{
						  url: checkNameRepeatUrl, 
						  type: "post", 
						  dataType: "json",
						  async:true,
			              data: {resume_name: function() { return $("#txtResumeName").val(); },
								 resume_id:function(){ return $('#hidResumeID').val()}},
			              dataFilter:function(json){
			            	  var result = eval('(' + json + ')');
			                  if (result.success == "true") {
			                      return 'true';
			                  }
			                  else {
			                      return 'false';
			                  }
			              }
					}}
			    },                   
			    messages: {
			    	txtResumeName: { required: '请填写简历名称<span class="tipArr"></span>', maxlength: '不超过12个字<span class="tipArr"></span>',remote:'简历名称已存在<span class="tipArr"></span>'}
			    },
			    errorClasses:{
			    	txtResumeName: { required: 'tipLayErr tipw100',maxlength:'tipLayErr tipw245',remote:'tipLayErr tipw180'}
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formResumeName').data("validator",nameVaild);
		},
		show:function(){
			this.isCanSave = false;
			$('#modName').hide();
			$('#showName').show();
		},
		mod:function(){
			this.isCanSave = true;
			resumeName.updateMod();
			$('#modName').show();
			$('#showName').hide();
		},
		updateMod:function(){
			$('#txtResumeName').val($('#spnResumeName').attr('v'));
		},
		subCancel:function(){
			nameVaild.resetForm();
			this.isCanSave = false;
			$('#modName').hide();
			$('#showName').show();
		},
		submit:function(isAllSave){
			//验证并提交
			  this.isAllSave = isAllSave;
			  var data = { resume_id: resume_id };
			  if(!nameVaild.form()){scroller("ba", 700);return false;}
			  $("#btnNameSave").submitForm({ beforeSubmit: $.proxy(nameVaild.form, nameVaild), data: data, success: resumeName.submitCallback, clearForm: false });
	          return false;
		},
		submitCallback:function(json){
			 if(json.error){
				 $.message(json.error,{icon:'fail',timeout:5000});
				 return;
			 }
			 resumeName.show();
			 resumeName.updateView(); 
			 scroller("ba", 700);
			 if(resumeName.isAllSave) saveAll('resumeName');
		},
		updateView:function(){
			$('#spnResumeName').html($('#txtResumeName').val());
			$('#spnResumeName').attr('v',$('#txtResumeName').val());
		}
	};
})(); 

var basicValid;
var basic = (function(){
	return {
		liveCity:null,
		nativeCity:null,
		isCanSave:false,
		isAllSave:false,
		init:function(){

			$('#curArea').singleArea({hddName:'hidCurArea',showLevel:3,controlClass:'zIndex',onSelect:function(){
				basicValid.element($('#hidCurArea'));
			}}); 
			$('#nativePlace').singleArea({hddName:'hidNativePlace',showLevel:2,controlClass:'zIndex'});  

			//TODO: 1949是否需要配置
			huibo.date.bind({
				id: "Start",
				dateEntry: [0, 1,2],
				size: 20,
				min: 1949-(new Date()).getFullYear()-1,
				max: 5,
				onSelect: function(){
					basic.calcWorkYear();
					basicValid.element($('#inpStartYear'));
					basicValid.element($('#inpStartMonth'));
				}
			});
			huibo.date.bind({
				id: "Birth",
				dateEntry: [0, 1, 2],
				size: 20,
				min: -75,
				max: -16,
				onSelect:function(){
					//为了支持即时验证
					basicValid.element($('#inpBirthYear'));
					basicValid.element($('#inpBirthMonth'));
					basicValid.element($('#inpBirthDate'));
				}
			});
			
			$('#stateWork,#stateSchool').click(function(){
				basic.refreshState();
			});
			
			/**
			*  基本信息验证
			*/
			$.validator.addMethod('idCard', function(value, element) {
			    if ( value=='') {
			        return true;
			    }
			    var ID_ICCID = value;
			    ID_ICCID = ID_ICCID.toUpperCase();
			    var Errors = new Array(
			        "正确",
			        "身份证号码位数不对!",
			        "身份证号码出生日期超出范围或含有非法字符!",
			        "身份证号码校验错误!",
			        "身份证地区非法!"
			    );

			    var area = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" }
			    var ID_ICCID, Y, JYM;
			    var S, M;
			    var ID_ICCID_array = new Array();
			    ID_ICCID_array = ID_ICCID.split("");
			    //地区检验 
			    if (area[parseInt(ID_ICCID.substr(0, 2))] == null) return false; //return Errors[4]; 
			    //身份号码位数及格式检验 
			    switch (ID_ICCID.length) {
			        case 15:
			            if ((parseInt(ID_ICCID.substr(6, 2)) + 1900) % 4 == 0 || ((parseInt(ID_ICCID.substr(6, 2)) + 1900) % 100 == 0 && (parseInt(ID_ICCID.substr(6, 2)) + 1900) % 4 == 0)) {
			                ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/; //测试出生日期的合法性 
			            } else {
			                ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/; //测试出生日期的合法性 
			            }
			            if (ereg.test(ID_ICCID)) return true; //return Errors[0]; 
			            else return false; //return Errors[2]; 
			            break;
			        case 18:
			            //18位身份号码检测 
			            //出生日期的合法性检查  
			            //闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9])) 
			            //平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8])) 
			            if (parseInt(ID_ICCID.substr(6, 4)) % 4 == 0 || (parseInt(ID_ICCID.substr(6, 4)) % 100 == 0 && parseInt(ID_ICCID.substr(6, 4)) % 4 == 0)) {
			                ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; //闰年出生日期的合法性正则表达式 
			            } else {
			                ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; //平年出生日期的合法性正则表达式 
			            }
			            if (ereg.test(ID_ICCID)) {//测试出生日期的合法性 
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
				    + parseInt(ID_ICCID_array[9]) * 3;
			                Y = S % 11;
			                M = "F";
			                JYM = "10X98765432";
			                M = JYM.substr(Y, 1); //判断校验位 
			                if (M == ID_ICCID_array[17]) return true; //return Errors[0]; //检测ID的校验位 
			                else return false; //return Errors[3]; 
			            }
			            else return false; //return Errors[2]; 
			            break;
			        default:
			            return false; //Errors[1]; 
			            break;
			    }
			}, '请填写正确的身份证号码<span class="tipArr"></span>');
			

			basicValid = $('#formBasicInfo').validate({
			    rules: {
					txtUserName: { required: true, rangelength: [2,6] ,match: /^[\u4e00-\u9fa5]+$/i},
					txtIDCardNumber:{ idCard:true},
					radSex:{required:true},
					inpBirthYear:{required: true, number: true, range: [1800, 3000]},
			    	inpBirthMonth:{required: true, number: true, range: [1, 12]},
			    	inpBirthDate:{required: true, number: true, range: [1, 31]},
					hidCurArea:{required:true},
					inpStartYear:{required: true, number: true, range: [1800, 3000]},
					inpStartMonth:{required: true, number: true, range: [1, 12]},
					txtStature:{number: true, range: [1, 280]},
					txtAvoirdupois:{number: true, range: [1, 200]}
			    },                   
			    messages: {
			    	txtUserName: { required: '请填写姓名<span class="tipArr"></span>', rangelength: '2-6个汉字<span class="tipArr"></span>',match:'2-6个汉字<span class="tipArr"></span>'},
			    	//txtIDCardNumber:{required:'请填写身份证号码<span class="tipArr"></span>'},
			    	radSex:{required:'请选择性别<span class="tipArr"></span>'},
			    	inpBirthYear:{required: '请选择出生年份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
			    	inpBirthMonth:{required: '请选择出生月份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	inpBirthDate:{required: '请选择出生日期<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '日期区间为1-31<span class="tipArr"></span>'},
			    	hidCurArea:{required:'请选择现居住地<span class="tipArr"></span>'},
			    	inpStartYear:{required: '请选择参加工作年份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
			    	inpStartMonth:{required: '请选择参加工作月份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	txtStature: { number: '请填写数字<span class="tipArr"></span>', range: '请填写正确的身高<span class="tipArr"></span>' },
			        txtAvoirdupois: { number: '请填写数字<span class="tipArr"></span>', range: '请填写正确的体重<span class="tipArr"></span>' }
			    },
			    tips: {
			    	txtUserName:'您的姓名，2-6个汉字<span class="tipArr"></span>',
			    	txtIDCardNumber:'身份证号码不会公开，只作身份验证用<span class="tipArr"></span>'
				},
			    errorClasses:{
			    	txtUserName: { required: 'tipLayErr tipw100',rangelength:'tipLayErr tipw100',match:'tipLayErr tipw100'},
			    	txtIDCardNumber:{required:'tipLayErr tipw120',idCard:'tipLayErr tipw150'},
			    	radSex:{required:'tipLayErr tipw100'},
			    	inpBirthYear:{required: 'tipLayErr tipw100', number: 'tipLayErr tipw100', range: 'tipLayErr tipw150'},
			    	inpBirthMonth:{required: 'tipLayErr tipw100', number: 'tipLayErr tipw100', range: 'tipLayErr tipw150'},
			    	inpBirthDate:{required: 'tipLayErr tipw100', number: 'tipLayErr tipw100', range: 'tipLayErr tipw150'},
			    	hidCurArea:{required:'tipLayErr tipw120'},
			    	inpStartYear:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw100', range: 'tipLayErr tipw150'},
			    	inpStartMonth:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw100', range: 'tipLayErr tipw150'},
			    	txtStature: { number: 'tipLayErr tipw100', range: 'tipLayErr tipw100' },
			        txtAvoirdupois: { number: 'tipLayErr tipw100', range: 'tipLayErr tipw100' }
			    },
			    tipClasses:{
			    	txtUserName: 'tipLayTxt tipw120',
			    	txtIDCardNumber: 'tipLayTxt tipw220'
			    },
			    groups: {
			        birthYMD: 'inpBirthYear inpBirthMonth inpBirthDate',
			        startYM:'inpStartYear inpStartMonth'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formBasicInfo').data("validator",basicValid);
			
//			$('#inpStartYear,#inpStartMonth').keyup(function(){
//				basic.calcWorkYear();
//			});
		},
		show:function(){
			this.isCanSave = false;
			$('#modBasic').hide();
			$('#showBasic').show();
		},
		mod:function(){
			this.isCanSave = true;
			basic.updateMod();
			$('#modBasic').show();
			$('#showBasic').hide();
			scroller("ba", 700);
		},
		updateMod:function(){
			$('#txtUserName').val($('#spnBasicName').html());
			var chkName = $('#spnBasicNameOpen').attr('v');
			if(chkName=='0'){
				$('#chkNameOpen').attr('checked','checked');
			}else{
				$('#chkNameOpen').removeAttr('checked');
			}
			var sexValue = $('#spnBasicSex').attr('v');
			if(sexValue == '2'){
				$('#sexFemale').attr('checked','checked');
			}else{
				$('#sexMale').attr('checked','checked');
			}
			$('#txtIDCardNumber').val($('#spnBasicIdCard').attr('v'));
			if($('#spnBasicAge').attr('v')!=''){
				var birthday = new Date($('#spnBasicAge').attr('v'));
				$('#inpBirthYear').val(birthday.getFullYear());
				$('#inpBirthMonth').val(birthday.getMonth()+1);
				$('#inpBirthDate').val(birthday.getDate());
			}
			$('#curArea').setArea($('#spnBasicCurArea').attr('v'));
			if($('#spnBasicStartWorkYear').attr('v')!=''){
				var startTime = new Date($('#spnBasicStartWorkYear').attr('v'));
				$('#inpStartYear').val(startTime.getFullYear());
				$('#inpStartMonth').val(startTime.getMonth()+1);
			}
			$('#nativePlace').setArea($('#spnBasicNativeArea').attr('v'));
			
			if($('#spnBasicMarriage').attr('v') !=''){
				$('#dropMarriage').setDropListValue($('#spnBasicMarriage').attr('v'));
			}
			if($('#spnBasicFertility').attr('v')!=''){
				$('#dropFertility').setDropListValue($('#spnBasicFertility').attr('v'));
			}
//			var chkMarOpen = $('#spnBasicMarriageOpen').attr('v');
//			if(chkMarOpen=='0'){
//				$('#chkMarriageOpen').attr('checked','checked');
//			}else{
//				$('#chkMarriageOpen').removeAttr('checked');
//			}
			if($('#spnBasicPolitical').attr('v')!=''){
				$('#dropPolitical').setDropListValue($('#spnBasicPolitical').attr('v'));
			}
			$('#txtStature').val(isNaN(parseInt($('#spnBasicStature').attr('v')))?'':parseInt($('#spnBasicStature').attr('v')));
			$('#txtAvoirdupois').val(isNaN(parseInt($('#spnBasicAvoirdupois').attr('v')))?'':parseInt($('#spnBasicAvoirdupois').attr('v')));
			
			$('#hidMapX').val($('#spnBasicMapX').attr('v'));
			$('#hidMapY').val($('#spnBasicMapY').attr('v'));
			$('#hidMapZoom').val($('#spnBasicMapZoom').attr('v'));
			basic.calcWorkYear();
			basic.calcWorkState();
		},
		subCancel:function(){
			basicValid.resetForm();
			this.isCanSave = false;
			$('#modBasic').hide();
			$('#showBasic').show();
		},	
		submit:function(isAllSave){
			  //验证并提交
			  this.isAllSave = isAllSave;
			  var data = { resume_id: resume_id };
			  if(!basicValid.form()){scroller("ba", 700);return false;}
			  $("#btnBasicSave").submitForm({ beforeSubmit: $.proxy(basicValid.form, basicValid), data: data, success: basic.submitCallback, clearForm: false });
	          return false;
		},
		submitCallback:function(json){
			 if(json.error){
				 $.message(json.error,{icon:'fail',timeout:5000});
				 return;
			 }
			 basic.show();
			 basic.updateView();   
			 scroller("ba", 700);
			 //basic.refreshFixedBox();   
			 //Fixed_Box("#fixedBox", 64);
			 if(basic.isAllSave) saveAll('basic');
		},
		updateView:function(){
			var notFilled= '<i class="gray font12">未填写</i>';
			
			$('#spnBasicName').text($('#txtUserName').val());
			var sex = $(':input[name=radSex][checked]').val();
			if(typeof(sex) == 'undefined'){
				sex = 1;	
			}
			$('#spnBasicSex').text(sex==1?'男':'女');
			$('#spnBasicSex').attr('v',sex);
			
			var birthday = $('#inpBirthYear').val()+'/'+$('#inpBirthMonth').val()+'/'+$('#inpBirthDate').val();
			var basicAge = Math.floor(timeUtil.date_diff_month(birthday)/12);
			$('#spnBasicAge').attr('v',birthday).text(basicAge);
			$('#spnConBasicAge').show();
			var chkName = $('#chkNameOpen');
			if((chkName).is(':checked')){
				$('#spnBasicNameOpen').attr('v','0').text('（简历中不显示全名）');
			}else{
				$('#spnBasicNameOpen').attr('v','1').text('');
			}
			if($('#txtIDCardNumber').val()==''){
				$('#spnBasicIdCard').html(notFilled).attr('v',$('#txtIDCardNumber').val());
			}
			else{
				$('#spnBasicIdCard').html($('#txtIDCardNumber').val()).attr('v',$('#txtIDCardNumber').val());
			}
			var spnCurArea='';
			var areas = $('#curArea').getAreaNames();
			for(var i=0;i<areas.length;i++){
				spnCurArea += areas[i] ;
			}
			$('#spnBasicCurArea').attr('v',$('#hidCurArea').val()).html(spnCurArea);
			
			var startWorkYear = $('#inpStartYear').val()+'/'+$('#inpStartMonth').val()+'/1';
			var workMonthNum = timeUtil.date_diff_month(startWorkYear);
			if(!isNaN(workMonthNum)){
				var workY = Math.floor(workMonthNum/12);
				var workM = parseInt(workMonthNum%12);
				var workYearDesc;
				if(workY <= 0 && workM>=0 && workM<=6){
					workYearDesc = ',应届毕业生';
				}
				else if(workY == 0 && workM>6)
				{
					workYearDesc = ','+workM+'个月工作经验';
				}
				else if (workMonthNum<0){
					workYearDesc = ',目前在读';
				}
				else{
					workYearDesc = ','+workY+'年工作经验';
				}
				$('#spnWorkYear').text(workYearDesc);
				$('#spnBasicStartWorkYear').text($('#inpStartYear').val()+'年'+$('#inpStartMonth').val()+'月').attr('v',startWorkYear);
				$('#liConStartWork').show(); 
			}
			
			var spnNativeArea='';
			var areas = $('#nativePlace').getAreaNames();
			for(var i=0;i<areas.length;i++){
				spnNativeArea += areas[i] ;
			}
			if(spnNativeArea == '') spnNativeArea = notFilled;
			$('#spnBasicNativeArea').attr('v',$('#hidNativePlace').val()).html(spnNativeArea);
			
			if($('#hidMarriage').val() == '' && $('#hidFertility').val() == '')
			{
				$('#spnBasicMarriage').attr('v',$('#hidMarriage').val()).html(notFilled);
				$('#spnBasicFertility').attr('v',$('#hidFertility').val()).html('');
//				var chkMarOpen = $('#chkMarriageOpen');
//				if(chkMarOpen.is(':checked')){
//					$('#spnBasicMarriageOpen').attr('v','0');
//				}else{
//					$('#spnBasicMarriageOpen').attr('v','1');
//				}	
			}
			else{
				$('#spnBasicMarriage').attr('v',$('#hidMarriage').val()).text($('#hidMarriage').parent().find('li[v=' + $('#hidMarriage').val() + ']').text());
				$('#spnBasicFertility').attr('v',$('#hidFertility').val()).text($('#hidFertility').parent().find('li[v=' + $('#hidFertility').val() + ']').text());
//				var chkMarOpen = $('#chkMarriageOpen');
//				if(chkMarOpen.is(':checked')){
//					$('#spnBasicMarriageOpen').attr('v','0').text('（已设为保密）');
//				}else{
//					$('#spnBasicMarriageOpen').attr('v','1').text('');
//				}
			}
			if($('#hidPolitical').val()==''){
				$('#spnBasicPolitical').attr('v',$('#hidPolitical').val()).html(notFilled);
			}
			else{
				$('#spnBasicPolitical').attr('v',$('#hidPolitical').val()).text($('#hidPolitical').parent().find('li[v=' + $('#hidPolitical').val() + ']').text());
			}
			
			var stature = $('#txtStature').val();
			var avoir = $('#txtAvoirdupois').val();
			if(stature != '' && avoir!=''){
				$('#spnBasicStature').attr('v',stature).text(stature+'cm');
				$('#spnBasicAvoirdupois').attr('v',avoir).text(avoir+'kg');
				$('#spnBasicSperator').text('/');
			}
			else if(stature != ''){
				$('#spnBasicStature').attr('v',stature).text(stature+'cm');
				$('#spnBasicAvoirdupois').attr('v',avoir).text(avoir);
				$('#spnBasicSperator').text('');
			}
			else if(avoir != ''){
				$('#spnBasicStature').attr('v',stature).text(stature);
				$('#spnBasicAvoirdupois').attr('v',avoir).text(avoir+'kg');
				$('#spnBasicSperator').text('');
			}
			else{
				$('#spnBasicStature').attr('v',stature).html('<i class="gray font12">未填写</i>');
				$('#spnBasicAvoirdupois').attr('v',avoir).text(avoir);
				$('#spnBasicSperator').text('');
			}
			$('#spnBasicMapX').attr('v',$('#hidMapX').val());
			$('#spnBasicMapY').attr('v',$('#hidMapY').val());
			$('#spnBasicMapZoom').attr('v',$('#hidMapZoom').val());
		},
		refreshFixedBox:function(){
			$("#ulFixed>li input").each(function(a, b) {
				if (!$(b).is(":disabled")) {
					var c = $(this).attr("m");
					if (c != 'containerhighlights' && c != 'containerphoto') {
						var d = $("#" + c).find(".infoview:visible").length;
						if (d == 0) {
							$("#" + c).hide();
							$(b).attr("checked", false);
						}
					}
				}
			});
		},
		calcWorkYear:function(){
			var startWorkYear = $('#inpStartYear').val()+'-'+$('#inpStartMonth').val()+'-1';
			var workMonthNum = timeUtil.date_diff_month(startWorkYear);
			if(isNaN(workMonthNum)){
				return;
			}
			var workY = Math.floor(workMonthNum/12);
			var workM = parseInt(workMonthNum%12);
			var workYearDesc;
			
			if(workY <= 0 && workM>=-6 && workM<=6){
				workYearDesc = ',应届毕业生';
			}
			else if(workY == 0 && workM>6)
			{
				workYearDesc = ','+workM+'个月工作经验';
			}
			else if (workMonthNum<-6){
				workYearDesc = ',目前在读';
			}
			else{
				workYearDesc = ','+workY+'年工作经验';
			}
			$('#modBasicWorkYear').text(workYearDesc);
		},
		setPhotoOpen:function(){
			var isPhotoOpen = $('#chkPhotoOpen').is(':checked');
			$.post('/person/setPhotoOpen/',{isPhotoOpen:isPhotoOpen},function(json){
				if(json.error){
					$.message(json.error,{icon:'fail'});
					return;
				}
				$.anchor(json.msg,{icon:'success'});
			},'json');
		},
		showMapMarker:function(){
			$.showModal('/map/',{title:'标记我的位置'});
		},
		refreshState:function(){
			if($('#stateWork').is(':checked')){
				$('#tipWorkState').text('参加工作时间');
			}
			else if ($('#stateSchool').is(':checked')){
				$('#tipWorkState').text('毕业时间');
			}
		},
		calcWorkState:function(){
			var startWorkYear = $('#inpStartYear').val()+'-'+$('#inpStartMonth').val()+'-1';
			var workMonthNum = timeUtil.date_diff_month(startWorkYear);
			if(isNaN(workMonthNum)){
				return;
			}
			var workY = Math.floor(workMonthNum/12);
			var workM = parseInt(workMonthNum%12);
			
			if(workY == 0 && workM>=-6 && workM<=6){
				$('#stateSchool').attr('checked','checked');
				$('#tipWorkState').text('毕业时间');
			}
			else if(workY == 0 && workM>6)
			{
				$('#stateWork').attr('checked','checked');	
				$('#tipWorkState').text('参加工作时间');
			}
			else if (workMonthNum<-6){
				$('#stateSchool').attr('checked','checked');
				$('#tipWorkState').text('毕业时间');
			}
			else{
				$('#stateWork').attr('checked','checked');
				$('#tipWorkState').text('参加工作时间');
			}
		}
	};
})();

//联系方式
var contact=(function(){
	var contactValid;
	var interval;
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			//验证QQ号码
			$.validator.addMethod("QQValidate", function(value, element, param) {
			    if (this.optional(element))
			        return "dependency-mismatch";
			    var reg = param;
			    if (typeof param == 'string') {
			        reg = new RegExp(param);
			    }
			    return reg.test(value);        
			}, '请输入正确的QQ号码');

			contactValid = $('#formContract').validate({
			    rules: {
					txtQQ:{QQValidate: /^([0-9]{4,11})?$/},
					txtTelephone:{tel:true},
					txtEmail:{required:true,email:true,remote:{
						  url: checkEmailUrl, 
						  type: "post", 
						  dataType: "json",
						  async:true,
			              data: {email: function() { return $("#txtEmail").val(); }},
			              dataFilter:function(json){
			            	  var result = eval('(' + json + ')');
			                  if (result.success == "true") {
			                      return 'true';
			                  }
			                  else {
			                      return 'false';
			                  }
			              }
						}},
						txtMobilePhone:{
							required:true,
							match:/^[1]\d{10}$/,			
							remote:{
							  url: checkMobileUrl, 
							  type: "post", 
							  dataType: "json",
							  async:true,
				              data: { 
					              mobilphone: function() { return $("#txtMobilePhone").val(); } 
				              },
				              dataFilter:function(json){
				            	  var result = eval('(' + json + ')');
				                  if (result.success == "true") {
									  if(mobileIsValidation != '1'){
					                	  if(!$('#divValiMobile').is(':visible')){
											  $('#btnBindMobile').show();
											  $('#btnCancelBindMobile').hide();
									      }
										  else{
											  $('#btnBindMobile').hide();
											  $('#btnCancelBindMobile').show();
										  }
									  }
				                      return 'true';
				                  }
				                  else {
				                	  if(mobileIsValidation != '1'){
				                		  $('#divValiMobile').show();
						                  $('#txtValidateCode').removeAttr('disabled');
						                  $('#btnBindMobile').hide();
										  $('#btnCancelBindMobile').hide();
				                	  }
				                      return 'false';
				                  }
				              }
				           }
						},
						hidMobilePhone:{
							required:true,
							match:/^[1]\d{10}$/
						},
						txtValidateCode:{
							required:true,
							number:true,
							rangelength:[6,6],
							remote:{
							  url: checkValiAndBindUrl, 
							  type: "post", 
							  dataType: "json",
							  async:true,
					          data: {
								  txtMobilePhone: function() { return $("#txtMobilePhone").val(); },
								  txtValidateCode:function(){ return $("#txtValidateCode").val();}
					          },
					          dataFilter:function(json){
					         	  var result = eval('(' + json + ')');
					               if (result.success == "true") {
					            	   $('#txtMobilePhone').attr('disabled','disabled').addClass('textGray').attr('v',$('#txtMobilePhone').val());
					            	   $('#hidMobilePhone').attr('disabled','disabled')
					            	   $('#spnConModMobile').show();
					            	   $('#spnModMobile').show();
					            	   $('#spnCancelModMobile').show();
					            	   
						           		$('#divValiMobile').hide();
						             	$('#txtValidateCode').attr('disabled','disabled').val('');
						             	
						             	$('#btnBindMobile').hide();
						           		$('#btnCancelBindMobile').hide();
						           		
						           		$('#spnCancelModMobile').hide();
						           		//移除验证错误的样式和提示
						           		$('#txtMobilePhone').removeClass('error');
						           		$('#txtValidateCode').removeClass('error');
						           		$('span[for=MobilePhone]').hide();
						           		
						           		//取消时清除定时程序
						    			clearInterval(interval);
						    			$('#btnSendValidate').removeClass('btn3Unclick').html('免费获取验证码').bind("click",function(){
						    				basic.sendMsg();
						    			});
						    			$('#tipMessage').hide();

						    			
						    			mobileIsValidation = 1;
					                   return 'true';
					               }
					               else {
					                   return 'false';
					               }
					          }
							}
						}
			    },
			    messages: {
			    	txtQQ:{QQValidate:'请输入正确的QQ号码<span class="tipArr"></span>'},
			    	txtTelephone:{tel:'请输入正确的固话号码，如：023-61627888<span class="tipArr"></span>'},
			    	txtEmail:{required:'请填写邮箱<span class="tipArr"></span>',email:'请输入正确的邮箱地址<span class="tipArr"></span>',remote:'邮箱已存在<span class="tipArr"></span>'},
			    	txtMobilePhone:{required:'请填写手机号码<span class="tipArr"></span>',match:'请输入正确的手机号码<span class="tipArr"></span>',remote:'该手机已被绑定，需重新验证后才能使用<span class="tipArr"></span>'},
					hidMobilePhone:{required:'请输入手机号码<span class="tipArr"></span>',match:'手机号码格式不正确<span class="tipArr"></span>'},
			    	txtValidateCode:{
						required:'请填写验证码<span class="tipArr"></span>',
						number:'请填写数字<span class="tipArr"></span>',
						rangelength:'验证码为6位数字<span class="tipArr"></span>',
						remote:'验证码不正确<span class="tipArr"></span>'
					}
			    },
			    tips: {
			    	txtMobilePhone:'手机号码，11位数字<span class="tipArr"></span>',
			    	txtEmail:'电子邮箱，不超过60个字<span class="tipArr"></span>',
			    	txtQQ:'QQ号码，4-11位数字<span class="tipArr"></span>',
			    	txtTelephone:'请输入固话号码，如：023-61627888<span class="tipArr"></span>'
				},
			    errorClasses:{
					txtQQ:{QQValidate:'tipLayErr tipw150'},
					txtTelephone:{tel:'tipLayErr tipw245'},
					txtEmail:{required:'tipLayErr tipw100',email:'tipLayErr tipw245',remote:'tipLayErr tipw245'},
			    	txtMobilePhone:{required:'tipLayErr tipw100',match:'tipLayErr tipw245',remote:'tipLayErr tipw245'},
			    	hidMobilePhone:{required:'tipLayErr tipw100',match:'tipLayErr tipw245'},
			    	txtValidateCode:{
						required:'tipLayErr tipw100',
						number:'tipLayErr tipw100',
						rangelength:'tipLayErr tipw150',
						remote:'tipLayErr tipw100'
					}
			    },
			    tipClasses:{
			    	txtMobilePhone: 'tipLayTxt tipw150',
			    	txtEmail:'tipLayTxt tipw150',
			    	txtQQ:'tipLayTxt tipw150',
			    	txtTelephone:'tipLayTxt tipw220'
			    },
			    groups: {
			        MobilePhone:'txtMobilePhone hidMobilePhone'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formContract').data("validator",contactValid);
			
			
			$('#btnModMobile').click(function(){
				$('#txtMobilePhone').removeAttr('disabled').removeClass('textGray').val($('#txtMobilePhone').attr('modValue'));
				$('#hidMobilePhone').removeAttr('disabled').val($('#txtMobilePhone').attr('modValue'));
				
				$('#spnModMobile').hide();
				$('#spnCancelModMobile').show();
				
				$('#divValiMobile').show();
				$('#txtValidateCode').removeAttr('disabled');
			});
			$('#btnModEmail').click(function(){
				$('#txtEmail').removeAttr('disabled').removeClass('textGray').val('');
				$('#spnModEmail').hide();
				$('#spnCancelModEmail').show();
			});
			
			$('#btnCancelModMobile').click(function(){
				$('#txtMobilePhone').attr('disabled','disabled').attr('modValue',$('#txtMobilePhone').val()).addClass('textGray').val($('#txtMobilePhone').attr('v'));
				$('#hidMobilePhone').attr('disabled','disabled').val($('#txtMobilePhone').attr('v'));
				
				$('#spnModMobile').show();
				$('#spnCancelModMobile').hide();
				
				$('#divValiMobile').hide();
		  	    $('#txtValidateCode').attr('disabled','disabled');
		  	    
				//移除验证错误的样式和提示
				$('#txtMobilePhone').removeClass('error');
				$('#txtValidateCode').removeClass('error');
				$('span[for=MobilePhone]').hide();
				
			});
			$('#btnCancelModEmail').click(function(){
				$('#txtEmail').attr('disabled','disabled').addClass('textGray').val($('#txtEmail').attr('v'));
				$('#spnModEmail').show();
				$('#spnCancelModEmail').hide();
				//移除验证错误的样式和提示
				$('#txtEmail').removeClass('error');
				$('span[for=txtEmail]').hide();
			});
			$('#txtMobilePhone').keyup(function(){
				$('#hidMobilePhone').val($(this).val());
			});
			$('#btnBindMobile').click(function(){
				$('#divValiMobile').show();
				$('#txtValidateCode').removeAttr('disabled');
				
				$('#btnCancelBindMobile').show();
				$('#btnBindMobile').hide();
			});
			$('#btnCancelBindMobile').click(function(){
				$('#divValiMobile').hide();
				$('#txtValidateCode').attr('disabled','disabled');

				$('#btnCancelBindMobile').hide();
				$('#btnBindMobile').show();
			});
			$('#btnSendValidate').click(function(){
				contact.sendMsg();
			});
		},
		show:function(){
			this.isCanSave = false;
			$('#divContactMod').hide();
			$('#divContactShow').show();
		},
		mod:function(){
			this.isCanSave = true;
			contact.updateMod();
			$('#divContactMod').show();
			$('#divContactShow').hide();
			scroller("co", 700);
		},
		updateMod:function(){
			contact.clearInput();
			$('#txtMobilePhone').attr('v',$('#pMobilePhone').html()).val($('#pMobilePhone').html());
			$('#hidMobilePhone').val($('#pMobilePhone').html());
			$('#txtEmail').val($('#pEmail').html());
			$('#txtQQ').val($('#pQQ').html());
			$('#txtTelephone').val($('#pTelephone').html());
		},
		subCancel:function(){
			contactValid.resetForm();
			this.isCanSave = false;
			$('#divContactMod').hide();
			$('#divContactShow').show();
		},	
		submit:function(isAllSave){
			//验证并提交
			this.isAllSave = isAllSave;
			  var data = { resume_id: resume_id };
			  if(!contactValid.form()){scroller("co", 700);return false;}
			  $("#btnContactSave").submitForm({ beforeSubmit: $.proxy(contactValid.form, contactValid), data: data, success: contact.submitCallback, clearForm: false });
	          return false;
		},
		submitCallback:function(json){
			 if(json.error){
				 $.message(json.error,{icon:'fail',timeout:5000});
				 return;
			 }
			 contact.show();
			 contact.updateView();
			 scroller("co", 700);
			 if(contact.isAllSave) saveAll('contact');
		},
		updateView:function(){
			$('#pMobilePhone').text($('#txtMobilePhone').val());
			$('#pEmail').text($('#txtEmail').val());
			
			$('#pQQ').text($('#txtQQ').val());
			if($('#txtQQ').val()==''){
				$('#pQQ').parent().hide();
			}
			else{
				$('#pQQ').parent().show();
			}
			$('#pTelephone').text($('#txtTelephone').val());
			if($('#txtTelephone').val()==''){
				$('#pTelephone').parent().hide();
			}else{
				$('#pTelephone').parent().show();
			}
		},
		clearInput:function(){
			if(mobileIsValidation=='1'){
				$('#txtMobilePhone').addClass('textGray').attr('disabled','disabled');
				$('#hidMobilePhone').attr('disabled','disabled');
				
				$('#spnModMobile').show();
				$('#spnCancelModMobile').hide();
				
				$('#btnBindMobile').hide();
				$('#btnCancelBindMobile').hide();

				$('#divValiMobile').hide();
				$('#txtValidateCode').attr('disabled','disabled');
				
			}
			else{
				$('#txtMobilePhone').removeClass('textGray').removeAttr('disabled');
				$('#hidMobilePhone').removeAttr('disabled');
				
				$('#spnModMobile').hide();
				$('#spnCancelModMobile').hide();
				
				//$('#btnBindMobile').hide();
				$('#btnCancelBindMobile').hide();
				
				$('#divValiMobile').hide();
				$('#txtValidateCode').attr('disabled','disabled');
			}
		},
		sendMsg:function(){
			$('#tipMessage').hide();
			if(!contactValid.element('#hidMobilePhone')){
				return;
			}
			$('#txtMobilePhone').removeClass('error');
			$('#btnSendValidate').unbind('click');
			
			var data={mobilePhone:$('#txtMobilePhone').val()};
			$.getJSON(sendMsgUrl,data,function(result){
				if(result && result.error){
					$('#btnSendValidate').bind("click",function(){
						contact.sendMsg();
					});
					$('#tipMessage').html('<i class="red hbFntWes">&#xf00d;</i>'+result.error).show();
		            return;
				}
				$('#btnSendValidate').addClass('btn3Unclick').html('<i>180</i>秒后重新获取验证码');
				$('#tipMessage').html('<i class="green hbFntWes">&#xf00c;</i>已发送验证码短信到您的手机').show();
				$('#txtValidateCode').focus();
				interval = window.setInterval(contact.countdown,1000);
			});
		},
		countdown:function(){
			var seconds=$('#btnSendValidate').find('i').html();
			seconds = parseInt(seconds);
			if(seconds>0){
				seconds--;
				$('#btnSendValidate').find('i').html(seconds);
			}else{
				window.clearInterval(interval);
				$('#btnSendValidate').removeClass('btn3Unclick').html('免费获取验证码').bind("click",function(){
					contact.sendMsg();
				});
			}
		}
	};
})();

//求职意向
var expectValid;
var expect=(function(){
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			expectValid = $('#formExpect').validate({
				rules:{
					txtStation:{required:true,rangelength:[2,20]},
					hidJobtype:{required:true},
					hidJobsort:{required:true},
					hidCalling:{required:true},
					hidAreaMultiple:{required:true},
					hidJoblevel:{required:true},
					hidSalary:{required:true}
				},
				messages:{
					txtStation:{required:'请填写意向职位<span class="tipArr"></span>',rangelength:'2-20个字<span class="tipArr"></span>'},
					hidJobtype:{required:'请选择工作类型<span class="tipArr"></span>'},
					hidJobsort:{required:'请选择职位类别<span class="tipArr"></span>'},
					hidCalling:{required:'请选择行业类别<span class="tipArr"></span>'},
					hidAreaMultiple:{required:'请选择工作地区<span class="tipArr"></span>'},
					hidJoblevel:{required:'请选择岗位级别<span class="tipArr"></span>'},
					hidSalary:{required:'请选择期望月薪<span class="tipArr"></span>'}
				},
				tips:{
					txtStation:'2-20个字<span class="tipArr"></span>'
				},
				errorClasses:{
					txtStation: { required: 'tipLayErr tipw120',rangelength:'tipLayErr tipw150'},
					hidJobtype:{required:'tipLayErr tipw120'},
					hidJobsort:{required:'tipLayErr tipw120'},
					hidCalling:{required:'tipLayErr tipw120'},
					hidAreaMultiple:{required:'tipLayErr tipw120'},
					hidJoblevel:{required:'tipLayErr tipw150'},
					hidSalary:{required:'tipLayErr tipw150'}
				},
				tipClasses:{
					txtStation:  'tipLayTxt tipw150',
					hidJobtype:'tipLayTxt tipw150',
					hidJobsort:'tipLayTxt tipw150',
					hidCalling:'tipLayTxt tipw150',
					hidAreaMultiple:'tipLayTxt tipw150',
					hidJoblevel:'tipLayTxt tipw150',
					hidSalary:'tipLayTxt tipw150'
				},
				groups:{
					station:'txtStation hidJobtype'
				},
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{		
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formExpect').data("validator",expectValid);
			
			
			$('#dropJobsort').jobsort({max:5,hddName:'hidJobsort',isLimit:true,onSelect:function(){
				expectValid.element($('input[name=hidJobsort]'));
			}});
			$('#dropCalling').calling({max:5,hddName:'hidCalling',isLimit:true,unLimitedLevel:3,onSelect:function(){
				expectValid.element($('input[name=hidCalling]'));
			}});
			$('#dropAreaMultiple').multiplearea({max:5,hddName:'hidAreaMultiple',isLimit:true,onSelect:function(){
				expectValid.element($('input[name=hidAreaMultiple]'));
			}});
			
			
			 $('#txtStation').autocomplete("/resume/AutoComplete", {
				 resultsClass:"tSchJobRts",
				 max: 12,    //列表里的条目数
				 minChars: 1,    //自动完成激活之前填入的最小字符
				 width:210,     //提示的宽度，溢出隐藏
				 scrollHeight:120,   //提示的高度，溢出显示滚动条
				 matchContains: true,    //包含匹配，就是data参数里的数据，是否只要包含文本框里的数据就显示
		         scroll:false,
		         dataType:"json",
				 autoFill: false,    //自动填充
		         extraParams:{
		            type:'job',
		            key:function(){
		                return escape($.trim($("#txtStation").val()));
		            }
		        },
				 formatItem: function(row) {
					 return '<span class="autTempL">'+row.item+'</span>';
				 },
				 formatMatch: function(row) {
					 return row.item;
				 },
				 formatResult: function(row) {
					return row.item;
				 }
			 });
		},
		show:function(){
			this.isCanSave = false;
			$('#divExpectMod').hide();
			$('#divExpectShow').show();
		},
		mod:function(){
			this.isCanSave = true;
			expect.updateMod();
			$('#divExpectMod').show();
			$('#divExpectShow').hide();
			scroller("ex", 700);
		},
		updateMod:function(){
			$('#dropJobsort').resetJobsortValue();
			$('#dropCalling').resetCallingValue();
			$('#dropAreaMultiple').resetMultipleareaValue();
			$('#dropJobsort').setJobSortValue($('#expectJobsort').attr('v'));
			$('#dropCalling').setCallingValue($('#expectCalling').attr('v'));
			$('#dropAreaMultiple').setMultipleAreaValue($('#expectArea').attr('v'));

			$('#txtStation').val($('#spnStation').html());
			$('#dropJobLevel').setDropListValue($('#spnJobLevel').attr('v'));
			$('#dropSalary').setDropListValue($('#spnSalary').attr('v'));
			$('#dropJobType').setDropListValue($('#spnAcceptParttime').attr('v1'));
			var chkParttime = $('#spnAcceptParttime').attr('v');
			if(chkParttime=='1'){
				$('#chkParttime').attr('checked','checked');
			}else{
				$('#chkParttime').removeAttr('checked');
			}
			var chkJobLevel = $('#spnAcceptLowerJobLevel').attr('v');
			if(chkJobLevel=='1'){
				$('#chkJobLevel').attr('checked','checked');
			}else{
				$('#chkJobLevel').removeAttr('checked');
			}
			var chkSalaryShow = $('#spnSalaryShow').attr('v');
			if(chkSalaryShow=='1'){
				$('#chkSalaryShow').attr('checked','checked');
			}else{
				$('#chkSalaryShow').removeAttr('checked');
			}
			var chkSalary = $('#spnAcceptLowerSalary').attr('v');
			if(chkSalary=='1'){
				$('#chkSalary').attr('checked','checked');
			}else{
				$('#chkSalary').removeAttr('checked');
			}
		},
		subCancel:function(){
			expectValid.resetForm();
			this.isCanSave = false;
			$('#divExpectMod').hide();
			$('#divExpectShow').show();
		},		
		submit:function(isAllSave){	
			//验证并提交
			 this.isAllSave = isAllSave;
			 var data = { resume_id: resume_id };
			 if( !expectValid.form()){scroller("ex", 700);return false;}
			 $("#btnExpectSave").submitForm({ beforeSubmit: $.proxy(expectValid.form, expectValid), data: data, success: expect.submitCallback, clearForm: false });
	         return false;
		},
		submitCallback:function(json){
			 if(json.error){
				 $.anchorMsg(json.error,{icon:'fail'});
				 return;
			 }
			 expect.show();
			 expect.updateView();
			 scroller("ex", 700);
			 if(expect.isAllSave) saveAll('expect');
		},
		updateView:function(){
			if(!expect.checkFill()){
				right.changeScore(5, 0, "conExpect");
			}		
			$('#spnStation').text($('#txtStation').val());
			var jobtypeId = $('#dropJobType').getDropListValue();
			var jobtypeTxt = $('#dropJobType').find('li[v='+jobtypeId+']').html();
			//$('#spnParttime').attr('v',jobtypeId);
			var isParttime = $('#chkParttime');
			if(jobtypeId==1&&isParttime.is(':checked')){
				$('#spnAcceptParttime').attr('v1',jobtypeId).attr('v','1').text('（可接受兼职）');
			}else{
				if(jobtypeId!=1){
					$('#spnAcceptParttime').attr('v1',jobtypeId).attr('v','0').text('（'+jobtypeTxt+'）');
				}else{
					$('#spnAcceptParttime').attr('v1',jobtypeId).attr('v','0').text('');
				}
			}
						
			//职位类别
			var jobsortStr = '';
			var jobsortId = '';
			var jobsort = $('#dropJobsort').getJobSortValue();
			for(var i=0;i<jobsort.length;i++){
				if(i==jobsort.length-1){
					jobsortStr+=jobsort[i].split(',')[1];
					jobsortId +=jobsort[i].split(',')[0];
				}else{
					jobsortId +=jobsort[i].split(',')[0]+',';
					jobsortStr+=jobsort[i].split(',')[1]+',';
				}
			}
			$('#expectJobsort').html('<em>职位类别包括</em>'+jobsortStr).attr('v',jobsortId);
			//行业
			var callingStr = '';
			var callingId = '';
			var calling = $('#dropCalling').getCallingValue();
			for(var j=0;j<calling.length;j++){
				if(j==calling.length-1){
					callingStr+=calling[j].split(',')[1];
					callingId +=calling[j].split(',')[0];
				}else{
					callingStr+=calling[j].split(',')[1]+',';
					callingId +=calling[j].split(',')[0]+',';
				}
			}
			$('#expectCalling').html('<em>期望的行业有</em>'+callingStr).attr('v',callingId);
			//地区
			var areaStr = '';
			var areaSpecialStr = '';
			var areaId = '';
			var area = $('#dropAreaMultiple').getMultipleareaValue();
			for(var k=0; k < area.length;k++){
				if(k==area.length-1){
					areaStr+=area[k].name;
					areaId+=area[k].ids;
				}else{
					areaStr+=area[k].name+',';
					areaId+=area[k].ids+',';
				}
			}
			$('#expectArea').html('<em>期望的工作地点有</em>'+areaStr).attr('v',areaId);
			//岗位级别
			var joblevelId = $('#dropJobLevel').getDropListValue();
			var joblevelStr = $('#dropJobLevel').find('li[v='+joblevelId+']').html();
			$('#spnJobLevel').attr('v',joblevelId).html(joblevelStr);
			var isJoblevel = $('#chkJobLevel');
			if(isJoblevel.is(':checked')){
				$('#spnAcceptLowerJobLevel').attr('v','1').text('（不接受低级别岗位）');
			}else{
				$('#spnAcceptLowerJobLevel').attr('v','0').text('');
			}
			//薪资
			var salaryId = $('#dropSalary').getDropListValue();
			var salaryStr = $('#dropSalary').find('li[v='+salaryId+']').html();
			$('#spnSalary').attr('v',salaryId).html(salaryStr+'元/月');
			var isSalaryShow = $('#chkSalaryShow');
			var isLowSalary = $('#chkSalary');
			if(isSalaryShow.is(':checked')&&isLowSalary.is(':checked')){
				$('#spnSalaryShow').attr('v','1').text('（简历中显示为面议,');
				$('#spnAcceptLowerSalary').attr('v','1').text('不接受低于此薪酬的工作）');
			}else if(isSalaryShow.is(':checked')){
				$('#spnSalaryShow').attr('v','1').text('（简历中显示为面议）');
				$('#spnAcceptLowerSalary').attr('v','0').text('');
			}else if(isLowSalary.is(':checked')){
				$('#spnSalaryShow').attr('v','0').text('');
				$('#spnAcceptLowerSalary').attr('v','1').text('（不接受低于此薪酬的工作）');
			}else{
				$('#spnSalaryShow').attr('v','0').text('');
				$('#spnAcceptLowerSalary').attr('v','0').text('');
			}
		},
		checkFill:function(){
			//验证求职意向是否已填写
			return $('#spnStation').html()!='' || $('#spnAcceptParttime').attr('v')!='' || $('#expectJobsort').attr('v')!=''
				|| $('#expectCalling').attr('v')!='' || $('#expectArea').attr('v')!='' || $('#spnJobLevel').attr('v')!=''
				|| $('#spnAcceptLowerJobLevel').attr('v')!='' || $('#spnSalary').attr('v')!='' || $('#spnSalaryShow').attr('v')!=''
				|| $('#spnAcceptLowerSalary').attr('v')!='' ;
		}
	};
})();


var skillValid;
var skill=(function(){
	var isSubmitAdd=false;
	var template='<li class="infoview" id="liSkill{0}">'+
				 '	<div>'+   
				 '		<p class="tip modify">'+	
				 '		<a href="javascript:void(0)" onclick="skill.mod({0});">修改</a>'	+	
				 '		<a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="技能" targetCall="skill.del({0});">删除</a>'+		
				 '		</p>'+	
				 '		</div>'+
				 '		<div class="tagTxt">'+
				 '		<i class="fist"><span class="fist" id="skillNa{0}"><b>{1}</b></span></i>'+  
				 '		<i class="end"><span class="end" id="skillLe{0}" v="{2}">{3}</span></i>'+ 
				 '	</div>'+
				 '<div class="clear"></div>'+
				'</li>';
	return{
		isCanSave:false,
		isAllSave:false,
		init:function(){
			skillValid = $('#formSkill').validate({
				rules:{                                            
					txtSkillName:{required:true,rangelength:[1,20]},
					hidSkillLevel:{required:true}
				},
				messages:{
					txtSkillName:{required:'请填写技能名称<span class="tipArr"></span>',rangelength:'1-20个字<span class="tipArr"></span>'},
					hidSkillLevel:{required:'请选择熟练程度<span class="tipArr"></span>'}
				},
				tips:{
					txtSkillName:'1-20个字<span class="tipArr"></span>'
				},
				errorClasses:{
					txtSkillName:{ required: 'tipLayErr tipw150',rangelength:'tipLayErr tipw150'},
					hidSkillLevel:{required:'tipLayErr tipw150'}
				},
				groups:{
					skill:'txtSkillName hidSkillLevel'
				},
				tipClasses:{
					txtSkillName:'tipLayTxt tipw150'
				},
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formSkill').data("validator",skillValid);
		},
		mod:function(i){
			skill.add();
			this.isCanSave = true;
			$('#hidModSkillID').val(i);
			$('#txtSkillName').val($('#skillNa'+i).find('b').html()).removeClass('textGray');
			$('#dropSkillLevel').setDropListValue($('#skillLe'+i).attr('v'));
		},
		add:function(isScroll){
			skill.clearInput();
			this.isCanSave = true;
			$('#divModSkillAdd').hide();
			$('#modSkill').show();
			if ($("#showSkill li.infoview").length > 0) {
				$("#btnSkillCancel").show();
			}
			else{
				$('#skillAddButton').hide();
				$('#skillNotFillButton').show();
			}
			
			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("skMod", 700,20);
			}
		},
		clearInput:function(){
			skillValid.resetForm();
			$('#txtSkillName').val('');
			$('#dropSkillLevel').initContent();
			$('#hidModSkillID').val('');
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modSkill").hide();
			$('#divModSkillAdd').show();
			skill.clearInput();
			$('#skillAddButton').show();
			$('#skillNotFillButton').hide();
		},
		del:function(i){
			var d = {
					 'operate':'DeleteSkill',
					 'resume_id':$('#hidResumeID').val(),
					 'skill_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				skill.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail'});
				return;
			}
			$('#liSkill'+json.skill_id).remove();
			if($('#hidModSkillID').val() == json.skill_id){
				skill.clearInput();
			}
			var c = $("#conSkill").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(5, 1, "conSkill");
			}
		},
		submit:function(a,isAllSave){
			//检查是否已经提交过
			var skillName = $('#txtSkillName').val();
			if(skill.isSkillExisted(skillName)){
				$.anchor('您已经添加过这项技能！',{icon:'fail'});
				return;
			}
			
			//验证并提交
			isSubmitAdd = a;
			this.isAllSave = isAllSave;
			var data = { resume_id: resume_id };
			if(!skillValid.form()){scroller("skMod", 700,20);return false;}
			$("#btnSkillSave").submitForm({ beforeSubmit: $.proxy(skillValid.form, skillValid), data: data, success: skill.submitCallback, clearForm: false });
	        return false;
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail'});
				return;
			}
			 skill.updateViewAndShow(json.skill_id);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("sk", 700);
			 if(expect.isAllSave) saveAll();
		},
		updateViewAndShow:function(i){
			if (typeof(i) != 'undefined' && i != null && i > 0) {
				 //更新分数
				 if($('#showSkill').find('li').length==0){
					 right.changeScore(5, 0, "conSkill");
				 }
				 //增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#btnSkillCancel').show();
				 //获取选中值，更新显示层
				 var skillName = $('#txtSkillName').val();
				 var levelID = $('#dropSkillLevel').getDropListValue();
				 var levelName = $('#dropSkillLevel').find('li[v='+levelID+']').html();
				 
				 if($('#liSkill'+i).length>0){
					 $('#liSkill'+i).remove();
				 }
				 $('#ulShowSkill').prepend($.format(template,i,skillName,levelID,levelName));
				 skill.clearInput();

				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modSkill").hide();
					 $('#divModSkillAdd').show();
				 }
				$('#skillAddButton').show();
				$('#skillNotFillButton').hide();
			 }
		},
		isSkillExisted:function(name){
			var modSkillId = $('#hidModSkillID').val();
			var isExist = false;
			if(modSkillId != undefined && modSkillId!= '' && modSkillId!=null)
			{
				$.each($('#ulShowSkill').find('li').not('#liSkill'+modSkillId),function(i,n){
					if($(n).find('span[id^=skillNa]').eq(0).text()==name){
						isExist = true;
						return false;
					}
				});
			}
			else{
				$.each($('#ulShowSkill').find('li'),function(i,n){
					if($(n).find('span[id^=skillNa]').eq(0).text()==name){
						isExist = true;
						return false;
					}
				});
			}
			return isExist;
		}
	};
})();

var practiceValid;
var practice=(function(){
	var isSubmitAdd = false;
	var template='<li class="infoview" id="liPractice{0}">'+
    			 '	<div>'+
    			 '		<p class="tip modify">'+
    			 '		<a href="javascript:void(0)" onclick="practice.mod({0});">修改</a>'+
    			 '		<a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="实践经验" targetCall="practice.del({0});">删除</a>'+
    			 '		</p>'+
    			 '	</div>'+
    			 '	<div class="L"><p><span class="sTime" id="practiceST{0}" v="{1}">{2}</span> 至 <span class="eTime" id="practiceSE{0}" v="{3}">{4}</span></p></div>'+
    			 '	<div class="R">'+
    			 '		<div class="tagTxt">'+
    			 '		<b><span class="end" id="practiceNa{0}">{5}</span></b>'+
    			 '		</div>'+
    			 '		<p class="depTxt" id="practiceDe{0}">{6}</p>'+
    			 '</div>'+
    			 '<div class="clear"></div>'+
    			 '</li>';
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			huibo.date.bind({
				id: "PracticeTime",
				dateEntry: [0, 1,3,4],
				size: 20,
				min: -55,
				max: 0,
				onSelect:function(){
					var intPracticeTimeS = 0;
					var intPracticeSYear = parseInt($('#inpPracticeTimeStartYear').val());
					var intPracticeSMonth = parseInt($('#inpPracticeTimeStartMonth').val());
					if(!isNaN(intPracticeSYear)){
						intPracticeTimeS += intPracticeSYear*10000;
					}
					if(!isNaN(intPracticeSMonth)){
						intPracticeTimeS += intPracticeSMonth*100;
					}
					$('#hidPracticeTimeStart').val(intPracticeTimeS);
					
					var intPracticeTimeE = 0;
					var intPracticeEYear = parseInt($('#inpPracticeTimeEndYear').val());
					var intPracticeEMonth = parseInt($('#inpPracticeTimeEndMonth').val());
					if(!isNaN(intPracticeEYear)){
						intPracticeTimeE += intPracticeEYear*10000;
					}
					if(!isNaN(intPracticeEMonth)){
						intPracticeTimeE += intPracticeEMonth*100;
					}
					$('#hidPracticeTimeEnd').val(intPracticeTimeE);
					
					practiceValid.element($('#inpPracticeTimeStartYear'));
					practiceValid.element($('#inpPracticeTimeStartMonth'));
					practiceValid.element($('#hidPracticeTimeEnd'));
				}
			});

			practiceValid = $('#formPractice').validate({
				rules:{
					txtPracticeName:{required:true,rangelength:[4,30]},
					inpPracticeTimeStartYear:{required: true, number: true, range: [1800, 3000]},
					inpPracticeTimeStartMonth:{required: true, number: true, range: [1, 12]},
					inpPracticeTimeEndYear:{ number: true, range: [1800, 3000]},
					inpPracticeTimeEndMonth:{ number: true, range: [1, 12]},
					taPracticeDetail:{maxlength:500},
					hidPracticeTimeEnd:{LaterThan:['hidPracticeTimeStart',2,'chkPracticeNow']}
				},
				messages:{
					txtPracticeName:{required:'请填写实践名称<span class="tipArr"></span>',rangelength:'4-30个字<span class="tipArr"></span>'},
					inpPracticeTimeStartYear:{required: '请选择实践时间年份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
			    	inpPracticeTimeStartMonth:{required: '请选择实践时间月份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	inpPracticeTimeEndYear:{ number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
					inpPracticeTimeEndMonth:{ number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
					taPracticeDetail:{maxlength:'不超过500个字<span class="tipArr"></span>'}
				},
				tips:{
					txtPracticeName:'4-30个字<span class="tipArr"></span>',
					taPracticeDetail:'不超过500个字<span class="tipArr"></span>'
				},
				errorClasses:{
					txtPracticeName:{ required: 'tipLayErr tipw180',rangelength:'tipLayErr tipw180'},
					inpPracticeTimeStartYear:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw100', range: 'tipLayErr tipw150'},
					inpPracticeTimeStartMonth:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw100', range: 'tipLayErr tipw150'},
					taPracticeDetail:{maxlength:'tipLayErr tipw120'},
					hidPracticeTimeEnd:{LaterThan:'tipLayErr tipw180'}
				},
				tipClasses:{
					txtPracticeName: 'tipLayTxt tipw180',
					taPracticeDetail:'tipLayTxt tipw120'
				},
				groups:{
			    	workTime:'inpPracticeTimeStartYear inpPracticeTimeStartMonth inpPracticeTimeEndYear inpPracticeTimeEndMonth hidPracticeTimeEnd'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formPractice').data("validator",practiceValid);
		},
		mod:function(i){
			this.isCanSave = true;
			practice.add();
			$('#hidModPracticeID').val(i);
			$('#txtPracticeName').val($('#practiceNa'+i).html());
			$('#taPracticeDetail').val($('#practiceDe'+i).html());
			
			var practiceStTime =new Date($('#practiceST'+i).attr('v'));
			$('#inpPracticeTimeStartYear').val(practiceStTime.getFullYear());
			$('#inpPracticeTimeStartMonth').val(practiceStTime.getMonth()+1);
			$('#hidPracticeTimeStart').val(practiceStTime.getFullYear()*10000+(practiceStTime.getMonth()+1)*100);

			if($('#practiceSE'+i).attr('v') != ''){
				var practiceEnTime = new Date($('#practiceSE'+i).attr('v'));
				if(typeof(practiceEnTime) == 'object'){
					$('#inpPracticeTimeEndYear').val(practiceEnTime.getFullYear());
					$('#inpPracticeTimeEndMonth').val(practiceEnTime.getMonth()+1);	
					$('#hidPracticeTimeEnd').val(practiceEnTime.getFullYear()*10000+(practiceEnTime.getMonth()+1)*100);
				}
				else{
					$('#chkPracticeNow').attr('checked','checked');
					$('#inpPracticeTimeEndMonth,#inpPracticeTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
					$('#hidPracticeTimeEnd').val('');
				}
			}
			else{
				$('#chkPracticeNow').attr('checked','checked');
				$('#inpPracticeTimeEndYear,#inpPracticeTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
				$('#hidPracticeTimeEnd').val('');
			}
		},
		add:function(isScroll){
			this.isCanSave = true;
			practice.clearInput();
			$('#divModPracticeAdd').hide();
			$('#modPractice').show();
			if ($("#showPractice li.infoview").length > 0) {
				$("#btnPracticeCancel").show();
			}
			else{
				$('#practiceAddButton').hide();
				$('#practiceNotFillButton').show();
			}

			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("praMod", 700,20);
			}
		},
		clearInput:function(){
			practiceValid.resetForm();
			$('#txtPracticeName').val('');
			$('#inpPracticeTimeStartYear').val('');
			$('#inpPracticeTimeStartMonth').val('');
			$('#inpPracticeTimeEndYear').val('').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			$('#inpPracticeTimeEndMonth').val('').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			$('#chkPracticeNow').removeAttr('checked');	
			$('#taPracticeDetail').val('');
			$('#hidModPracticeID').val('');
			
			$('#hidPracticeTimeStart,#hidPracticeTimeEnd').val('');
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modPractice").hide();
			$('#divModPracticeAdd').show();
			practice.clearInput();
			$('#practiceAddButton').show();
			$('#practiceNotFillButton').hide();
		},
		del:function(i){
			var d = {
					 'operate':'DeletePractice',
					 'resume_id':$('#hidResumeID').val(),
					 'practice_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				practice.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail'});
				return;
			}
			$('#liPractice'+json.practice_id).remove();
			if($('#hidModPracticeID').val() == json.practice_id){
				practice.clearInput();
			}
			var c = $("#conPractice").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(5, 1, "conPractice");
			}
		},
		submit:function(a,isAllSave){
			//验证并提交
			this.isAllSave = isAllSave;
			isSubmitAdd = a;
			var data = { resume_id: resume_id };
			if(!practiceValid.form()){scroller("praMod", 700,20);return false;}
			$("#btnPracticeSave").submitForm({ beforeSubmit: $.proxy(practiceValid.form, practiceValid), data: data, success: practice.submitCallback, clearForm: false });
	        return false;
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail'});
				return;
			}
			 practice.updateViewAndShow(json.practice_id);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("pra", 700);
			 if(practice.isAllSave) saveAll('practice');
		},
		updateViewAndShow:function(i){
			if (typeof(i) != 'undefined' && i != null && i > 0) {
				//更新分数
				 if($('#showPractice').find('li').length==0){
					 right.changeScore(5, 0, "conPractice");
				 }
				 //增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#btnPracticeCancel').show();
				 //获取选中值，更新显示层
				 var txtPracticeName = $('#txtPracticeName').val();
				 var txtPracticeDetail = $('#taPracticeDetail').val();
				 
				 var practiceStTime = new Date($('#inpPracticeTimeStartYear').val()+'/'+($('#inpPracticeTimeStartMonth').val()<10?'0'+$('#inpPracticeTimeStartMonth').val():$('#inpPracticeTimeStartMonth').val())+'/01');
				 var practiceStTime1 = '';
				 var practiceStTime2 = '';
				 if(typeof(practiceStTime) == 'object'){
					 practiceStTime1 = practiceStTime.getFullYear()+'/'+( (practiceStTime.getMonth()+1)<10? ('0'+(practiceStTime.getMonth()+1)):(practiceStTime.getMonth()+1)) +'/01';
					 practiceStTime2 = practiceStTime.getFullYear()+'.'+( (practiceStTime.getMonth()+1)<10? ('0'+(practiceStTime.getMonth()+1)):(practiceStTime.getMonth()+1)) ;
				 }
				 var practiceEnTime1 = '';
				 var practiceEnTime2 = '';
				 if($('#inpPracticeTimeEndYear').val()!='' && $('#inpPracticeTimeEndMonth').val()!=''){
					 var practiceEnTime = new Date($('#inpPracticeTimeEndYear').val()+'/'+($('#inpPracticeTimeEndMonth').val()<10?'0'+$('#inpPracticeTimeEndMonth').val():$('#inpPracticeTimeEndMonth').val())+'/01');
					 if(typeof(practiceEnTime) == 'object'){
						 practiceEnTime1 = practiceEnTime.getFullYear()+'/'+((practiceEnTime.getMonth()+1)<10?('0'+(practiceEnTime.getMonth()+1)):(practiceEnTime.getMonth()+1)) + '/01';
						 practiceEnTime2 = practiceEnTime.getFullYear()+'.'+((practiceEnTime.getMonth()+1)<10?('0'+(practiceEnTime.getMonth()+1)):(practiceEnTime.getMonth()+1));
					 }
					 else{
						 practiceEnTime2 = '至今';
					 }			 
				 }
				 else{
					 practiceEnTime2 = '至今';
				 }
				 if($('#liPractice'+i).length>0){
					 $('#liPractice'+i).remove();
				 }
				 addToUl('ulShowPractice',$.format(template,i,practiceStTime1,practiceStTime2,practiceEnTime1,practiceEnTime2,txtPracticeName,txtPracticeDetail),practiceStTime1,practiceEnTime1);
				 //$('#ulShowPractice').prepend($.format(template,i,practiceStTime1,practiceStTime2,practiceEnTime1,practiceEnTime2,txtPracticeName,txtPracticeDetail));
				 practice.clearInput();

				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modPractice").hide();
					 $('#divModPracticeAdd').show();
				 }
					$('#practiceAddButton').show();
					$('#practiceNotFillButton').hide();
			 }
		},
		selectNow:function(){
			if($('#chkPracticeNow').is(':checked')){
				$('#inpPracticeTimeEndYear,#inpPracticeTimeEndMonth').val('').addClass('textGray').addClass('textDis').attr('disabled','disabled');
				$('#hidPracticeTimeEnd').val('');
			}
			else{
				$('#inpPracticeTimeEndYear,#inpPracticeTimeEndMonth').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			}
			practiceValid.element($('#hidPracticeTimeEnd'));
		}
	};
})();

var appendValid;
var append=(function(){
	var isSubmitAdd = false;
	var template='<li class="infoview" id="liAppend{0}">'+
    			 '	<div>'+
    			 '		<p class="tip modify">'+
    			 '			<a href="javascript:void(0)" onclick="append.mod({0});">修改</a>'+
    			 '			<a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="附加信息" targetCall="append.del({0});">删除</a>'+
    			 '		</p>'+
    			 '	</div>'+
    			 '	<div class="tagTxt">'+
    			 '  	<span class="L" id="appendDe{0}">{1}</span>'+
    			 '		<span class="R" id="appendCo{0}">{2}</span>'+
    			 '	</div>'+
    			 '</li>';
	return{
		isCanSave:false,
		isAllSave:false,
		init:function(){
			appendValid = $('#formAppend').validate({
				rules:{
					txtTopicDesc:{required:true,rangelength:[2,6]},
					taTopicContent:{required:true,rangelength:[10,300]},
					hidAppendType:{required:true}
				},
				messages:{
					txtTopicDesc:{required:'请填写自定义主题<span class="tipArr"></span>',rangelength:'2-6个字<span class="tipArr"></span>'},
					taTopicContent:{required:'请填写内容描述<span class="tipArr"></span>',rangelength:'10-300个字<span class="tipArr"></span>'},
					hidAppendType:{required:'请选择主题类型<span class="tipArr"></span>'}
				},
				tips:{
					txtTopicDesc:'2-6个字<span class="tipArr"></span>',
					taTopicContent:'10-300个字<span class="tipArr"></span>'
				},
				errorClasses:{
					txtTopicDesc:{required:'tipLayErr tipw120',rangelength:'tipLayErr tipw120'},
					taTopicContent:{required:'tipLayErr tipw120',rangelength:'tipLayErr tipw120'},
					hidAppendType:{required:'tipLayErr tipw120'}
				},
				tipClasses:{
					txtTopicDesc: 'tipLayTxt tipw120',
					taTopicContent: 'tipLayTxt tipw120'
				},
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().next().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formAppend').data("validator",appendValid);
			//设置字数
			$('#taTopicContent').setListen({max:300});
		},
		mod:function(i){
			this.isCanSave = true;
			append.add();
			$('#hidModAppendID').val(i);
			var isCustom = true;
			var setValue = '';
			$('#dropTopic').find('li').each(function(key,val){
				var v = $(this).attr('v');
				var html = $(this).html();
				if(v!='99'&&v!=''){
					if(html==$('#appendDe'+i).html()){
						isCustom = false;
						setValue = v;
					}
				}
			});
			if(isCustom){
				$('#dropTopic').setDropListValue('99');
				$('#txtTopicDesc').val($('#appendDe'+i).html()).removeAttr("disabled");
				$('#spanTopicDesc').show();
			}else{
				$('#dropTopic').setDropListValue(setValue);
				$('#txtTopicDesc').val('').attr("disabled", "disabled");
				$('#spanTopicDesc').hide();
			}
			$('#taTopicContent').val($('#appendCo'+i).html()).removeClass('textGray');
		},
		add:function(isScroll){
			this.isCanSave = true;
			append.clearInput();
			$('#divModAppendAdd').hide();
			$('#modAppend').show();
			if ($("#showAppend li.infoview").length > 0) {
				$("#btnAppendCancel").show();
			}
			else{
				$('#appendAddButton').hide();
				$('#appendNotFillButton').show();
			}
			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("apMod", 700,20);
			}
		},
		clearInput:function(){
			appendValid.resetForm();
			$('#taTopicContent').val('');
			$('#hidModAppendID').val('');
			$('#hidAppendContent').val('');
			$('#dropTopic').initContent('');
			$('#spanTopicDesc').hide();
			$('#txtTopicDesc').val('').attr("disabled", "disabled");
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modAppend").hide();
			$('#divModAppendAdd').show();
			append.clearInput();
			$('#appendAddButton').show();
			$('#appendNotFillButton').hide();
		},
		del:function(i){
			var d = {
					 'operate':'DeleteAppend',
					 'resume_id':$('#hidResumeID').val(),
					 'append_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				append.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail'});
				return;
			}
			$('#liAppend'+json.append_id).remove();
			if($('#hidModAppendID').val() == json.append_id){
				append.clearInput();
			}
			var c = $("#conAppend").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(5, 1, "conAppend");
			}
		},
		submit:function(a,isAllSave){
			//验证并提交
			this.isAllSave = isAllSave;
			isSubmitAdd = a;
			var data = { resume_id: resume_id };
			if(!appendValid.form()){scroller("apMod", 700,20);return false;}
			$("#btnAppendSave").submitForm({ beforeSubmit: $.proxy(appendValid.form, appendValid), data: data, success: append.submitCallback, clearForm: false });
	        return false;
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail'});
				return;
			}
			 append.updateViewAndShow(json.append_id);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("ap", 700);
			 if(append.isAllSave) saveAll('append');
		},
		updateViewAndShow:function(i){
			if (typeof(i) != 'undefined' && i != null && i > 0) {
				 //更新分数
				 if($('#showAppend').find('li').length==0){
					 right.changeScore(5, 0, "conAppend");
				 }
				 //增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#btnAppendCancel').show();
				 //获取选中值，更新显示层
				 var topicContent = $('#taTopicContent').val();
				 var topicDesc = '';
				 var topicId = $('#dropTopic').getDropListValue();
				 if(topicId!=99){
				  	topicDesc = $('#dropTopic').find('li[v='+topicId+']').html();
				 }else{
					topicDesc = $('#txtTopicDesc').val();
				 }
				 if($('#liAppend'+i).length>0){
					 $('#liAppend'+i).remove();
				 }
				 $('#ulShowAppend').prepend($.format(template,i,topicDesc,topicContent));
				 append.clearInput();

				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modAppend").hide();
					 $('#divModAppendAdd').show();
				 }
					$('#appendAddButton').show();
					$('#appendNotFillButton').hide();
			 }
		}
	};
})();


var projectValid;
var project=(function(){
	var isSubmitAdd=false;
	var template='<li class="infoview" id="liProject{0}" > ' +
    '       <div> '+
    '           <p class="tip modify">'+
    '              <a href="javascript:void(0)" onclick="project.mod({0});">修改</a>'+
    '              <a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="项目经验" targetCall="project.del({0});" class="del">删除</a>'+
    '           </p>'+
    '       </div>'+
    '       <div class="L"><span class="sTime" id="projectST{0}" v="{1}">{2}</span> 至 <span class="eTime" id="projectSE{0}" v="{3}">{4}</span></p><p class="fn12">{5}</div>'+
    '		<div class="R">'+
    '		<div class="tagTxt">'+
    '  			<i class="fist"><b><span id="projectNa{0}">{6}</span></b></i>'+
    '  			<i class="end"><span id="projectDu{0}">{7}</span></i>'+
    '		</div>'+
    '		<p class="depTxt" id="projectDe{0}">{8}</p>'+
    '		<p class="depTxt" id="projectMa{0}">{9}</p>'+
    '		</div>'+	
    '       <div class="clear"></div>'+
    '</li>';
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			huibo.date.bind({
				id: "ProjectTime",
				dateEntry: [0, 1,3,4],
				size: 20,
				min: -55,
				max: 0,
				onSelect:function(){
					var intProjectTimeS = 0;
					var intProjectSYear = parseInt($('#inpProjectTimeStartYear').val());
					var intProjectSMonth = parseInt($('#inpProjectTimeStartMonth').val());
					if(!isNaN(intProjectSYear)){
						intProjectTimeS += intProjectSYear*10000;
					}
					if(!isNaN(intProjectSMonth)){
						intProjectTimeS += intProjectSMonth*100;
					}
					$('#hidProjectTimeStart').val(intProjectTimeS);
					
					var intProjectTimeE = 0;
					var intProjectEYear = parseInt($('#inpProjectTimeEndYear').val());
					var intProjectEMonth = parseInt($('#inpProjectTimeEndMonth').val());
					if(!isNaN(intProjectEYear)){
						intProjectTimeE += intProjectEYear*10000;
					}
					if(!isNaN(intProjectEMonth)){
						intProjectTimeE += intProjectEMonth*100;
					}
					$('#hidProjectTimeEnd').val(intProjectTimeE);
					
					projectValid.element($('#inpProjectTimeStartYear'));
					projectValid.element($('#inpProjectTimeStartMonth'));
					projectValid.element($('#hidProjectTimeEnd'));
				}
			});

			projectValid = $('#formProject').validate({
				rules:{
					txtProjectName:{required:true,rangelength:[4,30]},
					txtDuty:{required:true,rangelength:[2,12]},
					inpProjectTimeStartYear:{required: true, number: true, range: [1800, 3000]},
					inpProjectTimeStartMonth:{required: true, number: true, range: [1, 12]},
					inpProjectTimeEndYear:{ number: true, range: [1800, 3000]},
					inpProjectTimeEndMonth:{ number: true, range: [1, 12]},
					taProjectIntr:{maxlength:200},
					taProjectExperience:{maxlength:500},
					hidProjectTimeEnd:{LaterThan:['hidProjectTimeStart',2,'chkProjectNow']}
				},
				messages:{
					txtProjectName:{required:'请填写项目名称<span class="tipArr"></span>',rangelength:'4-30个字<span class="tipArr"></span>'},
					txtDuty:{required:'请填写担任职务<span class="tipArr"></span>',rangelength:'2-12个字<span class="tipArr"></span>'},
					inpProjectTimeStartYear:{required: '请填写项目时间开始年份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
					inpProjectTimeStartMonth:{required: '请填写项目时间开始月份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	inpProjectTimeEndYear:{ number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
					inpProjectTimeEndMonth:{ number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
					taProjectIntr:{maxlength:'不超过200个字<span class="tipArr"></span>'},
					taProjectExperience:{maxlength:'不超过500个字<span class="tipArr"></span>'}
				},
				tips:{
					txtProjectName:'4-30个字<span class="tipArr"></span>',
					txtDuty:'2-12个字<span class="tipArr"></span>'
					//taProjectIntr:'限定200个字<span class="tipArr"></span>',
					//taProjectExperience:'限定200个字<span class="tipArr"></span>'
				},
				errorClasses:{
					txtProjectName:{ required: 'tipLayErr tipw180',rangelength:'tipLayErr tipw180'},
					txtDuty:{required:'tipLayErr tipw180',rangelength:'tipLayErr tipw180'},
					inpProjectTimeStartYear:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw150', range: 'tipLayErr tipw150'},
					inpProjectTimeStartMonth:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw150', range: 'tipLayErr tipw150'},
					taProjectIntr:{rangelength:'tipLayErr tipw150'},
					taProjectExperience:{rangelength:'tipLayErr tipw150'},
					hidProjectTimeEnd:{LaterThan:'tipLayErr tipw150'}
				},
				tipClasses:{
					txtProjectName: 'tipLayTxt tipw180',
					txtDuty:'tipLayTxt tipw180'
					//taProjectIntr:'tipLayTxt tipw150',
					//taProjectExperience:'tipLayTxt tipw150'
				},
				groups:{
			    	workTime:'inpProjectTimeStartYear inpProjectTimeStartMonth inpProjectTimeEndYear inpProjectTimeEndMonth hidProjectTimeEnd'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formProject').data("validator",projectValid);
			
			$('#taProjectIntr').setListen({max:300});
			$('#taProjectExperience').setListen({max:300});
		},
		mod:function(i){
			this.isCanSave = true;
			project.add();
			$('#hidModProjectID').val(i);
			$('#txtProjectName').val($('#projectNa'+i).html()).removeClass('textGray');
			$('#txtDuty').val($('#projectDu'+i).html()).removeClass('textGray');
			$('#taProjectIntr').val($('#projectDe'+i).html());
			$('#taProjectExperience').val($('#projectMa'+i).html());
			
			var projectStTime =new Date($('#projectST'+i).attr('v'));
			$('#inpProjectTimeStartYear').val(projectStTime.getFullYear());
			$('#inpProjectTimeStartMonth').val(projectStTime.getMonth()+1);
			$('#hidProjectTimeStart').val(projectStTime.getFullYear()*10000+(projectStTime.getMonth()+1)*100);
			
			if($('#projectSE'+i).attr('v') != ''){
				var projectEnTime = new Date($('#projectSE'+i).attr('v'));
				if(typeof(projectEnTime) == 'object'){
					$('#inpProjectTimeEndYear').val(projectEnTime.getFullYear());
					$('#inpProjectTimeEndMonth').val(projectEnTime.getMonth()+1);
					$('#hidProjectTimeEnd').val(projectEnTime.getFullYear()*10000+(projectEnTime.getMonth()+1)*100);
				}
				else{
					$('#chkProjectNow').attr('checked','checked');
					$('#inpProjectTimeEndYear,#inpProjectTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
					$('#hidProjectTimeEnd').val('');
				}
			}
			else{
				$('#chkProjectNow').attr('checked','checked');
				$('#inpProjectTimeEndYear,#inpProjectTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
				$('#hidProjectTimeEnd').val('');
			}
			//$('#taProjectExperience,#taProjectIntr').watermark2();
			$('#taProjectExperience,#taProjectIntr').trigger('blur');
		},
		add:function(isScroll){
			this.isCanSave = true;
			project.clearInput();
			$('#divModProjectAdd').hide();
			$('#modProject').show();
			if ($("#showProject li.infoview").length > 0) {
				$("#btnProjectCancel").show();
			}
			else{
				$('#projectAddButton').hide();
				$('#projectNotFillButton').show();
			}
			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("prMod", 700,20);
			}
			$('#taProjectExperience,#taProjectIntr').trigger('blur');
		},
		clearInput:function(){
			projectValid.resetForm();
			$('#txtProjectName').val('');
			$('#txtDuty').val('');
			$('#taProjectIntr').val('');
			$('#taProjectExperience').val('');
			$('#inpProjectTimeStartYear').val('');
			$('#inpProjectTimeStartMonth').val('');
			$('#inpProjectTimeEndYear,#inpProjectTimeEndMonth').val('').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			$('#chkProjectNow').removeAttr('checked');
			$('#hidModProjectID').val('');
			
			$('#hidProjectTimeStart,#hidProjectTimeEnd').val('');
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modProject").hide();
			$('#divModProjectAdd').show();
			project.clearInput();
			
			$('#projectAddButton').show();
			$('#projectNotFillButton').hide();
		},
		del:function(i){
			var d = {
					 'operate':'DeleteProject',
					 'resume_id':$('#hidResumeID').val(),
					 'project_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				project.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			
			$('#liProject'+json.project_id).remove();
			if($('#hidModProjectID').val() == json.project_id){
				project.clearInput();
			}
			var c = $("#conProject").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(5, 1, "conProject");
			}
		},
		selectNow:function(){
			if($('#chkProjectNow').is(':checked')){
				$('#inpProjectTimeEndYear,#inpProjectTimeEndMonth').val('').addClass('textGray').addClass('textDis').attr('disabled','disabled');
				$('#hidProjectTimeEnd').val('');
			}
			else{
				$('#inpProjectTimeEndYear,#inpProjectTimeEndMonth').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			}
			projectValid.element($('#hidProjectTimeEnd'));
		},
		submit:function(a,isAllSave){
			//验证并提交
			this.isAllSave = isAllSave;
			isSubmitAdd = a;
			var data = { resume_id: resume_id };
			if(!projectValid.form()){scroller("prMod", 700,20);return false;}
			$("#btnProjectSave").submitForm({ beforeSubmit: $.proxy(projectValid.form, projectValid), data: data, success: project.submitCallback, clearForm: false });
	        return false;
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail'});
				return;
			}
			 project.updateViewAndShow(json.project_id);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("pr", 700);
			 if(project.isAllSave) saveAll('project');
		},
		updateViewAndShow:function(i){
			 if (typeof(i) != 'undefined' && i != null && i > 0) {
				 //更新分数
				 if($('#showProject').find('li').length==0){
					 right.changeScore(5, 0, "conProject");
				 }

				 //增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#btnProjectCancel').show();
				 //获取选中值，更新显示层 
				 var projectStTime = new Date($('#inpProjectTimeStartYear').val()+'/'+($('#inpProjectTimeStartMonth').val()<10?'0'+$('#inpProjectTimeStartMonth').val():$('#inpProjectTimeStartMonth').val())+'/01');
				 var projectStTime1 = '';
				 var projectStTime2 = '';
				 if(typeof(projectStTime) == 'object'){
					 projectStTime1 = projectStTime.getFullYear()+'/'+( (projectStTime.getMonth()+1)<10? ('0'+(projectStTime.getMonth()+1)):(projectStTime.getMonth()+1)) +'/01';
					 projectStTime2 = projectStTime.getFullYear()+'.'+( (projectStTime.getMonth()+1)<10? ('0'+(projectStTime.getMonth()+1)):(projectStTime.getMonth()+1)) ;
				 }
				 
				 var projectEnTime1 = '';
				 var projectEnTime2 = '';
				 if($('#inpProjectTimeEndYear').val()!='' && $('#inpProjectTimeEndMonth').val()!=''){
					 var projectEnTime = new Date($('#inpProjectTimeEndYear').val()+'/'+($('#inpProjectTimeEndMonth').val()<10?'0'+$('#inpProjectTimeEndMonth').val():$('#inpProjectTimeEndMonth').val())+'/01');
					 if(typeof(projectEnTime) == 'object'){
						 projectEnTime1 = projectEnTime.getFullYear()+'/'+((projectEnTime.getMonth()+1)<10?('0'+(projectEnTime.getMonth()+1)):(projectEnTime.getMonth()+1)) + '/01';
						 projectEnTime2 = projectEnTime.getFullYear()+'.'+((projectEnTime.getMonth()+1)<10?('0'+(projectEnTime.getMonth()+1)):(projectEnTime.getMonth()+1));
					 }
					 else{
						 projectEnTime2 = '至今';
					 }			 
				 }
				 else{
					 projectEnTime2 = '至今';
				 }
				 var projectName = $('#txtProjectName').val(); 
				 var duty = $('#txtDuty').val();
				 var projectIntr = $('#taProjectIntr').val();
				 var projectExperience = $('#taProjectExperience').val();
				 
				 if($('#liProject'+i).length>0){
					 $('#liProject'+i).remove();
				 }
				 
				 
				 addToUl('ulShowProject',$.format(template,i,projectStTime1,projectStTime2,projectEnTime1,projectEnTime2,'',projectName,duty,projectIntr,projectExperience),projectStTime1,projectEnTime1);
				 //$('#ulShowProject').prepend($.format(template,i,projectStTime1,projectStTime2,projectEnTime1,projectEnTime2,'',projectName,duty,projectIntr,projectExperience));
				 project.clearInput();

				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modProject").hide();
					 $('#divModProjectAdd').show();
				 }
				 $('#projectAddButton').show();
				 $('#projectNotFillButton').hide();
			 }
		}
	};
})();

var highlight = (function(){
	var highlightValid;
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			//验证标签最后一个不能删除
//			$.validator.addMethod("lightMark", function() { 
//			    if($('#ulLightDesc').find('li').size()>0){
//			    	return true;
//			    }
//			    return false;
//			}, '必须保留一个亮点标签');
			
			highlightValid = $('#formHighlight').validate({
			    rules: {
					taApprise:{maxlength:200},
					txtHighlight:{rangelength:[2,10]}
			    },
			    messages: {
			    	taApprise:{ rangelength: '不超过200个字<span class="tipArr"></span>'},
			    	txtHighlight:{rangelength:'2-10个字<span class="tipArr"></span>'}
			    },
			    tips:{
			    	taApprise:'不超过200个字<span class="tipArr"></span>'
			    },
			    tipClasses:{
			    	taApprise:'tipLayTxt tipw150'
			    },
			    errorClasses:{
			    	taApprise:{required:'tipLayErr tipw100'},
			    	txtHighlight:{rangelength:'tipLayErr tipw150'}
			    }, 
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formHighlight').data("validator",highlightValid);
		},
		show:function(){
			this.isCanSave = false;
			$('#modHighlight').hide();
			$('#showHighlight').show();
		},
		mod:function(isScroll){
			this.isCanSave = true;
			highlight.updateMod();
			$('#modHighlight').show();
			$('#showHighlight').hide();
			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("hi", 700,20);
			}
		},
		updateMod:function(){
			$('#taApprise').val($('#spnApprise').html());
		},
		subCancel:function(){
			highlightValid.resetForm();
			this.isCanSave = false;		
			$('#modHighlight').hide();
			$('#showHighlight').show();
			if($('#ulShowHighlight').find('li').size()<=0){
				$('#divModHighLightAdd').show();
			}
		},
		submit:function(isAllSave){
			//验证并提交
			this.isAllSave = isAllSave;
			  var data = { resume_id: resume_id };
			  if(!highlightValid.form()){scroller("hi", 700,20);return false;}
			  $("#btnHighlightSave").submitForm({ beforeSubmit: $.proxy(highlightValid.form, highlightValid), data: data, success: highlight.submitCallback, clearForm: false });
	          return false;
		},
		submitCallback:function(json){
			 if(json.error){
				 $.message(json.error,{icon:'fail',timeout:5000});
				 return;
			 }
			 highlight.show();
			 highlight.updateView();   
			 scroller("hi", 700);
			 if(highlight.isAllSave) saveAll('highlight');
		},
		updateView:function(){
			 //更新分数
			 if($('#ulShowHighlight').find('li').length==0 && $('.hidLightDesc').length>0){
				 right.changeScore(5, 0, "conHighlight");
			 }
			 else if($('#ulShowHighlight').find('li').length>=0 && $('.hidLightDesc').length==0)
			 {
				 right.changeScore(5, 1, "conHighlight");
			 }
			 
			$('#ulShowHighlight').children().remove();
			var lights = $('.hidLightDesc');
			for(var i=0;i<lights.length;i++){
				$('#ulShowHighlight').append($('<li>'+ $(lights[i]).val() +'<b></b></li>'));
			}
			if($('#ulShowHighlight').find('li').length>0){
				$('#divModHighLightAdd').hide();
				$('#ulShowHighlight').show();
			}
			else{
				$('#divModHighLightAdd').show();
				$('#ulShowHighlight').hide();
			}
			if($('#taApprise').val()!=''){
				$('#spnApprise').text($('#taApprise').val()).addClass('line');
				$('#spnApprise').show();
			}
			else{
				$('#spnApprise').text($('#taApprise').val()).removeClass('line');
				$('#spnApprise').hide();
			}
			
		},
		addHighlight:function(){
			var lightDesc = $('#txtHighlight').val();
			if($.trim(lightDesc)==''){
				$.anchor('请填写标签内容',{icon:'fail'});
				return false;
			}
			if($('#ulLightDesc').find('li').length>=10){
				$.anchor('标签最多只能添加十项',{icon:'fail'});
				return false;
			}
			if($('#ulLightDesc').find('input[value='+lightDesc+']').length>0){
				$.anchor('你已经添加过这个标签',{icon:'fail'});
				return false;
			}
			var highlightTemplate='<li>{0}<input class="hidLightDesc" type="hidden" name="hidLightDesc[]" value="{0}" /> <a href="javascript:void(0)" onclick="highlight.removeHighlight(this);">x</a></li>';
			$('#ulLightDesc').append($.format(highlightTemplate,lightDesc));
			$('#txtHighlight').val('');
			highlightValid.element($('#txtHighlight'));
		},
		removeHighlight:function(obj){
			$(obj).parent().remove();
		}
	};
})();

var workValid;
var work = (function(){
	var isSubmitAdd=false;
	var template='<li class="infoview" id="liWork{0}" > ' +
    '       <div> '+
    '           <p class="tip modify">'+
    '              <a href="#" onclick="work.mod({0});return false;">修改</a>'+
    '              <a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="工作经验" targetCall="work.del({0});" class="del">删除</a>'+
    '           </p>'+
    '       </div>'+
    '       <div class="L"><p><span class="sTime" id="workST{0}" v="{1}">{2}</span> 至  <span class="eTime" id="workSE{0}" v="{3}">{4}</span></p><p class="fn12">{5}</p></div>'+
    '       <div class="R">'+
    '           <div class="tagTxt">'+
    '              <i class="fist"><span id="workJT{0}" v="{19}" class="workType" {24}>{20}</span><b><span id="workS{0}">{13}</span></b></i><i><span id="workJL{0}" v="{14}">{15}</span></i><i><span id="workSM{0}">{16}</span>元/月</i><i class="end"><span></span></i>'+
    '           </div>'+
    '           <p class="txt"><span id="workCN{0}">{6}</span>（<span id="workJS{0}" v="{7}">{8}</span>，<span id="workCP{0}" v="{9}">{10}</span>，<span id="workCS{0}" v="{11}">{12}</span>）</p>'+
    '           <p class="depTxt" {23}>工作内容:<span id="workWC{0}">{17}</span></p>'+

    '           <span id="workSS{0}" v="{18}" style="display:none"></span>'+
    '			<span id="workCa{0}" v="{21}" style="display:none">{22}</span>'+
    '       </div>'+
    '       <div class="clear"></div>'+
    '</li>';
	
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			huibo.date.bind({
				id: "WorkTime",
				dateEntry: [0,1,3,4],
				size: 20,
				min: -55,
				max: 0,
				onSelect:function(){
					var intWorkTimeS = 0;
					var intWorkSYear = parseInt($('#inpWorkTimeStartYear').val());
					var intWorkSMonth = parseInt($('#inpWorkTimeStartMonth').val());
					if(!isNaN(intWorkSYear)){
						intWorkTimeS += intWorkSYear*10000;
					}
					if(!isNaN(intWorkSMonth)){
						intWorkTimeS += intWorkSMonth*100;
					}
					$('#hidWorkTimeStart').val(intWorkTimeS);
					
					var intWorkTimeE = 0;
					var intWorkEYear = parseInt($('#inpWorkTimeEndYear').val());
					var intWorkEMonth = parseInt($('#inpWorkTimeEndMonth').val());
					if(!isNaN(intWorkEYear)){
						intWorkTimeE += intWorkEYear*10000;
					}
					if(!isNaN(intWorkEMonth)){
						intWorkTimeE += intWorkEMonth*100;
					}
					$('#hidWorkTimeEnd').val(intWorkTimeE);

					workValid.element($('#inpWorkTimeStartYear'));
					workValid.element($('#inpWorkTimeStartMonth'));
					workValid.element($('#hidWorkTimeEnd'));
				}
			});

			$('#workCallingContainer').calling({max:1,hddName:'hddWorkcalling',isLimit:true,unLimitedLevel:3,type:'single',onSelect:function(){
				workValid.element($('input[name=hddWorkcalling]'));
			}});
			$('#workJobsortContainer').jobsort({max:1,hddName:'hddWorkJobsort',isLimit:true,type:'single',onSelect:function(){
				workValid.element($('input[name=hddWorkJobsort]'));
			}});

			
			/**
			*  结束时间大于起始时间
			*  element  为结束时间的hidden
			*  param[0] 为起始时间的hidden      必填
			*  param[1] 为比较级别   3 为年月日，2为年月   必填
			*  param[2] 为至今 的复选框  选择至今时，表示结束时间为当前时间    非必填   为空时表示没有至今选项  
			*  
			*/
			$.validator.addMethod('LaterThan', function(value,element,param) {
			    var start = $('#'+param[0]).val();
			    var level = param[1]; 
			    var end = value;
			    if(typeof param[2] != undefined){
					var $chkNow = $('#'+param[2]);
					if($chkNow.is(':checked')){
						var now = new Date();
						if(level == 2){
							end = now.getFullYear()*10000+(now.getMonth()+1)*100; 
						}else if(level == 3){
							end = now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate(); 
						}
					}
				}
				return end>=start;
			}, '结束时间应大于起始时间<span class="tipArr"></span>');

			workValid = $('#formWork').validate({
			    rules: {
					txtWorkCompanyName: { required: true, rangelength: [4,30] },
					hddWorkcalling: {required:true},
					hddWorkJobsort:{required:true},
					hidWorkComSize: { required: true },
					hidWorkComProperty: { required: true },
					txtWorkStation : { required: true, rangelength: [2,12] },
					hidWorkJobType: { required: true },
					inpWorkTimeStartYear:{required: true, number: true, range: [1800, 3000]},
					inpWorkTimeStartMonth:{required: true, number: true, range: [1, 12]},
					inpWorkTimeEndYear:{ number: true, range: [1800, 3000]},
					inpWorkTimeEndMonth:{ number: true, range: [1, 12]},
					hidWorkJobLevel: { required: true },
					txtWorkSalaryMonth: { required: true ,number:true,range:[1,9999999]},
					taWorkContent: { maxlength:2000},
					hidWorkTimeEnd:{LaterThan:['hidWorkTimeStart',2,'chkWorkNow']}
			    },
			    messages: {
			    	txtWorkCompanyName: { required: '请填写公司名称<span class="tipArr"></span>', rangelength: '4-30个字<span class="tipArr"></span>' },
					hddWorkcalling: {required:'请选择公司行业<span class="tipArr"></span>'},
					hddWorkJobsort:{required:'请选择职位类别<span class="tipArr"></span>'},
			    	hidWorkComSize: { required: '请选择公司规模<span class="tipArr"></span>' },
			    	hidWorkComProperty: { required: '请选择公司性质<span class="tipArr"></span>' },
			    	txtWorkStation : { required: '请填写职位名称<span class="tipArr"></span>', rangelength: '2-12个字<span class="tipArr"></span>' },
			    	hidWorkJobType: { required: '请选择工作类型<span class="tipArr"></span>'  },
			    	inpWorkTimeStartYear:{required: '请填写在职时间年份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
			    	inpWorkTimeStartMonth:{required: '请填写在职时间月份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	inpWorkTimeEndYear:{ number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
					inpWorkTimeEndMonth:{ number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	hidWorkJobLevel: { required: '请选择职位级别<span class="tipArr"></span>'},
			    	txtWorkSalaryMonth: { required: '请填写税前月薪<span class="tipArr"></span>' ,number:'请填写数字<span class="tipArr"></span>',range:'请填写正确的税前月薪<span class="tipArr"></span>'},
			    	taWorkContent: { maxlength:'不超过2000个字 <span class="tipArr"></span>'}
			    },
			    errorClasses:{
					txtWorkCompanyName: { required: 'tipLayErr tipw100',rangelength:'tipLayErr tipw150'},
					hddWorkcalling: {required:'tipLayErr tipw100'},
					hddWorkJobsort:{required:'tipLayErr tipw100'},
					hidWorkComSize: { required: 'tipLayErr tipw100'},
					hidWorkComProperty: { required: 'tipLayErr tipw100'},
					txtWorkStation : { required: 'tipLayErr tipw100', rangelength: 'tipLayErr tipw150' },
					hidWorkJobType: { required: 'tipLayErr tipw100' },
					inpWorkTimeStartYear:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw150', range: 'tipLayErr tipw150'},
					inpWorkTimeStartMonth:{required: 'tipLayErr tipw150', number: 'tipLayErr tipw150', range: 'tipLayErr tipw150'},
					hidWorkJobLevel: { required: 'tipLayErr tipw100' },
					txtWorkSalaryMonth: { required: 'tipLayErr tipw100' ,number:'tipLayErr tipw150',range:'tipLayErr tipw180'},
					taWorkContent: { maxlength:'tipLayErr tipw100'},
					hidWorkTimeEnd:{LaterThan:'tipLayErr tipw150'}
			    },
			    tips: {
			    	txtWorkCompanyName:'4-30个字<span class="tipArr"></span>',
			    	txtWorkStation:'2-12个字<span class="tipArr"></span>'
				},
			    tipClasses:{
			    	txtWorkCompanyName: 'tipLayTxt tipw150',
			    	txtWorkStation:'tipLayTxt tipw100'
			    },
			    groups:{
			    	work:'txtWorkStation hidWorkJobType',
			    	workTime:'inpWorkTimeStartYear inpWorkTimeStartMonth inpWorkTimeEndYear inpWorkTimeEndMonth hidWorkTimeEnd'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formWork').data("validator",workValid);
			
			
			 $('#txtWorkCompanyName').autocomplete("/resume/AutoComplete", {
				 resultsClass:"tSchJobRts",
				 max: 6,    //列表里的条目数
				 minChars: 1,    //自动完成激活之前填入的最小字符
				 width:250,     //提示的宽度，溢出隐藏
				 scrollHeight:120,   //提示的高度，溢出显示滚动条
				 matchContains: true,    //包含匹配，就是data参数里的数据，是否只要包含文本框里的数据就显示
		         scroll:false,
		         dataType:"json",
				 autoFill: false,    //自动填充
		         extraParams:{
		            type:'company',
		            key:function(){
		                return escape($.trim($("#txtWorkCompanyName").val()));
		            }
		        },
				 formatItem: function(row) {
					 return '<span class="autTempL">'+row.item+'</span>';
				 },
				 formatMatch: function(row) {
					 return row.item;
				 },
				 formatResult: function(row) {
					return row.item;
				 }
			 });
			 
			 $('#txtWorkStation').autocomplete("/resume/AutoComplete", {
				 resultsClass:"tSchJobRts",
				 max: 6,    //列表里的条目数
				 minChars: 1,    //自动完成激活之前填入的最小字符
				 width:210,     //提示的宽度，溢出隐藏
				 scrollHeight:120,   //提示的高度，溢出显示滚动条
				 matchContains: true,    //包含匹配，就是data参数里的数据，是否只要包含文本框里的数据就显示
		         scroll:false,
		         dataType:"json",
				 autoFill: false,    //自动填充
		         extraParams:{
		            type:'job',
		            key:function(){
		                return escape($.trim($("#txtWorkStation").val()));
		            }
		        },
				 formatItem: function(row) {
					 return '<span class="autTempL">'+row.item+'</span>';
				 },
				 formatMatch: function(row) {
					 return row.item;
				 },
				 formatResult: function(row) {
					return row.item;
				 }
			 });
		},
		mod:function(i){
			this.isCanSave = true;
			work.add();
			$('#workAddButton').show();
			$('#workNotFillButton').hide();
			
			$('#hidModWorkID').val(i);
			
			$('#txtWorkCompanyName').val($('#workCN'+i).html());
			$('#workCallingContainer').setCallingValue($('#workCa'+i).attr('v'));
			$('#workJobsortContainer').setJobSortValue($('#workJS'+i).attr('v'));
			$('#selWorkComSize').setDropListValue($('#workCS'+i).attr('v'));
			$('#selWorkComProperty').setDropListValue($('#workCP'+i).attr('v'));
			$('#txtWorkStation').val($('#workS'+i).html());
			$('#selWorkJobType').setDropListValue($('#workJT'+i).attr('v'));

			var workStTime =new Date($('#workST'+i).attr('v'));
			$('#inpWorkTimeStartYear').val(workStTime.getFullYear());
			$('#inpWorkTimeStartMonth').val(workStTime.getMonth()+1);
			$('#hidWorkTimeStart').val(workStTime.getFullYear()*10000+(workStTime.getMonth()+1)*100);
			
			if($('#workSE'+i).attr('v') != ''){
				var workEnTime = new Date($('#workSE'+i).attr('v'));
				if(typeof(workEnTime) == 'object'){
					$('#inpWorkTimeEndYear').val(workEnTime.getFullYear());
					$('#inpWorkTimeEndMonth').val(workEnTime.getMonth()+1);	
					$('#hidWorkTimeEnd').val(workEnTime.getFullYear()*10000+(workEnTime.getMonth()+1)*100);
				}
				else{
					$('#chkWorkNow').attr('checked','checked');
					$('#inpWorkTimeEndYear,#inpWorkTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
					$('#hidWorkTimeEnd').val('');
				}
			}
			else{
				$('#chkWorkNow').attr('checked','checked');
				$('#inpWorkTimeEndYear,#inpWorkTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
				$('#hidWorkTimeEnd').val('');
			}

			$('#selWorkJoblevel').setDropListValue($('#workJL'+i).attr('v'));
			$('#txtWorkSalaryMonth').val($('#workSM'+i).html());
			if($('#workSS'+i).attr('v')=='1'){
				$('#chkWorkSalarySecrecy').attr('checked','checked');
			}
			else{
				$('#chkWorkSalarySecrecy').removeAttr('checked');
			}
			$('#taWorkContent').val($('#workWC'+i).html());
			
			//$('#taWorkContent').watermark2();
			$('#taWorkContent').trigger('blur');
		},
		add: function(isScroll) {
			this.isCanSave = true;
			work.clearInput();
			$('#divModWorkAdd').hide();
			$("#modWork").show();
			if ($("#showWork li.infoview").length > 0) {
				$("#cancelBtnWork").show();
			}
			else{
				$('#workAddButton').hide();
				$('#workNotFillButton').show();
			}

			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("woMod", 700,20);
			}
		},
		clearInput: function() {
			workValid.resetForm();
			$('#txtCompanyName').val('');
			$('#workCallingContainer').resetCallingValue('');
			$('#workJobsortContainer').resetJobsortValue();
			$('#selWorkComSize').initContent('');
			$('#selWorkComProperty').initContent('');
			$('#txtWorkStation').val('');
			$('#selWorkJobType').initContent('');
			$('#selWorkJobType').setDropListValue(jobtypeFulltime);
			$('#inpWorkTimeStartYear').val('');
			$('#inpWorkTimeStartMonth').val('');
			$('#inpWorkTimeEndYear').val('').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			$('#inpWorkTimeEndMonth').val('').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			$('#chkWorkNow').removeAttr('checked');			
			$('#selWorkJoblevel').initContent('');
			$('#txtSalaryMonth').val('');
			$('#chkSalarySecrecy').removeAttr('checked');
			$('#taWorkContent').val('');

			$('#hidWorkTimeStart,#hidWorkTimeEnd').val('');
			$('#hidModWorkID').val('');
		},
		subCancel: function() {
			this.isCanSave = false;
			$("#modWork").hide();
			$('#divModWorkAdd').show();
			$('#workAddButton').show();
			$('#workNotFillButton').hide();
			work.clearInput();
		},
		del:function(i){
			var d = {
					 'operate':'DeleteWork',
					 'resume_id':$('#hidResumeID').val(),
					 'work_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				work.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			
			$('#liWork'+json.work_id).remove();
			if($('#hidModWorkID').val() == json.work_id){
				work.clearInput();
			}
			var c = $("#conWork").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(15, 1, "conWork");
			}
		},
		submit:function(a,isAllSave){
			//验证并提交
			  isSubmitAdd = a;
			  this.isAllSave = isAllSave;
			  var data = { resume_id: resume_id ,work_id:$('#hidModWorkID').val()};
			  if(!workValid.form()){scroller("woMod", 700,20);return false;}
			  $("#btnWorkSave").submitForm({ beforeSubmit: $.proxy(workValid.form, workValid), data: data, success: work.submitCallback, clearForm: false });
	          return false;
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			
			 work.updateViewAndShow(json.work_id);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("wo", 700);
			 if(work.isAllSave) saveAll('work');
		},
		updateViewAndShow:function(i){
			 if (typeof(i) != 'undefined' && i != null && i > 0) {		 
				 //更新分数
				 if($('#showWork').find('li').length==0){
					 right.changeScore(15, 0, "conWork");
				 }
				 //增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#cancelBtnWork').show();
				 
				 //获取选中值，更新显示层 
				 var workStTime = new Date($('#inpWorkTimeStartYear').val()+'/'+($('#inpWorkTimeStartMonth').val()<10?'0'+$('#inpWorkTimeStartMonth').val():$('#inpWorkTimeStartMonth').val())+'/01');
				 var workStTime1 = '';
				 var workStTime2 = '';
				 if(typeof(workStTime) == 'object'){
					 workStTime1 = workStTime.getFullYear()+'/'+( (workStTime.getMonth()+1)<10? ('0'+(workStTime.getMonth()+1)):(workStTime.getMonth()+1)) +'/01';
					 workStTime2 = workStTime.getFullYear()+'.'+( (workStTime.getMonth()+1)<10? ('0'+(workStTime.getMonth()+1)):(workStTime.getMonth()+1)) ;
				 }
				 			 
				 var workEnTime1 = '';
				 var workEnTime2 = '';
				 if($('#inpWorkTimeEndYear').val()!='' && $('#inpWorkTimeEndMonth').val()!=''){
					 var workEnTime = new Date($('#inpWorkTimeEndYear').val()+'/'+($('#inpWorkTimeEndMonth').val()<10?'0'+$('#inpWorkTimeEndMonth').val():$('#inpWorkTimeEndMonth').val())+'/01');
					 if(typeof(workEnTime) == 'object'){
						 workEnTime1 = workEnTime.getFullYear()+'/'+((workEnTime.getMonth()+1)<10?('0'+(workEnTime.getMonth()+1)):(workEnTime.getMonth()+1)) + '/01';
						 workEnTime2 = workEnTime.getFullYear()+'.'+((workEnTime.getMonth()+1)<10?('0'+(workEnTime.getMonth()+1)):(workEnTime.getMonth()+1));
					 }
					 else{
						 workEnTime2 = '至今';
					 }			 
				 }
				 else{
					 workEnTime2 = '至今';
				 }
				 
				 
				var startWorkYear = $('#inpStartYear').val()+'/'+$('#inpStartMonth').val()+'/1';
				var workMonthNum = timeUtil.date_diff_month(workStTime,workEnTime);
				var workY = Math.floor(workMonthNum/12);
				var workM = parseInt(workMonthNum%12);
				var workYearDesc;
				if(workM==0 && workY ==0){
					workYearDesc = '';
				}
				else if(workM == 0){
					workYearDesc = workY+'年';
				} else{
					workYearDesc = workY+'年零'+workM+'个月';
				}
				 

				 var companyName = $('#txtWorkCompanyName').val();
				 var jobsortID = $('#workJobsortContainer').getJobSortValue();
				 var jobsort_id = '',jobsort_name='';
				 if(jobsortID.length>0){
					 var jobsortArr =  jobsortID[0].split(",");
					 if(jobsortArr.length>0){
						 jobsort_id = jobsortArr[0];
						 jobsort_name = jobsortArr[1];
					 }
				 }
				 var callingId = $('#workCallingContainer').getCallingValue();
				 var calling_id = '',calling_name = '';
				 if(callingId.length>0){
					 var callingArr = callingId[0].split(',');
					 calling_id = callingArr[0];
					 calling_name = callingArr[1];
				 }
				 var comPropertyId = $('#selWorkComProperty').getDropListValue();
				 var comPropertyTxt = $('#selWorkComProperty').find('li[v='+comPropertyId+']').html();
				 var comSizeId = $('#selWorkComSize').getDropListValue();
				 var comSizeTxt = $('#selWorkComSize').find('li[v='+comSizeId+']').html();
				 var comPropertyId = $('#selWorkComProperty').getDropListValue();
				 var comPropertyTxt = $('#selWorkComProperty').find('li[v='+comPropertyId+']').html();
				 var workStation = $('#txtWorkStation').val();
				 var jobLevelId = $('#selWorkJoblevel').getDropListValue();
				 var jobLevelTxt = $('#selWorkJoblevel').find('li[v='+jobLevelId+']').html();
				 var salaryMonth = $('#txtWorkSalaryMonth').val();
				 var workContent = $('#taWorkContent').val();
				 //var department = $('#txtWorkDempartment').val();
				 //var subordinate = $('#txtWorkSubordinate').val();
				 var isSalaryShow = $('#chkWorkSalarySecrecy').is(':checked')?'1':'0';
				 var jobTypeId = $('#selWorkJobType').getDropListValue();
				 var jobTypeTxt = $('#selWorkJobType').find('li[v='+jobTypeId+']').html();
				 //var departmentDisplay = department==''?'style="display:none"':'';
				 //var subordinateDisplay = subordinate==''?'style="display:none"':'';
				 var workcontentDisplay = workContent==''?'style="display:none"':'';
				 var jobTypeDisplay = jobTypeId==jobtypeFulltime?'style="display:none"':'';

				 if($('#liWork'+i).length>0){
					 $('#liWork'+i).remove();
				 }
				 
				 addToUl('ulShowWork',$.format(template,i,workStTime1,workStTime2,workEnTime1,workEnTime2,workYearDesc,companyName,
						 jobsort_id,jobsort_name,comPropertyId,comPropertyTxt,comSizeId,comSizeTxt,workStation,jobLevelId,jobLevelTxt,salaryMonth,workContent,
						 isSalaryShow,jobTypeId,jobTypeTxt,calling_id,calling_name,workcontentDisplay,jobTypeDisplay),workStTime1,workEnTime1)
				 //$('#ulShowWork').prepend();
				 work.clearInput();

				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modWork").hide();
					 $('#divModWorkAdd').show();
				 }
				 $('#workAddButton').show();
				 $('#workNotFillButton').hide();
			 }
		},
		selectNow:function(){
			if($('#chkWorkNow').is(':checked')){
				$('#inpWorkTimeEndYear,#inpWorkTimeEndMonth').val('').addClass('textGray').addClass('textDis').attr('disabled','disabled');
				$('#hidWorkTimeEnd').val('');
			}
			else{
				$('#inpWorkTimeEndYear,#inpWorkTimeEndMonth').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			}
			workValid.element($('#hidWorkTimeEnd'));
		}
	}
})();


var certValid;
var cert = (function(){
	var isSubmitAdd=false;
	var template='<li class="infoview" id="liCert{0}" >'+
                 '    <div>'+
                 '           <p class="tip modify">'+
                 '               <a href="javascript:void(0)" onclick="cert.mod({0});">修改</a>'+
                 '               <a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="证书" targetCall="cert.del({0});" class="del">删除</a>'+
                 '           </p>'+
                 '    </div>'+
                 '    <div class="tagTxt">'+
                 '       <i class="fist"><b><span id="certCN{0}">{1}</span></b></i>'+
                 '       <i {7}><span class="gainTime" id="certGT{0}" v="{6}">{2}</span>获得</i>'+
                 '       <i {8}>成绩：<span id="certSc{0}">{3}</span></i>'+
                 '       <i {9} class="end">编号：<span id="certCe{0}">{4}</span></i>'+
                 '       <i><span id="certLI{0}" style="display:none">{5}</span></i>'+
                 '     </div>'+
                 '    <div class="clear"></div>'+
                 ' </li>';
	var addCertTemplate='<li class="infoview" id="liCert{0}" >'+
					    '    <div>'+
					    '           <p class="tip modify">'+
					    '               <a href="javascript:void(0)" onclick="cert.mod({0});">修改</a>'+
					    '               <a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="证书" targetCall="cert.del({0});" class="del">删除</a>'+
					    '           </p>'+
					    '    </div>'+
					    '    <div class="tagTxt">'+
					    '       <i class="fist"><b><span id="certCN{0}">{1}</span></b></i>'+
					    '     </div>'+
					    '    <div class="clear"></div>'+
					    ' </li>';
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			huibo.date.bind({
				id: "CertGainTime",
				dateEntry: [0, 1],
				size: 20,
				min: -55,
				max: 0,
				onSelect:function(){
					certValid.element($('#inpCertGainTimeYear'));
					certValid.element($('#inpCertGainTimeMonth'));
				}
			});
			$('#certificate').certificate({cerName:'txtCertName'});
			
			certValid = $('#formCert').validate({
			    rules: {
					txtCertName: { required: true,rangelength:[2,20]},
					inpCertGainTimeYear:{required: true, number: true, range: [1800, 3000]},
					inpCertGainTimeMonth:{required: true, number: true, range: [1, 12]},
					txtCertScore:{maxlength:32},
					txtCertNo:{maxlength:60},
					txtCertLicenceIssue:{maxlength:60}
			    },
			    messages: {
			    	txtCertName: { required: '请填写证书名称<span class="tipArr"></span>',rangelength:'2-20个字<span class="tipArr"></span>'},
			    	inpCertGainTimeYear:{required: '请填写获得时间年份<span class="tipArr"></span>', number: '年份请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
					inpCertGainTimeMonth:{required: '请填写获得时间月份<span class="tipArr"></span>', number: '年份请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
					txtCertScore:{maxlength:'不超过32个字<span class="tipArr"></span>'},
					txtCertNo:{maxlength:'不超过60个字<span class="tipArr"></span>'},
					txtCertLicenceIssue:{maxlength:'不超过60个字<span class="tipArr"></span>'}
			    },
			    errorClasses:{
			    	txtCertName: { required: 'tipLayErr tipw245',rangelength:'tipLayErr tipw245'},
			    	inpCertGainTimeYear:{required: 'tipLayErr tipw245', number: 'tipLayErr tipw245', range: 'tipLayErr tipw245'},
					inpCertGainTimeMonth:{required: 'tipLayErr tipw245', number: 'tipLayErr tipw245', range: 'tipLayErr tipw245'},
					txtCertScore:{maxlength:'tipLayErr tipw245'},
					txtCertNo:{maxlength:'tipLayErr tipw245'},
					txtCertLicenceIssue:{maxlength:'tipLayErr tipw245'}
			    }, 
			    groups:{
			    	gainTime:'inpCertGainTimeYear inpCertGainTimeMonth'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formCert').data("validator",certValid);
		},
		mod:function(i){
			this.isCanSave = true;
			cert.add();
			$('#hidModCertID').val(i);
			
			$('#txtCertName').val($('#certCN'+i).html());
			if($('#certGT'+i).attr('v')!=''){
				var certGainTime = new Date($('#certGT'+i).attr('v'));
				if(typeof(certGainTime) == 'object'){
					$('#inpCertGainTimeYear').val(certGainTime.getFullYear());
					$('#inpCertGainTimeMonth').val(certGainTime.getMonth()+1);	
				}
			}
			$('#txtCertLicenceIssue').val($('#certLI'+i).html());
			$('#txtCertNo').val($('#certCe'+i).html());
			$('#txtCertScore').val($('#certSc'+i).html());
		},
		add:function(isScroll){
			this.isCanSave = true;
			cert.clearInput();
			$('#divModCertAdd').hide();
			$("#modCert").show();
			if ($("#showCert li.infoview").length > 0) {
				$("#cancelBtnCert").show();
			}
			else{
				$('#certAddButton').hide();
				$('#certNotFillButton').show();
			}
			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("ceMod", 700,20);
			}
		},
		clearInput:function(){
			certValid.resetForm();
			$('#txtCertName,#inpCertGainTimeYear,#inpCertGainTimeMonth,#txtCertLicenceIssue,#txtCertNo,#txtCertScore').val('');
			$('#hidModCertID').val('');
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modCert").hide();
			$('#divModCertAdd').show();
			cert.clearInput();
			$('#certAddButton').show();
			$('#certNotFillButton').hide();
		},
		del:function(i){
			var d = {
					 'operate':'DeleteCertificate',
					 'resume_id':$('#hidResumeID').val(),
					 'certificate_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				cert.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}

			$('#liCert'+json.certificate_id).remove();
			if($('#hidModCertID').val() == json.certificate_id){
				cert.clearInput();
			}
			var c = $("#conCertificate").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(5, 1, "conCertificate");
			}
		},
		submit:function(a,isAllSave){
			//检查是否已经提交过
			var certName = $('#txtCertName').val();
			if(cert.isCertExisted(certName)){
				$.anchor('您已经添加过该证书！',{icon:'fail'});
				return;
			}
			
			//验证并提交
			  isSubmitAdd = a;
			  this.isAllSave = isAllSave;
			  var data = { resume_id: resume_id };
			  if(!certValid.form()){scroller("ceMod", 700,20);return false;}
			  $("#btnCertSave").submitForm({ beforeSubmit: $.proxy(certValid.form, certValid), data: data, success: cert.submitCallback, clearForm: false });
	          return false;
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			 cert.updateViewAndShow(json.certificate_id);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("ce", 700);
			 if(cert.isAllSave) saveAll('cert');
		},
		updateViewAndShow:function(i){
			if (typeof(i) != 'undefined' && i != null && i > 0) {
				 //更新分数
				 if($('#showCert').find('li').length==0){
					 right.changeScore(5, 0, "conCertificate");
				 }
				 //增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#cancelBtnCert').show();

				 //获取选中值，更新显示层
				 var certName = $('#txtCertName').val(); 
				 var gainTime = new Date($('#inpCertGainTimeYear').val()+'/'+($('#inpCertGainTimeMonth').val()<10?'0'+$('#inpCertGainTimeMonth').val():$('#inpCertGainTimeMonth').val())+'/01');
				 var gainTime1 = '';
				 var gainTime2 = '';
				 if(typeof(gainTime) == 'object'){
					 gainTime1 = gainTime.getFullYear()+'/'+((gainTime.getMonth()+1)<10?('0'+(gainTime.getMonth()+1))+'/01':(gainTime.getMonth()+1)+'/01');
					 gainTime2 = gainTime.getFullYear()+'-'+((gainTime.getMonth()+1)<10?('0'+(gainTime.getMonth()+1)):(gainTime.getMonth()+1));
				 }

				 var licenceIssue = $('#txtCertLicenceIssue').val();
				 var certNo = $('#txtCertNo').val();
				 var score = $('#txtCertScore').val();
				 
				 var gainTimeDisplay='',certNoDisplay='',scoreDisplay='';
				 if(gainTime2==''){
					 gainTimeDisplay = "style='display:none'";
				 }
				 if(certNo==''){
					 certNoDisplay= "style='display:none'";
				 }
				 if(score==''){
					 scoreDisplay= "style='display:none'";
				 }
				 if($('#liCert'+i).length>0){
					 $('#liCert'+i).remove();
				 }
				 
				 addToUl('ulShowCert',$.format(template,i,certName,gainTime2,score,certNo,licenceIssue,gainTime1,gainTimeDisplay,scoreDisplay,certNoDisplay),gainTime1);
				 
				 //$('#ulShowCert').prepend($.format(template,i,certName,gainTime2,score,certNo,licenceIssue,gainTime1,gainTimeDisplay,scoreDisplay,certNoDisplay));
				 cert.clearInput();

				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modCert").hide();
					 $('#divModCertAdd').show();
				 }
				$('#certAddButton').show();
				$('#certNotFillButton').hide();
			 }
		},
		addCert:function(i,certName,gainTime){
			if( $('#liCert'+i).length>0){
				$('#liCert'+i).remove();
			}
			$('#ulShowCert').prepend($.format(addCertTemplate,i,certName,'','','','',''));
			if($('#showCert').find('li').length==0){
				 right.changeScore(5, 0, "conCertificate");
			}
			bindMouseEvent();
			//bindAddWinEvent(false);
		},
		removeCert:function(i){
			$('#liCert'+i).remove();
			if($('#showCert').find('li').length==0){
				 right.changeScore(5, 1, "conCertificate");
			}
		},
		isCertExisted:function(name){
			var modCertId = $('#hidModCertID').val();
			var isExist = false;
			if(modCertId != undefined && modCertId!= '' && modCertId!=null)
			{
				$.each($('#ulShowCert').find('li').not('#liCert'+modCertId),function(i,n){
					if($(n).find('span[id^=certCN]').eq(0).html()==name){
						isExist = true;
						return false;
					}
				});
			}
			else{
				$.each($('#ulShowCert').find('li'),function(i,n){
					if($(n).find('span[id^=certCN]').eq(0).html()==name){
						isExist = true;
						return false;
					}
				});
			}
			return isExist;
		}
	}
})();

var languageValid;
var langAbli = (function(){
	var isSubmitAdd=false;
	var temp=0;
	var template='<li class="infoview" id="liLanguage{0}">'+
				 '	    <div>'+
				 ' 	 	<p class="tip modify">'+
				 '	     	<a href="javascript:void(0)" onclick="langAbli.mod({0});">修改</a>'+
				 '	     	<a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="语言能力" targetCall="langAbli.del({0});" class="del">删除</a>'+
				 '	 	</p>'+
				 '	 </div>'+
				 '	 <div class="tagTxt">'+
				 '	    <i class="fist"><b><span class="langLT" id="languageLT{0}" v="{1}">{2}</span></b></i>'+
				 '	    <i><span id="languageSL{0}" v="{3}">{4}</span></i>'+
				 '	    <i class="end"><span class="end">'+
				 '	   		{5}'+
				 '	    </span></i>'+
				 '	  </div>'+
				 '	 <div class="clear"></div>'+
				 '	</li>';
	var templateCert='<div class="formMod divLangCertMark" id="divLangCert{0}">'+
					 '       <div class="l">&nbsp;</div>'+
					 '       <div class="r">'+
					 '           <span id="langCert{0}" class="drop formText dipDrop zIndex" >'+
					 '                <input type="text" class="text inputLangCert" style="width:246px;" id="txtLangCert{0}" name="txtLangCert[]" />'+
					 '           </span>'+
					 '           <span class="formBtn"><a href="javascript:void(0)" onclick="langAbli.removeCert({0})" class="btn3 btnsF12">移除</a></span>'+
					 '       </div>'+
					 '       <div class="clear"></div>'+
					 '   </div>';
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			$('#langCert').certificate({cerName:'txtLangCert',category:'语言证书'});

			languageValid = $('#formLanguage').validate({
			    rules: {
					hidLanguageType: { required: true },
					hidLangSkillLevel:{ required: true }
			    },
			    messages: {
			    	hidLanguageType: { required: '请选择语言种类<span class="tipArr"></span>'},
			    	hidLangSkillLevel:{ required: '请选择熟练程度<span class="tipArr"></span>'}
			    },
			    errorClasses:{
			    	hidLanguageType: { required: 'tipLayErr tipw245'},
			    	hidLangSkillLevel:{required:'tipLayErr tipw245'}	
			    }, 
			    groups:{
			    	gainTime:'hidLangSkillLevel hidLanguageType'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formLanguage').data("validator",languageValid);
		},
		mod:function(i){
			this.isCanSave = true;
			langAbli.add();
			$('#hidModLanguageID').val(i);
			
			$('#selLanguageType').setDropListValue($('#languageLT'+i).attr('v'));
			$('#selLangSkillLevel').setDropListValue($('#languageSL'+i).attr('v'));
			
			var certs = $('.languageCe'+i);
			for(var i=0;i<certs.length;i++){
				var cert_name_temp = $(certs[i]).html();
				if(i==0){
					$('#txtLangCert').val(cert_name_temp);
				}else{
					langAbli.addCert();
					$('#txtLangCert'+(temp-1)).val(cert_name_temp);
				}
			}
		},
		add:function(isScroll){
			this.isCanSave = true;
			langAbli.clearInput();
			$('#divModLanguageAdd').hide();
			$("#modLanguage").show();
			if ($("#showLanguage li.infoview").length > 0) {
				$("#cancelBtnLanguage").show();
			}
			else{
				$('#langAbliAddButton').hide();
				$('#langAbliNotFillButton').show();
			}
			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("laMod", 700,20);
			}
		},
		clearInput:function(){
			languageValid.resetForm();
			$('#selLanguageType').initContent('');
			$('#selLangSkillLevel').initContent('');
			$('#txtLangCert').val('');
			$('.inputLangCert').not($('#txtLangCert')).closest('.formMod').remove();
			temp = 0;
			$('#hidModLanguageID').val('');
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modLanguage").hide();
			$('#divModLanguageAdd').show();
			langAbli.clearInput();
			$('#langAbliAddButton').show();
			$('#langAbliNotFillButton').hide();
		},
		addCert:function(v){
			if($('.divLangCertMark').length>=2){
				$('#bthAddLanguageCert').parent().hide();
			}
			$('.divLangCertMark').last().after($.format(templateCert,temp,v));
			$('#langCert'+temp).certificate({cerName:'txtLangCert'+temp});
			temp = temp+1;
			
			$.setIndex('zIndex');
		},
		removeCert:function(i){
			$('#divLangCert'+i).remove();
			if($('.divLangCertMark').length<3){
				$('#bthAddLanguageCert').parent().show();
			}
		},
		del:function(i){
			var d = {
					 'operate':'DeleteLanguage',
					 'resume_id':$('#hidResumeID').val(),
					 'language_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				langAbli.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}

			$('#liLanguage'+json.language_id).remove();
			if($('#hidModLanguageID').val() == json.language_id){
				langAbli.clearInput();
			}
			var c = $("#conLanguage").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(5, 1, "conLanguage");
			}
		},
		submit:function(a,isAllSave){
			//检查是否已经提交过该种语种
			var langId = $('#selLanguageType').getDropListValue();
			if(langAbli.isLangExisted(langId)){
				$.anchor('您已经添加过这项语言能力！',{icon:'fail'});
				return;
			}
			//检查是否添加了重复的证书
			if(langAbli.isLangCertRepeat()){
				$.anchor('您重复添加了某个语言证书！',{icon:'fail'});
				return;
			}
			
			//验证并提交
			  isSubmitAdd = a;
			  this.isAllSave = isAllSave;
			  var data = { resume_id: resume_id };
			  if(!languageValid.form()){scroller("laMod", 700,20);return false}
			  $("#btnLanguageSave").submitForm({ beforeSubmit: $.proxy(languageValid.form, languageValid), data: data, success: langAbli.submitCallback, clearForm: false });
			  return false;
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			 langAbli.updateViewAndShow(json.language_id,json.certs);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("la", 700);
			 if(langAbli.isAllSave) saveAll('langAbli');     
		},
		updateViewAndShow:function(i,certsTemp){
			if (typeof(i) != 'undefined' && i != null && i > 0) {
				 //更新分数
				 if($('#showLanguage').find('li').length==0){
					 right.changeScore(5, 0, "conLanguage");
				 }
				 //增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#cancelBtnLanguage').show();
				 //获取选中值，更新显示层
				 var langTypeId = $('#selLanguageType').getDropListValue();
				 var langTypeTxt = $('#selLanguageType').find('li[v='+langTypeId+']').html();
				 var langSkillLevelId = $('#selLangSkillLevel').getDropListValue();
				 var langSkillLevelTxt = $('#selLangSkillLevel').find('li[v='+langSkillLevelId+']').html();

				 var certs='';
				 var certTemplate='<span class="languageCe{0}">{1}</span>';
				 var certHtmls = $('.inputLangCert');
				 
				 if(certsTemp!=null){
					 for(var j =0;j<certsTemp.length;j++){
						 if(j!=(certsTemp.length-1)){
							 certs = certs + $.format(certTemplate,i,certsTemp[j].cert_name)+'，';
						 }
						 else{
							 certs = certs + $.format(certTemplate,i,certsTemp[j].cert_name);
						 }
//						 if(certsTemp[j].cert_name!=''){
//							 cert.addCert(certsTemp[j].cert_id,certsTemp[j].cert_name);
//						 }
					 }
				 }

				 if($('#liLanguage'+i).length>0){
					 $('#liLanguage'+i).remove();
				 }
				 $('#ulShowLanguage').prepend($.format(template,i,langTypeId,langTypeTxt,langSkillLevelId,langSkillLevelTxt,certs));
				 langAbli.clearInput();
	
				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modLanguage").hide();
					 $('#divModLanguageAdd').show();
				 }
				$('#langAbliAddButton').show();
				$('#langAbliNotFillButton').hide();
			 }
		},
		isLangExisted:function(id){
			var modLangId = $('#hidModLanguageID').val();
			if(modLangId != undefined && modLangId!= '' && modLangId!=null)
			{
				return $('#ulShowLanguage').find('li').not('#liLanguage'+modLangId).find('.langLT[v='+id+']').length>0;
			}
			else{
				return $('#ulShowLanguage').find('.langLT[v='+id+']').length>0;
			}
		},
		isLangCertRepeat:function(){
			var result = false;
			var certArr = new Array(3);
			$('.inputLangCert').each(function(i){
				var certValue = $(this).val();
				if($.inArray(certValue,certArr)>=0){
					result = true;
					return false;  //提前跳出循环
				}
				else{
					certArr.push(certValue);
				}
			});
			return result;
		}		
	};
})();



var achievement = (function(){
	var achievementValid;
	var isSubmitAdd=false;
	var achiUpload;
	var maxFileCount = 5;
	var queueLenth = 0;
	var errorCount = 0;
	var remCount = 0;
	
	var template='<li class="infoview" id="liAchievement{0}" >'+
				 '	    <div>'+
				 '	 	<p class="tip modify">'+
				 '	 		<a href="javascript:void(0)" onclick="achievement.mod({0});">修改</a>'+
				 '	 		<a href="javascript:void(0)" onclick="$(this).delConfirm();" targetName="作品" targetCall="achievement.del({0});" class="del">删除</a>'+
				 '	 	</p>'+
				 '	 </div>'+
				 '	 <div class="tagTxt">'+
				 '	    <div class="L"><b><span id="achiAN{0}">{1}</span></b></div>'+
				 '	    <span class="R">'+
				 '	    	{3}'+	
				 '	    </span>'+
				 '	    <span id="achiAD{0}" style="display:none">{2}</span>'+
				 '      {4} '+
				 '	  </div>'+
				 '	 <div class="clear"></div>'+
				 '	</li>';
	var attTemplate='<li id="attID{0}" attID="{0}" class="liAtt">'+
						'<i class="hbIconMoon workIco">&#xe00d;</i>'+
						'<p class="workInp">'+
						'	  <input name="attName{0}" class="workTxt attName" type="text" value="{1}" />'+
						'     <input name="attOrigName" type="hidden" value="{1}"  /> '+
						'</p>'+
						'<a href="javascript:void(0)" class="hbFntWes del btnDel">&#xf014;</a>'+
					'</li>';
	var attShowTemplate='';
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			achievementValid = $('#formAchievement').validate({
			    rules: {
					txtAchievementName: { required: true ,rangelength:[2,30]},
					taAchievementDescription:{maxlength: 200}
			    },
			    messages: {
			    	txtAchievementName: { required: '请填写作品名称<span class="tipArr"></span>',rangelength:'2-30个字<span class="tipArr"></span>'},
			    	taAchievementDescription:{ rangelength: '不超过200个字<span class="tipArr"></span>'}	
			    },
			    errorClasses:{
			    	txtAchievementName: { required: 'tipLayErr tipw245',rangelength:'tipLayErr tipw245'},
			    	taAchievementDescription:{rangelength:'tipLayErr tipw100'}	
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formAchievement').data("validator",achievementValid);

			$('#achiFile').uploadify({
				swf:'/swf/uploadify.swf',
				uploader : '/resume/SaveAttach/',
				formData: { 
					'upload_cookie_userid': upload_cookie_userid,
					'upload_cookie_nickname':upload_cookie_nickname,
					'upload_cookie_usertype':upload_cookie_usertype,
					'upload_cookie_userkey':upload_cookie_userkey
				},
				queueID:'showAchi',
				fileObjName:'AttachFile',
				fileTypeExts:'*.jpg;*.bmp;*.gif;*.jpeg;*.png;*.doc;*.docx;*.txt;*.ppt;*.pptx;*.xls;*.xlsx;*.pdf',
				itemTemplate:'<li id="${fileID}" attID="" class="liAtt">'+
					'<i class="hbIconMoon workIco">&#xe00d;</i>'+
					'<p class="workInp">'+
					'	<input name="attName[]" class="workTxt attName" type="text" value="${fileName}" />'+
					'   <input name="attOrigName" type="hidden" value="${fileName}"  /> '+
					'</p>'+
					'<a href="javascript:$(\'#${instanceID}\').uploadify(\'cancel\', \'${fileID}\')" class="hbFntWes del">&#xf014;</a>'+
					'</li>',
				auto:false,
				buttonImage:styleUrl+'/uploadify/submit.png',
				fileSizeLimit:'2MB',
				fileTypeDesc:'All Files',
				method:'post',
				cancelImage: styleUrl+'/uploadify/cancel.png',
				width:85,
				height:27,
				multi:true,
				onDialogClose:function(){
					achievement.bindAttEvent();
				},
				onSelect:function(file){
					queueLenth++;
					if(queueLenth<=maxFileCount){
						return true;
					}
					else{
						$('#achiFile').uploadify('cancel',file.id);
						return false;
					}
				},
				onCancel:function(){
					queueLenth--;
				},
				onQueueComplete:function(){
					if(errorCount==0){
						achievement.submitInfo();
					}
					else{
						$.anchorMsg('存在上传失败的文件，请删除后重新上传！',{icon:'fail'});
						errorCount =0;
						return;
					}
				},
				onUploadSuccess:function(file,data,response){
					var json = eval("("+data+")");
					if(json.error){
						if($('#errorFor'+file.id).length>0){
							$('#errorFor'+file.id).text(json.errorMsg);
							$('#errorFor'+file.id).show();
						}
						else{
							$('<span id="errorFor'+file.id+'" class="tipPos errorFile"><span class="tipLay"><span class="tipLayErr tipw245">'+json.errorMsg+'<span class="tipArr"></span></span></span></span>').appendTo($('#'+file.id));
						}
						errorCount = errorCount+1;
					}
					else{
						if($('#errorFor'+file.id).length>0){
							$('#errorFor'+file.id).hide();
						}
						var fileName = $('#'+file.id).find('.attName').val();
						$('<input type="hidden" name="addAtt[]" value="'+fileName+'|'+json.type+'|'+json.path+'" />').appendTo($('#spnAddAtts'));
					}
				},
				onSelectError:function(file,errorCode,errorMsg){
					var settings = this.settings;
					switch(errorCode) {
						case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
							$.anchorMsg("一次最多上传" + settings.queueSizeLimit + "张照片！", { icon: "warning" });
							break;
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							$.anchorMsg('抱歉 "' + file.name + '" 文件查过了大小限制 (' + settings.fileSizeLimit + ').',{icon:'warning'});
							break;
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							$.anchorMsg('文件 "' + file.name + '" 为空.',{icon:'warning'});
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							$.anchorMsg('文件 "' + file.name + '" 类型不支持 (' + settings.fileTypeDesc + ').',{icon:'warning'});
							break;
					}
				}
			});
			achievement.bindAttEvent();
		},
		bindAttEvent:function(){
			$('#showAchi').find('.attName').mouseover(function(){
				$(this).addClass('workTxtHov');
			}).mouseout(function(){
				$(this).removeClass('workTxtHov');
			});
			
			$('#showAchi').find('.attName').focusin(function(){
				$(this).addClass('workTxtFocus');
			}).focusout(function(){
				var parent = $(this).closest('li');
				var attID = $(parent).attr('attID');
				if(attID!='' && attID!=null){
					var origin = $(this).parent().find('input[name=attOrigName]').eq(0);
					var originName = $(origin).val();
					var nowName = $(this).val();
					if(nowName != originName){
						$(origin).val(nowName);
						var hddName = $(parent).find('.reName');
						if(hddName.length<=0){
						   hddName = $('<input type="hidden" name="reName[]" class="reName" />').appendTo($(parent));
						}
						hddName.val(attID+'|'+nowName);
					}
				}								
				$(this).removeClass('workTxtFocus');
			});
			
			$('#showAchi').find('.btnDel').click(function(){
				var parent = $(this).closest('li');
				var attID = $(parent).attr('attID');
				if(attID!='' && attID != null){
					queueLenth--;
					$('<input type="hidden" name="delAtt[]" value="'+attID+'" />').appendTo($('#spnDelAtts'));
				}				
				parent.remove();
			});
			
		},
		add:function(isScroll){
			//限定个数，新增时恢复原值
			maxFileCount = 5;
			queueLenth = 0;
			errorCount = 0;
			this.isCanSave = true;
			achievement.clearInput();
			$('#divModAchievementAdd').hide();
			$("#modAchievement").show();
			if ($("#showAchievement li.infoview").length > 0) {
				$("#cancelBtnAchievement").show();
			}
			else{
				$('#achievementAddButton').hide();
				$('#achievementNotFillButton').show();
			}
			
			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("acMod", 700,20);
			}
		},
		mod:function(i){
			//限定个数，新增时恢复原值
			maxFileCount = 5;
			queueLenth = 0;
			errorCount = 0;
			
			this.isCanSave = true;
			achievement.add();
			$('#hidModAchievementID').val(i);
			$('#txtAchievementName').val($('#achiAN'+i).html());
			$('#taAchievementDescription').val($('#achiAD'+i).html());
			
			$('.spnAchiAtt'+i).each(function(j){
				var attIDTemp = $(this).attr('v');
				var attNameTemp = $(this).text();
				$('#showAchi').append($.format(attTemplate,attIDTemp,attNameTemp));
				maxFileCount--;
			});
			achievement.bindAttEvent();
		},
		clearInput:function(){
			achievementValid.resetForm();
			$('#txtAchievementName,#taAchievementDescription').val('');
			$('#showAchi').children().remove();
			$('#hidModAchievementID').val('');
			$('#spnAddAtts').children().remove();
			$('#spnDelAtts').children().remove();
			$('.reName').remove();
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modAchievement").hide();
			$('#divModAchievementAdd').show();
			achievement.clearInput();
			$('#achievementAddButton').show();
			$('#achievementNotFillButton').hide();
		},
		del:function(i){
			var d = {
					 'operate':'DeleteAchievement',
					 'resume_id':$('#hidResumeID').val(),
					 'achievement_id':i
					};
			$.post($('#hidDelUrl').val(),d,function(json){
				achievement.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}

			$('#liAchievement'+json.achievement_id).remove();
			if($('#hidModAchievementID').val() == json.achievement_id){
				achievement.clearInput();
			}
			var c = $("#conAchievement").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(5, 1, "conAchievement");
			}
			
		},
		submit:function(a,isAllSave){
			  isSubmitAdd = a;
			  this.isAllSave = isAllSave;
			  
			  if($('#showAchi').html() ==''){
				  $.anchorMsg('请添加作品附件！',{icon:'fail'});
				  if(isAllSave){scroller("acMod", 700,20);}
				  return;
			  }			 
//			  if($('#showAchi').find('.errorFile:visable').length>0){
//				  $.anchorMsg('请删除不支持上传类型的作品附件！',{icon:'fail'});
//				  if(isAllSave){scroller("acMod", 700,20);}
//				  return;
//			  }
			  if(!achievementValid.form()){
				  scroller("acMod", 700,20);
				  return false;
			  }
			  
			  //判断上传队列有无文件，如果无，直接提交表单，否则通过上传成功事件来提交表单
			  var uploadifyObj = $('#achiFile').data('uploadify');
			  if (typeof uploadifyObj != 'undefined' && uploadifyObj.queueData.queueLength>0){
				  $('#achiFile').uploadify('upload','*');
			  }
			  else{
				  achievement.submitInfo();
			  } 
		},
		submitInfo:function(a,isAllSave){
			  //验证并提交
			  var data = { resume_id: resume_id };
			  $("#btnAchievementSave").submitForm({ beforeSubmit: $.proxy(achievementValid.form, achievementValid), data: data, success: achievement.submitCallback, clearForm: false });
	          return false;
		},
		submitCallback:function(json){

			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			achievement.updateViewAndShow(json.achievement_id,json.atts,json.stats);
			 bindMouseEvent();
			 //bindAddWinEvent(false);
			 scroller("ac", 700);
			 if(achievement.isAllSave) saveAll('achievement');
		},
		updateViewAndShow:function(i,atts,stats){
			if (typeof(i) != 'undefined' && i != null && i > 0) {
				 //更新分数
				 if($('#showAchievement').find('li').length==0){
					 right.changeScore(5, 0, "conAchievement");
				 }
				 //暂时取消这个逻辑  增加一个后，后面新增的，就可以取消了，显示取消按钮
				 //$('#cancelBtnAchievement').show();

				 //获取选中值，更新显示层
				 var achiName = $('#txtAchievementName').val();	
				 var achiDesc = $('#taAchievementDescription').val();
				 
				 var attsShow = '';
				 var attsHide='';
				 
				 if(typeof atts != undefined && atts!=null){
					 for(var m =0;m<atts.length;m++){
						 attsHide += $.format('<span class="spnAchiAtt{0}" style="display:none" v="{1}">{2}</span>',atts[m].achievement_id,atts[m].attachment_id,atts[m].attachment_name); 
					 }			
				 }
				 if(typeof stats !=undefined && atts !=null){
					 for(var j in stats){
						switch(j){
							case 'image':
								attsShow += $.format('<p class="fn12"><i class="hbIconMoon">&#xe00d;</i>{0}张</p>',eval('stats.'+j));
								break;
							case 'doc':
								attsShow += $.format('<p class="fn12"><i class="hbIconMoon">&#xe1b4;</i>{0}份</p>',eval('stats.'+j));
								break;
							case 'txt':
								attsShow += $.format('<p class="fn12"><i class="hbFntWes">&#xf0f6;</i>{0}份</p>',eval('stats.'+j));
								break;
							case 'pdf':
								attsShow += $.format('<p class="fn12"><i class="hbIconMoon">&#xe1b2;</i>{0}份</p>',eval('stats.'+j));
								break;
							case 'xls':
								attsShow += $.format('<p class="fn12"><i class="hbIconMoon">&#xe1b5;</i>{0}份</p>',eval('stats.'+j));
								break;
							case 'other':
								attsShow += $.format('<p class="fn12"><i class="hbIconMoon">&#xe0c5;</i>{0}份</p>',eval('stats.'+j));
								break;
						} 
						 
					 }
				 }

				 if($('#liAchievement'+i).length>0){
					 $('#liAchievement'+i).remove();
				 }
				 $('#ulShowAchievement').prepend($.format(template,i,achiName,achiDesc,attsShow,attsHide));
				 achievement.clearInput();

				 if(!isSubmitAdd){
					 this.isCanSave = false;
					 $("#modAchievement").hide();
					 $('#divModAchievementAdd').show();
				 }
				$('#achievementAddButton').show();
				$('#achievementNotFillButton').hide();
			 }
		}
	};
})();

var eduValid;
var trainValid;
var edu = (function(){
	var isSubmitAdd=false;
	var eduTemplate='<li class="infoview" id="liEdu{0}">'+
	                '     <div>'+
	                '         <p class="tip modify">'+
	                '             <a href="javascript:void(0)" class="del" onclick="edu.mod({0},\'edu\');">修改</a>'+
	                '             <a href="javascript:void(0)" class="del" onclick="$(this).delConfirm();" targetName="教育经历" targetCall="edu.del({0},\'edu\');">删除</a>'+
	                '         </p>'+
	                '     </div>'+
	                '     <div class="L"><p><span class="sTime" id="eduST{0}" v="{1}">{2}</span> 至 <span class="eTime" id="eduSE{0}" v="{3}">{4}</span></p></div>'+
	                '     <div class="R">'+
	                '        <div class="tagTxt">'+
	                '           <i class="fist"><b><span id="eduDe{0}" v="{7}">{8}</span></b></i>'+
	                '           <i><span id="eduSh{0}">{5}</span></i>'+
	                '           <i><span id="eduMJ{0}">{6}</span></i>'+
	                '        </div>'+
	                '        <p class="depTxt" id="eduED{0}">{9}</p>'+
	                '        <span id="eduDu{0}" style="display:none">{10}</span>'+
	                '     </div>'+
	                '     <div class="clear"></div>'+
	                '  </li>';
	var trainTemplate='<li  class="infoview" id="liTrain{0}">'+
                      '           <div>'+
	                  '               <p class="tip modify">'+
		              '                   <a href="javascript:void(0)" class="del" onclick="edu.mod({0},\'train\');">修改</a>'+
		              '                   <a href="javascript:void(0)" class="del" onclick="$(this).delConfirm();" targetName="培训经历" targetCall="edu.del({0},\'train\');">删除</a>'+
	                  '               </p>'+
                      '           </div>'+
                      '           <div class="L"><p><span class="sTime" id="trainST{0}" v="{1}">{2}</span> 至 <span class="eTime" id="trainSE{0}" v="{3}">{4}</span></p></div>'+
                      '           <div class="R">'+
                      '              <div class="tagTxt">'+
                      '                 <i class="fist"><b><span id="trainCo{0}">{6}</span></b></i>'+
                      '                 <i><span id="trainIn{0}">{5}</span></i>'+
                      '                 <i class="end"><span id="trainCe{0}">{7}</span></i>'+
                      '              </div>'+
  	                  '        		 <p class="depTxt" id="trainTD{0}">{8}</p>'+
                      '           </div>'+
                      '           <div class="clear"></div>'+
                      '        </li>';

	
	return {
		isCanSave:false,
		isAllSave:false,
		init:function(){
			$('#trainCert').certificate({cerName:'txtTrainCertificate'});
			
			huibo.date.bind({
				id: "EduTime",
				dateEntry: [0, 1,3,4],
				size: 20,
				min: -55,
				max: 0,
				onSelect:function(){
					var intEduTimeS = 0;
					var intEduSYear = parseInt($('#inpEduTimeStartYear').val());
					var intEduSMonth = parseInt($('#inpEduTimeStartMonth').val());
					if(!isNaN(intEduSYear)){
						intEduTimeS += intEduSYear*10000;
					}
					if(!isNaN(intEduSMonth)){
						intEduTimeS += intEduSMonth*100;
					}
					$('#hidEduTimeStart').val(intEduTimeS);
					
					var intEduTimeE = 0;
					var intEduEYear = parseInt($('#inpEduTimeEndYear').val());
					var intEduEMonth = parseInt($('#inpEduTimeEndMonth').val());
					if(!isNaN(intEduEYear)){
						intEduTimeE += intEduEYear*10000;
					}
					if(!isNaN(intEduEMonth)){
						intEduTimeE += intEduEMonth*100;
					}
					$('#hidEduTimeEnd').val(intEduTimeE);
	
					eduValid.element($('#inpEduTimeStartYear'));
					eduValid.element($('#inpEduTimeStartMonth'));
					eduValid.element($('#hidEduTimeEnd'));
				}
			});

			
			huibo.date.bind({
				id: "TrainTime",
				dateEntry: [0, 1,3,4],
				size: 20,
				min: -55,
				max: 0,
				onSelect:function(){
					var intTrainTimeS = 0;
					var intTrainSYear = parseInt($('#inpTrainTimeStartYear').val());
					var intTrainSMonth = parseInt($('#inpTrainTimeStartMonth').val());
					if(!isNaN(intTrainSYear)){
						intTrainTimeS += intTrainSYear*10000;
					}
					if(!isNaN(intTrainSMonth)){
						intTrainTimeS += intTrainSMonth*100;
					}
					$('#hidTrainTimeStart').val(intTrainTimeS);
					
					var intTrainTimeE = 0;
					var intTrainEYear = parseInt($('#inpTrainTimeEndYear').val());
					var intTrainEMonth = parseInt($('#inpTrainTimeEndMonth').val());
					if(!isNaN(intTrainEYear)){
						intTrainTimeE += intTrainEYear*10000;
					}
					if(!isNaN(intTrainEMonth)){
						intTrainTimeE += intTrainEMonth*100;
					}
					$('#hidTrainTimeEnd').val(intTrainTimeE);
					
					trainValid.element($('#inpTrainTimeStartYear'));
					trainValid.element($('#inpTrainTimeStartMonth'));
					trainValid.element($('#hidTrainTimeEnd'));
				}
			});

			
			eduValid = $('#formEdu').validate({
			    rules: {
					txtEduSchool: { required: true, rangelength: [4,30] },
					txtEduMajorDesc: { required: true,rangelength:[2,20] },
					hidEduDegree: { required: true },
					inpEduTimeStartYear:{required: true, number: true, range: [1800, 3000]},
					inpEduTimeStartMonth:{required: true, number: true, range: [1, 12]},
					inpEduTimeEndYear:{ number: true, range: [1800, 3000]},
					inpEduTimeEndMonth:{ number: true, range: [1, 12]},
					txtEduDuty:{maxlength:30},
					taEduDetail:{rangelength:[1,256]},
					hidEduTimeEnd:{LaterThan:['hidEduTimeStart',2,'chkEduIsInSchool']}
			    },
			    messages: {
			    	txtEduSchool: { required: '请填写学校名称<span class="tipArr"></span>', rangelength: '4-30个字<span class="tipArr"></span>' },
					txtEduMajorDesc: { required: '请填写专业名称<span class="tipArr"></span>',rangelength:'2-20个字<span class="tipArr"></span>' },
					hidEduDegree: { required: '请选择获得学历<span class="tipArr"></span>' },					
					inpEduTimeStartYear:{required: '请填写在职时间年份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
					inpEduTimeStartMonth:{required: '请填写在职时间月份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
					inpEduTimeEndYear:{ number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
					inpEduTimeEndMonth:{ number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
					txtEduDuty:{maxlength:'不超过30字<span class="tipArr"></span>'},
					taEduDetail:{rangelength:'不超过256字<span class="tipArr"></span>'}
			    },
			    errorClasses:{
				    txtEduSchool: { required: 'tipLayErr tipw120', rangelength: 'tipLayErr tipw120' },
					txtEduMajorDesc: { required: 'tipLayErr tipw120',rangelength:'tipLayErr tipw120' },
					hidEduDegree: { required: 'tipLayErr tipw120' },
					inpEduTimeStartYear:{required: 'tipLayErr tipw120', number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
					inpEduTimeStartMonth:{required: 'tipLayErr tipw120', number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
					inpEduTimeEndYear:{ number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
					inpEduTimeEndMonth:{ number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
					txtEduDuty:{rangelength:'tipLayErr tipw120'},
					taEduDetail:{maxlength:'tipLayErr tipw120'},
					hidEduTimeEnd:{LaterThan:'tipLayErr tipw150'}
			    },
			    groups:{
			    	EduTime:'inpEduTimeStartYear inpEduTimeStartMonth inpEduTimeEndYear inpEduTimeEndMonth hidEduTimeEnd'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formEdu').data("eduValidator",eduValid);
			
			trainValid = $('#formTrain').validate({
			    rules: {
					txtTrainInstitution: { required: true, rangelength: [4,30] },
					txtTrainCourse: { required: true,rangelength:[2,20] },
					inpTrainTimeStartYear:{required: true, number: true, range: [1800, 3000]},
					inpTrainTimeStartMonth:{required: true, number: true, range: [1, 12]},
					inpTrainTimeEndYear:{ number: true, range: [1800, 3000]},
					inpTrainTimeEndMonth:{ number: true, range: [1, 12]},
					taTrainDetail:{rangelength:[1,1000]},
					txtTrainCertificate:{rangelength:[2,20]},
					hidTrainTimeEnd:{LaterThan:['hidTrainTimeStart',2,'chkTrainIsInSchool']}
			    },
			    messages: {
			    	txtTrainInstitution: { required: '请填写机构名称<span class="tipArr"></span>', rangelength: '4-30个字<span class="tipArr"></span>' },
			    	txtTrainCourse: { required: '请填写培训项目<span class="tipArr"></span>',rangelength:'2-20个字<span class="tipArr"></span>' },			
			    	inpTrainTimeStartYear:{required: '请填写就读时间年份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
			    	inpTrainTimeStartMonth:{required: '请填写就读时间月份<span class="tipArr"></span>', number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	inpTrainTimeEndYear:{ number: '请填写数字<span class="tipArr"></span>', range: '年份区间为1800-3000<span class="tipArr"></span>'},
			    	inpTrainTimeEndMonth:{ number: '请填写数字<span class="tipArr"></span>', range: '月份区间为1-12<span class="tipArr"></span>'},
			    	txtTrainCertificate:{rangelength:'2-20个字<span class="tipArr"></span>'},
			    	taTrainDetail:{rangelength:'不超过1000字<span class="tipArr"></span>'}
			    },
			    errorClasses:{
			    	txtTrainInstitution: { required: 'tipLayErr tipw120', rangelength: 'tipLayErr tipw120' },
			    	txtTrainCourse: { required: 'tipLayErr tipw120',rangelength: 'tipLayErr tipw120' },
			    	inpTrainTimeStartYear:{required: 'tipLayErr tipw120', number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
			    	inpTrainTimeStartMonth:{required: 'tipLayErr tipw120', number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
			    	inpTrainTimeEndYear:{ number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
			    	inpTrainTimeEndMonth:{ number: 'tipLayErr tipw120', range: 'tipLayErr tipw120'},
			    	taTrainDetail:{rangelength:'tipLayErr tipw120'},
			    	txtTrainCertificate:{rangelength:'tipLayErr tipw120'},
			    	hidTrainTimeEnd:{LaterThan:'tipLayErr tipw180'}
			    },
			    groups:{
			    	TrainTime:'inpTrainTimeStartYear inpTrainTimeStartMonth inpTrainTimeEndYear inpTrainTimeEndMonth hidTrainTimeEnd'
			    },
			    focusCleanup:true,
			    focusInvalid:false,
				errorElement:'span',
				errorPlacement: function(error, element)
				{
					element.parent().nextAll().find('.tipLay').append(error);
				},
				success: function(label)
				{
					label.text(" ");
				}
			});
			$('#formTrain').data("trainValidator",trainValid);
		},
		switchView:function(i){
			if(i==1){
				$('#subConEdu').show();
				$('#subConTrain').hide();
				//$('#hidEduTypeID').val('edu');
			}
			else{
				$('#subConTrain').show();
				$('#subConEdu').hide();
				//$('#hidEduTypeID').val('train');
			}
			scroller("edMod", 700,20);
		},
		add:function(isScroll){
			this.isCanSave = true;
			
			$('#conSwitchView').show();
			$('#radTrain').removeAttr('checked');
			$('#radEdu').attr('checked','checked');
			
			edu.clearInput();
			$('#divModEduAdd').hide();
			$("#modEdu").show();
			if ($("#showEdu li.infoview").length > 0) {
				$("#cancelBtnEdu").show();
				$('#cancelBtnTrain').show();	
			}
			else{
				$('#eduAddButton').hide();
				$('#eduNotFillButton').show();
			}

			if(!(typeof isScroll == 'boolean' && isScroll == false)){
				scroller("edMod", 700,20);
			}
		},
		mod:function(i,type){
			this.isCanSave = true;
			edu.add();
			$('input[name=hidModEdOTrID]').val(i);
			$('#divModEduAdd').hide();
			
			$('#eduAddButton').show();
			$('#eduNotFillButton').hide()
			
			if(type=='edu'){
				$('#subConEdu').show();
				$('#subConTrain').hide();
				//$('#hidEduTypeID').val('edu');
				
				$('#txtEduSchool').val($('#eduSh'+i).html());
				$('#txtEduMajorDesc').val($('#eduMJ'+i).html());
				var eduStTime =new Date($('#eduST'+i).attr('v'));
				$('#inpEduTimeStartYear').val(eduStTime.getFullYear());
				$('#inpEduTimeStartMonth').val(eduStTime.getMonth()+1);
				$('#hidEduTimeStart').val(eduStTime.getFullYear()*10000+(eduStTime.getMonth()+1)*100);
				
				if($('#eduSE'+i).attr('v') != ''){
					var eduEnTime = new Date($('#eduSE'+i).attr('v'));
					if(typeof(eduEnTime) == 'object'){
						$('#inpEduTimeEndYear').val(eduEnTime.getFullYear());
						$('#inpEduTimeEndMonth').val(eduEnTime.getMonth()+1);	
						$('#hidEduTimeEnd').val(eduEnTime.getFullYear()*10000+(eduEnTime.getMonth()+1)*100);
					}
					else{
						$('#chkEduIsInSchool').attr('checked','checked');
						$('#inpEduTimeEndYear,#inpEduTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
						$('#hidEduTimeEnd').val('');
					}
				}
				else{
					$('#chkEduIsInSchool').attr('checked','checked');
					$('#inpEduTimeEndYear,#inpEduTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
					$('#hidEduTimeEnd').val('');
				}

				$('#txtEduDuty').val($('#eduDu'+i).html());
				$('#taEduDetail').val($('#eduED'+i).html());
				$('#selEduDegree').setDropListValue($('#eduDe'+i).attr('v'));			
			}
			else{
				$('#subConTrain').show();
				$('#subConEdu').hide();
				//$('#hidEduTypeID').val('train');

				$('#txtTrainInstitution').val($('#trainIn'+i).html());
				$('#txtTrainCourse').val($('#trainCo'+i).html());
				var trainStTime =new Date($('#trainST'+i).attr('v'));
				$('#inpTrainTimeStartYear').val(trainStTime.getFullYear());
				$('#inpTrainTimeStartMonth').val(trainStTime.getMonth()+1);
				$('#hidTrainTimeStart').val(trainStTime.getFullYear()*10000+(trainStTime.getMonth()+1)*100);
				
				if($('#trainSE'+i).attr('v') != ''){
					var trainEnTime = new Date($('#trainSE'+i).attr('v'));
					if(typeof(trainEnTime) == 'object'){
						$('#inpTrainTimeEndYear').val(trainEnTime.getFullYear());
						$('#inpTrainTimeEndMonth').val(trainEnTime.getMonth()+1);	
						$('#hidTrainTimeEnd').val(trainEnTime.getFullYear()*10000+(trainEnTime.getMonth()+1)*100);
					}
					else{
						$('#chkTrainIsInSchool').attr('checked','checked');
						$('#inpTrainTimeEndYear,#inpTrainTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
						$('#hidTrainTimeEnd').val('');
					}
				}
				else{
					$('#chkTrainIsInSchool').attr('checked','checked');
					$('#inpTrainTimeEndYear,#inpTrainTimeEndMonth').val('').attr('disabled','disabled').addClass('textGray').addClass('textDis');
					$('#hidTrainTimeEnd').val('');
				}

				$('#txtTrainCertificate').val($('#trainCe'+i).html());
				$('#taTrainDetail').val($('#trainTD'+i).html());
			}
			//$('#taTrainDetail,#txtEduDuty,#taEduDetail').watermark2();
			$('#taTrainDetail,#txtEduDuty,#taEduDetail').trigger('blur');
			$('#conSwitchView').hide();
		},
		clearInput:function(){
			eduValid.resetForm();
			trainValid.resetForm();			
			$('#subConEdu').show();
			$('#subConTrain').hide();
			$('#txtEduSchool,#txtEduMajorDesc,#inpEduTimeStartYear,#inpEduTimeStartMonth,#inpEduTimeEndYear,#inpEduTimeEndMonth,#txtEduDuty,#taEduDetail').val('');
			$('#selEduDegree').initContent();
			$('#inpEduTimeEndYear,#inpEduTimeEndMonth').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			$('#chkEduIsInSchool').removeAttr('checked');
			
			$('#txtTrainInstitution,#txtTrainCourse,#inpTrainTimeStartYear,#inpTrainTimeStartMonth,#inpTrainTimeEndYear,#inpTrainTimeEndMonth,#txtTrainCertificate,#taTrainDetail').val('');
			$('#inpTrainTimeEndYear,#inpTrainTimeEndMonth').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			$('#chkTrainIsInSchool').removeAttr('checked');
			
			$('#hidEduTimeStart,#hidEduTimeEnd').val('');
			$('#hidTrainTimeStart,#hidTrainTimeEnd').val('');
			
			$('input[name=hidModEdOTrID]').val('');
		},
		subCancel:function(){
			this.isCanSave = false;
			$("#modEdu").hide();
			$('#divModEduAdd').show();
			edu.clearInput();
			
			$('#eduAddButton').show();
			$('#eduNotFillButton').hide()
		},
		del:function(i,type){
			var d = {};
			if(type=='edu'){
				d = {
						 'operate':'DeleteEdu',
						 'resume_id':$('#hidResumeID').val(),
						 'edu_id':i
						};
			}
			else if(type='train'){
				d = {
						 'operate':'DeleteTrain',
						 'resume_id':$('#hidResumeID').val(),
						 'train_id':i
						};
			}
			$.post($('#hidDelUrl').val(),d,function(json){
				edu.delCallback(json);
			},'json');
		},
		delCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			if(json.type_id=='edu'){
				$('#liEdu'+json.edu_id).remove();
				if($('input[name=hidModEdOTrID]').eq(0).val() == json.edu_id){
					edu.clearInput();
				}
			}
			else if(json.type_id=='train'){
				$('#liTrain'+json.train_id).remove();
				if($('input[name=hidModEdOTrID]').eq(0).val() == json.train_id){
					edu.clearInput();
				}
				edu.refreshTrain();
			}

			var c = $("#conEduAndTrain").find(".infoview");
			if (c == 'undefined' || c.length == 0) {
				right.changeScore(15, 1, "conEduAndTrain");
			}
		},
		submit:function(a,isAllSave){
			if($('#subConEdu').is(':visible')){
				//验证并提交
				  isSubmitAdd = a;
				  this.isAllSave = isAllSave;
				  var data = { resume_id: resume_id };
				  if(!eduValid.form()){scroller("edMod", 700,20);return false;}
				  $("#btnEduSave").submitForm({ beforeSubmit: $.proxy(eduValid.form, eduValid), data: data, success: edu.submitCallback, clearForm: false });
		          return false;
			}else if($('#subConTrain').is(':visible')){
				//验证并提交
				  isSubmitAdd = a;
				  this.isAllSave = isAllSave;
				  var data = { resume_id: resume_id };
				  if(!trainValid.form()){scroller("edMod", 700,20);return false;}
				  $("#btnTrainSave").submitForm({ beforeSubmit: $.proxy(trainValid.form, trainValid), data: data, success: edu.submitCallback, clearForm: false });
		          return false;
			}
		},
		submitCallback:function(json){
			if(json.error){
				$.message(json.error,{icon:'fail',timeout:5000});
				return;
			}
			if(json.type_id=='edu'){
				 edu.updateViewAndShow(json.edu_id,json.type_id,json.cert);
				 bindMouseEvent();
				 //bindAddWinEvent(false);
				 scroller("ed", 700);	 
			}
			else if(json.type_id='train'){
				 edu.updateViewAndShow(json.train_id,json.type_id,json.cert);
				 edu.refreshTrain();
				 bindMouseEvent();
				 //bindAddWinEvent(false);
				 scroller("ed", 700);
			}
			if(edu.isAllSave) saveAll('edu');
		},
		updateViewAndShow:function(i,type,certTemp){
			if (typeof(i) != 'undefined' && i != null && i > 0) {
				if(type=='edu'){
					 //更新分数
					 if($('#ulShowEdu').find('li').length==0 && $('#ulShowTrain').find('li').length==0){
						 right.changeScore(15, 0, "conEduAndTrain");
					 }
					 //增加一个后，后面新增的，就可以取消了，显示取消按钮
					 //$('#cancelBtnEdu').show();

					 
					//获取选中值，更新显示层 
					 var eduStTime = new Date($('#inpEduTimeStartYear').val()+'/'+($('#inpEduTimeStartMonth').val()<10?'0'+$('#inpEduTimeStartMonth').val():$('#inpEduTimeStartMonth').val())+'/01');
					 var eduStTime1 = '';
					 var eduStTime2 = '';
					 if(typeof(eduStTime) == 'object'){
						 eduStTime1 = eduStTime.getFullYear()+'/'+( (eduStTime.getMonth()+1)<10? ('0'+(eduStTime.getMonth()+1)):(eduStTime.getMonth()+1)) +'/01';
						 eduStTime2 = eduStTime.getFullYear()+'.'+( (eduStTime.getMonth()+1)<10? ('0'+(eduStTime.getMonth()+1)):(eduStTime.getMonth()+1)) ;
					 }
					 
					 var eduEnTime1 = '';
					 var eduEnTime2 = '';
					 if($('#inpEduTimeEndYear').val()!='' && $('#inpEduTimeEndMonth').val()!=''){
						 var eduEnTime = new Date($('#inpEduTimeEndYear').val()+'/'+($('#inpEduTimeEndMonth').val()<10?'0'+$('#inpEduTimeEndMonth').val():$('#inpEduTimeEndMonth').val())+'/01');
						 if(typeof(eduEnTime) == 'object'){
							 eduEnTime1 = eduEnTime.getFullYear()+'/'+((eduEnTime.getMonth()+1)<10?('0'+(eduEnTime.getMonth()+1)):(eduEnTime.getMonth()+1)) + '/01';
							 eduEnTime2 = eduEnTime.getFullYear()+'.'+((eduEnTime.getMonth()+1)<10?('0'+(eduEnTime.getMonth()+1)):(eduEnTime.getMonth()+1));
						 }
						 else{
							 eduEnTime2 = '至今';
						 }			 
					 }
					 else{
						 eduEnTime2 = '至今';
					 }
					 
					 var schoolName = $('#txtEduSchool').val();
					 var majorDesc = $('#txtEduMajorDesc').val();
					 var eduDegreeId = $('#selEduDegree').getDropListValue();
					 var eduDegreeTxt = $('#selEduDegree').find('li[v='+eduDegreeId+']').html();
					 var eduDetail = $('#taEduDetail').val();
					 var eduDuty = $('#txtEduDuty').val();
					 
					 if($('#liEdu'+i).length>0){
						 $('#liEdu'+i).remove();
					 }
					 
					 addToUl('ulShowEdu',$.format(eduTemplate,i,eduStTime1,eduStTime2,eduEnTime1,eduEnTime2,schoolName,majorDesc,eduDegreeId,eduDegreeTxt,eduDetail,eduDuty),eduStTime1,eduEnTime1);
					 edu.clearInput();
					 if(!isSubmitAdd){
						 this.isCanSave = false;
						 $('#divModEduAdd').show();
						 $("#modEdu").hide();
					 }
				}else if(type=='train'){
					//更新分数
					 if($('#ulShowEdu').find('li').length==0 && $('#ulShowTrain').find('li').length==0){
						 right.changeScore(15, 0, "conEduAndTrain");
					 }
					 //增加一个后，后面新增的，就可以取消了，显示取消按钮
					 //$('#cancelBtnTrain').show();

					//获取选中值，更新显示层 
					 var trainStTime = new Date($('#inpTrainTimeStartYear').val()+'/'+($('#inpTrainTimeStartMonth').val()<10?'0'+$('#inpTrainTimeStartMonth').val():$('#inpTrainTimeStartMonth').val())+'/01');
					 var trainStTime1 = '';
					 var trainStTime2 = '';
					 if(typeof(trainStTime) == 'object'){
						 trainStTime1 = trainStTime.getFullYear()+'/'+( (trainStTime.getMonth()+1)<10? ('0'+(trainStTime.getMonth()+1)):(trainStTime.getMonth()+1)) +'/01';
						 trainStTime2 = trainStTime.getFullYear()+'.'+( (trainStTime.getMonth()+1)<10? ('0'+(trainStTime.getMonth()+1)):(trainStTime.getMonth()+1)) ;
					 }
					 
					 var trainEnTime1 = '';
					 var trainEnTime2 = '';
					 if($('#inpTrainTimeEndYear').val()!='' && $('#inpTrainTimeEndMonth').val()!=''){
						 var trainEnTime = new Date($('#inpTrainTimeEndYear').val()+'/'+($('#inpTrainTimeEndMonth').val()<10?'0'+$('#inpTrainTimeEndMonth').val():$('#inpTrainTimeEndMonth').val())+'/01');
						 if(typeof(trainEnTime) == 'object'){
							 trainEnTime1 = trainEnTime.getFullYear()+'/'+((trainEnTime.getMonth()+1)<10?('0'+(trainEnTime.getMonth()+1)):(trainEnTime.getMonth()+1)) + '/01';
							 trainEnTime2 = trainEnTime.getFullYear()+'.'+((trainEnTime.getMonth()+1)<10?('0'+(trainEnTime.getMonth()+1)):(trainEnTime.getMonth()+1));
						 }
						 else{
							 trainEnTime2 = '至今';
						 }			 
					 }
					 else{
						 trainEnTime2 = '至今';
					 }
					 var instit =   $('#txtTrainInstitution').val();
					 var course = $('#txtTrainCourse').val();
					 var trainDetail =  $('#taTrainDetail').val();
					 var trainCert =  $('#txtTrainCertificate').val();
//					 //添加证书
//					 if(certTemp!=null){
//						 cert.addCert(certTemp.cert_id,certTemp.cert_name);
//					 }

					 if($('#liTrain'+i).length>0){
						 $('#liTrain'+i).remove();
					 }
					 addToUl('ulShowTrain',$.format(trainTemplate,i,trainStTime1,trainStTime2,trainEnTime1,trainEnTime2,instit,course,trainCert,trainDetail),trainStTime1,trainEnTime1);
					 //$('#ulShowTrain').prepend();
					 edu.clearInput();
	
					 if(!isSubmitAdd){
						 this.isCanSave = false;
						 $("#modEdu").hide();
						 $('#divModEduAdd').show();
					 }
				}
				$('#eduAddButton').show();
				$('#eduNotFillButton').hide()
			 }
		},
		refreshTrain:function(){
			if($('#ulShowTrain').find('li').length>0){
				$('#divShowTrain').show();
			}
			else{
				$('#divShowTrain').hide();
			}
		},
		selectEduIsInSchool:function(){
			if($('#chkEduIsInSchool').is(':checked')){
				$('#inpEduTimeEndYear,#inpEduTimeEndMonth').val('').addClass('textGray').addClass('textDis').attr('disabled','disabled');
				$('#hidEduTimeEnd').val('');
			}       
			else{
				$('#inpEduTimeEndYear,#inpEduTimeEndMonth').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			}
			eduValid.element($('#hidEduTimeEnd'));
		},
		selectTrainIsInSchool:function(){
			if($('#chkTrainIsInSchool').is(':checked')){
				$('#inpTrainTimeEndYear,#inpTrainTimeEndMonth').val('').addClass('textGray').addClass('textDis').attr('disabled','disabled');
				$('#hidTrainTimeEnd').val('');
			}
			else{
				$('#inpTrainTimeEndYear,#inpTrainTimeEndMonth').removeAttr('disabled').removeClass('textGray').removeClass('textDis');
			}
			trainValid.element($('#hidTrainTimeEnd'));
		}
	}
})();


var right = {
	init:function(){
		//初始化状态 
		var scoreArr={"conBasic":20,"conContract":5,"conExpect":5,"conWork":15,"conEduAndTrain":15,"conLanguage":5,"conSkill":5,"conHighlight":5,"conProject":5,"conCertificate":5,"conAchievement":5,"conPractice":5,"conAppend":5};
		var tips =  $("#ulFixed>li");
		var d = $("#score").html().replace("%", "");
		
		for(var i=0;i<tips.length;i++){
			var conName = $(tips[i]).find('a').attr('m');
			if(conName == 'conExpect'){
				if(expect.checkFill()){
					d = parseInt(d) + parseInt(eval('scoreArr.'+conName));
					d = d >= 100 ? 100 : d;
					$(tips[i]).find(".completed").show();
					$(tips[i]).find('.notCompleted').hide();
				}
			}
			else if($('#'+conName).find('.show').find('li:visible').length>0){
				d = parseInt(d) + parseInt(eval('scoreArr.'+conName));
				d = d >= 100 ? 100 : d;
				$(tips[i]).find(".completed").show();
				$(tips[i]).find('.notCompleted').hide();
			}
		}
//		if(d>=60 && right.checkRequired()){
//			$('#qualified').show();
//		}
//		else{
//			$('#qualified').hide();
//		}
		$("#scoreBar").css("width", d + "%");
		$("#score").html(d + "%");

		$("#ulFixed>li a").click(function() {
			scroller($(this).attr("k"), 700);
		});
		//this.refreshView();
	},
	refreshView:function(){
		$("#ulFixed>li input").each(function(a, b) {
			
			if ($(this).attr("checked") == 'checked') {
				var b = $(this).attr("m");
				
				
				if (typeof(b) != 'undefined') {
					$("#" + b).show();
					$("#" + b + " .form").hide();
				}
			} else {
				var b = $(this).attr("m");
				if (typeof(b) != 'undefined') {
					$("#" + b).hide();
					$("#" + b + " .form").show();
				}
			}
		})
	},
	changeScore:function(a,b,c){
		var d = $("#score").html().replace("%", "");
		if (b == 0) {
			d = parseInt(d) + a;
			d = d >= 100 ? 100 : d;
			$("[m=" + c + "]").parent().find(".completed").show();
			$("[m=" + c + "]").parent().find(".notCompleted").hide();
		} else {
			d = parseInt(d) - a;
			d = d < 0 ? 0 : d;
			$("[m=" + c + "]").parent().find(".completed").hide();
			$("[m=" + c + "]").parent().find(".notCompleted").show();
		}
//		var requiredResult = true;
//		if(b==0){
//			requiredResult = right.checkRequired(c);
//		}
//		else{
//			requiredResult = right.checkRequired();
//		}
//		if(d>=60 && requiredResult){
//			$('#qualified').show();
//		}
//		else{
//			$('#qualified').hide();
//		}
		$("#scoreBar").css("width", d + "%");
		$("#score").html(d + "%");
	},
	checkRequired:function(item){
		var requiredArr = ['conBasic','conContract','conExpect','conWork','conEduAndTrain'];
		var requiredResult = true;
		var tips =  $("#ulFixed>li");
		for(var i=0;i<tips.length;i++){
			var conName = $(tips[i]).find('a').attr('m');
			if(typeof item != undefined && item != conName){
				if(conName == 'conExpect'){
					if(!expect.checkFill()){
						requiredResult = false;	
					}
				}else if($('#'+conName).find('.show').find('li:visible').length<=0){
					if($.inArray(conName,requiredArr)>=0){
						requiredResult = false;
					}
				}
			}
		}
		return requiredResult;
	}
}

$(document).ready(function(){
	resumeName.init();
	basic.init();
	right.init();
	contact.init();
	expect.init();
	work.init();
	edu.init();
	highlight.init();

	cert.init();
	langAbli.init();
	achievement.init();
	skill.init();
	append.init();
	project.init();
	practice.init();
	
	
//	cert.init();
//	langAbli.init();
//	achievement.init();
//	
//	//联系方式
//	contact.init();
//	//求职意向
//	expect.init();
//	//技能
//	skill.init();
//	//附加信息
//	append.init();
//	//项目经验
//	project.init();
//	//实践经验
//	practice.init();
	
	
	
	//绑定鼠标事件
	bindMouseEvent();
	//绑定添加按钮事件
	//bindAddWinEvent(true);
	//绑定添加，暂不写按钮
	bindShowOrHideEvt();
	//更新右边栏状态
	basic.refreshFixedBox();
	
//	Fixed_Box("#fixedBox",64);
//	//浏览器的宽度发送改变时重新设置其样式
//    $(window).resize(function()
//    {
//    	Fixed_Box("#fixedBox",64);
//    });
    
    $.setIndex('zIndex');
});


function checkAllSaveStatus(){
	return resumeName.isCanSave && basic.isCanSave && contact.isCanSave && expect.isCanSave && skill.isCanSave &&       
			practice.isCanSave && append.isCanSave && project.isCanSave && highlight.isCanSave && work.isCanSave &&        
			cert.isCanSave && langAbli.isCanSave && achievement.isCanSave && edu.isCanSave;
}


function saveAll(item){
	var objArr = ['resumeName','basic','contact','expect','work','edu','project','langAbli','skill','cert','highlight','achievement','practice','append'];
	var submitAddArr=['work','edu','project','langAbli','skill','cert','achievement','practice','append'];
	var curObj;
	if(typeof item != undefined && item!='' && item != null){
		var index = $.inArray(item,objArr);
		if(index+1<objArr.length){
			curObj = objArr[index+1];
		}
		else{
			saveAllCallback();
		}
	}
	else{
		curObj = objArr[0];
	}
	if(eval(curObj+'.isCanSave')){
		if($.inArray(curObj,submitAddArr)>=0){
			eval(curObj+'.submit(false,true);');
		}
		else{
			eval(curObj+'.submit(true);');
		}
	}
	else{
		saveAll(curObj);
	}                         
}


function bindMouseEvent() {
	var c = "#conAchievement .infoview,#conLanguage .infoview,#conWork .infoview,#conEduAndTrain .infoview,.addlan .infoview,#ulShowCert .infoview,.addproj .infoview,.addAbility .infoview,#conProject .infoview,#conSkill .infoview,#conAppend .infoview,#conPractice .infoview";
	$(c).unbind("mouseover");
	$(c).unbind("mouseout");
	$(c).mouseover(function() {
		$(this).addClass('hov').find(".modify").show();
	});
	$(c).mouseout(function() {
		$(this).removeClass('hov').find(".modify").hide();
	});

	var f = ":text,textarea";
	$(f).focus(function() {
		$(this).addClass('focus');
	});
	$(f).blur(function() {
		$(this).removeClass('focus');
	});
	
	$(document).click(function(e) {
		var a = $(e.target);
		if (a.is("body") || a.is("table") || a.is("form") || a.is("td") || a.is("textarea") || (a.is("div") && (a.attr("class") == "modtab" || a.attr("class") == "baseinfoview" || a.attr("class") == "win1000"))) {
			hidePopUpWin();
		}
	})
};
function bindShowOrHideEvt() {
	$(".addbtn").click(function() {
		$(this).parent().parent().find(".form").show();
	});
}

//按截止时间和开始时间排序，找到合适的位置并插入进去
function addToUl(con,obj,objsTime,objeTime)
{
	var objsTimeDate = new Date(objsTime);
	var objeTimeDate = objeTime==''?'':new Date(objeTime);
	
	var result = false;
	//证书由于只有一个获得时间，由于只有这一个例外，单独处理了，不通过写参数来区分了
	if(con=='ulShowCert'){
		$('#'+con).find('li').each(function(i){
			var gainTime = $(this).find('.gainTime').attr('v')==''?'':new Date($(this).find('.gainTime').attr('v'));
			if(objsTimeDate=='' && gainTime==''){
				$(this).before(obj);
				result = true;
				return false;
			}
			else if (objsTimeDate==''){
			}
			else if (gainTime==''){
				$(this).before(obj);
				result = true;
				return false;
			}
			else{
				if(objsTimeDate.valueOf()>=gainTime.valueOf()){
					$(this).before(obj);
					result = true;
					return false;
				}
			}
		});
	}
	else{
		$('#'+con).find('li').each(function(i){
			var sTime = new Date($(this).find('.sTime').attr('v'));
			var eTime = $(this).find('.eTime').attr('v')==''?'':new Date($(this).find('.eTime').attr('v'));
			if(objeTimeDate=='' && eTime==''){
				if(objsTimeDate.valueOf()>=sTime.valueOf()){
					$(this).before(obj);
					result = true;
					return false;
				}
			}
			else if (objeTimeDate==''){
				$(this).before(obj);
				result = true;
				return false;
			}
			else if (eTime==''){
				
			}
			else{
				if(objeTimeDate.valueOf()>eTime.valueOf()){
					$(this).before(obj);
					result = true;
					return false;
				}
				else if (objeTimeDate.valueOf()==eTime.valueOf()){
					if(objsTimeDate.valueOf()>=sTime.valueOf()){
						$(this).before(obj);
						result = true;
						return false;
					}
				}
			}
		});
	}
	
	//如果从开头找到结尾，找遍了还是没找到合适的位置，就表明应该放在最后面
	if(!result){
		$('#'+con).append(obj);
	}	
}



//function bindAddWinEvent(g) {
//	$(".revT").each(function(a, b) {
//		var c = $(b).parent();
//		var d = $(c).find(".infoview:visible").length;
//
//		if (d == 0) {
//			if (g) {
//				$(b).find(".btn_add").hide();
//			}
//		} else {
//			$(b).find(".btn_add").newShow();
//			$(b).find(".btn_skip").hide();
//		}
//	})
//}
