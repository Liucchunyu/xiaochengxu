// components/img/img.js
Component({
  
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    src: String,
    mode: String,
    mode: {
      type: String,
      value: 'scaleToFill'// aspectFit aspectFill widthFix
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    previewImage: function () {
      this.triggerEvent('preview')
    }
  }
})
