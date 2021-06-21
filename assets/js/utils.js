
let Crypto = require('cryptojs/cryptojs.js').Crypto;

const http = function(req) {
	let version=wx.c.app_version;
	let source=wx.c.appId;
	let guid=getUUID();
	let timestamp = Date.parse(new Date());//毫秒
	let postsign = Crypto.MD5(version+source+guid+timestamp+wx.c.signKey);
	let contentType = req.header  ? 'application/json;charset=utf-8' : 'application/x-www-form-urlencoded;charset=utf-8';
	let header = {
		'content-type': contentType,
		'version':version,
		'source':source,
		'guid':guid,
		'timestamp':timestamp,
		'postsign':postsign
	};
	console.log(header);
	return new Promise(function(resolve, reject) {
		wx.request({
			url: req.url || '',
			method: req.method || 'GET',
			data: req.data || {},
			header: header,
			success: function(res) {
				resolve(res.data);
			},
			fail: function(err) {
				reject(err);
			}
		});
	});
}

const getStorageSync = (key) => {
	return wx.getStorageSync(wx.c.cacheVersion + "_" + key);
}

const setStorageSync = (key, data) => {
	return wx.setStorageSync(wx.c.cacheVersion + "_" + key, data);
}

const removeStorageSync = (key) => {
	return wx.removeStorageSync(wx.c.cacheVersion + "_" + key);
}

const showLoginPage = () => {
	wx.navigateTo({
		url: '/member/pages/login/login',
	})
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

const subMessage = (tmplIds,resolve,failfun) => {
	wx.requestSubscribeMessage({
		tmplIds: tmplIds,
		success(res) {
			resolve();
		},
		fail(res){
			failfun();
		}
	})
}
const getUUID = function () {
	var s = [];      
	var hexDigits = "0123456789abcdef";      
	for (var i = 0; i < 36; i++) {      
	  s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);      
	}      
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010      
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01      
	s[8] = s[13] = s[18] = s[23] = "-";  
      
	var uuid = s.join("").replace(/-/gi,"");
      
	return uuid   
}

const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 根据日期格式进行转换

const dateFormat = function (number, format = 'Y-M-D') {
	var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
	var returnArr = [];
	let date = new Date(number);
	returnArr.push(date.getFullYear());
	returnArr.push(formatNumber(date.getMonth() + 1));
	returnArr.push(formatNumber(date.getDate()));
	returnArr.push(formatNumber(date.getHours()));
	returnArr.push(formatNumber(date.getMinutes()));
	returnArr.push(formatNumber(date.getSeconds()));
	for (var i in returnArr) {
		format = format.replace(formateArr[i], returnArr[i]);
	}
	return format;
}

// 获取当前时间
const getDataFn = function (n, fmt = 'Y-M-D', day) { //n为1表示一天，为30表示一个月  如果传了day获取day后面的n天的日期或者获取今天后面的第n天的日期day
	var nowdate = day ? new Date(day) : new Date();
	nowdate.setDate(nowdate.getDate() + n);
	var y = nowdate.getFullYear();
	var m = (nowdate.getMonth() + 1) < 10 ? "0" + (nowdate.getMonth() + 1) : (nowdate.getMonth() + 1);
	var d = nowdate.getDate() < 10 ? "0" + nowdate.getDate() : nowdate.getDate();
	var endDate = y + '-' + m + '-' + d;
	return {
		date: dateFormat(new Date(endDate).getTime(), fmt),
		timeStamp: new Date(endDate).getTime()
	}
}

// 转换成周几
const countWeek = function (dataString) {
	var Today = getDataFn(0).date; //今天的时间
	var Tomorrow = getDataFn(1).date; //明天的时间
	var after = getDataFn(2).date; //明天的时间
	var dataArr = dataString.split('-'); //日期为输入日期，格式为 2013-3-10
	var ssdate = new Date(dataArr[0], parseInt(dataArr[1] - 1), dataArr[2]);
	var week1 = String(ssdate.getDay()).replace("0", "日").replace("1", "一").replace("2", "二").replace("3", "三").replace("4", "四").replace("5", "五").replace("6", "六") //就是你要的星期几
	var week = "周" + week1; //就是你要的星期几
	week = dataString == Today ? '今天' : dataString == Tomorrow ? '明天' : dataString == after ? '后天' : week;
	return week;
}

// 节流;
const throttle = function (fn, delay) {
	let lastTime = 0
	return function () {
		let nowTime = Date.now()
		if (nowTime - lastTime > delay || !lastTime) {
			fn.apply(this, arguments)
			lastTime = nowTime
		}
	}
}

//获取定位的公共方法
const getCurrentLocation = {
	userLocation: function (key,multiple=false) {
		wx.getSetting({
			success: res => {
				if (res.authSetting["scope.userLocation"]) {
					this.loadLocationCity(key,multiple)
				} else {
					wx.getLocation({
						type: 'wgs84',
						complete:res=> {
							if(res.errMsg.indexOf('fail') != -1){
								wx.showModal({
									title: '提示',
									content: "检测到你还没打开地理位置权限，是否去开启",
									showCancel: true,
									success: e => {
										if (e.confirm) {
											wx.openSetting({
												success: settingRes => {
													if (settingRes.authSetting["scope.userLocation"]) {
														this.loadLocationCity(key,multiple)
													}
												}
											})
										}
									}
								})
							}
						}
					})
					
				}
			}
		})
	},
	//获取经纬度。后台通过经纬度拿地点
	loadLocationCity: function (key,multiple) {
		let locationData = {};
		wx.getLocation({
			type: 'wgs84',
			success: res => {
				const lat = res.latitude;
				const lng = res.longitude;
				//提供经纬度给后台查地点
				locationData = {
				  chnlType: wx.c.chnlType,
				  lat: res.latitude,
				  lng: res.longitude
				}
				if (locationData.lat && locationData.lng) {
				  wx.u.http({
				    url: wx.api.common.getCityByLocation,
				    data: locationData,
				    method: 'POST'
				  }).then(res => {
				    if (res.data && res.data.result == wx.c.OKresult) {
				      const cityResult = res.data.cityResult
					  const cityCode = res.data.cityCode
					  if(multiple){
						this.setData({
							sitename: cityResult,
							siteCode: cityCode,
							'selectedCity[0].sitename': cityResult
						  });
					  }else{
						this.setData({
							sitename: cityResult,
							siteCode: cityCode,
							'selectedCity.sitename': cityResult
						  });
					  }
				      
				    }
				  })
				}
			}
		})
	},
}

module.exports = {
	http: http,
	getStorageSync: getStorageSync,
	setStorageSync: setStorageSync,
	removeStorageSync: removeStorageSync,
	showLoginPage:showLoginPage,
	subMessage:subMessage,
	getUUID:getUUID,
	formatTime: formatTime,
	dateFormat: dateFormat,
	getDataFn: getDataFn,
	countWeek: countWeek,
	throttle: throttle,
	getCurrentLocation: getCurrentLocation,
}