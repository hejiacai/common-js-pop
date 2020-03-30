
var __activity = [{"id":"0100","parentID":"","name":"法律管理","subActivitys":[{"id":"0101","parentID":"0100","name":"劳动法"},{"id":"0102","parentID":"0100","name":"社会保险法"},{"id":"0103","parentID":"0100","name":"其他"}]},{"id":"0200","parentID":"","name":"职位管理","subActivitys":[{"id":"0201","parentID":"0200","name":"时间管理"},{"id":"0202","parentID":"0200","name":"礼仪形象"},{"id":"0203","parentID":"0200","name":"沟通技巧"},{"id":"0204","parentID":"0200","name":"会议管理"},{"id":"0205","parentID":"0200","name":"办公技能"},{"id":"0206","parentID":"0200","name":"职场健康"},{"id":"0207","parentID":"0200","name":"其他"}]},{"id":"0300","parentID":"","name":"企业管理","subActivitys":[{"id":"0301","parentID":"0300","name":"领导力"},{"id":"0302","parentID":"0300","name":"战略管理"},{"id":"0303","parentID":"0300","name":"企业文化"},{"id":"0304","parentID":"0300","name":"其他"}]},{"id":"0400","parentID":"","name":"人力资源","subActivitys":[{"id":"0401","parentID":"0400","name":"人力资源规划"},{"id":"0402","parentID":"0400","name":"招聘面试"},{"id":"0403","parentID":"0400","name":"培训发展"},{"id":"0404","parentID":"0400","name":"绩效管理"},{"id":"0405","parentID":"0400","name":"薪资福利"},{"id":"0406","parentID":"0400","name":"员工管理"},{"id":"0407","parentID":"0400","name":"其他"}]}];
function getActivityLevel(id)
{
    var arr = new Array();
    if (id == '' || typeof id == 'undefined') return [];
    if (/\d{2}00/.test(id) && id.length==4) return [id];
    arr.push(id.substr(0, 2) + '00');
    if(id.length==6)arr.push(id.substr(0, 4));
    arr.push(id);
    return arr;
}
function getActivity(id)
{
    var level = getActivityLevel(id);
    var l = __activity;
    var activity = null;
    for (var i in level)
    {
        var id = level[i];
        for (var j in l)
        {
            if (l[j].id == id)
            {
                activity = l[j];
                l = l[j].subActivitys;
                break;
            }
        }
    }
    return activity;
}
function getActivityName(id)
{
    var activity = getActivity(id);
    if (activity){
        return activity.name;
    }else{
        return '';
    }
}

function getSubActivitys(id)
{
    id = id || '';
    if (id == '') return __activity;
    var activity = getActivity(id);
    if (activity && activity.subActivitys)
    {
        return activity.subActivitys;
    } else
    {
        return [];
    }
}

(function activity($)
{
    var list = new Array();
    $.fn.addSelect = function(activity, value)
    {
        var opt = this.data('option');
        var con = this.parent().find('#_selectContainer');
        var sel = $('<select '+(opt.style||'')+'>');
        if (opt.headerText)
        {
            sel.append($("<option></option>").val('').html(opt.headerText));
        }
        for (var i in activity)
        {
            sel.append($("<option></option>").val(activity[i].id).html(activity[i].name));
        }
        con.append(sel);
        sel.val(value);
        sel.data('activity', this); //this:������
        sel.change(function()
        {
            var el = $(this); //this:��-��
            var hid = el.data('activity');
            hid.activity(el.val());
            var opt = hid.data('option');
            if (opt.onchange)
            {
                try
                {
                    eval(opt.onchange);
                } catch (e) { }
            }
        });
        return sel.val();
    }

    $.fn.activity = function(activityID)
    {
        if (typeof activityID != 'undefined')
        {
            this.initActivity(activityID);
            return this;
        }
        return this.val();
    }

    $.fn.activityName = function()
    {
        return this.getSelectedActivity().selectedText();
    }

    $.fn.getSelectedActivity = function()
    {
        var sel = null;
        this.parent().find('#_selectContainer').find('select').each(function()
        {
            if (!sel)
            {
                sel = this;
            } else if ($(this).val() != '')
            {
                sel = this;
            }
        });
        return $(sel);
    }

    $.fn.clearActivity = function()
    {
        this.parent().find('#_selectContainer').empty();
    }

    $.fn.initActivity = function(activityID, options)
    {
        var opt = options || {};
        if (options) this.data('option', opt);
        this.clearActivity(); //���
        var topActivity = getSubActivitys(); //getSubArea(); 
        var val = activityID; 
        if (val)
        {
            var level = getActivityLevel(val); //����id����
            for (var i = 0; i < level.length; i++)
            {
                if (i == 0)
                {
                    this.addSelect(topActivity, level[i]);
                } else
                {
                    var subActivity = getSubActivitys(level[i - 1]);
                    this.addSelect(subActivity, level[i]);
                }
            }
            var lastLevel = getSubActivitys(level[level.length - 1]);
            while (lastLevel.length > 0)
            {
                var val = this.addSelect(lastLevel, '');
                if (val == '') break;
                lastLevel = getSubActivitys(val);
            }

        } else
        {
            this.addSelect(topActivity, '');
        }
        this.val(this.getSelectedActivity().val());
    }
})(jQuery);


