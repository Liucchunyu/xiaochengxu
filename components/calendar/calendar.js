// components/calendar/calendar.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    mode: {
      type: String,
      value: 'price' // 'price' 'range' 'single
    },
    curDay: String, // 当前选择日期 2019-09-10
    curNav: {// 当前导航
      type: Number,
      value: 0
    },
    nav: {// 导航
      type: Array,
      value: [
      ]
    },
    schedule: {// 排期
      type: Object,
      value: {
      }
    },
    items: {
      type: Number,
      value: 1
    },
    rangeIn: String, // 初始化范围开始;
    rangeOut: String, // 初始化范围结束;
    pickedTip: {
      type: String,
      value: '选择入住时间', 
    },
    rangeStartTips: { // 范围显示文字
      type: String,
      value: '入住'
    },
    rangeEndTips: {
      type: String,
      value: '离店'
    },
    rangeMax: {
      type: Number,
      value: 15
    },
    isSame: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    week: ['日', '一', '二', '三', '四', '五', '六'],
    today: null,
    monthList: null,
    // items: 1,
    tag: {'cu': '促','jian': '减','qiang': '抢', 'hui': '惠', 'yu': '预', 'pin': '拼'},
    swiperH: [],
    navScroll: 0,
    navList: null,
    showTip: false,
    curRangeMax: null
  },

  attached () {
    let self = this
    self.setData({
      today: self.data.nav.length > 0?new Date(self.data.nav[0].date):new Date()
    })
    // 选择出发时间
    self.init()
  },
  ready () {
    let self = this
    self.setSwiperHeight();
    const query = wx.createSelectorQuery().in(this)
    query.selectAll('.nav-item').boundingClientRect(function (rect) {
      self.setData({
        navList: rect
      })
    }).exec()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化
    init () {
      let self = this
      , firstMonth = self.data.today
      , nextMonth
      , monthNum = self.data.items
      , monthArr = []
      , monthList
      , calendarNav = self.data.nav
      monthArr.push(firstMonth)
      if (calendarNav.length > 0) { // 跟团日历
        calendarNav.forEach((value, index) => {
          if (index > 0) {
            nextMonth = new Date(value.date)
            monthArr.push(nextMonth)
          }
        })
      } else if (monthNum > 1) {
        for(let i=1;i<monthNum;i++){
          nextMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1)
          monthArr.push(nextMonth)
        }
      }
      monthList = self.getMonthDay(monthArr)
      console.log(monthList)
      self.setData({
        monthList: monthList
      })
    },
    // 获取月份渲染内容
    getMonthDay (months) {
      let self = this
      , allMonths = []
      months.forEach((value, index) => {
        let monthDays = []
        , dateNum = self.getMonthDateNumber(value)
        , indexMonth = new Date(value.getFullYear(), value.getMonth(), 1)
        , firstDay = indexMonth.getDay()
        for (let i=0;i<dateNum+firstDay;i++) {
          let temDate
          , fullYear
          , isCurmonth = false
          , holiday // 节假日
          , tag // 活动
          , price // 价格
          , num // 数量
          , disable = true
          if (i < firstDay) {// 上个月
            temDate = new Date(indexMonth.getTime() - (firstDay - i)*24*60*60*1000)
          } else if (i >= firstDay && i < firstDay + dateNum) {// 当月
            temDate = new Date(value.getFullYear(), value.getMonth(), (i - firstDay) + 1)
            isCurmonth = true
          } else { // 下个月
            temDate = new Date(firstDay.getTime() + (i - firstDay)*24*60*60*1000)
          }
          fullYear = temDate.getFullYear() + "-" + self.dbDate(temDate.getMonth() + 1) + "-" + this.dbDate(temDate.getDate())
          switch (self.data.mode) {
            case 'price':
              disable = !self.data.schedule[fullYear] || !self.data.schedule[fullYear].num || new Date(fullYear) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) || false
              break;
            case 'range':
              if (Object.keys(self.data.schedule).length > 0) {
                disable = !self.data.schedule[fullYear] || new Date(fullYear) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) || false
              } else {
                disable = new Date(fullYear) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) || false
              }
            case 'single':
              if (Object.keys(self.data.schedule).length > 0) {
                disable = !self.data.schedule[fullYear] || new Date(fullYear) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) || false
              } else {
                disable = new Date(fullYear) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) || false
              }
          }
          if (self.data.schedule[fullYear]) {
            let opt = self.data.schedule[fullYear]
            holiday = opt.holiday
            tag = opt.tag
            price = opt.price
            num = opt.num
          }
          monthDays.push({
            date: fullYear,
            year: temDate.getFullYear(),
            month: temDate.getMonth() + 1,
            day: temDate.getDate(),
            week: temDate.getDay(),
            isCurmonth: isCurmonth,
            holiday: holiday,
            tag: tag,
            price: price,
            num: num,
            disable: disable
          })
        }
        allMonths.push(monthDays)
      });
      return allMonths
    },
    // 设置日历高度
    setSwiperHeight () {
      let self = this
      wx.createSelectorQuery().in(this).selectAll('.gzl-calendar__item').boundingClientRect(function (rect) {
        let swiperH = []
        rect.forEach(function (value) {
          swiperH.push(value.height);
        })
        self.setData({
          swiperH: swiperH
        })
      }).exec()
    },
    // 跟团日历滑动切换
    navChange (e) {
      let self = this
      let item = self.data.navList[e.detail.current]
      self.setData({ 
        curNav: e.detail.current,
        navScroll: item.left - wx.getSystemInfoSync().windowWidth/2 + item.width/2
      });
    },
    // 月份导航点击
    navClick (e) {
      let self = this
      let item = self.data.navList[e.currentTarget.dataset.index]
      self.setData({
        curNav: e.currentTarget.dataset.index,
        navScroll: item.left - wx.getSystemInfoSync().windowWidth/2 + item.width/2
      })
    },
    // 左点击
    prevClick: function () {},
    // 右点击
    nextClick: function () {},
    // 日期选择
    gridClick (e) {
      let self = this
      let set = e.currentTarget.dataset;
      if (!set.disable || set.date === self.data.curRangeMax) {
        if (self.data.mode === 'price') {
          self.setData({
            curDay: e.currentTarget.dataset.date
          })
          self.triggerEvent("cb", {
            date: e.currentTarget.dataset.date
          })
        }
        if (self.data.mode === 'range') {
          if (!self.data.rangeIn) {
            self.setData({
              rangeIn: e.currentTarget.dataset.date,
              pickedTip: `选择${self.data.rangeEndTips}时间`
            })
          } else if (self.data.rangeOut) {
            self.setData({
              rangeIn: e.currentTarget.dataset.date,
              rangeOut: '',
              pickedTip: `选择${self.data.rangeEndTips}时间`
            })
            self.checkCurRangeMax()
          } else {
            if (new Date(e.currentTarget.dataset.date) < new Date(self.data.rangeIn)) {
              self.setData({
                rangeIn: e.currentTarget.dataset.date,
                rangeOut: '',
                pickedTip: `选择${self.data.rangeEndTips}时间`
              })
              self.checkCurRangeMax()
            } else {
              if (!self.data.isSame && self.data.rangeIn === e.currentTarget.dataset.date) {
                wx.showToast({ title: `${self.data.rangeEndTips}时间需大于${self.data.rangeStartTips}时间`, icon: 'none' })
                return
              }
              let days = self.getDaysBetween(self.data.rangeIn, e.currentTarget.dataset.date)
              if (days > self.data.rangeMax) {
                self.setData({
                  showTip: true
                })
              } else {
                if (self.data.curRangeMax && new Date(e.currentTarget.dataset.date) > new Date(self.data.curRangeMax)) {
                  return
                }
                self.setData({
                  rangeOut: e.currentTarget.dataset.date,
                  curRangeMax: null
                  // pickedTip: '选择入住时间'
                })
                self.triggerEvent("cb", {
                  rangeIn: self.data.rangeIn,
                  rangeOut: self.data.rangeOut,
                  dayLen: (new Date((self.data.rangeOut).replace(/-/g,"/"))-new Date((self.data.rangeIn).replace(/-/g,"/")))/(1000*3600*24)
                })
              }
            }
          }
        }
        if (self.data.mode === 'single') {
          // 没有初始日期
          console.log(self.data.rangeIn);
          if (!self.data.rangeIn) {
            self.setData({
              rangeIn: e.currentTarget.dataset.date,
            })
          }else {
            // 直接返回数据;
              self.setData({
                rangeIn: e.currentTarget.dataset.date,
              })
              self.triggerEvent("cb", {
                rangeIn: self.data.rangeIn,
              })
          }
        }
      
      }
    },
    getMonthDateNumber: function (date) {
      var tem_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return tem_date.getDate();
    },
    dbDate: function (date) {
      date = date.toString();
      date = date.length === 1 ? "0" + date : date;
      return date;  
    },
    formatTime: function (time) {
      const date = new Date(time)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return [year, month, day].map(this.formatNumber).join('-')
    },
    formatNumber: function (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    },
    getDaysBetween: function (start,end){
      var  startDate = Date.parse(start);
      var  endDate = Date.parse(end);
      var days=(endDate - startDate)/(1*24*60*60*1000) + 1;
      return  days;
    },
    closeTip: function () {
      this.setData({
        showTip: false
      })
    },
    onCall: function () {
      wx.makePhoneCall({
        phoneNumber: '400-863-8888',
      })
    },
    checkCurRangeMax: function () {
      let self = this
      let len = Object.keys(self.data.schedule).length
      if (len > 0) {
        for (let i=0;i<len;i++) {
          let day = self.formatTime(new Date(self.data.rangeIn).getTime() + i*1000*60*60*24)
          if (!self.data.schedule[day]) {
            self.setData({
              curRangeMax: day
            })
            return
          }
        }
      }
    }
  }
})
