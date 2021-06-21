// pages/hotel/index/index.js
const app = getApp();
const utils = require('../../assets/js/utils');
const login = require('../../assets/js/userlogin');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		rangeIn: { //开始时间
			...utils.getDataFn(0, 'M月D日'),
			week: utils.countWeek(utils.getDataFn(0).date),
			dateStr: utils.dateFormat(utils.getDataFn(0).date, 'Y-M-D')
		},
		rangeOut: { //结束时间 
			...utils.getDataFn(1, 'M月D日'),
			week: utils.countWeek(utils.getDataFn(1).date),
			dateStr: utils.dateFormat(utils.getDataFn(1).date, 'Y-M-D')
		},
		dayLen: '1',
		consultIndex: 0, //咨询单选中下标
		consultList: [ //咨询单数据
			{
				value: 'TRAVEL',
				name: '差旅咨询单'
			},
			{
				value: 'PERSONAL',
				name: '个人咨询单'
			}
		],
		roomIndex: 0,
		roomNumList: [1, 2, 3, 4, 5],
		orderNum: '', //预定房间数
		hotelName: '', //酒店名称
		bedType: '', //床型名称 
		bedIndex: null,
		bedList: [{
			id: 1,
			name: '单人床'
		}, {
			id: 1,
			name: '双人床'
		}],
		hasBreakfast: true,
		specialTxt: '',

		touristList: [],
		selectedCity: {},
		roomList: [{
			tourist: [{

			}],
			roomName: '房间1'
		}]

	},
	//获取当前定位
	...utils.getCurrentLocation,
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let that = this;
		login.wxAppLogin().then(res => {
			console.log("登录获取用户信息success", res);
			let userInfo = res;
			that.setData({
				userInfo: userInfo
			})
			console.log(userInfo);
		}, err => {})
		this.userLocation('selectedCity');
	},
	bindPickerChange(e) {
		const {
			key
		} = e.currentTarget.dataset;
		let {
			roomList
		} = this.data;
		let value = Number(e.detail.value);
		//处理预定房间
		if (key == 'roomIndex') {
			if (value < roomList.length) {
				wx.showModal({
					content: '房间数减少，有可能导致填写的联系人数据丢失，确认减少？',
					success: (res) => {
						if (res.confirm) {
							roomList.splice(value + 1, roomList.length - value);
							console.log(roomList)
							this.setData({
								roomList
							})
						} else {
							this.setData({
								roomIndex: roomList.length - 1
							})
						}
					}
				})
			} else {
				let dis = value - roomList.length + 1;
				let roomLength = roomList.length;
				if (dis > 0) {
					for (let i = 0; i < dis; i++) {
						roomList.push({
							tourist: [{}],
							roomName: '房间' + (i + roomLength + 1)
						})
					}
					this.setData({
						roomList
					})
				}
			}
		}
		this.setData({
			[key]: e.detail.value
		}, () => {
			console.log(this.data[key])
		})
	},
	delContact(e) {
		const {
			index,
			tindex
		} = e.currentTarget.dataset;
		console.log(e)
		let {
			roomList
		} = this.data;
		roomList[index].tourist.splice(tindex, 1)
		this.setData({
			roomList
		})
	},
	inputChange(e) {
		console.log(e)
		const {
			key
		} = e.currentTarget.dataset;
		this.setData({
			[key]: e.detail.value
		}, () => {
			console.log(this.data[key])
		})
	},
	switchChange(e) {
		console.log(e)
		this.setData({
			hasBreakfast: e.detail.value
		})
	},
	//日历选择
	selectDate() {
		wx.navigateTo({
			url: '/common/pages/calendar/index?type=hotel&mode=range',
		})
	},
	submitHandle() {
		let _that = this;
		let {
			userInfo,
			selectedCity,
			rangeIn,
			rangeOut,
			consultList,
			consultIndex,
			roomList,
			hotelName,
			bedType,
			bedList,
			bedIndex,
			hasBreakfast,
			specialTxt,
			touristList
		} = this.data;

		if (!userInfo) {
			let userSessionInfo = wx.u.getStorageSync("wxAppUserInfo");
			if (userSessionInfo.userId) {
				userInfo = userSessionInfo;
			} else {
				wx.u.showLoginPage();
				return;
			}
		}

		if (!selectedCity || !selectedCity.sitename) {
			wx.showToast({
				title: '城市不能为空',
				icon: 'none',
				mask: true
			})
			return;
		}

		if (!roomList || roomList.length == 0) {
			wx.showToast({
				title: '预订房间数不能为空',
				icon: 'none',
				mask: true
			})
			return;
		}

		let consultationTouristVo = [];

		roomList.forEach((item) => {
			let tourist = item.tourist;
			if (tourist) {
				tourist.forEach((touristItem) => {
					let consultationTouristItem = {
						"name": touristItem.name,
						"pinyinXing": touristItem.pinyinXing,
						"pinyinMing": touristItem.pinyinMing,
						"pinyinName": touristItem.pinyinName,
						"phone": touristItem.phone,
						"certTypeCode": touristItem.certTypeCode,
						"certTypeName": touristItem.certTypeName,
						"certCode": touristItem.certCode,
						"validity": touristItem.validity,
						"email": touristItem.email,
						"issued": touristItem.issued,
						"roomName": item.roomName
					}
					consultationTouristVo.push(consultationTouristItem);
				})
			}
		})

		if (!consultationTouristVo || consultationTouristVo.length == 0) {
			wx.showToast({
				title: '入住人信息不能为空',
				icon: 'none',
				mask: true
			})
			return;
		}

		let hotelOrderParam = {
			"customerId": userInfo.userId,
			"contactPhone": userInfo.mobileNo,
			"tourBegin": utils.dateFormat(new Date(rangeIn.timeStamp), 'Y-M-D'),
			"tourEnd": utils.dateFormat(new Date(rangeOut.timeStamp), 'Y-M-D'),
			"tourDestinations": selectedCity.sitename,
			"conSource": "JD",
			"conType": "JD",
			"conNature": consultList[consultIndex].value,
			"roomNums": roomList.length,
			"hotelName": hotelName,
			"bedType": bedType,
			"isBreakfast": hasBreakfast ? "1" : "0",
			"tourOther": specialTxt,
			"consultationTouristVo": consultationTouristVo
		};

		wx.showLoading({
			title: "订单提交中...",
			mask: true
		});

		wx.u.http({
			url: wx.api.consultation.submitOrder,
			method: 'POST',
			data: JSON.stringify(hotelOrderParam),
			"header": {
				'content-type': 'application/json'
			}
		}).then(res => {
			wx.hideLoading();
			if (res.success && res.data) {
				let consultationCode = res.data; //咨询单号
				
			} else {
				wx.showToast({
					title: res.message,
					icon: 'none',
					mask: true
				})
				return;
			}
		})
	},
	addPersonHandle(e) {
		const {
			index
		} = e.currentTarget.dataset;
		let {
			roomList
		} = this.data;
		roomList[index].tourist.push({});
		this.setData({
			roomList
		})
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
