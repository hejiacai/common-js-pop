$(document).ready(function() {
	/* 轮播 */
	function scrollNews() {
		var jobs = $('.newJobs')
		var scroll = jobs.find("ul:first");
		var lineHeight = scroll.find("li:first").height();
		scroll.animate({ "margin-top": -lineHeight + "px" }, 500, function () {
			scroll.css({ "margin-top": "0px" }).find("li:first").appendTo(scroll);
		});
	}
	setInterval(scrollNews,1500)


	$('#getCode').click(function() {
		var phoneNumber = $('.phoneumber').val().trim()
		var code = $('.msgCode').val().trim()

		/* 验证手机号是否填写 */
		if(!phoneNumber && !code){
			alert('请填写手机号和验证码')
			setTimeout(function(){
				$('.dialog').remove()
			},2000)
			return false
		}

		/* 验证手机号 */
		if(!/^1\d{10}$/.test(phoneNumber)) {
			alert('手机号错误，请重新填写')
			setTimeout(function(){
				$('.dialog').remove()
			},2000)
			return false
		}

		$('.picMsgWrapper').show()
	})



	/* 倒计时 */
	function count(totalTime) {
		$('#getCode').hide()
		$('.count').show()

		$('.count').text(totalTime + 's后重发')
		if(totalTime == 0){
			$('#getCode').show()
			$('.count').hide()
		}else{
			setTimeout(function() {
				totalTime--
				count(totalTime)
			},1000)
		}
	}


})