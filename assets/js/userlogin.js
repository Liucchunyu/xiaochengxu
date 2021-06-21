const app = getApp();
const Crypto = require('/cryptojs/cryptojs.js').Crypto;

const wxAppLogin = () => {
	return new Promise(function(resolve, reject) {
		let userSessionInfo = wx.u.getStorageSync("wxAppUserInfo");
		let {
			loginToken,
			openId,
			unionId,
			userId
		} = userSessionInfo;
		//如果缓存已有登录用户信息则直接返回
		if (userId) {
			resolve(userSessionInfo);
		} else {
			if (loginToken) {
				//检查登录的sessionKey是否过期
				wx.checkSession({
					success(res) {
						console.log("sessionKey有效");
						//没有过期直接从缓存取登录token信息
						reject(userSessionInfo);
					},
					fail(err) {
						console.log("sessionKey过期或无效");
						clearToken();
						//过期则根据Code重新登录 获取loginToken
						getLoginToken(res => {
							reject(res)
						}, loginToken);
					}
				})
			} else {
				getLoginToken(res => {
					reject(res)
				});
			}
		}
	})
}

const getLoginToken = (reject, oldLoginToken) => {
	wx.login({
		success: res => {
			// 发送 code 到接口换取 openId, 登录token, unionId
			let loginCode = res.code;
			let appId = app.globalData.appId;
			let sign = Crypto.MD5(wx.c.signKey + loginCode);
			let loginData = {
				"sign": sign,
				"loginCode": loginCode,
				"appId": appId,
				"channel": "bTrip",
				"oldLoginToken": oldLoginToken ? oldLoginToken : ''
			}
			if (loginCode) {
				wx.u.http({
					"header": {
						'content-type': 'application/json'
					},
					"url": wx.api.member.loginByCode,
					"method": "POST",
					"data": JSON.stringify(loginData)
				}).then(res => {
					if (res.code == 200 && res.data) {
						let userInfo = {
							openId: res.data.openId,
							unionId: res.data.unionId,
							loginToken: res.data.loginToken,
							appId: appId
						};
						wx.u.setStorageSync("wxAppUserInfo", userInfo)
						reject(userInfo);
					} else {
						wx.showModal({
							title: '提示',
							content: "获取微信标识异常，请稍后重试！",
							showCancel: false
						})
					}
				}, (err) => {
					wx.showModal({
						title: '提示',
						content: "获取微信标识异常，请稍后重试！",
						showCancel: false
					})
				});
			}
		}
	})
}

const clearToken = () => {
	let userInfo = wx.u.getStorageSync("wxAppUserInfo");
	userInfo.loginToken = "";
	wx.u.setStorageSync("wxAppUserInfo", userInfo)
}

module.exports = {
	wxAppLogin: wxAppLogin,
	clearToken:clearToken
}
