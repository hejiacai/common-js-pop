
	if(getCookieutility == "" || getCookieutility == "undefined"){
		console.log('没得cookie跳转了');
		
  		var cityAry = [
  			{cityName:"重庆",cityLink:"/chongqing/"},
  			{cityName:"江津",cityLink:"/jiangjin/"},
  			{cityName:"永川",cityLink:"/yongchuan/"},
  			{cityName:"璧山",cityLink:"/bishan/"},
  			{cityName:"铜梁",cityLink:"/tongliang/"},
  			{cityName:"合川",cityLink:"/hechuan/"},
  			{cityName:"长寿",cityLink:"/changshou/"},
  			{cityName:"涪陵",cityLink:"/fuling/"},
  			{cityName:"万州",cityLink:"/wanzhou/"},
  			{cityName:"荣昌",cityLink:"/rongchang/"},
  			{cityName:"双桥",cityLink:"/shuangqiao/"},
  			{cityName:"大足",cityLink:"/dazu/"},
  			{cityName:"潼南",cityLink:"/tongnan/"},
  			{cityName:"綦江",cityLink:"/qijiang/"},
  			{cityName:"南川",cityLink:"/nanchuan/"},
  			{cityName:"武隆",cityLink:"/wulong/"},
  			{cityName:"丰都",cityLink:"/fengdu/"},
  			{cityName:"垫江",cityLink:"/dianjiang/"},
  			{cityName:"梁平",cityLink:"/liangping/"},
  			{cityName:"忠县",cityLink:"/zhongxian/"},
  			{cityName:"石柱",cityLink:"/shizhu/"},
  			{cityName:"彭水",cityLink:"/pengshui/"},
  			{cityName:"黔江",cityLink:"/qianjiang/"},
  			{cityName:"酉阳",cityLink:"/youyang/"},
  			{cityName:"秀山",cityLink:"/xiushan/"},
  			{cityName:"开州",cityLink:"/kaizhou/"},
  			{cityName:"云阳",cityLink:"/yunyang/"},
  			{cityName:"奉节",cityLink:"/fengjie/"},
  			{cityName:"巫山",cityLink:"/wushan/"},
  			{cityName:"巫溪",cityLink:"/wuxi/"},
  			{cityName:"城口",cityLink:"/chengkou/"},
  			{cityName:"万盛",cityLink:"/wansheng/"},
  			{cityName:"成都",cityLink:"/cd/"},
  			{cityName:"德阳",cityLink:"/dy/"},
  			{cityName:"绵阳",cityLink:"/my/"},
  			{cityName:"泸州",cityLink:"/luzhou/"},
  			{cityName:"南充",cityLink:"/nanchong/"},
  			{cityName:"贵阳",cityLink:"/gy/"}
  		];
  		var homeLink = homeLinkCity;
  		
        //创建百度地图控件
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                //以指定的经度与纬度创建一个坐标点
                var pt = new BMap.Point(r.point.lng,r.point.lat);
                //创建一个地理位置解析器
                var geoc = new BMap.Geocoder();
                geoc.getLocation(pt, function(rs){//解析格式：省，市，区，街道，门牌号
                    var addComp = rs.addressComponents;
                    //哪个省
                    var areaSlicProvince= addComp.province;
                    var strAreaSlicProvince = areaSlicProvince.substring(0,2);
                    //市
                    var areaSlic= addComp.city;
                    var strAreaSlic = areaSlic.substring(0,2);
                    //区县
                    var areaCounty= addComp.district;
                    var strAreaCounty = areaCounty.substring(0,2);
                    for(var i=0;i<cityAry.length;i++){
                    	
                    	
                	//判断是不是我们做的几个省
                    if(strAreaSlicProvince == "重庆" || strAreaSlicProvince == "四川" || strAreaSlicProvince == "贵州"){
                    	//判断是在重庆
                    	if(strAreaSlicProvince == "重庆" && cityAry[i].cityName == strAreaCounty){
                    		console.log('进重庆来了');
                    		window.location.href= homeLink + cityAry[i].cityLink;
                    		cookieutility.set('cityCookiex',true);
	                    	return false;
	                    }else if(strAreaSlicProvince == "四川" && cityAry[i].cityName == strAreaSlic){
                    		console.log('进四川来了');
	                    	window.location.href= homeLink + cityAry[i].cityLink;
	                    	cookieutility.set('cityCookiex',true);
	                    	return false;
	                    }else if(strAreaSlicProvince == "贵州"){
                    		console.log('进贵阳来了');
	                    	window.location.href= homeLink + "/gy/";
	                    	return false;
	                    	cookieutility.set('cityCookiex',true);
	                    }else{
	                    	console.log('一个都不行，我回主站了');
	                    	window.location.href= homeLink;
	                    	cookieutility.set('cityCookiex',true);
	                    }
                    }else{
                    	console.log('【三个省】都未匹配到跳回到（CQ）');
                    	window.location.href= homeLink;
                    	cookieutility.set('cityCookiex',true);
                    }
                    	
                }
                    
                   
                });
                return false;
            }
            else {
            	console.log('没有定位到，出错了。我还是回首页');
                window.location.href= homeLink;
                cookieutility.set('cityCookiex',true);
            }
        },{enableHighAccuracy: true})//指示浏览器获取高精度的位置，默认false
}else{
	console.log('有cookie不跳转了');
}
