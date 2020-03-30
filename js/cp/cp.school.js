function init_school(id,second_name,second_value,get_url){
	if(!$('#'+id)) return;
	
	if($('#'+id).val()!=""){
		//$('#divSchoolName').show();
		$.post(get_url,{school_type:$('#'+id).val()},function(json){
			if(json.error){
				alert(json.error);
				return; 
			}
			//alert($('#'+id).parent().find('.'+second_name).length);
			
			$('#'+id).parent().find('.'+second_name).remove();

			var options = "<option value=''>请选择学校名称</option>";
			var school_arr = json.school_arr;
			for(var i=0;i<school_arr.length;i++){
				if (second_value == school_arr[i].school_id){
					options = options + "<option value='"+school_arr[i].school_id+"' selected>"+school_arr[i].school_name+"</option>";
				}else{
					options = options + "<option value='"+school_arr[i].school_id+"'>"+school_arr[i].school_name+"</option>";
				}
			}
			$('#'+id).after($('<select id="'+second_name+'" name="'+second_name+'" class="'+second_name+'">'+options+'</select>'));
			
		},'json');
	}
	$('#'+id).change(function(){
		if($(this).val()!=""){
			//$('#divSchoolName').show();
			$.post(get_url,{school_type:$(this).val()},function(json){
				if(json.error){
					alert(json.error);
					return; 
				}
				//alert($('#'+id).parent().find('.'+second_name).length);
				
				$('#'+id).parent().find('.'+second_name).remove();

				var options = "<option value=''>请选择学校名称</option>";
				var school_arr = json.school_arr;
				for(var i=0;i<school_arr.length;i++){
					if (second_value == school_arr[i].school_id){
						options = options + "<option value='"+school_arr[i].school_id+"' selected>"+school_arr[i].school_name+"</option>";
					}else{
						options = options + "<option value='"+school_arr[i].school_id+"'>"+school_arr[i].school_name+"</option>";
					}
				}
				$('#'+id).after($('<select id="'+second_name+'" name="'+second_name+'" class="'+second_name+'">'+options+'</select>'));
				
			},'json');
		}else{
			$('#'+id).nextAll().find('#'+second_name).remove();
		}
	});
	
}