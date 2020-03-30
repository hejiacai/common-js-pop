//alert2的弹框对象
function zlyAlert2() {
    this.alert=null;
    this.init=function (idStr) {
        if(idStr){
            this.alert=$('<div id='+idStr.slice(1)+
                ' class="zly-alert2"><div class="content-con"><div class="body">' +
                ''+'</div><div  class="btns"><div class="confirm">关闭</div></div></div></div>').hide();
        }else {
            this.alert=$('<div class="zly-alert2"><div class="content-con"><div class="body">' +
                ''+'</div><div  class="btns"><div class="confirm">关闭</div></div></div></div>').hide();
        }


        $('body').append(this.alert);

        this.render();
        console.log(this)
        return this;
    }
    this.render=function () {
        var self=this;
        // $('body').on('click','#zly-alert2 .confirm',function () {
        //     self.alert.hide();
        // })

        this.alert.on('click','.confirm',function () {
            self.alert.hide();
        })

        this.alert.on('click',function () {
            self.alert.hide();
        })

        this.alert.on('click','.content-con',function (e) {
            e.stopPropagation();
        })

    }

    this.show=function (str,callback) {
        this.alert.find('.body').html(str);
        this.alert.show();
        callback && callback()
    }

    this.hide=function () {
        this.alert.hide();
    }

}

//top-tip的对象
function  zlyMessage() {
    this.msg=null;
    this.timer=null;
    this.init=function () {
        this.msg=$("<div id='zly_message' class='zly-message'></div>");
        $('body').append(this.msg);

        return this;
    }
    this.show=function (word,callback,callbackObject) {
        var self=this;
        clearTimeout(self.timer)
        this.msg.text(word).slideDown();
        this.timer=setTimeout(function () {
            self.msg.slideUp();
            callback && callback(callbackObject)
        },1000)
    }
}

/*
* 确认框对象
* 生成和初始化   var confirm= new zlyConfirm().init('#idName');
*
* */
function zlyConfrim() {
    this.dialog=null;
    this.init=function (idStr) {
        if(idStr){
            this.dialog=$(
                '<div id='+ idStr.slice(1)+' class="zly-confirm"><div class="zly-confirm-bg"></div>'+
                '<div class="zly-confirm-content"><div class="body"></div>'+
                '<div class="btns">'+
                '<div class="cancel">关闭</div>'+
                '<div class="ok">确定</div>' +
                '</div></div></div>'
            );
        }else {
            this.dialog=$(
                '<div class="zly-confirm"><div class="zly-confirm-bg"></div>'+
                '<div class="zly-confirm-content"><div class="body"></div>'+
                '<div class="btns">'+
                '<div class="cancel">关闭</div>'+
                '<div class="ok">确定</div>' +
                '</div></div></div>'
            );
        }

        $('body').append(this.dialog);
        this.render();
        return this;
    }
    this.render=function () {
        var self=this;
        this.dialog.on('click','.zly-confirm-bg',function () {
            self.dialog.hide();
        })

        this.dialog.on('click','.zly-confirm-content .cancel',function () {
            self.dialog.hide();
        })
        
    }

    this.show=function (str,callback) {
        this.dialog.find('.zly-confirm-content .body').html(str);
        this.dialog.show();
        callback && callback();
    }
    this.hide= function () {
        this.dialog.hide();
    }
}
