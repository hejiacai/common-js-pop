var thirdSelect = {
    html:'<div class="selectParts" style="background:#fff;" id="thirdSelect">'
                +'<div class="selectMainTop">'
                +'<div class="psgSeekBg psgPrecise navBar">'
                    +'<span class="title"></span>'
                    +'<a href="javascript:;" class="getBack icon-svg10" id="back"></a>'
                    +'<a href="javascript:;" class="seekBtn" id="saveData">确定</a>'
                +'</div>'
                +'<div style="padding:10px 10px 0;display: none;justify-content: space-between;align-items: center;" class="searchBar">'
                    +'<span class="icon-chat_left backIcon" style="font-size: 14px;"></span>'
                    +'<div style="width: 85%;background: rgb(246,247,249);height: 30px;display: flex;align-items: center;border-radius: 30px;padding: 0 10px;">'
                        +'<span class="icon-home_navigation_search2x" style="font-size: 16px;"></span>'
                        +'<input placeholder="请输入职位名称" class="searchInput" style="flex:1;border: none;background: rgb(246,247,249);margin-left: 10px;" maxlength=10/>'
                    +'</div>' 
                    +'<span class="saveBtn">保存</span>'
                +'</div>'  
                +'<div class="ptworkPlace" style="display:none">'
                    +'<p>已选：</p>'
                    +'<div id="hasSelected">'
                    +'</div>'
                +'</div>'
                +'</div>'
                +'<ul class="job_Type_All psgMPartsx" style="padding: 0 15px;margin-top:130px;" id="job_Type_All">'
                +'</ul>'
                +'<div style="display: flex;align-items: center;justify-content: space-between;padding:20px;border-bottom:5px solid rgb(246,247,249);" class="noMessage">'
                    +'<div style="color: #8f8f8f;max-width:80%;text-align:center;margin-left:25px;" class="no_message"></div>'
                    +'<div style="width: 50px;height: 26px;text-align: center;line-height: 26px;color: #fff;background: #0ddfce;border-radius: 4px;font-size: 14px;" class="submiteBtn">提交</div>'
                +'</div>'  
                +'<ul class="psgMParts psgMPartsx psg_MPar_ts" style="display:block; background:#fff;" id="mainData">'
                +'</ul>'
            +'</div>',
    loadinghtml:'<div id="thirdloading11"><div class="m_m_master" style="display:none;z-index:79;filter: alpha(opacity=10);opacity:0.1"></div>'
                +'<div class="juhua" style="display:none;z-index:80"><img src="//assets.huibo.com/img/m/new_person/loadingb.gif"></div></div>',
    selectDataName:[],
    selectMax:5,
    selectDataValue:[],
    dataCache:[],
    selectDataAll:[],
    dataurl:"",//post url
    param:"",//参数 不用
    title:"",
    bindValueElement:"",
    bindNameElement:"",
    tempdata:[],
    beginData:"",//初始值
    time:0,
    inputVal:'',
    isShowSearch:false,
    isReq:false,
    hidSubmitButton:false, //隐藏确定按钮
    hidHasSelected:false, //隐藏已选择框
    canEmpty:false,
    type:"multiple",  //multiple 多选  single 单选  未完成
    init:function(hasSelectData,title,dataurl,param,bindValueElement,bindNameElement,callBack,saveCallBack){
        var data;
        
        function isType(type) {
            return function(obj) {
                return {}.toString.call(obj) == "[object " + type + "]";
            }
        }
        var isObject = isType('Object');
        if(isObject(hasSelectData)){
            this.selectMax = hasSelectData.selectMax;
            data = hasSelectData.data;
        } else {
            data = hasSelectData;
        }
        $("body").append(this.html);
        $("body").append(this.loadinghtml);
        if(this.hidSubmitButton==true){
            $("#thirdSelect #saveData").hide();
        }
       // this.bindHasSelect(hasSelectData,bindValueElement,bindNameElement);
        this.bindHasSelect(data,bindValueElement,bindNameElement);
        this.dataurl = dataurl;
        this.param = param;
        this.title = title;
        this.bindValueElement = bindValueElement;
        this.bindNameElement = bindNameElement;
        this.bindSelectData(dataurl,this.beginData);
        this.bindClick(callBack,saveCallBack);
        $("#thirdSelect").find(".title").html(title);
        $("#thirdSelect").stop().animate({width:"100%"},200);
        $("#thirdSelect .selectMainTop").stop().animate({width:"100%"},200);
        //去掉页面的滚动条
        $('.noMessage').hide()
    },
    showSearchBar:function(){
        var _self = this
        _self.isShowSearch = true
        $('.noMessage').hide()
        $('.navBar').hide()
        $('.searchBar').css('display','flex')
        $('.searchBar').show()
        $('.searchInput').on('input',()=>{
            let val = $('.searchInput').val()
            if(val == _self.inputVal){     //是否请求同样的值
                _self.isReq = true
                $('.submiteBtn').css('background','#ccc')
            }else{
                _self.isReq = false
                $('.submiteBtn').css('background','#0ddfce')
            }
            var d = this.selectDataValue;
            if(val.length>0){
                $.post("/jobexcept/getjobsorts", 
                    {station:val}, 
                    function(res){
                        let html = ''
                        console.log(typeof res.data)
                        
                        if(res.data){                      //<a style="font-size: 14px;">${res.data[i].jobsort_name}</a>
                        var re = val.replace(/[\\\.\+\*^$(){}\[\]-]/gi,'\\$1')
                        let regExp = new RegExp(''+re+'(?=[^>]*(<|$))','gi')
                            for(let i in res.data){
                                if(d.indexOf(i)>=0){
                                    html +=`<li style="padding: 15px 0;border-bottom: 1px solid #f1f1f1;color: #333;position:relative;" class="hasSelect cut"
                                            data-value=${res.data[i].jobsort} data-all=${res.data[i].isAll} >
                                            <a style="font-size: 14px;"><div class="innerWord">`
                                        html +=res.data[i].jobsort_name.replace(regExp,"<span style='color: #0ddfce;font-size:14px;'>"+val+"</span>")
                                        html +=   `</div><div style="font-size: 14px;margin-top: 10px;">`
                                        html += res.data[i].top_jobsort_name.replace(regExp,"<span style='color: #0ddfce;font-size:14px;'>"+val+"</span>")
                                        html +='-'
                                        html +=res.data[i].sub_jobsort_name.replace(regExp,"<span style='color: #0ddfce;font-size:14px;'>"+val+"</span>")
                                        html +=` </div style="font-size: 16px;">
                                            <i class="icon-uniE602"></i></a>
                                        </li>`
                                }else{
                                    html +=`<li style="padding: 15px 0;border-bottom: 1px solid #f1f1f1;color: #333;position:relative;" class="notSelect"
                                            data-value=${res.data[i].jobsort} data-all=${res.data[i].isAll} >
                                            <a style="font-size: 14px;"><div class="innerWord">`
                                        html +=res.data[i].jobsort_name.replace(regExp,"<span style='color: #0ddfce;font-size:14px;'>"+val+"</span>")
                                        html +=`</div><div style="font-size: 14px;margin-top: 10px;">`
                                        html += res.data[i].top_jobsort_name.replace(regExp,"<span style='color: #0ddfce;font-size:14px;'>"+val+"</span>")
                                        html +='-'
                                        html +=res.data[i].sub_jobsort_name.replace(regExp,"<span style='color: #0ddfce;font-size:14px;'>"+val+"</span>")
                                        html +=` </div style="font-size: 16px;">
                                            <i class="icon-uniE602"></i></a>
                                        </li>`
                                    
                                }
                            }
                            $('.noMessage').hide()
                            $('.psgMParts').hide()
                        }else{
                            $('.no_message').html(`<div>没有找到相关职位，请在下方类别中选择或</div>反馈<span style="color:#0ddfce;">"${val}"</span>给工作人员添加`)
                            html=''
                            $('.psgMParts').show()
                            $('.noMessage').show()
                            $('.psg_MPar_ts').css('margin-top','0px')
                        }
                        $('.job_Type_All').show()
                        $('.job_Type_All').html(html)
                    }
                ,'json')
            }else{
                $('.psgMParts').show()
                $('.job_Type_All').hide()
                $('.noMessage').hide()
            }
            
        })
        $('.submiteBtn').click(function(){
            let val = $('.searchInput').val();
            if(!_self.isReq&&val.length<=10){
                $.post("/jobexcept/add", 
                    {station:val}, 
                    function(res){
                        let data = JSON.parse(res)
                        if(data.status){
                            alert("提交成功，客服将酌情增加该职位")
                            $('.submiteBtn').css('background','#ccc')
                            _self.inputVal = val
                            _self.isReq = true
                        }
                    }
                )
            }
            if(val.length>10){
                alert("期望职位名称不能超过10个字")
            }
        })
        //保存数据
        $("#thirdSelect .saveBtn").click(function(){
            var bindNameElement = _self.bindNameElement;
            var bindValueElement = _self.bindValueElement;
            let value = []
            let name = []
            for(let i = 0;i<_self.selectDataAll.length;i++){
                value.push(_self.selectDataAll[i].value)
                name.push(_self.selectDataAll[i].name)
            }
            if(_self.canEmpty){

            }else{
              if(_self.selectDataAll.length<=0){
                  alert("请选择"+_self.title);return;
              }
            }
            $(bindValueElement).val(value.join(","));
            $(bindNameElement).html(name.join(",")).removeClass("gray").addClass("green");
              if(typeof(callBack) != "undefined"){
                  callBack();
              }
              if(typeof(saveCallBack) != "undefined"){
                  eval(saveCallBack+"()");
              }
            _self.destroy();
        });
        $("#thirdSelect .job_Type_All .hasSelect").live("click",function(e){
            e.preventDefault();
            var v = $(this).attr("data-value");
            var name = $(this).find('.innerWord')[0].innerText
            console.log($(this).find('.innerWord')[0].innerText)
            var isAll = $(this).attr("data-all");
            $(this).removeClass("hasSelect").addClass("notSelect");
            $(this).removeClass("cut");
            if(isAll ==1){
                //后面 所有的 都改变
                $(this).siblings().removeClass("cut");
                $(this).siblings().each(function(){
                    $(this).find("a").addClass("notSelect");
                });
            }
             _self.deleteData(v,name,isAll);
            _self.refreshTop(isAll,v);
        })

        $("#thirdSelect .job_Type_All .notSelect").live("click", function (e) {
            e.preventDefault();
            var isAll = $(this).attr("data-all")
            var v = $(this).attr("data-value")
            var name = $(this).find('.innerWord')[0].innerText
            console.log($(this).find('.innerWord')[0].innerText)
            $(this).addClass("cut");
            $(this).removeClass("notSelect").addClass("hasSelect");
            if (isAll == 1) {
                //后面 所有的 都改变
                $(this).siblings().addClass("cut");
                $(this).siblings().each(function () {
                    $(this).removeClass("notSelect").removeClass("hasSelect");
                });
            }
            _self.addData(v, name, isAll);
            _self.refreshTop(isAll, v);
            if (_self.selectDataAll.length > _self.selectMax) {
                $(this).click();
                alert("最多只能选择" + _self.selectMax + "个");
                return;
            }
        })

    },
    showLoadingOne:function(z_index_m,z_index_j){
        if(z_index_m == undefined ||z_index_m ==""){
            z_index_m = 79;
        }
        if(z_index_j == undefined ||z_index_j ==""){
            z_index_j = 80;
        }
        $("#thirdloading11 .m_m_master").show().css({"z-index":z_index_m}); 
        $("#thirdloading11 .juhua").show().css({"z-index":z_index_j});
    },
    closeLoadingOne:function(){
        $("#thirdloading11 .m_m_master").hide();
        $("#thirdloading11 .juhua").hide();
    },
    bindClick:function(callBack,saveCallBack,backCallBack){
            var _self = this;
        $("#thirdSelect #mainData .canClick").live("click",function(){
            var v = $(this).attr("data-value");
            _self.bindSelectData(_self.dataurl,v);
        }); 
        //保存数据
          $("#thirdSelect #saveData").click(function(){
              var bindNameElement = _self.bindNameElement;
              var bindValueElement = _self.bindValueElement;
              if(_self.canEmpty){

              }else{
                if(_self.selectDataName.length<=0 || _self.selectDataValue<=0){
                    alert("请选择"+_self.title);return;
                }
              }
              $(bindValueElement).val(_self.selectDataValue.join(","));
              $(bindNameElement).html(_self.selectDataName.join(",")).removeClass("gray").addClass("green");
                if(typeof(callBack) != "undefined"){
                    callBack();
                }
                if(typeof(saveCallBack) != "undefined"){
                    eval(saveCallBack+"()");
                }
              _self.destroy();
          });
        //不限
        $("#thirdSelect #mainData .select_null").live("click",function(){
            var bindNameElement = _self.bindNameElement;
            var bindValueElement = _self.bindValueElement;
            $(bindValueElement).val($(this).attr("data-value"));
             var name = $(this).html();
            $(bindNameElement).html(name).removeClass("green").addClass("gray");
            
            if(typeof(callBack) != "undefined"){
                callBack();
            }
            _self.destroy();
        });
        $("#thirdSelect #mainData .hasSelect").live("click",function(){
            var v = $(this).attr("data-value");
            var name = $(this).html();
            var isAll = $(this).attr("data-all");
           
            $(this).removeClass("hasSelect").addClass("notSelect");
            $(this).parent("li").removeClass("cut");
            if(isAll ==1){
                //后面 所有的 都改变
                $(this).parent("li").siblings().removeClass("cut");
                $(this).parent("li").siblings().each(function(){
                    $(this).find("a").addClass("notSelect");
                });
            }
             _self.deleteData(v,name,isAll);
            _self.refreshTop(isAll,v);
            if(_self.isShowSearch){
                $('.psg_MPar_ts').css('margin-top','0px')
            }
      });
      $(".m_m_master").live("click",function(){
          _self.closeLoadingOne();
      })
        $("#thirdSelect #mainData .notSelect").live("click", function () {
            
            var isAll = $(this).attr("data-all");
            var v = $(this).attr("data-value");
            var name = $(this).html();

            $(this).parent("li").addClass("cut");
            $(this).removeClass("notSelect").addClass("hasSelect");
            if (isAll == 1) {
                //后面 所有的 都改变
                $(this).parent("li").siblings().addClass("cut");
                $(this).parent("li").siblings().each(function () {
                    $(this).find("a").removeClass("notSelect").removeClass("hasSelect");
                });
            }
            _self.addData(v, name, isAll);
            _self.refreshTop(isAll, v);
            if (_self.selectDataAll.length > _self.selectMax) {
                $(this).click();
                alert("最多只能选择" + _self.selectMax + "个");
                return;
            }
            if(_self.isShowSearch){
                $('.psg_MPar_ts').css('margin-top','0px')
            }
        });
        $("#thirdSelect #hasSelected em").live("click",function(e){
            e.preventDefault();
              var v = $(this).parent("span").attr("data-selectid");
              var name = $(this).parent("span").attr("data-selectname");
              //去掉对应的class
              var flag = false;
              $("#thirdSelect .job_Type_All li").each(function(event){
                  if($(this).attr("data-value")==v && $(this).attr("data-all")==1){
                      flag = true;
                      $(this).removeClass("cut");
                      $(this).removeClass("hasSelect").addClass("notSelect");
                      return;
                  }
                  if($(this).attr("data-value")==v || flag == true){
                      $(this).removeClass("cut");
                      $(this).removeClass("hasSelect").addClass("notSelect");
                  }
              });
              if(_self.isShowSearch){
                  
                  document.getElementById('mainData').style.marginTop='0px'
                  
                $('.psg_MPar_ts').css('margin-top','0px')
              }
              var isAll = flag?1:0;
                _self.deleteData(v,name,isAll);
               _self.refreshTop(isAll,v);
        });
      $("#thirdSelect #hasSelected em").live("click",function(e){
          e.preventDefault();
            var v = $(this).parent("span").attr("data-selectid");
            var name = $(this).parent("span").attr("data-selectname");
            //去掉对应的class
            var flag = false;
            $("#thirdSelect #mainData li a").each(function(event){
                if($(this).attr("data-value")==v && $(this).attr("data-all")==1){
                    flag = true;
                    $(this).parent("li").removeClass("cut");
                    $(this).removeClass("hasSelect").addClass("notSelect");
                    return;
                }
                if($(this).attr("data-value")==v || flag == true){
                    $(this).parent("li").removeClass("cut");
                    $(this).removeClass("hasSelect").addClass("notSelect");
                }
            });
            var isAll = flag?1:0;
              _self.deleteData(v,name,isAll);
             _self.refreshTop(isAll,v);
            if(_self.isShowSearch){
                $("#thirdSelect #mainData").css({"margin-top":'0px'});
              $('.psg_MPar_ts').css('margin-top','0px')
            }
      });
      $("#thirdSelect #back").live("click",function(){
          var data = _self.tempdata;
          if(data.length==3){
                var v = data[1] =="top" ?"":data[1];
                _self.tempdata.pop();
            _self.bindSelectData(_self.dataurl,v);
          }else if(data.length==2){
              var v = data[0] =="top" ?"":data[0];
                _self.tempdata.pop();
            _self.bindSelectData(_self.dataurl,v);
          }else if(data.length==1 || data.length==0){
              _self.destroy();
          }
      });
      $("#thirdSelect .backIcon").live("click",function(){
          var data = _self.tempdata;
          if(data.length==3){
                var v = data[1] =="top" ?"":data[1];
                _self.tempdata.pop();
            _self.bindSelectData(_self.dataurl,v);
          }else if(data.length==2){
              var v = data[0] =="top" ?"":data[0];
                _self.tempdata.pop();
            _self.bindSelectData(_self.dataurl,v);
          }else if(data.length==1 || data.length==0){
              _self.destroy();
          }
      });
    },
    
    deleteData:function(v,name,isAll){
        //删除 保存着的值
        if(isAll ==1){
            var s = "";
            if(v.indexOf("d")==0){
                s = v.slice(1,3);
            }else{
                s = v.slice(0,2);
            }
            var data = this.selectDataAll;
            var len = data.length;
            var delete_arr = [];
            for(var i=0;i<len;i++){
                var n = data[i].value.slice(0,2);
                if(data[i].value == v || n==s){
                    delete_arr.push(data[i].value)
                }
            }
            for(var k =0;k<delete_arr.length;k++){
               var index_v = this.selectDataValue.indexOf(delete_arr[k]);
                if(index_v>=0){
                    this.selectDataValue.splice(index_v,1);
                     this.selectDataName.splice(index_v,1)
                }
                for(var m=0;m<data.length;m++){
                    if(data[m].value==delete_arr[k]){
                        data.splice(m,1);
                    }
                }
            }
            this.selectDataAll  = data;
            let data_value = []
            for(let j=0;j<this.selectDataAll.length;j++){
                data_value.push(this.selectDataAll[j].value)
            }
            
            for(var i =0;i<data_value.length;i++){
                var n = data_value[i].slice(0,2);
                if(data_value[i] ==v || n==s){
                    this.selectDataValue.splice(i,1);
                    this.selectDataName.splice(i,1);
                    this.selectDataAll.splice(i,1);
                }
            }
            return;
        }
        
        var i = this.selectDataValue.indexOf(v);
        this.selectDataValue.splice(i,1);
        var k = this.selectDataName.indexOf(name);
        this.selectDataName.splice(k,1);
        var data = this.selectDataAll;
        for(var i=0;i<data.length;i++){
            if(data[i].value == v){
                data.splice(i,1);
            }
        }
        this.selectDataAll  = data;
    },
    addData:function(v,name,isAll){
       if(isAll==1){
           var s = "";
            if(v.indexOf("d")==0){
                s = v.slice(1,3);
            }else{
                s = v.slice(0,2);
            }
            var data = this.selectDataAll;
            var len = data.length;
            var delete_arr = [];
            for(var i = 0; i< len; i++){
                var n = data[i].value.slice(0,2);
                if (n == s){
                  delete_arr.push(data[i].value);
                }
            }
            for(var k =0;k<delete_arr.length;k++){
                var index_v = this.selectDataValue.indexOf(delete_arr[k]);
                var index_n = this.selectDataName.indexOf(delete_arr[k]);
                if(index_v>=0){
                    this.selectDataValue.splice(index_v,1);
                    this.selectDataName.splice(index_v,1)
                }
                for(var m=0;m<data.length;m++){
                    if(data[m].value==delete_arr[k]){
                        data.splice(m,1);
                    }
                }
            }
            this.selectDataAll  = data;
       }
        this.selectDataValue.push(v);
        this.selectDataName.push(name);
        var d = [];
        d['name'] = name;
        d['value'] = v;
        this.selectDataAll.push(d)
    },
    bindHasSelect:function(hasSelectData,bindValueElement,bindNameElement){
        var ids = $(bindValueElement).val();
        var names = $(bindNameElement).html();
        var id_arr = ids =="" ? [] :ids.split(",");
        var name_arr = names ==""?[] :names.split(",");
        var selectHtml = "";
        if(id_arr.length >0 && name_arr.length>0){
            for(var i =0;i<id_arr.length;i++){
                var d = [];
                d['name'] = name_arr[i];
                d['value'] = id_arr[i];
                this.selectDataAll.push(d);
                this.selectDataName.push(name_arr[i]);
                this.selectDataValue.push(id_arr[i]);
                selectHtml = selectHtml +'<span   data-selectname="'+name_arr[i]+'" data-selectid = "'+id_arr[i]+'">'+name_arr[i]+'<em class="icon-svg152"></em></span>';
            }
            $("#thirdSelect #hasSelected").html(selectHtml);
            if(!this.hidHasSelected){
                $("#thirdSelect .ptworkPlace").show();
            }
        }
        
        var thirdHit=$("#thirdSelect .selectMainTop").height();
        $("#thirdSelect ul").css({"margin-top":thirdHit});
    },
    refreshTop:function(isAll,v){
        var selectHtml = "";
        var data =this.selectDataAll;
        if(data.length >0){
            for(var i =0;i<data.length;i++){
                selectHtml = selectHtml +'<span data-selectname="'+data[i].name+'" data-selectid = "'+data[i].value+'">'+data[i].name+'<em class="icon-svg152"></em></span>';
            }
            $("#thirdSelect #hasSelected").html(selectHtml);
             if(!this.hidHasSelected){
                $("#thirdSelect .ptworkPlace").show();
            }
        }else{
             $("#thirdSelect .ptworkPlace").hide();
        }
        var thirdHit=$("#thirdSelect .selectMainTop").height();
        $("#thirdSelect ul").css({"margin-top":thirdHit});
    },
    bindSelectData:function(url,value){
        var _self = this;
        var cache_key = "top";
        if(value !=""){
            cache_key = value;
        }
        var dataCache  =_self.dataCache;//获得缓存数据 如果已缓存 不必再post 访问
        var cacheData;
        for(var key in dataCache){
            if(key == cache_key){
                 _self.bindMainData(dataCache[key],value);
                return
            }
        }
        var p =this.param;
       
        var data={p:value};
        //设置时间限制 如果访问超过多少秒 显示loading
        var t = setTimeout("thirdSelect.showLoadingOne()",1000);
        $.post(url,data,function(json){
             clearInterval(t);
             _self.closeLoadingOne();
             _self.time = 0;
            if(json){
                _self.closeLoadingOne();
            }
            if(value==""){
                _self.addCacheData("top",json);
            }else{
                _self.addCacheData(value,json);
            }
           
           _self.bindMainData(json,value);
        },"json");
//          $.ajax({
//                url:url,
//                data:data,
//                type:"post",
//                success:function(json){
//                    if(flag){
//                        _self.closeLoading();
//                    }
//                    if(value==""){
//                        _self.addCacheData("top",json);
//                    }else{
//                        _self.addCacheData(value,json);
//                    }
//                   _self.bindMainData(json,value);
//                },
//                error:function(XMLHttpRequest, textStatus, errorThrown){
//                     alert(XMLHttpRequest.status);
//                        alert(XMLHttpRequest.readyState);
//                        alert(textStatus);
//                },
//                datatype:"json"
//            });

    },
    checkShowLoading:function(){
        this.time = this.time+1
        if(this.time >=3){
             this.showLoading();
        }
    },
    bindMainData:function(data,value){
        if(value ==""){
            value ="top"
        }
        if(this.tempdata.length<=2){
            if(this.tempdata.indexOf(value) >=0){
            }else{
                this.tempdata.push(value);
            }
        }
        $("#thirdSelect #mainData").html("");
        var d = this.selectDataValue;
        var bindHtml = "";
        var isAll = data[0].isAll;
        var first = data[0].value;
        for(var i =0;i<data.length;i++){
            if(data[i].not_select){
                bindHtml = bindHtml + '<li><a href="javascript:;" class="select_null" data-value="'+data[i].value+'">'+data[i].label+'</a></li>';
            }else if(data[i].isNext){
                bindHtml = bindHtml + '<li><a href="javascript:;" class="canClick" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-svg15"></i></li>';
            }else{
                if(isAll == 1 && d.indexOf(first)>=0){
                    if(data[i].isAll ==1){
                        bindHtml = bindHtml + '<li class="cut"><a href="javascript:;" class="hasSelect" data-all="'+data[i].isAll+'" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
                    }else{
                        bindHtml = bindHtml + '<li class="cut"><a href="javascript:;" data-all="'+data[i].isAll+'" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
                    }
                    
                }else if(d.indexOf(data[i].value)>=0){
                    bindHtml = bindHtml + '<li class="cut"><a href="javascript:;" data-all="'+data[i].isAll+'" class="hasSelect" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
                }else{
                    bindHtml = bindHtml + '<li><a href="javascript:;" class="notSelect" data-all="'+data[i].isAll+'" data-value="'+data[i].value+'">'+data[i].label+'</a><i class="icon-uniE602"></i></li>';
                }
            }
        }
        $("#thirdSelect #mainData").html(bindHtml);
    },
    addCacheData:function(value,data){
        var d = this.dataCache;
        if(value ==""){
            d["top"]= data;
        }else{
            d[value]=data;
        }
    },
    destroy:function(){
        $("#thirdSelect").find(".title").html("");
        this.selectDataName = [];
        this.selectDataValue=[];
        this.dataCache=[];
        this.selectDataAll=[];
        this.tempdata=[];
        this.callback = "";
        this.canEmpty = false;
        this.hidSubmitButton = false;
        this.hidHasSelected = false;
        this.beginData = "";
        this.time = 0;
        this.inputVal = '',
        this.isShowSearch = false,
        this.isReq = false,
        $("#thirdSelect #mainData .canClick").die();
        $("#thirdSelect #mainData .hasSelect").die();
        $("#thirdSelect #mainData .notSelect").die();
         $("#thirdSelect #mainData .select_null").die();
         $("#thirdSelect .job_Type_All .hasSelect").die();
         $("#thirdSelect .job_Type_All .notSelect").die()
        $("#thirdSelect #hasSelected em").die();
        $("#thirdSelect #saveData").die();
        $("#thirdSelect #back").die();
        $("#thirdSelect").remove();
        $("#thirdloading11").remove();
        $("#thirdloading11 .m_m_master").die();
    }
};