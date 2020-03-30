 hbjs.use('@jobsort, @calling, @hbCommon, @jobDialog, @confirmBox', function (m) {
        var $ = m['jquery'].extend(m['cqjob.jobsort'], m['cqjob.calling']);
        var Dialog = m['widge.overlay.hbDialog'];
	var confirmBox = m['widge.overlay.confirmBox'];	
		
		$('#jobTags').on('click',function(){
			clickTags()
		})
		var tagDialog=new Dialog({
				idName: 'tagDialog',
				title: '职业标签',
				close: 'x',
				width: 600,
			});
			
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
		//点击职位标签
		function clickTags(){
			if($('#main_jobsort').val()==""){
				confirmBox.timeBomb('请先选择职位类别',
				{name: 'warning',
					width: 'auto'
				})
				return false
			}
			var url="/job/GetJobsortSkillTags";
			var data={
				jobsort_id:$('#main_jobsort').val()
			}
			
			$.post(url,data,function(res){
				var text = "";
				if(res.skill_tag.length>0){
					
					text += "<div class=\"tagBox\">";
					text += "<h4>技能、领域标签</h4>";
					$.each(res.skill_tag,function(i,e){
						checkTag(e)
						text += "<em data-id="+e.id+" data-name="+e.tag_name+" data-type="+e.tag_type+" class=\"jobTagLabel "+(e.selected?"cur":"")+"\">"+e.tag_name+"</em>";
					})
					text += "</div>";
				}
				if(res.ability_tag.length>0){
					
					text += "<div class=\"tagBox\">";
					text += "<h4>综合能力标签</h4>";
					$.each(res.ability_tag,function(i,e){
						checkTag(e)
						text += "<em data-id="+e.id+" data-name="+e.tag_name+" data-type="+e.tag_type+" class=\"jobTagLabel "+(e.selected?"cur":"")+"\">"+e.tag_name+"</em>";
					})
					text += "</div>";
				}
				if(res.skill_tag.length==0&&res.ability_tag.length==0){
					text += "<div class=\"userTagBox tagBox\">";
					text += "	<h4>请输入自定义标签关键词，最多3个</h4>";
					text += "	<div class=\"userTagInputBox\">";
					text += "		<input type=\"text\" id=\"userTagInput\" placeholder=\"技能/领域/综合能力标签\"><a href=\"javascript:void(0);\" class=\"ok\">确定</a>";
					text += "	</div>";
					text += "	<div class=\"userRight\">";
					if(res.custom_tag.length>0){
						
						$.each(res.custom_tag,function(i,e){
							checkTag(e)
							text += "<em data-id="+e.id+" data-name="+e.tag_name+" data-type='3' class=\"jobTagLabel "+(e.selected?"cur":"")+"\">"+e.tag_name+"<i>×</i></em>";
						})
					}
					text += "	</div>";
					text += "</div>";
				}else{
					text += "<div class=\"userTagBox tagBox\">";
					text += "<a href=\"javascript:void(0);\" class=\"addUserTagBtn\">+自定义标签</a>";
					text += "<div class=\"userRight\">";
					if(res.custom_tag.length>0){
						
						$.each(res.custom_tag,function(i,e){
							checkTag(e)
							text += "<em data-id="+e.id+" data-name="+e.tag_name+" data-type='3' class=\"jobTagLabel "+(e.selected?"cur":"")+"\">"+e.tag_name+"<i>×</i></em>";
						})
					}
					text += "</div>";
					text += "<div class=\"clear\"></div>";
						text += "<div class=\"userTagInputBox\">";
						text += "	<input type=\"text\" id=\"userTagInput\" placeholder=\"技能/领域/综合能力标签\"><a href=\"javascript:void(0);\" class=\"ok\">确定</a><a href=\"javascript:void(0);\" class=\"cancel\">取消</a>";
						text += "</div>";
					text += "</div>";
				}
				
				text += "<div class=\"tagDialogBtns\">";
				text += "<div class=\"ok\">保存</div><div class=\"cancel\">取消</div>";
				text += "已设置（<span class=\"tagCount\">"+res.tag_count+"</span>/3）";
				text += "</div>";
		
				tagDialog.setContent(text).show()
				countTags()
			},'json')
			//选中标签
			
		
		}
		$('.tagDialog').on('click','.jobTagLabel',function(){
			if($(this).hasClass('cur')){
				$(this).removeClass('cur')
			}else{
				if($('.tagDialog .cur').length>=3){
					confirmBox.timeBomb('最多添加3个职业标签',
					{name: 'warning',
						width: 'auto'
					})
					return false
				}else{
					$(this).addClass('cur')
				}
			}
			countTags()
		})
		//一共选择了多少个标签
		function countTags(){
			$('.tagCount').html($('.tagDialog .cur').length)
		}
		//显示输入框
		$('.tagDialog').on('click','.addUserTagBtn',function(){
			$('.userTagInputBox').show()
		})
		
		$('.tagDialog').on('click','.userTagBox .cancel',function(){
			$('.userTagInputBox').hide()
		})
		//添加自定义标签
		$('.tagDialog').on('click','.userTagBox .ok',function(){
			if($('.tagDialog .cur').length>=3){
				confirmBox.timeBomb('最多添加3个职业标签',
				{name: 'warning',
					width: 'auto'
				})
				return false
			}
			if($('.tagDialog .userTagBox .jobTagLabel').length>=3){
				confirmBox.timeBomb('最多添加3个自定义标签' ,{
							name: 'warning',
							width: 'auto'
						})
				return false
			}
			var name=$("#userTagInput").val();
			name=name.replace(/(^\s*)|(\s*$)/g,'')
			if(name.length==0){
				confirmBox.timeBomb('请输入自定义标签' ,{
							name: 'warning',
							width: 'auto'
						})
				return false
			}
			if(name.length>10){
				confirmBox.timeBomb('自定义标签最多10个字' ,{
							name: 'warning',
							// timeout: 1000,
							width: 'auto'
						})
				return false
			}
			$.post('/job/AddJobsortSkillTagCustom',
			{tag_name:name,jobsort_id:$('#main_jobsort').val()},
			function(res){
				if(res.status){
					addUserTag(res.data.id,name)
					// confirmBox.alert('添加成功')
					countTags()
					$("#userTagInput").val('')
				}else{
					confirmBox.timeBomb(res.msg ,{
								name: 'warning',
								// timeout: 1000,
								width: 'auto'
							})
				}
				
			},'json')
			
		})
		//删除自定义标签
		$('.tagDialog').on('click','.userTagBox .jobTagLabel i',function(){
			var $this=$(this);
			$.post('/job/DelJobsortSkillTagCustom',
			{tag_id:$this.parent('.jobTagLabel').attr('data-id')},
			function(res){
				$this.parent('.jobTagLabel').remove()
				// addUserTag(0,$('#addUserTag').val())
				// confirmBox.alert('删除成功')
				countTags()
			},'json')
			return false
		})
		//添加自定义标签
		function addUserTag(id,text){
			$('.userRight').append('<em data-id='+id+' data-name='+text+' data-type="3" class="jobTagLabel cur">'+text+'<i>×</i></em>')
		}
		
		// 弹框确定按钮
		$('.tagDialog').on('click','.tagDialogBtns .ok',function(){
			var selectedTags=[];
			$('.tagDialog .cur').each(function(i,e){
				selectedTags.push({
					id:$(e).attr('data-id'),
					tag_name:$(e).attr('data-name'),
					tag_type:$(e).attr('data-type'),
				})
			})
			if(selectedTags.length > 0){
				$('#hddJobTags').val(JSON.stringify(selectedTags))
				$('#jobTags ul').html(tag2html(selectedTags,true))
			}else{
				$('#hddJobTags').val('');
				$('#jobTags ul').html('<em style="line-height: 27px; color: #ccc; padding-left: 8px;">填写岗位标签精确推送给求职者</em>');
			}
			$('.tagDialog .ui_dialog_close').click()
		})
		
		$('.tagDialog').on('click','.tagDialogBtns .cancel',function(){
			$('.tagDialog .ui_dialog_close').click()
		})
		//删除职位类别
		$('#dropJobsort2').on('click','.close',function(){
			$('#myJobSortId').val('')
			$('.jobTagsTxt div').html('填写职业标签能提升简历推荐的精确性')
			$('#hddJobTags').val('')
		})
})

function findJobName(id){
	var name="";
	$.each(hbjs.jobSortData,function(i1,e1){
		$.each(e1.sub,function(i2,e2){
			$.each(e2.sub,function(i3,e3){
				if(e3.id==id){
					name=e3.name;
					return false
				}
			})
		})
	})
	return name
}	

function tag2html(obj,close){
	var tempTagHtml="";
	close=false;
	$.each(obj,function(i,e){
		tempTagHtml+='<li data-id="'+e.id+'" data-type="'+e.tag_type+'" data-name="'+e.tag_name+'"><a href="javascript:void(0);">'+e.tag_name+(close?"<span class='close'>×</span>":"")+'</a></li>';
	})
	return tempTagHtml
}
function tag2json($container){
	var json=[];
	$container.find('em').each(function(i,e){
		json.push({
			id:$(e).attr('data-id'),
			tag_type:$(e).attr('data-type'),
			tag_name:$(e).attr('data-name')
		})
	})
	return json;
}