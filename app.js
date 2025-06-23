// app.js
App({
  globalData: {
    userInfo: null,
    teamMembers: [], // 团队成员信息
    currentLocation: {
      latitude: 31.0056,  // 上海市松江区千帆路288弄的大概位置
      longitude: 121.2233,
      address: '上海市松江区千帆路288弄'
    }
  },

  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查微信云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'lunch-recommend', // 云环境ID，需要在微信云开发中创建
        traceUser: true,
      })
    }

    // 获取用户信息
    this.getUserInfo()
  },

  // 获取用户信息
  getUserInfo() {
    const that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              that.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (that.userInfoReadyCallback) {
                that.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  // 获取当前位置
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.globalData.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude,
            address: '上海市松江区千帆路288弄'
          }
          resolve(res)
        },
        fail: (err) => {
          console.log('获取位置失败', err)
          // 使用默认位置
          resolve(this.globalData.currentLocation)
        }
      })
    })
  },

  // 计算距离（单位：米）
  calculateDistance(lat1, lng1, lat2, lng2) {
    const radLat1 = lat1 * Math.PI / 180.0
    const radLat2 = lat2 * Math.PI / 180.0
    const a = radLat1 - radLat2
    const b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
    s = s * 6378.137 // 地球半径
    s = Math.round(s * 10000) / 10000
    return s * 1000 // 转换为米
  }
}) 