hbjs.config({
	basepath: window.CONFIG.HOST + window.CONFIG.COMBOPATH,
	comboHost: window.CONFIG.HOST + '/min/?f=',
	comboPath: window.CONFIG.COMBOPATH,
	normailzeNames: window.VERSION,
	charset: window.CONFIG.CHARSET,
	combos: {
		'@css3': 'module.css3',
		'@promise': 'module.promise',
		'@changeClass':'widge.changeClass',
		'@checkBoxer':'widge.checkBoxer',
		'@fixed': 'tools.fixed',
		'@position': 'tools.position',
		'@input': 'widge.input',
		'@dateFormat': 'tools.dateFormat',
		'@iframe': [
			'tools.iframe', 'tools.position'
		],
		'@drag': 'tools.drag',
		'@sortable': ['@drag', 'widge.sortable'],
		'@resize': 'tools.resize',
		'@imgLoader': 'tools.imgLoader',
		'@fileUploader': 'widge.fileUploader',
		'@imageCrop': [
			'@imgLoader', '@drag', '@resize', 'widge.imageCrop'
		],
		'@imageEditor': [
			'@imageCrop', '@fileUploader', 'widge.imageEditor'
		],
		'@dataSource': 'module.dataSource',
		'@popup': [
			'@css3','@iframe','widge.popup'
		],
		'@tabs': [
			'widge.tabs', '@changeClass'
		],
		'@mask': [
			'@popup', 'widge.overlay.mask'
		],
		'@select': [
			'@popup', '@dataSource', 'widge.select'
		],
		'@multipleSelect': [
			'@select', '@checkBoxer', 'widge.multipleSelect'
		],
		'@dialog': [
			'@mask', 'widge.overlay.hbDialog', 'base.event', 'tools.fixed'
		],
		'@confirmBox': [
			'@dialog', 'widge.overlay.confirmBox'
		],
		'@hoverDir': [
			'@css3', 'widge.hoverDir'
		],
		'@basePage': [
			'@css3', 'widge.switchable.basePage'
		],
		'@snapPage': [
			'@basePage', 'widge.switchable.snapPage'
		],
		'@slidePage': [
			'@basePage', 'widge.switchable.slidePage'
		],
		'@areaDrop': [
			'@popup', 'product.areaDrop'
		],
		'@areaSelecter': 'product.areaSelecter',
		'@checkLogin': [
			'@dialog', 'product.checkLogin'
		],
		'@orderActions': [
			'@confirmBox', 'product.orderActions'
		],
		'@textPlaceHolder': [
			'@input', 'widge.textPlaceHolder'
		],
		'@autoComplete': [
			'@popup', '@dataSource', '@textPlaceHolder', 'widge.autoComplete.search', 'widge.autoComplete.filter'
		],
		'@search': [
			'@select', '@textPlaceHolder', '@confirmBox',
			'product.jobSearch.jobTopSearch', 'product.jobSearch.search', 
			'widge.autoComplete.search', 'widge.autoComplete.filter'
		],
		'@searchv2': [
			'@tabs', '@changeClass', '@textPlaceHolder', '@confirmBox',
			'product.jobSearch.jobTopSearchV2', 'product.jobSearch.search', 
			'widge.autoComplete.search', 'widge.autoComplete.filter'
		],
		'@receiveMailDialog': [
			'@confirmBox', '@dataSource', 'product.mail.receiveMailDialog'
		],
		'@emailTip': [
			'@autoComplete', 'product.emailTip'
		],
		'@verifier': 'module.verifier',
		'@validator': [
			'@verifier', '@dataSource', 'widge.validator.rule', 'widge.validator.item',
			'widge.validator.handler', 'widge.validator.form'
		],
		'@calendar': [
			'@dateFormat', '@iframe', 'widge.calendar.baseCalendar', 'widge.calendar.calendar',
			'widge.calendar.dateColumn', 'widge.calendar.monthColumn', 'widge.calendar.yearColumn'
		],
		'@comboBoxer': [
			'@dataSource', 'widge.combobox.comboBoxer', 'widge.combobox.simpleComboBox',
			'widge.combobox.comboBoxBase', 'widge.combobox.comboBoxActions'
		],
		'@jobListSelecter': [
			'@dialog', 'product.xiake.jobListSelecter'
		],
		'@jobSorter':[
			'@confirmBox', '@autoComplete', 'product.jobSort.jobSorter', 
			'product.jobSort.jobSortDialog', 'product.jobSort.jobSortSearch', 
			'product.jobSort.jobSortMenu'
		],
		'@templateSaver': [
			'@popup', '@dataSource', 'product.xiake.templateSaver'
		],
		'@templateSelecter': [
			'@popup', '@dataSource', 'product.xiake.templateSelecter'
		],
		'@hbCommon': 'product.hbCommon',
		'@actions': 'cqjob.actions',
		'@jobAutocomplete': 'cqjob.autocomplete',
		'@homeHead': [
			'@jobAutocomplete', 'cqjob.homeHead', 'cqjob.jobCookie'
		],
		'@mscroll': 'mobile.mscroll',
		'@msnap': ['@mscroll', 'mobile.msnap'],
		'@mobilePopup': [
			'@css3', '@mask', 'mobile.mobilePopup'
		],
		'@mobileSelecter': [
			'@dataSource', '@mobilePopup', 'mobile.mobileSelecter'
		],
		'@mobilePicker': [
			'@dataSource', '@mobilePopup', 'mobile.picker.mobilePicker'
		],
		'@mobileGroupPicker': [
			'@mobilePicker', 'mobile.picker.mobileGroupPicker'
		],
		'@mobileDatetimePicker': [
			'@mobilePicker', 'mobile.picker.mobileDatetimePicker'
		],
		'@mobileRangePicker': [
			'@mobilePicker', 'mobile.picker.mobileRangePicker'
		],
		'@imgRotational': [
			'widge.imgRotational'
		],
		'@areaMulitiple': 'cqjob.areaMulitiple',
		'@jobDropList': 'cqjob.jobDropList',
		'@jobCertificate': 'cqjob.jobCertificate',
		'@jobFlexSlider': 'cqjob.jobFlexSlider',
		'@jobSkill': 'cqjob.jobSkill',
		'@jobDialog': 'cqjob.jobDialog',
		'@jobTooltip': 'cqjob.jobTooltip',
		'@jobsort': [
			'@jobDialog', 'cqjob.jobsort'
		],
		'@jobsort2': [
			'@jobDialog', 'cqjob.jobsort2'
		],
		'@calling': [
			'@jobDialog', 'cqjob.calling'
		],
		'@jobDater': 'cqjob.jobDater',
		'@areaSimple': 'cqjob.areaSimple',
		'@areaPersonSimple': 'cqjob.areaPersonSimple',
		'@jobPrettyPhoto': 'cqjob.jobPrettyPhoto',
		'@uploadify': 'uploadify',
		'@form': [
			'cqjob.jobValidate', 'cqjob.jobForm'
		],
		'@fancybox': [
			'cqjob.fancybox'
		],
		'@fancyboxThumbs': [
			'@fancybox', 'cqjob.fancybox-thumbs'
		],
		'@jobLazyload': 'cqjob.jobLazyload',
		'@jobSlides': 'cqjob.jobSlides',
		'@indexJobsort': [
			'@actions', 'cqjob.indexJobsort'
		],
		'@jplayer': 'cqjob.jplayer.jplayerv2',
		'@mixSelecter': [
			'@popup', '@dataSource', 'product.mixSelecter'
		]
	}
});