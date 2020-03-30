/************************************By Zheng Han Lin*****************************\
| 函数名称：check_all(form,id) check_item(form,id) check_un(form,id) check_num(form,id)
| 函数功能：实现指定名称的一组checkbox的全选/反选功能，需要传入表单和checkbox的名称
| 调用方式：见实例
| 作者：郑汉林 cqhanlin@163.com
| 创建日期：2004年7月16日
|*************************************************
| 修改者：
| 修改日期：
| 修改功能：
\*********************************************************************************/
function check_all(id)
{
	var checkAll = $('#checkAll').is(':checked'); 
	if(checkAll){
		$('input[name='+id+']').attr('checked','checked');
	}else{
		$('input[name='+id+']').removeAttr('checked');
	}
}

function check_item(id)
{
	var checkAll = true;
	$('input[name='+id+']').each(function(i){
		if(!$(this).is(':checked')){
			checkAll = false;
		}
	});
	if(checkAll){
		$('#checkAll').attr('checked','checked');
	}else{
		$('#checkAll').removeAttr('checked');
	}
}

function check_un(id)
{
	$('input[name='+id+']').each(function(i){
		if($(this).is(':checked')){
			$(this).removeAttr('checked');
		}
		else{
			$(this).attr('checked','checked');
		}
	});
	check_item(id);
}

function check_num(id)
{
	return $('input[name='+id+']:checked').length;
}