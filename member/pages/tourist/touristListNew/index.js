const app = getApp();
const utils = require('../../../../assets/js/utils');
import pinyin from '../../../../assets/js/pinyin';
import {pySegSort} from '../../../../assets/js/letter_sort';
Page({

    /**
     * 页面的初始数据
     * 
     * 进入页面有两种形态
     *  1. simple 出发站点选择(无城市搜索框, 只按钮跟title)
     *  2. full 国内外城市匹配(全功能 => 匹配字母A-Z 有搜搜框)
     */
    data: {
        // 是否滚动
        noscroll: false,
        // 带城市搜索的内容
        resultActive: false, //是否弹出搜索列表
        searchInputValue: '', // 搜索框内容
        cityList: [],
        allCityList: [],
        myData: {}, //本人数据
        letterSlideBar: [], // 基础字母
        barIndex: null, // 侧边栏索引值;
        scrollIntoViewId: 'title_0', // 滚动到可视区索引标题id
        // 搜索结果
        resultList: [],
        key: '', //传过来的字段
        //城市多选
        multipleList: [],
        multiple: false, //默认单选
        padBottom: 0,
        windowHeight: wx.getSystemInfoSync().windowHeight,
        fixed: false,
        type: '',
		cityListData : []
    },
    // 选择
    setLocation(e) {
        let {
            id
        } = e.currentTarget.dataset;
        let multipleList = this.data.multipleList;
        let {
            cityList,
            allCityList,
            resultList,
            myData
        } = this.data;
        if (id) {
            if (this.data.multiple) { //多选
                let isExit = multipleList.some(item => item.id == id);
                let curItem = allCityList.filter(item => item.id == id)[0]
                if (!isExit) {
                    multipleList.unshift(curItem);

                    this.setData({
                        multipleList
                    })

                    if (curItem.id == myData.id) {
                        this.setData({
                            myData: {
                                ...myData,
                                check: true
                            }
                        })
                    }
                } else {
                    let findIndex = multipleList.findIndex(item => item.id == id)
                    multipleList.splice(findIndex, 1)
                    this.setData({
                        multipleList
                    })

                    if (curItem.id == myData.id) {
                        this.setData({
                            myData: {
                                ...myData,
                                check: false
                            }
                        })
                    }

                }

                //处理列表的选中和非选中
                cityList.map(cItem => {
                    cItem.data.map(cItem2 => {
                        if (cItem2.id == id) {
                            cItem2.check = !isExit ? true : false;
                        }
                        return cItem2
                    })
                    return cItem
                })
                this.setData({
                    cityList
                })
                //判断是否是搜索的点击
                if (!this.data.resultActive) {
                    this.resetFrom();
                } else {
                    resultList.map(item => {
                        if (item.id == curItem.id) {
                            item.check = !isExit ? true : false;
                        }
                    })
                    this.setData({
                        resultList
                    })
                }

                this.countHeight();

            } else {
                let curItem = allCityList.filter(item => item.id == id);
                if (curItem[0].canSelect) {  //可以选择
                    //单选
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];
                    let name = this.data.key;
                    if (this.data.type == 'hotel') {
                        prevPage.setData({
                            [name]: curItem[0]
                        })
                    } else {
                        prevPage.setData({
                            [name]: curItem
                        })
                    }

                    // 再返回 上一页
                    wx.navigateBack({
                        delta: 1
                    })
                }

            }
        }
    },
    //多选确认
    multipleSure() {
        let {
            multipleList,
            resultActive
        } = this.data;
        //搜索弹框确定
        if (resultActive) {
            this.resetFrom();
        } else {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            prevPage.setData({
                [this.data.key]: multipleList
            })
            // 再返回 上一页
            wx.navigateBack({
                delta: 1
            })
        }

    },
    //删除选中选项
    reduceSelect(e) {
        const {
            index
        } = e.currentTarget.dataset;
        let {
            multipleList,
            cityList
        } = this.data;
        let curId = multipleList[index].id;
        cityList = cityList.map(item => {
            item.data.map(item2 => {
                if (item2.id == curId) {
                    item2.check = false
                }
                return item2
            })
            return item
        })
        multipleList.splice(index, 1);
        this.setData({
            multipleList,
            cityList
        }, () => {
            this.countHeight();
        })
    },
    //计算滚动高度
    countHeight() {
        var This = this;
        wx.createSelectorQuery().in(this).selectAll('.multiple-box').boundingClientRect((rects) => {
            if (rects.length > 0) {
                This.setData({
                    padBottom: rects[0].height + 2
                })
            } else {
                This.setData({
                    padBottom: 0
                })
            }

        }).exec()
    },
    inputSearch(e) {
        let value = e.detail.value;
        //console.log(this.data.searchInputValue);
        let resultList = [];
        // ajax to do Something
        if (!value) {
            this.setData({
                noscroll: false,
                resultActive: false,
                // resultList: res.data
            })
            return
        }
        let {
            multiple,
            multipleList,
            allCityList
        } = this.data;
        resultList = allCityList.filter(item => item.name.indexOf(value) != -1);
        if (multiple) {
            resultList.map(item => {
                item.check = multipleList.some(mItem => mItem.id == item.id) ? true : false
            })
        }

        this.setData({
            resultList
        })
        this.setData({
            noscroll: true,
            resultActive: true,
            resultList: resultList
        })
    },
    // 字母索引值
    letterScroll: utils.throttle(function () {
        wx.createSelectorQuery().in(this).selectAll('.letter').boundingClientRect((rects) => {
            let index = rects.findIndex((item) => {
                return item.top >= 1;
            })
            if (rects.every(item => item.top <= 0)) {
                console.log(3333)
                index = rects.length
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
        // let id = event.currentTarget.dataset.item;
        let {
            item: id,
            index
        } = event.currentTarget.dataset;
        this.setData({
            scrollIntoViewId: `title_${id === '#' ? 0 : id}`
        })
        this.setIndex(index)
    },
    // reset按钮回调;
    resetFrom() {
        this.setData({
            noscroll: false,
            resultActive: false,
            searchInputValue: ''
        })
    },
    fixedHandle() {
        this.setData({
            fixed: this.data.fixed ? false : true
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        var This = this;
        this.setData({
            key: options.key,
            multiple: options.multiple == 'true' ? true : false,
            type: options.type ? options.type : ''
        })

        //初始化多选数据
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        //酒店的特殊处理
        if (options.type == 'hotel') {
            let selectItem = [];
            for (let i = 0; i < prevPage.data.roomList.length; i++) {
                prevPage.data.roomList[i].tourist.forEach(rItem => {

                    if (rItem.id) {
                        // if (rItem.id != options.id) {
                            rItem.canSelect = false; //不可以选
                        // }
                        selectItem.push(rItem)
                    }
                });
            }
            this.setData({
                multipleList: JSON.parse(JSON.stringify(selectItem))
            })
        } else {
            this.setData({
                multipleList: JSON.parse(JSON.stringify(prevPage.data[options.key]))
            })
        }
        this.loadTourist();
    },
    loadTourist() {
        let userInfo = wx.u.getStorageSync("wxAppUserInfo");
        let {
            multipleList,
            multiple,
			cityListData
        } = this.data;
		
		wx.showLoading({
		    title: '加载中...',
		})
		//获取游客列表
		wx.u.http({
		  url: wx.api.consultation.findTouristByPhone,
		  method: 'POST',
		  data: {'mobileNo': userInfo.mobileNo}
		}).then(res => {
		  if(res.success && res.data){
			  wx.hideLoading();
			  console.log(res.data)
			  if(res.data){
				  res.data.forEach(function(e,i){
					  let certList = e.consultationCertList;
					  if(certList && certList.length>0){
					      let tourist={
							id:e.id,
					      	phone: e.phone,
					      	email: e.email,
							certCode: certList[0].certCode,
					      	certTypeCode: certList[0].certTypeCode,
							certTypeName: certList[0].certTypeName,
							certValidity: certList[0].certValidity,
					      	department:e.deptName
					      }
					      if(e.accountName){
					      	tourist.name = e.accountName;
					      	tourist.pinyinXing = pinyin.getFullChars(e.accountName.substring(0,1));
					      	tourist.pinyinMing = pinyin.getFullChars(e.accountName.substring(1,e.accountName.length));
					      	tourist.pinyinName = pinyin.getFullChars(e.accountName);
					      }
					      cityListData.push(tourist);
					  }
				  });
				  
				  cityListData.map(item => {
				      let flag = multipleList.some(item2 => item2.id == item.id)
				      let canSelect = multipleList.some(item2 => (item2.id == item.id && item2.canSelect == false))
				      item.check = flag ? true : false;
				      item.canSelect = canSelect ? false : true;
				  
				      return item
				  })
				  
				  let myDataIndex = cityListData.findIndex(item => item.phone == userInfo.mobileNo);
				  
				  let myData = myDataIndex >= 0 ? cityListData[myDataIndex] : {};
				  let cityList = pySegSort(cityListData, 'name'); //将游客信息按照字母排序
				  let letterSlideBar = cityList.map(item => item.letter);
				  
				  this.setData({
				      allCityList: JSON.parse(JSON.stringify(cityListData)),
				      cityList,
				      myData: myData,
				      letterSlideBar
				  })
				  this.countHeight();
			   }
		  }else{
			  wx.hideLoading();
			  let msg = "获取常用旅客异常，请稍候再试";
			  if(res.message){
				  msg = res.message
			  }
			  wx.showToast({
				  title: msg,
				  icon: 'none'
			  });
		  }
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