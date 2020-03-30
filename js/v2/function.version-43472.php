<?php
/**
 * 获取前端资源文件的版本号
 * yill
 */
$assets = null;

/**
 * 格式 version file="xxx.css" ,文件版本在config/version/version.ini里面定义
 */
function smarty_function_version($params){
	$file_name = $data=isset($params['file'])?$params['file']:'';
	global $assets;
	if(is_null($assets)){
		$assets = SConfig::getConfig('../config/version/version.ini');
//		echo 'load once';
	}
	
	$arr_file_name = explode(',',$file_name);
	if(count($arr_file_name)>1){
		$f = "";
		//$b = "";
		$v = "";
		//$arr_ver = array();
		$int_ver = 0;
		$arr_file = array();
		for($i=0;$i<count($arr_file_name);$i++){
//			if($i==0){
//				if(substr($arr_file_name[$i],strlen($arr_file_name[$i])-3) == '.js'){
//					$b = "js";
//				}
//				else if(substr($arr_file_name[$i],strlen($arr_file_name[$i])-4) == '.css'){
//					$b = "css";
//				}
//			}
			$file_name_temp = trim($arr_file_name[$i]);
			//$file_name_temp = str_replace("\r\n","",$file_name_temp);
			if($assets->$file_name_temp){
				//array_push($arr_ver,$assets->$arr_file_name[$i]->v);
				$int_ver = $int_ver+ $assets->$file_name_temp->v;
				array_push($arr_file,$assets->$file_name_temp->path . $file_name_temp);
			}
		}
		$f = implode(',',$arr_file);
		//$v = substr(base_lib_BaseUtils::md5_16(implode('_',$arr_ver)),0,8);
		$v = $int_ver;
		return base_lib_Constant::STYLE_URL . '/min.js?f='.$f.'&v='.$v;
	}
	else{
		if($assets->$file_name)
			return base_lib_Constant::STYLE_URL . $assets->$file_name->path . $file_name . '?v=' . $assets->$file_name->v;
		else
			return $file_name; 
	}
}

?>
