hbjs.use('@checkLogin, @confirmBox', function(m){

          var checkLogin = m['product.checkLogin'];
          checkLogin.isLogin('ajaxLoginCallback');
        $('.ui_dialog_close').hide();
        $('.ui_dialog_title').html('启航青春&nbsp;暑期实习双选会')
        var T=setInterval(function(){
        	if($('.formBtn a').length>0){
        		$('.formBtn a').html('进入招聘会')
        		$('#chkSave').next().html('提示：可用汇博网求职者登录')
        		clearInterval(T)
        	}
        },100)
    })