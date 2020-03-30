      $(function(){
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
                         
            txtWatermark();
        });
      
    
    
    
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
        }
    }