// pages/webViewPage/webViewPage.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    webViewUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     
		let self = this
		let isHideHomeButton = "0";
		let isHideNavigationBarLoading = "0";
		let shareTitle = "";
		if(options.isHideHomeButton){
			isHideHomeButton = options.isHideHomeButton;
		}
		if(options.isHideNavigationBarLoading){
			isHideNavigationBarLoading = options.isHideNavigationBarLoading;
		}
		if(options.shareTitle){
			shareTitle = decodeURIComponent(options.shareTitle);
		}
		self.setData({
			webViewUrl: decodeURIComponent(options.webViewUrl),
			isHideHomeButton: isHideHomeButton,
			isHideNavigationBarLoading: isHideNavigationBarLoading,
			shareTitle: shareTitle
		})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     
    let self = this;
    let isHideHomeButton = self.data.isHideHomeButton;
	let isHideNavigationBarLoading = self.data.isHideNavigationBarLoading;
	if(isHideHomeButton=="1"){
		wx.hideHomeButton();
	}
	if(isHideNavigationBarLoading=="1"){
		wx.hideNavigationBarLoading();
	}
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
     
     let self = this;
	 let shareTitle = self.data.shareTitle;
	 if(shareTitle){
		 return {
		   title: shareTitle
		 }
	 }
  }
})