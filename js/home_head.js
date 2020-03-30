      $(function(){
            checkUser();
            
            //浏览按纽事件
            $("#btnNav,#boxNav").mouseleave(function(e){	
				var  target = $(e.relatedTarget);
                if((!target.is('#boxNav'))&&target.closest('#boxNav').length<=0){
					$('#boxNav').hide();
				};
            });
            
            $("#btnNav").mouseenter(function(){
                $("#boxNav").show();
            });
            
            //类型事件
            $("#btnShowType").click(function(){
                $("#btnSelectType").show();
            });
            
            $("#btnSelectType,#btnShowType").mouseleave(function(e){
            	var  target = $(e.relatedTarget);
                if((!target.is('#btnSelectType'))&&target.closest('#btnSelectType').length<=0){
                	$("#btnSelectType").hide();
                }
            });
           
            //搜索类型切换事件
            $('#btnSelectType a').click(function(){
            	$('#inpType').html($(this).html());
            	$('#inpBox span').hide();
            	$('#inpBox input').val('请输入关键词').css("color","#999");
            	$('#inpBox span').eq($(this).index()).show();
            	
            	if($("#hddSearchType").length>0){
            		if($(this).html()=='搜公司'){
            			$("#hddSearchType").val('company');
            		}
            		if($(this).html()=='找工作'){
            			$("#hddSearchType").val('job');
            		}
            	}
            	
            	$("#btnSelectType").hide();
            	return false;
            });
            
            //文本框焦点事件
            $(".tSchText").focus(function(){
                var searchText = $.trim($(this).val());
                if(searchText=="请输入关键词"){
                    $(this).val("");
                }else{
                	 $(this).css("color","#424242");
                }
            });
            
            $(".tSchText").blur(function(){
               var searchText = $.trim($(this).val());
                if(searchText=="请输入关键词" || searchText==""){
                    $(this).val("请输入关键词").css('color',"#999");
                }else{
                	 $(this).css("color","#424242");
                }
            });
            
            //搜职位
            $('#btnJobSearch').click(function(){
            	var keyword = $("#tSchJobText").val();            	
            	var locationurl = "/jobsearch";            	
            	if(keyword != "" && keyword !='请输入关键词'){
            		locationurl += "/?key="+encodeURIComponent(keyword);
                }
            	else{
                	locationurl = "/jobsearch/";
                }
            	location.href = locationurl;
                return false;
            });
            
            $('#btnJobSearchDo').click(function(){
            	if($('#conditon_keyword')){
            		var keyword = $("#tSchJobTextDo").val();
            		$('#txtKeyword').val(keyword);
            		$('#conditon_keyword').click();
            	}
                return false;
            });
            
            $("#tSchJobText").keydown(function(e){            	
            	
            	if($(this).val() == '请输入关键词'){
            		$(this).css("color","#999");
                }
                else{
                	$(this).css("color","#424242");
                }
            	
            	if(e.keyCode == 13){
                    $("#btnJobSearch").click();
                }
            });
            
            $("#tSchJobTextDo").keydown(function(e){            	
            	
            	if($(this).val() == '请输入关键词'){
            		$(this).css("color","#999");
                }
                else{
                	$(this).css("color","#424242");
                }
            	
            	if(e.keyCode == 13){
                    $("#btnJobSearchDo").click();
                }
            });
            
            // 搜公司职位
            $('#btnComSearch').click(function(){    
            	var keyword = $("#tSchComText").val();            	
            	var locationurl = "/jobsearch";            	
            	if(keyword != "" && keyword !='请输入关键词'){
            		locationurl += "/?params=u2&key="+encodeURIComponent(keyword);
                }
            	else{
            		locationurl += "/?params=u2"
                }
            	location.href = locationurl;
                return false;
            });	           
            $("#tSchComText").keydown(function(e){            	
            	
            	if($(this).val() == '请输入关键词'){
            		$(this).css("color","#999");
                }
                else{
                	$(this).css("color","#424242");
                }
            	
            	if(e.keyCode == 13){
                    $("#btnComSearch").click();
                }
            });
            
            
            //查薪资
            $('#btnSalarySearch').click(function(){
            	var keyword = $("#tSchSalText").val();           	
		    	var locationurl = "/jobsearch";            	
		    	if(keyword != ""){
		    		locationurl += "/?params=u3&key="+encodeURIComponent(keyword);
		        }
		    	else{
		        	locationurl += "/?searchtype=fulltext";
		        }
		    	location.href = locationurl;
		        return false;
            });
            
            $("#tSchSalText").keydown(function(e){            	
            	if($(this).val() == '请输入关键词'){
            		$(this).css("color","#999");
                }
                else{
                	$(this).css("color","#424242");
                }
                if(e.keyCode == 13){
                    $("#btnSalarySearch").click();
                }
            });
            
            //职位自动补全
            $("#tSchJobText").autocomplete("/index/autocomplete",{
            	resultsClass:"tSchJobAut",
            	max: 12,
            	minChars: 1,
            	matchContains: true,
            	scroll:false,
            	width:269,
            	autoFill: false,
            	dataType:"json",
            	extraParams:{type:"job",key:escape($.trim($("#tSchJobText").val()))},
            	formatItem:function(row){
            		//return '<a href="/job/search/keyword-'+row.item+'"><span class="autTempJob"><span class="autTempL">'+row.item+'</span><span class="autTempR">共<em>'+row.count+'</em>条</span></span></a>';
            		return '<span class="autTempJob"><span class="autTempL">'+row.item+'</span><span class="autTempR">共<em>'+row.count+'</em>条</span></span>';
            	},
            	formatMatch:function(row){
            		return row.item;
            	},
            	formatResult:function(row){
            		return row.item;
            	}
            }).result(function(event, item){
            	$("#tSchJobText").unbind('keydown');
            	$("#tSchJobText").val(item.item);
            	$('#btnJobSearch').click();
            });
            
            //职位自动补全
            $("#tSchJobTextDo").autocomplete("/index/autocomplete",{
            	resultsClass:"tSchJobAut",
            	max: 12,
            	minChars: 1,
            	matchContains: true,
            	scroll:false,
            	width:269,
            	autoFill: false,
            	dataType:"json",
            	extraParams:{type:"job",key:escape($.trim($("#tSchJobTextDo").val()))},
            	formatItem:function(row){
            		//return '<a href="/job/search/keyword-'+row.item+'"><span class="autTempJob"><span class="autTempL">'+row.item+'</span><span class="autTempR">共<em>'+row.count+'</em>条</span></span></a>';
            		return '<span class="autTempJob"><span class="autTempL">'+row.item+'</span><span class="autTempR">共<em>'+row.count+'</em>条</span></span>';
            	},
            	formatMatch:function(row){
            		return row.item;
            	},
            	formatResult:function(row){
            		return row.item;
            	}
            }).result(function(event, item){
            	$("#tSchJobTextDo").unbind('keydown');
            	$("#tSchJobTextDo").val(item.item);
            	$('#btnJobSearchDo').click();
            });
            
            //单位自动补全
            $("#tSchComText").autocomplete("/index/autocomplete",{
            	resultsClass:"tSchJobAut",
            	max: 7,
            	minChars: 1,
            	isPrevent:false,
            	matchContains: true,
            	scroll:false,
            	width:300,
            	autoFill: false,
            	dataType:"json",
            	extraParams:{type:"company",key:escape($.trim($("#tSchComText").val()))},
            	formatItem:function(row){
            		return '<a target="_blank" href="'+row.company_url+'"><span class="autTempCom"><div class="autTempComL"><div class="comNm">'+row.company_name+'</div><span>'+row.area_name+'</span></div></span></a>';
            	},
            	formatMatch:function(row){
            		return row.company_name;
            	},
            	formatResult:function(row){
            		return row.company_name;
            	}
            }).result(function(event, item){
            	$("#tSchJobText").val(item.item);
            	
            	//location.href = item.company_url;
            	//return false;
            });
             
            
            //登录按纽
            /*$('#btnHeaderLogin').click(function(){
            	$(this).next().show();
            });
            
            $("#btnHeaderLogin,#boxLogin").mouseleave(function(e){	
				var  target = $(e.relatedTarget);
                if((!target.is('#boxLogin'))&&target.closest('#boxLogin').length<=0){
					$('#boxLogin').hide();
				};
            });*/
            
            $(".userOut").click(function(){
                $.ajax({
                    'url':'/index/signOut',
                    'type':'get',
                    'dataType':'json',
                    'success':function(json){
                        if(json.success){
                            $(".login_reg").css("display","block");
                            $(".psnLg,.comLg").css("display","none");
                            $(".panelBox").css("display","none");
                            $.anchorMsg("退出成功",{onclose:function(){
                                if(window.logoutIsRefresh) {
                                    window.location.href = window.location.href; 
                                }
                            }});
                            window.location.reload();
                        }else{
                            $.message("退出失败");
                        }
                    }
                });
                return false;
            });
            
            
            txtWatermark();
        });
      
    
    function checkUser(){
        //判断用户类型
        var type = $.cookie("usertype");
        var isLogin = !!type;
        var userName = decodeURI($.cookie("nickname"));;
        var userID = $.cookie("userid");
        if(!type){
            $(".login_reg").show();
            $("#isLogined").hide();
        }else{
            $(".login_reg").hide();
            $("#isLogined").show();
        }
        if(type=="c"){
            $(".comLg").show();
            $(".login_reg,.psnLg").hide();
           // $(".comUserName").html(userName);
        }else if(type=="p"){
            $(".psnLg").show();
            $(".login_reg,.comLg").hide();
           // $(".psnUserName").html(userName);
            
        }
    }
    
    
    function txtWatermark(){
    	var type = $.trim($("a.searchType").html());    	
    	if(type=='搜公司'){
        	if($('#tSchComText').val() == '请输入关键词'){
            	$('#tSchComText').css("color","#999");
            }
            else{
            	$('#tSchComText').css("color","#424242");
            }
        }
        else if(type=='查工资'){
        	if($('#tSchSalText').val() == '请输入关键词'){
            	$('#tSchSalText').css("color","#999");
            }
            else{
            	$('#tSchSalText').css("color","#424242");
            }
        }
        else {
        	if($('#tSchJobText').val() == '请输入关键词'){
            	$('#tSchJobText').css("color","#999");
            }
            else{
            	$('#tSchJobText').css("color","#424242");
            }
        	
        	if($('#tSchJobTextDo').val() == '请输入关键词'){
            	$('#tSchJobTextDo').css("color","#999");
            }
            else{
            	$('#tSchJobTextDo').css("color","#424242");
            }
        }
    }