// components/touristList/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        touristList:{
            type:Array,
            value:[]
        },
        txt:{
            type:String,
            value:''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        userInfo: wx.u.getStorageSync("wxAppUserInfo")
    },

    /**
     * 组件的方法列表
     */
    methods: {
        delTourist(e){
            const { id } = e.currentTarget.dataset;
            this.triggerEvent('deltourist',{
                id
            })
        },
    }
})
