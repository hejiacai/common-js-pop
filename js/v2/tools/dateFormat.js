// JavaScript Document

define('tools.dateFormat', function(require, exports){
	
	var util = require('base.util'),
		dateRegExp = /([yMdHms])(\1*)/g,
		dateFormatReg = 'yyyy-MM-dd',
		timeFormatReg = 'HH:mm:ss',
		comboFormatReg = dateFormatReg + ' ' + timeFormatReg,
		hasOwnProp = Object.prototype.hasOwnProperty,
		cloneDate = function(pDate, callback){
			var vDate = new Date(pDate.getTime()),
				year = vDate.getFullYear(),
				month = vDate.getMonth(),
				date = vDate.getDate(),
				hours = vDate.getHours(),
				minutes = vDate.getMinutes(),
				seconds = vDate.getSeconds();
			callback && callback(vDate, year, month, date, hours, minutes, seconds);
			return vDate;
		},
		parseDate = function(dateString, pattern){
			try{
				var matchs1 = (pattern || (dateString.length === 10 ? dateFormatReg : comboFormatReg)).match(dateRegExp),
					matchs2 = dateString.match(/(\d)+/g);
				var d = new Date();
				for (var i = 0; i < matchs1.length; i++) {
					var j = parseInt(matchs2[i], 10);
					if(matchs2[i]){
						switch (matchs1[i].charAt(0) || '') {
							case 'y':
								d.setFullYear(j || d.getFullYear());
								break;
							case 'M' :
								j = j - 1;
								d.setMonth(util.type.isNumber(j) ? j : d.getMonth());
								break;
							case 'd' :
								d.setDate(j || d.getDate());
								break;
							case 'H' :
								d.setHours(j || d.getHours());
								break;
							case 'm' :
								d.setMinutes(j || d.getMinutes());
								break;
							case 's' :
								d.setSeconds(j || d.getSeconds());
								break;
							default :
								break;
						}
					}
				}
				return d;
			} catch (ex) {
				throw new Error('tools.dateFormat: Time Conf Incorrect');
			}
		},
		formatDate = (function() {
			function padding(s, len) {
				var len = len - (s + "").length;
				for (var i = 0; i < len; i++) {
					s = "0" + s;
				}
				return s;
			}
			return function(value, pattern){
				if (!util.type.isDate(value)) {
					return '';
				}
				try {
					pattern = pattern || comboFormatReg;
					return pattern.replace(dateRegExp, function(all) {
						switch (all.charAt(0)) {
							case 'y' :
								return padding(value.getFullYear(), all.length);
							case 'M' :
								return padding(value.getMonth() + 1, all.length);
							case 'd' :
								return padding(value.getDate(), all.length);
							case 'w' :
								return value.getDay() + 1;
							case 'H' :
								return padding(value.getHours(), all.length);
							case 'm' :
								return padding(value.getMinutes(), all.length);
							case 's' :
								return padding(value.getSeconds(), all.length);
							default :
								return '';
						}
					});
				} catch (ex){
					return '';
				}
				return null;
			}
		})(),
		getActualMaximum = function(date) {
			var vDate = new Date(date.getTime());
			vDate.setMonth(vDate.getMonth() + 1);
			vDate.setDate(0);
			return vDate.getDate();
		},
		dateFormat = function() {
			var p0 = arguments[0],
				p1 = arguments[1];
			if (util.type.isNumber(p0)) {
				this.vDate = new Date(p0);
			} else if (util.type.isDate(p0)) {
				this.vDate = new Date(p0.getTime());
			} else if (util.type.isString(p0)) {
				if (util.type.isString(p1) || typeof p1 === 'undefined') {
					this.vDate = parseDate(p0, p1);
				}
			} else if (arguments.length == 0) {
				this.vDate = new Date();
			} else {
				throw new Error('tools.dateFormat: Unable To Create Time Object');
			}
		};
		
	dateFormat.isDate = function(obj){
		return obj instanceof dateFormat || (obj != null && hasOwnProp.call(obj, 'plusYear'));
	}
	dateFormat.prototype = {
		__className: 'dateFormat',
		plusYear : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setFullYear(year + value);
			}));
		},
		plusMonth : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setMonth(month + value);
			}));
		},
		plusDate : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setDate(date + value);
			}));
		},
		plusHours : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setHours(hours + value);
			}));
		},
		plusMinutes : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setMinutes(minutes + value);
			}));
		},
		plusSeconds : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setSeconds(seconds + value);
			}));
		},
		minusYear : function(value) {
			return this.plusYear(-value);
		},
		minusMonth : function(value) {
			return this.plusMonth(-value);
		},
		minusDate : function(value) {
			return this.plusDate(-value);
		},
		minusHours : function(value) {
			return this.plusHours(-value);
		},
		minusMinutes : function(value) {
			return this.plusMinutes(-value);
		},
		minusSeconds : function(value) {
			return this.plusSeconds(-value);
		},
		setYear : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setFullYear(value);
			}));
		},
		setMonth : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setMonth(value);
			}));
		},
		setDate : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setDate(value);
			}));
		},
		setHours : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setHours(value);
			}));
		},
		setMinutes : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setMinutes(value);
			}));
		},
		setSeconds : function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setSeconds(value);
			}));
		},
		setMillisecond: function(value) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				vDate.setMilliseconds(value);
			}));
		},
		getYear : function() {
			return this.vDate.getFullYear();
		},
		getMonth : function() {
			return this.vDate.getMonth();
		},
		getDate : function() {
			return this.vDate.getDate();
		},
		getHours : function() {
			return this.vDate.getHours();
		},
		getMinutes : function() {
			return this.vDate.getMinutes();
		},
		getSeconds : function() {
			return this.vDate.getSeconds();
		},
		getMilliseconds: function() {
			return this.vDate.getMilliseconds();
		},
		getDay : function() {
			return this.vDate.getDay();
		},
		toDate : function() {
			return cloneDate(this.vDate);
		},
		clone : function() {
			return new dateFormat(cloneDate(this.vDate));
		},
		getBegin : function(field) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				switch (field) {
					case 'yyyy' ://year
						vDate.setMonth(0);
						vDate.setDate(1);
						vDate.setHours(0);
						vDate.setMinutes(0);
						vDate.setSeconds(0);
						vDate.setMilliseconds(0);
						break;
					case 'MM' ://month
						vDate.setDate(1);
						vDate.setHours(0);
						vDate.setMinutes(0);
						vDate.setSeconds(0);
						vDate.setMilliseconds(0);
					case 'dd' ://date
						vDate.setHours(0);
						vDate.setMinutes(0);
						vDate.setSeconds(0);
						vDate.setMilliseconds(0);
						break;
					default :
						//Ignore
				}
			}));
		},
		getEnd: function(field) {
			return new dateFormat(cloneDate(this.vDate, function(vDate, year, month, date, hours, minutes, seconds) {
				switch (field) {
					case 'yyyy' :
						vDate.setMonth(11);
						vDate.setDate(31);
						vDate.setHours(23);
						vDate.setMinutes(59);
						vDate.setSeconds(59);
						vDate.setMilliseconds(999);
						break;
					case 'MM' :
						vDate.setDate(getActualMaximum(vDate));
						vDate.setHours(23);
						vDate.setMinutes(59);
						vDate.setSeconds(59);
						vDate.setMilliseconds(999);
					case 'dd' :
						vDate.setHours(23);
						vDate.setMinutes(59);
						vDate.setSeconds(59);
						vDate.setMilliseconds(999);
						break;
					default :
						//Ignore
				}
			}));
		},
		toString: function(pattern) {
			return formatDate(this.vDate, pattern);
		},
		diffMonth: function(end){
			end = end.replace(/-/g, '/');
			
			var dateSplit = end.split('/');
			for(var i = 0, len = dateSplit.length; i < len; i++){
				if(!parseInt(dateSplit[i])){
					return '';
				}
			}
			
			var date = new Date(end);
			if(isNaN(date.getTime())){
				return '';
			}
			end = new dateFormat(formatDate(date, 'yyyy-MM-dd'));
			var endMonth = end.getMonth() + 1,
				endYear = end.getYear() * 12,
				startMonth = this.getMonth() + 1,
				startYear = this.getYear() * 12,
				diffMonth = (startYear + startMonth) - (endYear + endMonth);
			return diffMonth;
		}
	};
	return dateFormat;
	
});