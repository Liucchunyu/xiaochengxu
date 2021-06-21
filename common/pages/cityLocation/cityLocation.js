const app = getApp();
import utils from '../../../assets/js/utils'
Page({

  /**
   * 页面的初始数据
   * 
   * 进入页面有两种形态
   *  1. simple 出发站点选择(无城市搜索框, 只按钮跟title)
   *  2. full 国内外城市匹配(全功能 => 匹配字母A-Z 有搜搜框)
   */
  data: {
    // 页面是否全功能
    pageFullType: false,
    // 
    hotCityLabel: '热门城市',
    // 是否滚动
    noscroll: false,
    // 搜索结果
    hotCitysList: [],
    loactionCity: "定位中..",
    mySiteCode: "",
    // 带城市搜索的内容
    resultActive: false,
    destinationType: 'inland', // 目的地划分 海外/ 国内
    searchInputValue: '', // 搜索框内容
    citysList: [],
    letterSlideBar: ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W',
      'X', 'Y', 'Z'
    ], // 基础字母
    barIndex: 0, // 侧边栏索引值;
    scrollIntoViewId: 'title_0', // 滚动到可视区索引标题id
    // 搜索结果
    resultLsit: [],
    key:'',   //传过来的字段
    //城市多选
    multipleList:[],
    multiple:false,  //默认单选
    padBottom:0,
    windowHeight:wx.getSystemInfoSync().windowHeight
  },
  // 定位
  setLocation(e) {
    let sitecode = e.currentTarget.dataset.sitecode;
    let sitename = e.currentTarget.dataset.item;
    let multipleList = this.data.multipleList;
    let hotCitysList = this.data.hotCitysList;
    let citysList = this.data.citysList;
    if (sitename) {
      if(this.data.multiple){ //多选
        let isExit = multipleList.some(item=>item.sitename == sitename);
        if(!isExit){
          if(multipleList.length >= 5){
            wx.showToast({
              title: '最多只能选择五个城市',
              icon:'none',
              mask:true
            })
            return
          }
          multipleList.unshift({
            sitecode,
            sitename
          })
          this.setData({
            multipleList
          })
          this.resetFrom();
          this.countHeight()
        }else{
          wx.showToast({
            icon:'none',
            mask:true,
            title: '此选项已选择',
          })
        }
        
      }else{
        //单选
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
          [this.data.key]: {
            sitecode,
            sitename
          }
        })
        // 再返回 上一页
        wx.navigateBack({
          delta: 1
        })
      }
    }
  },
  //多选确认
  multipleSure(){
    let {multipleList} = this.data;
    //单选
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      [this.data.key]: multipleList
    })
    // 再返回 上一页
    wx.navigateBack({
      delta: 1
    })
  },
  //删除选中选项
  reduceSelect(e){
    const { index } = e.currentTarget.dataset;
    let { multipleList } = this.data;
    multipleList.splice(index,1);
    this.setData({
      multipleList
    },()=>{
      this.countHeight();
    })
  },
  //计算滚动高度
  countHeight(){
    var This = this;
    wx.createSelectorQuery().in(this).selectAll('.multiple-box').boundingClientRect((rects) => {
      if(rects.length > 0){
        This.setData({
          padBottom: rects[0].height + 2
        })
      }else{
        This.setData({
          padBottom: 0
        })
      }
      
    }).exec()
  },
  inputSearch(e) {
    let value = e.detail.value;
    //console.log(this.data.searchInputValue);
    let resultLsit = [];
    // ajax to do Something
    if (!value) {
      this.setData({
        noscroll: false,
        resultActive: false,
        // resultLsit: res.data
      })
      return
    }
	
	let search_reg = new RegExp("^" + value + "|\\|" + value, 'gi');
	let regEx = /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w+)\|(\w)\w*\|(\w*)$/i;
	let allSearchCity = this.data.allSearchCity;
	allSearchCity.forEach(function(e){
	  if (search_reg.test(e)) {
      let match = regEx.exec(e);
      console.log(match)
	    if (match && match[1]) {
	      let vo = {
          label:match[1],
          destId:match[4]
	      }
	      resultLsit.push(vo);
	    }
	  }
	})
	
    
    this.setData({
      noscroll: true,
      resultActive: true,
      resultLsit: resultLsit
    })
  },
  // 字母索引值
  letterScroll: utils.throttle(function () {
    wx.createSelectorQuery().in(this).selectAll('.letter').boundingClientRect((rects) => {
      // 添加节点的布局位置的查询请求
      let index = rects.findIndex((item) => {
        return item.top >= 1;
      })
      console.log(`index是${index}`);
      if (index === -1 || index === 0) {
        index = 1;
      }
      // 因为节点获取或setIndex 均是异步的 因此触发视图有毫秒级延迟;
      this.setIndex(index - 1)
    }).exec()
  }, 20),
  // 设置字母索引号
  setIndex(index) {
    if (this.data.barIndex === index) {
      return false
    } else {
      this.setData({
        barIndex: index
      })
    }
  },
  tapIndexItem(event) {
    let id = event.currentTarget.dataset.item;
    console.log(id);
    this.setData({
      scrollIntoViewId: `title_${id === '#' ? 0 : id}`
    })
  },
  // reset按钮回调;
  resetFrom() {
    this.setData({
      noscroll: false,
      resultActive: false,
      searchInputValue:''
    })
  },
  //切换海外、国内城市列表
  reloadCityList(e) {
    console.log(e.currentTarget.dataset.destination);
    let selectType = e.currentTarget.dataset.destination;
    let destinationType = this.data.destinationType;
    if(selectType == destinationType){
      return;
    }
    let citysList = "";//城市列表
    let hotCitysList = "";//热门城市列表
    let self = this;
    wx.showLoading({
      title: '加载中,请稍候',
    })
    if(selectType == "aboard"){
      citysList = self.data.abroadCityList;
      hotCitysList = self.data.abroadHotCityList;
    }else{
      citysList = self.data.domesticCityList;
      hotCitysList = self.data.domesticHotCityList;
    }
    this.setData({
      destinationType: selectType,
      citysList:citysList,
      hotCitysList:hotCitysList
    })
    setTimeout(() => {
      wx.hideLoading();
    }, 1000);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var This = this;
    this.setData({
      key:options.key,
      multiple:options.multiple ? true : false
    })

    //初始化多选数据
    if(options.multiple){
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      this.setData({
        multipleList: prevPage.data[options.key].filter(item=>item.sitename)
      })
    }
    
    // 获取参数 设置页面类型是站点选择 还是城市选择
    let that = this
    if (options.pageFullType == 'true') {
      this.setData({
        pageFullType: true,
        hotCityLabel: '热门城市',
      })
      this.loadCityList(options.inputtype);
    } else {
      this.loadAllSite();
    }
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userLocation"]) {
          that.loadLocationCity()
        } else {
          wx.showModal({
            title: '提示',
            content: "检测到你还没打开地理位置权限，是否去开启",
            showCancel: true,
            success(e) {
              if (e.confirm) {
                wx.openSetting({
                  success(settingRes) {
                    console.log(settingRes.authSetting)
                    if (settingRes.authSetting["scope.userLocation"]) {
                      that.loadLocationCity()
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
  loadLocationCity() {
    let that = this
    let locationData = {};
    wx.getLocation({
      type: 'wgs84',
      success :res=> {
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
		      that.setData({
		        loactionCity: cityResult,
		        mySiteCode: cityCode
		      });
		    }
		  })
		}
      }
     })
  },
  loadCityList(inputtype){
	  
	let self = this;
    wx.showLoading({
      title: '加载中,请稍候',
    })
	
	wx.u.http({
	  url: wx.api.destination.findAllCity,
	  method: 'GET'
	}).then(res => {
	  if (res.result && res.result == wx.c.OKresult) {
	    let cityGroup = res.cityGroup;
	    let domesticHotCityList = cityGroup.domesticHotCityList;//国内热门城市
	    let domesticCityList = cityGroup.domesticCityList;//国内城市
	    let abroadHotCityList = cityGroup.abroadHotCityList;//国外热门城市
	    let abroadCityList = cityGroup.abroadCityList;//国外城市
	    let allSearchCity = res.addrPluginData['allCityList'];
		
		let cityLocationData = {
	      citysList:domesticCityList,
	      hotCitysList:domesticHotCityList,
	      domesticHotCityList:domesticHotCityList,
	      domesticCityList:domesticCityList,
	      abroadHotCityList:abroadHotCityList,
	      abroadCityList:abroadCityList,
	      allSearchCity:allSearchCity,
	      pageFullType: true,
	      hotCityLabel: '热门城市',
	      inputtype:inputtype
	    };
		
		self.setData(cityLocationData);
		wx.hideLoading();
	  }
	})
  },
  loadAllSite() {
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(()=>{
      wx.hideLoading();
      this.setData({
        pageFullType: false,
        hotCityLabel:'城市列表',
        hotCitysList: [{
          siteCode:1,
          label:'广州'
        }]
      })
    },1000)
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

  }
})