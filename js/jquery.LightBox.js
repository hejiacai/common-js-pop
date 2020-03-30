/*
 *LightBox 1.0
 *Copyright (c) 2015 小坏 http://tnnyang.cnblogs.com
 *dependence jquery-1.7.1.js
 */
;(function (a) {
    a.fn.LightBox = function (options) {
        var defaults = {
            controls: true          //上一张、下一张是否显示，默认是显示true
        }
        var opts = a.extend(defaults, options);

        var lb_wrap = '<div class="lb_wrap"><div class="lightbox_bg"></div><div class="lightbox"><img src="loading.gif" class="lg_img"></div></div>';
        a("body").append(lb_wrap);

        //controls
        if (opts.controls) {
            a(".lightbox").append('<p class="prev"><span style="color: white;"><<</span></p><p class="next"><span style="color: white;">>></span></p>');
        }

        function imgobj(obj1, obj2) {
            //imgObj.height是通过img对象获取的图片的实际高度
            var imgObj = new Image();
            imgObj.src = obj1.attr("src");
            var margintop = 0 - (imgObj.height) / 2;
            obj2.css("margin-top", margintop);
        }

        this.each(function () {
            var obj = a(this);
            var numpic = obj.find("li").length;
            var num = 0;

            //点击赋值并显示
            obj.find("img").click(function () {
                var src = a(this).attr("src");
                a(".lg_img").attr("src", src);
                imgobj(a(".lg_img"), a(".lightbox"));

                a(".lb_wrap").fadeIn();
                a(".lg_img").fadeIn();
                a(".prev").fadeIn().siblings(".next").fadeIn();
                num = a(this).parent().index();   //获取当前图片的父元素的索引并赋给num为后边点击上一张、下一张服务
            });

            //上一张
            a(".prev").click(function () {
                if (num == 0) {
                    num = numpic;
                }
                var src = obj.find("li").eq(num - 1).find("img").attr("src");
                a(".lg_img").attr("src", src);
                imgobj(a(".lg_img"), a(".lightbox"));

                num--;
            });

            //下一张
            a(".next").click(function () {
                if (num == numpic - 1) {
                    num = -1;
                }
                var src = obj.find("li").eq(num + 1).find("img").attr("src");
                a(".lg_img").attr("src", src);
                imgobj(a(".lg_img"), a(".lightbox"));

                num++;
            });

            //点击除了上一张、下一张之外的其他地方隐藏
            a(".lb_wrap").click(function (e) {
                var e = e || window.event;
                var elem = e.target || e.srcElement;
                while (elem) {
                    if (elem.className && elem.className.indexOf('prev') > -1) {
                        return;
                    }
                    if (elem.className && elem.className.indexOf('next') > -1) {
                        return;
                    }
                    elem = elem.parentNode;
                }
                a(this).find("img").attr("src", "loading.gif").hide();      //隐藏后，再将默认的图片赋给lightbox中图片的src
                a(this).find(".prev").hide().siblings(".next").hide();
                a(this).fadeOut();
            });
        })
    }
})(jQuery);