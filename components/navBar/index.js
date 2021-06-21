// components/navBar/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        active: {
            type: Number,
            value: 0
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },
    lifetimes: {
      attached: function() {
        // 在组件实例进入页面节点树时执行
        let{
          active
        }= this.data
        console.log(active)
      },
    },
    

    /**
     * 组件的方法列表
     */
    methods: {
        changeNav(e) {
            const {
                active,
                url
            } = e.currentTarget.dataset;
             
            if(e.currentTarget.dataset.url == '/pages/discount/index'){
                wx.u.http({
                    url: wx.api.decoration.getBTripHomeDecoration,
                    method: 'POST'
                  }).then(res => {
                       
                    if(res.success && res.data){
                      let advImage = res.data.uni_homepage_advertising_icon;
                      if(advImage != null){
                          //let advImageVo = {};
                          advImage.forEach((item,i) =>{
                          if(i == 0){
                            if(item.href){
                              wx.navigateToMiniProgram({
                                appId: item.href,
                                path:(item.tip?item.tip:"pages/homePage/homePage"),
                                success(res) {
                                   console.log("跳转成功")
                                }
                              })
          
                            }
                            
                          }
                        })
                       
                      }
                      
                    }
                  })
            }else{
                wx.redirectTo({
                    url
                })
            }
            

        }
    }
})