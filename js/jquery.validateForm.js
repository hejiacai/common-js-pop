;
(function ($, window, document, undefined) {
    //默认操作
    var defaults = {
            msg: {
                required: "必填！",
                errorType: "非数字类型",
                max: "小于",
                min: "大于"
            }
        },
        //缓存实例
        _that,
        //缓存所有校验项
        _cache = [],
        //表单提交标志
        post = true,
        //插件构造
        Plugin = function (element, options) {
            _that = this;
            this.element = element;
            this.options = $.extend({}, defaults, options);
            this.init();
        };
    Plugin.prototype.init = function () {
        var $form = $(this.element);
        createErrorBox();
        // 绑定校验
        $form.find('input[type = number],input[type=text],input[type=radio],select,textarea').each(function () {
            var $this = $(this);
            $this.on('blur', function () {
                setTimeout(function () {
                    validate($this);
                }, 200)
            });
            _cache.push($this);
        });
        //表单是否要提交
        submitForm($form);
    };
    var radioFlag = false;
    //统一校验函数
    var validate = function ($elem) {

            if ($elem.attr('type') == 'number') {
                //先校验必填
                $elem.data('required') && validateRequired($elem);
                //校验数字
                !$elem.hasClass('error-validate') && validateNumber($elem);
                //校验范围
                !$elem.hasClass('error-validate') && validateRange($elem);
                return;
            }
            //radio校验
            if ($elem.attr('type') == 'radio') {
                validateRadio($elem);
                return;
            }
            $elem.data('required') && validateRequired($elem);
        },
        //表单提交
        submitForm = function ($form) {
            $('input[type=submit],button').click(function (e) {
                e.preventDefault();
                var errorElem = [];
                //取缓存,校验所有项
                $.each(_cache, function () {
                    validate(this);
                });
                //找到所有校验失败的元素及位置
                $form.find('.error-validate').each(function () {
                    errorElem.push({elem: $(this), top: $(this).offset().top});
                });
                post = errorElem.length > 0 ? false : true;
                if (post) {
                    $form.submit();
                } else {
                    $('html,body').animate({scrollTop: errorElem[0].top}, 400);
                    focusIn(errorElem[0].elem);
                }
            });
        },
        //校验必填
        validateRequired = function ($elem) {
            if (!$elem.val()) {
                $elem.addClass('error-validate').data('error', _that.options.msg.required);
                errorMsg($elem, _that.options.msg.required);
            } else {
                $elem.hasClass('error-validate') && $elem.removeClass('error-validate');
            }
        },
        //radio 校验
        validateRadio = function ($elem) {
            var $radio = $('input[name=' + '"' + $elem.attr('name') + '"' + ']');
            $radio.each(function () {
                if (this.checked) {
                    radioFlag = true;
                    return false;
                }
            });
            radioFlag ? $radio.removeClass('error-validate')
                : $radio.addClass('error-validate').data('error', _that.options.msg.required) &&
            errorMsg($elem, _that.options.msg.required);
        },
        //校验数字
        validateNumber = function ($elem) {
            var reg = /^-?\d+$/;
            reg.test($elem.val()) ? $elem.removeClass('error-validate')
                : $elem.addClass('error-validate').data('error', _that.options.msg.errorType)
            && errorMsg(_that.options.msg.errorType);
        },
        //校验范围
        validateRange = function ($elem) {
            var max = $elem.attr('max'),
                min = $elem.attr('min'),
                value = $elem.val(),
                msg = '';
            msg = min && value - 0 < min ? _that.options.msg.min + min : "";
            msg = max && value - 0 > max ? _that.options.msg.max + max : msg;

            msg && errorMsg($elem, msg);
            msg && $elem.addClass('error-validate').data('error', msg);
        },
        //错误提示
        errorMsg = function ($elem, msg) {
            $('#errorDiv')
                .css({
                    'left': $elem.offset().left,
                    'padding': $elem.css('padding'),
                    'top': $elem.offset().top + $elem.outerHeight()
                })
                .text(msg)
                .show()
                .fadeOut(2000);
        },
        //焦点获取，及错误提示
        focusIn = function ($elem) {
            $elem.trigger('focus');
            errorMsg($elem, $elem.data('error'));
        },
        //创建错误提示框
        createErrorBox = function () {
            var $div = $(document.createElement('div'));
            $div.attr('id', 'errorDiv').addClass('validateBox');
            $('body').append($div[0]);
        };
    jQuery.fn.validateForm = function (options) {
        return this.each(function () {
            if (!$.data(this, 'validateForm')) {
                $.data(this, 'validateForm', new Plugin(this, options))
            }
        });
    }

})(jQuery, window, document);
