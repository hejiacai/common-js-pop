/**
 *  jQuery  ui_MultipleSelect.js
 *  Copyright (c)  ZhangYu
 */
(function ($) {
    var MultipleSelect = function (element, opt) {
        this.id = '';
        this.dh = null; //
        this.dc = null; // 内容
        this.df = null; // 底部
        this.$element = $(element);
        this.options = null; //参数信息
        this.hd = null;
        this.currLevel = 1;
        this.lastSelectItem = ['NULL', '不限'];
        this._defaults = {
            url: '',
            multipleUrl: '',
            multipleData: [],
            subclass_id: 'subclass',
            isLimit: false,
            max: 3,
            tipClass: 'tipClass',
            hddName: 'hddName',
            inputName: 'MultipleSelectName',
            selectItems: [],
            selectClass: 'cu',
            type: 'multiple', // single|multiple
            unLimitedLevel: 2,
            singlelimit: true,
            onSelect: null,
            data_key: 'id',
            data_name: 'name',
            parent_id: 'parent_id',
            level: 2,
        };

        var self = this;
        //初始化选项
        this.initOptions = function () {
            var tempOpt = opt || {};
            tempOpt.animate = tempOpt.animate || '';
            tempOpt.showAnimate = tempOpt.showAnimate || tempOpt.animate;
            tempOpt.hideAnimate = tempOpt.hideAnimate || tempOpt.animate;
            self.options = $.extend({}, this._defaults, tempOpt);
        };

        this.initHtml = function (type) {
            // 初始化控件
            var html = ' <span><div class="dropSet"> ' +
                ' <b class="hbFntWes dropIco">&#xf03a;</b>' +
                '    <input type="text" class="text JobCay">' +
                '  </div>' +
                ' <div class="dropLst">' +
                ' <div class="dropLstHead"><a href="javascript:void(0)" class="unlimited btn1 btnsF12">类别不限</a><p>最多可选择<em></em>项</p><a class="closeDrop" href="javascript:void(0)">×</a></div>' +
                ' <div class="dropLstCon">' +
                '     <div class="lst lst1">' +
                '        <ul>' +
                '        </ul>' +
                '     </div>' +
                '    <div class="lst lst2">' +
                '    	<ul>' +
                '       </ul>' +
                '    </div>' +
                '    <div class="lst lst3">' +
                '    	<ul>' +
                '       </ul>' +
                '    </div>' +
                '    <div class="clear"></div>' +
                ' </div> ' +
                ' </div></span>';
            self.dh = $(html).appendTo(self.$element).find('.dropLst').hide();
            self.tipElement = self.dh.find('.dropLstHead');
            self.hd = self.$element.find('.dropSet').show();
            self.hc = self.$element.find('.dropLstCon');
            self.hddElement = $('<input type="hidden" name="' + self.options.hddName + '"/>').appendTo(self.$element);
            if (self.isSingle()) {
                self.tipElement.find('.unlimited').hide().end().find('p').html('请选择分类；重新选择即可修改当前选项');
                if (!self.options.singlelimit) {
                    self.tipElement.find('.unlimited').show(); // XXX: 临时解决 校园招聘首页 单选行业，可以指定类别不限
                }
                self.hd.find('.dropIco').html('&#xf0d7;');
                self.hd.removeClass('dropSet').addClass('dropRdSet');
            } else {
                self.tipElement.find('em').html(self.options.max);
            }
            // 是否限制
            if (self.options.isLimit) {
                self.tipElement.find('.unlimited').hide();
            }
            // 加载一级类别
            var url = self.options.url;
            self.loadData(url, self.selectItem);
            if (self.options.selectItems.length > 0) {
                $.each(self.options.selectItems, function (_key, _value) {
                    self.loadData(_value, self.setControl, true);
                });
            }

        };

        // 初始化事件
        this.initEvent = function () {
            self.dh.find('.closeDrop').click(function () {
                self.dh.hide();
            });
            self.dh.find('.unlimited').click(function () {
                self.dh.hide();
                self.reset();
                if (self.isSingle()) {
                    // XXX:校园招聘首页
                    self.hd.find('input[type="text"]').before($('<span class="seled" d=",不限">类别不限</span>'));
                } else {
                    self.hd.find('input[type="text"]').before($('<span class="seled" d="null,不限">不限<i class="delSel">×</i></span>'));
                }

            });

            self.hd.click(function (e) {
                var target = $(e.target);
                if (target.is('.delSel')) {
                    self.lastSelectItem = target.parent().attr('d').split('{|}');
                    self.checkItem(false);
                    e.stopPropagation();
                    return;
                }
                if (self.options.level < 3) {
                    self.dh.find('.lst3').remove();
                }
                self.dh.show();
            });

            // 选择一级大类
            self.dh.find('.lst1 ul').click(function (e) {
                var target = $(e.target);
                if (target.is('input')) {
                } else if (target.is('label')) {
                    target = target.closest('li');
                    self.currLevel = 2;
                    $(target).siblings().removeClass(self.options.selectClass).end().addClass(self.options.selectClass);
                    self.lastSelectItem = $(target).attr('d').split('{|}');
                    var url = self.options.url + self.lastSelectItem[0];
                    self.loadData(url, self.selectItem);
                }
            });

            // 选择二级大类
            self.dh.find('.lst2 ul').click(function (e) {
                var target = $(e.target);
                self.lastSelectItem = $(target).closest('li').attr('d').split('{|}');
                if (target.is('input')) {
                    self.checkItem(target.is(':checked'));
                } else if (target.is('label')) {
                    target = target.closest('li');
                    var target = target.closest('li');
                    var input = $(target).find('input:visible');
                    if (input.length <= 0 && self.options.level == 3) {
                        //3级
                        self.currLevel = 3;
                        $(target).siblings().removeClass(self.options.selectClass).end().addClass(self.options.selectClass);
                        var url = self.options.url + self.lastSelectItem[0];
                        self.loadData(url, self.selectItem);
                    } else {
                        var disabled = $(target).find('input').is(':disabled');
                        var checked = $(target).find('input').is(':checked');

                        if (disabled) {
                            return;
                        }
                        if ($(target).find('input').is(':radio') && checked) {
                            return;
                        }
                        if (checked) {
                            $(target).find('input').removeAttr('checked');
                        } else {
                            $(target).find('input').attr('checked', 'checked');
                        }
                        self.checkItem(!checked);
                        if (target.is('li[isParent]')) {
                            return;
                        }
                    }
                }
            });

            // 选择三级大类
            self.dh.find('.lst3 ul').click(function (e) {
                var target = $(e.target);
                self.lastSelectItem = $(target).closest('li').attr('d').split('{|}');
                if (target.is('input')) {
                    self.checkItem(target.is(':checked'));
                } else if (target.is('label')) {
                    target = target.closest('li');
                    var target = target.closest('li');
                    var input = $(target).find('input:visible');
                    if (input.length <= 0) {
                        return;
                    }
                    var disabled = $(target).find('input').is(':disabled');
                    var checked = $(target).find('input').is(':checked');

                    if (disabled) {
                        return;
                    }
                    if ($(target).find('input').is(':radio') && checked) {
                        return;
                    }
                    if (checked) {
                        $(target).find('input').removeAttr('checked');
                    } else {
                        $(target).find('input').attr('checked', 'checked');
                    }
                    self.checkItem(!checked);
                    if (target.is('li[isParent]')) {
                        return;
                    }
                    // self.currLevel = 3;
                    // $(target).siblings().removeClass(self.options.selectClass).end().addClass(self.options.selectClass);
                    // var url = self.options.url + self.lastSelectItem[0];
                    // self.loadData(url, self.selectItem);
                }
            });

            self.hc.mouseover(function (e) {
                var target = $(e.target);
                if (target.is('li')) {
                    self.hc.find('li').removeClass('hov');
                    target.addClass('hov');
                } else if (target.closest('li').length > 0) {
                    self.hc.find('li').removeClass('hov');
                    target.closest('li').addClass('hov');
                }
            });

        };

        this.show = function () {
            this.initOptions();
            this.initHtml();
            this.initEvent();
        };

        // 删除项
        this.delItems = function (data) {
            $.each(data, function (i, n) {
                if (self.options.selectItems.contains(n[self.options.data_key])) {
                    self.del(n[self.options.data_key], n[self.options.data_name]);
                }
            });
        };

        // 删除已选项
        this.del = function (id, name) {
            self.hd.find('.seled[d="' + id + '{|}' + name + '"]').remove();
            self.options.selectItems.remove(id);
            self.hddElement.val(self.options.selectItems.join(','));
        };
        this.add = function (id, name) {
            if (self.isSingle()) {
                self.hd.find('input[type="text"]').before($('<span class="seled" d="' + id + '{|}' + name + '">' + name + '</span>'));
            } else {
                self.hd.find('input[type="text"]').before($('<span class="seled" d="' + id + '{|}' + name + '">' + name + '<i class="delSel">×</i></span>'));
            }
            if (!self.options.selectItems.contains(id)) {
                self.options.selectItems.push(id);
            }
            self.options.selectItems.remove('');
            self.hddElement.val(self.options.selectItems.join(','));
        };

        // 选择事件
        this.loadData = function (url, callback, is_one) {
            if (self.options.multipleData) {
                var subclass_id = self.options.subclass_id || "subclass";
                var data_key = self.options.data_key || "id";
                var _tmp_data = self.options.multipleData;
                var re_data = [];
                $.each(_tmp_data, function (key, value) {
                    if (is_one) {
                        if (value[data_key] == url) {
                            re_data.push(value);
                        } else if (value[subclass_id]) {
                            $.each(value[subclass_id], function (key1, value1) {
                                if (value1[data_key] == url) {
                                    re_data.push(value1);
                                } else if (value1[subclass_id]) {
                                    $.each(value1[subclass_id], function (key2, value2) {
                                        if (value2[data_key] == url) {
                                            re_data.push(value2);
                                        }
                                    });
                                }
                            });
                        }
                        if (re_data) return;
                    }
                    //一级
                    if (url == '') {
                        re_data.push(value);
                    }
                    //子集
                    else {
                        if (value[data_key] == url && value[subclass_id]) {
                            re_data = value[subclass_id];
                        } else if (value[subclass_id]) {
                            $.each(value[subclass_id], function (key1, value1) {
                                if (value1[data_key] == url && value1[subclass_id]) {
                                    re_data = value1[subclass_id];
                                }
                            });
                        }
                    }
                });
                if (typeof callback == 'function') {
                    callback(re_data, is_one);
                }
            } else {
                // 选择项时
                $.ajax({
                    url: url,
                    type: "get",
                    dataType: "jsonp",
                    success: function (data) {
                        if (typeof callback == 'function') {
                            callback(data);
                        }
                    },
                });
            }
        };

        // 单选选中
        this.checkRadio = function () {
            var id = self.lastSelectItem[0],
                name = self.lastSelectItem[1],
                url = self.options.url + id;
            /*
             self.loadData(url,function(data){
             $.each(data,function(i,n){
             self.dh.find('li[d="'+n.MultipleSelect_id+'{|}'+n.MultipleSelect_name+'"]').find('input').attr('disabled','disabled');
             });
             });*/
            if (self.isExists(id)) {
                return;
            }
            // 删除之前的
            self.hd.find('.seled[d]').each(function () {
                var obj = $(this).attr('d').split('{|}'),
                    delurl = self.options.url + obj[0];
                /*
                 self.loadData(delurl,function(data){
                 $.each(data,function(i,n){
                 self.dh.find('li[d="'+n.MultipleSelect_id+'{|}'+n.MultipleSelect_name+'"]').find('input').removeAttr('checked').removeAttr('disabled');
                 });
                 });*/
                self.del(obj[0], obj[1]);
            });
            // 如果有子类之前有选中的，移除Inupt中的项，并删除控件中的记录
            self.loadData(url, self.delItems);
            // 新增当前项到inPut中
            self.add(id, name);
            self.dh.hide();
        };

        this.checkMultiple = function (is_one) {
            var isLimit = false;
            self.options.selectItems.remove('');
            if (self.options.selectItems.length >= self.options.max && !is_one) {
                // self.tipElement.addClass(self.options.tipClass);
                isLimit = true;
            } else if (self.options.selectItems.length > self.options.max && is_one) {
                // self.tipElement.addClass(self.options.tipClass);
                isLimit = true;
            } else {
                // self.tipElement.removeClass(self.options.tipClass);
                isLimit = false;
            }
            return isLimit;
        };

        // check项
        this.checkItem = function (isChecked, is_one) {
            var id = self.lastSelectItem[0],
                name = self.lastSelectItem[1],
                parent_id = self.lastSelectItem[2],
                url = self.options.url + id,
                isSingle = self.isSingle();
            if (isChecked) {
                if (parent_id) {
                    self.dh.find('li[d^="' + parent_id + '{|}"]').addClass('cu');
                }
                self.hd.find('.seled[d="null,不限"]').remove();
                if (isSingle) {
                    self.hd.find('.seled[d$="不限"]').remove();
                    self.checkRadio(id);
                } else {
                    if (self.checkMultiple(is_one)) {
                        self.dh.find('li[d="' + id + '{|}' + name + '"]').find('input').removeAttr('checked');
                        $.anchor('最多可以选择' + self.options.max + '项', {icon: 'info'});
                        return;
                    }
                    // 如果有将子类中的当前类选中
                    self.dh.find('li[d="' + id + '{|}' + name + '"]').find('input').attr('checked', 'checked');
                    // 如果有禁用并选中所有的子类
                    self.loadData(url, function (data) {
                        self.delItems(data);
                        $.each(data, function (i, n) {
                            if (self.options.level == 3) {
                                self.loadData(n[self.options.data_key], function (data_tmp) {
                                    self.delItems(data_tmp);
                                    $.each(data_tmp, function (i_1, n_1) {
                                        self.dh.find('li[d="' + n_1[self.options.data_key] + '{|}' + n_1[self.options.data_name] + '"]').find('input').attr('checked', 'checked').attr('disabled', 'disabled');
                                    });
                                });
                            }
                            self.dh.find('li[d="' + n[self.options.data_key] + '{|}' + n[self.options.data_name] + '"]').find('input').attr('checked', 'checked').attr('disabled', 'disabled');
                        });
                    });
                    // 新增当前项到inPut中
                    self.add(id, name);
                }
            } else {
                self.dh.find('li[d="' + id + '{|}' + name + '"]').find('input').removeAttr('checked');
                self.loadData(url, function (data) {
                    $.each(data, function (i, n) {
                        if (self.options.level == 3) {
                            self.loadData(n[self.options.data_key], function (data_tmp) {
                                self.delItems(data_tmp);
                                $.each(data_tmp, function (i_1, n_1) {
                                    self.dh.find('li[d="' + n_1[self.options.data_key] + '{|}' + n_1[self.options.data_name] + '"]').find('input').removeAttr('checked').removeAttr('disabled');
                                });
                            });
                        }
                        self.dh.find('li[d="' + n[self.options.data_key] + '{|}' + n[self.options.data_name] + '"]').find('input').removeAttr('checked').removeAttr('disabled');
                    });
                });
                self.del(id, name);
            }
            if (typeof self.options.onSelect == 'function') {
                self.options.onSelect();
            }
        };
        // 是否存在
        this.isExists = function (id, is_pid) {
            is_pid = typeof is_pid == 'undefined' ? true : is_pid;
            var pid = 0;
            var subclass_id = self.options.subclass_id || "subclass";
            var data_key = self.options.data_key || "id";
            var parent_id = self.options.parent_id || "parent_id";
            var _tmp_data = self.options.multipleData;
            $.each(_tmp_data, function (key, value) {
                if (value[data_key] == id) {
                    pid = value[parent_id];
                } else if (value[subclass_id]) {
                    $.each(value[subclass_id], function (key1, value1) {
                        if (value1[data_key] == id) {
                            pid = value1[parent_id];
                        }
                        if (value1[subclass_id]) {
                            $.each(value1[subclass_id], function (key2, value2) {
                                if (value2[data_key] == id) {
                                    pid = value2[parent_id];
                                }
                            });
                        }
                    });
                }
            });
            if (pid && is_pid) {
                return self.options.selectItems.contains(pid) || self.options.selectItems.contains(id);
            }
            return self.options.selectItems.contains(id);
        };
        // 是否单选
        this.isSingle = function (id) {
            return self.options.type == 'single';
        };
        this.selectItem = function (data) {
            var arr = new Array(),
                pid = self.lastSelectItem[0],
                pname = self.lastSelectItem[1],
                isSingle = self.isSingle(),
                createItem = function (isSigle, pid, id, name, isdisabled, isChecked, isParent, isFirst, isShowControl, is_subclass) {
                    var s = new StringBuilder();
                    s.Append('<li d="' + id + '{|}' + name + '"');
                    if (isParent) {
                        s.Append(' isParent="true"');
                    }
                    if (isFirst) {
                        s.Append(' class="ths" ');
                    }
                    s.Append('>');
                    if (is_subclass) {
                        s.Append('<label>' + name + '</label>');
                    } else {
                        if (isSigle) {
                            s.Append('<input type="radio" class="chb" name="" ');
                        } else {
                            s.Append('<input type="checkbox"  class="chb" name="" ');
                        }
                        if (isdisabled) {
                            s.Append('disabled="disabled"');
                            if (!self.isSingle()) {
                                s.Append(' checked="checked"');
                            }
                        } else if (isChecked) {
                            s.Append(' checked="checked"');
                        }
                        if (!isShowControl) {
                            s.Append(' style="display:none;"');
                        }

                        s.Append(' />');
                        if (isParent) {
                            s.Append('<label>全部(' + name + ')</label>');
                        } else {
                            s.Append('<label>' + name + '</label>');
                        }
                    }
                    s.Append('</li>');
                    return s.toString();
                };
            if (self.currLevel >= self.options.unLimitedLevel) { // 是否在子类中显示当前类
                var isdisabled = false;
                if (self.currLevel == 3) {
                    isdisabled = self.isExists(pid, false);//自己是否选中
                    if (!isdisabled) {
                        isdisabled = self.isExists(pid);
                    } else {
                        isdisabled = false;
                    }
                }
                arr.push(createItem(isSingle, pid, pid, pname, isdisabled, self.isExists(pid), true, true, true));
            }

            if (self.currLevel == 1) {
                // 一级职位类别
                $.each(data, function (i, n) {
                    arr.push('<li d="' + n[self.options.data_key] + '{|}' + n[self.options.data_name] + '"><label>' + n[self.options.data_name] + '</label></li>');
                });
                self.dh.find('.lst1 ul').empty().html(arr.join(''));
            } else if (self.currLevel == 2) {
                self.dh.find('.lst2 ul').empty();
                self.dh.find('.lst3 ul').empty();
                var bool = false;
                $.each(data, function (i, n) {
                    bool = true;
                    var item = createItem(isSingle, pid, n[self.options.data_key], n[self.options.data_name], self.isExists(pid), self.isExists(n[self.options.data_key]), false, false, true, self.options.level == 3);
                    arr.push(item);
                });
                if (bool) {
                    self.dh.find('.lst2 ul').html(arr.join(''));
                }
            } else {
                self.dh.find('.lst3 ul').empty();
                var bool = false;
                $.each(data, function (i, n) {
                    bool = true;
                    var item = createItem(isSingle, pid, n[self.options.data_key], n[self.options.data_name], self.isExists(pid), self.isExists(n[self.options.data_key]), false, false, true);
                    arr.push(item);
                });
                if (bool) {
                    self.dh.find('.lst3 ul').html(arr.join(''));
                }
            }
        };

        this.setControl = function (data, is_one) {
            $.each(data, function (i, n) {
                self.lastSelectItem[0] = n[self.options.data_key];
                self.lastSelectItem[1] = n[self.options.data_name];
                self.lastSelectItem[2] = n[self.options.parent_id] ? n[self.options.parent_id] : n[self.options.data_key];
                self.checkItem(true, is_one);
            });
        };
        this.reset = function () {
            self.options.selectItems = [];
            // this.hc.find('.lst2 ul li').remove();
            // this.hc.find('.lst3 ul li').remove();
            this.hc.find('input[type="checkbox"],input[type="radio"]').removeAttr('checked').removeAttr('disabled');
            this.hd.find('.seled').remove();
            this.$element.find('input[name="' + this.options.hddName + '"]').val(' ');
        };

        // 设置值
        this.setValue = function (items) {
            var values = items.split(','),
                newArr = new Array(),
                isSingle = self.isSingle();
            if (isSingle) {
                var MultipleSelecturl = self.options.multipleUrl + items;
                self.loadData(MultipleSelecturl, self.setControl);
            } else {
                for (var i = 0, len = values.length; i < len; i += 1) {
                    if (!self.isExists(values[i])) {
                        //self.options.selectItems.push(values[i]);
                        newArr.push(values[i]);
                    }
                }
                if (newArr.length > 0) {
                    var MultipleSelecturl = self.options.multipleUrl + newArr.join(',');
                    self.loadData(MultipleSelecturl, self.setControl);
                }
            }
        };

        // 获取数据
        this.getValue = function () {
            var v = new Array();
            this.hd.find('.seled').each(function () {
                var area = $(this).attr('d');
                v.push(area);
            });
            return v;
        };

        $('body').click(function (e) {
            // 检测发生在body中的点击事件，隐藏日历控件
            var cell = $(e.target);
            if (cell) {
                var tgID = $(cell).attr('id') == '' ? "string" : $(cell).attr('id');
                var inID = self.$element.attr('id');
                var isTagert = false;
                try {
                    // 如果事件触发元素不是Input元素 并且不是发生在时间控件区域
                    isTagert = tgID != inID && $(cell).closest('#' + inID).length <= 0;
                } catch (e) {
                    isTagert = true;
                }
                if (isTagert) {
                    self.dh.hide();
                }
            }
        });
    };

    var old = $.fn.MultipleSelect;

    $.fn.MultipleSelect = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.MultipleSelect');
            var options = typeof option == 'object' && option;
            if (!data) {
                $this.data('bs.MultipleSelect', (data = new MultipleSelect(this, options)));
                data.show();
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };
    $.fn.setMultipleSelectValue = function (ids) {
        var multipleSelect = $(this).data('bs.MultipleSelect');
        multipleSelect.setValue(ids);
    };

    $.fn.getMultipleSelectValue = function () {
        var multipleSelect = $(this).data('bs.MultipleSelect');
        return multipleSelect.getValue();
    };
    $.fn.resetMultipleSelectValue = function () {
        var MultipleSelect = $(this).data('bs.MultipleSelect');
        MultipleSelect.reset();
    };
    $.fn.MultipleSelect.Constructor = MultipleSelect;
    // 解决冲突
    $.fn.MultipleSelect.noConflict = function () {
        $.fn.MultipleSelect = old;
        return this;
    };
})(jQuery);