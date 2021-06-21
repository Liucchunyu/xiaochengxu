//app.js
App({
	onLaunch: function() {
		wx.c = require('./assets/js/config');
		wx.u = require('./assets/js/utils');
		wx.api = require('./assets/js/api');
		this.claerStorage();
	},
	//根据版本号清理缓存
	claerStorage: function () {
		const res = wx.getStorageInfoSync();
		if (res.keys && res.keys.length > 0) {
			res.keys.forEach((value) => {
				if (value.indexOf(wx.c.cacheVersion) == -1) {
					wx.removeStorageSync(value);
				}
			})
		}
	},
	globalData: {
		appId: "wx75ad958aa105686b"
	}
})
 