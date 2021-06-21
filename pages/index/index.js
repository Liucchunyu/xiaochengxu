//index.js
//获取应用实例
const app = getApp()
const login = require('../../assets/js/userlogin');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    remoteAdvList: [],
    url: "",
	pdTypeList:[
		{
			pdType : "hotel",
			pdName : "酒店",
			pageUrl : "/pages/hotel/index",
			iconUrl : "/images/icons/hotel_index.png",
		},
		{
			pdType : "plane",
			pdName : "机票",
			pageUrl : "/pages/plane/index",
			iconUrl : "/images/icons/plane_index.png",
		},
		{
			pdType : "train",
			pdName : "火车",
			pageUrl : "/pages/train/index",
			iconUrl : "/images/icons/train_index.png",
		},
		{
			pdType : "visa",
			pdName : "签证",
			pageUrl : "/pages/visa/index",
			iconUrl : "/images/icons/visa_index.png",
		}
	],
	advantageList:[
		{
			title : "资源阵营",
			imgUrl : "/images/icons/advantage_1.png",
		},
		{
			title : "多口岸服务",
			imgUrl : "/images/icons/advantage_2.png",
		},
		{
			title : "专业高效",
			imgUrl : "/images/icons/advantage_3.png",
		},
		{
			title : "旅游精英",
			imgUrl : "/images/icons/advantage_4.png",
		},
		{
			title : "严控品质",
			imgUrl : "/images/icons/advantage_5.png",
		}
	]
  },
  onLoad: function () {
  },
  onShow: function(){
    this.getHomeDecoration();

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
    })
  },
  /**
   * 获取装修数据
   */
  getHomeDecoration: function(){
    wx.u.http({
      url: wx.api.decoration.getBTripHomeDecoration,
      method: 'POST'
    }).then(res => {
      if(res.success && res.data){
        let remoteAdvList = [];
        let remoteAdvs = res.data.uni_homepage_rotate_image;
        if(remoteAdvs != null){
          remoteAdvs.forEach((item,i) =>{
            //限制轮播5张图
            if(i < 5){
              let remoteAdv ={
                href: item.href,
                picUrl: item.picUrl
              }
              remoteAdvList.push(remoteAdv);
            }
          })
          this.setData({
            remoteAdvList: remoteAdvList
          })
        }
        
      }
    })
  },
  // 酒店
  showConsultPage: function(e){
    let{
      url
    }=e.currentTarget.dataset
    this.setData({
     url: url
    })
    login.wxAppLogin().then(res=>{
		wx.navigateTo({
		   url: url
		})
    },err=>{
        //获取不到用户信息，跳转登录页
		wx.navigateTo({
		  	url: '/member/pages/login/login',
		})
    })
  },
  /**
    * 登录成功回调
  */
  loginSuccess(){
    let userSessionInfo = wx.u.getStorageSync("wxAppUserInfo");
    if(userSessionInfo){
        let{
          url
        }=this.data
        wx.navigateTo({
          url: url,
        })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh')// 显示顶部刷新图标
    wx.stopPullDownRefresh();
	  let self = this;	  
  },
})