hbjs.use('@personEditResume,@jobDialog, @multipleSelect, @jobSorter, @fileUploader, @hbCommon, @jobDater, @areaPersonSimple, @jobsort, @form, @calling, @areaMulitiple, @jobCertificate, @jobSkill, @fancyboxThumbs, @dateFormat', function (m) {

    var isIE = !window.XMLHttpRequest,
        isIE6 = !-[1,] && isIE,
        $ = m['jquery'],
        util = m['base.util'],
        select = m['widge.select'],
        FileUploader = m['widge.fileUploader'],
        editResume = m['product.resume.personEditResume'],
        editMutilResume = m['product.resume.personEditMutilResume'],
        multipleSelect = m['widge.multipleSelect'],
        dateFormat = m['tools.dateFormat'],
        confirmBox = m['widge.overlay.confirmBox'],
        checkBoxer = m['widge.checkBoxer'],
        jobSorter = m['product.jobSort.jobSorter'],
        jobDater = m['cqjob.jobDater'],
        DateFormat = m['tools.dateFormat'],
        verifier = m['module.verifier'],
        validatorForm = m['widge.validator.form'];

    $.extend(
        m['product.hbCommon'], m['cqjob.jobsort'], m['cqjob.calling'], m['cqjob.jobDialog'], m['cqjob.areaMulitiple'],
        m['cqjob.jobCertificate'], m['cqjob.jobSkill'], m['cqjob.fancybox-thumbs']
    );
    var rightSide = $('#resume_rightSide_li'),
        rightSideList = rightSide.find('ul li'),
        pWidth = 70,
        fontWidth = 18,
        noField = '未填写',
        noFields = '<span class="wh-ccc">未填写</span>',
        scoreArr = [25, 5, 15, 15, 5, 5, 5, 5, 10, 5, 5],
        win = window;

    searchAttribution(mobile_phone);
    var getVal = function (el) {
        if (el.length == 0) return '';
        if (el[0].type.toLowerCase() == 'a' || el[0].type.toLowerCase() == 'span') {
            return el.html();
        } else {
            return el.val();
        }
    };

    function toggleLabel(el, label) {
        if (getVal(el) === '') {
            label.show();
        } else {
            label.hide();
        }
    }

    txtLabel = "txtLabel";
    $.fn.resetWatermark = function () {
        $(this).each(function () {
            var _this = $(this),
                label = _this.parent().find('.' + txtLabel);
            toggleLabel(_this, label);
        });
    }
    function searchAttribution(tel) {
        //获取号码归属地
        var regex = /^1[3|4|5|8|7|6|9][0-9]\d{4,8}$/,
            phoneAddr = $('#phoneAddr');
        if (!phoneAddr.length) return;
        if (tel && !regex.test(tel)) {
            phoneAddr.html('（未知）');
        } else {
            var url = '//tcc.taobao.com/cc/json/mobile_tel_segment.htm?tel=' + (tel || '');
            if (isIE6) {
                url = 'https://www.baifubao.com/callback?cmd=1059&callback=phone&phone=' + (tel || '');
            }
            $.ajax({
                async: false,
                type: "post",
                url: url,
                dataType: "jsonp",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                jsonp: "callback",
                success: function (json) {
                    if (isIE6) {
                        if (json.data.area == '' || json.data.area == undefined) {
                            phoneAddr.html('（未知）');
                        } else {
                            phoneAddr.html('（' + json.data.area + '）');
                        }
                    } else {
                        if (json.province == '' || json.province == undefined) {
                            phoneAddr.html('（未知）');
                        } else {
                            phoneAddr.html('（' + json.province + '）');
                        }
                    }
                },
                error: function () {
                    phoneAddr.html('（未知）');
                }
            });
        }
    }

    function updateRightSideList(index, status) {
        if (status && !rightSideList.eq(index).hasClass('suc')) {
            rightSideList.eq(index).addClass('suc');
            complete_percent += scoreArr[index];
        } else if (!status && rightSideList.eq(index).hasClass('suc')) {
            rightSideList.eq(index).removeClass('suc');
            complete_percent -= scoreArr[index];
        }
        $('#precentRound').attr('class', 'precent precent' + complete_percent);
    }

    function getItemTime(time) {
        return (time ? new Date(time) : new Date).getTime();
    }

    function updateResumeTime(time) {
        $('#resumeTimeBar').text('最后修改时间：' + time);
    }

    function updateCompPercent(Percent) {
        $('#compPercent').attr('data-percent', Percent);
        if (Percent < 50) {
            $('#compPercent').attr('style', 'color:#ff5400');
            $('#compPercent').text('较差');
        } else if (Percent >= 50 && Percent < 80) {
            $('#compPercent').attr('style', 'color:#ffa200');
            $('#compPercent').text('良好');
        } else if (Percent > 80) {
            $('#compPercent').attr('style', 'color:#16caa4');
            $('#compPercent').text('优秀');
        }
    }

    $('input, textarea').watermark();

    /*重命名*/
    var jlName = $("#jlName");
    if (jlName.length) {
        var resumeNameRules = {
                txtResumeName: {
                    required: true,
                    max: 12
                }
            },
            resumeNameErrMsg = {
                txtResumeName: {
                    required: '<em></em><i></i>请填写简历名称',
                    max: '<em></em><i></i>不超过12个字'
                }
            },
            resumeValidator = new validatorForm({
                element: $('#formResumeName'),
                rules: resumeNameRules,
                errorMessages: resumeNameErrMsg,
                errorElement: "span",
                keepKey: true,
                isFocus: false
            });
        resumeValidator.on('invalid', function (e) {
            e.target.addClass('error-text');
            e.label.addClass('error-msg')
        });
        resumeValidator.on('clear', function (e) {
            e.allElements.removeClass('error-text');
            e.hideElements.removeClass('error-msg');
            e.showElements.removeClass('error-msg');
        });
        resumeValidator.on('pass', function (e) {
            e.target.removeClass('error-text');
            e.label.removeClass('error-msg');
        });
        var jlCancel = jlName.find('#cancel'),
            jlShowName = jlName.find('.jname'),
            jlInput = jlName.find('.text'),
            jlInputText = jlShowName.attr('v');

        jlName.on('click', '#cancel', function (e) {
            var target = $(e.currentTarget);
            jlInput.val(jlShowName.toggle().html()).toggle().focus();
            target.hide();
        });
        jlInput.on('blur', function (e) {
            resumeNameEditor.saveSubmit();
        }).on('keyup', function (e) {
            if (e.keyCode === 13) {
                resumeNameEditor.saveSubmit();
            }
        });

        var resumeNameEditor = {
            saveSubmit: function () {
                if (jlInputText == jlInput.val()) {
                    jlInput.hide();
                    jlShowName.show();
                    jlCancel.show();
                    return;
                }
                resumeValidator.submit(
                    function (valid) {
                        jlInput.submitForm({
                            beforeSubmit: valid,
                            data: {resume_id: resume_id},
                            success: function (result) {
                                var msg;
                                if (msg = result.error) {
                                    confirmBox.timeBomb(msg, {
                                        name: 'fail',
                                        width: pWidth + msg.length * fontWidth
                                    });
                                    return;
                                }
                                jlInputText = jlInput.hide().val();
                                jlShowName.attr('v', jlInputText).html(jlInputText).show();
                                updateResumeTime(result.update_time);
                                jlCancel.show();
                                resumeValidator.checkElement(jlInput[0]);
                            }, clearForm: false
                        });
                    }
                );
            }
        }
    }
    /*重命名*/

    var baseInfoRules = {
            txtUserName: {
                required: true,
                match: /^[\u4e00-\u9fa5]+$/i,
                range: [2, 6]
            },
            radSex: 'required',
            inpBirthYear: 'number',
            inpBirthMonth: 'number',
            // inpBirthDate: 'number',
            //inpStartYear: 'number',
            //	inpStartMonth: 'number',
            inpStartDate: 'number',
            txtIDCardNumber: 'idcard',
            hidCurArea: 'required',
            radWorkState: 'required',
            hidApplyStatus: 'required',
            hidAccessionTime: 'required',
            txtAvoirdupois: {
                number: true,
                rangeNum: [1, 200]
            },
            txtStature: {
                number: true,
                rangeNum: [1, 280]
            },
            hiddegree: 'required',

            txtMobilePhone: {
                required: true,
                match: /^1[3|4|5|8|7|6|9][0-9]\d{4,8}$/,
                range: [11, 11]
            },
            //txtEmail: 'required email',
            txtQQ: {
                required: true,
                number: true,
                range: [5, 11]
            },
        },
        baseInfoGroups = {
            birthYMD: 'inpBirthYear inpBirthMonth inpBirthDate',
            startYMD: 'inpStartYear inpStartMonth inpStartDate',
            txtSheight: 'txtStature txtAvoirdupois'
        },
        baseInfoKeepBlur = [
            'inpBirthYear', 'inpBirthMonth', 'inpBirthDate',
            'inpStartYear', 'inpStartMonth', 'inpStartDate'
        ].join(' '),
        baseInfoErrorMsg = {
            txtUserName: {
                required: '<em></em><i></i>请填写真实姓名',
                match: '<em></em><i></i>2-6个汉字',
                range: '<em></em><i></i>2-6个汉字'
            },
            radSex: '<em></em><i></i>请选择性别',
            inpBirthYear: '<em></em><i></i>请选择年份',
            inpBirthMonth: '<em></em><i></i>请选择月份',
            inpBirthDate: '<em></em><i></i>请选择日期',
            inpStartYear: '<em></em><i></i>请选择年份',
            inpStartMonth: '<em></em><i></i>请选择月份',
            inpStartDate: '<em></em><i></i>请选择日期',
            txtIDCardNumber: '<em></em><i></i>请填写正确的身份证',
            hidCurArea: '<em></em><i></i>请选择现居住地',
            radWorkState: '<em></em><i></i>请选择工作经验',
            hidApplyStatus: '<em></em><i></i>请选择求职状态',
            hiddegree: '<em></em><i></i>请选择学历',
            hidAccessionTime: '<em></em><i></i>请选择到岗时间',

            txtStature: {
                number: '<em></em><i></i>请填写数字',
                rangeNum: '<em></em><i></i>请输入正确的数值'
            },
            txtMobilePhone: {
                required: '<em></em><i></i>请输入手机号码',
                match: '<em></em><i></i>手机号格式不正确',
                range: '<em></em><i></i>手机号格式不正确'
            },
            txtEmail: {
                required: '<em></em><i></i>请输入邮箱',
                email: '<em></em><i></i>邮箱格式不正确'
            },
            txtAvoirdupois: {
                number: '<em></em><i></i>请填写数字',
                rangeNum: '<em></em><i></i>请输入正确的体重'
            },
            txtQQ: {
                required: '<em></em><i></i>请输入QQ',
                number: '<em></em><i></i>请填写正确的QQ',
                range: '<em></em><i></i>请填写正确的QQ'
            },
        },
        hidAccessionTimeRules = {hidAccessionTime: 'required'},
        hidAccessionTimeMsg = {hidAccessionTime: '<em></em><i></i>请选择到岗时间'};

    var baseInfoEditor = new editResume({
        validators: {
            rules: baseInfoRules,
            groups: baseInfoGroups,
            errorMessages: baseInfoErrorMsg,
            keepBlur: baseInfoKeepBlur,
            keepKey: true,
            errorElement: ''
        }
    });
    var chkBase, sexNameBoxer, workBoxer,
        dropMarriage, dropPolitical, dropFertility, dropApplyStatus, dropdegreeSel, dropAccessionTime,
        baseInfoValidator = baseInfoEditor.getValidator(),
        phoneCoder = (function () {
            var disabledClass = 'isDisabled',
                txtMobilePhone = baseInfoEditor.getDom('#txtMobilePhone'),
                txtMobilePhoneValue = txtMobilePhone.val(),
                isMobileBindStatus = !!txtMobilePhoneValue,
                txtMobilePhoneLabel = baseInfoEditor.getDom('span[data-for=txtMobilePhone]'),
                divValiMobile = baseInfoEditor.getDom('#divValiMobile'),
                txtValidateCode = baseInfoEditor.getDom('#txtValidateCode'),
                divValidCode = baseInfoEditor.getDom('#divValidCode'),
                txtValidateLabel = baseInfoEditor.getDom('span[data-for=txtValidateCode]'),
                btnMobile = baseInfoEditor.getDom('#btnMobile'),
                btnBindMobile = baseInfoEditor.getDom('#btnBindMobile'),
                btnSendValidate = baseInfoEditor.getDom('#btnSendValidate'),
                bindStatus = baseInfoEditor.getDom('#phone-status'),
                spnConModMobile = baseInfoEditor.getDom('#spnConModMobile'),
                remoteRules = {
                    url: checkPhone_url,
                    async: true,
                    data: {
                        mobilphone: function () {
                            return txtMobilePhone.val();
                        }
                    },
                    callback: function (e) {
                        phoneCoder.isRemoteClass = e.success === "true";
                        return true;
                    }
                },
                remoteErrorMsg = '<em></em><i></i>该号码已被其他账号使用,需重新验证,请点击免费发送验证码',
                remoteSuccessMsg = '<i></i>',
                codeRemoteURL = {
                    url: checkVali,
                    async: true,
                    data: {
                        txtMobilePhone: function () {
                            return txtMobilePhone.val();
                        },
                        txtValidateCode: function () {
                            return txtValidateCode.val();
                        }
                    },
                    callback: function (e) {
                        if (!phoneCoder.isRemoteClass) {
                            phoneCoder.isSuccess = true;
                        }
                        return e.success === "true";
                    }
                },
                codeRules = {
                    required: true,
                    number: true,
                    range: [6, 6],
                    remote: codeRemoteURL
                },
                codeErrorMessages = {
                    required: '<em></em><i></i>请填写验证码',
                    number: '<em></em><i></i>请填写数字',
                    range: '<em></em><i></i>验证码为6位',
                    remote: '<em></em><i></i>输入正确的验证码'
                },
                codeValidMessages = "<i></i>",
                isSendClick = true,
                phoneCoder = {
                    isRemoteClass: true,
                    spnConModMobile: spnConModMobile,
                    txtMobilePhone: txtMobilePhone,
                    txtMobilePhoneLabel: txtMobilePhoneLabel,
                    divValiMobile: divValiMobile,
                    txtValidateCode: txtValidateCode,
                    seconds: 0,
                    clearInput: function (f) {
                        if (!f) {
                            txtMobilePhone.removeClass(baseInfoEditor.allClass('text'));
                        }
                        txtMobilePhoneLabel.removeClass(baseInfoEditor.allClass('label')).html('');
                    },
                    clearCode: function (f) {
                        if (!f) {
                            txtValidateCode.removeClass(baseInfoEditor.allClass('text')).val('');
                            baseInfoValidator.clearRemoteCache(txtValidateCode);
                        }
                        txtValidateLabel.removeClass(baseInfoEditor.allClass('label')).html('');
                    },
                    remoteCode: function (f) {
                        if (!f) {
                            baseInfoValidator.addRules('txtValidateCode', codeRules);
                            baseInfoValidator.addErrorMessages('txtValidateCode', codeErrorMessages);
                            baseInfoValidator.addValidMessages('txtValidateCode', codeValidMessages);
                            return;
                        }
                        baseInfoValidator.removeRules('txtValidateCode');
                    },
                    remote: function (f) {
                        if (!f) {
                            baseInfoValidator.addRules('txtMobilePhone', {remote: remoteRules});
                            baseInfoValidator.addValidMessages('txtMobilePhone', remoteSuccessMsg);
                            baseInfoValidator.addErrorMessages('txtMobilePhone', {remote: remoteErrorMsg});
                            return;
                        }
                        baseInfoValidator.removeRules('txtMobilePhone', 'remote');
                    },
                    toggleBindStatus: function (f) {
                        f ? bindStatus.show() : bindStatus.hide();
                    },
                    updateBindStatus: function () {
                        if (phoneValidatorStatus) {
                            bindStatus.addClass('upd-num').removeClass('upd-num1');
                        } else {
                            bindStatus.removeClass('upd-num').addClass('upd-num1');
                        }
                    },
                    toggleValidCode: function (f) {
                        if (f) {
                            divValiMobile.show();
                            this.remoteCode();
                        } else {
                            divValiMobile.hide();
                            this.remoteCode(true);
                        }
                    },
                    toggleBindBtn: function (f) {
                        if (btnMobile.is(':visible')) {
                            btnMobile.hide();
                        }
                        if (f) {
                            btnBindMobile.show();
                        } else {
                            btnBindMobile.hide();
                        }
                    },
                    toggleModBtn: function (f) {
                        if (btnBindMobile.is(':visible')) {
                            btnBindMobile.hide();
                        }
                        if (f) {
                            btnMobile.show();
                        } else {
                            btnMobile.hide()
                        }
                    },
                    disabled: function () {
                        this.clearInput();
                        this.toggleValidCode(false);
                        this.toggleModBtn(true);
                        txtMobilePhone.val(txtMobilePhone.attr('v')).prop('disabled', true);
                        btnMobile.addClass(disabledClass).html('更换号码');
                        this.toggleBindStatus(true);
                        this.remote(true);
                    },
                    enabled: function () {
                        this.clearCode();
                        this.toggleValidCode(true);
                        this.toggleModBtn(true);
                        txtMobilePhone.val('').prop('disabled', false);
                        btnMobile.removeClass(disabledClass).html('暂不修改');
                        this.toggleBindStatus(false);
                        this.remote();
                    },
                    bind: function () {
                        txtMobilePhone.prop('disabled', false);
                        this.toggleValidCode(true);
                        this.toggleBindBtn(true);
                        this.toggleBindStatus(false);
                        btnBindMobile.removeClass(disabledClass).html('取消绑定');
                    },
                    unbind: function () {
                        txtMobilePhone.prop('disabled', false);
                        this.toggleValidCode(false);
                        this.toggleBindBtn(true);
                        this.toggleBindStatus(isMobileBindStatus);
                        btnBindMobile.addClass(disabledClass).html('立即绑定');
                    },
                    initBind: function () {
                        txtMobilePhone.prop('disabled', false);
                        this.toggleValidCode(false);
                        this.toggleBindBtn(false);
                        this.toggleBindStatus(isMobileBindStatus);
                        btnBindMobile.addClass(disabledClass).html('立即绑定');
                    },
                    checkPhone: function (f) {
                        if (f) {
                            this.insertLabel();
                            txtMobilePhoneLabel.removeClass(baseInfoEditor.allClass('label')).addClass(baseInfoEditor.get('classes').successLabel).html('<i></i>');
                        } else {
                            this.insertLabel(true);
                            txtMobilePhoneLabel.removeClass(baseInfoEditor.allClass('label')).addClass(baseInfoEditor.get('classes').warningLabel).html(remoteErrorMsg);
                        }
                    },
                    insertLabel: function (f) {
                        if (f) {
                            spnConModMobile.after(txtMobilePhoneLabel);
                        } else {
                            spnConModMobile.before(txtMobilePhoneLabel);
                        }
                    },
                    focusMobile: function () {
                        txtMobilePhoneValue = txtMobilePhone.val();
                    },
                    blurMobile: function () {
                        if (txtMobilePhone.val() !== txtMobilePhoneValue) {
                            if (!this.isRemoteClass) {
                                delete this.isSubmit;
                                delete this.isSuccess;
                            }
                            if (divValiMobile.is(':visible')) {
                                this.clearCode();
                            }
                        }
                    },
                    success: function () {
                        if (!phoneValidatorStatus) {
                            if (!this.isRemoteClass) {
                                if (divValiMobile.is(':hidden') && !baseInfoValidator.isFormSubmitted()) {
                                    this.clearCode();
                                }
                                this.toggleBindBtn(false);
                                this.toggleValidCode(true);
                                return;
                            }

                            if (!baseInfoValidator.isFormSubmitted()) {
                                if (txtMobilePhoneValue !== txtMobilePhone.val()) {
                                    this.unbind();
                                }
                            }
                            delete this.isRemoteSuccess;
                        }
                    },
                    error: function () {
                        this.insertLabel(true);
                        if (phoneValidatorStatus) {
                            this.enabled();
                        } else {
                            this.toggleBindBtn(false);
                            this.toggleBindStatus(false);
                            this.toggleValidCode(false);
                        }
                    },
                    send: function () {
                        if (!isSendClick) return;
                        isSendClick = false;
                        if (!verifier.required(txtMobilePhone)) {
                            isSendClick = true;
                            baseInfoValidator.checkElement(txtMobilePhone[0]);
                            return;
                        }
                        var self = this,
                            data = {mobilePhone: txtMobilePhone.val()};
                        self.successMobile = data.mobilePhone;
                        $.getJSON(sendmsg_url, data, function (result) {
                            if (!result.status) {
                                isSendClick = true;
                                txtValidateLabel.removeClass(baseInfoEditor.allClass('label')).addClass(baseInfoEditor.get('classes').errorLabel).html('<em></em><i></i>' + result.msg);
                                txtValidateCode.removeClass(baseInfoEditor.allClass('text')).addClass(baseInfoEditor.get('classes').errorText);
                                return;
                            }

                            btnSendValidate.html('<i>180</i>秒重新获取');
                            txtValidateLabel.removeClass(baseInfoEditor.allClass('label')).addClass(baseInfoEditor.get('classes').successLabel).html('<i class="cont"></i>已发送验证码短信到您的手机');

                            txtValidateCode.val('').removeClass(baseInfoEditor.allClass('text')).focus();
                            self.interval = setInterval(function () {
                                self.complete();
                            }, 1000);
                        });
                    },
                    complete: function () {
                        var num = btnSendValidate.children('i'),
                            seconds = parseInt(num.html());
                        if (seconds > 0) {
                            seconds--;
                            this.seconds = seconds;
                            num.html(seconds);
                        } else {
                            this.seconds = 0;
                            this.resetTime(true);
                        }
                    },
                    resetTime: function (f) {
                        if (this.interval) {
                            window.clearInterval(this.interval);
                            this.interval = null;
                            this.successMobile = null;
                            this.successCode = null;
                            btnSendValidate.html('重新获取验证码');
                            isSendClick = true;
                        }
                    }
                }

            btnBindMobile.on('click', function () {
                if ($(this).hasClass(disabledClass)) {
                    phoneCoder.clearCode();
                    phoneCoder.bind();
                } else {
                    phoneCoder.clearCode();
                    phoneCoder.unbind();
                }
                delete phoneCoder.isSubmit;
            });
            btnMobile.on('click', function () {
                if ($(this).hasClass(disabledClass)) {
                    phoneCoder.clearCode();
                    phoneCoder.enabled();
                } else {
                    phoneCoder.clearCode();
                    phoneCoder.disabled();
                }
                delete phoneCoder.isSubmit;
            });
            btnSendValidate.on('click', function () {
                phoneCoder.send();
            });

            return phoneCoder;
        })(),
        mailCoder = (function () {
            var disabledClass = 'isDisabled',
                txtEmail = baseInfoEditor.getDom('#txtEmail'),
                labelEmail = baseInfoEditor.getDom('span[data-for=txtEmail]'),
                btnEmail = baseInfoEditor.getDom('#btnEmail'),
                statusEmail = baseInfoEditor.getDom('#email-status'),
                infoEmail = baseInfoEditor.getDom('#emailInfoMsg');
            //if(txtEmail.val()==''){
            //	txtEmail.prop('disabled', true);
            //	mailCoder.disabled();
            //}
            baseInfoValidator.addRules('txtEmail', {
                remote: {
                    url: checkEmailUrl,
                    async: true,
                    data: {
                        email: function () {
                            return txtEmail.val();
                        }
                    },
                    callback: function (e) {
                        if ($.trim(txtEmail.val()))
                            return e.success == "true";
                        return true;
                    }
                }
            });
            baseInfoValidator.addErrorMessages('txtEmail', {
                remote: '<em></em><i></i>该邮箱已被使用，请重新输入'
            });
            var mailCoder = {
                _dataBind: baseInfoEditor.getDom('#spnBasicEmail').attr('data-bind'),
                validMessages: '<i></i>',
                add: function () {
                    baseInfoValidator.addValidMessages('txtEmail', this.validMessages);
                },
                remove: function (f) {
                    baseInfoValidator.removeValidMessages('txtEmail');
                    if (!f) {
                        txtEmail.removeClass(baseInfoEditor.allClass('text'));
                        labelEmail.removeClass(baseInfoEditor.allClass('label')).html('');
                    }
                },
                getDataBind: function () {
                    return this._dataBind;
                },
                setStatus: function (b) {
                    if (b) {
                        statusEmail.removeClass('upd-email').addClass('upd-email1');
                    } else {
                        statusEmail.addClass('upd-email').removeClass('upd-email1');
                    }
                },
                enabled: function () {
                    if (btnEmail.is(':hidden')) {
                        btnEmail.show();
                    }
                    btnEmail.removeClass(disabledClass).html('暂不修改');
                    txtEmail.removeAttr('disabled').val(txtEmail.attr('v'));
                    infoEmail.show();
                    statusEmail.hide();
                    if (labelEmail.html()) {
                        this.remove();
                    }
                    this.setStatus(true);
                    this.add();
                },
                disabled: function () {
                    if (btnEmail.is(':hidden')) {
                        btnEmail.show();
                    }

                    btnEmail.addClass(disabledClass).html('更换邮箱');
                    txtEmail.prop('disabled', true).val(txtEmail.attr('v'));
                    baseInfoValidator.resetElement(txtEmail, true);
                    statusEmail.show();
                    mailCoder.setStatus(!this._dataBind);
                    mailCoder.remove();
                    infoEmail.hide();
                },
                initEnabled: function () {
                    //if(btnEmail.is(':visible')){
                    //	btnEmail.hide();
                    //}

                    //if(txtEmail.val()==''){
                    //	txtEmail.prop('disabled', true);
                    //	mailCoder.disabled();
                    //}
                    //txtEmail.prop('disabled', false).val(txtEmail.attr('v'));
                    statusEmail.hide();
                    mailCoder.setStatus(true);
                    this.add();
                },
                insertLabel: function (f) {
                    if (f) {
                        btnEmail.after(labelEmail);
                    } else {
                        btnEmail.before(labelEmail);
                    }
                }
            }

            btnEmail.click(function () {
                if ($(this).hasClass(disabledClass)) {
                    mailCoder.enabled();
                } else {
                    mailCoder.disabled();
                }
            });
            return mailCoder;
        })();

    var labelWorkState = baseInfoEditor.getDom('#labelWorkState'),
        txtStatureData = '',
        txtAvoirdupoisData = '';

    function toggleBaseMoreInfor(f) {
        var baseMore = baseInfoEditor.getDom('#step1-more'),
            btnMoreDownIcon = baseInfoEditor.getDom('#moreInforBtn .down'),
            btnMoreUpIcon = baseInfoEditor.getDom('#moreInforBtn .up'),
            txtStature = baseInfoEditor.getElement('txtStature'),
            txtAvoirdupois = baseInfoEditor.getElement('txtAvoirdupois');
        if (f || baseMore.is(':hidden')) {
            txtStature.val(txtStatureData);
            txtAvoirdupois.val(txtAvoirdupoisData);
            baseMore.show();
            btnMoreDownIcon.hide();
            btnMoreUpIcon.show();
        } else {
            baseMore.hide();
            txtStatureData = txtStature.val();
            txtAvoirdupoisData = txtAvoirdupois.val();
            txtStature.val('');
            txtAvoirdupois.val('');
            btnMoreDownIcon.show();
            btnMoreUpIcon.hide();
        }
    }

    function calcWorkYear(value) {
        var year, month;

        if (text) {
            value = value.split('/');
            year = value[0],
                month = value[1];
        }
        var startMonth = month || baseInfoEditor.getElement('inpStartMonth').val(),
            startYear = year || baseInfoEditor.getElement('inpStartYear').val();
        var chkIsWork = $('#chkIsWork').val();
        var timeY = $('#timeY').val();
        var timeM = $('#timeM').val();
        if (chkIsWork == 1) {
            startYear = timeY;
            startMonth = timeM;
        }
        if (parseInt(startYear) && !parseInt(startMonth)) {
            startMonth = 1;
        } else if (!parseInt(startYear) && !parseInt(startMonth)) {
            value = new Date();
            startYear = value.getFullYear();
            startMonth = value.getMonth();
        }

        var dateFormat = new DateFormat(),
            workMonthNum = dateFormat.diffMonth(startYear + '-' + startMonth + '-1');

        var workY = Math.floor(workMonthNum / 12),
            workM = parseInt(workMonthNum % 12),
            workYearDesc = '',
            index = 0,
            text = '';

        if (!isNaN(workMonthNum)) {
            if (workMonthNum > -6 && workMonthNum <= 6) {
                workYearDesc = '应届毕业生';
                index = 1;
                text = '参加工作时间';
            } else if (workY == 0 && workM > 6) {
                workYearDesc = workM + '个月工作经验';
                index = 0;
                text = '参加工作时间';
            } else if (workMonthNum < 7) {
                workYearDesc = '，目前在读';
                index = 1;
                text = '参加工作时间';
            } else {
                workYearDesc = workY + '年工作经验';
                index = 0;
                text = '参加工作时间';
            }
            labelWorkState.text(text);
            workBoxer.setStatus(index, true);
        }
        baseInfoEditor.getDom('#startYMD').text(workYearDesc);
    }

    baseInfoEditor.resetData = function () {
        var dl = this.getDom('.res-infor');
        attr = parseInt(dl.attr('data-chkPhotoOpen'));
        if (attr === 0) {
            chkBase.setStatus(0, true);
        } else {
            chkBase.setStatus(0, false);
        }

        attr = parseInt(dl.attr('data-chkNameOpen'));
        if (attr === 0) {
            chkBase.setStatus(1, true);
        } else {
            chkBase.setStatus(1, false);
        }

        attr = dl.attr('data-idcard');
        if (attr) {
            this.getElement('txtIDCardNumber').val(attr);
        }
        var va = this.getDom("#spnBasicName").text();
        this.getElement('txtUserName').val(va).resetWatermark();
        var attrName = this.getDom('#spnBasicSex');
        if ((attr = attrName.attr('v')) != '') {
            sexNameBoxer.setStatus(attr - 1, true);
        } else {
            sexNameBoxer.all(false);
        }
        if (attr = this.getDom('#spnBasicAge').attr('v')) {
            var birthday = new Date(attr);
            this.getElement('inpBirthYear').val(birthday.getFullYear());
            this.getElement('inpBirthMonth').val(birthday.getMonth() + 1);
            this.getElement('inpBirthDate').val(birthday.getDate());
        } else {
            this.getElement('inpBirthYear').val('年');
            this.getElement('inpBirthMonth').val('月');
            this.getElement('inpBirthDate').val('日');
        }
        if (attr = this.getDom('#spnWorkYear').text()) {
            this.getDom('#startYMD').html(attr);
        } else {
            this.getDom('#startYMD').html('');
        }
        if (attr = this.getDom('#spnWorkYear').attr('v')) {
            var split = attr.split('/');
            this.getElement('inpStartYear').val(split[0]);
            this.getElement('inpStartMonth').val(split[1]);
            calcWorkYear(attr);
        } else {
            this.getElement('inpStartYear').val('年');
            this.getElement('inpStartMonth').val('月');
            calcWorkYear('年/月');
        }
        if (attr = this.getDom("#spnApplyStatus").attr("v")) {
            dropApplyStatus.setSelectedIndex(attr);
        }
        if (attr = this.getDom("#spnAccessionTime").attr("v")) {
            dropAccessionTime.setSelectedIndex(attr);
        }
        if (attr = this.getDom("#spnDropdegree").attr("v")) {
            if (attr >= '05') {
                attr = attr - 1;
            }
            dropdegreeSel.setSelectedIndex(attr);
        }
       /* if (attr = this.getDom('#spnBasicMarriage').attr('v')) {
         var mars = attr.split(',');
         if(mars && mars[0]){
         dropMarriage.setSelectedIndex(mars[0]);
         if(mars[0] == 2){
         dropFertility.setSelectedIndex(mars[1] || 0);
         } else {
         dropFertility.setSelectedIndex(0);
         }
         } else {
         dropMarriage.setSelectedIndex(0);
         dropFertility.setSelectedIndex(0);
         }
         }*/
        if (attr = this.getDom('#spnBasicCurArea').attr('v')) {
            this.getDom('#curArea').setArea(attr);
        }
        /*if(attr = this.getDom('#spnBasicNativeArea').attr('v')){
         this.getDom('#nativePlace').setArea(attr);
         }*/
        if (attr = this.getDom('#spnBasicStature').attr('v')) {
            var stat = attr.split('/');
            txtStatureData = stat[0] || '';
            txtAvoirdupoisData = stat[1] || '';
            toggleBaseMoreInfor(true);
        }
        if((attr = this.getDom('#spnBasicPolitical').attr('v')) != undefined){
         if(attr){
         dropPolitical.setSelectedIndex(attr);
         } else {
         dropPolitical.setSelectedIndex(0);
         }
         }

        phoneCoder.resetTime(true);
        if (phoneValidatorStatus) {
            phoneCoder.disabled();
        } else {
            phoneCoder.txtMobilePhone.val(phoneCoder.txtMobilePhone.attr('v'));
            phoneCoder.remote();
            if (phoneCoder.txtMobilePhone.val()) {
                phoneCoder.unbind();
            } else {
                phoneCoder.initBind();
            }
        }

        phoneCoder.updateBindStatus();
        attr = this.getElement('txtEmail').attr('v');
        var dataBind = parseInt(this.getDom('#spnBasicEmail').attr('data-bind'));
        mailCoder._dataBind = dataBind;
        if (attr) {
            mailCoder.disabled();
        } else {
            mailCoder.initEnabled();
        }

        if (attr = this.getDom('#spnBasicQQ').attr('v')) {
            this.getElement('txtQQ').val(attr);
        } else {
            this.getElement('txtQQ').val('');
        }
        jobDater.update("Birth");
        jobDater.update("Start");
    }
    baseInfoEditor.updatePreview = function (e) {
        var chkBaseValue = chkBase.getValue(true),
            nameopen = chkBaseValue['chkNameOpen'] != undefined ? chkBaseValue['chkNameOpen'][0] : '',
            photoopen = chkBaseValue['chkPhotoOpen'] != undefined ? chkBaseValue['chkPhotoOpen'][0] : '',
            sex = sexNameBoxer.getValue(true)['radSex'] != undefined ? sexNameBoxer.getValue(true)['radSex'][0] : '';

        this.getDom('.res-infor').attr({
            'data-chknameopen': nameopen,
            'data-chkphotoopen': photoopen,
            'data-idcard': this.getElement('txtIDCardNumber').val()
        });

        var attrName = this.getDom('#spnBasicSex');
        attrName.attr('v', sex);
        if (sex == 1) {
            attrName.html('男');
            attrName.addClass('nan');
        } else {
            attrName.html('女');
            attrName.removeClass('nan');
        }

        this.getDom('#spnBasicName').text(this.getElement('txtUserName').val());

        var birthYear = this.getElement('inpBirthYear').val(),
            birthMonth = this.getElement('inpBirthMonth').val(),
            birthDate = this.getElement('inpBirthDate').val();

        var birthDay = birthYear + '/' + birthMonth + '/' + birthDate,
            spnBasicAge = this.getDom('#spnBasicAge'),
            dateFormat = new DateFormat(),
            monthNum = dateFormat.diffMonth(birthYear + '-' + birthMonth + '-1'),
            age = Math.floor(monthNum / 12);

        spnBasicAge.attr('v', birthDay).children('span').text(age);

        var startYear = this.getElement('inpStartYear').val(),
            startMonth = this.getElement('inpStartMonth').val(),
            startDay = startYear + '/' + startMonth + '/01';

        this.getDom('#spnWorkYear').attr('v', startDay).children('span').text(this.getDom('#startYMD').text());

        var spnCurArea = '';
        var areas = this.getDom('#curArea').getAreaNames().join(',');
        for (var i = 0; i < areas.length; i++) {
            spnCurArea += areas[i];
        }
        //this.getDom('#spnBasicCurArea').attr('v','123123');


        var applyStatusValue = dropApplyStatus.get('value') || 0;
        if (applyStatusValue) {
            this.getDom("#spnApplyStatus").html(dropApplyStatus.get('label')).show();
            this.getDom(".applyStatus").show();
        } else {
            this.getDom("#spnApplyStatus").html('').hide();
            this.getDom(".applyStatus").hide();
        }

        var accessionTimeValue = dropAccessionTime.get('value') || 0,
            accessionTimeDom = this.getDom('#spnAccessionTime');

        var degreeValue = dropdegreeSel.get('value') || 0,
            degreeDom = this.getDom('#spnDropdegree');

        accessionTimeDom.attr('v', accessionTimeValue);
        var accessionTimeCDom = this.getDom('.accessionTime');

        degreeDom.attr('v', degreeValue);
        var degreeCDom = this.getDom('.degree');

        if (accessionTimeValue) {
            accessionTimeDom.html(dropAccessionTime.get('label'));
            accessionTimeCDom.show();
        } else {
            accessionTimeCDom.hide();
            accessionTimeDom.html('');
        }
        if (degreeValue) {
            degreeDom.html(dropdegreeSel.get('label'));
            degreeCDom.show();
        } else {
            degreeCDom.hide();
            degreeDom.html('');
        }
        var spnCurArea = '';
        var areas = this.getDom('#curArea').getAreaNames().join(',');
        for (var i = 0; i < areas.length; i++) {
            spnCurArea += areas[i];
        }
        this.getDom('#spnBasicCurArea').attr('v', this.getElement('hidCurArea').val()).html(spnCurArea);

        /*var spnNativeArea = this.getDom('#nativePlace').getAreaNames().join(',');
         if(!spnNativeArea.length){
         spnNativeArea = noField;
         }
         this.getDom('#spnBasicNativeArea').attr('v', this.getElement('hidNativePlace').val()).html(spnNativeArea);*/

         /*var dropMLabel = dropMarriage.get('label'),
         dropFLabel = dropFertility.get('label'),
         dropMValue = dropMarriage.get('value'),
         dropFValue = dropFertility.get('value'),
         dropValue = "",
         dropLabel = "";

         if(dropMValue){
         dropValue += dropMValue;
         dropLabel += dropMLabel;
         if(dropFValue){
         dropValue += ',' + dropFValue;
         dropLabel += dropFLabel;
         }
         this.getDom('#spnBasicMarriage').attr('v', dropValue).text(dropLabel);
         } else {
         this.getDom('#spnBasicMarriage').attr('v', '').html('婚育状况：' + noFields);
         }*/

        var txtStature = this.getElement('txtStature').val(),
            txtAvoirdupois = this.getElement('txtAvoirdupois').val(),
            txtS = '', txtL = '';
        if (txtStature) {
            txtS += txtStature;
            txtL += txtStature + 'cm';
        }
        /*txtS = '';
         if(txtAvoirdupois){
         if(txtStature){
         txtL += '';
         }
         txtS += txtAvoirdupois;

         }*/
        txtStatureData = txtStature;
        //txtAvoirdupoisData = txtAvoirdupois;

        toggleBaseMoreInfor(true);
        this.getDom('#spnBasicStature').attr('v', txtS).text(txtL);
        var is_Kg = 'Kg';
        if (txtAvoirdupois == '') {
            is_Kg = '';
            var nullTxtAvoirdupois = '体重：' + noFields;
        } else {
            var nullTxtAvoirdupois = '';
        }
        this.getDom('#spnAvoirdupois').attr('v', txtAvoirdupois).html(txtAvoirdupois+nullTxtAvoirdupois+is_Kg);
         var poilLabel = dropPolitical.get('selectedIndex') ? dropPolitical.get('label') : ('政治面貌：' + noFields),
         poilValue = dropPolitical.get('value');

         this.getDom('#spnBasicPolitical').attr('v', poilValue).html(poilLabel);

        phoneValidatorStatus = parseInt(e.mobile_phone_is_validation);
        var phoneSpan = this.getDom('#spnBasicMobilePhone');

        attr = phoneCoder.txtMobilePhone.val();
        phoneSpan.attr('data-bind', phoneValidatorStatus).show().children('strong').html(attr);

        searchAttribution(attr);
        phoneCoder.txtMobilePhone.attr('v', attr);
        phoneCoder.resetTime(true);
        phoneCoder.clearInput(true);
        if (phoneValidatorStatus) {
            phoneCoder.disabled();
        } else {
            phoneCoder.remote();
            if (attr) {
                phoneCoder.unbind();
            } else {
                phoneCoder.initBind();
            }
        }

        phoneCoder.updateBindStatus();

        var dataBind = 0,
            mailSpan = this.getDom('#spnBasicEmail'),
            txtMail = this.getElement('txtEmail'),
            //txtMailValue = txtMail.attr('v');
            txtMailValue = txtMail.val();
        mailCoder._dataBind = dataBind;
        txtMail.attr('v', txtMailValue);
        mailSpan.attr('data-bind', dataBind).children('strong').text(txtMailValue);
        if (txtMailValue) {
            mailCoder.disabled();
        }
        if (dataBind) {
            mailSpan.children('i').removeClass('noe').addClass('e');
        } else {
            mailSpan.children('i').addClass('noe').removeClass('e');
        }
        var txtQQ = this.getElement('txtQQ').val();
        this.getDom('#spnBasicQQ').attr('v', txtQQ).css('display', txtQQ ? '' : 'none')
            .children('strong').text(txtQQ || noField);
        this.getDom('#spnBasicEmail').html(txtMailValue || noFields);
        updateRightSideList(0, true);
        this.show();
    }
    baseInfoEditor.on('init', function () {
        var self = this;
        chkBase = new checkBoxer({
            element: this.getDom('.icon-chck'),
            className: 'icon-chck-checked'
        });
        sexNameBoxer = new checkBoxer({
            element: this.getDom('.icon-sex'),
            className: 'icon-sex-checked',
            multiple: false
        });
        workBoxer = new checkBoxer({
            element: this.getDom('.icon-rad'),
            className: 'icon-rad-checked',
            multiple: false
        });
        /*dropMarriage = new select({
         trigger: this.getDom('#dropMarriage'),
         className: 'dropv2_select',
         align: {baseXY: [0, '100%-1']},
         selectName: 'hidMarriage',
         dataSource: marriageItems,
         selectIndex:0,
         selectCallback: {
         isDefault: true
         }
         });
         dropFertility = new select({
         trigger: this.getDom('#dropFertility'),
         className: 'dropv2_select',
         align: {baseXY: [0, '100%-1']},
         selectName: 'hidFertility',
         dataSource: fertilityItems,
         selectIndex:0,
         selectCallback: {
         isDefault: true
         }
         });*/
        dropPolitical = new select({
         trigger: this.getDom('#dropPolitical'),
         className: 'dropv2_select',
         align: {baseXY: [0, '100%-1']},
         selectName: 'hidPolitical',
         dataSource: politicalItems,
         selectedIndex: 0,
         selectCallback: {
         isDefault: true
         }
         });
        dropApplyStatus = new select({
            trigger: this.getDom('#dropApplyStatus'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidApplyStatus',
            dataSource: applyStatusItems,
            selectedIndex: 0,
            selectCallback: {
                isDefault: true
            }
        });
        dropAccessionTime = new select({
            trigger: this.getDom('#dropAccessionTime'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidAccessionTime',
            dataSource: accessionTimeItems,
            selectedIndex: 0,
            selectCallback: {
                isDefault: true
            }
        });
        dropdegreeSel = new select({
            trigger: $('#highestdegree'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hiddegree',
            dataSource: degreeitems,
            selectCallback: {
                isDefault: true
            }
        });

        var accessiondl = dropAccessionTime.get("trigger").closest("dl");
        if (dropApplyStatus.get("selectedValue") == notconsider) {
            baseInfoValidator.removeRules('hidAccessionTime');
            accessiondl.hide();
            dropAccessionTime.setSelectedIndex(0);
        } else {
            if (accessiondl.is(":hidden")) {
                baseInfoValidator.resetElement(baseInfoEditor.getElement('hidAccessionTime')[0]);
                baseInfoValidator.addRules(hidAccessionTimeRules);
                baseInfoValidator.addErrorMessages(hidAccessionTimeMsg);
                accessiondl.show();
            }
        }

        dropApplyStatus.on("change", function (e) {
            if (e.value == notconsider) {
                baseInfoValidator.removeRules('hidAccessionTime');
                accessiondl.hide();
                dropAccessionTime.setSelectedIndex(0);
            } else {
                if (accessiondl.is(":hidden") && !dropApplyStatus.get("trigger").closest("dl").is(":hidden")) {
                    baseInfoValidator.resetElement(baseInfoEditor.getElement('hidAccessionTime')[0]);
                    baseInfoValidator.addRules(hidAccessionTimeRules);
                    baseInfoValidator.addErrorMessages(hidAccessionTimeMsg);
                    accessiondl.show();
                }
            }
        });
        dropAccessionTime.on("change", function (e) {
            baseInfoValidator.checkElement(baseInfoEditor.getElement('hidAccessionTime')[0]);
        });
        dropdegreeSel.on("change", function (e) {
            baseInfoValidator.checkElement(baseInfoEditor.getElement('hiddegree')[0]);
        });
       /* if(dropMarriage.get('selectedIndex') == 2){
         if(dropFertility.get('trigger').has(':hidden')){
         dropFertility.get('trigger').show();
         }
         } else {
         dropFertility.get('trigger').hide();
         dropFertility.setSelectedIndex(0);
         }
         dropMarriage.on('change', function(e){
         var trigger = dropFertility.get('trigger');
         if(e.index == 2){
         if(trigger.has(':hidden')){
         trigger.show();
         }
         } else {
         trigger.hide();
         dropFertility.setSelectedIndex(0);
         }
         });*/

        sexNameBoxer.on('select', function (e) {
            baseInfoValidator.checkElement(e.target[0]);
        });
        workBoxer.on('select', function (e) {
            baseInfoValidator.checkElement(e.target[0]);
            var applystatusdl = dropApplyStatus.get("trigger").closest("dl");
            var accessiontimedl = dropAccessionTime.get("trigger").closest("dl");
            if (e.index) {
                labelWorkState.text('毕业时间');
            } else {
                labelWorkState.text('参加工作时间');
            }
        });
        jobDater.bind({
            id: "Birth", dateEntry: [0, 1, 2], size: 20,
            min: -75, max: -16,
            onSelect: function (e) {
                self.checkElement($(e.target)[0]);
                if (e.next && e.next.length) {
                    baseInfoValidator.checkElement($(e.next)[0]);
                } else {
                    baseInfoValidator.checkElement(self.getElement('inpBirthYear')[0]);
                }
            },
            noSelect: function (e) {
                baseInfoValidator.checkElement($(e.target)[0]);
            }
        });
        jobDater.bind({
            id: "Start",
            dateEntry: [0, 1, 2],
            size: 20,
            min: 1949 - (new Date()).getFullYear() - 1,
            //max: 2,
            onSelect: function (e) {
                baseInfoValidator.checkElement($(e.target)[0]);
                if (e.next && e.next.length) {
                    baseInfoValidator.checkElement($(e.next)[0]);
                } else {
                    baseInfoValidator.checkElement(self.getElement('inpStartYear')[0]);
                }
                calcWorkYear();
            },
            noSelect: function (e) {
                baseInfoValidator.checkElement($(e.target)[0]);
            }
        });
        calcWorkYear();

        this.getDom('#curArea').singleArea({
            hddName: 'hidCurArea',
            showLevel: 4,
            controlClass: 'zIndex',
            onSelect: function () {
                baseInfoValidator.checkElement(self.getElement('hidCurArea')[0]);
            },
            noSelect: function () {
                baseInfoValidator.checkElement(self.getElement('hidCurArea')[0]);
            }

        });

        /*this.getDom('#nativePlace').singleArea({
         hddName:'hidNativePlace',showLevel:2,controlClass:'zIndex'
         });*/
        this.getDom('#moreInforBtn').on('click', function () {
            toggleBaseMoreInfor();
        });
        this.resetData();
    });

    baseInfoEditor.on('cancel', function (e) {
        if (is_new == 1) {
            ConfirmBox.confirm("确定退出本次创建简历？", "提示", function (obj) {
                this.hide();
                window.location.href = person_url;
            }, function () {
                window.location.reload();
            }, {width: 300});

        } else {
            this.resetData();
        }

    });
    baseInfoEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    baseInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton,
            self = this;

        baseInfoValidator.submit({
            callback: function (valid) {
                if (phoneCoder.isSubmit) {
                    delete phoneCoder.isSubmit;
                    return;
                }
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: {
                        resume_id: resume_id
                    },
                    success: function (result) {
                        delete phoneCoder.isSubmit;
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        phoneCoder.checkPhone(true);
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        parent.$('#user').html(result.user_name+'<span class="icon"></span>');
                        baseInfoEditor.updatePreview(result);
                        var chkWorkYear = $('#chkIsWork').val();
                        if (chkWorkYear == 1) {
                            $('#spnWorkYear').html('<span>尚未工作</span>');
                        }
                        $('#baseInfoEditor').html($('#txtEmail').attr('v'));

                        // if (resume_id == 0) {
                        //     window.location.href = reload_url + result.resumeID;
                        // }

                        window.parent.preview_resume_iframe_reload();

                    }, clearForm: false
                });
            },
            errorback: function () {
                delete phoneCoder.isSubmit;
            }
        });
    }
    baseInfoEditor.on('focus', function (e) {
        if (e.name === "txtMobilePhone") {
            phoneCoder.focusMobile();
        }
    });
    baseInfoEditor.on('blur', function (e) {
        if (e.name === "txtMobilePhone") {
            phoneCoder.blurMobile();
        }
    });
    baseInfoEditor.on('remote', function (e) {
    });
    baseInfoEditor.on('pass', function (e) {
        if (e.name === "txtMobilePhone") {
            if (phoneCoder.isRemoteClass) {
                phoneCoder.checkPhone(true);
            } else {
                phoneCoder.checkPhone();
            }
            if (phoneCoder.isRemoteClass || baseInfoValidator.isFormSubmitted()) {
                if (!phoneCoder.isRemoteClass && baseInfoValidator.isFormSubmitted() && !phoneCoder.isSubmit && !phoneCoder.isSuccess) {
                    phoneCoder.isSubmit = true;
                    baseInfoValidator.checkElement(phoneCoder.txtValidateCode[0]);
                    delete phoneCoder.isSuccess;
                } else {
                    delete phoneCoder.isSubmit;
                }
            } else {
                delete phoneCoder.isSubmit;
            }
            phoneCoder.success();
        } else if (e.name === "txtValidateCode") {
            e.label.addClass(e.successLabelClass);
            if (phoneCoder.isRemoteClass) {
                phoneCoder.insertLabel();
            } else {
                phoneCoder.insertLabel(true);
            }
        } else if (e.name === "txtEmail") {
            e.label.addClass(e.successLabelClass);
            mailCoder.insertLabel();
            e.target.attr('v', e.target.val());
        }
    });
    baseInfoEditor.on('invalid', function (e) {
        if (e.name === "txtMobilePhone") {
            phoneCoder.insertLabel(true);
            if (!phoneValidatorStatus) {
                phoneCoder.error();
            }
        } else if (e.name === "txtEmail") {
            mailCoder.insertLabel(true);
        }
    });
    /*基本资料*/

    /*求职意向*/
    var jobInfoRules = {
            //hidJobtype: 'required',
            /*txtStation: {
             required:true,
             range:[2,20]
             },*/
            hidJobsort: {required: true},
            hidAreaMultiple: {required: true},
            //hidJoblevel: 'required',
            hidSalary: 'required'
        },
        jobInfoErrorMsg = {
            /*hidJobtype: '<em></em><i></i>请选择工作类型',*/
            /*txtStation:{
             required:'<em></em><i></i>请填写意向职位',
             range:'<em></em><i></i>2-20个字'
             },*/
            hidJobsort: '<em></em><i></i>请选择职位类别',
            hidAreaMultiple: '<em></em><i></i>请选择工作地区',
            /*hidJoblevel:'<em></em><i></i>请选择岗位级别',*/
            hidSalary: '<em></em><i></i>请选择期望月薪'
        };
    var jobInfoEditor = new editResume({
        element: $('#jobInfor'),
        normalName: '.resume-item',
        validators: {
            rules: jobInfoRules,
            errorMessages: jobInfoErrorMsg,
            errorElement: '',
            keepKey: true
        }
    });

    var jobTypeBoxer, chkJob,
        dropJobLevelSel, dropSalarySel,
        jobsortBox, jobsortHistory,
        jobInfoValidator = jobInfoEditor.getValidator();

    jobInfoEditor.get('element').on('mouseenter', '#alt-img', function (e) {
        var target = $(e.currentTarget);
        target.css({"background-position": "0 0"});
        $("#alt-box").show().css({"left": $(this).offset().left - 50, "top": $(this).offset().top + 29});
    }).on('mouseleave', '#alt-img', function (e) {
        var target = $(e.currentTarget);
        target.css({"background-position": "-22px 0"});
        $("#alt-box").hide();
    });

    jobInfoEditor.updatePreview = function () {
        var jobInten = this.getDom('.job-inten'),
            jobType = jobTypeBoxer.getValue(true)['hidJobtype'] != undefined ? jobTypeBoxer.getValue(true)['hidJobtype'][0] : '',
            chkJobValue = chkJob.getValue(true),
            chkParttime = chkJobValue['chkParttime'] != undefined ? chkJobValue['chkParttime'][0] : '';

        this.getDom('#spnAcceptParttime').attr({
            'v': jobType,
            'v1': chkParttime
        }).text(chkParttime ? '' : '');

        /*var value = this.getElement('txtStation').val();
         this.getDom('#spnStation').attr('v', value).text(value);*/

        //职位类别
        //console.log(jobsortBox.getValue());
        var jobsortStr = [],
            jobsortArray = jobsortBox.getValue().array,
            jobsortObject = jobsortBox.getValue().object;

        for (var i = 0; i < jobsortArray.length; i++) {
            jobsortStr.push(jobsortObject[jobsortArray[i]]);
        }
        this.getDom('#expectJobsort').text(jobsortStr.join(',')).attr('v', jobsortArray ? jobsortArray.join(',') : '');
        //岗位级别
        /*var jobLabel = dropJobLevelSel.get('label'),
         jobValue = dropJobLevelSel.get('value');*/

        /*this.getDom('#spnJobLevel').attr('v', jobValue).text(jobLabel=='请选择'? '级别不限':jobLabel);
         var chkJobLevel = chkJobValue['chkJobLevel'] != undefined ? chkJobValue['chkJobLevel'][0] : '';
         this.getDom('#spnAcceptLowerJobLevel').attr('v', chkJobLevel).text(chkJobLevel ? '（不低于此级别）' : '');*/

        //期望行业
        /*var callingStr = '';
         var callingId = '';
         var calling = this.getDom('#dropCalling').getCallingValue();
         for(var j = 0;j < calling.length;j++){
         if(j == calling.length-1){
         callingStr += calling[j].split(',')[1];
         callingId += calling[j].split(',')[0];
         }else{
         callingStr += calling[j].split(',')[1]+',';
         callingId +=calling[j].split(',')[0]+',';
         }
         }
         if (callingStr == "") callingStr = "不限行业";
         this.getDom('#expectCalling').text(callingStr).attr('v', callingId);*/

        //期望薪资
        var chkSalaryShow = chkJobValue['chkSalaryShow'] != undefined ? chkJobValue['chkSalaryShow'][0] : '',
            salaryValue = dropSalarySel.get('value'),
            salarySpan = this.getDom('#spnSalary').attr('v', salaryValue),
            chkSalary = chkJobValue['chkSalary'] != undefined ? chkJobValue['chkSalary'][0] : '',
            lowerSalarySpan = this.getDom('#spnAcceptLowerSalary').attr('v', chkSalary);

        jobInten.attr('data-salaryshow', chkSalaryShow);
        if (chkSalaryShow) {

            var salaryHTML = [
                '面议',
                '<b>（实际期望' + dropSalarySel.get('label').replace('及', '元/月及') + '）</b>',
                '<a href="javascript:void(0)" id="alt-img" style="background-position: -22px 0px;"></a>'
            ].join('');

            salarySpan.html(salaryHTML);
            lowerSalarySpan.text('');
        } else {
            var salaryLabel = dropSalarySel.get('label');
            salarySpan.text(salaryLabel);
            lowerSalarySpan.text(chkSalary ? '（不低于此薪资）' : '');
        }

        //地区
        var areaStr = '';
        var areaSpecialStr = '';
        var areaId = '';
        var area = this.getDom('#dropAreaMultiple').getMultipleareaValue();
        for (var k = 0; k < area.length; k++) {
            if (k == area.length - 1) {
                areaStr += area[k].name;
                areaId += area[k].ids;
            } else {
                areaStr += area[k].name + ',';
                areaId += area[k].ids + ',';
            }
        }
        this.getDom('#expectArea').text(areaStr).attr('v', areaId);
        updateRightSideList(1, true);
        this.show();
    }
    function togglePartime(e) {
        var chkParttime = jobInfoEditor.getDom('#chkParttime'),
            jobType = e ? e.index :
                jobTypeBoxer.getValue(true)['hidJobtype'] != undefined ? jobTypeBoxer.getValue(true)['hidJobtype'][0] : '';

        chkJob.setStatus(0, false);
        if (jobType != 1) {
            chkParttime.show();
        } else {
            chkParttime.hide();
        }
    }

    jobInfoEditor.toggleSalary = function (index) {
        if (index < 3) {
            chkJob.setStatus(1, false);
            chkJob.getElement().eq(1).hide();
        } else {
            chkJob.getElement().eq(1).show();
        }
    }
    jobInfoEditor.resetData = function (f) {
        var ul = this.getDom('.job-inten'),
            attr = attr = ul.attr('data-salaryShow');

        if (parseInt(attr)) {
            chkJob.setStatus(1, true);
        } else {
            chkJob.setStatus(3, false);
        }

        /*attr = this.getDom('#spnStation').attr('v');
         this.getElement('txtStation').val(attr).resetWatermark();*/

        ul = this.getDom('#spnAcceptParttime');
        attr = ul.attr('v');
        if (attr > 0) {
            jobTypeBoxer.setStatus(attr - 1, true);
        } else {
            jobTypeBoxer.setStatus(0, true);
        }

        /*if(attr = this.getDom('#spnJobLevel').attr('v')){
         dropJobLevelSel.setSelectedIndex(attr, true);
         } else {
         dropJobLevelSel.setSelectedIndex(0, true);
         }
         this.toggleSalary(dropJobLevelSel.get('selectedIndex'));*/

        attr = parseInt(ul.attr('v1'));
        if (attr) {
            chkJob.setStatus(0, true);
        } else {
            chkJob.setStatus(0, false);
        }

        //this.getDom('#dropJobsort').resetJobsortValue();
        attr = this.getDom('#expectJobsort').attr('v');
        if (!f && attr) {
            var eventObj;
            jobsortBox.clearAllItem();
            $.each(jobsortHistory, function (key, val) {
                eventObj = {
                    label: val,
                    value: key
                }
                jobsortBox.addItem(eventObj);
            });
            jobsortBox.updateData();
            //this.getDom('#dropJobsort').setJobSortValue(attr);
        }

        // attr = parseInt(this.getDom('#spnAcceptLowerJobLevel').attr('v'));
        // if (attr) {
        //     chkJob.setStatus(1, true);
        // } else {
        //     chkJob.setStatus(1, false);
        // }

        /*this.getDom('#dropCalling').resetCallingValue();
         if(attr = this.getDom('#expectCalling').attr('v')){
         this.getDom('#dropCalling').setCallingValue(attr);
         }*/

        if (attr = this.getDom('#spnSalary').attr('v')) {
            dropSalarySel.setSelectedIndex(attr, true);
        } else {
            dropSalarySel.setSelectedIndex(0, true);
        }

        attr = parseInt(this.getDom('#spnAcceptLowerSalary').attr('v'));
        if (attr) {
            chkJob.setStatus(0, true);
        } else {
            chkJob.setStatus(0, false);
        }
        this.getDom('#dropAreaMultiple').resetMultipleareaValue();
        if (attr = this.getDom('#expectArea').attr('v')) {
            this.getDom('#dropAreaMultiple').setMultipleAreaValue(attr);
        }
    }
    jobInfoEditor.on('init', function () {
        jobTypeBoxer = new checkBoxer({
            element: this.getDom('.icon-rad'),
            className: 'icon-rad-checked',
            multiple: false
        });
        chkJob = new checkBoxer({
            element: this.getDom('.icon-chck'),
            className: 'icon-chck-checked'
        });
        /*dropJobLevelSel = new select({
         trigger: this.getDom('#dropJobLevel'),
         className: 'dropv2_select',
         align: {baseXY: [0, '100%-1']},
         selectName: 'hidJoblevel',
         dataSource:joblevelItems,
         selectedIndex: 0,
         isHidDefault: true,
         selectCallback: {
         isDefault: true
         }
         });*/
        dropSalarySel = new select({
            trigger: $('#dropSalary'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidSalary',
            dataSource: salaryItems,
            maxHeight: 200,
            selectedIndex: 0,
            isHidDefault: true,
            selectCallback: {
                isDefault: true
            }
        });

        jobsortBox = new jobSorter({
            triger: this.getDom('#dropJobsort'),
            selectedId: this.getDom('#expectJobsort').attr('v') || null,
            search: {
                dataSource: '//www.huibo.com/jobsort/searchJobsort?jobSortName={{query}}&pageSize={{pageSize}}&callback=jobsortcallback',
                size: 10
            }
        });

        var self = this;
        /*jobTypeBoxer.on('select', function(e){
         jobInfoValidator.checkElement(e.target[0]);
         togglePartime(e);
         if(e.index === 2){
         dropJobLevelSel.setSelectedIndex(1);
         }
         });*/
        /*dropJobLevelSel.on('change', function(e){
         jobInfoValidator.checkElement(self.getElement('hidJoblevel')[0]);
         self.toggleSalary(e.index);
         });*/
        dropSalarySel.on('change', function (e) {
            jobInfoValidator.checkElement(self.getElement('hidSalary')[0]);
        });
        jobsortBox.on('submit', function (e) {
            jobInfoValidator.checkElement(self.getElement('hidJobsort')[0]);
        });

        /*this.getDom('#dropJobsort').jobsort({
         max:5,hddName:'hidJobsort',
         isLimit:true,
         onSelect:function(){
         var values = $('#dropJobsort').getJobSortValue();
         jobInfoValidator.checkElement(self.getElement('hidJobsort')[0]);
         }
         });*/

        /*this.getDom('#dropCalling').calling({
         max:5,hddName:'hidCalling',
         isLimit:true,
         unLimitedLevel:3
         });*/
        this.getDom("#dropAreaMultiple").multiplearea({
            hddName: 'hidAreaMultiple', max: 5,
            isLimit: true,
            onSelect: function () {
                jobInfoValidator.checkElement(self.getElement('hidAreaMultiple')[0]);
            }
        });
        this.resetData(true);
    });
    jobInfoEditor.on('modify', function (e) {
        if (e.status) {
            jobsortHistory = $.extend({}, jobsortBox.getValue().object);
        }
    });
    jobInfoEditor.on('cancel', function (e) {
        this.resetData();
    });
    jobInfoEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    jobInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton,
            self = this;
        jobInfoValidator.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: {
                        resume_id: resume_id
                    },
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        $('#spnStationC').removeClass('wh-ccc');
                        $('#spnStation').removeClass('wh-ccc');
                        $('.electTemplate1').attr('data-va', 1);
                        jobInfoEditor.updatePreview();
                        /*	if (result.is_default==1&&!result.station&&first_open_mode!=1) {
                         ConfirmBox.confirm("你的简历默认为隐藏状态，只有主动投递的企业才能查看你的简历。简历公开后，企业可以搜索到你的简历，更容易被HR发掘。确定要公开吗？","提示",function(obj){
                         this.hide();
                         $.getJSON('/hbResume/EditResumeOpenMode', {resume_id:result.resume_id,open_mode:1}, function (e) {
                         console.log(e);
                         if(e.code) {
                         ConfirmBox.timeBomb(e.msg, {
                         name: 'success',
                         timeout : 1000,
                         width: 70 + e.msg.length * 18,
                         callback : function (e1) {
                         window.location.href = reload_url+result.resume_id;
                         }
                         });

                         }else{
                         ConfirmBox.timeBomb(e.msg, {
                         name: 'fail',
                         timeout : 1000,
                         width: 70 + e.msg.length * 18,
                         callback : function (e1) {
                         window.location.href = reload_url+result.resume_id;
                         }
                         });
                         }
                         });
                         },{width:300});
                         }else{
                         window.location.href = reload_url+result.resume_id;
                         }*/
                        // window.location.href = reload_url+result.resume_id;
                        window.parent.preview_resume_iframe_reload();
                    }, clearForm: false
                });
            }
        });
    }
    /*求职意向*/

    /*自我评价*/
    var appraiseRules = {
            txtAppraise: {
                range: [10, 300]
            }
        },
        appraiseErrorMsg = {
            txtAppraise: '<em></em><i></i>请输入10-300字'
        };

    var appraiseEditor = new editResume({
            element: $('#appraiseInfor'),
            normalName: '.resume-item',
            validators: {
                rules: appraiseRules,
                errorMessages: appraiseErrorMsg,
                errorElement: '',
                keepKey: true,
                isCache: false
            }
        }),
        appraiseValidator = appraiseEditor.getValidator();

    appraiseEditor.clearData = function () {
        this.resetForm(true);
        this.getElement('txtAppraise').resetWatermark();
    }
    var appraiseTemplate = [
            '<p class="infor"><span class="topicContent">{content}</span></p>',
        ].join(''),
        appraisetit = appraiseEditor.getDom('.resume-tit');

    appraiseEditor.updatePreview = function (e) {
        var appraise = this._normal.children('.other-box'),
            dataObj = {
                content: this.getElement('txtAppraise').val()
            };

        appraisetit.attr('data-content', dataObj.content);
        if (dataObj.content) {
            appraise.show();
            if (appraise.children().length) {
                this.getDom('.appraiseContent').html(dataObj.content.replace(/\n/g, "<br/>"));
            } else {
                appraise.html(util.string.replace(appraiseTemplate, dataObj));
            }
        } else {
            appraise.hide();
            if (appraise.children().length) {
                this.getDom('.appraiseContent').html(dataObj.content.replace(/\n/g, "<br/>"));
            } else {
                appraise.empty();
            }
        }
        updateRightSideList(4, true);
        this.show();
    }
    appraiseEditor.resetData = function () {
        var attr = appraisetit.attr('data-content');
        if (attr) {
            this.getElement('txtAppraise').val(attr);
        }
    }
    appraiseEditor.on('init', function () {
        appraiseValidator.addDomCache(true);
        this.resetData();
    });
    appraiseEditor.on('cancel', function () {
        this.resetData();
    });
    appraiseEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    appraiseEditor.saveSubmit = function (e) {

        var btn = e ? $(e.currentTarget) : this._submitButton,
            self = this;

        appraiseValidator.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: {
                        resume_id: resume_id
                    },
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        appraiseEditor.updatePreview(result);
                        var txtAppra = $('#txtApprise').val();
                        if (txtAppra == '') {
                            $('#appraAdd').css('display', 'block');
                        } else {
                            $('#appraAdd').css('display', 'none');
                        }
                        window.parent.preview_resume_iframe_reload();
                    }, clearForm: false
                });
            }
        });
    };
    /*自我评价*/

    /*工作经历*/
    var workInfoRules = {
            txtWorkCompanyName: {required: true, range: [4, 30]},
            //hidWorkComSize: 'required',
            //hidWorkComProperty: 'required',
            txtWorkStation: {required: true, range: [2, 12]},
            inpWorkTimeStartYear: 'number',
            inpWorkTimeStartMonth: 'number',
            //hidWorkJobLevel: 'required',
            txtWorkManageDempartment: {max: 60},
            txtWorkSubordinate: {number: true, maxNum: 100000},
            txtWorkReportMan: {range: [1, 10]},
            //txtWorkSalaryMonth: { required: true ,number:true, range:[1, 9999999]},
            taWorkContent: {max: 2000}
        },
        workInfoErrorMsg = {
            txtWorkCompanyName: {
                required: '<i></i>请填写公司名称',
                range: '<i></i>4-30个字'
            },
            hidWorkComSize: '<i></i>请选择公司规模',
            hidWorkComProperty: '<i></i>请选择公司性质',
            txtWorkStation: {
                required: '<i></i>请填写职位名称',
                range: '<i></i>2-12个字'
            },
            inpWorkTimeStartYear: '<i></i>请填写在职时间',
            inpWorkTimeStartMonth: '<i></i>请填写在职时间',
            hidWorkTimeEnd: '<i></i>结束时间大于起始时间',
            hidWorkJobLevel: '<i></i>请选择职位级别',
            txtWorkManageDempartment: '<i></i>管辖范围限定60个字',
            txtWorkSubordinate: '<i></i>请填写正确的下属人数',
            txtWorkReportMan: '<i></i>汇报对象限定10个字',
            txtWorkSalaryMonth: {
                required: '<i></i>请填写税前月薪',
                number: '<i></i>请填写数字',
                range: '<i></i>请填写正确的税前月薪'
            },
            taWorkContent: '<i></i>不超过2000个字'
        },
        workInfoGroups = {
            workComs: 'hidWorkComProperty hidWorkComSize',
            workTime: 'inpWorkTimeStartYear inpWorkTimeStartMonth hidWorkTimeEnd'
        },
        workInfoKeepBlur = [
            'inpWorkTimeStartYear', 'inpWorkTimeStartMonth', 'hidWorkTimeEnd'
        ].join(' ');
    var workInfoEditor = new editMutilResume({
            validators: {
                rules: workInfoRules,
                errorMessages: workInfoErrorMsg,
                errorElement: '',
                groups: workInfoGroups,
                keepBlur: workInfoKeepBlur,
                keepKey: true,
                isCache: false
            }
        }),
        workInfoValidator = workInfoEditor.getValidator(),
        selWorkComProperty, selWorkComSize, chkWords,
        selWorkJobType, selWorkJoblevel, workTimeDater;

    function laterThan(element, param) {
        var context = param['context'],
            startTime = context.getElement(param['startName']).val(),
            endTime = element.val();
        if (param['chkName'].isChecked(param['index'] || 0)) {
            var now = new Date();
            endTime = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100;
            context.getElement(param['endName']).val(endTime);
        }
        return endTime > startTime;
    }

    workInfoEditor._normalUL = workInfoEditor.getDom('.exper');
    workInfoEditor._normalNoData = workInfoEditor.getDom('.no-data');
    workInfoEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            if (!this._edit.closest('.exper').length) {
                this._normalUL.hide();
            }
        }
        updateRightSideList(2, e);
    };
    workInfoEditor.toggleNoData = function (e) {
        if (e) {
            this._normalNoData.hide();
        } else {
            this._normalNoData.show();
        }
    };
    workInfoEditor.clearData = function () {
        this.resetForm(true);
        if (!selWorkComProperty) return;
        selWorkComProperty.setSelectedIndex(0, true);
        selWorkComSize.setSelectedIndex(0, true);
        this.getDom('#workCallingContainer').resetCallingValue();
        this.getElement('inpWorkTimeEndYear').prop('disabled', false);
        this.getElement('inpWorkTimeEndMonth').prop('disabled', false);
        chkWords.all(false);
        selWorkJobType.setSelectedIndex(0, true);
        selWorkJoblevel.setSelectedIndex(0, true);
        this.toggleManagerExp();
        this.getDom('#workJobsortContainer').resetJobsortValue();
        this.getElement('taWorkContent').resetWatermark();
        jobDater.update("WorkTime");
    };
    var workTemplate1 = [
        '<div class="workRows editPanel clearfix" data-workid="{data-workid}" data-workjobtype="{data-workjobtype}" data-jobsortcontainer="{jobNameValue}" data-founder="{data-founder}" data-salarysecrecy="{data-salarysecrecy}">',
        '<span class="time" data-starttime="{data-starttime}" data-endtime="{data-endtime}">{label-starttime}-{label-endtime}<br>{time}</span>',
        '<div class="box-item">',
        '<p class="tit">',
        '<span class="oper"><a href="javascript:delDo(\'workDel\');" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
        '<strong class="name jobName wh-Strong" v="{jobName}">{label-workjobtype} {jobName}{label-founder}</strong>',
        '</p>',
        '<div class="infor">',
        '<strong class="name companyName ">{companyName}</strong>',
        '<span class="callingContainer" v="{callingContainerValue}">({callingContainerLabel})</span>',
        '<div class="mgt10 cont workContent" v="{workContent}" style="display:{display1}">{label-workContent}</div>',
        '</div></div></div>'
    ].join('');
    var workTemplate2 = [
        '<div class="workRows editPanel clearfix" data-workid="{data-workid}" data-workjobtype="{data-workjobtype}" data-jobsortcontainer="{jobNameValue}" data-founder="{data-founder}" data-salarysecrecy="{data-salarysecrecy}">',
        '<span class="time" data-starttime="{data-starttime}" data-endtime="{data-endtime}">{label-starttime}-{label-endtime}<br>{time}</span>',
        '<div class="box-item">',
        '<p class="tit">',
        '<span class="oper"><a href="javascript:delDo(\'workDel\');" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
        '<strong class="name jobName wh-Strong" v="{jobName}">{label-workjobtype} {jobName}{label-founder}</strong>',
        '</p>',
        '<div class="infor">',
        '<strong class="name companyName ">{companyName}</strong>',
        '<span class="callingContainer" v="{callingContainerValue}">{callingContainerLabel}</span>',
        '<div class="mgt10 cont workContent" v="{workContent}" style="display:{display1}">{label-workContent}</div>',
        '</div></div></div>'
    ].join('');
    workInfoEditor.updatePreview = function (e) {
        var chkValue = chkWords.getValue(true),
            dataObj = {
                'data-workid': e.work_id,
                'jobName': this.getElement('txtWorkStation').val(),
                'data-founder': chkValue['chkIsCreator'] != undefined ? chkValue['chkIsCreator'][0] : '',
                'comPropertyLabel': selWorkComProperty.get('label'),
                'comPropertyValue': selWorkComProperty.get('value'),
                'comSizeLabel': selWorkComSize.get('label'),
                'comSizeValue': selWorkComSize.get('value'),
                'companyName': this.getElement('txtWorkCompanyName').val(),
                'data-workjobtype': selWorkJobType.get('value'),
                'joblevelLabel': selWorkJoblevel.get('label'),
                'joblevelValue': selWorkJoblevel.get('value'),
                'data-salarysecrecy': chkValue['chkWorkSalarySecrecy'] != undefined ? chkValue['chkWorkSalarySecrecy'][0] : ''
            },
            index = this.getIndex();

        var txtValue = this.getElement('txtWorkSalaryMonth').val();
        dataObj['salary'] = txtValue;
        txtValue = chkValue['chkWorkSalarySecrecy'] != undefined ? chkValue['chkWorkSalarySecrecy'][0] : '';
        dataObj['label-salary'] = txtValue ? '薪资保密' : dataObj['salary'] + '元/月';
        var dempartmentValue = '',
            workSubordinateValue = '',
            workReportManValue = '';

        var selIndex = parseInt(dataObj['joblevelValue']);
        if (selIndex >= 4) {
            dempartmentValue = this.getElement('txtWorkManageDempartment').val();
            workSubordinateValue = this.getElement('txtWorkSubordinate').val();
            workReportManValue = this.getElement('txtWorkReportMan').val();
            dataObj['display2'] = dempartmentValue ? 'block' : 'none';
            if (!workSubordinateValue && !workReportManValue) {
                dataObj['display3'] = "none";
            } else {
                dataObj['display3'] = "block";
            }
        } else {
            dataObj['display2'] = 'none';
            dataObj['display3'] = 'none';
        }
        dataObj['dempartment'] = dempartmentValue;
        dataObj['workSubordinate'] = workSubordinateValue;
        dataObj['workReportMan'] = workReportManValue;
        dataObj['label-dempartment'] = dempartmentValue || '未填写';
        dataObj['label-workSubordinate'] = workSubordinateValue || '未填写';
        dataObj['label-workReportMan'] = workReportManValue || '未填写';

        txtValue = this.getElement('taWorkContent').val();
        dataObj['workContent'] = txtValue;
        dataObj['label-workContent'] = txtValue.replace(/\n/g, "<br/>") || ("工作内容：" + noField);
        dataObj['display1'] = dataObj['workContent'] ? 'block' : 'none';

        txtValue = this.getElement('txtWorkLeaveReason').val();
        dataObj['dimContent'] = txtValue;
        dataObj['label-dimContent'] = txtValue || noField;
        dataObj['display4'] = dataObj['dimContent'] ? 'block' : 'none';

        dataObj['label-founder'] = dataObj['data-founder'] ? '[创始人]' : '';

        selIndex = parseInt(selWorkJobType.get('selectedIndex'));
        dataObj['label-workjobtype'] = selIndex ? '<span class="tag">' + selWorkJobType.get('label') + '</span>' : '';
        var startTimeYear = this.getElement('inpWorkTimeStartYear').val(),
            startTimeMonth = this.getElement('inpWorkTimeStartMonth').val(),
            endTimeYear = this.getElement('inpWorkTimeEndYear').val(),
            endTimeMonth = this.getElement('inpWorkTimeEndMonth').val(),
            startTime = startTimeYear + '/' + startTimeMonth + '/1',
            endTime, curDate;

        if (endTimeYear) {
            endTime = endTimeYear + '/' + endTimeMonth + '/1';
            curDate = new Date(endTime);
        } else {
            endTime = '';
            curDate = new Date;
        }
        dataObj['data-starttime'] = startTime;
        dataObj['data-endtime'] = endTime;
        if (startTimeMonth < 10) {
            startTimeMonth = '0' + startTimeMonth;
        }
        if (endTimeMonth < 10) {
            endTimeMonth = '0' + endTimeMonth;
        }
        dataObj['label-starttime'] = startTimeYear + '.' + startTimeMonth;
        dataObj['label-endtime'] = endTime ? endTimeYear + '.' + endTimeMonth : '至今';

        var dateFormat = new DateFormat(curDate);
        var workMonthNum = dateFormat.diffMonth(startTime);
        var workY = Math.floor(workMonthNum / 12),
            workM = parseInt(workMonthNum % 12),
            workYearDesc;

        if (workM == 0 && workY == 0) {
            workYearDesc = '';
        } else if (workM == 0) {
            workYearDesc = '[' + workY + '年' + ']';
        } else {
            workYearDesc = '[' + workY + '年' + workM + '个月' + ']';
        }
        dataObj['time'] = workYearDesc;

        var callingId = this.getDom('#workCallingContainer').getCallingValue();
        var calling_id = '',
            calling_name = '';

        if (callingId.length > 0) {
            var callingArr = callingId[0].split(',');
            calling_id = callingArr[0];
            calling_name = callingArr[1];
        }
        dataObj['callingContainerLabel'] = calling_name;
        dataObj['callingContainerValue'] = calling_id;

        var jobsortID = this.getDom('#workJobsortContainer').getJobSortValue(),
            jobsort_id = '',
            jobsort_name = '';

        if (jobsortID.length > 0) {
            var jobsortArr = jobsortID[0].split(",");
            if (jobsortArr.length > 0) {
                jobsort_id = jobsortArr[0];
                jobsort_name = jobsortArr[1];
            }
        }
        dataObj['jobNameLabel'] = jobsort_name;
        dataObj['jobNameValue'] = jobsort_id;
        if ($('input[name=hddWorkcalling]').val().replace(/(^\s*)|(\s*$)/g, "").length > 0) {
            var workTemplate = workTemplate1;
        } else {
            var workTemplate = workTemplate2;
        }
        if (!this._isAdd) {
            var preview = this._normal.eq(index);
            preview.attr({
                'data-workjobtype': dataObj['data-workjobtype'],
                'data-jobsortcontainer': dataObj['jobNameValue'],
                'data-jobName': dataObj['jobNameLabel'],
                'data-founder': dataObj['data-founder'],
                'data-salarysecrecy': dataObj['data-salarysecrecy']
            });

            var item = preview.find('.fanwei');
            selIndex = parseInt(dataObj['joblevelValue']);
            item.find('.dempartment').attr('v', dataObj['dempartment']).text(dataObj['label-dempartment']);
            item.find('.workSubordinate').attr('v', dataObj['workSubordinate']).text(dataObj['label-workSubordinate']);
            item.find('.workReportMan').attr('v', dataObj['workReportMan']).text(dataObj['label-workReportMan']);
            item = item.children('li');
            if (selIndex >= 4) {
                if (dempartmentValue) {
                    item.eq(0).show();
                } else {
                    item.eq(0).hide();
                }
                if (!workSubordinateValue && !workReportManValue) {
                    item.eq(1).hide();
                } else {
                    item.eq(1).show();
                }
            } else {
                item.eq(0).hide();
                item.eq(1).hide();
            }
            preview.find('.time').attr({
                'data-starttime': dataObj['data-starttime'],
                'data-endtime': dataObj['data-endtime']
            }).html(dataObj['label-starttime'] + '-' + dataObj['label-endtime'] + '<br />' + dataObj['time']);

            preview.find('.tit .jobName').attr('v', dataObj['jobName']).html(dataObj['label-workjobtype'] + ' ' + dataObj['jobName'] + dataObj['label-founder']);
            preview.find('.infor .companyName').text(dataObj['companyName']);
            preview.find('.salary').attr('v', dataObj['salary']).text(dataObj['label-salary']);
            preview.find('.joblevel').attr('v', dataObj['joblevelValue']).text(dataObj['joblevelLabel']);
            preview.find('.comProperty').attr('v', dataObj['comPropertyValue']).text(dataObj['comPropertyLabel']);
            if (dataObj['callingContainerLabel']) {
                preview.find('.callingContainer').attr('v', dataObj['callingContainerValue']).text('(' + dataObj['callingContainerLabel'] + ')');
            } else {
                preview.find('.callingContainer').attr('v', dataObj['callingContainerValue']).text(dataObj['callingContainerLabel']);
            }

            preview.find('.comSize').attr('v', dataObj['comSizeValue']).text(dataObj['comSizeLabel']);

            var tempObj = preview.find('.workContent').attr('v', dataObj['workContent']).html(dataObj['label-workContent']);
            if (dataObj['workContent']) {
                tempObj.show();
            } else {
                tempObj.hide()
            }

            tempObj = preview.find('.dimContent').attr('v', dataObj['dimContent']).text(dataObj['label-dimContent']).parent();
            if (dataObj['dimContent']) {
                tempObj.show();
            } else {
                tempObj.hide();
            }

            this.show();
        } else {
            this.getDom('.exper').prepend(util.string.replace(workTemplate, dataObj));
            this.update();
            this.show();
            delete this._isAdd;
            this.hasNormalData(this._normal.length);
        }
    };
    workInfoEditor.toggleManagerExp = function (e) {
        var txtWorkManageDempartment = this.getElement('txtWorkManageDempartment'),
            txtWorkSubordinate = this.getElement('txtWorkSubordinate'),
            txtWorkReportMan = this.getElement('txtWorkReportMan'),
            index = e ? e.index : selWorkJoblevel.get('selectedIndex'),
            manageExpBox = this.getDom('#manageExpBox');

        if (index >= 4) {
            manageExpBox.show();
        } else {
            manageExpBox.hide();
            txtWorkManageDempartment.val('');
            txtWorkSubordinate.val('');
            txtWorkReportMan.val('');
            //workInfoValidator.resetElement(txtWorkManageDempartment);
            //workInfoValidator.resetElement(txtWorkSubordinate);
            //workInfoValidator.resetElement(txtWorkReportMan);
        }
    };
    workInfoEditor.resetData = function () {
        var index = this.getIndex(), preview;
        if ((preview = this._normal.eq(index)).length) {
            var attr = preview.find('.companyName').text();
            this.getElement('txtWorkCompanyName').val(attr);

            attr = preview.find('.salary').attr('v');
            this.getElement('txtWorkSalaryMonth').val(attr);

            if (attr = preview.find('.joblevel').attr('v')) {
                selWorkJoblevel.setSelectedIndex(attr, true);
            } else {
                selWorkJoblevel.setSelectedIndex(0, true);
            }

            attr = preview.find('.dempartment').attr('v');
            this.getElement('txtWorkManageDempartment').val(attr);
            attr = preview.find('.workSubordinate').attr('v');
            this.getElement('txtWorkSubordinate').val(attr);
            attr = preview.find('.workReportMan').attr('v');
            this.getElement('txtWorkReportMan').val(attr);
            this.toggleManagerExp();

            if (attr = preview.find('.comProperty').attr('v')) {
                selWorkComProperty.setSelectedIndex(attr, true);
            } else {
                selWorkComProperty.setSelectedIndex(0, true);
            }
            if (attr = preview.find('.callingContainer').attr('v')) {
                this.getDom('#workCallingContainer').setCallingValue(attr);
            } else {
                this.getDom('#workCallingContainer').resetCallingValue();
            }

            if (attr = preview.find('.comSize').attr('v')) {
                selWorkComSize.setSelectedIndex(attr, true);
            } else {
                selWorkComSize.setSelectedIndex(0, true);
            }
            if (attr = preview.attr('data-workJobType')) {
                selWorkJobType.setSelectedIndex(attr - 1, true);
            }

            var workTime = preview.find('.time'),
                workStTime = workTime.attr('data-starttime'),
                workEnTime = workTime.attr('data-endtime');

            if (workStTime) {
                workStTime = new Date(workStTime);
                this.getElement('inpWorkTimeStartYear').val(workStTime.getFullYear());
                this.getElement('inpWorkTimeStartMonth').val(workStTime.getMonth() + 1);
                this.getElement('hidWorkTimeStart').val(workStTime.getFullYear() * 10000 + (workStTime.getMonth() + 1) * 100);
            }

            var endTimeYear = this.getElement('inpWorkTimeEndYear'),
                endTimeMonth = this.getElement('inpWorkTimeEndMonth'),
                endTimeInput = this.getElement('hidWorkTimeEnd');
            if (workEnTime) {
                workEnTime = new Date(workEnTime);
                if (util.type.isDate(workEnTime)) {
                    endTimeYear.prop('disabled', false).val(workEnTime.getFullYear());
                    endTimeMonth.prop('disabled', false).val(workEnTime.getMonth() + 1);
                    endTimeInput.val(
                        workEnTime.getFullYear() * 10000 + (workEnTime.getMonth() + 1) * 100
                    );
                    chkWords.setStatus(0, false);
                } else {
                    chkWords.setStatus(0, true);
                    endTimeYear.prop('disabled', true).val('');
                    endTimeMonth.prop('disabled', true).val('');
                    endTimeInput.val(0);
                }
            } else {
                chkWords.setStatus(0, true);
                endTimeYear.prop('disabled', true).val('');
                endTimeMonth.prop('disabled', true).val('');
                endTimeInput.val(0);
            }

            attr = preview.find('.jobName').attr('v');
            this.getElement('txtWorkStation').val(attr);

            this.getDom('#workJobsortContainer').resetJobsortValue();
            if (attr = preview.attr('data-jobsortContainer')) {
                this.getDom('#workJobsortContainer').setJobSortValue(attr);
            }

            attr = parseInt(preview.attr('data-founder'));
            if (attr) {
                chkWords.setStatus(1, true);
            } else {
                chkWords.setStatus(1, false);
            }

            attr = parseInt(preview.attr('data-salarySecrecy'));
            if (attr) {
                chkWords.setStatus(2, true);
            } else {
                chkWords.setStatus(2, false);
            }
            attr = preview.find('.workContent').attr('v');
            this.getElement('taWorkContent').val(attr).resetWatermark();

            attr = preview.find('.dimContent').attr('v');
            this.getElement('txtWorkLeaveReason').val(attr);

            jobDater.update("WorkTime");
        }
    };
    workInfoValidator.addMethod('laterThan', laterThan);
    workInfoEditor.on('init', function () {
        var self = this;
        workInfoValidator.addDomCache(true);
        selWorkComProperty = new select({
            trigger: this.getDom('#selWorkComProperty'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidWorkComProperty',
            dataSource: comPropertyItems,
            selectedIndex: 0,
            isHidDefault: true,
            selectCallback: {
                isDefault: true
            }
        });
        selWorkComSize = new select({
            trigger: this.getDom('#selWorkComSize'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidWorkComSize',
            dataSource: comSizeItems,
            selectedIndex: 0,
            isHidDefault: true,
            selectCallback: {
                isDefault: true
            }
        });
        chkWords = new checkBoxer({
            element: this.getDom('.icon-chck'),
            className: 'icon-chck-checked'
        });
        selWorkJobType = new select({
            trigger: this.getDom('#selWorkJobType'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidWorkJobType',
            dataSource: jobTypeItems,
            selectedIndex: 0
        });
        selWorkJoblevel = new select({
            trigger: this.getDom('#selWorkJoblevel'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidWorkJobLevel',
            dataSource: jobLevelItems,
            selectedIndex: 0,
            isHidDefault: true,
            selectCallback: {
                isDefault: true
            }
        });
        workInfoValidator.addRules('hidWorkTimeEnd', {
                laterThan: {
                    context: workInfoEditor,
                    startName: 'hidWorkTimeStart',
                    endName: 'hidWorkTimeEnd',
                    chkName: chkWords
                }
            }
        );
        selWorkComProperty.on('change', function (e) {
            if (workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0])) {
                workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0]);
            }
            if (workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0])) {
                workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0]);
            }
        });
        selWorkComSize.on('change', function (e) {
            if (workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0])) {
                workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0]);
            }
            if (workInfoValidator.checkElement(self.getElement('hidWorkComSize')[0])) {
                workInfoValidator.checkElement(self.getElement('hidWorkComProperty')[0]);
            }
        });
        chkWords.on('select', function (e) {
            if (!e.index) {
                var endTimeYear = self.getElement('inpWorkTimeEndYear'),
                    endTimeMonth = self.getElement('inpWorkTimeEndMonth'),
                    endTimeInput = self.getElement('hidWorkTimeEnd');
                if (this.isChecked(e.index)) {
                    endTimeYear.val('').prop('disabled', true);
                    endTimeMonth.val('').prop('disabled', true);
                    endTimeInput.val('');
                } else {
                    endTimeYear.prop('disabled', false);
                    endTimeMonth.prop('disabled', false);
                    endTimeInput.val(0);
                }

                if (workInfoValidator.checkElement(self.getElement('inpWorkTimeStartYear')[0]) &&
                    workInfoValidator.checkElement(self.getElement('inpWorkTimeStartMonth'[0]))) {
                    workInfoValidator.checkElement(endTimeInput[0]);
                }
            }
        });

        this.getDom('#workCallingContainer').calling({
            max: 1, hddName: 'hddWorkcalling', isLimit: true,
            unLimitedLevel: 3, type: 'single'
        });
        jobDater.bind({
            id: "WorkTime",
            dateEntry: [0, 1, 3, 4],
            size: 20,
            min: -55,
            //max: 2,
            onSelect: function (e) {
                var f = workInfoValidator.checkElement($(e.target)[0]);
                if (e.next && e.next.length) {
                    f = workInfoValidator.checkElement($(e.next)[0]);
                } else {
                    f = workInfoValidator.checkElement(workInfoEditor.getElement('inpWorkTimeStartYear')[0]);
                }
                if (f === false) return;

                var intWorkTimeS = 0;
                var intWorkSYear = parseInt(workInfoEditor.getElement('inpWorkTimeStartYear').val());
                var intWorkSMonth = parseInt(workInfoEditor.getElement('inpWorkTimeStartMonth').val());
                if (!isNaN(intWorkSYear)) {
                    intWorkTimeS += intWorkSYear * 10000;
                }
                if (!isNaN(intWorkSMonth)) {
                    intWorkTimeS += intWorkSMonth * 100;
                }
                workInfoEditor.getElement('hidWorkTimeStart').val(intWorkTimeS);

                var intWorkTimeE = 0;
                var intWorkEYear = parseInt(workInfoEditor.getElement('inpWorkTimeEndYear').val());
                var intWorkEMonth = parseInt(workInfoEditor.getElement('inpWorkTimeEndMonth').val());
                if (!isNaN(intWorkEYear)) {
                    intWorkTimeE += intWorkEYear * 10000;
                }
                if (!isNaN(intWorkEMonth)) {
                    intWorkTimeE += intWorkEMonth * 100;
                }
                workInfoEditor.getElement('hidWorkTimeEnd').val(intWorkTimeE);
                workInfoValidator.checkElement(workInfoEditor.getElement('hidWorkTimeEnd')[0]);
            },
            noSelect: function (e) {
                workInfoValidator.checkElement($(e.target)[0]);
            }
        });
        selWorkJoblevel.on('change', function (e) {
            workInfoValidator.checkElement(workInfoEditor.getElement('hidWorkJobLevel')[0]);
            self.toggleManagerExp(e);
        });
        this.getDom('#workJobsortContainer').jobsort({
            max: 1, hddName: 'hddWorkJobsort', isLimit: true, type: 'single'
        });
    });
    workInfoEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    workInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton,
            self = this,
            data = {'resume_id': resume_id},
            index = this.getIndex();
        if (index != undefined) {
            data['work_id'] = this._normal.eq(index).attr('data-workid');
        }
        workInfoValidator.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: data,
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        self.updatePreview(result);
                        if (e.otherEvent) {
                            self._normal.eq(0).before(self._edit.show());
                            delete self._oldIndex;
                            self._isAdd = true;
                            self.clearData();
                        }
                        var size = $('#workInfor .workRows').size();
                        if (size == 0) {
                            $('#workAdd').css('display', 'block');
                        } else {
                            $('#workAdd').css('display', 'none');
                        }
                        //$('#workAdd').css('display','none');
                        window.parent.preview_resume_iframe_reload(e.otherEvent ? false : true);
                    }, clearForm: false
                });
            }
        });
    };

    workInfoEditor.on('add', function () {
        this.toggleNoData(true);
        this.clearData();
    });
    workInfoEditor.on('modify', function () {
        this.toggleNoData(true);
        this.resetForm();
        this.resetData();
    });
    workInfoEditor.on('delete', function (e) {
        var index = this.getIndex(),
            preview = this._normal.eq(index),
            self = this,
            data = {
                'operate': 'DeleteWork',
                'resume_id': resume_id,
                'work_id': preview.attr('data-workid')
            };
        confirmBox.confirm('确定删除该工作经验吗？', null, function () {
            var that = this;
            $.post('/hbResume/DelDo/', data, function (json) {
                that.hide();
                if (json.error) {
                    confirmBox.alert(json.error, null, {title: '保存失败'});
                    return;
                }
                self.deleteList(index);
                self.hasNormalData(self._normal.length);
                updateCompPercent(json.complete_percent);
                var size = $('#workInfor .workRows').size();
                if (size == 0) {
                    $('#workAdd').css('display', 'block');
                } else {
                    $('#workAdd').css('display', 'none');
                }
                window.parent.preview_resume_iframe_reload();
            }, 'json');
        });
    });
    workInfoEditor.on('cancel', function () {
        this.toggleNoData(this._normal.length);
    });
    /*工作经历*/

    /*教育培训经历*/
    var eduInfoRules = {
            score1: {
                number: true,
                rangeNum: [0, 5]
            },
            score2: {
                number: true,
                rangeNum: [1, 5]
            },
            txtEduSchool: {required: true, range: [4, 30]},
            inpEduTimeStartYear: 'number',
            inpEduTimeStartMonth: 'number',
            hidEduDegree: 'required',
            //txtEduDuty:{ max:30 },
            taEduDetail: {range: [1, 1000]}
        },
        eduInfoErrorMsg = {
            score1: {
                number: '<em></em><i></i>请填写数字',
                rangeNum: '<em></em><i></i>请输入0-5的所得绩点'
            },
            score2: {
                number: '<em></em><i></i>请填写数字',
                rangeNum: '<em></em><i></i>请输入1-5满分绩点'
            },

            txtEduSchool: {
                required: '<em></em><i></i>请填写学校名称', range: '<em></em><i></i>4-30个字'
            },
            inpEduTimeStartYear: '<em></em><i></i>请填写就读时间年份',
            inpEduTimeStartMonth: '<em></em><i></i>请填写就读时间月份',
            hidEduTimeEnd: '<em></em><i></i>结束时间大于起始时间',
            hidEduDegree: '<em></em><i></i>请选择学历',
            txtEduDuty: '<em></em><i></i>不超过30字',
            taEduDetail: '<em></em><i></i>不超过1000字'
        },
        eduInfoGroups = {
            eduTime: 'inpEduTimeStartYear inpEduTimeStartMonth hidEduTimeEnd'
        },
        eduInfoKeepBlur = [
            'inpEduTimeStartYear', 'inpEduTimeStartMonth', 'hidEduTimeEnd'
        ].join(' '),
        trainInfoRules = {
            txtTrainInstitution: {required: true, range: [2, 30]},
            txtTrainCourse: {required: true, range: [2, 20]},
            inpTrainTimeStartYear: 'number',
            inpTrainTimeStartMonth: 'number',
            taTrainDetail: {range: [1, 1000]}
        },
        trainInfoErrorMsg = {
            txtTrainInstitution: {
                required: '<em></em><i></i>请填写机构名称',
                range: '<em></em><i></i>2-30个字'
            },
            txtTrainCourse: {
                required: '<em></em><i></i>请填写培训项目',
                range: '<em></em><i></i>2-20个字'
            },
            inpTrainTimeStartYear: '<em></em><i></i>请填写就读时间年份',
            inpTrainTimeStartMonth: '<em></em><i></i>请填写就读时间月份',
            hidTrainTimeEnd: '<em></em><i></i>结束时间大于起始时间',
            taTrainDetail: '<em></em><i></i>不超过1000字'
        },
        trainInfoGroups = {
            trainTime: 'inpTrainTimeStartYear inpTrainTimeStartMonth hidTrainTimeEnd'
        },
        trainInfoKeepBlur = [
            'inpTrainTimeStartYear', 'inpTrainTimeStartMonth', 'hidTrainTimeEnd'
        ].join(' ');

    var eduInfoEditor = new editMutilResume({
            element: $('#eduInfor'),
            normalName: '.eduRows',
            validators: [{
                rules: eduInfoRules,
                errorMessages: eduInfoErrorMsg,
                errorElement: '',
                groups: eduInfoGroups,
                keepBlur: eduInfoKeepBlur,
                keepKey: true,
                isCache: false
            }, {
                rules: trainInfoRules,
                errorMessages: trainInfoErrorMsg,
                errorElement: '',
                groups: trainInfoGroups,
                keepBlur: trainInfoKeepBlur,
                keepKey: true,
                isCache: false
            }]
        }),
        txtEduMajorDescRules = {required: true, range: [2, 20]},
        txtEduMajorDescMsg = {
            required: '<em></em><i></i>请填写专业名称', range: '<em></em><i></i>2-20个字'
        },
        eduValidators = [],
        chkENow, radEduTrain, selEduDegree;
    eduValidators.push(eduInfoEditor.getValidator());
    eduValidators.push(eduInfoEditor.getValidator(1));
    eduValidators[0].addMethod('laterThan', laterThan);
    eduValidators[1].addMethod('laterThan', laterThan);

    eduInfoEditor._normalUL = eduInfoEditor.getDom('.less-train');
    eduInfoEditor._normalNoData = eduInfoEditor.getDom('.no-data');
    eduInfoEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            if (!this._edit.closest('.less-train').length) {
                this._normalUL.hide();
            }
        }
        updateRightSideList(3, e);
    }
    eduInfoEditor._normalRet = [];
    eduInfoEditor._normal.each(function (index, val) {
        eduInfoEditor._normalRet.push({
            type: parseInt($(this).attr('data-type')),
            endTime: getItemTime($(this).children('.time').attr('data-endtime')),
            startTime: getItemTime($(this).children('.time').attr('data-starttime'))
        });
    })

    eduInfoEditor.toggleNoData = function (e) {
        if (e) {
            this._normalNoData.hide();
        } else {
            this._normalNoData.show();
        }
    }
    eduInfoEditor.clearData = function () {
        this._edit.find('.eduTab').show();
        this.resetForm(true);
        radEduTrain && radEduTrain.setStatus(0, true, true);
        chkENow && chkENow.all(false);
        selEduDegree && selEduDegree.setSelectedIndex(0, true);
        this._edit.find('.del').hide();
        this.getElement('inpEduTimeEndYear').prop('disabled', false);
        this.getElement('inpEduTimeEndMonth').prop('disabled', false);
        this.getElement('inpTrainTimeEndYear').prop('disabled', false);
        this.getElement('inpTrainTimeEndMonth').prop('disabled', false);
        this.getElement('taEduDetail').resetWatermark();
        this.getElement('taTrainDetail').resetWatermark();
        this.getElement('txtEduDuty').resetWatermark();

        eduValidators[0].addRules('txtEduMajorDesc', txtEduMajorDescRules);
        eduValidators[0].addErrorMessages('txtEduMajorDesc', txtEduMajorDescMsg);
        eduValidators[0].resetElement(this.getElement('txtEduMajorDesc'));
        if (this.getDom('#eduMajorDescBox').is(':hidden')) {
            this.getDom('#eduMajorDescBox').show();
            this.getDom('#eduDetailBox').show();
        }
        jobDater.update("EduTime");
        jobDater.update("TrainTime");
    }

    var eduTemplate = [
        '<div class="clearfix editPanel eduRows" {data-eduid} data-type="{data-type}" data-duty="{data-duty}">',
        '<span class="time" data-starttime="{data-starttime}" data-endtime="{data-endtime}">{label-starttime}{label-endtime}</span>',
        '<div class="box-item">',
        '<p class="tit">',
        '<span class="oper"><a href="javascript:delDo(\'{delType}\')" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
        '<strong class="name labelDegree wh-Strong" v="{eduDegreeValue}">{eduDegreeLabel}</strong>{trainemlabel}<u>|</u>',
        '<span class="name labelSchool">{labelSchool}</span><u>|</u>',
        '<span class="name labelMajorDesc" v="{data-majorDesc}">{labelMajorDesc}</span>',
        '</p><div class="infor" data-content="{labelDetail2}">',
        '<div class="wh-labelScore showScore" style="display:{showScore}">',
        '<span>在校成绩：</span><span class="labelScore1" data-content="{labelScore3}">{labelScore1}</span>',
        '<span class="labelScore2" style="display: none" data-content="{labelScore4}">{labelScore4}</span>',
        '</div>',
        '<div class="wh-labelScore showDuty" style="display:{showDuty}">',
        '<span>校内职务：</span><span class="labelDuty" data-content="{labelDuty}">{labelDuty}</span>',
        '</div>',
        '<div class="wh-labelScore showDetail" style="display:{showDetail}">',
        '<span class="cuorseTypeName">{cuorseTypeName}</span><span class="labelDetail" data-content="{labelDetail2}">{labelDetail}</span>',
        '</div>',
        '</div>',
        '</div></div>'
    ].join('');

    eduInfoEditor.updatePreview = function (e) {
        var index = this.getIndex(),
            eduRadValue = radEduTrain.getValue(true)['radEduTrain'];
        dataObj = {
            'data-type': eduRadValue[0]
        },
            eduType = parseInt(dataObj['data-type']),
            eduNames = ['EduTime', 'TrainTime'],
            eduData = ['data-eduid', 'data-trainid'];

        if (eduType) {
            dataObj['data-eduid'] = 'data-trainid="' + e['train_id'] + '"';
        } else {
            dataObj['data-eduid'] = 'data-eduid="' + e['edu_id'] + '"';
        }
        var startTimeYear = this.getElement('inp' + eduNames[eduType] + 'StartYear').val(),
            startTimeMonth = this.getElement('inp' + eduNames[eduType] + 'StartMonth').val(),
            endTimeYear = this.getElement('inp' + eduNames[eduType] + 'EndYear').val(),
            endTimeMonth = this.getElement('inp' + eduNames[eduType] + 'EndMonth').val(),
            startTime = startTimeYear + '/' + startTimeMonth + '/1',
            endTime;

        if (endTimeYear) {
            endTime = endTimeYear + '/' + endTimeMonth + '/1';
        } else {
            endTime = '';
        }
        dataObj['data-starttime'] = startTime;
        dataObj['data-endtime'] = endTime;
        if (startTimeMonth < 10) {
            startTimeMonth = '0' + startTimeMonth;
        }
        if (endTimeMonth < 10) {
            endTimeMonth = '0' + endTimeMonth;
        }
        dataObj['label-starttime'] = startTimeYear + '.' + startTimeMonth;
        dataObj['label-endtime'] = endTime ? '-' + endTimeYear + '.' + endTimeMonth : '-至今';

        eduNames = ['txtEduSchool', 'txtTrainInstitution'];
        dataObj['labelSchool'] = this.getElement(eduNames[eduType]).val();


        eduNames = ['txtEduDuty', ''];
        dataObj['labelDuty'] = this.getElement(eduNames[eduType]).val();

        eduNames = ['score1', ''];
        dataObj['labelScore2'] = this.getElement(eduNames[eduType]).val();

        eduNames = ['score2', ''];
        dataObj['labelScore1'] = dataObj['labelScore2'] + '/' + this.getElement(eduNames[eduType]).val();
        dataObj['labelScore3'] = dataObj['labelScore1'].substr(0, dataObj['labelScore1'].indexOf('/'));
        dataObj['labelScore4'] = dataObj['labelScore1'].substr(dataObj['labelScore1'].indexOf('/') + 1, dataObj['labelScore1'].length)
        eduNames = ['txtEduMajorDesc', 'txtTrainCertificate'];
        var eduCardName = this.getElement(eduNames[eduType]).val();
        dataObj['labelMajorDesc'] = (eduType ? eduCardName ? '[证]' : '' : '') + eduCardName;
        dataObj['data-majorDesc'] = this.getElement(eduNames[eduType]).val();

        eduNames = ['taEduDetail', 'taTrainDetail'];
        dataObj['labelDetail'] = this.getElement(eduNames[eduType]).val().replace(/\n/g, "<br/>");
        dataObj['labelDetail2'] = this.getElement(eduNames[eduType]).val();

        if (eduType != 0) {
            dataObj['eduDegreeValue'] = '';
            dataObj['eduDegreeLabel'] = this.getElement('txtTrainCourse').val();
            dataObj['data-duty'] = '';
        } else {
            dataObj['eduDegreeValue'] = selEduDegree.get('value');
            dataObj['eduDegreeLabel'] = selEduDegree.get('label');
            dataObj['data-duty'] = this.getElement('txtEduDuty').val();
        }
        //if(dataObj['eduDegreeValue']==''){
        //	var eduTemplate = eduTemplate1;
        //}else if(dataObj['labelDuty']!=''&&dataObj['labelScore2']!=''&&!dataObj['labelDetail']){
        //	var eduTemplate = eduTemplate3;
        //}else if(dataObj['labelDetail']!=''&&dataObj['labelDuty']!=''&&!dataObj['labelScore2']){
        //	var eduTemplate = eduTemplate5;
        //}else if(dataObj['labelScore2']!=''&&dataObj['labelDetail']!=''&&!dataObj['labelDuty']){
        //	var eduTemplate = eduTemplate4
        //}else if(dataObj['labelDuty']!=''&&dataObj['labelScore2']!=''&&dataObj['labelDetail']!=''){
        //	var eduTemplate = eduTemplate6;
        //}else if(!dataObj['labelDuty']&&!dataObj['labelScore2']&&!dataObj['labelDetail']){
        //	var eduTemplate = eduTemplate7;
        //}else if(!dataObj['labelDuty']&&!dataObj['labelScore2']&&dataObj['labelDetail']!=''){
        //	var eduTemplate = eduTemplate2;
        //}

        if (!this._isAdd) {
            var preview = this._normal.eq(index);
            preview.attr({
                'data-type': eduType,
                'data-duty': dataObj['data-duty']
            });
            preview.find('.time').attr({
                'data-starttime': dataObj['data-starttime'],
                'data-endtime': dataObj['data-endtime']
            }).html(dataObj['label-starttime'] + '' + dataObj['label-endtime']);

            preview.find('.labelDegree').attr('v', dataObj['eduDegreeValue']).text(dataObj['eduDegreeLabel']);
            preview.find('.labelSchool').text(dataObj['labelSchool']);
            preview.find('.labelDuty').text('校内职务：' + dataObj['labelDuty']);
            preview.find('.labelScore1').text('在校成绩：' + dataObj['labelScore1']);
            preview.find('.labelScore1').attr('data-content', dataObj['labelScore1'].substr(0, dataObj['labelScore1'].indexOf('/')));
            preview.find('.labelScore2').attr('data-content', dataObj['labelScore1'].substr(dataObj['labelScore1'].indexOf('/') + 1, dataObj['labelScore1'].length));
            preview.find('.labelMajorDesc').attr('v', dataObj['data-majorDesc']).text(dataObj['labelMajorDesc']);
            preview.find('.labelDetail').attr('data-content', dataObj['labelDetail2']).html(dataObj['labelDetail'].replace(/\n/g, "<br/>"));
            //新加的显示项
            if (dataObj['labelScore2']) {
                preview.find('.textScore').text('在校成绩：' + dataObj['labelScore2']);
                preview.find('.showScore').css("display", "block");
            } else {
                preview.find('.showScore').css("display", "none");
                preview.find('.textScore').text('');
            }
            if (dataObj['labelDuty'] && !eduType) {
                preview.find('.showDuty').css("display", "block");
            } else {
                preview.find('.showDuty').css("display", "none");
            }
            if (dataObj['labelDetail']) {
                preview.find('.showDetail').css("display", "block");
                dataObj['cuorseTypeName'] = eduType ? "培训课程：" : "专业课程：";
                preview.find('.cuorseTypeName').text(dataObj['cuorseTypeName']);
            } else {
                preview.find('.showDetail').css("display", "none");
            }
            this.updateToView(dataObj['data-starttime'], dataObj['data-endtime'], eduType);
            this.show();
        } else {
            //新加的显示项
            if (dataObj['labelScore2']) {
                dataObj['showScore'] = 'block';
            } else {
                dataObj['showScore'] = 'none';
            }
            if (dataObj['labelDuty'] && !eduType) {
                dataObj['showDuty'] = 'block';
            } else {
                dataObj['showDuty'] = 'none';
            }
            if (dataObj['labelDetail']) {
                dataObj['showDetail'] = 'block';
                dataObj['cuorseTypeName'] = eduType ? "培训课程：" : "专业课程：";
            } else {
                dataObj['showDetail'] = 'none';
            }
            dataObj['delType'] = eduType ? "trainDel" : "eduDel";
            eduType ? dataObj['trainemlabel'] = '<span class="tag">培训</span>' : '';
            this.updateToView(dataObj['data-starttime'], dataObj['data-endtime'], eduType, util.string.replace(eduTemplate, dataObj));
            this.show();
            delete this._isAdd;
            this.hasNormalData(this._normal.length);
        }
    }
    eduInfoEditor.updateToView = function (startTime, endTime, eduType, html) {
        startTime = getItemTime(startTime);
        endTime = getItemTime(endTime);
        var index = this.getIndex(),
            obj = {
                type: eduType,
                endTime: endTime,
                startTime: startTime
            },
            curIndex;
        if (html) {
            this._normalRet.push(obj);
        } else {
            this._normalRet[index] = obj;
        }
        var ret = this._normalRet.sort(function (a, b) {
            return b.type < a.type;
        }).sort(function (a, b) {
            if (a.type === b.type) {
                if (b.endTime === a.endTime) {
                    return b.startTime > a.startTime;
                } else {
                    return b.endTime > a.endTime;
                }
            }
        });
        this._normalRet = ret;
        for (var j = 0, len = ret.length; j < len; j++) {
            if (eduType != ret[j].type) {
                continue;
            }
            if (ret[j].endTime === endTime && ret[j].startTime === startTime) {
                curIndex = j;
                break;
            }
        }
        if (html) {
            var list = this._normal.eq(curIndex);
            if (list.length) {
                this._normal.eq(curIndex).before(html);
            } else {
                list = this._normal.eq(curIndex - 1);
                if (list.length) {
                    this._normal.eq(curIndex - 1).after(html);
                } else {
                    this.getDom('.less-train').prepend(html);
                }
            }
            this.update();
        } else {
            if (curIndex < index) {
                this._normal.eq(curIndex).before(this._normal.eq(index));
            } else if (curIndex > index) {
                this._normal.eq(curIndex).after(this._normal.eq(index));
            }
            this.update();
        }
    }
    eduInfoEditor.resetData = function () {
        var index = this.getIndex(), preview;
        if ((preview = this._normal.eq(index)).length) {
            this.resetForm();
            this._edit.find('.eduTab').hide();
            var eduType = parseInt(preview.attr('data-type')),
                Time = preview.find('.time'),
                StTime = Time.attr('data-starttime'),
                EnTime = Time.attr('data-endtime'),
                eduNames = ['EduTime', 'TrainTime'],
                attr;
            var txtEduScore1 = this.getElement('score1'),
                txtEduScore2 = this.getElement('score2');
            txtEduScore1.val(preview.find('.labelScore1').attr("data-content"));
            txtEduScore2.val(preview.find('.labelScore2').attr("data-content"));
            if (StTime) {
                StTime = new Date(StTime);
                this.getElement('inp' + eduNames[eduType] + 'StartYear').val(StTime.getFullYear());
                this.getElement('inp' + eduNames[eduType] + 'StartMonth').val(StTime.getMonth() + 1);
                this.getElement('hid' + eduNames[eduType] + 'TimeStart').val(StTime.getFullYear() * 10000 + (StTime.getMonth() + 1) * 100);
            }
            var endTimeYear = this.getElement('inp' + eduNames[eduType] + 'EndYear'),
                endTimeMonth = this.getElement('inp' + eduNames[eduType] + 'EndMonth'),
                endTimeInput = this.getElement('hid' + eduNames[eduType] + 'End');
            if (EnTime) {
                EnTime = new Date(EnTime);
                if (util.type.isDate(EnTime)) {
                    endTimeYear.prop('disabled', false).val(EnTime.getFullYear());
                    endTimeMonth.prop('disabled', false).val(EnTime.getMonth() + 1);
                    endTimeInput.val(
                        EnTime.getFullYear() * 10000 + (EnTime.getMonth() + 1) * 100
                    );
                    chkENow.setStatus(eduType, false);
                } else {
                    chkENow.setStatus(eduType, true);
                    endTimeYear.prop('disabled', true).val('');
                    endTimeMonth.prop('disabled', true).val('');
                    endTimeInput.val(0);
                }
            } else {
                chkENow.setStatus(eduType, true);
                endTimeYear.prop('disabled', true).val('');
                endTimeMonth.prop('disabled', true).val('');
                endTimeInput.val(0);
            }
            if (eduType) {
                attr = preview.find('.labelDegree').text();
                this.getElement('txtTrainCourse').val(attr);
                attr = preview.find('.labelMajorDesc').attr('v');
                this.getElement('txtTrainCertificate').val(attr);
                attr = preview.find('.labelDetail').text();
                this.getElement('taTrainDetail').val(attr).resetWatermark();
                jobDater.update("TrainTime");
            } else {
                if (attr = preview.find('.labelDegree').attr('v')) {
                    selEduDegree.setSelectedValue(attr);
                } else {
                    selEduDegree.setSelectedIndex(0);
                }

                this.eduSelect(e, preview);
                attr = preview.find('.labelMajorDesc').text();
                this.getElement('txtEduMajorDesc').val(attr);
                attr = preview.attr('data-duty');
                this.getElement('txtEduDuty').val(attr).resetWatermark();
                jobDater.update("EduTime");
            }

            eduNames = ['txtEduSchool', 'txtTrainInstitution'];
            attr = preview.find('.labelSchool').text();
            this.getElement(eduNames[eduType]).val(attr);

            radEduTrain.setStatus(eduType, true, true);
        }
    }
    eduInfoEditor.eduSelect = function (e, preview) {
        var index = e ? e.index : selEduDegree.get('selectedIndex'),
            txtEduDes = this.getElement('txtEduMajorDesc'),
            txtEduDet = this.getElement('taEduDetail');

        if (index > 0 && index < 3) {
            eduValidators[0].removeRules('txtEduMajorDesc');
            txtEduDes.val('');
            txtEduDet.val('');

            this.getDom('#eduMajorDescBox').hide();
            this.getDom('#eduDetailBox').hide();
        } else {
            if (preview) {
                var attr = preview.find('.labelMajorDesc').text();
                txtEduDes.val(attr);
                //attr = preview.find('.labelDetail').text();
                txtEduDet.val(preview.find('.labelDetail').attr("data-content"));
                //txtEduScore1.val(preview.find('.labelScore1').attr("data-content"));
                //txtEduScore2.val(preview.find('.labelScore2').attr("data-content"));
            }
            eduValidators[0].addRules('txtEduMajorDesc', txtEduMajorDescRules);
            eduValidators[0].addErrorMessages('txtEduMajorDesc', txtEduMajorDescMsg);
            this.getDom('#eduMajorDescBox').show();
            this.getDom('#eduDetailBox').show();
        }
        txtEduDet.resetWatermark();
        eduValidators[0].resetElement(txtEduDes);
        set_resume_tips($("#eduInfor .edit_resume_tips"));
    }
    eduInfoEditor.on('init', function () {
        var self = this;
        eduValidators[0].addDomCache(true);
        eduValidators[1].addDomCache(true);
        radEduTrain = new checkBoxer({
            element: this.getDom('.icon-rad'),
            className: 'icon-rad-checked',
            multiple: false
        });
        radEduTrain.on('select', function (e) {
            var index = e.index;
            self.getDom('.eduTabType').hide();
            self.getDom('.eduTabType').eq(index).show();
            set_resume_tips($("#eduInfor .edit_resume_tips"));
        });
        chkENow = new checkBoxer({
            element: this.getDom('.icon-chck'),
            className: 'icon-chck-checked'
        });
        selEduDegree = new select({
            trigger: this.getDom('#selEduDegree'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidEduDegree',
            dataSource: degreeItems,
            selectedIndex: 0,
            isHidDefault: true,
            selectCallback: {
                isDefault: true
            }
        });
        eduValidators[0].addRules('hidEduTimeEnd', {
            laterThan: {
                context: this,
                startName: 'hidEduTimeStart',
                endName: 'hidEduTimeEnd',
                chkName: chkENow
            }
        });
        eduValidators[1].addRules('hidTrainTimeEnd', {
            laterThan: {
                context: this,
                startName: 'hidTrainTimeStart',
                endName: 'hidTrainTimeEnd',
                index: 1,
                chkName: chkENow
            }
        });
        selEduDegree.on('change', function (e) {
            eduValidators[0].checkElement(self.getElement('hidEduDegree')[0]);
            self.eduSelect(e);
        });
        chkENow.on('select', function (e) {
            var index = e.index,
                ret = [
                    ['inpEduTimeEndYear', 'inpEduTimeEndMonth', 'hidEduTimeEnd'],
                    ['inpTrainTimeEndYear', 'inpTrainTimeEndMonth', 'hidTrainTimeEnd'],
                    ['inpEduTimeStartYear', 'inpEduTimeStartMonth', 'hidEduTimeStart'],
                    ['inpTrainTimeStartYear', 'inpTrainTimeStartMonth', 'hidTrainTimeStart']
                ],
                endTimeYear = self.getElement(ret[index][0]),
                endTimeMonth = self.getElement(ret[index][1]),
                endTimeInput = self.getElement(ret[index][2]);
            if (this.isChecked(index)) {
                endTimeYear.val('').prop('disabled', true);
                endTimeMonth.val('').prop('disabled', true);
                endTimeInput.val('');
            } else {
                endTimeYear.prop('disabled', false);
                endTimeMonth.prop('disabled', false);
                endTimeInput.val(0);
            }
            var v = eduValidators[index];
            if (v.checkElement(self.getElement((ret[index + 2])[0])[0]) &&
                v.checkElement(self.getElement((ret[index + 2])[1])[0])) {
                v.checkElement(endTimeInput[0]);
            }
        });
        jobDater.bind({
            id: "EduTime",
            dateEntry: [0, 1, 3, 4],
            size: 20,
            min: -55,
            max: 5,
            onSelect: function (e) {
                var f = eduValidators[0].checkElement($(e.target)[0]);
                if (e.next && e.next.length) {
                    f = eduValidators[0].checkElement($(e.next)[0]);
                } else {
                    f = eduValidators[0].checkElement(self.getElement('inpEduTimeStartYear')[0]);
                }
                if (f === false) return;

                var intTimeS = 0;
                var intSYear = parseInt(self.getElement('inpEduTimeStartYear').val());
                var intSMonth = parseInt(self.getElement('inpEduTimeStartMonth').val());
                if (!isNaN(intSYear)) {
                    intTimeS += intSYear * 10000;
                }
                if (!isNaN(intSMonth)) {
                    intTimeS += intSMonth * 100;
                }
                self.getElement('hidEduTimeStart').val(intTimeS);

                var intTimeE = 0;
                var intEYear = parseInt(self.getElement('inpEduTimeEndYear').val());
                var intEMonth = parseInt(self.getElement('inpEduTimeEndMonth').val());
                if (!isNaN(intEYear)) {
                    intTimeE += intEYear * 10000;
                }
                if (!isNaN(intEMonth)) {
                    intTimeE += intEMonth * 100;
                }
                self.getElement('hidEduTimeEnd').val(intTimeE);
                eduValidators[0].checkElement(self.getElement('hidEduTimeEnd')[0]);
            },
            noSelect: function (e) {
                eduValidators[0].checkElement($(e.target)[0]);
            }
        });
        jobDater.bind({
            id: "TrainTime",
            dateEntry: [0, 1, 3, 4],
            size: 20,
            min: -55,
            //max: 2,
            onSelect: function (e) {
                var f = eduValidators[1].checkElement($(e.target)[0]);
                if (e.next && e.next.length) {
                    f = eduValidators[1].checkElement($(e.next)[0]);
                } else {
                    f = eduValidators[1].checkElement(self.getElement('inpTrainTimeStartYear')[0]);
                }
                if (f === false) return;

                var intTimeS = 0;
                var intSYear = parseInt(self.getElement('inpTrainTimeStartYear').val());
                var intSMonth = parseInt(self.getElement('inpTrainTimeStartMonth').val());
                if (!isNaN(intSYear)) {
                    intTimeS += intSYear * 10000;
                }
                if (!isNaN(intSMonth)) {
                    intTimeS += intSMonth * 100;
                }
                self.getElement('hidTrainTimeStart').val(intTimeS);
                var intTimeE = 0;
                var intEYear = parseInt(self.getElement('inpTrainTimeEndYear').val());
                var intEMonth = parseInt(self.getElement('inpTrainTimeEndMonth').val());
                if (!isNaN(intEYear)) {
                    intTimeE += intEYear * 10000;
                }
                if (!isNaN(intEMonth)) {
                    intTimeE += intEMonth * 100;
                }
                self.getElement('hidTrainTimeEnd').val(intTimeE);
                eduValidators[1].checkElement(self.getElement('hidTrainTimeEnd')[0]);
            },
            noSelect: function (e) {
                eduValidators[1].checkElement($(e.target)[0]);
            }
        });
        this.getDom('#trainCert').certificate({
            cerName: 'txtTrainCertificate',
            isBtn: true,
            select: function () {
                eduValidators[1].checkElement(self.getElement('txtTrainCertificate')[0]);
            }
        });
    });
    eduInfoEditor.on('delete', function (e) {
        var index = this.getIndex(),
            preview = this._normal.eq(index),
            type = parseInt(preview.attr('data-type')),
            dataType = type ? 'data-trainid' : 'data-eduid',
            postType = type ? 'train_id' : 'edu_id',
            operateType = type ? 'DeleteTrain' : 'DeleteEdu',
            message = '确定删除该' + (type ? '培训' : '教育') + '经历吗?',
            data = {
                'operate': operateType,
                'resume_id': resume_id
            },
            self = this;
        data[postType] = preview.attr(dataType);
        confirmBox.confirm(message, null, function () {
            var that = this;
            $.post('/hbResume/DelDo/', data, function (json) {
                that.hide();
                if (json.error) {
                    confirmBox.alert(json.error, null, {title: '保存失败'});
                    return;
                }
                self.deleteList(index);
                self._normalRet.splice(index, 1);
                self.hasNormalData(self._normal.length);
                updateCompPercent(json.complete_percent);
                $('.elect1').attr('data-gra', json.is_fresh_graduate);
                var size = $('#eduInfor .eduRows').size();
                if (size == 0) {
                    $('#eduAdd').css('display', 'block');
                } else {
                    $('#eduAdd').css('display', 'none');
                }
                //window.location.reload();
                window.parent.preview_resume_iframe_reload();
            }, 'json');
        });
    });
    eduInfoEditor.on('submit', function (e) {
        console.log('fuck')
        this.saveSubmit(e);
    });
    eduInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton;
        var self = this,
            data = {resume_id: resume_id},
            index = this.getIndex(),
            dataType = radEduTrain.getValue(true)['radEduTrain'][0];

        if (index != undefined) {
            var li = this._normal.eq(index);
            if (li.length) {
                var eduData = ['data-eduid', 'data-trainid'],
                    hidType = ['edu', 'train'];
                dataType = parseInt(li.attr('data-type'));
                data['hidModEdOTrID'] = li.attr(eduData[dataType]);
                data['hidEduTypeID'] = hidType[dataType];
            }
        }
        var validators = eduValidators[dataType];
        validators.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: data,
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        $('.elect1').attr('data-gra', result.is_fresh_graduate);
                        self.updatePreview(result);
                        if (e.otherEvent) {
                            self._normal.eq(0).before(self._edit.show());
                            delete self._oldIndex;
                            self._isAdd = true;
                            self.clearData();
                            //window.location.href = reload_url + '-is_create-1';
                        } else {
                            //window.location.href = reload_url;
                        }
                        // $('#eduAdd').css('display','none');
                        window.parent.preview_resume_iframe_reload(e.otherEvent ? false : true);
                    }, clearForm: false
                });
            }
        });
    };
    eduInfoEditor.on('add', function () {
        this.toggleNoData(true);
        this.clearData();
    });
    eduInfoEditor.on('modify', function () {
        this.toggleNoData(true);
        this.resetForm();
        this.resetData();
    });
    eduInfoEditor.on('cancel', function () {
        this.toggleNoData(this._normal.length);
        //this.resetData();
    });
    /*教育培训经历*/
    if ($('#showEdit').val() == 1)
        $('#eduEdit').click();
    /*项目经验*/
    var projectRules = {
            txtProjectName: {
                required: true, range: [2, 30]
            },
            txtDuty: {
                required: true, range: [2, 12]
            },
            inpProjectTimeStartYear: 'number',
            inpProjectTimeStartMonth: 'number',
            taProjectIntr: {max: 200},
            taProjectExperience: {max: 500}
        },
        projectErrorMsg = {
            txtProjectName: {
                required: '<em></em><i></i>请填写项目名称',
                range: '<em></em><i></i>2-30个字'
            },
            txtDuty: {
                required: '<em></em><i></i>请填写担任职务',
                range: '<em></em><i></i>2-12个字'
            },
            inpProjectTimeStartYear: '<em></em><i></i>请填写项目时间',
            inpProjectTimeStartMonth: '<em></em><i></i>请填写项目时间',
            hidProjectTimeEnd: '<em></em><i></i>结束时间大于起始时间',
            taProjectIntr: '<em></em><i></i>不超过200个字',
            taProjectExperience: '<em></em><i></i>不超过500个字'
        },
        projectGroups = {
            projectTime: 'inpProjectTimeStartYear inpProjectTimeStartMonth hidProjectTimeEnd'
        },
        projectKeepBlur = [
            'inpProjectTimeStartYear', 'inpProjectTimeStartMonth', 'hidProjectTimeEnd'
        ].join(' ');

    var projectInfoEditor = new editMutilResume({
            element: $('#projectInfor'),
            normalName: '.projectRows',
            validators: {
                rules: projectRules,
                errorMessages: projectErrorMsg,
                errorElement: '',
                groups: projectGroups,
                keepBlur: projectKeepBlur,
                keepKey: true,
                isCache: false
            }
        }),
        projectValidators = projectInfoEditor.getValidator(),
        chkPNow;
    projectValidators.addMethod('laterThan', laterThan);

    projectInfoEditor._normalUL = projectInfoEditor.getDom('.project-expr');
    projectInfoEditor._normalNoData = projectInfoEditor.getDom('.no-data');
    projectInfoEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            if (!this._edit.closest('.project-expr').length) {
                this._normalUL.hide();
            }
        }
        updateRightSideList(5, e);
    }
    projectInfoEditor.toggleNoData = function (e) {
        if (e) {
            this._normalNoData.hide();
        } else {
            this._normalNoData.show();
        }
    }
    var projectTemplate = [
        '<div class="clearfix editPanel projectRows" data-projectid="{data-projectid}">',
        '<span class="time" data-starttime="{data-starttime}" data-endtime="{data-endtime}">{label-starttime}{label-endtime}</span>',
        '<div class="box-item">',
        '<p class="tit">',
        '<span class="oper"><a href="javascript:delDo(\'projectDel\');" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
        '<strong class="name projectName">{projectName}</strong><u>|</u>',
        '<span class="name"><span class="projectDuty">{projectDuty}</span></span></p>',
        '<div class="infor">',
        '<p class="pfc labelProjectIntr" data-projectIntr="{data-projectIntr}" style="display:{display1}"><i class="hbFntWes">&#xf10d;</i> <span>{labelProjectIntr}</span><i class="hbFntWes">&#xf10e;</i></p>',
        '<p class="labelProjectExperience" data-projectExperience="{data-projectExperience}" style="display:{display2}">{labelProjectExperience}</p>',
        '</div></div></div>'
    ].join('');
    projectInfoEditor.updatePreview = function (e) {
        var index = this.getIndex(),
            taProjectIntr = this.getElement('taProjectIntr').val(),
            taProjectExperience = this.getElement('taProjectExperience').val(),
            dataObj = {
                'projectName': this.getElement('txtProjectName').val(),
                'projectDuty': this.getElement('txtDuty').val(),
                'labelProjectIntr': taProjectIntr || '项目介绍：未填写',
                'data-projectIntr': taProjectIntr,
                'labelProjectExperience': taProjectExperience.replace(/\n/g, "<br/>") || '项目经历：未填写',
                'data-projectExperience': taProjectExperience,
                'data-projectid': e['project_id']
            },
            startTimeYear = this.getElement('inpProjectTimeStartYear').val(),
            startTimeMonth = this.getElement('inpProjectTimeStartMonth').val(),
            endTimeYear = this.getElement('inpProjectTimeEndYear').val(),
            endTimeMonth = this.getElement('inpProjectTimeEndMonth').val(),
            startTime = startTimeYear + '/' + startTimeMonth + '/1',
            endTime;

        if (endTimeYear) {
            endTime = endTimeYear + '/' + endTimeMonth + '/1';
        } else {
            endTime = '';
        }
        dataObj['data-starttime'] = startTime;
        dataObj['data-endtime'] = endTime;
        if (startTimeMonth < 10) {
            startTimeMonth = '0' + startTimeMonth;
        }
        if (endTimeMonth < 10) {
            endTimeMonth = '0' + endTimeMonth;
        }
        dataObj['label-starttime'] = startTimeYear + '.' + startTimeMonth;
        dataObj['label-endtime'] = endTime ? '-' + endTimeYear + '.' + endTimeMonth : '-至今';

        dataObj['display1'] = dataObj['data-projectIntr'] ? 'block' : 'none';
        dataObj['display2'] = dataObj['data-projectExperience'] ? 'block' : 'none';

        if (!this._isAdd) {
            var preview = this._normal.eq(index);
            preview.find('.time').attr({
                'data-starttime': dataObj['data-starttime'],
                'data-endtime': dataObj['data-endtime']
            }).html(dataObj['label-starttime'] + '' + dataObj['label-endtime']);

            preview.find('.projectName').text(dataObj['projectName']);
            preview.find('.projectDuty').text(dataObj['projectDuty']);
            var tempObj = preview.find('.labelProjectIntr').html('<i class="hbFntWes">&#xf10d;</i> <span>' + dataObj['labelProjectIntr'] + '</span><i class="hbFntWes">&#xf10e;</i>')
                .attr('data-projectIntr', dataObj['data-projectIntr']);

            if (dataObj['data-projectIntr']) {
                tempObj.show();
            } else {
                tempObj.hide();
            }
            tempObj = preview.find('.labelProjectExperience').html(dataObj['labelProjectExperience'].replace(/\n/g, "<br/>"))
                .attr('data-projectExperience', dataObj['data-projectExperience']);

            if (dataObj['data-projectExperience']) {
                tempObj.show();
            } else {
                tempObj.hide();
            }

            this.show();
        } else {
            this.getDom('.project-expr').prepend(util.string.replace(projectTemplate, dataObj));
            this.update();
            this.show();
            delete this._isAdd;
            this.hasNormalData(this._normal.length);
        }
    }
    projectInfoEditor.clearData = function () {
        var endTimeYear = this.getElement('inpProjectTimeEndYear'),
            endTimeMonth = this.getElement('inpProjectTimeEndMonth');
        endTimeYear.prop('disabled', false);
        endTimeMonth.prop('disabled', false);
        chkPNow && chkPNow.setStatus(0, false);
        this.resetForm(true);
        this.getElement('taProjectIntr').resetWatermark();
        this.getElement('taProjectExperience').resetWatermark();
        jobDater.update("ProjectTime");
    }
    projectInfoEditor.resetData = function () {
        var index = this.getIndex(), preview;
        if ((preview = this._normal.eq(index)).length) {
            this.resetForm(true);
            var Time = preview.find('.time'),
                StTime = Time.attr('data-starttime'),
                EnTime = Time.attr('data-endtime'),
                attr;

            if (StTime) {
                StTime = new Date(StTime);
                this.getElement('inpProjectTimeStartYear').val(StTime.getFullYear());
                this.getElement('inpProjectTimeStartMonth').val(StTime.getMonth() + 1);
                this.getElement('hidProjectTimeStart').val(StTime.getFullYear() * 10000 + (StTime.getMonth() + 1) * 100);
            }

            var endTimeYear = this.getElement('inpProjectTimeEndYear'),
                endTimeMonth = this.getElement('inpProjectTimeEndMonth'),
                endTimeInput = this.getElement('hidProjectTimeEnd');

            if (EnTime) {
                EnTime = new Date(EnTime);
                if (util.type.isDate(EnTime)) {
                    endTimeYear.prop('disabled', false).val(EnTime.getFullYear());
                    endTimeMonth.prop('disabled', false).val(EnTime.getMonth() + 1);
                    endTimeInput.val(
                        EnTime.getFullYear() * 10000 + (EnTime.getMonth() + 1) * 100
                    );
                    chkPNow.setStatus(0, false);
                } else {
                    chkPNow.setStatus(0, true);
                    endTimeYear.prop('disabled', true).val('');
                    endTimeMonth.prop('disabled', true).val('');
                    endTimeInput.val(0);
                }
            } else {
                chkPNow.setStatus(0, true);
                endTimeYear.prop('disabled', true).val('');
                endTimeMonth.prop('disabled', true).val('');
                endTimeInput.val(0);
            }

            attr = preview.find('.projectName').text();
            this.getElement('txtProjectName').val(attr);

            attr = preview.find('.projectDuty').text();
            this.getElement('txtDuty').val(attr);

            attr = preview.find('.labelProjectIntr').attr('data-projectIntr');
            this.getElement('taProjectIntr').val(attr).resetWatermark();
            attr = preview.find('.labelProjectExperience').attr('data-projectExperience');
            this.getElement('taProjectExperience').val(attr).resetWatermark();

            jobDater.update("ProjectTime");
        }
    }
    projectInfoEditor.on('init', function () {
        var self = this;
        projectValidators.addDomCache(true);
        chkPNow = new checkBoxer({
            element: this.getDom('.icon-chck'),
            className: 'icon-chck-checked'
        });
        chkPNow.on('select', function (e) {
            var endTimeYear = self.getElement('inpProjectTimeEndYear'),
                endTimeMonth = self.getElement('inpProjectTimeEndMonth'),
                endTimeInput = self.getElement('hidProjectTimeEnd');
            if (this.isChecked(0)) {
                endTimeYear.val('').prop('disabled', true);
                endTimeMonth.val('').prop('disabled', true);
                endTimeInput.val('');
            } else {
                endTimeYear.prop('disabled', false);
                endTimeMonth.prop('disabled', false);
                endTimeInput.val(0);
            }

            if (projectValidators.checkElement(self.getElement('inpProjectTimeStartYear')[0]) &&
                projectValidators.checkElement(self.getElement('inpProjectTimeStartMonth')[0])) {
                projectValidators.checkElement(endTimeInput[0]);
            }
        });

        projectValidators.addRules('hidProjectTimeEnd', {
            laterThan: {
                context: this,
                startName: 'hidProjectTimeStart',
                endName: 'hidProjectTimeEnd',
                chkName: chkPNow
            }
        });

        jobDater.bind({
            id: "ProjectTime",
            dateEntry: [0, 1, 3, 4],
            size: 20,
            min: -55,
            //max: 2,
            onSelect: function (e) {
                var f = projectValidators.checkElement($(e.target)[0]);
                if (e.next && e.next.length) {
                    f = projectValidators.checkElement($(e.next)[0]);
                } else {
                    f = projectValidators.checkElement(self.getElement('inpProjectTimeStartYear')[0]);
                }
                if (f === false) return;

                var intTimeS = 0;
                var intSYear = parseInt(self.getElement('inpProjectTimeStartYear').val());
                var intSMonth = parseInt(self.getElement('inpProjectTimeStartMonth').val());
                if (!isNaN(intSYear)) {
                    intTimeS += intSYear * 10000;
                }
                if (!isNaN(intSMonth)) {
                    intTimeS += intSMonth * 100;
                }
                self.getElement('hidProjectTimeStart').val(intTimeS);

                var intTimeE = 0;
                var intEYear = parseInt(self.getElement('inpProjectTimeEndYear').val());
                var intEMonth = parseInt(self.getElement('inpProjectTimeEndMonth').val());
                if (!isNaN(intEYear)) {
                    intTimeE += intEYear * 10000;
                }
                if (!isNaN(intEMonth)) {
                    intTimeE += intEMonth * 100;
                }
                self.getElement('hidProjectTimeEnd').val(intTimeE);
                projectValidators.checkElement(self.getElement('hidProjectTimeEnd')[0]);
            },
            noSelect: function (e) {
                projectValidators.checkElement($(e.target)[0]);
            }
        });
    });
    projectInfoEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    projectInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton;
        var self = this,
            data = {resume_id: resume_id},
            index = this.getIndex();
        if (index != undefined) {
            data['hidModProjectID'] = this._normal.eq(index).attr('data-projectid');
        }
        projectValidators.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: data,
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        self.updatePreview(result);
                        if (e.otherEvent) {
                            self._normal.eq(0).before(self._edit.show());
                            delete self._oldIndex;
                            self._isAdd = true;
                            self.clearData();
                        }
                        var size = $('#projectInfor .projectRows').size();
                        if (size == 0) {
                            $('#proAdd').css('display', 'block');
                        } else {
                            $('#proAdd').css('display', 'none');
                        }
                        //$('#proAdd').css('display','none');
                        //window.location.reload();
                        window.parent.preview_resume_iframe_reload(e.otherEvent ? false : true);
                    }, clearForm: false
                });
            }
        });
    };
    projectInfoEditor.on('add', function () {
        this.toggleNoData(true);
        this.clearData();
    });
    projectInfoEditor.on('modify', function () {
        this.toggleNoData(true);
        this.resetForm();
        this.resetData();
    });
    projectInfoEditor.on('delete', function (e) {
        var index = this.getIndex(),
            preview = this._normal.eq(index),
            data = {
                'operate': 'DeleteProject',
                'resume_id': resume_id,
                'project_id': preview.attr('data-projectid')
            },
            self = this;
        confirmBox.confirm('确定删除该项目经验吗？', null, function () {
            var that = this;
            $.post('/hbResume/DelDo/', data, function (json) {
                that.hide();
                if (json.error) {
                    confirmBox.alert(json.error, null, {title: '保存失败'});
                    return;
                }
                self.deleteList(index);
                self.hasNormalData(self._normal.length);
                updateCompPercent(json.complete_percent);
                var size = $('#projectInfor .projectRows').size();
                if (size == 0) {
                    $('#proAdd').css('display', 'block');
                } else {
                    $('#proAdd').css('display', 'none');
                }
                //window.location.reload();
                window.parent.preview_resume_iframe_reload();
            }, 'json');
        });
    });
    projectInfoEditor.on('cancel', function () {
        this.toggleNoData(this._normal.length);
    });
    /*项目经验*/

    /*实践经验*/
    var practiceRules = {
            txtPracticeName: {
                required: true, range: [2, 30]
            },
            inpPracticeTimeStartYear: 'number',
            inpPracticeTimeStartMonth: 'number',
            taPracticeDetail: {max: 500}
        },
        practiceErrorMsg = {
            txtPracticeName: {
                required: '<em></em><i></i>请填写获奖名称',
                range: '<em></em><i></i>2-30个字'
            },
            inpPracticeTimeStartYear: '<em></em><i></i>请填写获奖年份',
            inpPracticeTimeStartMonth: '<em></em><i></i>请填写获奖月份',
            //hidPracticeTimeEnd: '<em></em><i></i>结束时间大于起始时间',
            taPracticeDetail: '<em></em><i></i>补充说明为2-20个字'
        },
        practiceGroups = {
            practiceTime: 'inpPracticeTimeStartYear inpPracticeTimeStartMonth hidPracticeTimeEnd'
        },
        practiceKeepBlur = [
            'inpPracticeTimeStartYear', 'inpPracticeTimeStartMonth', 'hidPracticeTimeEnd'
        ].join(' ');

    var practiceInfoEditor = new editMutilResume({
            element: $('#practiceInfor'),
            normalName: '.practiceRows',
            validators: {
                rules: practiceRules,
                errorMessages: practiceErrorMsg,
                errorElement: '',
                groups: practiceGroups,
                keepBlur: practiceKeepBlur,
                keepKey: true,
                isCache: false
            }
        }),
        practiceValidators = practiceInfoEditor.getValidator(), chkPRNow;

    practiceInfoEditor._normalUL = practiceInfoEditor.getDom('.project-expr');
    practiceInfoEditor._normalNoData = practiceInfoEditor.getDom('.no-data');
    practiceInfoEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            if (!this._edit.closest('.project-expr').length) {
                this._normalUL.hide();
            }
        }
        updateRightSideList(10, e);
    }
    practiceInfoEditor.toggleNoData = function (e) {
        if (e) {
            this._normalNoData.hide();
        } else {
            this._normalNoData.show();
        }
    }
    practiceInfoEditor.clearData = function () {
        chkPRNow && chkPRNow.setStatus(0, false, true);
        this.getElement('inpPracticeTimeEndYear').prop('disabled', false);
        this.getElement('inpPracticeTimeEndMonth').prop('disabled', false);
        this.resetForm(true);
        jobDater.update("PracticeTime");
    }
    practiceTemplate1 = [
        '<div class="clearfix editPanel practiceRows" data-practiceid="{data-practiceid}">',
        '<span class="time" data-starttime="{data-starttime}">{label-starttime}</span>',
        '<div class="box-item">',
        '<p class="tit">',
        '<span class="oper"><a href="javascript:delDo(\'practiceDel\');" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
        '<strong class="name practiceName">{practiceName}</strong><span class="practiceDetail" data-content="{practiceDetail2}">（{practiceDetail}）</span></p>',
        '</div></div>'
    ].join('');
    practiceTemplate2 = [
        '<div class="clearfix editPanel practiceRows" data-practiceid="{data-practiceid}">',
        '<span class="time" data-starttime="{data-starttime}">{label-starttime}</span>',
        '<div class="box-item">',
        '<p class="tit">',
        '<span class="oper"><a href="javascript:delDo(\'practiceDel\');" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
        '<strong class="name practiceName">{practiceName}</strong><span class="practiceDetail" data-content="{practiceDetail2}"></span></p>',
        '</div></div>'
    ].join('');
    practiceInfoEditor.updatePreview = function (e) {
        var index = this.getIndex(),
            dataObj = {
                'practiceName': this.getElement('txtPracticeName').val(),
                'practiceDetail': this.getElement('taPracticeDetail').val().replace(/\n/g, "<br/>"),
                'practiceDetail2': this.getElement('taPracticeDetail').val(),
                'data-practiceid': e.practice_id
            },
            startTimeYear = this.getElement('inpPracticeTimeStartYear').val(),
            startTimeMonth = this.getElement('inpPracticeTimeStartMonth').val(),
            endTimeYear = this.getElement('inpPracticeTimeEndYear').val(),
            endTimeMonth = this.getElement('inpPracticeTimeEndMonth').val(),
            startTime = startTimeYear + '/' + startTimeMonth + '/1',
            endTime;

        if (endTimeYear) {
            endTime = endTimeYear + '/' + endTimeMonth + '/1';
        } else {
            endTime = '';
        }
        dataObj['data-starttime'] = startTime;
        dataObj['data-endtime'] = endTime;
        if (startTimeMonth < 10) {
            startTimeMonth = '0' + startTimeMonth;
        }
        dataObj['label-starttime'] = startTimeYear + '.' + startTimeMonth;
        //dataObj['label-endtime'] = endTime ? '至 ' + endTimeYear + '-' + endTimeMonth : '';

        if (!this._isAdd) {
            var preview = this._normal.eq(index);
            preview.find('.time').attr({
                'data-starttime': dataObj['data-starttime'],
                'data-endtime': dataObj['data-endtime']
            }).html(dataObj['label-starttime']);

            preview.find('.practiceName').text(dataObj['practiceName']);
            preview.find('.practiceDetail').html(dataObj['practiceDetail']).attr("data-content", dataObj['practiceDetail2']);
            //preview.find('.practiceDetail').text(dataObj['practiceDetail']);
            this.show();
        } else {
            if (dataObj['practiceDetail'] == '') {
                practiceTemplate = practiceTemplate2;
            } else {
                practiceTemplate = practiceTemplate1;
            }
            this.getDom('.project-expr').prepend(util.string.replace(practiceTemplate, dataObj));
            this.update();
            this.show();
            delete this._isAdd;
            this.hasNormalData(this._normal.length);
        }
    }
    practiceInfoEditor.resetData = function () {
        var index = this.getIndex(), preview;
        if ((preview = this._normal.eq(index)).length) {
            this.resetForm(true);
            var Time = preview.find('.time'),
                StTime = Time.attr('data-starttime'),
                EnTime = Time.attr('data-endtime'),
                attr;

            if (StTime) {
                StTime = new Date(StTime);
                this.getElement('inpPracticeTimeStartYear').val(StTime.getFullYear());
                this.getElement('inpPracticeTimeStartMonth').val(StTime.getMonth() + 1);
                this.getElement('hidPracticeTimeStart').val(StTime.getFullYear() * 10000 + (StTime.getMonth() + 1) * 100);
            }

            var endTimeYear = this.getElement('inpPracticeTimeEndYear'),
                endTimeMonth = this.getElement('inpPracticeTimeEndMonth'),
                endTimeInput = this.getElement('hidPracticeTimeEnd');

            if (EnTime) {
                EnTime = new Date(EnTime);
                if (util.type.isDate(EnTime)) {
                    endTimeYear.prop('disabled', false).val(EnTime.getFullYear());
                    endTimeMonth.prop('disabled', false).val(EnTime.getMonth() + 1);
                    endTimeInput.val(
                        EnTime.getFullYear() * 10000 + (EnTime.getMonth() + 1) * 100
                    );
                    chkPRNow.setStatus(0, false);
                } else {
                    chkPRNow.setStatus(0, true);
                    endTimeYear.prop('disabled', true).val('');
                    endTimeMonth.prop('disabled', true).val('');
                    endTimeInput.val(0);
                }
            } else {
                chkPRNow.setStatus(0, true);
                endTimeYear.prop('disabled', true).val('');
                endTimeMonth.prop('disabled', true).val('');
                endTimeInput.val(0);
            }

            attr = preview.find('.practiceName').text();
            this.getElement('txtPracticeName').val(attr);

            attr = preview.find('.practiceDetail').text();
            this.getElement('taPracticeDetail').val(preview.find(".practiceDetail").attr("data-content"));

            jobDater.update("PracticeTime");
        }
    }
    practiceInfoEditor.on('init', function () {
        var self = this;
        practiceValidators.addDomCache(true);
        chkPRNow = new checkBoxer({
            element: this.getDom('.icon-chck'),
            className: 'icon-chck-checked'
        });
        practiceValidators.addRules('hidPracticeTimeEnd', {
            laterThan: {
                context: this,
                startName: 'hidPracticeTimeStart',
                endName: 'hidPracticeTimeEnd',
                chkName: chkPRNow
            }
        });
        chkPRNow.on('select', function (e) {
            var endTimeYear = self.getElement('inpPracticeTimeEndYear'),
                endTimeMonth = self.getElement('inpPracticeTimeEndMonth'),
                endTimeInput = self.getElement('hidPracticeTimeEnd');
            if (this.isChecked(0)) {
                endTimeYear.val('').prop('disabled', true);
                endTimeMonth.val('').prop('disabled', true);
                endTimeInput.val('');
            } else {
                endTimeYear.prop('disabled', false);
                endTimeMonth.prop('disabled', false);
                endTimeInput.val(0);
            }

            if (practiceValidators.checkElement(self.getElement('inpPracticeTimeStartYear')[0]) &&
                practiceValidators.checkElement(self.getElement('inpPracticeTimeStartMonth')[0])) {
                practiceValidators.checkElement(endTimeInput[0]);
            }
        });

        jobDater.bind({
            id: "PracticeTime",
            dateEntry: [0, 1, 3, 4],
            size: 20,
            min: -55,
            //max: 2,
            onSelect: function (e) {
                var f = practiceValidators.checkElement($(e.target)[0]);
                if (e.next && e.next.length) {
                    f = practiceValidators.checkElement($(e.next)[0]);
                } else {
                    f = practiceValidators.checkElement(self.getElement('inpPracticeTimeStartYear')[0]);
                }
                if (f === false) return;

                var intTimeS = 0;
                var intSYear = parseInt(self.getElement('inpPracticeTimeStartYear').val());
                var intSMonth = parseInt(self.getElement('inpPracticeTimeStartMonth').val());
                if (!isNaN(intSYear)) {
                    intTimeS += intSYear * 10000;
                }
                if (!isNaN(intSMonth)) {
                    intTimeS += intSMonth * 100;
                }
                self.getElement('hidPracticeTimeStart').val(intTimeS);

                var intTimeE = 0;
                var intEYear = parseInt(self.getElement('inpPracticeTimeEndYear').val());
                var intEMonth = parseInt(self.getElement('inpPracticeTimeEndMonth').val());
                if (!isNaN(intEYear)) {
                    intTimeE += intEYear * 10000;
                }
                if (!isNaN(intEMonth)) {
                    intTimeE += intEMonth * 100;
                }
                self.getElement('hidPracticeTimeEnd').val(intTimeE);
                practiceValidators.checkElement(self.getElement('hidPracticeTimeEnd')[0]);
            },
            noSelect: function (e) {
                practiceValidators.checkElement($(e.target)[0]);
            }
        });
    });
    practiceInfoEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    practiceInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton;
        var self = this,
            data = {'resume_id': resume_id},
            index = this.getIndex();

        if (index != undefined) {
            data['hidModPracticeID'] = this._normal.eq(index).attr('data-practiceid');
        }
        practiceValidators.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: data,
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        self.updatePreview(result);
                        if (e.otherEvent) {
                            self._normal.eq(0).before(self._edit.show());
                            delete self._oldIndex;
                            self._isAdd = true;
                            self.clearData();
                        }
                        var size = $('#practiceInfor .practiceRows').size();
                        if (size == 0) {
                            $('#winAdd').css('display', 'block');
                        } else {
                            $('#winAdd').css('display', 'none');
                        }

                        //	$('#winAdd').css('display','none');
                        //window.location.reload();
                        window.parent.preview_resume_iframe_reload(e.otherEvent ? false : true);
                    }, clearForm: false
                });
            }
        });
    };
    practiceInfoEditor.on('delete', function (e) {
        var index = this.getIndex(),
            preview = this._normal.eq(index),
            data = {
                'operate': 'DeleteWinning',
                'resume_id': resume_id,
                'practice_id': preview.attr('data-practiceid')
            },
            self = this;
        confirmBox.confirm('确定删除该获奖经历吗？', null, function () {
            var that = this;
            $.post('/hbResume/DelDo/', data, function (json) {
                that.hide();
                if (json.error) {
                    confirmBox.alert(json.error, null, {title: '保存失败'});
                    return;
                }
                self.deleteList(index);
                self.hasNormalData(self._normal.length);
                updateCompPercent(json.complete_percent);
                var size = $('#practiceInfor .practiceRows').size();
                if (size == 0) {
                    $('#winAdd').css('display', 'block');
                } else {
                    $('#winAdd').css('display', 'none');
                }
                //window.location.reload();
                window.parent.preview_resume_iframe_reload();
            }, 'json');
        });
    });
    practiceInfoEditor.on('add', function () {
        this.toggleNoData(true);
        this.clearData();
    });
    practiceInfoEditor.on('modify', function () {
        this.toggleNoData(true);
        this.resetForm();
        this.resetData();
    });
    practiceInfoEditor.on('cancel', function () {
        this.toggleNoData(this._normal.length);
    });
    /*实践经验*/

    /*语言能力*/
    var languageInfoEditor = new editResume({
            element: $('#languageInfor'),
            normalName: '.resume-item',
            validators: {
                errorElement: 'span'
            }
        }),
        languageInfoValidator = languageInfoEditor.getValidator(),
        languageTemplate = {
            list: [
                '<div class="mgt10 formRows language-rows" {languageid}>',
                '<input type="hidden" name="hidLanguageTypeID[]" value="" />',
                '<div class="clearfix">',
                '<div id="selLanguageType{num}" class="selLanguageType dropv2" style="width:152px;">',
                '<b class="hbFntWes dropIco">&#xf0d7;</b>',
                '<label>请选择语种</label><ul class="options">',
                '<li data-value=""><a href="javascript:">请选择语种</a></li>',
                '<li data-value="11"><a href="javascript:">普通话</a></li>',
                '<li data-value="13"><a href="javascript:">粤语</a></li>',
                '<li data-value="01"><a href="javascript:">英语</a></li>',
                '<li data-value="02"><a href="javascript:">日语</a></li>',
                '<li data-value="05"><a href="javascript:">法语</a></li>',
                '<li data-value="06"><a href="javascript:">俄语</a></li>',
                '<li data-value="04"><a href="javascript:">德语</a></li>',
                '<li data-value="07"><a href="javascript:">西班牙语</a></li>',
                '<li data-value="03"><a href="javascript:">韩语</a></li>',
                '<li data-value="10"><a href="javascript:">阿拉伯语</a></li>',
                '<li data-value="09"><a href="javascript:">意大利语</a></li>',
                '<li data-value="08"><a href="javascript:">葡萄牙语</a></li>',
                '<li data-value="12"><a href="javascript:">其他语种</a></li>',
                '</ul></div>',
                '<div id="selLangSkillLevel{num}" class="selLangSkillLevel dropv2 mgl10" style="width:85px;">',
                '<b class="hbFntWes dropIco">&#xf0d7;</b>',
                '<label>熟悉程度</label><ul>',
                '<li data-value=""><a href="javascript:void(0)">熟悉程度</a></li>',
                '<li data-value="01"><a href="javascript:void(0)">入门</a></li>',
                '<li data-value="02"><a href="javascript:void(0)">熟练</a></li>',
                '<li data-value="03"><a href="javascript:void(0)">精通</a></li>',
                '</ul></div>',
                '<div id="selLangCert{num}" class="selLangCert dropv2 mgl10" style="width:220px;">',
                '<b class="hbFntWes dropIco">&#xf0d7;</b>',
                '<label>已通过等级考试（非必填）</label></div>',
                '<em title="删除" class="hbIconMoon hbdelet">&#xe0a8;</em>',
                '<span class="prompt-msg msg" data-for="languageMsg{num}"></span>',
                '</div>',
                '</div>'
            ].join('')
        },
        languagePreviewTemplate = [
            '<li {languageid}>',
            '<strong class="language name" v="{language_type}">{language_type_name}</strong>',
            '<span class="cd"><strong class="level" v="{skill_level}">{skill_level_name}</strong>{certs}</span>',
            '</li>'
        ].join(''),
        languageHid = {
            'addHid': '<input type="hidden" name="hidAddLanguageID[]" value="{num}" />',
            'modHid': '<input type="hidden" name="hidModLanguageID[]" value="{num}" />',
            'delHid': '<input type="hidden" name="hidDelLanguageID[]" value="{num}" />'
        },
        certNames = [[{
            name: 'certName',
            value: '普通话一级甲等',
            label: '普通话一级甲等'
        }, {
            name: 'certName',
            value: '普通话一级乙等',
            label: '普通话一级乙等'
        }, {
            name: 'certName',
            value: '普通话二级甲等',
            label: '普通话二级甲等'
        }, {
            name: 'certName',
            value: '普通话二级乙等',
            label: '普通话二级乙等'
        }, {
            name: 'certName',
            value: '普通话三级甲等',
            label: '普通话三级甲等'
        }, {
            name: 'certName',
            value: '普通话三级乙等',
            label: '普通话三级乙等'
        }], [], [{
            name: 'certName',
            value: '大学英语四级',
            label: '大学英语四级'
        }, {
            name: 'certName',
            value: '大学英语六级',
            label: '大学英语六级'
        }, {
            name: 'certName',
            value: '专业英语四级',
            label: '专业英语四级'
        }, {
            name: 'certName',
            value: '专业英语八级',
            label: '专业英语八级'
        }, {
            name: 'certName',
            value: 'ETS-1',
            label: 'PETS-1'
        }, {
            name: 'certName',
            value: 'PETS-2',
            label: 'PETS-2'
        }, {
            name: 'certName',
            value: 'PETS-3',
            label: 'PETS-3'
        }, {
            name: 'certName',
            value: 'PETS-4',
            label: 'PETS-4'
        }, {
            name: 'certName',
            value: 'PETS-5',
            label: 'PETS-5'
        }, {
            name: 'certName',
            value: '剑桥商务英语 BEC Pre.',
            label: '剑桥商务英语 BEC Pre.'
        }, {
            name: 'certName',
            value: '剑桥商务英语 BEC Van.',
            label: '剑桥商务英语 BEC Van.'
        }, {
            name: 'certName',
            value: '剑桥商务英语 BEC Hi.',
            label: '剑桥商务英语 BEC Hi.'
        }, {
            name: 'certName',
            value: 'TOEFL',
            label: 'TOEFL'
        }, {
            name: 'certName',
            value: 'IELTS',
            label: 'IELTS'
        }, {
            name: 'certName',
            value: 'TOEIC',
            label: 'TOEIC'
        }, {
            name: 'certName',
            value: 'GRE',
            label: 'GRE'
        }, {
            name: 'certName',
            value: 'GMAT',
            label: 'GMAT'
        }], [{
            name: 'certName',
            value: '日语一级',
            label: '日语一级'
        }, {
            name: 'certName',
            value: '日语五级',
            label: '日语五级'
        }, {
            name: 'certName',
            value: '日语四级',
            label: '日语四级'
        }, {
            name: 'certName',
            value: '大学日语四级',
            label: '大学日语四级'
        }, {
            name: 'certName',
            value: '大学日语六级',
            label: '大学日语六级'
        }, {
            name: 'certName',
            value: '专业日语四级',
            label: '专业日语四级'
        }, {
            name: 'certName',
            value: '专业日语八级',
            label: '专业日语八级'
        }, {
            name: 'certName',
            value: '日本语能力测试JLPT-N1',
            label: '日本语能力测试JLPT-N1'
        }, {
            name: 'certName',
            value: '日本语能力测试JLPT-N2',
            label: '日本语能力测试JLPT-N2'
        }, {
            name: 'certName',
            value: '日本语能力测试JLPT-N3',
            label: '日本语能力测试JLPT-N3'
        }, {
            name: 'certName',
            value: '日本语能力测试JLPT-N4',
            label: '日本语能力测试JLPT-N4'
        }, {
            name: 'certName',
            value: '日本语能力测试JLPT-N5',
            label: '日本语能力测试JLPT-N5'
        }], [{
            name: 'certName',
            value: '大学法语四级',
            label: '大学法语四级'
        }, {
            name: 'certName',
            value: '专业法语四级',
            label: '专业法语四级'
        }, {
            name: 'certName',
            value: '专业法语八级',
            label: '专业法语八级'
        }, {
            name: 'certName',
            value: 'DELF-1',
            label: 'DELF-1'
        }, {
            name: 'certName',
            value: 'DELF-2',
            label: 'DELF-2'
        }, {
            name: 'certName',
            value: 'DALF',
            label: 'DALF'
        }, {
            name: 'certName',
            value: 'DELF-A1',
            label: 'DELF-A1'
        }, {
            name: 'certName',
            value: 'DELF-A2',
            label: 'DELF-A2'
        }, {
            name: 'certName',
            value: 'DELF-B1',
            label: 'DELF-B1'
        }, {
            name: 'certName',
            value: 'DELF-B2',
            label: 'DELF-B2'
        }, {
            name: 'certName',
            value: 'DALF-C1',
            label: 'DALF-C1'
        }, {
            name: 'certName',
            value: 'DALF-C2',
            label: 'DALF-C2'
        }, {
            name: 'certName',
            value: 'TEF-1',
            label: 'TEF-1'
        }, {
            name: 'certName',
            value: 'TEF-2',
            label: 'TEF-2'
        }, {
            name: 'certName',
            value: 'TEF-3',
            label: 'TEF-3'
        }, {
            name: 'certName',
            value: 'TEF-4',
            label: 'TEF-4'
        }, {
            name: 'certName',
            value: 'TEF-5',
            label: 'TEF-5'
        }, {
            name: 'certName',
            value: 'TEF-6',
            label: 'TEF-6'
        }, {
            name: 'certName',
            value: 'TCF-1',
            label: 'TCF-1'
        }, {
            name: 'certName',
            value: 'TCF-2',
            label: 'TCF-2'
        }, {
            name: 'certName',
            value: 'TCF-3',
            label: 'TCF-3'
        }, {
            name: 'certName',
            value: 'TCF-4',
            label: 'TCF-4'
        }, {
            name: 'certName',
            value: 'TCF-5',
            label: 'TCF-5'
        }, {
            name: 'certName',
            value: 'TCF-6',
            label: 'TCF-6'
        }], [{
            name: 'certName',
            value: '大学俄语四级',
            label: '大学俄语四级'
        }, {
            name: 'certName',
            value: '大学俄语六级',
            label: '大学俄语六级'
        }, {
            name: 'certName',
            value: '专业俄语四级',
            label: '专业俄语四级'
        }, {
            name: 'certName',
            value: '专业俄语八级',
            label: '专业俄语八级'
        }], [{
            name: 'certName',
            value: '大学德语四级',
            label: '大学德语四级'
        }, {
            name: 'certName',
            value: '专业德语四级',
            label: '专业德语四级'
        }, {
            name: 'certName',
            value: 'DSH-1',
            label: 'DSH-1'
        }, {
            name: 'certName',
            value: 'DSH-2',
            label: 'DSH-2'
        }, {
            name: 'certName',
            value: 'DSH-3',
            label: 'DSH-3'
        }, {
            name: 'certName',
            value: 'TestDeF-N3',
            label: 'TestDeF-N3'
        }, {
            name: 'certName',
            value: 'TestDeF-N4',
            label: 'TestDeF-N4'
        }, {
            name: 'certName',
            value: 'TestDeF-N5',
            label: 'TestDeF-N5'
        }], [{
            name: 'certName',
            value: '专业西班牙语四级',
            label: '专业西班牙语四级'
        }, {
            name: 'certName',
            value: '专业西班牙语八级',
            label: '专业西班牙语八级'
        }, {
            name: 'certName',
            value: 'DELE-A1',
            label: 'DELE-A1'
        }, {
            name: 'certName',
            value: 'DELE-A2',
            label: 'DELE-A2'
        }, {
            name: 'certName',
            value: 'DELE-B1',
            label: 'DELE-B1'
        }, {
            name: 'certName',
            value: 'DELE-B2',
            label: 'DELE-B2'
        }, {
            name: 'certName',
            value: 'DELE-C1',
            label: 'DELE-C1'
        }, {
            name: 'certName',
            value: 'DELE-C2',
            label: 'DELE-C2'
        }], [{
            name: 'certName',
            value: '专业韩语四级',
            label: '专业韩语四级'
        }, {
            name: 'certName',
            value: 'S-Topik 初级',
            label: 'S-Topik 初级'
        }, {
            name: 'certName',
            value: 'S-Topik 中级',
            label: 'S-Topik 中级'
        }, {
            name: 'certName',
            value: 'S-Topik 高级',
            label: 'S-Topik 高级'
        }], [{
            name: 'certName',
            value: '阿拉伯语专业四级',
            label: '阿拉伯语专业四级'
        }], [{
            name: 'certName',
            value: 'CILS-A1',
            label: 'CILS-A1'
        }, {
            name: 'certName',
            value: 'CILS-A2',
            label: 'CILS-A2'
        }, {
            name: 'certName',
            value: 'CILS-B1',
            label: 'CILS-B1'
        }, {
            name: 'certName',
            value: 'CILS-B2',
            label: 'CILS-B2'
        }, {
            name: 'certName',
            value: 'CILS-C1',
            label: 'CILS-C1'
        }, {
            name: 'certName',
            value: 'CILS-C2',
            label: 'CILS-C2'
        }, {
            name: 'certName',
            value: 'CELI-A1',
            label: 'CELI-A1'
        }, {
            name: 'certName',
            value: 'CELI-A2',
            label: 'CELI-A2'
        }, {
            name: 'certName',
            value: 'CELI-B1',
            label: 'CELI-B1'
        }, {
            name: 'certName',
            value: 'CELI-B2',
            label: 'CELI-B2'
        }, {
            name: 'certName',
            value: 'CELI-C1',
            label: 'CELI-C1'
        }, {
            name: 'certName',
            value: 'CELI-C2',
            label: 'CELI-C2'
        }, {
            name: 'certName',
            value: 'IT-A2',
            label: 'IT-A2'
        }, {
            name: 'certName',
            value: 'IT-B1',
            label: 'IT-B1'
        }, {
            name: 'certName',
            value: 'IT-B2',
            label: 'IT-B2'
        }, {
            name: 'certName',
            value: 'IT-C2',
            label: 'IT-C2'
        }, {
            name: 'certName',
            value: 'PLIDA-A1',
            label: 'PLIDA-A1'
        }, {
            name: 'certName',
            value: 'PLIDA-A2',
            label: 'PLIDA-A2'
        }, {
            name: 'certName',
            value: 'PLIDA-A2',
            label: 'PLIDA-A2'
        }, {
            name: 'certName',
            value: 'PLIDA-B1',
            label: 'PLIDA-B1'
        }, {
            name: 'certName',
            value: 'PLIDA-B2',
            label: 'PLIDA-B2'
        }, {
            name: 'certName',
            value: 'PLIDA-C1',
            label: 'PLIDA-C1'
        }, {
            name: 'certName',
            value: 'PLIDA-C2',
            label: 'PLIDA-C2'
        }], [{
            name: 'certName',
            value: 'CIPLE',
            label: 'CIPLE'
        }, {
            name: 'certName',
            value: 'DEPLE',
            label: 'DEPLE'
        }, {
            name: 'certName',
            value: 'DIPLE',
            label: 'DIPLE'
        }, {
            name: 'certName',
            value: 'DAPLE',
            label: 'DAPLE'
        }, {
            name: 'certName',
            value: 'DUPLE',
            label: 'DUPLE'
        }]],
        languageRules = 'required',
        languageTypeMsg = '<em></em><i></i>请选择语言种类',
        languageLevelMsg = '<em></em><i></i>请选择熟练程度';
    languageInfoEditor._indexs = [];
    languageInfoEditor._index = -1;
    languageInfoEditor._normalUL = languageInfoEditor.getDom('.tag-box');
    languageInfoEditor._normalNoData = languageInfoEditor.getDom('.no-data');
    languageInfoEditor._normalLi = languageInfoEditor._normalUL.find('li');
    languageInfoEditor._editGroup = languageInfoEditor.getDom('.languageGroup');
    languageInfoEditor._addBtn = languageInfoEditor.getDom('.addyuyan a');
    languageInfoEditor.maxSize = 6;
    languageInfoEditor.on('render', function () {
        var self = this;
        if (this._normalLi.length) {
            this._normalLi.each(function (index) {
                self.addList(index);
            });
        } else {
            self.addList(0);
        }
        this.updateEditorList();
        this._tempHTML = this._editGroup.html();
    });
    languageInfoEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            this._normalUL.hide();
        }
        updateRightSideList(7, e);
    }
    languageInfoEditor.updateEditorList = function () {
        this._editLi = this._editGroup.find('.language-rows');
    }
    languageInfoEditor.toggleDel = function () {
        if (this._editLi.length <= 0) {
            this._addBtn.trigger('click');
        }
    }
    languageInfoEditor.deleteEditorList = function (index) {
        this.selLanguageType[index].destory();
        this.selLangSkillLevel[index].destory();
        this.selCert[index].destory();
        languageInfoValidator.removeGroup('languageMsg' + this._indexs[index]);
        var i = index,
            len = this._editLi.length - 1;
        for (; i < len; i++) {
            this.selLanguageType[i] = this.selLanguageType[i + 1];
            this.selLangSkillLevel[i] = this.selLangSkillLevel[i + 1];
            this.selCert[i] = this.selCert[i + 1];
            this._indexs[i] = this._indexs[i + 1];
        }
        this.selLanguageType.splice(len, 1);
        this.selLangSkillLevel.splice(len, 1);
        this.selCert.splice(len, 1);
        this._indexs.splice(len, 1);
        var editLi = this._editLi.eq(index);
        editLi.remove();
        if (editLi.attr('data-languageid') != undefined) {
            this._editGroup.prepend(util.string.replace(languageHid.delHid, {num: editLi.attr('data-languageid')}));
        }
        this.updateEditorList();
        this.toggleDel();
        this.isAdd();
        set_resume_tips($("#languageInfor .edit_resume_tips"));
    }
    languageInfoEditor.deleteAllEditorList = function () {
        var self = this;
        $.each(this._editLi, function (index, val) {
            var id = self._indexs[index];
            languageInfoValidator.removeGroup('languageMsg' + id);
            if (self.selLanguageType[index]) {
                self.selLanguageType[index].destory();
                delete self.selLanguageType[index];
            }
            if (self.selLangSkillLevel[index]) {
                self.selLangSkillLevel[index].destory();
                delete self.selLangSkillLevel[index];
            }
            if (self.selCert[index]) {
                self.selCert[index].hide().destory();
                delete self.selCert[index];
            }
        });
        this.selLanguageType = [];
        this.selLangSkillLevel = [];
        this.selCert = [];
        this._indexs = [];
        this.selLanguageType.length = 0;
        this.selLangSkillLevel.length = 0;
        this.selCert.length = 0;
        this._indexs.length = 0;
        this.isModHid = {};
    }
    languageInfoEditor.resetEditorList = function () {
        if (this._tempHTML) {
            this.deleteAllEditorList();
            this._editGroup.empty().html(this._tempHTML);
            this.updateEditorList();
        }
    }
    languageInfoEditor.isAdd = function () {
        if (this._editLi.length - 1 >= this.maxSize - 1) {
            this._addBtn.hide();
            return false;
        }
        this._addBtn.show();
        return true;
    }
    languageInfoEditor.addList = function (index, isRender) {
        this._index++;
        var renderObj = {zIndex: this._index};
        if (!isRender) {
            var attr = this._normalLi.eq(index).attr('data-languageid');
            if (attr != undefined) {
                renderObj['num'] = attr;
                renderObj['languageid'] = "data-languageid='" + attr + "'";
            } else {
                renderObj['num'] = this._index;
            }
        } else {
            renderObj['num'] = this._index;
        }
        var languageDom = $(util.string.replace(languageTemplate.list, renderObj)).appendTo(this._editGroup);
        if (isRender) {
            languageDom.prepend(util.string.replace(languageHid.addHid, {num: this._index}));
            this._indexs[index] = this._index;
            var typeName = 'selLanguageType' + this._indexs[index],
                levelName = 'selLangSkillLevel' + this._indexs[index];
            var languageType = this.selLanguageType[index] = new select({
                trigger: this.getDom('#selLanguageType' + this._indexs[index]),
                selectName: typeName,
                className: 'dropv2_select',
                align: {baseXY: [0, '100%-1']},
                maxHeight: 200,
                isHidDefault: true,
                selectCallback: {
                    isDefault: true
                }
            });
            var languageLevel = this.selLangSkillLevel[index] = new select({
                trigger: this.getDom('#selLangSkillLevel' + this._indexs[index]),
                selectName: levelName,
                className: 'dropv2_select',
                align: {baseXY: [0, '100%-1']},
                isHidDefault: true,
                selectCallback: {
                    isDefault: true
                }
            });
            var languageCert = this.selCert[index] = new multipleSelect({
                trigger: this.getDom('#selLangCert' + this._indexs[index]),
                selectName: 'selLangCert' + this._indexs[index],
                className: 'm_dropv2_select',
                align: {baseXY: [0, '100%-1']},
                defaultText: '已通过等级考试（非必填）',
                maxHeight: 210,
                zIndex: 600,
                selectCallback: {
                    isDefault: true
                }
            });
            var self = this,
                hidType = this.getElement('hidLanguageTypeID\\[\\]').eq(index);

            languageType.on('change', function (e) {
                if (e.index === e.oldIndex) return;
                var elIndex = self.getDom('.selLanguageType').index(this.get('trigger'));
                updateCombosRules(
                    self,
                    languageInfoValidator, 'languageMsg' + self._indexs[elIndex], typeName, levelName, e.index, null,
                    languageRules, languageRules, languageTypeMsg, languageLevelMsg
                );
                hidType.val(e.value);
                self.linkCerts(this, languageLevel, languageCert);
                languageInfoValidator.checkElement(self.getElement(typeName)[0]);
            });
            languageLevel.setEnabled();
            languageLevel.on('change', function (e) {
                languageInfoValidator.checkElement(self.getElement(levelName)[0]);
            });
        }
        this.updateEditorList();
        this.toggleDel();
        this.isAdd();
        set_resume_tips($("#languageInfor .edit_resume_tips"));
    }
    languageInfoEditor.selLanguageType = [];
    languageInfoEditor.selLangSkillLevel = [];
    languageInfoEditor.selCert = [];
    languageInfoEditor.updatePreview = function (e) {
        this._normalUL.empty();
        var self = this;
        this.deleteAllEditorList();
        this._editGroup.empty();
        this._index = -1;
        this._normalUL.empty();
        if (e && e.length) {
            $.each(e, function (index, val) {
                if (val.language_id != undefined) {
                    val['languageid'] = "data-languageid='" + val.language_id + "'";
                }
                var certs = '';
                if (util.type.isArray(val.certs)) {
                    $.each(val.certs, function (index, val) {
                        certs += val.cert_name + ',';
                    });
                }
                val.certs = " <u>| </u><span class='cert'>" + certs.substring(0, certs.length - 1) + "</span>";
                self._normalUL.append(util.string.replace(languagePreviewTemplate, val));
                self._normalLi = self._normalUL.find('li');
                self.addList(index);
            });
            this.hasNormalData(true);
        } else {
            this.hasNormalData();
        }
        if (!this._editGroup.html()) {
            this.addList();
            this._normalLi = this._normalUL.find('li');
        }
        this._tempHTML = this._editGroup.html();
        this.show();
    }
    languageInfoEditor.isModHid = {};
    languageInfoEditor.addModHid = function (i) {
        if (!this.isModHid[i]) {
            this.isModHid[i] = true;
            var editLi = this._editLi.eq(i);
            if (editLi.attr('data-languageid') != undefined) {
                editLi.prepend(util.string.replace(languageHid.modHid, {num: editLi.attr('data-languageid')}));
            }
        }
    }
    languageInfoEditor.getID = function (dom, i) {
        return dom.attr('data-languageid') || i;
    }
    languageInfoEditor.resetData = function () {
        if (this._normalLi.length === 0) {
            this._addNum = 1;
        }
        var attr, dom, typeName, levelName,
            len = this._addNum || this._normalLi.length;

        this.isAdd();
        for (var i = 0; i < len; i++) {
            if (this._addNum) {
                this._editLi.eq(i).prepend(util.string.replace(languageHid.addHid, {num: i}));
                delete this._addNum;
            }
            dom = this._normalLi.eq(i);
            this._indexs[i] = this.getID(dom, i);
            typeName = 'selLanguageType' + this.getID(dom, i);
            levelName = 'selLangSkillLevel' + this.getID(dom, i);
            var languageType = this.selLanguageType[i] = new select({
                trigger: this.getDom('#selLanguageType' + this.getID(dom, i)),
                selectName: typeName,
                className: 'dropv2_select',
                align: {baseXY: [0, '100%-1']},
                maxHeight: 200,
                isHidDefault: true,
                selectCallback: {
                    isDefault: true
                }
            });
            var languageLevel = this.selLangSkillLevel[i] = new select({
                trigger: this.getDom('#selLangSkillLevel' + this.getID(dom, i)),
                selectName: levelName,
                className: 'dropv2_select',
                align: {baseXY: [0, '100%-1']},
                isHidDefault: true,
                selectCallback: {
                    isDefault: true
                }
            });
            var languageCert = this.selCert[i] = new multipleSelect({
                trigger: this.getDom('#selLangCert' + this.getID(dom, i)),
                selectName: 'selLangCert' + this.getID(dom, i),
                className: 'm_dropv2_select',
                align: {baseXY: [0, '100%-1']},
                defaultText: '已通过等级考试（非必填）',
                maxHeight: 210,
                isHidDefault: true,
                zIndex: 600,
                selectCallback: {
                    isDefault: true
                }
            });
            var hidType = this.getElement('hidLanguageTypeID\\[\\]').eq(i);
            if (attr = dom.find('.language').attr('v')) {
                this.selLanguageType[i].setSelectedValue(attr, true);
                hidType.val(attr);
            } else {
                this.selLanguageType[i].setSelectedIndex(0, true);
            }
            if (attr = dom.find('.level').attr('v')) {
                this.selLangSkillLevel[i].setSelectedIndex(attr, true);
            } else {
                this.selLangSkillLevel[i].setSelectedIndex(0, true);
            }
            this.linkCerts(languageType, languageLevel, languageCert);

            var num;
            if (attr = dom.find('.cert').text()) {
                attr = attr.split(',');
                for (var j = 0, jlen = attr.length; j < jlen; j++) {
                    num = languageCert.indexOf(attr[j]);
                    if (num != -1) {
                        if (languageCert.getCheckBoxer()) {
                            languageCert.getCheckBoxer().setStatus(num, true, true);
                        }
                    }
                }
            }

            var self = this;
            (function (type, level, cert, typeName, levelName, hidType, i, index) {

                updateCombosRules(
                    self,
                    languageInfoValidator, 'languageMsg' + index, typeName, levelName, type.get('selectedIndex'), null,
                    languageRules, languageRules, languageTypeMsg, languageLevelMsg
                );

                type.on('change', function (e) {
                    if (e.index === e.oldIndex) return;
                    updateCombosRules(
                        self,
                        languageInfoValidator, 'languageMsg' + index, typeName, levelName, e.index, null,
                        languageRules, languageRules, languageTypeMsg, languageLevelMsg
                    );
                    hidType.val(e.value);
                    self.linkCerts(this, level, cert);
                    languageInfoValidator.checkElement(self.getElement(typeName)[0]);
                    self.addModHid(i);
                });
                level.on('change', function (e) {
                    languageInfoValidator.checkElement(self.getElement(levelName)[0]);
                    self.addModHid(i);
                });
                cert.on('change', function (e) {
                    self.addModHid(i);
                });
                cert.on('maxLimit', function (e) {
                    var msg = "最多可选三项";
                    confirmBox.timeBomb(msg, {
                        name: 'warning',
                        timeout: 500,
                        width: pWidth + msg.length * fontWidth
                    });
                });
            })(languageType, languageLevel, languageCert, typeName, levelName, hidType, i, this._indexs[i]);
        }
    }
    languageInfoEditor.linkCerts = function (type, level, cert) {
        var index = type.get('selectedIndex'),
            selIndex = type.get('selectedIndex') - 1,
            attr = certNames[selIndex];

        if (index === 0) {
            level.setEnabled();
        } else {
            level.setEnabled(true);
        }

        if (attr && attr.length) {
            cert.setData(attr);
            cert.updateData();
        } else {
            cert.removeAllElements();
        }
    }
    languageInfoEditor.on('init', function () {
        var self = this;
        this._addBtn.on('click', function (e) {
            var index = self._editLi.length;
            self.addList(index, true);
        });
        this.get('element').on('click', '.hbdelet', function (e) {
            var index = self.getDom('.hbdelet').index($(this));
            self.deleteEditorList(index);
        });
    });
    languageInfoEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    languageInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton,
            self = this;
        languageInfoValidator.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: {resume_id: resume_id},
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        languageInfoEditor.updatePreview(result.items);
                        var size = $('#languageInfor .tag-box li').size();
                        if (size == 0) {
                            $('#langAdd').css('display', 'block');
                        } else {
                            $('#langAdd').css('display', 'none');
                        }
                        window.parent.preview_resume_iframe_reload();
                        //window.location.reload();
                    }, clearForm: false
                });
            }
        });
    };
    languageInfoEditor.on('modify', function () {
        this.resetData();
    });
    languageInfoEditor.on('cancel', function () {
        this.resetEditorList();
    });
    /*语言能力*/

    /*技能专长*/
    var skillInforEditor = new editResume({
            element: $('#skillInfor'),
            normalName: '.resume-item',
            validators: {
                errorElement: 'span'
            }
        }),
        skillInforValidator = skillInforEditor.getValidator(),
        skillInfoTemplate = [
            '<div class="formRows skill-rows mgt10" {data-skillid} style="z-index:{zIndex}">',
            '<input type="hidden" name="hidSkillName[]" />',
            '<div class="clearfix">',
            '<div class="zIndex drop formText tecDrop dipIconText" id="spanSkill{num}" style="width:350px">',
            '<b class="hbFntWes">&#xf03a;</b>',
            '<input type="text" style="width:295px;font-size:12px" class="text" name="txtSkillName{num}" id="txtSkillName{num}" value=""  placeholder="请输入技能名称" />',
            '</div>',
            '<div id="selSkillLevel{num}" class="selSkillLevel dropv2 mgl10" style="width:110px;width:85px;">',
            '<b class="hbFntWes dropIco">&#xf0d7;</b>',
            '<label>熟练程度</label><ul>',
            '<li data-value=""><a href="javascript:">熟练程度</a></li>',
            '<li data-value="01"><a href="javascript:">入门</a></li>',
            '<li data-value="02"><a href="javascript:">熟练</a></li>',
            '<li data-value="03"><a href="javascript:">精通</a></li>',
            '</ul></div>',
            '<em title="删除" class="hbIconMoon hbdelet">&#xe0a8;</em>',
            '<span class="prompt-msg msg" data-for="skillMsg{num}"></span>',
            '</div>'
        ].join(''),
        skillInfoPreviewTemplate = [
            '<li {skill_id}>',
            '<strong class="name">{skill_name}</strong>',
            '<strong class="cd" v="{skill_level}">{skill_level_name}</strong>',
            '</li>'
        ].join(''),
        skillInfoHid = {
            'addHid': '<input type="hidden" name="hidAddSkillID[]" value="{num}" />',
            'modHid': '<input type="hidden" name="hidModSkillID[]" value="{num}" />',
            'delHid': '<input type="hidden" name="hidDelSkillID[]" value="{num}" />'
        },
        skillNameRules = {required: true, range: [1, 20]},
        skillLevelRules = 'required',
        skillNameMsg = {
            required: '<em></em><i></i>请填写技能名称',
            range: '<em></em><i></i>1-20个字'
        },
        skillLevelMsg = '<em></em><i></i>请选择熟练程度';

    skillInforEditor._indexs = [];
    skillInforEditor._index = -1;
    skillInforEditor._normalNoData = skillInforEditor.getDom('.no-data');
    skillInforEditor._normalUL = skillInforEditor.getDom('.tag-box');
    skillInforEditor._normalLi = skillInforEditor._normalUL.find('li');
    skillInforEditor._editGroup = skillInforEditor.getDom('.skill-group');
    skillInforEditor._addBtn = skillInforEditor.getDom('.addyuyan a');
    skillInforEditor.maxSize = 10;

    skillInforEditor.on('render', function () {
        var self = this;
        if (this._normalLi.length) {
            this._normalLi.each(function (index) {
                self.addList(index);
            });
        } else {
            self.addList(0);
        }
        this.updateEditorList();
        this._tempHTML = this._editGroup.html();
    });
    skillInforEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            this._normalUL.hide();
        }
        updateRightSideList(6, e);
    }
    skillInforEditor.toggleDel = function () {
        if (this._editLi.length <= 0) {
            this._addBtn.trigger('click');
        }
    }
    skillInforEditor.addList = function (index, isRender) {
        this._index++;
        var renderObj = {zIndex: 400 - this._index};
        if (!isRender) {
            var attr = this._normalLi.eq(index).attr('data-skillid');
            if (attr != undefined) {
                renderObj['num'] = attr;
                renderObj['data-skillid'] = "data-skillid='" + attr + "'";
            } else {
                renderObj['num'] = this._index;
            }
        } else {
            renderObj['num'] = this._index;
        }
        var skillHid = $(util.string.replace(skillInfoTemplate, renderObj)).appendTo(this._editGroup);
        if (isRender) {
            skillHid.prepend(util.string.replace(skillInfoHid.addHid, {num: this._index}));
            this._indexs[index] = this._index;
            var skillName = 'txtSkillName' + this._indexs[index],
                levelName = 'hidSkillLevel' + this._indexs[index],
                level = this.selSkillLevel[index] = new select({
                    trigger: this.getDom('#selSkillLevel' + this._indexs[index]),
                    selectName: levelName,
                    className: 'dropv2_select',
                    align: {baseXY: [0, '100%-1']},
                    zIndex: 500,
                    isHidDefault: true,
                    selectCallback: {
                        isDefault: true
                    }
                }),
                self = this;

            var hidSkill = this.getElement('hidSkillName\\[\\]').eq(index),
                skillInput = this.getElement(skillName);
            this.getDom('#spanSkill' + this._index).skill({
                skillName: skillName,
                isBtn: true,
                select: function () {
                    skillInforValidator.checkElement(skillInput.focus().get(0));
                    hidSkill.val(skillInput.val());
                }, blur: function () {
                    hidSkill.val(skillInput.val());
                    var elIndex = self.getDom('.text').index(skillInput);
                    updateCombosRules(
                        self,
                        skillInforValidator, 'skillMsg' + self._indexs[elIndex],
                        skillName, levelName, skillInput.val(), level.get('selectedIndex') <= 0 ? 0 : 1,
                        skillNameRules, skillLevelRules, skillNameMsg, skillLevelMsg
                    );
                }
            });
            level.on('change', function (e) {
                var elIndex = self.getDom('.selSkillLevel').index(this.get('trigger'));
                updateCombosRules(
                    self,
                    skillInforValidator, 'skillMsg' + self._indexs[elIndex], skillName, levelName, skillInput.val(), e.index <= 0 ? 0 : 1,
                    skillNameRules, skillLevelRules, skillNameMsg, skillLevelMsg
                );
                skillInforValidator.checkElement(self.getElement(levelName)[0]);
            });
            skillInput.watermark();
        }
        this.updateEditorList();
        this.toggleDel();
        this.isAdd();
        set_resume_tips($("#skillInfor .edit_resume_tips"));
    }
    skillInforEditor.updateEditorList = function () {
        this._editLi = this._editGroup.find('.skill-rows');
    }
    skillInforEditor.updatePreview = function (e) {
        this._normalUL.empty();
        var self = this;
        this.deleteAllEditorList();
        this._editGroup.empty();
        this._index = -1;
        this._normalUL.empty();
        if (e && e.length) {
            $.each(e, function (index, val) {
                if (val.skill_id != undefined) {
                    val.skill_id = "data-skillid='" + val.skill_id + "'";
                }
                self._normalUL.append(util.string.replace(skillInfoPreviewTemplate, val));
                self._normalLi = self._normalUL.find('li');
                self.addList(index);
            });
            this.hasNormalData(true);
        } else {
            this.hasNormalData();
        }
        if (!this._editGroup.html()) {
            this.addList();
            this._normalLi = this._normalUL.find('li');
        }
        this._tempHTML = this._editGroup.html();
        this.show();
    }
    skillInforEditor.deleteEditorList = function (index) {
        this.selSkillLevel[index].destory();
        skillInforValidator.removeGroup('skillMsg' + this._indexs[index]);
        var i = index,
            len = this._editLi.length - 1;
        for (; i < len; i++) {
            this.selSkillLevel[i] = this.selSkillLevel[i + 1];
            this._indexs[i] = this._indexs[i + 1];
        }
        this.selSkillLevel.splice(len, 1);
        this._indexs.splice(len, 1);
        var editLi = this._editLi.eq(index);
        editLi.remove();
        if (editLi.attr('data-skillid') != undefined) {
            this._editGroup.prepend(util.string.replace(skillInfoHid.delHid, {num: editLi.attr('data-skillid')}));
        }
        this.updateEditorList();
        this.toggleDel();
        this.isAdd();
        set_resume_tips($("#skillInfor .edit_resume_tips"));
    }
    skillInforEditor.deleteAllEditorList = function () {
        var self = this;
        $.each(this._editLi, function (index, val) {
            var id = self._indexs[index];
            skillInforValidator.removeGroup('skillMsg' + id);
            if (self.selSkillLevel[index]) {
                self.selSkillLevel[index].destory();
                delete self.selSkillLevel[index];
            }
        });
        this.selSkillLevel = [];
        this.selSkillLevel.length = 0;
        this._indexs = [];
        this._indexs.length = 0;
        this.isModHid = {};
    }
    skillInforEditor.resetEditorList = function (f) {
        if (this._tempHTML) {
            this.deleteAllEditorList();
            this._editGroup.empty().html(this._tempHTML);
            this.updateEditorList();
        }
    }
    skillInforEditor.isModHid = {};
    skillInforEditor.addModHid = function (i) {
        if (!this.isModHid[i]) {
            this.isModHid[i] = true;
            var editLi = this._editLi.eq(i);
            if (editLi.attr('data-skillid') != undefined) {
                editLi.prepend(util.string.replace(skillInfoHid.modHid, {num: editLi.attr('data-skillid')}));
            }
        }
    }
    skillInforEditor.getID = function (dom, i) {
        return dom.attr('data-skillid') || i;
    }
    skillInforEditor.resetData = function () {
        if (this._normalLi.length === 0) {
            this._addNum = 1;
        }
        var attr, dom, levelName, skillName,
            len = this._addNum || this._normalLi.length,
            self = this,
            index;

        this.selSkillLevel = [];
        this.isAdd();

        for (var i = 0; i < len; i++) {
            if (this._addNum) {
                this._editLi.eq(i).prepend(util.string.replace(skillInfoHid.addHid, {num: i}));
                delete this._addNum;
            }
            dom = this._normalLi.eq(i);
            index = this._indexs[i] = this.getID(dom, i);
            skillName = 'txtSkillName' + index;
            levelName = 'hidSkillLevel' + index;

            var attr = dom.find('.name').text(),
                hidSkill = this.getElement('hidSkillName\\[\\]').eq(i);
            this.getElement(skillName).val(attr);
            hidSkill.val(attr);

            var level = this.selSkillLevel[i] = new select({
                trigger: this.getDom('#selSkillLevel' + this.getID(dom, i)),
                selectName: levelName,
                className: 'dropv2_select',
                align: {baseXY: [0, '100%-1']},
                zIndex: 500,
                isHidDefault: true,
                selectCallback: {
                    isDefault: true
                }
            });

            if (attr = dom.find('.cd').attr('v')) {
                level.setSelectedIndex(attr);
            } else {
                level.setSelectedIndex(0);
            }

            (function (i, index, hidSkill, skillName, level, levelName) {
                var dom = self._normalLi.eq(i),
                    editLi = self._editLi.eq(i),
                    input = self.getElement(skillName);
                input.watermark();
                updateCombosRules(
                    self,
                    skillInforValidator, 'skillMsg' + index, skillName, levelName,
                    input.val(), level.get('selectedIndex') <= 0 ? 0 : 1,
                    skillNameRules, skillLevelRules, skillNameMsg, skillLevelMsg
                );
                self.getDom('#spanSkill' + index).skill({
                    skillName: skillName,
                    isBtn: true,
                    select: function () {
                        skillInforValidator.checkElement(input.focus().get(0));
                        self.addModHid(i);
                        hidSkill.val(input.val());
                    }, blur: function () {
                        self.addModHid(i);
                        hidSkill.val(input.val());
                        updateCombosRules(
                            self,
                            skillInforValidator, 'skillMsg' + index,
                            skillName, levelName, input.val(), level.get('selectedIndex') <= 0 ? 0 : 1,
                            skillNameRules, skillLevelRules, skillNameMsg, skillLevelMsg
                        );
                    }
                });
                level.on('change', function (e) {
                    updateCombosRules(
                        self,
                        skillInforValidator, 'skillMsg' + index, skillName, levelName, input.val(), e.index <= 0 ? 0 : 1,
                        skillNameRules, skillLevelRules, skillNameMsg, skillLevelMsg
                    );
                    skillInforValidator.checkElement(self.getElement(levelName)[0]);
                    self.addModHid(i);
                });
            })(i, index, hidSkill, skillName, level, levelName);
        }
    }

    skillInforEditor.isAdd = function () {
        if (this._editLi.length - 1 >= this.maxSize - 1) {
            this._addBtn.hide();
            return false;
        }
        this._addBtn.show();
        return true;
    }
    skillInforEditor.on('init', function () {
        var self = this;
        this._addBtn.on('click', function (e) {
            var index = self._editLi.length;
            self.addList(index, true);
        });
        this.get('element').on('click', '.hbdelet', function (e) {
            var index = self.getDom('.hbdelet').index($(this));
            self.deleteEditorList(index);
        });
    });
    skillInforEditor.on('modify', function () {
        this.resetData();
    });
    skillInforEditor.on('cancel', function () {
        this.resetEditorList();
    });
    skillInforEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    skillInforEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton,
            self = this;
        skillInforValidator.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: {
                        resume_id: resume_id
                    },
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        self.updatePreview(result.items);
                        var size = $('#skillInfor .tag-box li').size();
                        if (size == 0) {
                            $('#skillAdd').css('display', 'block');
                        } else {
                            $('#skillAdd').css('display', 'none');
                        }
                        //window.location.reload();
                        window.parent.preview_resume_iframe_reload();
                    }, clearForm: false
                });
            }
        });
    };
    /*技能专长*/

    /*证书*/
    var cardInforEditor = new editResume({
            element: $('#cardInfor'),
            normalName: '.resume-item',
            validators: {
                errorElement: 'span'
            }
        }),
        cardInforValidator = cardInforEditor.getValidator(),
        cardInforTemplate = [
            '<div class="cardRows formRows mgt10" {certificate_id} style="z-index:{zIndex}">',
            '<input type="hidden" name="hidCertName[]" />',
            '<div class="clearfix">',
            '<div class="drop formText dipDrop zIndex dipIconText" id="certificate{num}" style="width:350px;margin-right:10px">',
            '<b class="hbFntWes">&#xf03a;</b>',
            '<input type="text" class="text txtCertName" name="txtCertName{num}" id="txtCertName{num}" style="width:295px;font-size:12px" value="" placeholder="请输入证书名称" />',
            '</div>',
            '<span class="formText dateText zIndex" style="z-index:{zIndex}">',
            '<b class="hbFntWes dropIco">&#xf0d7;</b>',
            '<input type="text" class="text inpCertGainTime" style="width:75px;" id="inpCertGainTime{num}Year" name="inpCertGainTime{num}Year" readonly="" value="获得时间">',
            '</span>',
            '<em title="删除" class="hbIconMoon hbdelet">&#xe0a8;</em>',
            '<span class="prompt-msg msg" data-for="certMsg{num}"></span>',
            '</div></div>'
        ].join(''),
        cardInforPreviewTemplate = [
            '<li {certificate_id}>',
            '<strong class="name">{certificate_name}</strong>',
            '<span class="cd" v="{gain_time}">{gain_time}年获得</span>',
            '</li>'
        ].join(''),
        cardInforHid = {
            'addHid': '<input type="hidden" name="hidAddCertificateID[]" value="{num}" />',
            'modHid': '<input type="hidden" name="hidModCertificateID[]" value="{num}" />',
            'delHid': '<input type="hidden" name="hidDelCertificateID[]" value="{num}" />'
        },
        txtCertNameRules = {required: true, range: [2, 20]},
        timeYearRules = 'required number',
        txtCertNameMsg = {
            required: '<em></em><i></i>请填写证书名称',
            range: '<em></em><i></i>2-20个字'
        },
        timeYearMsg = '<em></em><i></i>请填写获得时间年份';

    cardInforEditor._indexs = [];
    cardInforEditor._index = -1;
    cardInforEditor._normalNoData = cardInforEditor.getDom('.no-data');
    cardInforEditor._normalUL = cardInforEditor.getDom('.tag-box');
    cardInforEditor._normalLi = cardInforEditor._normalUL.find('li');
    cardInforEditor._editGroup = cardInforEditor.getDom('.cardGroup');
    cardInforEditor._addBtn = cardInforEditor.getDom('.addyuyan a');
    cardInforEditor.maxSize = 10;

    cardInforEditor.on('render', function () {
        var self = this;
        if (this._normalLi.length) {
            this._normalLi.each(function (index) {
                self.addList(index);
            });
        } else {
            this.addList(0);
        }
        this.updateEditorList();
        this._tempHTML = this._editGroup.html();
    });
    cardInforEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            this._normalUL.hide();
        }
        updateRightSideList(8, e);
    }
    cardInforEditor.toggleDel = function () {
        if (this._editLi.length <= 0) {
            this._addBtn.trigger('click');
        }
    }
    cardInforEditor.addList = function (index, isRender) {
        this._index++;
        var renderObj = {zIndex: 200 - this._index};
        if (!isRender) {
            var attr = this._normalLi.eq(index).attr('data-certificateid');
            if (attr != undefined) {
                renderObj['num'] = attr;
                renderObj['certificate_id'] = "data-certificateid='" + attr + "'";
            } else {
                renderObj['num'] = this._index;
            }
        } else {
            renderObj['num'] = this._index;
        }
        var cardHid = $(util.string.replace(cardInforTemplate, renderObj)).appendTo(this._editGroup);
        if (isRender) {
            cardHid.prepend(util.string.replace(cardInforHid.addHid, {num: this._index}));
            this._indexs[index] = this._index;
            var certName = 'txtCertName' + this._indexs[index],
                timeYearName = 'inpCertGainTime' + this._indexs[index] + 'Year',
                self = this,
                hidCert = this.getElement('hidCertName\\[\\]').eq(index),
                cerInput = this.getElement(certName),
                timeInput = this.getElement(timeYearName);

            cerInput.watermark();
            self.getDom('#certificate' + this._indexs[index]).certificate({
                cerName: certName,
                isBtn: true,
                select: function () {
                    cardInforValidator.checkElement(cerInput[0]);
                    hidCert.val(cerInput.val());
                },
                blur: function () {
                    hidCert.val(cerInput.val());
                    var elIndex = self.getDom('.txtCertName').index(cerInput);
                    updateCombosRules(
                        self,
                        cardInforValidator, 'certMsg' + self._indexs[elIndex], certName, timeYearName, cerInput.val(),
                        timeInput.val() === "获得时间" ? '' : timeInput.val(),
                        txtCertNameRules, timeYearRules, txtCertNameMsg, timeYearMsg,
                        false, true
                    );
                }
            });
            jobDater.bind({
                id: "CertGainTime" + this._indexs[index],
                dateEntry: [0, 1],
                size: 20,
                min: -55,
                //max: 2,
                onSelect: updateCertGainTime,
                noSelect: updateCertGainTime
            });
        }
        this.updateEditorList();
        this.toggleDel();
        this.isAdd();

        function updateCertGainTime(e) {
            var elIndex = self.getDom('.inpCertGainTime').index(timeInput);
            updateCombosRules(
                self,
                cardInforValidator, 'certMsg' + self._indexs[elIndex], certName, timeYearName, cerInput.val(),
                e.target.val() === "获得时间" ? '' : e.target.val(),
                txtCertNameRules, timeYearRules, txtCertNameMsg, timeYearMsg,
                false, true
            );
            cardInforValidator.checkElement(e.target[0]);
        }
        set_resume_tips($("#cardInfor .edit_resume_tips"));
    }
    cardInforEditor.updateEditorList = function () {
        this._editLi = this._editGroup.find('.cardRows');
    }
    cardInforEditor.updatePreview = function (e) {
        this._normalUL.empty();
        var self = this;
        this.deleteAllEditorList();
        this._editGroup.empty();
        this._index = -1;
        this._normalUL.empty();
        if (e && e.length) {
            $.each(e, function (index, val) {
                if (val.certificate_id != undefined) {
                    val.certificate_id = "data-certificateid='" + val.certificate_id + "'";
                }
                self._normalUL.append(util.string.replace(cardInforPreviewTemplate, val));
                self._normalLi = self._normalUL.find('li');
                self.addList(index);
            });
            this.hasNormalData(true);
        } else {
            this.hasNormalData();
        }
        if (!this._editGroup.html()) {
            this.addList();
            this._normalLi = this._normalUL.find('li');
        }
        this._tempHTML = this._editGroup.html();
        this.show();
    }
    cardInforEditor.deleteEditorList = function (index) {
        var editLi = this._editLi.eq(index);
        cardInforValidator.removeGroup('certMsg' + this._indexs[index]);
        var i = index,
            len = this._editLi.length - 1;
        for (; i < len; i++) {
            this._indexs[i] = this._indexs[i + 1];
        }
        this._indexs.splice(len, 1);
        editLi.remove();
        if (editLi.attr('data-certificateid') != undefined) {
            this._editGroup.prepend(util.string.replace(cardInforHid.delHid, {num: editLi.attr('data-certificateid')}));
        }
        this.updateEditorList();
        this.toggleDel();
        this.isAdd();
        set_resume_tips($("#cardInfor .edit_resume_tips"));
    }
    cardInforEditor.deleteAllEditorList = function () {
        var self = this;
        $.each(this._editLi, function (index, val) {
            var id = self._indexs[index];
            cardInforValidator.removeGroup('certMsg' + id);
        });
        this._indexs = [];
        this._indexs.length = 0;
        this.isModHid = {};
    }
    cardInforEditor.resetEditorList = function () {
        if (this._tempHTML) {
            var self = this;
            this.deleteAllEditorList();
            this._editGroup.empty().html(this._tempHTML);
            this.updateEditorList();
        }
    }
    cardInforEditor.isModHid = {};
    cardInforEditor.addModHid = function (i) {
        if (!this.isModHid[i]) {
            this.isModHid[i] = true;
            var editLi = this._editLi.eq(i);
            if (editLi.attr('data-certificateid') != undefined) {
                editLi.prepend(util.string.replace(cardInforHid.modHid, {num: editLi.attr('data-certificateid')}));
            }
        }
    }
    cardInforEditor.getID = function (dom, i) {
        return dom.attr('data-certificateid') || i;
    }
    cardInforEditor.resetData = function () {
        if (this._normalLi.length === 0) {
            this._addNum = 1;
        }
        var attr, dom, certName, timeYearName,
            len = this._addNum || this._normalLi.length,
            rules = {},
            errs = {},
            groups = {},
            i = 0,
            self = this;
        this.isAdd();
        for (; i < len; i++) {
            if (this._addNum) {
                this._editLi.eq(i).prepend(util.string.replace(cardInforHid.addHid, {num: i}));
                delete this._addNum;
            }
            dom = this._normalLi.eq(i);
            this._indexs[i] = this.getID(dom, i);
            certName = 'txtCertName' + this.getID(dom, i);
            timeYearName = 'inpCertGainTime' + this.getID(dom, i) + 'Year';
            var hidCert = this.getElement('hidCertName\\[\\]').eq(i);

            (function (hidCert, i) {
                var index = self.getID(dom, i);
                var certName = 'txtCertName' + index,
                    timeYearName = 'inpCertGainTime' + index + 'Year',
                    certInput = self.getElement(certName),
                    timeInput = self.getElement(timeYearName),
                    attr;

                if (attr = dom.find('.cd').attr('v')) {
                    attr = new Date(attr + '/1/1');
                    timeInput.val(attr.getFullYear());
                } else {
                    timeInput.val('获得时间');
                }
                attr = dom.find('.name').text();
                certInput.val(attr).watermark();
                hidCert.val(attr);

                updateCombosRules(
                    self,
                    cardInforValidator, 'certMsg' + index, certName, timeYearName, certInput.val(),
                    timeInput.val() === "获得时间" ? '' : timeInput.val(),
                    txtCertNameRules, timeYearRules, txtCertNameMsg, timeYearMsg,
                    false, true
                );

                self.getDom('#certificate' + index).certificate({
                    cerName: certName,
                    isBtn: true,
                    select: function () {
                        cardInforValidator.checkElement(certInput[0]);
                        self.addModHid(i);
                        hidCert.val(certInput.val());
                    }, blur: function () {
                        updateCombosRules(
                            self,
                            cardInforValidator, 'certMsg' + index, certName, timeYearName, certInput.val(),
                            timeInput.val() === "获得时间" ? '' : timeInput.val(),
                            txtCertNameRules, timeYearRules, txtCertNameMsg, timeYearMsg,
                            false, true
                        );
                        self.addModHid(i);
                        hidCert.val(certInput.val());
                    }
                });
                jobDater.bind({
                    id: "CertGainTime" + index,
                    dateEntry: [0, 1],
                    size: 20,
                    min: -55,
                    //max: 2,
                    onSelect: updateCertGainTime,
                    noSelect: updateCertGainTime
                });

                function updateCertGainTime(e) {
                    updateCombosRules(
                        self,
                        cardInforValidator, 'certMsg' + index, certName, timeYearName, certInput.val(),
                        e.target.val() === "获得时间" ? '' : e.target.val(),
                        txtCertNameRules, timeYearRules, txtCertNameMsg, timeYearMsg,
                        false, true
                    );

                    cardInforValidator.checkElement(e.target[0]);
                    self.addModHid(i);
                }


            })(hidCert, i);
        }
    }

    function updateCombosRules(editsObj, validObj, groupName, name1, name2, value1, value2, rules1, rules2, msg1, msg2, f1, f2) {
        if (value1 || value2) {
            var rules = {},
                errs = {},
                groups = {};
            rules[name1] = rules1;
            rules[name2] = rules2;
            errs[name1] = msg1;
            errs[name2] = msg2;
            groups[groupName] = name1 + ' ' + name2;
            validObj.addRules(rules);
            validObj.addErrorMessages(errs);
            validObj.addGroup(groups);
        } else if (!value1 && !value2) {
            validObj.resetElement(editsObj.getElement(name1), f1);
            validObj.resetElement(editsObj.getElement(name2), f2);
            validObj.removeGroup(groupName);
        }
    }

    cardInforEditor.isAdd = function () {
        if (this._editLi.length - 1 >= this.maxSize - 1) {
            this._addBtn.hide();
            return false;
        }
        this._addBtn.show();
        return true;
    }
    cardInforEditor.on('init', function () {
        var self = this;
        this._addBtn.on('click', function (e) {
            var index = self._editLi.length;
            self.addList(index, true);
        });
        this.get('element').on('click', '.hbdelet', function (e) {
            var index = self.getDom('.hbdelet').index($(this));
            self.deleteEditorList(index);
        });
    });
    cardInforEditor.on('modify', function () {
        this.resetData();
    });
    cardInforEditor.on('cancel', function () {
        this.resetEditorList();
    });
    cardInforEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    cardInforEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton,
            self = this;
        cardInforValidator.submit({
            callback: function (valid) {
                self.resultStatus = valid;
                btn.submitForm({
                    beforeSubmit: valid,
                    data: {
                        resume_id: resume_id
                    },
                    success: function (result) {
                        if (result && result.error) {
                            self.resultStatus = false;
                            confirmBox.alert(result.error, null, {title: '保存失败'});
                            return;
                        }
                        updateResumeTime(result.update_time);
                        updateCompPercent(result.complete_percent);
                        cardInforEditor.updatePreview(result.items);
                        var size = $('#cardInfor .tag-box li').size();
                        if (size == 0) {
                            $('#cerAdd').css('display', 'block');
                        } else {
                            $('#cerAdd').css('display', 'none');
                        }
                        //window.location.reload();
                        window.parent.preview_resume_iframe_reload();
                    }, clearForm: false
                });
            }
        });
    };
    /*证书*/

    /*其他信息*/
    var otherInfoRules = {
            hidAppendType: 'required',
            taTopicContent: {
                required: true, range: [10, 300]
            }
        },
        otherInfoErrorMsg = {
            hidAppendType: '<em></em><i></i>请选择主题类型',
            taTopicContent: {
                required: '<em></em><i></i>请填写内容描述',
                range: '<em></em><i></i>10-300个字'
            }
        },
        txtTopicDescRules = {
            required: true, range: [2, 6]
        },
        txtTopicDescMsg = {
            required: '<em></em><i></i>请填写自定义主题',
            range: '<em></em><i></i>2-6个字'
        },
        otherInfoGroups = {
            topicDesc: 'hidAppendType txtTopicDesc'
        }

    var otherInfoEditor = new editMutilResume({
            element: $('#otherInfor'),
            normalName: '.otherRows',
            validators: {
                rules: otherInfoRules,
                errorMessages: otherInfoErrorMsg,
                errorElement: '',
                groups: otherInfoGroups,
                keepKey: true,
                isCache: false
            }
        }),
        otherInfoValidator = otherInfoEditor.getValidator(),
        selAppendContent;

    otherInfoEditor._normalUL = otherInfoEditor.getDom('.other-box');
    otherInfoEditor._normalNoData = otherInfoEditor.getDom('.no-data');
    otherInfoEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normalUL.show();
        } else {
            this._normalNoData.show();
            if (!this._edit.closest('.other-box').length) {
                this._normalUL.hide();
            }
        }
        updateRightSideList(11, e);
        console.log();
    }
    otherInfoEditor.toggleNoData = function (e) {
        if (e) {
            this._normalNoData.hide();
        } else {
            this._normalNoData.show();
        }
    }
    otherInfoEditor.clearData = function () {
        this.resetForm(true);
        this.getDom('#divTopicDesc').hide();
        this.getElement('txtTopicDesc').resetWatermark();
        selAppendContent && selAppendContent.setSelectedIndex(0, true);
    }
    var otherTemplate = [
        '<div class="clearfix otherRows editPanel" data-appendid="{data-appendid}">',
        '<strong class="time">{appendContent}</strong>',
        '<div class="infor"><div class="topicContent" data-content="{topicContent2}">{topicContent}</div></div>',
        '<span class="oper"><a href="javascript:delDo(\'otherDel\');" title="编辑" class="edt"><i class="wh-editIcon"></i>编辑</a></span>',
        '</div>',
    ].join('');
    otherInfoEditor.updatePreview = function (e) {
        var index = this.getIndex(),
            dataObj = {
                'topicContent': this.getElement('taTopicContent').val().replace(/\n/g, "<br/>"),
                'topicContent2': this.getElement('taTopicContent').val(),
                'data-appendid': e.append_id
            };

        if (selAppendContent.get('selectedIndex') >= 5) {
            dataObj['appendContent'] = this.getElement('txtTopicDesc').val();
        } else {
            dataObj['appendContent'] = selAppendContent.get('label');
        }
        var preview;
        if (!this._isAdd) {
            var first = this._normal.eq(0);
            preview = this._normal.eq(index);
            preview.find('.topicContent').html(dataObj['topicContent']).attr("data-content", dataObj['topicContent2']);
            var txtTitle = preview.find('.time');
            if (dataObj['appendContent'] === '自我评价' && txtTitle.text() !== dataObj['appendContent']) {
                first.before(preview);
                this.update();
            }
            txtTitle.text(dataObj['appendContent']);
            this.show();
        } else {
            preview = this._normal.eq(0);
            var html = util.string.replace(otherTemplate, dataObj);
            if (preview.find('.time').text() === "自我评价") {
                preview.after(html);
            } else {
                this.getDom('.other-box').prepend(html);
            }
            this.update();
            this.show();
            delete this._isAdd;
            this.hasNormalData(this._normal.length);
        }
    }
    otherInfoEditor.resetData = function () {
        var index = this.getIndex(), preview;
        if ((preview = this._normal.eq(index)).length) {
            var otherName = preview.find('.time'),
                txtTopicDesc = this.getElement('txtTopicDesc'),
                divTopicDesc = this.getDom('#divTopicDesc');
            attr = otherName.text();

            if (selAppendContent.setSelectedValue(attr) === -1) {
                selAppendContent.setSelectedIndex(5, true);
                otherInfoValidator.addRules('txtTopicDesc', txtTopicDescRules);
                otherInfoValidator.addErrorMessages('txtTopicDesc', txtTopicDescMsg);
                divTopicDesc.show();
            } else {
                divTopicDesc.hide();
            }
            txtTopicDesc.val(attr).resetWatermark();
            attr = preview.find('.topicContent').text();
            this.getElement('taTopicContent').val(preview.find('.topicContent').attr("data-content"));
        }
    }
    otherInfoEditor.on('init', function () {
        var self = this;
        otherInfoValidator.addDomCache(true);
        selAppendContent = new select({
            trigger: this.getDom('#selAppendContent'),
            className: 'dropv2_select',
            align: {baseXY: [0, '100%-1']},
            selectName: 'hidAppendType',
            dataSource: appendItems,
            selectedIndex: 0,
            isHidDefault: true,
            selectCallback: {
                isDefault: true
            }
        });
        if (selAppendContent.get('selectedIndex') === 7) {
            otherInfoValidator.addRules('txtTopicDesc', txtTopicDescRules);
            otherInfoValidator.addErrorMessages('txtTopicDesc', txtTopicDescMsg);
        }
        selAppendContent.on('change', function (e) {
            var txtTopicDesc = self.getElement('txtTopicDesc'),
                divTopicDesc = self.getDom('#divTopicDesc');
            if (e.index === 5) {
                otherInfoValidator.resetElement(txtTopicDesc);
                divTopicDesc.show();
                txtTopicDesc.val('');
                otherInfoValidator.addRules('txtTopicDesc', txtTopicDescRules);
                otherInfoValidator.addErrorMessages('txtTopicDesc', txtTopicDescMsg);
            } else {
                divTopicDesc.hide();
                txtTopicDesc.val(selAppendContent.get('label'));
                otherInfoValidator.removeRules('txtTopicDesc');
            }
            txtTopicDesc.resetWatermark();
            otherInfoValidator.checkElement(self.getElement('hidAppendType')[0]);
        });
    });
    otherInfoEditor.on('add', function () {
        this.toggleNoData(true);
        this.clearData();
    });
    otherInfoEditor.on('modify', function () {
        this.toggleNoData(true);
        this.resetForm();
        this.resetData();
    });
    otherInfoEditor.on('cancel', function () {
        this.toggleNoData(this._normal.length);
    });
    otherInfoEditor.on('delete', function (e) {
        var index = this.getIndex(),
            preview = this._normal.eq(index),
            data = {
                'operate': 'DeleteAppend',
                'resume_id': resume_id,
                'append_id': preview.attr('data-appendid')
            },
            self = this;

        confirmBox.confirm('确定删除该附加信息吗？', null, function () {
            var that = this;
            $.post('/hbResume/DelDo/', data, function (json) {
                that.hide();
                if (json.error) {
                    confirmBox.alert(json.error, null, {title: '保存失败'});
                    return;
                }
                self.deleteList(index);
                self.hasNormalData(self._normal.length);
                updateCompPercent(json.complete_percent);
                var size = $('#otherInfor .otherRows').size();
                if (size == 0) {
                    $('#othAdd').css('display', 'block');
                } else {
                    $('#othAdd').css('display', 'none');
                }
                window.parent.preview_resume_iframe_reload();
            }, 'json');
        });
    });
    otherInfoEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    otherInfoEditor.saveSubmit = function (e) {
        var btn = e ? $(e.currentTarget) : this._submitButton;
        var result = otherInfoValidator.checkForm(),
            self = this;
        self.resultStatus = result;
        if (!result) return;
        var data = {resume_id: resume_id},
            index = this.getIndex();
        if (index != undefined) {
            data['hidModAppendID'] = this._normal.eq(index).attr('data-appendid');
        }
        btn.submitForm({
            beforeSubmit: result,
            data: data,
            success: function (result) {
                if (result && result.error) {
                    self.resultStatus = false;
                    confirmBox.alert(result.error, null, {title: '保存失败'});
                    return;
                }
                updateResumeTime(result.update_time);
                updateCompPercent(result.complete_percent);
                self.updatePreview(result);
                if (e.otherEvent) {
                    self._normal.eq(0).before(self._edit.show());
                    delete self._oldIndex;
                    self._isAdd = true;
                    self.clearData();
                }
                var size = $('#otherInfor .otherRows').size();
                if (size == 0) {
                    $('#othAdd').css('display', 'block');
                } else {
                    $('#othAdd').css('display', 'none');
                }
                //$('#othAdd').css('display','none');
                window.parent.preview_resume_iframe_reload(e.otherEvent ? false : true);
            }, clearForm: false
        });
    };
    /*其他信息*/

    /*作品上传*/
    var opusInforRules = {
            txtAchievementName: {
                required: true,
                range: [2, 30]
            },
            taAchievementDescription: {max: 200}
        },
        opusInforMsg = {
            txtAchievementName: {
                required: '<em></em><i></i>请填写作品名称',
                range: '<em></em><i></i>2-30个字'
            },
            taAchievementDescription: '<em></em><i></i>不超过200个字'

        };
    var opusInforEditor = new editMutilResume({
            element: $('#opusInfor'),
            normalName: '.my-case',
            isAll: true,
            isFirst: true,
            validators: {
                rules: opusInforRules,
                errorMessages: opusInforMsg,
                errorElement: '',
                keepKey: true,
                isCache: false
            }
        }),
        opusInforValidators = opusInforEditor.getValidator(),
        opusInforTemplate = [
            '<li data-achievementid="{num}" data-des="{data-des}" data-name="{data-name}">',
            '<p class="img">',
            '<a href="javascript:">{data-img}</a>',
            '<a href="javascript:" class="name">{data-name}</a></p>',
            '<p class="operCase">',
            '<a class="edt" href="javascript:"><i></i>编辑</a>',
            '<a class="del achDel" href="javascript:"><i></i>删除</a></p>',
            '<div class="imgGroup" style="display:none">{imgList}</div>',
            '</li>'
        ].join(''),
        opusInforImgList = [
            '<a href="{attsrc}" real_heaf="{attrealsrc}" extension="{ext}" onclick="return false;" style="display:none" data-fancybox-group="thumb" class="fancybox-thumbs{achid}"></a><span v="{attid}">{fileName}</span>'
        ].join(''),
        opusInforUploadTemplate = [
            '<li attid="{attid}" class="liAtt">',
            '<i class="hbIconMoon workIco">&#xe00d;</i>',
            '<p class="workInp">',
            '<input name="{attrName}" class="workTxt attName" type="text" value="{fileName}" />',
            '<input name="attOrigName" type="hidden" value="{fileName}"  /> ' +
            '</p>' +
            '<a href="javascript:" class="hbFntWes delBtn">&#xf014;</a>' +
            '</li>'
        ].join('');

    var maxFileCount = 5,
        queueLenth = 0;

    opusInforEditor._normalNoData = opusInforEditor.getDom('.no-data');
    opusInforEditor.hasNormalData = function (e) {
        if (e) {
            this._normalNoData.hide();
            this._normal.show();
        } else {
            this._normalNoData.show();
            this._normal.hide();
        }
        updateRightSideList(9, e);
    }
    opusInforEditor.toggleNoData = function (e) {
        if (e) {
            this._normalNoData.hide();
        } else {
            this._normalNoData.show();
        }
    }

    /*
     var uploadifyConfig = {
     swf:'/swf/uploadify.swf',
     uploader : '/resume/SaveAttach/',
     queueID:'showAchi',
     fileObjName:'AttachFile',
     fileTypeExts:'*.jpg;*.bmp;*.gif;*.jpeg;*.png;*.doc;*.docx;*.txt;*.ppt;*.pptx;*.xls;*.xlsx;*.pdf',
     itemTemplate:'<li id="${fileID}" attID="" class="liAtt">'+
     '<i class="hbIconMoon workIco">&#xe00d;</i>'+
     '<p class="workInp">'+
     '	<input name="attName[]" class="workTxt attName" type="text" value="${fileName}" />'+
     '   <input name="attOrigName" type="hidden" value="${fileName}"  /> '+
     '</p>'+
     '<a href="javascript:" class="isAdd hbFntWes delBtn">&#xf014;</a>'+
     '</li>',
     formData: {
     'upload_cookie_userid': upload_cookie_userid,
     'upload_cookie_nickname':upload_cookie_nickname,
     'upload_cookie_usertype':upload_cookie_usertype,
     'upload_cookie_userkey':upload_cookie_userkey
     },
     auto: false,
     buttonImage: styleUrl+'/uploadify/submit.png',
     fileSizeLimit:'2MB',
     fileTypeDesc:'All Files',
     method:'post',
     cancelImage: styleUrl+'/uploadify/cancel.png',
     width:85,
     height:27,
     multi: true,
     onSelect:function(file){
     queueLenth++;
     if(queueLenth <= maxFileCount){
     return true;
     } else {
     opusInforEditor.getDom('#achiFile').uploadify('cancel', file.id);
     var msg = '上传的文件数量不能超过' +　maxFileCount + '个';
     confirmBox.timeBomb(msg, {
     name: 'fail',
     width: pWidth + msg.length * fontWidth
     });
     return false;
     }
     },
     onCancel:function(){
     queueLenth--;
     },
     onQueueComplete:function(){
     if(errorCount == 0){
     opusInforEditor.submitForm(opusInforValidators.checkForm());
     } else {
     var msg = '存在上传失败的文件，请删除后重新上传！';
     confirmBox.timeBomb(msg, {
     name: 'fail',
     width: pWidth + msg.length * fontWidth
     });
     errorCount = 0;
     opusInforEditor.resultStatus = false;
     }
     },
     onUploadSuccess:function(file, data, response){
     var json = util.json(data);
     if(json.error){
     if(opusInforEditor.getDom('#errorFor' + file.id).length > 0){
     opusInforEditor.getDom('#errorFor' + file.id).text(json.errorMsg);
     opusInforEditor.getDom('#errorFor' + file.id).show();
     } else {
     opusInforEditor.getDom('<span id="errorFor' + file.id + '" class="tipPos errorFile">' + json.errorMsg + '</span>').appendTo(opusInforEditor.getDom('#' + file.id));
     }
     errorCount = errorCount + 1;
     } else {
     var fileName = opusInforEditor.getDom('#' + file.id).find('.attName').val();
     $('<input type="hidden" name="addAtt[]" value="' + fileName + '|' + json.type + '|' + json.path + '" />').appendTo(opusInforEditor.getDom('#spnAddAtts'));
     }
     },
     onSelectError:function(file, errorCode, errorMsg){
     var settings = this.settings, msg;

     switch(errorCode) {
     case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
     msg = "一次最多上传" + settings.queueSizeLimit + "张照片！";
     break;
     case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
     msg = '抱歉 "' + file.name + '" 文件查过了大小限制 (' + settings.fileSizeLimit + ').';
     break;
     case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
     msg = '文件 "' + file.name + '" 为空.';
     break;
     case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
     msg = '文件 "' + file.name + '" 类型不支持 (' + settings.fileTypeDesc + ').';
     break;
     }
     confirmBox.timeBomb(msg, {
     name: 'warning',
     width: pWidth + msg.length * fontWidth
     });
     opusInforEditor.resultStatus = false;
     }
     };

     opusInforEditor.getDom('#achiFile').uploadify(uploadifyConfig);
     */

    opusInforEditor.getDom('.my-case').on('click', '.img a', function (e) {
        var item = $(e.currentTarget),
            attrid = $(item).closest('li').attr('data-achievementid');
        $('.fancybox-thumbs' + attrid).eq(0).trigger('click');
    });

    $.each(fancboxid, function (index, val) {
        $('.fancybox-thumbs' + val).fancybox({
            closeBtn: true,
            arrows: true,
            title: function (current) {
                if ($(this).attr('extension') == 'jpg' || $(this).attr('extension') == 'bmp' || $(this).attr('extension') == 'gif' || $(this).attr('extension') == 'jpeg' || $(this).attr('extension') == 'png') {
                    return "<a href='" + $(this).attr('href') + "' target='_blank'>查看原图</a>";
                }
                else {
                    return "<a href='" + $(this).attr('real_heaf') + "' target='_blank'>下载文件</a>";
                }
            },
            maxWidth: 1000,
            maxHeight: 600,
            helpers: {
                title: {
                    type: 'float'
                }
            }
        });
    });

    var fileUploader = new FileUploader({
        trigger: opusInforEditor.getDom('#selectImage'),
        fileName: 'AttachFile',
        uploadURL: '/hbResume/SaveAttach/',
        //imageURL: 'http://192.168.255.5:85/',
        fileExt: '.jpg,.bmp,.gif,.jpeg,.png,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.pdf,.txt'
    });

    opusInforEditor.clearData = function () {

        queueLenth = 0;
        fileUploader.setCancel()

        this.resetForm(true);
        this.getDom('#showAchi').empty();
        this.getDom('#spnAddAtts').empty();
        this.getDom('#spnDelAtts').empty();
        this.getElement('hidModAchievementID').val('');
    }
    opusInforEditor.resetData = function () {

        var index = this.getIndex(), preview;

        queueLenth = 0;
        fileUploader.setCancel();

        this.getDom('#spnAddAtts').empty();
        this.getDom('#spnDelAtts').empty();

        if ((preview = this._normal.children('li').eq(index)).length) {
            var attr = preview.attr('data-name'),
                self = this,
                html = "";

            if (preview.attr('data-achievementid') != undefined) {
                this.getElement('hidModAchievementID').val(preview.attr('data-achievementid'));
            } else {
                this.getElement('hidModAchievementID').val('');
            }
            this.getElement('txtAchievementName').val(attr);
            attr = preview.attr('data-des');
            this.getElement('taAchievementDescription').val(attr);
            preview.find('.imgGroup span').each(function (j) {
                var attIDTemp = $(this).attr('v'),
                    attNameTemp = $(this).text();
                html += util.string.replace(opusInforUploadTemplate, {
                    'attid': attIDTemp,
                    'fileName': attNameTemp,
                    'attrName': 'attName' + attIDTemp
                });
                queueLenth++;
            });
            self.getDom('#showAchi').html(html);
        }
    }
    function getOpusImg(ext) {
        if (!(/jpg|jpeg|png|gif/.test(ext))) {
            if (ext === "xlsx") {
                ext = "xls";
            }
            else if (ext === "docx") {
                ext = "doc";
            }
            else if (ext === "pptx") {
                ext = "ppt";
            }
            return styleUrl + '/img/v2/resumeM/' + ext + '.jpg';
        }
        return null;
    }

    opusInforEditor.updatePreview = function (e) {
        var dataObj = {
                'data-name': this.getElement('txtAchievementName').val(),
                'data-des': this.getElement('taAchievementDescription').val()
            },
            index = this.getIndex(),
            preview = this._normalItem.eq(index);

        var fancyboxTempId = [];

        if (e.atts && e.atts.length) {
            var html = '',
                isFirst = true;

            dataObj['num'] = e.achievement_id;
            $.each(e.atts, function (index, val) {

                if (isFirst) {
                    var path = getOpusImg(val.attachment_extension),
                        imgClass = '';
                    if (path) {
                        imgClass = 'class="defimg"';
                    } else {
                        path = val.achievement_thumb_path;
                    }
                    dataObj['data-img'] = '<img ' + imgClass + ' src="' + path + '" alt="" />';
                    isFirst = false;
                }

                html += util.string.replace(opusInforImgList, {
                    'attrealsrc': val.achievement_path,
                    'ext': val.attachment_extension,
                    'attsrc': val.achievement_img_path,
                    'attid': val.attachment_id,
                    'achid': val.achievement_id,
                    'fileName': val.attachment_name
                });

            });
            dataObj.imgList = html;
        }
        if (!this._isAdd) {
            preview.attr({
                'data-name': dataObj['data-name'],
                'data-des': dataObj['data-des']
            });
            preview.find('.name').text(dataObj['data-name']);
            var img = preview.find('.img img').eq(0);
            img.parent().html(dataObj['data-img']);
            dataObj.imgList && preview.find('.imgGroup').html(dataObj.imgList);
            this.show();
        } else {
            this.getDom('.my-case').prepend(util.string.replace(opusInforTemplate, dataObj));
            this.update();
            this.show();
            delete this._isAdd;
            this.hasNormalData(this._normalItem.length);
        }

        $('.fancybox-thumbs' + e.achievement_id).fancybox({
            closeBtn: true,
            arrows: true,
            title: function (current) {
                if ($(this).attr('extension') == 'jpg' || $(this).attr('extension') == 'bmp' || $(this).attr('extension') == 'gif' || $(this).attr('extension') == 'jpeg' || $(this).attr('extension') == 'png') {
                    return "<a href='" + $(this).attr('href') + "' target='_blank'>查看原图</a>";
                } else {
                    return "<a href='" + $(this).attr('real_heaf') + "' target='_blank'>下载文件</a>";
                }
            },
            maxWidth: 1000,
            maxHeight: 600,
            helpers: {
                title: {
                    type: 'float'
                }
            }
        });

        this.show();
        this.getDom('#showAchi').empty();
        this.getDom('#spnAddAtts').empty();
        this.getDom('#spnDelAtts').empty();
    }
    opusInforEditor.on('init', function () {
        var self = this;
        opusInforValidators.addDomCache(true);

        var fileListItem = [
            '<li id="{num}" attid="" class="liAtt">',
            '<i class="hbIconMoon workIco">&#xe00d;</i>',
            '<p class="workInp">',
            '<input name="attName[]" class="workTxt attName" type="text" value="{fileName}" />',
            '<input name="attOrigName" type="hidden" value="{fileName}"  />',
            '</p>',
            '<a href="javascript:" class="isAdd hbFntWes delBtn">&#xf014;</a>',
            '</li>'
        ].join('');
        var fileListResult = '<input type="hidden" tempId="{num}" name="addAtt[]" value="{resultName}" />';
        var fileValue;
        fileUploader.isLoading = false;
        fileUploader.on('select', function (e) {
            if (queueLenth >= maxFileCount) {
                var msg = '上传的文件数量不能超过' + maxFileCount + '个';
                confirmBox.timeBomb(msg, {
                    name: 'fail',
                    width: pWidth + msg.length * fontWidth
                });
                this.setCancel(true);
                return;
            }
            queueLenth++;
            fileUploader.isLoading = true;
        });
        fileUploader.on('startUpload', function (e) {
            fileValue = e.url.indexOf('\\') < 0 ? e.url : e.url.substring(e.url.lastIndexOf('\\') + 1);
            fileValue = fileValue.substring(0, fileValue.lastIndexOf('.'));
        });
        fileUploader.on('progresed', function (e) {

            if (queueLenth > maxFileCount) {
                return;
            }

            var id = e.progressID.substring(e.progressID.lastIndexOf('-') + 1);
            opusInforEditor.getDom('#showAchi').append(util.string.replace(fileListItem, {
                fileName: fileValue,
                num: id
            }));

            opusInforEditor.getDom('#spnAddAtts').append(util.string.replace(fileListResult, {
                num: id,
                resultName: fileValue + '|' + e.data.type + '|' + e.data.path
            }));

            fileUploader.isLoading = false;
            opusInforEditor.resultStatus = false;
        });
        fileUploader.on('progressError', function (e) {

            if (e.errorMsg) {
                confirmBox.timeBomb(e.errorMsg, {
                    name: 'fail',
                    width: pWidth + e.errorMsg.length * fontWidth
                });
            }

            queueLenth--;
            fileUploader.isLoading = false;
            opusInforEditor.resultStatus = false;
        });

        this.getDom('#showAchi').on('mouseover', '.attName', function (e) {
            $(e.currentTarget).addClass('workTxtHov');
        }).on('mouseout', '.attName', function (e) {
            $(e.currentTarget).removeClass('workTxtHov');
        }).on('focusin', '.attName', function (e) {
            $(e.currentTarget).addClass('workTxtFocus');
        }).on('focusout', '.attName', function (e) {
            var target = $(e.currentTarget);
            var parent = target.closest('li'),
                attID = $(parent).attr('attID');
            if (attID != '' && attID != null) {
                var origin = parent.find('input[name=attOrigName]').eq(0),
                    originName = $(origin).val(),
                    nowName = target.val();

                if (nowName != originName) {
                    $(origin).val(nowName);
                    var hddName = $(parent).find('.reName');
                    if (hddName.length <= 0) {
                        hddName = $('<input type="hidden" name="reName[]" class="reName" />').appendTo($(parent));
                    }
                    hddName.val(attID + '|' + nowName);
                }
            } else {
                parent.find('input[name=addAtt[]]')
            }
            target.removeClass('workTxtFocus');
        }).on('click', '.delBtn', function (e) {
            var parent = $(e.currentTarget).closest('li'),
                attID = parent.attr('attID'),
                id = parent.attr('id'),
                tempID = opusInforEditor.getDom('#spnAddAtts').find('input[tempID="' + id + '"]');

            queueLenth--;
            fileUploader.setCancel();

            /*
             if($(this).hasClass('isAdd')){
             self.getDom('#achiFile').uploadify('cancel', id);
             }
             */

            if (attID != '' && attID != null) {
                //queueLength--;
                $('<input type="hidden" name="delAtt[]" value="' + attID + '" />').appendTo($('#spnDelAtts'));
            } else if (tempID.length) {
                tempID.remove();
            }

            parent.remove();
            //window.location.href = reload_url;
        });
    });
    opusInforEditor.on('delete', function (e) {
        var data = {
                'operate': 'DeleteAchievement',
                'resume_id': resume_id,
                'achievement_id': this._normal.children('li').eq(e.index).attr('data-achievementid')
            },
            self = this;
        confirmBox.confirm('确定删除该作品吗？', null, function () {
            var that = this;
            $.post('/hbResume/DelDo/', data, function (json) {
                that.hide();
                if (json.error) {
                    confirmBox.alert(json.error, null, {title: '保存失败'});
                    return;
                }
                self.deleteList(e.index);
                self.hasNormalData(self._normal.children('li').length);
                updateCompPercent(json.complete_percent);
                window.parent.preview_resume_iframe_reload();
                var size = $('#opusInfor .my-case li').size();
                if (size == 0) {
                    $('#achAdd').css('display', 'block');
                } else {
                    $('#achAdd').css('display', 'none');
                }
            }, 'json');
        });
    });
    opusInforEditor.on('add', function () {
        this.toggleNoData(true);
        this.clearData();
        delete this._otherEvent;
    });
    opusInforEditor.on('modify', function () {
        this.toggleNoData(true);
        this.resetForm();
        this.resetData();
        delete this._otherEvent;
    });
    opusInforEditor.on('cancel', function () {
        this.toggleNoData(this._normal.children('li').length);
    });
    opusInforEditor.on('submit', function (e) {
        this.saveSubmit(e);
    });
    opusInforEditor.saveSubmit = function (e) {
        if (this.getDom('#showAchi').html() == '') {
            var msg = '请添加作品附件';
            confirmBox.timeBomb(msg, {
                name: 'fail',
                width: pWidth + msg.length * fontWidth
            });
            this.resultStatus = false;
            return;
        }
        var result = opusInforValidators.checkForm();
        this.resultStatus = result;
        if (!result) {
            return;
        }
        //var uploadifyObj = this.getDom('#achiFile').data('uploadify');
        e && (this._otherEvent = e.otherEvent);
        //if (typeof uploadifyObj != 'undefined' && uploadifyObj.queueData.queueLength > 0){
        //this.getDom('#achiFile').uploadify('upload','*');
        //} else {
        if (fileUploader.isLoading) {
            var msg = '正在上传作品，请稍等';
            confirmBox.timeBomb(msg, {
                name: 'warning',
                width: pWidth + msg.length * fontWidth
            });
        } else {
            this.submitForm(result);
        }
        //}
    };
    opusInforEditor.submitForm = function (valid) {
        var data = {'resume_id': resume_id},
            self = this,
            index = this.getIndex();
        if (index != undefined) {
            var li = this._normal.children('li').eq(index);
            if (li.length) {
                data['hidModAchievementID'] = li.attr('data-achievementid');
            }
        }
        this.getDom('.saveBtn').submitForm({
            beforeSubmit: valid,
            data: data,
            success: function (result) {
                if (result && result.error) {
                    confirmBox.alert(result.error, null, {title: '保存失败'});
                    self.resultStatus = false;
                    return;
                }
                updateResumeTime(result.update_time);
                updateCompPercent(result.complete_percent);
                opusInforEditor.updatePreview(result);
                if (self._otherEvent) {
                    self._normal.before(self._edit.show());
                    delete self._oldIndex;
                    self._isAdd = true;
                    self.clearData();
                }
                var size = $('#opusInfor .my-case li').size();
                if (size == 0) {
                    $('#achAdd').css('display', 'block');
                } else {
                    $('#achAdd').css('display', 'none');
                }

                window.parent.preview_resume_iframe_reload(self._otherEvent ? false : true);
                // window.location.reload();

            },
            clearForm: false
        });
    }
    /*作品上传*/

    var resumeObjs = {
            'baseinfor': baseInfoEditor,
            'jobInfor': jobInfoEditor,
            'appraiseInfor': appraiseEditor,
            'workInfor': workInfoEditor,
            'eduInfor': eduInfoEditor,
            'projectInfor': projectInfoEditor,
            'languageInfor': languageInfoEditor,
            'skillInfor': skillInforEditor,
            'cardInfor': cardInforEditor,
            'otherInfor': otherInfoEditor,
            'opusInfor': opusInforEditor,
            'practiceInfor': practiceInfoEditor
        },
        rightSideBox = rightSide.find('.res-item'),
        rightSideItem = rightSideBox.find('a'),
        scrollPos = [
            '#baseinfor', '#jobInfor', '#appraiseInfor', '#workInfor', '#eduInfor', '#projectInfor',
            '#languageInfor', '#skillInfor', '#cardInfor', '#otherInfor', '#opusInfor', '#practiceInfor'
        ],
        saveAllBtn = $('#prestr-btn'),
        maxLength = resumeObjs.length,
        webkit = /webkit/.test(navigator.userAgent.toLowerCase()),
        htmlbody = $(webkit ? 'body' : 'html');

    if (scroll_flag) {
        scrollToView(scroll_flag, null, true);
    }

    function scrollToView(flag, speed, isFn) {
        var name;
        if (util.type.isNumber(flag)) {
            name = $(scrollPos[flag]);
        } else if (util.type.isString(flag)) {
            var obj = resumeObjs[flag],
                trigger = obj._addTrigger || obj._trigger;
            name = $('#' + flag);
        }

        name != undefined && htmlbody.animate({
            scrollTop: name.offset().top
        }, speed || 300, 'linear', isFn && function () {
                trigger.trigger('click');
            });
    }

    rightSideBox.on('click', 'a', function (e) {
        scrollToView($(e.currentTarget).attr('data-name'), null, true);
    });

    saveAllBtn.on('click', function (e) {
        var resumeObj;
        for (var key in resumeObjs) {
            resumeObj = resumeObjs[key];
            if (resumeObj.isEditor()) {
                resumeObj.saveSubmit();
                if (!resumeObj.resultStatus) {
                    return;
                }
            }
        }
        setTimeout(function () {
            if (is_create) {
                win.location.href = complete_url;
            } else {
                win.location.href = manage_url;
            }
        }, 1000);
    });
});