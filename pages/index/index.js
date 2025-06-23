const app = getApp()

Page({
  data: {
    teamCount: 4,
    currentLocation: '上海市松江区千帆路288弄',
    todayRecommends: [],
    todayVoteCount: 0,
    weeklyMealCount: 0,
    favoriteGenre: '川菜',
    loading: false
  },

  onLoad(options) {
    console.log('首页加载')
    this.initPageData()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.refreshData()
  },

  // 初始化页面数据
  initPageData() {
    this.setData({
      loading: true
    })

    // 获取团队信息
    this.getTeamInfo()
    
    // 获取今日推荐
    this.getTodayRecommends()
    
    // 获取统计数据
    this.getStatistics()
  },

  // 获取团队信息
  getTeamInfo() {
    try {
      const teamMembers = wx.getStorageSync('teamMembers') || []
      this.setData({
        teamCount: teamMembers.length || 4
      })
    } catch (error) {
      console.error('获取团队信息失败', error)
    }
  },

  // 获取今日推荐
  async getTodayRecommends() {
    try {
      // 模拟推荐数据，实际应该调用云函数
      const mockRecommends = [
        {
          id: '1',
          name: '川味小厨',
          cuisine: '川菜',
          rating: 4.5,
          distance: 300,
          avgPrice: 45,
          tags: ['麻辣', '下饭', '实惠'],
          matchScore: 92
        },
        {
          id: '2',
          name: '湘菜馆',
          cuisine: '湘菜',
          rating: 4.3,
          distance: 450,
          avgPrice: 50,
          tags: ['香辣', '口味重', '家常'],
          matchScore: 88
        },
        {
          id: '3',
          name: '本帮菜馆',
          cuisine: '本帮菜',
          rating: 4.2,
          distance: 200,
          avgPrice: 55,
          tags: ['本地口味', '清淡', '精致'],
          matchScore: 75
        }
      ]

      this.setData({
        todayRecommends: mockRecommends
      })

      // TODO: 实际项目中调用云函数获取推荐
      // const result = await this.callCloudFunction('getRecommendations')
      
    } catch (error) {
      console.error('获取推荐数据失败', error)
      wx.showToast({
        title: '获取推荐失败',
        icon: 'none'
      })
    }
  },

  // 获取统计数据
  getStatistics() {
    try {
      // 从本地存储获取统计数据
      const statistics = wx.getStorageSync('statistics') || {}
      
      this.setData({
        todayVoteCount: statistics.todayVoteCount || 0,
        weeklyMealCount: statistics.weeklyMealCount || 0,
        favoriteGenre: statistics.favoriteGenre || '川菜',
        loading: false
      })
    } catch (error) {
      console.error('获取统计数据失败', error)
      this.setData({
        loading: false
      })
    }
  },

  // 刷新数据
  refreshData() {
    this.getTeamInfo()
    this.getStatistics()
  },

  // 跳转到推荐页面
  goToRecommend() {
    wx.navigateTo({
      url: '/pages/recommend/recommend'
    })
  },

  // 跳转到投票页面
  goToVote() {
    wx.navigateTo({
      url: '/pages/vote/vote'
    })
  },

  // 跳转到历史页面
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  // 跳转到个人设置页面
  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 开始今日推荐
  startRecommend() {
    // 检查是否已设置个人偏好
    const userProfile = wx.getStorageSync('userProfile')
    
    if (!userProfile || !userProfile.hometown || !userProfile.tastePreferences) {
      wx.showModal({
        title: '提示',
        content: '请先完善个人口味偏好设置',
        showCancel: true,
        cancelText: '稍后设置',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            this.goToProfile()
          }
        }
      })
      return
    }

    // 开始智能推荐
    this.goToRecommend()
  },

  // 调用云函数
  async callCloudFunction(name, data = {}) {
    try {
      const result = await wx.cloud.callFunction({
        name: name,
        data: data
      })
      return result.result
    } catch (error) {
      console.error('调用云函数失败', error)
      throw error
    }
  },

  // 用户下拉刷新
  onPullDownRefresh() {
    this.initPageData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '团队午餐推荐 - 解决选择困难症',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '团队午餐推荐 - 让选择变得简单',
      imageUrl: '/images/share-cover.jpg'
    }
  }
}) 