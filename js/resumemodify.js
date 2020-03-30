/// <reference path="../../Js/jquery-1.4.2-vsdoc.js" />

var resumeLoaded = false;
var errorMsgBox = null;

var resume = new function()
{
    var id = 0;
    var getTempID = function()
    {
        return '_addContianer' + (id++);
    }

    //检查是否是新增简历，如果是添加则在url里加上resume=add参数，否则加上resumeID=[resumeID]
    this.getResumeData = function()
    {
        var data = { resumeAdd: resumeAdd, resumeID: resumeID, relatedResumeID: relatedResumeID, isChinese: isChinese };
        if (resumeAdd)
        {
            data.personType = $(':radio[name=resumePersonType][checked]').val();
        }
        return data;
    };

    //检查json数据里是否有resumeID属性，如果有的话将添加简历属性改为false并设置简历编号
    this.processAdd = function(json)
    {
        if (json.resumeID)
        {
            resumeID = json.resumeID;
            //如果是由添加模式变为修改模式，允许取消按钮
            if (resumeAdd)
            {
                this.enableCancell();
            }
            resumeAdd = false;
            var cn = $('#btnIsChinese');
            var en = $('#btnIsEnglish');

            if (cn.attr('href') != '' && /resumeAdd/.test(cn.attr('href')))
            {
                var href = cn.attr('href');
                href = href.replace(/relatedResumeID=\d+$/, 'relatedResumeID=' + resumeID);
                cn.attr('href', href);
            }
            if (en.attr('href') != '' && /resumeAdd/.test(en.attr('href')))
            {
                var href = en.attr('href');
                href = href.replace(/relatedResumeID=\d+$/, 'relatedResumeID=' + resumeID);
                en.attr('href', href);
            }
        }
        resetSaveView();
    };

    //修改操作管理对象，用于管理修改，恢复，保存等操作
    var Modify = function(opt)
    {
        var _default = {
            topContainer: null,
            indexed: false, //是否有序号
            container: null,
            showUrl: null,
            modifyUrl: null,
            addUrl: null,
            modifyButton: null,
            param: null,
            delParam: null,
            onLoad: null, //当加载显示页面时执行
            onModify: null, //当进入编辑状态时执行
            onAdded: null, //当添加时执行
            onDeleted: null, //添删除某一项时执行
            confirmMsg: '您真的要保存吗？',
            deleteMsg: '您真的要删除吗？'
        };

        this.topContainer = null;
        this.container = null;

        this.options = $.extend(_default, opt);
        this.topContainer = $(this.options.topContainer);
        this.container = $(this.options.container);
        this.expandButton = null;
        this.modifyButton = null;
        this.addButton = null;
        this.saveButton = null;
        this.saveAndAddButton = null;
        this.deleteButton = null;
        this.deleteAddButton = null;
        this.cancellButton = null;
        this.form = null;
        this.formValidator = null;
        this.onLoad = this.options.onLoad;
        this.onModify = this.options.onModify;
        this.onAdded = this.options.onAdded;
        this.onDeleted = this.options.onDeleted;
        this.status = 'show';
        var self = this;
        this.show = function(fn)
        {
            if (self && self.container && self.container.html() != 'undefined' && self.container.html().trim() != '' && self.status == 'show' )
            {
                self.container.closest('.resumeFill').show();
                return;
            }
            var url = self.options.showUrl;

            if (self.options.param.resumeID != 'undefined' && self.options.param.resumeID <= 0)
            {
                self.options.param.resumeID = resumeID;
            }
            if (self.options.param.isAdd)
            {
                delete self.options.param.resumeID;
            }
            self.options.param.resumeAdd = resumeAdd;
            //alert($.param( self.options.param));
            url += '?' + $.param(self.options.param);
            self.container.load(url, function()
            {
                self.init();
                self.modifyButton.show();
                if ($.isFunction(fn))
                {
                    fn(self.container);
                }
                self.status = 'show';
                resetSaveView();
                self.raiseLoad();
                self.refreshIndex();
            });
            return this;
        }
        this.hide = function()
        {
            self.container.closest('.resumeFill').hide();
        }

        this.init = function()
        {
            if (typeof self.options.expandButton == 'string')
            {
                this.expandButton = $(self.options.expandButton);
            } else
            {
                this.expandButton = self.options.expandButton;
            }
            this.modifyButton = self.container.find('#btnModify');
            this.addButton = self.container.find('#btnAdd');
            this.saveButton = self.container.find('#btnSave');
            this.saveAndAddButton = self.container.find('#btnSaveAndAdd');
            this.deleteButton = self.container.find('#btnDelete');
            this.deleteAddButton = self.container.find('#btnDeleteAdd');
            this.cancellButton = self.container.find('#btnCancel');
            this.form = self.container.find('form');
            this.formValidator = this.form.data('validator');

            //绑定事件
            if (this.expandButton)
            {
                this.expandButton.unbind('click').click(function()
                {

                    if (resumeLoaded && !checkPersonLogin()) return;
                    if (self.container.is(':visible') && self.container.html().trim() != '')
                    {
                        self.hide();
                        self.expandButton.removeClass('close').addClass('open').html('展开');
                    }
                    else
                    {
                        //self.expandButton.running();
                        self.show();
                        self.expandButton.removeClass('open').addClass('close').html('收起');
                        //self.expandButton.stopRunning();
                    } 
                    return false;
                });
                /*
                this.expandButton.unbind('click').toggle(function()
                {
                self.expandButton.running();
                self.show();
                self.expandButton.stopRunning();
                }, self.hide);*/
            }
            else
            {
                this.modifyButton.unbind('click').click(function()
                {
                    if (resumeLoaded && !checkPersonLogin()) return;
                    self.modifyButton.running('正在处理，请稍候');
                    self.modify();
                    self.modifyButton.stopRunning();
                    return false;
                });
                
                this.deleteButton.unbind('click').click(function()
                {
                    if (resumeLoaded && !checkPersonLogin()) return;
                    var el = $(this);
                    self.del(el);
                    return false;
                });
            }

            this.saveButton.click(function() { self.save();self.addButton.click();return false; });
            this.saveAndAddButton.click(function(){});
            
            this.addButton.unbind('click').click(function()
            {
                if (resumeLoaded && !checkPersonLogin()) return;
                //self.addButton.running('正在加载，请稍候');
                self.add();
                self.addButton.stopRunning();
                return false;
            });



            this.cancellButton.unbind('click').click(function()
            {
                if (resumeLoaded && !checkPersonLogin()) return;
                self.cancellButton.running('正在处理，请稍候');
                self.show();
                self.cancellButton.stopRunning();
                return false;
            });
            this.deleteAddButton.unbind('click').click(function()
            {
                if (resumeLoaded && !checkPersonLogin()) return;
                var el = $(this);
                self.delAdd(el);
                self.show();
                return false;
            });
        };

        //重设按钮状态
        this.resetButton = function()
        {
            var input = self.container.find('input:visible');
            if (input.length > 0)
            {
                // self.saveButton.show();
            } else
            {
                // self.saveButton.hide();
            }
        }

        this.modify = function(fn)
        {
            var url = self.options.modifyUrl;
            var data = self.options.param;
            data.resumeAdd = resumeAdd;
            data.isAdd = false;
            if (data.resumeID != 'undefined') data.resumeID = resumeID;
            url += '?' + $.param(data);
            //alert('uuuuuuuu:'+url);
            self.container.load(url, function()
            {
                self.init();
                self.modifyButton.hide();
                self.raiseModify();
                if (fn)
                {
                    fn(self.container);
                }
                self.status = 'modify';
                if (resumeAdd) self.cancellButton.hide();
                resetSaveView();
                self.resetButton();
                self.refreshIndex();
            });
        };
       
        this.save = function(async, saveAll)
        {
            self.formValidator = self.form.data('validator');
            if (self.formValidator)
            {
                if (!self.formValidator.form()) return false;
            }
            var data = $.extend({}, self.options.param, resume.getResumeData());

            data.add = resumeAdd;
            //$.confirm(self.options.confirmMsg, function()
            //{
            var result = false;
            var a = (typeof (async) == 'undefined' ? true : async);
            $(self.saveButton).submitForm(
                    {
                        data: data,
                        async: a,
                        success: function(json)
                        {
                            try
                            {
                                if (window.opener)
                                {
                                    window.opener.refreshResume();
                                }
                            } catch (e) { }
                            if (json.error)
                            {
                                if (errorMsgBox != null && typeof errorMsgBox != "undefined")
                                {
                                    if (saveAll == true)
                                    {
                                        result = false;
                                        return;
                                    }
                                }
                                errorMsgBox = $.message(json.error, { icon: 'fail' });
                                result = false;
                                return;
                            }
                            if (json.msg != '' && json.msg != undefined)
                            {
                                $.anchorMsg('您的简历基本填写完整，已符合职位申请标准');
                            }
                            result = true;
                            resume.processAdd(json);
                            self.options.param = $.extend(self.options.param, json.param);
                            
                            
                            self.show();
                            
                           
                            //updateResumeComplete();
                            //updateResumeName(json); //修改简历名称
                        }
                    });
            //});
            return result;
        };
        
        this.saveAndAdd = function(async, saveAll)
        {
            self.formValidator = self.form.data('validator');
            if (self.formValidator)
            {
                if (!self.formValidator.form()) return false;
            }
            var data = $.extend({}, self.options.param, resume.getResumeData());

            data.add = resumeAdd;
            //$.confirm(self.options.confirmMsg, function()
            //{
            var result = false;
            var a = (typeof (async) == 'undefined' ? true : async);
            $(self.saveButton).submitForm(
                    {
                        data: data,
                        async: a,
                        success: function(json)
                        {
                            try
                            {
                                if (window.opener)
                                {
                                    window.opener.refreshResume();
                                }
                            } catch (e) { }
                            if (json.error)
                            {
                                if (errorMsgBox != null && typeof errorMsgBox != "undefined")
                                {
                                    if (saveAll == true)
                                    {
                                        result = false;
                                        return;
                                    }
                                }
                                errorMsgBox = $.message(json.error, { icon: 'fail' });
                                result = false;
                                return;
                            }
                            if (json.msg != '' && json.msg != undefined)
                            {
                                $.anchorMsg('您的简历基本填写完整，已符合职位申请标准');
                            }
                            result = true;
                            resume.processAdd(json);
                            self.options.param = $.extend(self.options.param, json.param);
          
                            self.show();
                            
                            
                            //updateResumeComplete();
                            //updateResumeName(json); //修改简历名称
                        }
                    });
            //});
            return result;
        };

        this.add = function(fn)
        {
            var btnSave = $('#btnSaveAll');
            btnSave.attr('disabled', false);

            var tempID = getTempID();
            var div = $('<div id="' + tempID + '" class="_item unit">');
            var url = self.options.addUrl;
            var data = $.extend(self.options.param, resume.getResumeData());
            var paramUrl = $.param(data);
            if (url.indexOf('?') > 0)
            {
                url += '&' + paramUrl;
            } else
            {
                url += '?' + paramUrl;
            }
            div.load(url, function()
            {
            	if(self.addButton.attr('id') == 'btnAdd')
        		{
        			self.addButton.closest('div').before(div);
        		}
            	else{
            		self.saveButton.closest('.teamLst').find('.addUnit').before(div);
            	}
            	
                var opt = $.extend({}, self.options);
                opt.onLoad = self.onLoad;
                opt.onModify = self.onModify;
                opt.onAdded = self.onAdded;
                opt.onDeleted = self.onDeleted;
                opt.container = $('#' + tempID);
                //opt.param.resumeID = resumeID;
                opt.param.isAdd = true;
                opt.expandButton = null;
                resume.registModify(opt).status = 'add';
                self.raiseAdded();
                if (fn)
                {
                    fn(div);
                }
                //resetSaveView();
                self.resetButton();
                self.refreshIndex(self.addButton);
                //self.listen(self.addButton);
                //setTimeout(function() { alert($('#training').find('._itemIndex').length); }, 1000);
            });
        };
        

        this.del = function(el)
        {
            el.confirm(self.options.deleteMsg, function(el)
            {
                var url = '/resume/delDo';
                var data = $.extend({}, self.options.param, self.options.delParam);

                data.resumeID = resumeID;
                el.getJSON(url, data, function(json)
                {
                    if (json.error)
                    {
                        $.message(json.error, { icon: 'fail' });
                        return;
                    }
                    if (json.msg != '' && json.msg != undefined)
                    {
                        $.anchorMsg('您的简历未填写完整，不能进行职位申请', { icon: 'fail' });
                    }
                    else
                    {
                        $.anchorMsg('删除成功。');
                    }
                    var con = self.container.closest('.resumeFillC');
                    self.container.remove();
                    //updateResumeComplete();
                    self.raiseDeleted();
                    resetSaveView();
                    self.resetButton();
                    self.refreshIndex(con);
                }, function(XMLHttpRequest, textStatus, errorThrown)
                {
                    $.message('删除失败！');
                    return;
                });
            });
        };

        this.delAdd = function(el)
        {
            var con = el.closest('.resumeFillC');
            el.closest('._item').remove();
            resetSaveView();
            self.raiseDeleted();
            self.refreshIndex(con);
        }
        //刷新序号
        this.refreshIndex = function(container)
        {
            if (!self.options.indexed) return;
            container = container || self.container;
            var topCon = container.closest('.resumeFill');
            var i = 1;
            topCon.find('._itemIndex').each(function()
            {
                $(this).html(i++);
            });
        }

        //事件
        var raiseEvent = function(fn, param)
        {
            if (!fn) return;
            if ($.isArray(fn))
            {
                for (var i = 0; i < fn.length; i++)
                {
                    fn[i](param);
                }
            } else
            {
                fn(param);
            }
        }
        this.raiseLoad = function()
        {
            raiseEvent(this.onLoad);
        }
        this.raiseModify = function()
        {
            raiseEvent(this.onModify);
        }
        this.raiseAdded = function()
        {
            raiseEvent(this.onAdded);
        }
        this.raiseDeleted = function()
        {
            raiseEvent(this.onDeleted);
        }

        this.init();
    };

    var arr = new Array();
    this.registModify = function(opt)
    {
        var m = new Modify(opt);
        arr.push(m);
        return m;
    }

    this.show = function()
    {
        for (var i in arr)
        {
            try
            {
                arr[i].expandButton.click();
                /*
                var fn = (function()
                {
                return function()
                {
                arr[i].expandButton.click();
                } 
                })();
                setTimeout(fn);*/
            } catch (e)
            {
                //  alert(e.message);
            }
        }
    };

    this.modify = function()
    {
        for (var i in arr)
        {

            arr[i].modify();
        }
    };

    this.saveAll = function()
    {
        isSaveAll = true;
        for (var i in arr)
        {
            var item = arr[i];
            if (item.status == 'modify' || item.status == 'add')
            {
                var input = item.container.find(':input:visible');
                if (input.length > 0)
                {
                    var includeFile = false;
                    $.each($(input), function(i, j)
                    {
                        if ($(j).attr('type') == 'file')
                        {
                            includeFile = true;
                            return false;
                        }
                    });
                    if (!item.save(false, isSaveAll))
                    {
                        if (!includeFile)
                        { break; }
                    }
                }
            }
        }
        errorMsgBox = null;
        // add by dongzh 2011-3-10 10:56
      //  $('em.error').eq(1).prev().get(0).focus();
        
        //保存简历之前检测简历是否通过审核 add by jcl 2013-2-26
        getResumeComplateForSaveAll();
    }

    this.isCanSave = function()
    {
        var canSave = false;
        for (var i in arr)
        {
            var a = arr[i];
            if (a.status == 'modify' || a.status == 'add')   //处于编辑或添加状态
            {
                var input = a.container.find('input:visible');
                if (input.length > 0)
                {
                    canSave = true;
                    break;
                }
            }
        }
        return canSave;
    }

    this.enableCancell = function()
    {
        var canSave = false;
        for (var i in arr)
        {
            arr[i].cancellButton.show();
        }
    }
}

//保存简历按钮时建立完整度检测 add by jcl 2013-2-26
function getResumeComplateForSaveAll(){
    var str='您的这份简历还不完整，暂时没有达标，目前不能用来投递！<br/>';
    str+='建议您按照页面上的提示填写完整。<br/>继续填写：';
    var url = '/DragonVerPerson/Resuming/ResumeModify.aspx?operate=getComplete&resumeID=' + resumeID;
    $.getJSON(url, function(json) {
        if (json.error) {
            $.message(json.error, { icon: 'info' });
            return;
        }
        if(!json.hasName){
            str += '<a href="javascript:void(0)" onclick="to(this,\'#anchorResumeName\',\'resumeName\',\'save\');" class="blue">简历名称</a>\t';
        }
        if(!json.hasBaseInfo){
            str += '<a href="javascript:void(0)" onclick="to(this,\'#anchorBasic\',\'basic\',\'save\');" class="blue">基本信息</a>\t';
        }
        if(!json.hasEdu){
            str += '<a href="javascript:void(0)" onclick="to(this,\'#anchorEdu\',\'edu\',\'add\');" class="blue">教育背景</a>\t';
        }
        if($('#spnHasWork').closest('li').find('i').text().trim()=='*'&&!json.hasWork)
        {
            str+= '<a href="javascript:void(0)" onclick="to(this, \'#anchorWork\', \'work\', \'add\');" class="blue">工作经验</a>\t';
        }
        if(!json.hasExpect)
        {
            str+= '<a href="javascript:void(0)" onclick="to(this,\'#anchorExpect\',\'expect\',\'edit\');" class="blue">求职意向</a>\t';
        }
        if(!json.hasAppraise)
        {    
            str+='<a href="javascript:void(0)" onclick="to(this,\'#anchorAppraise\',\'appraise\', \'edit\');" class="blue">自我评价</a>\t';
        }
        if($('#spnHasPractice').length>0&&!json.hasPractice)
        {    
            str+='<a href="javascript:void(0)" onclick="to(this,\'#anchorPractice\',\'practice\', \'add\');" class="blue">实践经验</a>\t';
        }
        if (!json.hasMustItem) {
            $.message(str,{icon:"warning"});
            return;
        }else{
            $.anchorMsg("简历保存成功！",{icon:'success'});
        }
    });
}

//更新预览简历按钮
function resetSaveView()
{
    var btnSave = $('#btnSaveAll');
    var btnView = $('#btnView');
    if (resumeAdd)
    {
        //btnView.hide();
    } else
    {
        var url = '/DragonVerPerson/Resuming/ResumePreview.aspx?resumeID=' + resumeID;
        btnView.attr('href', url);
        //btnView.show();
    }
    if (resume.isCanSave())
    {
        btnSave.attr('disabled', false);
    } 
    else
    {
        btnSave.attr('disabled', true);
    }
}
function updateResumeComplete()
{
    //if (resumeAdd) { return; }
    var url = '/DragonVerPerson/Resuming/ResumeModify.aspx?operate=getComplete&resumeID=' + resumeID;
    var setStatus = function(obj, status)
    {
        if (status)
        {
            //obj.html('<img src="/Images/correct.gif">');
            obj.removeClass().addClass("green").html('已填写');
        } else
        {
            obj.removeClass().addClass('gray').html("未填写");
        }
    }
    $.getJSON(url, function(json) {
        if (json.error) {
            $.message(json.error, { icon: 'info' });
            return;
        }
        setStatus($('#spnHasName'), json.hasName);
        setStatus($('#spnHasBaseInfo'), json.hasBaseInfo);
        setStatus($('#spnHasEdu'), json.hasEdu);
        setStatus($('#spnHasWork'), json.hasWork);
        setStatus($('#spnHasProject'), json.hasProject);
        setStatus($('#spnHasExpect'), json.hasExpect);
        setStatus($('#spnHasAppraise'), json.hasAppraise);
        setStatus($('#spnHasTraining'), json.hasTraining);
        setStatus($('#spnHasSkill'), json.hasSkill);
        setStatus($('#spnHasCertificate'), json.hasCertificate);
        setStatus($('#spnHasAppend'), json.hasAppend);
        setStatus($('#spnHasPractice'), json.hasPractice);
        setStatus($('#spnMustItem'), json.hasMustItem);
        setStatus($('#spnMustCheck'), json.hasMustItem);
        setStatus($('#spnHasAchievement'), json.hasAchievement); //个人作品
        if (json.hasMustItem) {
            $('#spnMustCheck').removeClass('resume_waring');
            $('#btnCheckResumeComplete').html('已通过审核').css({ 'color': '#03609B' });
            $('#resumeAuditState').html('简历已达标').removeClass().addClass('green');
        }
        else {
            $('#spnMustCheck').addClass('resume_waring');
            $('#btnCheckResumeComplete').html('未通过审核').css({ 'color': 'red' });
            $('#resumeAuditState').html('简历尚未达标，请完善以下带（*）号的必填项').removeClass().addClass('gray');
        }
        var levClass = "lv1";
        if (json.complete) {
            if (json.complete == 100) {
                levClass = 'lv5';
            }
            else if (json.complete > 80) {
                levClass = 'lv4';
            }
            else if (json.complete > 70) {
                levClass = 'lv3';
            }
            else if (json.complete >= 60) {
                levClass = 'lv2';
            } 
            else {
                levClass = "lv1";
            }
            $('#spnComplete').find('b').html(json.complete + '分').end().find('i').removeClass().addClass(levClass);
        }
        else {
            $('#spnComplete').find('b').html('60分以下').end().find('i').removeClass().addClass(levClass);
        }

    });
}

function GetResumeComplete() //判断完整度 如果是0的话弹出帮助提示
{
    var url ='ResumeModify.aspx?operate=getComplete&resumeID=' + resumeID;
    var num = 0;
    var str = '<font color="red">请务必完成所有必填项目的填写，否则单位无法查看到您的简历，您也无法进行职位投递！</font><br /><br />'
    str +='快速求职技巧：<br />';
    str += '1.填写完所有简历必填项目（带<font color="red">*</font>的为必填项），当然，填完所有项目将为您的简历锦上添花，增加竞争力。<br />';
    str += '2.所有必填项填写完毕后，您的简历将立即达到标准<br />';
    str +='3.达到标准的简历即可立即进行职位投递！<br />';
    $.getJSON(url,function(json)
    {
        num = json.complete == null ? 0 :json.complete;
    });
    if(num == 0)
    {
       $.message(str,{icon:"warning"})
    }
    
}

function updateResumeName(json)
{
    if (json.resumeName)
    {
        $('#spnResumeName').html(json.resumeName);
    }
}

//如果必填项没有填写将锚链家加入到对话框中，点击锚链接对话框消失spnHasName spnHasBaseInfo spnHasEdu spnHasWork spnHasExpect  spnHasAppraise
function checkResumeComplete()
{
    var str="";
    if(!$('#spnHasName').hasClass('complete'))
    {
        str += '<a href="#" onclick="to(this,\'#anchorResumeName\',\'resumeName\',\'save\');">简历名称</a>\t';
    }
    if(!$('#spnHasBaseInfo').hasClass('complete'))
    {
        str += '<a href="#" onclick="to(this,\'#anchorBasic\',\'basic\',\'save\');">基本信息</a>\t';
    }
    if(!$('#spnHasEdu').hasClass('complete'))
    {
        str += '<a href="#" onclick="to(this,\'#anchorEdu\',\'edu\',\'add\');">教育背景</a>\t';
    }
    if(!$('#spnHasWork').hasClass('complete') && $('#spnHasPractice').length <= 0)
    {
        //str+= '<a href="#anchorWork" onclick="$(this).closeDialog();">工作经验</a>';
        str+= '<a href="#" onclick="to(this, \'#anchorWork\', \'work\', \'add\');">工作经验</a>\t';
    }
    if(!$('#spnHasExpect').hasClass('complete'))
    {
        str+= '<a href="#" onclick="to(this,\'#anchorExpect\',\'expect\',\'edit\');">求职意向</a>\t';
    }
 
    if(!$('#spnHasAppraise').hasClass('complete'))
    {    
        
        str+='<a href="#" onclick="to(this,\'#anchorAppraise\',\'appraise\', \'edit\');">自我评价</a>\t';
    }
    
    if($('#spnHasPractice').length > 0 && !$('#spnHasPractice').hasClass('complete'))
    {    
        
        str+='<a href="#" onclick="to(this,\'#anchorPractice\',\'practice\', \'add\');">实践经验</a>\t';
    }
    
    if (str!="")
    {
        $.message('以下内容必须填写<br />' + str,{icon:"warning"});
        //$.showMessage(str,{icon:'warning'});
    } 
    else
    {
        $.anchorMsg("必填项都已填写");
    }
}

function to(obj, anchor, btn, action)
{
    $(obj).attr('href', anchor);
    switch(action)
    {
        case 'add' : 
            $('#' + btn).find('#btnAdd').click();
            break;
        case 'edit' : 
            $('#' + btn).find('#btnModify').click();
            break;
    }
    $(obj).closeDialog();
}
    
//当用户没有填写必填项目离开页面时的提示
function resumeCompleteAlert(obj)
{
    var str="";
    if(!$('#spnHasName').hasClass('complete'))
    {
        str += '<a href="#" onclick="to(this,\'#anchorResumeName\',\'resumeName\',\'edit\');">简历名称</a>\t';
    }
   if(!$('#spnHasBaseInfo').hasClass('complete'))
    {
        str += '<a href="#" onclick="to(this,\'#anchorBasic\',\'basic\',\'edit\');">基本信息</a>\t';
    }
    if(!$('#spnHasEdu').hasClass('complete'))
    {
        str += '<a href="#" onclick="to(this,\'#anchorEdu\',\'edu\',\'add\');">教育背景</a>\t';
    }
    if(!$('#spnHasWork').hasClass('complete') && $('#spnHasPractice').length <= 0)
    {
        str+= '<a href="#" onclick="to(this, \'#anchorWork\', \'work\', \'add\');">工作经验</a>\t';
    }
    if(!$('#spnHasExpect').hasClass('complete'))
    {
        str+= '<a href="#" onclick="to(this,\'#anchorExpect\',\'expect\',\'edit\');">求职意向</a>\t';
    }
    if(!$('#spnHasAppraise').hasClass('complete'))
    {    
        str+='<a href="#" onclick="to(this,\'#anchorAppraise\',\'appraise\', \'edit\');">自我评价</a>\t';
    }
    if($('#spnHasPractice').length > 0 && !$('#spnHasPractice').hasClass('complete'))
    {    
        str+='<a href="#" onclick="to(this,\'#anchorPractice\',\'practice\', \'add\');">实践经验</a>\t';
    }

    if (str!="")
    {
        $.confirm("您还有以下必填项目未填写完整，用人单位无法查看到您的简历，您也无法进行职位投递！请立即完善！<br>" + str,function()
        {
            window.location = $(obj).attr('href');
            return true;
        });
        return false;
//        $.message(str,{icon:"warning"});
//        //$.showMessage(str,{icon:'warning'});
//        return false;
    } 
    else
    {
       return true;
    }
}

 