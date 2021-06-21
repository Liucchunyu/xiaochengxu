// /member/pages/login/login.js
let WXBizDataCrypt = require('../../../assets/js/cryptojs/RdWXBizDataCrypt.js')
var Crypto = require('../../../assets/js/cryptojs/cryptojs.js').Crypto;
const login = require('../../../assets/js/userlogin');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isCustomer: true, //是否已注册商旅客户
		mobileBtnStatus: false,
		sessionKey: '',
		appId: '',
		unionId: '',
		openId: '',
		errorImage: 'http://paytest.ecwalk.com/static/images/mobileImages/avatar.jpg'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {

	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		let _that = this;
		login.wxAppLogin().then(res => {
			console.log("登录获取用户信息success", res);
			let {
				userId,
				isCustomer,
				mobileNo,
				openId,
				loginToken,
				unionId,
				appId
			} = res;
			let mobileBtnStatus = false;
			if (userId && mobileNo) {
				mobileBtnStatus = true; //隐藏登录按钮
			}
			_that.setData({
				openId: openId,
				unionId: unionId ? unionId : '',
				loginToken: loginToken,
				appId: appId,
				mobileBtnStatus: mobileBtnStatus,
				isCustomer: isCustomer == "1" ? true : false
			})
		}, err => {
			//获取不到用户信息，展示授权手机号码登录
			let {
				openId,
				loginToken,
				unionId,
				appId
			} = err;
			_that.setData({
				openId: openId,
				unionId: unionId ? unionId : '',
				loginToken: loginToken,
				appId: appId
			})
		})
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},
	//点击获取手机号码登录
	getPhone(e) {
		let _that = this
		if (e.detail.encryptedData && e.detail.iv) {
			let {
				appId,
				loginToken
			} = _that.data;
			if (appId && loginToken) {
				wx.showLoading({
					title: "正在登陆...",
					mask: true
				})
				//根据loginToken去获取sessionKey
				wx.u.http({
					"url": wx.api.member.getSessionKey,
					"method": "POST",
					"data": {
						loginToken: loginToken
					}
				}).then(res => {
					if (res.code == 200 && res.data) {
						let sessionKey = res.data.sessionKey;
						try {
							let pc = new WXBizDataCrypt(appId, sessionKey);
							let data = pc.decryptData(e.detail.encryptedData,e.detail.iv);
							console.log('解密出来的数据: ', data)
							console.log('微信绑定的手机号码: ', data.phoneNumber)
							_that.loginByMobile(data.phoneNumber, loginToken)
						} catch (error) {
							wx.hideLoading();
							login.clearToken();
							//重新去获取登录token
							_that.getLoginToken();
						}
					} else {
						//获取sessionKey失败或缓存过期
						wx.hideLoading();
						login.clearToken();
						//重新去获取登录token
						_that.getLoginToken();
					}
				});
			}
		}
	},

	//根据手机号码登录
	loginByMobile(mobileNo) {
		let _that = this
		let loginToken = _that.loginToken
		let loginData = {
			"mobileNo": mobileNo,
			"unionId": _that.data.unionId,
			"openId": _that.data.openId,
			"appId": _that.data.appId,
			"sign": Crypto.MD5(wx.c.signKey + mobileNo + _that.data.openId + _that.data.unionId),
			"channel": "bTrip"
		}
		wx.u.http({
			"header": {
				'content-type': 'application/json'
			},
			"url": wx.api.member.loginByMobile,
			"method": "POST",
			"data": JSON.stringify(loginData)
		}).then(res => {
			wx.hideLoading();
			console.log("=======手机登录结果=======", res)
			if (res.code == 200 && res.data) {
				let userExtend = res.data.userExtend;
				if (userExtend && userExtend.mobileNo) {
					userExtend.isCustomer = res.data.isCustomer;
					userExtend.accountCustomer = res.data.accountCustomer;//客户信息
					userExtend.loginToken = loginToken;
					_that.setLoginUserInfo(userExtend);
					_that.closeLoginPage();
				} else {
					wx.showModal({
						title: '提示',
						content: "登录失败，接口返回数据异常",
						showCancel: false
					})
				}
			} else {
				wx.showModal({
					title: '提示',
					content: res.message ? res.message : "登录失败",
					showCancel: false
				})
			}
		})
	},

	getLoginToken() {
		let _that = this;
		//重新去获取登录token
		login.wxAppLogin().then(res => {}, err => {
			let {
				openId,
				loginToken,
				unionId,
				appId
			} = err;
			_that.setData({
				openId: openId,
				unionId: unionId ? unionId : '',
				loginToken: loginToken,
				appId: appId
			})
			wx.showToast({
				title: '登录超时,请重新点击授权登录',
				icon: "none"
			})
		});
	},

	setLoginUserInfo(userExtend) {
		let _that = this;
		let userInfo = {};
		userInfo.openId = _that.data.openId;
		userInfo.unionId = _that.data.unionId;
		userInfo.loginToken = _that.data.loginToken;
		userInfo.appId = _that.data.appId;
		if (userExtend) {
			userInfo.userName = userExtend.userName;
			userInfo.mobileNo = userExtend.mobileNo;
			userInfo.nickName = userExtend.nickName ? decodeURI(userExtend.nickName) : userExtend.mobileNo;
			userInfo.headUrl = userExtend.userImageId;
			userInfo.userId = userExtend.userId
			userInfo.loginAccount = userExtend.mobileNo
			userInfo.userExtendInfoId = userExtend.id
			userInfo.myRecommendCode = userExtend.myRecommendCode
			userInfo.accountCustomer = userExtend.accountCustomer;
		}
		console.log("====登陆成功====", userInfo)
		wx.u.setStorageSync("wxAppUserInfo", userInfo)
	},
	/**
	 * 登录成功回调方法
	 */
	closeLoginPage() {
		let pages = getCurrentPages()
		let beforePage = pages[pages.length - 2]
		wx.navigateBack({
			success: function() {
				//登录成功后，调用上个页面回调方法
				if (typeof beforePage.loginSuccess === "function") {
					beforePage.loginSuccess()
				}
			}
		})
	}
})
