var moffice = {
    /*加载层  
     * show() 显示方法 src:图片地址  z_index:层叠等级 opacity:透明度 
     * hide() 关闭加载 
     */
    
    loading:{
        html:$("<div><img/></div>"),
        show:function(src,z_index,opacity){  //
            var _this = this.html;
            var src = typeof(src) !="undefined" ? src : "//assets.huibo.com/img/m/new_person/loadingb.gif";
            var zindex = typeof(z_index) !="undefined" ? z_index :98;
            _this.css({position:"absolute",left:"50%",top:"50%",margin:"-60px 0 0 -60px","z-index":z_index}).addClass("juhua");
            _this.find("img").attr({"src":src});
            var opty = typeof(opacity) !="undefined" ? opacity : 0.1;
            moffice.mast.show(opty);
            $("body").append(_this);
            
        },
        hide:function(){
            var _this = this.html;
             if(typeof(_this)!="undefined"){
                _this.remove();
                moffice.mast.hide();
            }
        }
    },
    
    /*遮罩层  
     * show() 遮罩层显示 方法参数：opacity:透明度 index:层叠等级
     * hide() 关闭遮罩层
     * bind() 绑定事件  type:事件类型 click 等  event 事件返回方法
     */
    mast:{
        master:$("<div></div>"),
        show:function(opacity,index){// 
           var _this = this.master;
           var opty = typeof(opacity) !="undefined" ? opacity : 0.1;
           var zindex = typeof(index) !="undefined" ? index :99;
           _this.css({width:"100%",height:"100%",background:"#000",overflow:"hidden",top:"0",left:"0",position:"fixed","z-index":zindex,opacity:opty}).addClass("m_master");
            $("body").append(_this);
           return _this;
        },
        hide:function(){
            //var _this = $("body").find(".m_master");
            var _this = this.master;
            if(typeof(_this)!="undefined"){
                _this.unbind("click").remove();
            }
        },
        bind:function(type,event){
             var _this = this.master;
            if(typeof(type) == "undefined"){
                return false;
            }
            if(typeof(event) =="function"){
                _this.bind(type,function(){return event()})
            }
            return _this;
        }
    },
    
    
    
    /*确定弹窗
     * show() 显示  content:主体内容  type：弹窗类型 fail:失败框 success 成功  warning 警告   time:关闭时间  默认时间是1.5秒
     * hide() 关闭
     */
    warning:{
        time:1500,  //默认自动关闭时间 1.5秒
        failicon:"icon-062",
        successicon:"icon-072",
        warning:"icon-172",
        t:"",
        html:$('<div class="alt-pop warning-dialog">'
            +'<div class="alt-pop-con"><i class="dIcon"></i></div>'
          
            +'</div>'),
        show:function(content,type,time){
            var cont = typeof(content) !="undefined" ? content : "";
            var _this = this;
            var html = this.html;
            switch(type){
                case "fail":
                    var iconContent = '<i class="dIcon '+_this.failicon+'"></i>';
                    break; 
                case "success":
                    var iconContent = '<i class="dIcon '+_this.successicon+'"></i>';
                    break
                case "warning":
                   var iconContent = '<i class="dIcon '+_this.warning+'"></i>';
                    break
                default:
                     var iconContent = '<i class="dIcon '+_this.successicon+'"></i>';
                    break
            }
            html.find(".alt-pop-con").html(iconContent+cont);
            if(typeof(time)!="undefined"){
                _this.time = time*1000;
            }
            moffice.mast.show(0.5,9);
            $("body").append(html);
            _this.t = setTimeout("moffice.warning.hide()",_this.time)
            return _this;
        },
        
        //关闭
        hide:function(){
            this.destory();
            this.html.remove();
            moffice.mast.hide();
            clearTimeout(this.t);
        },
        destory:function(){
            this.html.find(".content").html("");
        }
    },
    /*确定窗
     * show() 显示方法  content:内容     type：弹窗类型 fail:失败框 success 成功  warning 警告  默认是警告
     * hide() 关闭
     * */
    confirm:{
        failicon:"icon-062",
        successicon:"icon-072",
        warning:"icon-172",
        leftEventType:"click",
        hasBindLeft:false,
        hasBindRight:false,
        rightEventType:"click",
        html:$('<div class="alt-pop confirm-dialog">'
            +'<div class="alt-pop-con"><i class="dIcon"></i></div>'
            +'<p class="alt-pop-oper" ><a class="pop-left" href="javascript:;">确定</a><a  class="pop-right"  href="javascript:;">取消</a></p>'
            +'</div>'),
        show:function(content,type){
            var cont = typeof(content) !="undefined" ? content : "";
            var _this = this;
            var html = this.html;
            switch(type){
                case "fail":
                    var iconContent = '<i class="dIcon '+_this.failicon+'"></i>';
                    break; 
                case "success":
                    var iconContent = '<i class="dIcon '+_this.successicon+'"></i>';
                    break
                case "warning":
                   var iconContent = '<i class="dIcon '+_this.warning+'"></i>';
                    break
                default:
                     var iconContent = '<i class="dIcon '+_this.warning+'"></i>';
                    break
            }
            html.find(".alt-pop-con").html(iconContent+cont);
            if(!_this.hasBindLeft){
                _this.bindLeft();
            }
            if(!_this.hasBindRight){
                _this.bindRight();
            }
            moffice.mast.show(0.1,9);
            $("body").append(html);
            return _this;
        },
        bindLeft:function(type,event,content,color){
            var _this = this;
            var leftObj = this.html.find(".pop-left");
            var leftContent = typeof(content) !="undefined" ? content : "确定";
            leftObj.html(leftContent);
            var leftType = typeof(type) !="undefined" ? type : "click";
            _this.leftEventType = leftType;
            if(typeof(event) =="function"){
                leftObj.bind(leftType,function(){
                    event();
                })
            }else{
                leftObj.bind(leftType,function(){_this.hide()})
            }
            _this.hasBindLeft = true;
            if(typeof(color) !="undefined"){
                leftObj.css({color:color});
            }
            return _this;
        },
        bindRight:function(type,event,content,color){
            var _this = this;
            var rightObj = this.html.find(".pop-right");
            var rightContent = typeof(content) !="undefined" ? content : "取消";
            rightObj.html(rightContent);
            var rightType = typeof(type) !="undefined" ? type : "click";
            _this.rightEventType = rightType;
            if(typeof(event) =="function"){
                rightObj.bind(rightType,function(){
                    event();
                })
            }else{
                rightObj.bind(rightType,function(){_this.hide()})
            }
            if(typeof(color) !="undefined"){
                rightObj.css({color:color});
            }
             _this.hasBindRight = true;
            return _this;
        },
        unbindLeft:function(){
            var _this = this;
            var leftObj = this.html.find(".pop-left");
            leftObj.unbind(_this.leftEventType);
            leftObj.css({color:"#46bfb2"});
           _this.hasBindLeft = false;
        },
        unbindRight:function(){
            var _this = this;
            var rightObj = this.html.find(".pop-right");
            rightObj.unbind(_this.rightEventType);
            rightObj.css({color:"#666"});
            _this.hasBindRight = false;
        },
         //关闭
        hide:function(){
            this.destory();
            this.html.remove();
            moffice.mast.hide();
          
        },
        destory:function(){
            this.unbindLeft();
            this.unbindRight();
        }
    },
    
    /*自定义弹窗*/
    dialog:{
        
    },
    
    /*上拉刷新*/
    upRefresh:{
       page:1,
       loading:'<p class="loadtext" style="padding-top:10px;padding-bottom:10px"><img src="http://assets.huibo.com/img/common/loading.gif" />正在加载</p>',
       is_show:false,
       data:{},
       bindPbj : "",
       t:"",
       url:"",
       cando:true,
       callback:null,
       init:function(url,param,event,page){
            var _this = this;
            if(typeof(page)!="undefined"){
                _this.page = page;
            }
            if(typeof(event)=="function"){
                _this.callback = event;
            }
            _this.url = url;
            _this.data = param;
            $(window).scroll(function(){
                var nowHeight = $(document).scrollTop();
                var totalHeight = $(document).height();
                var windowHeight = $(window).height();
                //当前文档高度
                if((nowHeight+60) >= (totalHeight-windowHeight) && _this.cando){
                    _this.getData();
                }
               
            });
       },
       getData:function(){
            var _this = this;
            if(!_this.is_show){
                _this.showLoading("on");
            }
            var data = _this.data;
            var toPage = parseInt(_this.page+1);//目标页
            data.page = toPage;
            _this.cando = false;
            $.post(_this.url,data,function(result){
                 if(result.status){
                     //如果数据拿成功 那么改变当前页码
                     _this.page = toPage;
                    _this.bindData(result.data);
                    _this.cando = true;;
                 }else{
                    $("body").find(".loadtext").html(result.msg);
                     _this.t = setTimeout('moffice.upRefresh.showLoading("off")',1500);
                     _this.cando = true;;
                 }
             },"json");
       },
       bindData:function(list){
           var _this = this;
             _this.callback(list);
           
           
       },
       showLoading:function(type,content){
            var _this = this;
           if(type=="on"){
              $("body").append(_this.loading);
              _this.is_show = true; 
           }else{
               $("body").find(".loadtext").stop().animate({"height":"0px"},100,function(){
                    _this.is_show = false;
                    $("body").find(".loadtext").remove();
               });
                clearTimeout(_this.t);
               
           }
       }
    }
    
}

$.fn.fieldValue = function(successful) {
    for (var val=[], i=0, max=this.length; i < max; i++) {
        var el = this[i];
        var v = $.fieldValue(el, successful);
        if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
            continue;
        }
        if (v.constructor == Array)
            $.merge(val, v);
        else
            val.push(v);
    }
    return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (successful === undefined) {
        successful = true;
    }

    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1)) {
            return null;
    }

    if (tag == 'select') {
        var index = el.selectedIndex;
        if (index < 0) {
            return null;
        }
        var a = [], ops = el.options;
        var one = (t == 'select-one');
        var max = (one ? index+1 : ops.length);
        for(var i=(one ? index : 0); i < max; i++) {
            var op = ops[i];
            if (op.selected) {
                var v = op.value;
                if (!v) { // extra pain for IE...
                    v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
                }
                if (one) {
                    return v;
                }
                a.push(v);
            }
        }
        return a;
    }
    return $(el).val();
};