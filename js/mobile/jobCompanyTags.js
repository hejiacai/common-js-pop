$(document).on('ready',function(){
	var userTagText="<div class=\"userTagText\">添加<b>技能、领域、综合能力</b>等标签，让企业快速搜索到您</div>";
var myWindow={
		notice:function(msg,time){
			$(document).dialog({
				type:'notice',
				infoText:msg,
				autoClose:time||2000
			})
		}
	}
	var tagDialogBody=$('.jobTagsDialog_m .dialogBody');
	var userTagInput=$('#userTagInput');
	var TagInputDialog=$('.userTagDialog_mask');
	
	// 判断职业标签是否已选择
	function checkTag(item){
		item.selected=false;
		var str=$('#hddJobTags').val();
		if(str=='')return false;
		var checked=JSON.parse(str);
		$.each(checked,function(i,e){
			if((item.tag_type==e.tag_type || (e.tag_type==3&&!item.tag_type) ) && item.id==e.id){
				item.selected=true;
				return false;
			}
		})
	}
	//显示选择职业标签弹框
	$('#tagTrigger_m').on('click',function(){
		if($('input[name=main_jobsort]').val() == '0'){
			console.log($('input[name=main_jobsort]').val())
			myWindow.notice('请先选择职位类别');
			return false
		}
		// $('#firstStepDiv').hide();
		
		showPageDiv('职业标签','tagTrigger_m');
		$('.jobTagsDialog_m').show();
		$.post('/company/GetJobsortSkillTags ',
			{job_id:$('input[name=jobID]').val(),jobsort_id:$('input[name=main_jobsort]').val()||1413},
			function(res){
				var text = "";
				console.log(res)
				text += "<div class=\"tagBox1_m\">";
				if(res.skill_tag.length>0){
					tagDialogBody.css('paddingTop','0');
					text += "<h4>技能、领域标签</h4>";
					text += "<div class=\"selectTags_m\">";
					$.each(res.skill_tag,function(i,e){
						checkTag(e)
						text += "<em data-id="+e.id+" data-name="+e.tag_name+" data-type="+e.tag_type+" class=\"jobTagLabel "+(e.selected?"cur":"")+"\">"+e.tag_name+"</em>";
					})
					text += "</div>";
				}
				if(res.ability_tag.length>0){
					tagDialogBody.css('paddingTop','0');
					text += "<h4>综合能力标签</h4>";
					text += "<div class=\"selectTags_m\">";
					$.each(res.ability_tag,function(i,e){
						checkTag(e)
						text += "<em data-id="+e.id+" data-name="+e.tag_name+" data-type="+e.tag_type+" class=\"jobTagLabel "+(e.selected?"cur":"")+"\">"+e.tag_name+"</em>";
					})
					text += "</div>";
				}
				text += "</div>";
					text += "<div class=\"tagBox"+(res.skill_tag.length==0&&res.ability_tag.length==0?"1":"2")+"_m\">";
					// <h3>自定义标签<a href="javascript:void(0);" class="addTagBtn_m"><i class="icon-svg25"></i>添加</a></h3>
					text += "	<h4>自定义标签<a href=\"javascript:void(0);\" class=\"addTagBtn_m\"><i class=\"icon-job_register_add\"></i>添加</a></h4>";
					text += "<div class=\"selectTags_m userTagBox_m\">";
					text+=userTagText;
					if(res.custom_tag.length>0){
						$.each(res.custom_tag,function(i,e){
							checkTag(e)
							text += "<em data-id="+e.id+" data-name="+e.tag_name+" data-type='3' class=\"jobTagLabel "+(e.selected?"cur":"")+"\">"+e.tag_name+"<i></i></em>";
						})
					}
					text += "	</div>";
					text += "</div>";
				
				$('.jobTagsDialog_m .dialogBody').html(text)
				if($('.userTagBox_m em').length>0){
					$('.userTagText').hide()
				}
				countTags()
				
			},'json').error(function() { 
				alert("error"); 
			})
		
	})
	//点击选择标签
	tagDialogBody.on('click','.selectTags_m em',function(){
		if($(this).hasClass('cur')){
			$(this).removeClass('cur')
		}else{
			if(tagDialogBody.find('.cur').length>=3){
				myWindow.notice('最多添加3个职业标签')
				return false
			}else{
				$(this).addClass('cur')
			}
		}
			countTags()
	})
	//一共选择了多少个标签
	function countTags(){
		var num=$('.dialogBody .cur').length;
		$('.tagCount_m').html(num)
		return num
	}
	
	//显示输入框
	tagDialogBody.on('click','.addTagBtn_m',function(){
		if(tagDialogBody.find('.cur').length>=3){
			myWindow.notice('最多选择3个职位标签')
		}else if($('.userTagBox_m').find('em').length>=3){
			myWindow.notice('最多添加3个自定义标签')
		}else{
			TagInputDialog.show()
		}
		
	})
	//关闭输入框
	function userTagDialogHide(){
		TagInputDialog.hide()
		userTagInput.val('')
	}
	// 安卓键盘出现输入框上移
	if(/Android/i.test(window.navigator.userAgent)){
		userTagInput.on('focus',function(){
			TagInputDialog.addClass('mp100')
		})
		userTagInput.on('blur',function(){
			TagInputDialog.removeClass('mp100')
		})
	}
	// 输入框限制
	userTagInput.on('input propertychange',function(){
		this.value=this.value.substring(0,10)
	})
	//清空输入框
	$('.userTagDialogInputBox .clearBtn').on('click',function(){
		userTagInput.val('')
	})
	//添加自定义标签
	$('.userTagDialogBtns a').on('click',function(){
		var type=$(this).attr('class');
		var tag_name=userTagInput.val();
		tag_name=tag_name.replace(/(^\s*)|(\s*$)/g,'')
		switch (type){
			case 'ok':
			if(tag_name==""){
				myWindow.notice('请输入自定义标签')
				return false
			}
			$.post('/company/AddJobsortSkillTagCustom',
			{work_id:$('#work_id').val(),jobsort_id:$('input[name=main_jobsort]').val()||1314,tag_name:tag_name},
			function(res){
				
				if(res.status){
					$('.userTagBox_m').append(`<em data-id="${res.data.id}" data-type="3" data-name="${tag_name}" class="cur">${tag_name}<i></i></em>`)
					userTagInput.val('')
					userTagDialogHide()
					countTags()
					$('.userTagText').hide()
				}else{
					myWindow.notice(res.msg)
				}
			},'json');
			default:
			userTagDialogHide()
		}
	})
	//删除自定义标签
	$('.dialogBody').on('click','.selectTags_m em i',function(){
		var $this=$(this);
		$.post('/company/DelJobsortSkillTagCustom',
		{tag_id:$this.parent('em').attr('data-id')},
		function(res){
			if(res.status){
				$this.parent('em').remove()
				countTags()
				if($('.userTagBox_m em').length==0){
					$('.userTagText').show()
				}
			}else{
				myWindow.notice(res.msg)
			}
		},'json')
		return false
	})
	
	// 职业标签确定按钮
	$('.tagBtnBox_m a').on('click',function(){
		var arr=$('.jobTagsDialog_m .dialogBody').find('.cur');
		var span=$('#tagTrigger_m span');
		var selectedTags=[],selectedTxt="";
		arr.each(function(i,e){
			selectedTags.push({
				id:$(e).attr('data-id'),
				tag_name:$(e).attr('data-name'),
				tag_type:$(e).attr('data-type'),
			})
			selectedTxt+= i!=0 ? "," : "" ;
			selectedTxt+=$(e).attr('data-name');
		})
		if(arr.length==0){
			selectedTxt+="请选择（选填）";
			span.addClass('gray')
		}else{
			span.removeClass('gray')
		}
		// selectedTxt+='<i class="icon-job_position_left"></i>'
		$('#hddJobTags').val(JSON.stringify(selectedTags))
		span.html(selectedTxt)
		// $('.jobTagsDialog_m').hide();
		// $('#firstStepDiv').show();
		hidePageDiv('tagTrigger_m');
	})
	
	//选择职位类别
	$("#jobSortId").click(function(){
	    var dataurl = "/datasourse/GetJobSortSingleData?callback=";
	    var hasSelectData = [];
	    thirdSelect.init(hasSelectData,"职位类别",dataurl,"jobsort","#hidJobsort",".job_sort",function(){
			$('.job_sort').addClass('green')
			$('#tagTrigger_m span').html('请选择（选填）').addClass('gray')
			$('#hddJobTags').val('')
		});
	});
	
})