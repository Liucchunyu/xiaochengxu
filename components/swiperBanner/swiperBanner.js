// components/swiperBanner/swiperBanner.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    mode: String,
    list: {
      type: Array,
      value: [{
        href: '#',
        picUrl: '/images/banner_index.png'
      },{
        href: '#',
        picUrl: 'http://test.file.gzl.cn/group1/M00/00/24/wKgAnF8RbkaAfxSLAACxRY0N2-c905.jpg'
      }],
	  observer: function(newVal, oldVal){
       
		var autoplay = true;
		if(newVal && newVal.length>0){
			newVal.forEach(function(item) {
				if(item.videoUrl){
					autoplay = false;
        }
			})
		}
		this.setData({
		    autoplay: autoplay
		})
	  }
    },
    indicatorDots: { // 是否显示面板指示点
      type: Boolean,
      value: false
    },
    isWebview: {
      type: Boolean,
      value: false
    },
    host: {
      type: String,
      value: wx.c.imghost
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    indicatorColor: "rgba(0, 0, 0, 0.3)", // 指示点颜色
    indicatorActiveColor: "#fff", // 当前选中的指示点颜色
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔
    circular: true, // 是否采用衔接滑动
    current: 0,
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    swiperChange (e) {
      let that = this
      that.setData({
        current: e.detail.current
      })
    },
	webview (e) {
		console.log(e)
		let webviewurl = e.currentTarget.dataset.webviewurl.replace(/\s+/g, '');
		if(webviewurl&&webviewurl!="#"){
			if(webviewurl.indexOf("http")!=-1){
				wx.navigateTo({
					url: '/common/pages/webViewPage/webViewPage?webViewUrl='+encodeURIComponent(webviewurl)
				})
			}else{
				wx.navigateTo({
					url: webviewurl
				})
			}
		}
	}
  }
})
