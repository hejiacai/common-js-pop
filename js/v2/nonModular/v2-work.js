hbjs.use('@editResume, @multipleSelect, @jobSorter, @fileUploader, @hbCommon, @jobDater, @areaSimple, @jobsort, @form, @calling, @areaMulitiple, @jobCertificate, @jobSkill, @fancyboxThumbs, @dateFormat', function(m){    
    var isIE = !window.XMLHttpRequest,
		isIE6 = !-[1,] && isIE,
		$ = m['jquery'],
		util = m['base.util'],
		select = m['widge.select'],
		FileUploader = m['widge.fileUploader'],
		editResume = m['product.resume.editResume'],
		editMutilResume = m['product.resume.editMutilResume'],
		multipleSelect = m['widge.multipleSelect'],
		dateFormat = m['tools.dateFormat'],
		confirmBox = m['widge.overlay.confirmBox'],
		checkBoxer = m['widge.checkBoxer'],
		jobSorter = m['product.jobSort.jobSorter'],
		jobDater = m['cqjob.jobDater'],
		DateFormat = m['tools.dateFormat'],
		verifier = m['module.verifier'],
		validatorForm = m['widge.validator.form'];
		
        
	$.extend(
		m['product.hbCommon'], m['cqjob.jobsort'], m['cqjob.calling'], m['cqjob.jobDialog'], m['cqjob.areaMulitiple'],
		m['cqjob.jobCertificate'], m['cqjob.jobSkill'], m['cqjob.fancybox-thumbs']
	);
    
    $('input, textarea').watermark();
    /*工作经历*/
	var workInfoRules = {
			txtWorkCompanyName: {required: true, range: [4,30]},
//			hidWorkComSize: 'required',
//			hidWorkComProperty: 'required',
			txtWorkStation : { required: true, range: [2,12] },
			inpWorkTimeStartYear: 'number',
			inpWorkTimeStartMonth: 'number',
			hidWorkJobLevel: 'required',
//			txtWorkManageDempartment: {max: 60},
//			txtWorkSubordinate: { number: true, maxNum: 100000 },
//			txtWorkReportMan: {range: [1, 10]},
			txtWorkSalaryMonth: { required: true ,number:true, range:[1, 9999999]},
			taWorkContent: { required: true, range: [10,2000] },
			myJobSortId:'required'
		},
		workInfoErrorMsg = {
			txtWorkCompanyName: {
				required: '<i></i>请填写公司名称',
				range: '<i></i>4-30个字'
			},
			hidWorkComSize: '<i></i>请选择公司规模',
			hidWorkComProperty: '<i></i>请选择公司性质',
			txtWorkStation : {
				required: '<i></i>请填写职位名称',
				range: '<i></i>2-12个字'
			},
			inpWorkTimeStartYear:'<i></i>请填写在职时间',
			inpWorkTimeStartMonth: '<i></i>请填写在职时间',
			hidWorkTimeEnd: '<i></i>结束时间大于起始时间',
			hidWorkJobLevel: '<i></i>请选择职位级别',
//			txtWorkManageDempartment: '<i></i>管辖范围限定60个字',
//			txtWorkSubordinate: '<i></i>请填写正确的下属人数',
//			txtWorkReportMan: '<i></i>汇报对象限定10个字',
			txtWorkSalaryMonth: {
				required: '<i></i>请填写平均月薪',
				number: '<i></i>请填写数字',
				range: '<i></i>请填写正确的平均月薪'
			},
            taWorkContent : {
				required: '<i></i>请填写工作内容',
				range: '<i></i>10-2000个字'
			},
			myJobSortId: '<i></i>请选择职位类别',
		},
		workInfoGroups = {
			workComs: 'hidWorkComProperty hidWorkComSize',
			workTime: 'inpWorkTimeStartYear inpWorkTimeStartMonth hidWorkTimeEnd'
		},
		workInfoKeepBlur = [
			'inpWorkTimeStartYear', 'inpWorkTimeStartMonth', 'hidWorkTimeEnd'
		].join(' ');
	var workInfoEditor = new editMutilResume({
			validators: {
				rules: workInfoRules,
				errorMessages: workInfoErrorMsg,
				errorElement: '',
				groups: workInfoGroups,
				keepBlur: workInfoKeepBlur,
				keepKey: true,
				isCache: false
			}
		}),
		workInfoValidator = workInfoEditor.getValidator(),
		chkWords, selWorkComProperty, selWorkComSize, 
		selWorkJobType, selWorkJoblevel, workTimeDater;
	
	function laterThan(element, param){
		var context = param['context'],
			startTime = context.getElement(param['startName']).val(),
			endTime = element.val();
		if(param['chkName'].isChecked(param['index'] || 0)){
			var now = new Date();
			endTime = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100;
			context.getElement(param['endName']).val(endTime);
		}
		return endTime > startTime;
	}
	
	workInfoEditor._normalUL = workInfoEditor.getDom('.exper');
	workInfoEditor._normalNoData = workInfoEditor.getDom('.no-data');
	workInfoEditor.hasNormalData = function(e){
		if(e){
			this._normalNoData.hide();
			this._normalUL.show();
		} else {
			this._normalNoData.show();
			if(!this._edit.closest('.exper').length){
				this._normalUL.hide();
			}
		}
//		updateRightSideList(3, e);
	}
	workInfoEditor.toggleNoData = function(e){
		if(e){
			this._normalNoData.hide();
		} else {
			this._normalNoData.show();
		}
	}
	workInfoEditor.clearData = function(){
		this.resetForm(true);
		if(!chkWords) return;
		selWorkComProperty.setSelectedIndex(0, true);
		selWorkComSize.setSelectedIndex(0, true);
        if(this.getDom('#workCallingContainer').is(":visible"))
            this.getDom('#workCallingContainer').resetCallingValue();
		this.getElement('inpWorkTimeEndYear').prop('disabled', false);
		this.getElement('inpWorkTimeEndMonth').prop('disabled', false);
		chkWords.all(false);
		selWorkJobType.setSelectedIndex(0, true);
//		selWorkJoblevel.setSelectedIndex(0, true);
		this.toggleManagerExp();
		this.getDom('#workJobsortContainer').resetJobsortValue();
		this.getElement('taWorkContent').resetWatermark();
		jobDater.update("WorkTime");
		
		$('#dropJobsort2 ul').html('')
		$('[name=myJobSortId]').val('')
		$('#myWorkId').val('')
		$('.jobTagsTxt div').html('填写职业标签能提升简历推荐的精确性')
		$('#hddJobTags').val('')
		jobsortBox2.clearAllItem()
	}
	var workTemplate = [ 
		'<div class="workRows editPanel clearfix" data-workid="{data-workid}" data-jobsortid="{data-jobsortid}" data-workjobtype="{data-workjobtype}" data-jobsortcontainer="{jobNameValue}" data-founder="{data-founder}" data-salarysecrecy="{data-salarysecrecy}">',
		'<span class="time" data-starttime="{data-starttime}" data-endtime="{data-endtime}">{label-starttime} {label-endtime}<br>{time}</span>',
		'<div class="box-item">',
		'<p class="tit">',
		'<span class="oper"><a href="javascript:" title="编辑" class="edt">编辑</a><a href="javascript:" class="del" title="删除">删除</a></span>',
		'<strong class="name jobName" v="{jobName}">{label-workjobtype} {jobName}{label-founder}</strong>',
		'<u>|</u>',
		'<strong class="name companyName">{companyName}</strong>',
		'<div class="jobTags">{jobTagsTemp}</div>',
		'</p>',
		'<div class="infor"><p>',
		'<span class="salary" v="{salary}">{label-salary}</span>',
		' - ',
		'<span class="joblevel" v="{joblevelValue}">{joblevelLabel}</span>',
		' - ',
		'<span class="comProperty" v="{comPropertyValue}">{comPropertyLabel}</span>',
		',',
		'<span class="callingContainer" v="{callingContainerValue}">{callingContainerLabel}</span>',
		',',
		'<span class="comSize" v="{comSizeValue}">{comSizeLabel}</span>',
		'</p>',
		'<div class="mgt10 cont workContent" v="{workContent}" style="display:{display1}">{label-workContent}</div>',
		'<ul class="mgt15 fanwei">',
		'<li style="display:{display2}">',
		'<strong>管辖范围：</strong><span class="dempartment" v="{dempartment}">{label-dempartment}</span></li>',
		'<li style="display:{display3}">',
		'<strong>下属人数：</strong><span class="workSubordinate" v="{workSubordinate}">{label-workSubordinate}</span>',
		'<strong style="margin-left:30px">汇报对象：</strong><span class="workReportMan" v="{workReportMan}">{label-workReportMan}</span>',
		'</li>',
		'<li style="display:{display4}"><strong>离职原因：</strong><span class="dimContent" v="{dimContent}">{label-dimContent}</span></li>',
		'</ul></div></div></div>'
	].join('');
	workInfoEditor.updatePreview = function(e){
		var chkValue = chkWords.getValue(true),
			dataObj = {
				'data-workid': e.work_id,
				"data-jobsortid": $('#myJobSortId').val(),
				'jobTagsTemp':$('#hddJobTags').val(),
				'jobName': this.getElement('txtWorkStation').val(),
				'data-founder': chkValue['chkIsCreator'] != undefined ? chkValue['chkIsCreator'][0] : '',
				'comPropertyLabel': selWorkComProperty.get('label'),
				'comPropertyValue': selWorkComProperty.get('value'),
				'comSizeLabel': selWorkComSize.get('label'),
				'comSizeValue': selWorkComSize.get('value'),
				'companyName': this.getElement('txtWorkCompanyName').val(),
				'data-workjobtype': selWorkJobType.get('value'),
//				'joblevelLabel': selWorkJoblevel.get('label'),
//				'joblevelValue': selWorkJoblevel.get('value'),
				'data-salarysecrecy': chkValue['chkWorkSalarySecrecy'] != undefined ? chkValue['chkWorkSalarySecrecy'][0] : ''
			},
			index = this.getIndex();
			if(dataObj['jobTagsTemp']!=""){
				var tempTagObj=JSON.parse(dataObj['jobTagsTemp']);
				dataObj['jobTagsTemp'] = tag2html(tempTagObj);
			}
		var txtValue = this.getElement('txtWorkSalaryMonth').val();
		dataObj['salary'] = txtValue;
		txtValue = chkValue['chkWorkSalarySecrecy'] != undefined ? chkValue['chkWorkSalarySecrecy'][0] : '';
		dataObj['label-salary'] = txtValue ? '薪资保密' : dataObj['salary'] + '元/月';
		var dempartmentValue = '',
			workSubordinateValue = '',
			workReportManValue = ''; 
		
		var selIndex = parseInt(dataObj['joblevelValue']);
		if(selIndex >= 4){
			dempartmentValue = this.getElement('txtWorkManageDempartment').val();
			workSubordinateValue = this.getElement('txtWorkSubordinate').val();
			workReportManValue = this.getElement('txtWorkReportMan').val();
			dataObj['display2'] = dempartmentValue ? 'block' : 'none';
			if(!workSubordinateValue && !workReportManValue){
				dataObj['display3'] = "none";
			} else {
				dataObj['display3'] = "block";
			}
		} else {
			dataObj['display2'] = 'none';
			dataObj['display3'] = 'none';
		}
		dataObj['dempartment'] = dempartmentValue;
		dataObj['workSubordinate'] = workSubordinateValue;
		dataObj['workReportMan'] = workReportManValue;
		dataObj['label-dempartment'] = dempartmentValue || '未填写';
		dataObj['label-workSubordinate'] = workSubordinateValue || '未填写';
		dataObj['label-workReportMan'] = workReportManValue || '未填写';
		
		txtValue  = this.getElement('taWorkContent').val();
		dataObj['workContent'] = txtValue;
		dataObj['label-workContent'] = txtValue.replace(/\n/g,"<br/>") || ("工作内容：" + noField);
		dataObj['display1'] = dataObj['workContent'] ? 'block' : 'none';
		
		txtValue = this.getElement('txtWorkLeaveReason').val();
		dataObj['dimContent'] = txtValue;
		dataObj['label-dimContent'] = txtValue || noField;
		dataObj['display4'] = dataObj['dimContent'] ? 'block' : 'none';
		
		dataObj['label-founder'] = dataObj['data-founder'] ? '[创始人]' : '';
		
		selIndex = parseInt(selWorkJobType.get('selectedIndex'));
		dataObj['label-workjobtype'] = selIndex ? '<span class="tag">' + selWorkJobType.get('label') + '</span>' : '';
		var startTimeYear = this.getElement('inpWorkTimeStartYear').val(),
			startTimeMonth = this.getElement('inpWorkTimeStartMonth').val(),
			endTimeYear = this.getElement('inpWorkTimeEndYear').val(),
			endTimeMonth = this.getElement('inpWorkTimeEndMonth').val(),
			startTime = startTimeYear + '/' + startTimeMonth + '/1',
			endTime, curDate;
			
		if(endTimeYear){
			endTime = endTimeYear + '/' + endTimeMonth + '/1';
			curDate = new Date(endTime);
		} else {
			endTime = '';
			curDate = new Date;
		}
		dataObj['data-starttime'] = startTime;
		dataObj['data-endtime'] = endTime;
		dataObj['label-starttime'] = startTimeYear + '.' + startTimeMonth;
		dataObj['label-endtime'] = endTime ? endTimeYear + '.' + endTimeMonth : '至今';
		
		var dateFormat = new DateFormat(curDate);
		var workMonthNum = dateFormat.diffMonth(startTime);
		var workY = Math.floor(workMonthNum / 12),
			workM = parseInt(workMonthNum % 12),
			workYearDesc;
			
		if(workM == 0 && workY == 0){
			workYearDesc = '';
		} else if(workM == 0){
			workYearDesc = '[' + workY + '年' + ']';
		} else{
			workYearDesc = '[' + workY + '年' + workM + '个月' + ']';
		}
		dataObj['time'] = workYearDesc;
		
		var callingId = this.getDom('#workCallingContainer').getCallingValue();
		var calling_id = '',
		   calling_name = '';
		   
		if(callingId.length > 0){
		   var callingArr = callingId[0].split(',');
		   calling_id = callingArr[0];
		   calling_name = callingArr[1];
		}
		dataObj['callingContainerLabel'] = calling_name;
		dataObj['callingContainerValue'] = calling_id;
		
		var jobsortID = this.getDom('#workJobsortContainer').getJobSortValue(),
			jobsort_id = '',
			jobsort_name = '';
			
		if(jobsortID.length > 0){
		   var jobsortArr = jobsortID[0].split(",");
		   if(jobsortArr.length > 0){
			   jobsort_id = jobsortArr[0];
			   jobsort_name = jobsortArr[1];
		   }
		}
		dataObj['jobNameLabel'] = jobsort_name;
		dataObj['jobNameValue'] = jobsort_id;
		
		if(!this._isAdd){
			var preview = this._normal.eq(index);
			preview.attr({
				'data-jobsortid': dataObj['data-jobsortid'],
				'data-workjobtype': dataObj['data-workjobtype'],
				'data-jobsortcontainer': dataObj['jobNameValue'],
				'data-jobName': dataObj['jobNameLabel'],
				'data-founder': dataObj['data-founder'],
				'data-salarysecrecy': dataObj['data-salarysecrecy']
			});
			
			var item = preview.find('.fanwei');
			selIndex = parseInt(dataObj['joblevelValue']);
			item.find('.dempartment').attr('v', dataObj['dempartment']).text(dataObj['label-dempartment']);
			item.find('.workSubordinate').attr('v', dataObj['workSubordinate']).text(dataObj['label-workSubordinate']);
			item.find('.workReportMan').attr('v', dataObj['workReportMan']).text(dataObj['label-workReportMan']);
			item = item.children('li');
			if(selIndex >= 4){
				if(dempartmentValue){
					item.eq(0).show();
				} else {
					item.eq(0).hide();
				}
				if(!workSubordinateValue && !workReportManValue){
					item.eq(1).hide();
				} else {
					item.eq(1).show();
				}
			} else {
				item.eq(0).hide();
				item.eq(1).hide();
			}
			preview.find('.time').attr({
				'data-starttime': dataObj['data-starttime'],
				'data-endtime': dataObj['data-endtime']
			}).html(dataObj['label-starttime'] + ' ' + dataObj['label-endtime'] + '<br />' + dataObj['time']);

			preview.find('.tit .jobName').attr('v', dataObj['jobName']).html(dataObj['label-workjobtype'] + ' ' + dataObj['jobName'] + dataObj['label-founder']);
			preview.find('.tit .companyName').text(dataObj['companyName']);
			preview.find('.jobTags').html(dataObj['jobTagsTemp']);
			
			preview.find('.salary').attr('v', dataObj['salary']).text(dataObj['label-salary']);
			preview.find('.joblevel').attr('v', dataObj['joblevelValue']).text(dataObj['joblevelLabel']);
			preview.find('.comProperty').attr('v', dataObj['comPropertyValue']).text(dataObj['comPropertyLabel']);
			preview.find('.callingContainer').attr('v', dataObj['callingContainerValue']).text(dataObj['callingContainerLabel']);
			preview.find('.comSize').attr('v', dataObj['comSizeValue']).text(dataObj['comSizeLabel']);
			var tempObj = preview.find('.workContent').attr('v', dataObj['workContent']).html(dataObj['label-workContent']);
			if(dataObj['workContent']){
				tempObj.show();
			}  else {
				tempObj.hide()
			}
			
			tempObj = preview.find('.dimContent').attr('v', dataObj['dimContent']).text(dataObj['label-dimContent']).parent();
			if(dataObj['dimContent']){
				tempObj.show();
			} else {
				tempObj.hide();
			}
			
			this.show();
		} else {
			this.getDom('.exper').prepend(util.string.replace(workTemplate, dataObj));
			this.update();
			this.show();
			delete this._isAdd;
			this.hasNormalData(this._normal.length);
		}
	}
	workInfoEditor.toggleManagerExp = function(e){
//		var txtWorkManageDempartment = this.getElement('txtWorkManageDempartment'),
//			txtWorkSubordinate = this.getElement('txtWorkSubordinate'),
//			txtWorkReportMan = this.getElement('txtWorkReportMan'),
//			index = e ? e.index : selWorkJoblevel.get('selectedIndex'),
//			manageExpBox = this.getDom('#manageExpBox');
//			
//		if(index >= 4){
//			manageExpBox.show();
//		} else {
//			manageExpBox.hide();
//			txtWorkManageDempartment.val('');
//			txtWorkSubordinate.val('');
//			txtWorkReportMan.val('');
//			//workInfoValidator.resetElement(txtWorkManageDempartment);
//			//workInfoValidator.resetElement(txtWorkSubordinate);
//			//workInfoValidator.resetElement(txtWorkReportMan);
//		}
	}
	workInfoEditor.resetData = function(){
		var index = this.getIndex(), preview;
		jobsortBox2.clearAllItem()
		jobsortBox2.updateData();
		$('.jobTagsTxt div').html('填写职业标签能提升简历推荐的精确性')
		$('#hddJobTags').val('')
		$('#dropJobsort2 ul').html('')
		$('[name=myJobSortId]').val('');
		if((preview = this._normal.eq(index)).length){
			$('#myWorkId').val(preview.attr('data-workid'))
			var tempJobId=preview.attr('data-jobsortid');
			
			if(tempJobId){
				$('[name=myJobSortId]').val(tempJobId);
				jobsortBox2.addItem({label:findJobName(tempJobId),value:tempJobId})
			}
			
			jobsortBox2.updateData();
			var tempTagObj=tag2json(preview.find('.jobTags'));
			$('.jobTagsTxt div').html(tag2html(tempTagObj,true)||'填写职业标签能提升简历推荐的精确性')
			$('#hddJobTags').val(JSON.stringify(tempTagObj))
			
			var attr = preview.find('.companyName').text();
			this.getElement('txtWorkCompanyName').val(attr);
			
			attr = preview.find('.salary').attr('v');
			this.getElement('txtWorkSalaryMonth').val(attr);
			
//			if(attr = preview.find('.joblevel').attr('v')){
//				selWorkJoblevel.setSelectedIndex(attr, true);
//			} else {
//				selWorkJoblevel.setSelectedIndex(0, true);
//			}
			
			attr = preview.find('.department').attr('v');
			this.getElement('txtWorkDepartment').val(attr);
			attr = preview.find('.workSubordinate').attr('v');
			this.getElement('txtWorkSubordinate').val(attr);
			attr = preview.find('.workReportMan').attr('v');
			this.getElement('txtWorkReportMan').val(attr);
			this.toggleManagerExp();
			
			if(attr = preview.find('.comProperty').attr('v')){
				selWorkComProperty.setSelectedIndex(attr, true);
			} else {
				selWorkComProperty.setSelectedIndex(0, true);
			}
			if(attr = preview.find('.callingContainer').attr('v')){
				this.getDom('#workCallingContainer').setCallingValue(attr);
			} else {
				this.getDom('#workCallingContainer').resetCallingValue();
			}
			
			if(attr = preview.find('.comSize').attr('v')){
				selWorkComSize.setSelectedIndex(attr, true);
			} else {
				selWorkComSize.setSelectedIndex(0, true);
			}
			if(attr = preview.attr('data-workJobType')){
				selWorkJobType.setSelectedIndex(attr - 1, true);
			}
			
			var workTime = preview.find('.time'),
				workStTime = workTime.attr('data-starttime'),
				workEnTime = workTime.attr('data-endtime');
				
			if(workStTime){
				workStTime = new Date(workStTime);
				this.getElement('inpWorkTimeStartYear').val(workStTime.getFullYear());
				this.getElement('inpWorkTimeStartMonth').val(workStTime.getMonth() + 1);
				this.getElement('hidWorkTimeStart').val(workStTime.getFullYear() * 10000 + (workStTime.getMonth() + 1) * 100);
			}
			
			var endTimeYear = this.getElement('inpWorkTimeEndYear'),
				endTimeMonth = this.getElement('inpWorkTimeEndMonth'),
				endTimeInput = this.getElement('hidWorkTimeEnd');
			if(workEnTime){
				workEnTime = new Date(workEnTime);
				if(util.type.isDate(workEnTime)){
					endTimeYear.prop('disabled', false).val(workEnTime.getFullYear());
					endTimeMonth.prop('disabled', false).val(workEnTime.getMonth() + 1);	
					endTimeInput.val(
						workEnTime.getFullYear() * 10000 + (workEnTime.getMonth() + 1) * 100
					);
					chkWords.setStatus(0, false);
				} else {
					chkWords.setStatus(0, true);
					endTimeYear.prop('disabled', true).val('');
					endTimeMonth.prop('disabled', true).val('');
					endTimeInput.val(0);
				}
			} else {
				chkWords.setStatus(0, true);
				endTimeYear.prop('disabled', true).val('');
				endTimeMonth.prop('disabled', true).val('');
				endTimeInput.val(0);
			}
			
			attr = preview.find('.jobName').attr('v');
			this.getElement('txtWorkStation').val(attr);
			
			this.getDom('#workJobsortContainer').resetJobsortValue();
			if(attr = preview.attr('data-jobsortContainer')){
				this.getDom('#workJobsortContainer').setJobSortValue(attr);
			}
			
			attr = parseInt(preview.attr('data-founder'));
			if(attr){
				chkWords.setStatus(1, true);
			} else {
				chkWords.setStatus(1, false);
			}
			
			attr = parseInt(preview.attr('data-salarySecrecy'));
			if(attr){
				chkWords.setStatus(2, true);
			} else {
				chkWords.setStatus(2, false);
			}
			attr = preview.find('.workContent').attr('v');
			this.getElement('taWorkContent').val(attr).resetWatermark();
			
			attr = preview.find('.dimContent').attr('v');
			this.getElement('txtWorkLeaveReason').val(attr);
			
			jobDater.update("WorkTime");
			
			var selectJob=preview.find('.hddSelectJob');
			$('#selectJob').val(selectJob.val()||0);
		}
	}
	workInfoValidator.addMethod('laterThan', laterThan);
	workInfoEditor.on('init', function(){
		var self = this;
		workInfoValidator.addDomCache(true);
		selWorkComProperty = new select({
			trigger: this.getDom('#selWorkComProperty'),
			className: 'dropv2_select',
			align: {baseXY: [0, '100%-1']},
			selectName: 'hidWorkComProperty',
			dataSource: comPropertyItems,
			selectedIndex: 0,
			isHidDefault: true,
			selectCallback: {
				isDefault: true
			}
		});
		selWorkComSize = new select({
			trigger: this.getDom('#selWorkComSize'),
			className: 'dropv2_select',
			align: {baseXY: [0, '100%-1']},
			selectName: 'hidWorkComSize',
			dataSource: comSizeItems,
			selectedIndex: 0,
			isHidDefault: true,
			selectCallback: {
				isDefault: true
			}
		});
		chkWords = new checkBoxer({
			element: this.getDom('.icon-chck'),
			className: 'icon-chck-checked'
		});
		selWorkJobType = new select({
			trigger: this.getDom('#selWorkJobType'),
			className: 'dropv2_select',
			align: {baseXY: [0, '100%-1']},
			selectName: 'hidWorkJobType',
			dataSource: jobTypeItems ,
			selectedIndex: 0
		});
//		selWorkJoblevel = new select({
//			trigger: this.getDom('#selWorkJoblevel'),
//			className: 'dropv2_select',
//			align: {baseXY: [0, '100%-1']},
//			selectName: 'hidWorkJobLevel',
//			dataSource: jobLevelItems,
//			selectedIndex: 0,
//			isHidDefault: true,
//			selectCallback: {
//				isDefault: true
//			}
//		});
		workInfoValidator.addRules('hidWorkTimeEnd',  {
			laterThan: {
				context: workInfoEditor,
				startName: 'hidWorkTimeStart',
				endName: 'hidWorkTimeEnd',
				chkName: chkWords
				}
			}
		);
        if(is_simple)
            workInfoValidator.removeRules('hidWorkJobLevel');
		selWorkComProperty.on('change', function(e){
			if(workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0])){
				workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0]);
			}
			if(workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0])){
				workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0]);
			}
		});
		selWorkComSize.on('change', function(e){
			if(workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0])){
				workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0]);
			}
			if(workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0])){
				workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0]);
			}
		});
		chkWords.on('select', function(e){
			if(!e.index){
				var endTimeYear = self.getElement('inpWorkTimeEndYear'),
					endTimeMonth = self.getElement('inpWorkTimeEndMonth'),
					endTimeInput = self.getElement('hidWorkTimeEnd');
				if(this.isChecked(e.index)){
					endTimeYear.val('').prop('disabled', true);
					endTimeMonth.val('').prop('disabled', true);
					endTimeInput.val('');
				} else {
					endTimeYear.prop('disabled', false);
					endTimeMonth.prop('disabled', false);
					endTimeInput.val(0);
				}

				if(workInfoValidator.checkElement(self.getElement('inpWorkTimeStartYear')[0]) && 
				workInfoValidator.checkElement(self.getElement('inpWorkTimeStartMonth'[0]))){
					workInfoValidator.checkElement(endTimeInput[0]);
				}
			}
		});
		
		this.getDom('#workCallingContainer').calling({
			max:1,hddName:'hddWorkcalling',isLimit:true,
			unLimitedLevel:3,type:'single'
		});
		jobDater.bind({
			id: "WorkTime",
			dateEntry: [0,1,3,4],
			size: 20,
			min: -55,
			//max: 2,
			onSelect:function(e){
				var f = workInfoValidator.checkElement($(e.target)[0]);
				if(e.next && e.next.length){
					f = workInfoValidator.checkElement($(e.next)[0]);
				} else {
					f = workInfoValidator.checkElement(workInfoEditor.getElement('inpWorkTimeStartYear')[0]);
				}
				if(f === false) return;
				
				var intWorkTimeS = 0;
				var intWorkSYear = parseInt(workInfoEditor.getElement('inpWorkTimeStartYear').val());
				var intWorkSMonth = parseInt(workInfoEditor.getElement('inpWorkTimeStartMonth').val());
				if(!isNaN(intWorkSYear)){
					intWorkTimeS += intWorkSYear * 10000;
				}
				if(!isNaN(intWorkSMonth)){
					intWorkTimeS += intWorkSMonth * 100;
				}
				workInfoEditor.getElement('hidWorkTimeStart').val(intWorkTimeS);
				
				var intWorkTimeE = 0;
				var intWorkEYear = parseInt(workInfoEditor.getElement('inpWorkTimeEndYear').val());
				var intWorkEMonth = parseInt(workInfoEditor.getElement('inpWorkTimeEndMonth').val());
				if(!isNaN(intWorkEYear)){
					intWorkTimeE += intWorkEYear * 10000;
				}
				if(!isNaN(intWorkEMonth)){
					intWorkTimeE += intWorkEMonth * 100;
				}
				workInfoEditor.getElement('hidWorkTimeEnd').val(intWorkTimeE);
				workInfoValidator.checkElement(workInfoEditor.getElement('hidWorkTimeEnd')[0]);
			},
			noSelect:function(e){
				workInfoValidator.checkElement($(e.target)[0]);
			}
		});
//		selWorkJoblevel.on('change', function(e){
//			workInfoValidator.checkElement(workInfoEditor.getElement('hidWorkJobLevel')[0]);
//			self.toggleManagerExp(e);
//		});
		this.getDom('#workJobsortContainer').jobsort({
			max:1,hddName:'hddWorkJobsort',isLimit:true,type:'single'
		});
	});
	workInfoEditor.on('submit', function(e){
		this.saveSubmit(e);
	});
	workInfoEditor.saveSubmit = function(e){
		var btn = e ? $(e.currentTarget) : this._submitButton,
			self = this,
			data = { 'resume_id': resume_id },
			index = this.getIndex();
		if(index != undefined){
			data['work_id'] = this._normal.eq(index).attr('data-workid');
		}
		workInfoValidator.submit({
			callback: function(valid){
				self.resultStatus = valid;
				btn.submitForm({
					beforeSubmit: valid,
					data: data,
					success: function(result){
						if(result && result.error){
							self.resultStatus = false;
//							confirmBox.alert(result.error, null, { title: '保存失败' });
							confirmBox.alert(result.error);
							return;
						}
                        if(e.otherEvent){
                            window.location.href = reload_url + '-is_create-1';
                        }else{
                            window.location.href = reload_url;
                        }
                        
//						updateResumeTime(result.update_time);
//						self.updatePreview(result);
//						if(e.otherEvent){
//							self._normal.eq(0).before(self._edit.show());
//							delete self._oldIndex;
//							self._isAdd = true;
//							self.clearData();
//                            $("#jumpBtn").hide();
//                            $(".cancelBtn").show();
//						}
                        
					}, clearForm:false
				});	
			}
		});
	};
	
	workInfoEditor.on('add', function(){
		this.toggleNoData(true);
		this.clearData();
        $('.del').hide();
	});
	workInfoEditor.on('modify', function(){
		this.toggleNoData(true);
		this.resetForm();
		this.resetData();
        $('.del').show();
	});
	workInfoEditor.on('delete', function(e){
		var self = this,
			data = {
				'operate':'DeleteWork',
				'resume_id': resume_id,
				'work_id': this._normal.eq(this.getIndex()).attr('data-workid')
			};
		confirmBox.confirm('确定删除该工作经验吗？', null,function(){
			var that = this;
			$.post('/resume/DelDo/', data, function(json){
				that.hide();
				if(json.error){
					confirmBox.alert(json.error, null, { title: '删除失败' });
					return;
				}
                window.location.reload();
//				self.deleteList(e.index);
//				self.hasNormalData(self._normal.length);
			}, 'json');
		});
	});
	workInfoEditor.on('cancel', function(){
		this.toggleNoData(this._normal.length);
	});
	/*工作经历*/
    if(is_create)
        $(".edit").click();
});