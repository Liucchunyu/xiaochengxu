// pages/prodCalendar/prodCalendar.js
const app = getApp();
const utils = require('../../../assets/js/utils');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        rangeIn: '',
        rangeOut: '',
        mode: '',
        show: false,
        rangeStartTips: '开始',
        rangeEndTips: '结束',
        pickedTip: '请选择时间',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {
            type,
            mode
        } = options;
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        if (mode == 'single') {
            this.setData({
                mode,
                rangeIn: utils.dateFormat(prevPage.data.startDay.timeStamp),
            }, () => {
                this.setData({
                    show: true
                })
            })
        } else {
            this.setData({
                mode,
                rangeIn: utils.dateFormat(prevPage.data.rangeIn.timeStamp),
                rangeOut: utils.dateFormat(prevPage.data.rangeOut.timeStamp),
            }, () => {
                this.setData({
                    show: true
                })
            })
        }
        if (type == 'hotel') {
            this.setData({
                rangeStartTips: '入住',
                rangeEndTips: '离店',
                pickedTip: '请选择入住时间',
            })
        }

    },

    handleCb: function (e) {
        let self = this
        // 跳转至上一页
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        let {
            type
        } = this.data;
        if (!prevPage) return
        const {
            rangeIn,
            rangeOut,
            dayLen
        } = e.detail;
        let rangeInStamp = new Date(rangeIn).getTime();
        let rangeOutStamp = '';
        if (rangeOut) {
            rangeOutStamp = new Date(rangeOut).getTime()
            prevPage.setData({
                rangeIn: {
                    date: utils.dateFormat(rangeInStamp, 'M月D日'),
                    timeStamp: rangeInStamp,
                    week: utils.countWeek(rangeIn)
                },
                rangeOut: {
                    date: utils.dateFormat(rangeOutStamp, 'M月D日'),
                    timeStamp: rangeOutStamp,
                    week: utils.countWeek(rangeOut)
                },
                dayLen: type == 'hotel' ? dayLen : dayLen + 1
            })
        } else {
            prevPage.setData({
                startDay: {
                    date: utils.dateFormat(rangeInStamp, 'M月D日'),
                    timeStamp: rangeInStamp,
                    week: utils.countWeek(rangeIn)
                }
            })
        }


        wx.navigateBack({
            delta: 1
        })
    }
})