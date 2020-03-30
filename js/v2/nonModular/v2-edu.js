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
    /*教育培训经历*/		
	var eduInfoRules = {
			txtEduSchool: {required: true, range: [4,30]},
			inpEduTimeStartYear: 'number',
			inpEduTimeStartMonth: 'number',
			hidEduDegree: 'required',
			txtEduDuty:{ max:100 },
			score1:{ 
                number: true,
				rangeNum: [0, 5] 
            },
            score2:{ 
                number: true,
				rangeNum: [1, 5] 
            },
			taEduDetail:{range:[1,500]}
		},
		eduInfoErrorMsg = {
			txtEduSchool: {
				required: '<em></em><i></i>请填写学校名称', range: '<em></em><i></i>4-30个字' 
			},
			inpEduTimeStartYear:'<em></em><i></i>请填写就读时间年份',
			inpEduTimeStartMonth:'<em></em><i></i>请填写就读时间月份',
			hidEduTimeEnd: '<em></em><i></i>结束时间大于起始时间',
			hidEduDegree: '<em></em><i></i>请选择学历',
			txtEduDuty: '<em></em><i></i>不超过100字',
            score1: {
				number: '<em></em><i></i>请填写数字',
				rangeNum: '<em></em><i></i>请输入正确的所得绩点'
			},
            score2: {
				number: '<em></em><i></i>请填写数字',
				rangeNum: '<em></em><i></i>请输入正确的满分绩点'
			},
			taEduDetail: '<em></em><i></i>不超过500字'
		},
		eduInfoGroups = {
			eduTime: 'inpEduTimeStartYear inpEduTimeStartMonth hidEduTimeEnd'
		},
		eduInfoKeepBlur = [
			'inpEduTimeStartYear', 'inpEduTimeStartMonth', 'hidEduTimeEnd'
		].join(' '),
		trainInfoRules = {
			txtTrainInstitution: {required: true, range: [2,30]},
			txtTrainCourse: { required: true, range:[2,20] },
			inpTrainTimeStartYear: 'number',
			inpTrainTimeStartMonth: 'number',
			taTrainDetail:{range:[1,500]}
		},
		trainInfoErrorMsg = {
			txtTrainInstitution: {
				required: '<em></em><i></i>请填写机构名称', 
				range: '<em></em><i></i>2-30个字'
			},
			txtTrainCourse: {
				required: '<em></em><i></i>请填写培训项目', 
				range: '<em></em><i></i>2-20个字'
			},
			inpTrainTimeStartYear: '<em></em><i></i>请填写就读时间年份',
			inpTrainTimeStartMonth: '<em></em><i></i>请填写就读时间月份',
			hidTrainTimeEnd: '<em></em><i></i>结束时间大于起始时间',
			taTrainDetail: '<em></em><i></i>不超过500字'
		},
		trainInfoGroups = {
			trainTime: 'inpTrainTimeStartYear inpTrainTimeStartMonth hidTrainTimeEnd'
		},
		trainInfoKeepBlur = [
			'inpTrainTimeStartYear', 'inpTrainTimeStartMonth', 'hidTrainTimeEnd'
		].join(' ');
        
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
    
    function getItemTime(time){
		return (time ? new Date(time) : new Date).getTime();
	}
	
	var eduInfoEditor = new editMutilResume({
			element: $('#eduInfor'),
			normalName: '.eduRows',
			validators: [{
				rules: eduInfoRules,
				errorMessages: eduInfoErrorMsg,
				errorElement: '',
				groups: eduInfoGroups,
				keepBlur: eduInfoKeepBlur,
				keepKey: true,
				isCache: false
			}, {
				rules: trainInfoRules,
				errorMessages: trainInfoErrorMsg,
				errorElement: '',
				groups: trainInfoGroups,
				keepBlur: trainInfoKeepBlur,
				keepKey: true,
				isCache: false
			}]
		}),
		txtEduMajorDescRules = { required: true, range:[2,20] },
		txtEduMajorDescMsg = {
			required: '<em></em><i></i>请填写专业名称', range:'<em></em><i></i>2-20个字'
		},
		eduValidators = [],
		chkENow, radEduTrain, selEduDegree;
	eduValidators.push(eduInfoEditor.getValidator());
	eduValidators.push(eduInfoEditor.getValidator(1));
	eduValidators[0].addMethod('laterThan', laterThan);
	eduValidators[1].addMethod('laterThan', laterThan);
	
	eduInfoEditor._normalUL = eduInfoEditor.getDom('.less-train');
	eduInfoEditor._normalNoData = eduInfoEditor.getDom('.no-data');
	eduInfoEditor.hasNormalData = function(e){
		if(e){
			this._normalNoData.hide();
			this._normalUL.show();
		} else {
			this._normalNoData.show();
			if(!this._edit.closest('.less-train').length){
				this._normalUL.hide();
			}
		}
//		updateRightSideList(3, e);
	}
	eduInfoEditor._normalRet = [];
	eduInfoEditor._normal.each(function(index, val){
		eduInfoEditor._normalRet.push({
			type: parseInt($(this).attr('data-type')), 
			endTime: getItemTime($(this).children('.time').attr('data-endtime')),
			startTime: getItemTime($(this).children('.time').attr('data-starttime'))
		});
	})
	
	eduInfoEditor.toggleNoData = function(e){
		if(e){
			this._normalNoData.hide();
		} else {
			this._normalNoData.show();
		}
        if($(".editPanel").size() == 0){
            $(".cancelBtn").hide();
            if(degree_id < 5)
                $(".jumpBtn").show();
        }else{
            $(".cancelBtn").show();
            $(".jumpBtn").hide();
        }
	}
	eduInfoEditor.clearData = function(){ 
		this._edit.find('.eduTab').show();
		this.resetForm(true);
		radEduTrain && radEduTrain.setStatus(0, true, true);
		chkENow && chkENow.all(false);

		selEduDegree && selEduDegree.setSelectedIndex(0, true);
		this.getElement('inpEduTimeEndYear').prop('disabled', false);
		this.getElement('inpEduTimeEndMonth').prop('disabled', false);
		this.getElement('inpTrainTimeEndYear').prop('disabled', false);
		this.getElement('inpTrainTimeEndMonth').prop('disabled', false);
		this.getElement('taEduDetail').resetWatermark();
		this.getElement('taTrainDetail').resetWatermark();
		this.getElement('txtEduDuty').resetWatermark();
		this.getElement('score1').resetWatermark();
		this.getElement('score2').resetWatermark();
		
		eduValidators[0].addRules('txtEduMajorDesc', txtEduMajorDescRules);
		eduValidators[0].addErrorMessages('txtEduMajorDesc', txtEduMajorDescMsg);
		eduValidators[0].resetElement(this.getElement('txtEduMajorDesc'));
		if(this.getDom('#eduMajorDescBox').is(':hidden')){
			this.getDom('#eduMajorDescBox').show();
            if(work_year < 3)
                this.getDom('#eduDetailBox').show();
		}
		jobDater.update("EduTime");
		jobDater.update("TrainTime");
	}
	var eduTemplate = [
		'<div class="clearfix editPanel eduRows" {data-eduid} data-type="{data-type}" data-duty="{data-duty}">',
		'<span class="time" style="width:120px; text-align: right;" data-starttime="{data-starttime}" data-endtime="{data-endtime}">{label-starttime} {label-endtime}</span>',
		'<div class="box-item">',
		'<p class="tit">',
		'<span class="oper operHover"><a href="javascript:" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
		'<strong class="name labelDegree" v="{eduDegreeValue}">{eduDegreeLabel}</strong>{trainemlabel}<u>|</u>',
		'<span class="name labelSchool">{labelSchool}</span>{secondU}',
		'<span class="name labelMajorDesc" v="{data-majorDesc}">{labelMajorDesc}</span>',
		'<input type="hidden" value="{labelScore1}" class="labelScore1"/>',
        '<input type="hidden" value="{labelScore2}" class="labelScore2"/>',
		'</p>',
        '<div class="infor">',
            '<div class="wh-labelScore showScore" style="display:{showScore}">',
                '<span>在校成绩：</span><span class="textScore">{textScore}</span>',
            '</div>',
            '<div class="wh-labelScore showDuty" style="display:{showDuty}">',
                '<span>校内职务：</span><span class="labelDuty">{labelDuty}</span>',
            '</div>',
            '<div class="wh-labelScore showDetail" style="display:{showDetail}">',
                '<span class="cuorseTypeName">{cuorseTypeName}</span><span data-content="{labelDetail2}" class="labelDetail">{labelDetail}</span>',
            '</div>',
        '</div>',
		'</div></div>'
	].join('');
	eduInfoEditor.updatePreview = function(e){
		var index = this.getIndex(),
			eduRadValue = radEduTrain.getValue(true)['radEduTrain'];
			dataObj = {
				'data-type': eduRadValue[0]
			},
			eduType = parseInt(dataObj['data-type']),
			eduNames = ['EduTime', 'TrainTime'],
			eduData = ['data-eduid', 'data-trainid'];
			
		if(eduType){
			dataObj['data-eduid'] = 'data-trainid="' + e['train_id'] + '"';
		} else {
			dataObj['data-eduid'] = 'data-eduid="' + e['edu_id'] + '"';
		}
		var startTimeYear = this.getElement('inp' + eduNames[eduType] + 'StartYear').val(),
			startTimeMonth = this.getElement('inp' + eduNames[eduType] + 'StartMonth').val(),
			endTimeYear = this.getElement('inp' + eduNames[eduType] + 'EndYear').val(),
			endTimeMonth = this.getElement('inp' + eduNames[eduType] + 'EndMonth').val(),
			startTime = startTimeYear + '/' + startTimeMonth + '/1',
			endTime;
			
		if(endTimeYear){
			endTime = endTimeYear + '/' + endTimeMonth + '/1';
		} else {
			endTime = '';
		}
		dataObj['data-starttime'] = startTime;
		dataObj['data-endtime'] = endTime;
		if(startTimeMonth<10){
			startTimeMonth = '0'+startTimeMonth;
		}
		if(endTimeMonth<10){
			endTimeMonth = '0'+endTimeMonth;
		}
		dataObj['label-starttime'] = startTimeYear + '.' + startTimeMonth;
		dataObj['label-endtime'] = endTime ? '-' + endTimeYear + '.' + endTimeMonth : '-至今';
		
		eduNames = ['txtEduSchool', 'txtTrainInstitution'];
		dataObj['labelSchool'] = this.getElement(eduNames[eduType]).val();


		eduNames = ['txtEduDuty', ''];
		dataObj['labelDuty'] = this.getElement(eduNames[eduType]).val();

		eduNames = ['score1', ''];
		dataObj['labelScore1'] = this.getElement(eduNames[eduType]).val();

		eduNames = ['score2', ''];
		dataObj['labelScore2'] = this.getElement(eduNames[eduType]).val();

		eduNames = ['txtEduMajorDesc', 'txtTrainCertificate'];
		var eduCardName = this.getElement(eduNames[eduType]).val();
		dataObj['labelMajorDesc'] = (eduType ? eduCardName ? '[证]' : '' : '') + eduCardName;
		dataObj['data-majorDesc'] = this.getElement(eduNames[eduType]).val();
		if(dataObj['data-majorDesc'])
            dataObj['secondU'] = '<u>|</u>';
		eduNames = ['taEduDetail', 'taTrainDetail'];
		dataObj['labelDetail'] = this.getElement(eduNames[eduType]).val().replace(/\n/g,"<br/>");
		dataObj['labelDetail2'] = this.getElement(eduNames[eduType]).val();

		if(eduType != 0){
			dataObj['eduDegreeValue'] = '';
			dataObj['eduDegreeLabel'] = this.getElement('txtTrainCourse').val();
            dataObj['trainemlabel'] = '<em class="tag">培训</em>';
			dataObj['data-duty'] = '';
		} else {
			dataObj['eduDegreeValue'] = selEduDegree.get('value');
			dataObj['eduDegreeLabel'] = selEduDegree.get('label');
			dataObj['data-duty'] = this.getElement('txtEduDuty').val();
		}
        if(dataObj['labelScore1'] && dataObj['labelScore2'] && !eduType){
            dataObj['textScore'] = dataObj['labelScore1'] + '/' + dataObj['labelScore2'];
        }
		if(!this._isAdd){
			var preview = this._normal.eq(index);
			preview.attr({
				'data-type': eduType,
				'data-duty': dataObj['data-duty']
			});
			preview.find('.time').attr({
				'data-starttime': dataObj['data-starttime'],
				'data-endtime': dataObj['data-endtime']
			}).html(dataObj['label-starttime'] + '' + dataObj['label-endtime']);
			
			preview.find('.labelDegree').attr('v', dataObj['eduDegreeValue']).text(dataObj['eduDegreeLabel']);
			preview.find('.labelSchool').text(dataObj['labelSchool']);
			preview.find('.labelDuty').text(dataObj['labelDuty']);
			preview.find('.labelScore1').val(dataObj['labelScore1']);
			preview.find('.labelScore2').val(dataObj['labelScore2']);
			preview.find('.labelMajorDesc').attr('v', dataObj['data-majorDesc']).text(dataObj['labelMajorDesc']);
			preview.find('.labelDetail').attr('data-content',dataObj['labelDetail2']).html(dataObj['labelDetail'].replace(/\n/g, "<br/>"));
            //新加的显示项
            if(dataObj['textScore']){
                preview.find('.textScore').text(dataObj['textScore']);
                preview.find('.showScore').css("display","block");
            }else{
                preview.find('.showScore').css("display","none");
                preview.find('.textScore').text('');
            }
            if(dataObj['labelDuty'] && !eduType){
                preview.find('.showDuty').css("display","block");
            }else{
                preview.find('.showDuty').css("display","none");
            }
            if(dataObj['labelDetail']){
                preview.find('.showDetail').css("display","block");
                dataObj['cuorseTypeName'] = eduType ? "培训课程：" : "专业课程：";
                preview.find('.cuorseTypeName').text(dataObj['cuorseTypeName']);
            }else{
                preview.find('.showDetail').css("display","none");
            }
            
			this.updateToView(dataObj['data-starttime'], dataObj['data-endtime'], eduType);
			this.show();
		} else {
            //新加的显示项
            if(dataObj['textScore']){
                dataObj['showScore'] = 'block';
            }else{
                dataObj['showScore'] = 'none';
            }
            if(dataObj['labelDuty'] && !eduType){
                dataObj['showDuty'] = 'block';
            }else{
                dataObj['showDuty'] = 'none';
            }
            if(dataObj['labelDetail']){
                dataObj['showDetail'] = 'block';
                dataObj['cuorseTypeName'] = eduType ? "培训课程：" : "专业课程：";
            }else{
                dataObj['showDetail'] = 'none';
            }
            
			this.updateToView(dataObj['data-starttime'], dataObj['data-endtime'], eduType, util.string.replace(eduTemplate, dataObj));
			this.show();
			delete this._isAdd;
			this.hasNormalData(this._normal.length);
		}
	}
	eduInfoEditor.updateToView = function(startTime, endTime, eduType, html){
		startTime = getItemTime(startTime);
		endTime = getItemTime(endTime);
		var index = this.getIndex(),
			obj = {
				type: eduType,
				endTime: endTime,
				startTime: startTime
			},
			curIndex;
		if(html){
			this._normalRet.push(obj);
		} else {
			this._normalRet[index] = obj;
		}
		var ret = this._normalRet.sort(function(a, b){
			return b.type < a.type;
		}).sort(function(a, b){
			if(a.type === b.type){
				if(b.endTime === a.endTime){
					return b.startTime > a.startTime;
				} else {
					return b.endTime > a.endTime;
				}
			}
		});
		this._normalRet = ret;
		for(var j = 0, len = ret.length; j < len; j++){
			if(eduType != ret[j].type){
				continue;
			}
			if(ret[j].endTime === endTime && ret[j].startTime === startTime){
				curIndex = j;
				break;
			}
		}
		if(html){
			var list = this._normal.eq(curIndex);
			if(list.length){
				this._normal.eq(curIndex).before(html);
			} else {
				list = this._normal.eq(curIndex - 1);
				if(list.length){
					this._normal.eq(curIndex - 1).after(html);
				} else {
					this.getDom('.less-train').prepend(html);
				}
			}
			this.update();
		} else {
			if(curIndex < index){
				this._normal.eq(curIndex).before(this._normal.eq(index));
			} else if(curIndex > index) {
				this._normal.eq(curIndex).after(this._normal.eq(index));
			}
			this.update();
		}
	} 
	eduInfoEditor.resetData = function(){
		var index = this.getIndex(), preview;
		if((preview = this._normal.eq(index)).length){
			this.resetForm();
			this._edit.find('.eduTab').hide();
			var eduType = parseInt(preview.attr('data-type')),
				Time = preview.find('.time'),
				StTime = Time.attr('data-starttime'),
				EnTime = Time.attr('data-endtime'),
				eduNames = ['EduTime', 'TrainTime'],
				attr;

			if(StTime){
				StTime = new Date(StTime);
				this.getElement('inp' + eduNames[eduType] + 'StartYear').val(StTime.getFullYear());
				this.getElement('inp' + eduNames[eduType] + 'StartMonth').val(StTime.getMonth() + 1);
				this.getElement('hid' + eduNames[eduType] + 'TimeStart').val(StTime.getFullYear() * 10000 + (StTime.getMonth() + 1) * 100);
			}
			var endTimeYear = this.getElement('inp' + eduNames[eduType] + 'EndYear'),
				endTimeMonth = this.getElement('inp' + eduNames[eduType] + 'EndMonth'),
				endTimeInput = this.getElement('hid' + eduNames[eduType] + 'End');
			if(EnTime){
				EnTime = new Date(EnTime);
				if(util.type.isDate(EnTime)){
					endTimeYear.prop('disabled', false).val(EnTime.getFullYear());
					endTimeMonth.prop('disabled', false).val(EnTime.getMonth() + 1);	
					endTimeInput.val(
						EnTime.getFullYear() * 10000 + (EnTime.getMonth() + 1) * 100
					);
					chkENow.setStatus(eduType, false);
				} else {
					chkENow.setStatus(eduType, true);
					endTimeYear.prop('disabled', true).val('');
					endTimeMonth.prop('disabled', true).val('');
					endTimeInput.val(0);
				}
			} else {
				chkENow.setStatus(eduType, true);
				endTimeYear.prop('disabled', true).val('');
				endTimeMonth.prop('disabled', true).val('');
				endTimeInput.val(0);
			}
			if(eduType){
				attr = preview.find('.labelDegree').text();
				this.getElement('txtTrainCourse').val(attr);
				attr = preview.find('.labelMajorDesc').attr('v');
				this.getElement('txtTrainCertificate').val(attr);
				attr = preview.find('.labelDetail').text();
				this.getElement('taTrainDetail').val(attr).resetWatermark();
				jobDater.update("TrainTime");
			} else {
				if(attr = preview.find('.labelDegree').attr('v')){
					selEduDegree.setSelectedValue(attr);
				} else {
					selEduDegree.setSelectedIndex(0);
				}
				
				this.eduSelect(e, preview);
				attr = preview.find('.labelMajorDesc').text();
				this.getElement('txtEduMajorDesc').val(attr);
				attr = preview.attr('data-duty');
				this.getElement('txtEduDuty').val(attr).resetWatermark();
				jobDater.update("EduTime");
                var txtEduScore1 = this.getElement('score1'),
                    txtEduScore2 = this.getElement('score2');   
                if(preview.find('.labelScore1').val() && preview.find('.labelScore2').val()){
                    txtEduScore1.val(preview.find('.labelScore1').val());
                    txtEduScore2.val(preview.find('.labelScore2').val());
                    this.getElement('score1').resetWatermark();
                    this.getElement('score2').resetWatermark();
                }

			}
			
			eduNames = ['txtEduSchool', 'txtTrainInstitution'];
			attr = preview.find('.labelSchool').text();
			this.getElement(eduNames[eduType]).val(attr);
            
			radEduTrain.setStatus(eduType, true, true);
		}
	}
	eduInfoEditor.eduSelect = function(e, preview){
		var index = e ? e.index : selEduDegree.get('selectedIndex'),
			txtEduDes = this.getElement('txtEduMajorDesc'),
			txtEduDet = this.getElement('taEduDetail');

		if(index > 0 && index < 3){
			eduValidators[0].removeRules('txtEduMajorDesc');
			txtEduDes.val('');
			txtEduDet.val('');

			this.getDom('#eduMajorDescBox').hide();
			this.getDom('#eduDetailBox').hide();
		} else {
			if(preview){
				var attr = preview.find('.labelMajorDesc').text();
				txtEduDes.val(attr);
				txtEduDet.val(preview.find('.labelDetail').attr("data-content"));
			}
			eduValidators[0].addRules('txtEduMajorDesc', txtEduMajorDescRules);
			eduValidators[0].addErrorMessages('txtEduMajorDesc', txtEduMajorDescMsg);
			this.getDom('#eduMajorDescBox').show();
            if(work_year < 3)
                this.getDom('#eduDetailBox').show();
		}
		txtEduDet.resetWatermark();
		eduValidators[0].resetElement(txtEduDes);
	}
	eduInfoEditor.on('init', function(){
		var self = this;
		eduValidators[0].addDomCache(true);
		eduValidators[1].addDomCache(true);
		radEduTrain = new checkBoxer({
			element: this.getDom('.icon-rad'),
			className: 'icon-rad-checked',
			multiple: false
		});
        
		radEduTrain.on('select', function(e){
			var index = e.index;
			self.getDom('.eduTabType').hide();
			self.getDom('.eduTabType').eq(index).show();
		});
		chkENow = new checkBoxer({
			element: this.getDom('.icon-chck'),
			className: 'icon-chck-checked'
		});
		selEduDegree = new select({
			trigger: this.getDom('#selEduDegree'),
			className: 'dropv2_select',
			align: {baseXY: [0, '100%-1']},
			selectName: 'hidEduDegree',
			dataSource: degreeItems,
			selectedIndex: 0,
			isHidDefault: true,
			selectCallback: {
				isDefault: true
			}
		});	
		eduValidators[0].addRules('hidEduTimeEnd', {
			laterThan: {
				context: this,
				startName: 'hidEduTimeStart',
				endName: 'hidEduTimeEnd',
				chkName: chkENow
			}
		});
		eduValidators[1].addRules('hidTrainTimeEnd', {
			laterThan: {
				context: this,
				startName: 'hidTrainTimeStart',
				endName: 'hidTrainTimeEnd',
				index: 1,
				chkName: chkENow
			}
		});
		selEduDegree.on('change', function(e){
			eduValidators[0].checkElement(self.getElement('hidEduDegree')[0]);
			self.eduSelect(e);
		});
		chkENow.on('select', function(e){
			var index = e.index,
				ret = [
					['inpEduTimeEndYear', 'inpEduTimeEndMonth', 'hidEduTimeEnd'],
					['inpTrainTimeEndYear', 'inpTrainTimeEndMonth', 'hidTrainTimeEnd'],
					['inpEduTimeStartYear', 'inpEduTimeStartMonth', 'hidEduTimeStart'],
					['inpTrainTimeStartYear', 'inpTrainTimeStartMonth', 'hidTrainTimeStart']
				],
				endTimeYear = self.getElement(ret[index][0]),
				endTimeMonth = self.getElement(ret[index][1]),
				endTimeInput = self.getElement(ret[index][2]);
			if(this.isChecked(index)){
				endTimeYear.val('').prop('disabled', true);
				endTimeMonth.val('').prop('disabled', true);
				endTimeInput.val('');
			} else {
				endTimeYear.prop('disabled', false);
				endTimeMonth.prop('disabled', false);
				endTimeInput.val(0);
			}
			var v = eduValidators[index];
			if(v.checkElement(self.getElement((ret[index + 2])[0])[0]) && 
				v.checkElement(self.getElement((ret[index + 2])[1])[0])){
				v.checkElement(endTimeInput[0]);
			}
		});
		jobDater.bind({
			id: "EduTime",
			dateEntry: [0,1,3,4],
			size: 20,
			min: -55,
			max: 5,
			onSelect:function(e){
				var f = eduValidators[0].checkElement($(e.target)[0]);
				if(e.next && e.next.length){
					f = eduValidators[0].checkElement($(e.next)[0]);
				} else {
					f = eduValidators[0].checkElement(self.getElement('inpEduTimeStartYear')[0]);
				}
				if(f === false) return;
				
				var intTimeS = 0;
				var intSYear = parseInt(self.getElement('inpEduTimeStartYear').val());
				var intSMonth = parseInt(self.getElement('inpEduTimeStartMonth').val());
				if(!isNaN(intSYear)){
					intTimeS += intSYear * 10000;
				}
				if(!isNaN(intSMonth)){
					intTimeS += intSMonth * 100;
				}
				self.getElement('hidEduTimeStart').val(intTimeS);
				
				var intTimeE = 0;
				var intEYear = parseInt(self.getElement('inpEduTimeEndYear').val());
				var intEMonth = parseInt(self.getElement('inpEduTimeEndMonth').val());
				if(!isNaN(intEYear)){
					intTimeE += intEYear * 10000;
				}
				if(!isNaN(intEMonth)){
					intTimeE += intEMonth * 100;
				}
				self.getElement('hidEduTimeEnd').val(intTimeE);
				eduValidators[0].checkElement(self.getElement('hidEduTimeEnd')[0]);
			},
			noSelect: function(e){
				eduValidators[0].checkElement($(e.target)[0]);
			}
		});
		jobDater.bind({
			id: "TrainTime",
			dateEntry: [0,1,3,4],
			size: 20,
			min: -55,
			//max: 2,
			onSelect:function(e){
				var f = eduValidators[1].checkElement($(e.target)[0]);
				if(e.next && e.next.length){
					f = eduValidators[1].checkElement($(e.next)[0]);
				} else {
					f = eduValidators[1].checkElement(self.getElement('inpTrainTimeStartYear')[0]);
				}
				if(f === false) return;
				
				var intTimeS = 0;
				var intSYear = parseInt(self.getElement('inpTrainTimeStartYear').val());
				var intSMonth = parseInt(self.getElement('inpTrainTimeStartMonth').val());
				if(!isNaN(intSYear)){
					intTimeS += intSYear * 10000;
				}
				if(!isNaN(intSMonth)){
					intTimeS += intSMonth * 100;
				}
				self.getElement('hidTrainTimeStart').val(intTimeS);
				var intTimeE = 0;
				var intEYear = parseInt(self.getElement('inpTrainTimeEndYear').val());
				var intEMonth = parseInt(self.getElement('inpTrainTimeEndMonth').val());
				if(!isNaN(intEYear)){
					intTimeE += intEYear * 10000;
				}
				if(!isNaN(intEMonth)){
					intTimeE += intEMonth * 100;
				}
				self.getElement('hidTrainTimeEnd').val(intTimeE);
				eduValidators[1].checkElement(self.getElement('hidTrainTimeEnd')[0]);
			},
			noSelect: function(e){
				eduValidators[1].checkElement($(e.target)[0]);
			}
		});
		this.getDom('#trainCert').certificate({
			cerName:'txtTrainCertificate',
			isBtn: true,
			select: function(){
				eduValidators[1].checkElement(self.getElement('txtTrainCertificate')[0]);
			}
		});
        //初始化时学历专科以下默认进入培训页面
        if(degree_id < 5)
            radEduTrain.setStatus(1, true, true);
	});
	eduInfoEditor.on('delete', function(e){
        var index = this.getIndex(),
            preview = this._normal.eq(index),
			type = parseInt(preview.attr('data-type')),
			dataType = type ? 'data-trainid' : 'data-eduid',
			postType = type ? 'train_id' : 'edu_id',
			operateType = type ? 'DeleteTrain' : 'DeleteEdu',
			message = '确定删除该' + (type ? '培训' : '教育') + '经历吗?', 
			data = {
				'operate': operateType,
				'resume_id': resume_id
			},
			self = this;
		data[postType] = preview.attr(dataType);

		confirmBox.confirm(message, null,function(){
			var that = this;
			$.post('/resume/DelDo/', data, function(json){
				that.hide();
				if(json.error){
					confirmBox.alert(json.error, null, { title: '删除失败' });
					return;
				}
				self.deleteList(index);
				self._normalRet.splice(index, 1);
				self.hasNormalData(self._normal.length);
                //如果删完了就打开创建表单
                if($(".editPanel").size() == 0){
                    $(".edit").click();
                    $(".cancelBtn").hide();
                    $(".step2,.jumpBtn").hide();
                    $(".wh-line").hide();
                    if(degree_id < 5)
                        $(".jumpBtn").show();
                    $(".edit-status-box").css({"background":"#fff","margin-top":"0px"});
                }
                
//				window.location.reload();
			}, 'json');
		});
	});
	eduInfoEditor.on('submit', function(e){
		this.saveSubmit(e);
	});
	eduInfoEditor.saveSubmit = function(e){
		var btn = e ? $(e.currentTarget) : this._submitButton;
		var	self = this,
			data = { resume_id: resume_id },
			index = this.getIndex(),
			dataType = radEduTrain.getValue(true)['radEduTrain'][0];
		
		if(index != undefined){
			var li = this._normal.eq(index);
			if(li.length){
				var eduData = ['data-eduid', 'data-trainid'],
					hidType = ['edu', 'train'];
				dataType = parseInt(li.attr('data-type'));
				data['hidModEdOTrID'] =  li.attr(eduData[dataType]);
				data['hidEduTypeID'] = hidType[dataType];
			}
		}
		var validators = eduValidators[dataType];

		validators.submit({
			callback: function(valid){
				self.resultStatus = valid;
				btn.submitForm({
					beforeSubmit: valid,
					data:data,
					success: function(result){
						if(result && result.error){
							self.resultStatus = false;
//							confirmBox.alert(result.error, null, { title: '保存失败' });
							confirmBox.alert(result.error);
							return;
						}
//						updateResumeTime(result.update_time);
						self.updatePreview(result);
						if(e.otherEvent){
							self._normal.eq(0).before(self._edit.show());
							delete self._oldIndex;
							self._isAdd = true;
							self.clearData();
						}
                        $(".cancelBtn").show();
                        $(".jumpBtn").hide();
                        $(".step2").show();
                        $(".wh-line").show();
						$('#eduAdd').css('display','none');
					}, clearForm:false
				});	
			}
		});
	};
	eduInfoEditor.on('add', function(){
		this.toggleNoData(true);
		this.clearData();
        $('.del').hide();
        if(radEduTrain && degree_id < 5)
            radEduTrain.setStatus(1, true, true);
        if($(".editPanel").size() > 0)
            $(".edit-status-box").css({"background":"#fafafa","margin-top":"-1px"});
	});
	eduInfoEditor.on('modify', function(e){
        $('.del').show();
		this.toggleNoData(true);
		this.resetForm();
		this.resetData();
        $(".edit-status-box").css({"background":"#fafafa","margin-top":"-1px"});
	});
	eduInfoEditor.on('cancel', function(){
		this.toggleNoData(this._normal.length);
		//this.resetData();
	});
	/*教育培训经历*/
    
    if(is_create){
        $(".edit").click();
    }
});