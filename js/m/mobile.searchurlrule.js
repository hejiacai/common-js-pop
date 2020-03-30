/**
 * 
 * 地区搜索规则
 * @author Admin
 * @Desc  
 * 分页信息：p+页码
 * 职位类别格式：a+职位编号，多选时a+职位编号，职位编号
 * 地区格式：  单选 
		     * 重庆内:  目录	
		     * 非重庆: b+地区编号
	    * 多选
		    * b+地区编号，地区编号
 * 行业格式： 单选  c+行业编号，多选  c+行业编号，行业编号
 * 福利格式:   单选 	d+福利编号，多选 d+福利编号，福利编号
 * 薪资格式:   单选  e+薪资编号，多选  e+薪资编号，薪资编号
 * 岗位级别格式  单选 f+岗位级别编号，多选 f+岗位级别编号，岗位级别编号
 * 公司性质格式:  单选 g+性质编号， 多选 g+性质编号，性质编号
 * 公司规模:       单选 h+规模编号， 多选 h+规模编号，规模编号
 * 学历要求:        单选 i+学历要求， 多选  i+学历要求，学历要求
 * 工作经验：      单选j+经验编号，  多选 j+工作经验编号,工作经验编号
 * 工作类型:       单选k+类型编号，多选  k+类型编号，类型编号
 * 刷新时间：    单选l+刷新时间编号 ，没错，这就是刷新时间
 * 发布时间：    单选z+发布时间编号
 * 显示数据类别：  m+类别
 * 更新时间排序: n+是否排序（1,0）
 * 发布时间排序: o+是否排序（1,0）
 * 薪资待遇排序: p+是否排序（1,0）
 * 显示直招: k+是否排序（1,0）
 * 隐藏投递: u+是否排序（1,0）
 * 合并公司: r+是否排序（1,0）
 * 
 * k=keyword
 * 查询关键字
 * v=其他筛选条件
     * 提交多选的删选条件的	
 * 热词、职位类别、地区管理：
 * 地区 目录不能重复，并且与（职位类别，热词）也不能重复
 * 职位类别目录重复，并且与地区不能重复
 * 热词目录重复，并且与地区不能重复
 * （包含已有重写链接也不能重复）
 *
 */
var urlrule = {
     bindForm:"",//绑定表单
     baseurl:'http://m.huibo.com/',//根url
     file:'',//访问目录 前缀不需要/ 后缀需要/
     backurl:'',
     params:"",
     separator:'_',
     min_salary:'',//最小薪资
     keyword:'',//关键字
     searchFrom:'',
    init:function(bindFrom,file,baseurl){
        //todo 上传去掉注释
        //baseurl = 'http://192.168.2.26:85/';

        this.bindForm = bindFrom;
        //判断根url 中是否已/结尾  若不是着加上/
        if(baseurl!="" && typeof(baseurl) !="undefined"){
            if((baseurl.length-1) != baseurl.lastIndexOf("/")){
                baseurl = baseurl+"/";
            }
            this.baseurl = baseurl ;
        }
        this.file = file;
        this.bindData();
        var backurl = this.backurl;
        this.destroy();
        return backurl;
    },
    bindData:function(){
        var jsonData = $(this.bindForm).serializeArray();
        this.backurl = this.baseurl;
        var _this = this;
        for(var d=0;d<jsonData.length;d++){
            var name = jsonData[d].name;
            var value = jsonData[d].value;
            var params = "";
            switch(name){
                case 'txtKeyword':
                    _this.keyword = value;
                    break;
                break;
                case 'area':
                    _this.bindArea(value);
                   
                    break;
                case 'jobsort':
                    _this.bindJobSort(value);
                    break;
                case 'calling_ids'://行业
                    _this.bindMoreValue(value,"c"); 
                    break;
                case 'com_rewards'://福利
                     _this.bindMoreValue(value,"d");
                     break;
                case 'area_top':
                    _this.bindMoreValue(value ,"q");
                    break;
                 //case 'hidSalary': //新版薪资筛选
                 //   _this.bindMoreValue(value,"e");
                 //   break;
                case 'salary_min': //新版薪资筛选
                    _this.bindMoreValue(value,"e");
                    break;
                case 'salary_max': //新版薪资筛选
                    _this.bindMoreValue(value,"e");
                    break;
                //case 'salary_min':
                //     _this.min_salary = value;
                //     break;
                //case 'salary_max':
                //    _this.bindSalaryValue(value,'e');
                //    break;
                case 'property'://公司性质
                    _this.bindMoreValue(value,"g");
                    break;
                case 'com_size'://公司规模
                    _this.bindMoreValue(value,'h');
                    break;
                case 'workyear'://工作经验
                    _this.bindMoreValue(value,'j');
                    break;
                case 'issuetime'://刷新时间
                    _this.bindMoreValue(value,'l');
                    break;

                case 'pub_days'://发布时间
                    _this.bindMoreValue(value,'z');
                    break;
                case "reApplyType": //简历必回
                    _this.bindMoreValue(value,"m");
                    break;
                case "hight_repaly": //回复率高
                    _this.bindMoreValue(value,"n");
                    break;
                case "urgent": //急聘
                    _this.bindMoreValue(value,"m");
                    break;
                case "famous_c": //名企
                    _this.bindMoreValue(value,"m");
                    break;
                case "no_peixun": //不可培训机构
                    _this.bindMoreValue(value,"m");
                    break;
                case "no_daizhao_zj": //不看中介代招
                    _this.bindMoreValue(value,"m");
                    break;
                case "allow_talk":
					_this.bindMoreValue(value,"m");
                    break;
                case "study_lev": //学历
                    _this.bindMoreValue(value,"i");
                    break;


                case 'sorttype'://排序
                    _this.bindSortType(value,'n');
                    break;
                case 'searchtype':
                    _this.bindSearchType(value,'u');
                    break;
                case 'searchfrom':
                    _this.searchFrom = value;
                    break;
					
					
					// 地铁
				case 'subway':
					_this.bindMoreValue(value,"w");
					break;
            }
        }
        var a = [];
        if(this.params !=''){
         a.push("p");
        }
        if(this.keyword !=""){
            a.push("k");
        }
       if(this.searchFrom !=''){
           a.push('s');
       }
        if(a.length>0){
            var hrefend = "";
            var f = this.file;
            for(var n=0;n<a.length;n++){
               switch(a[n]){
                   case "k":
                       if(hrefend.indexOf("?") <0){
                           hrefend = hrefend + "?key="+_this.keyword;
                       }else{
                           hrefend = hrefend + "&key="+_this.keyword;
                       }
                       break;
                   case "p":
                       if(f=="search/searchdo/"){
                            if(hrefend.indexOf("?")<0){
                                hrefend = hrefend + "?params="+_this.params;
                            }else{
                                hrefend = hrefend + "&params="+_this.params;
                            }
                        }else{
                            this.file = this.file+this.params+"/";
                        }
                       break;
                   case 's':
                      if(hrefend.indexOf("?") <0){
                           hrefend = hrefend + "?searchfrom="+_this.searchFrom;
                       }else{
                           hrefend = hrefend + "&searchfrom="+_this.searchFrom;
                       }
                       break;
               }
            }
         this.backurl = this.backurl+this.file+hrefend;
        }else{
            this.backurl = this.backurl+this.file;
        }
    },
    //排序
    bindSortType:function(value,param){
        if(value=='1' || value==''){
            return;
        }
        this.params = this.params+param+value;
        
    },
    //搜索方式
    bindSearchType:function(value,param){
        if(value=='job' || value==''){
            return;
        }
        this.params = this.params+param+value;
    },
    //生成地区的链接
    bindArea:function(area){
        if(area ==''){
            return;
        }
        var area_array = area.split(',');
        for(var i = 0;i<area_array.length;i++){
            if(area_array[i].indexOf("d")==0){
                area_array[i] = area_array[i].replace(/d/,'');
            }
        }
        
        this.params = this.params+"b"+area_array.join(this.separator);
    },
    //生成职位类别的链接
    bindJobSort:function(jobsort){
        if(jobsort==""){
            return;
        }
        //如果职位类别不为空 则 清空目录 链接保留为根目录
       this.file = jobsort+"/";
    },
    bindMoreValue:function(values,param){
        if(values ==''){
            return;
        }
        var values_array = values.split(',');
        var perg_str =  new RegExp(param +'[0-9_]+','i');
        if(perg_str.test(this.params))
        {
            var _str = this.params;
            this.params =  this.params.replace(perg_str,function(world){
                for(var i = 0;i <values_array.length;i++){
                    var perg_2 =  new RegExp(values_array[i],'i');
                    if(!perg_2.test(world)){
                        world = world + "_" + values_array[i];
                    }
                }
                //return world + '_' + values_array.join('_');
                return world;
            });
        }else{
            this.params = this.params+param+values_array.join(this.separator);
        }

    },
    //绑定薪资数据
    bindSalaryValue:function(value,param){
        if(this.min_salary =="" && value==""){
            return;
        }
        this.params = this.params+param+this.min_salary+this.separator+value;
    },
    destroy:function(){
        this.file = "";
        this.backurl='';
        this.params="";
        this.min_salary='';//最小薪资
        this.keyword='';//关键字
    }
}