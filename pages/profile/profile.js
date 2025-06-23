const app = getApp()

Page({
  data: {
    userInfo: {},
    userProfile: {
      hometown: '',
      ageRange: '',
      tastePreferences: {
        spicyLevel: 3,
        sweetLevel: 3,
        saltyLevel: 3
      },
      preferredCuisines: [],
      dietaryRestrictions: [],
      isVegetarian: false,
      budgetRange: ''
    },
    
    // 选项数据
    hometownRange: [
      ['河南', '湖南', '安徽', '上海', '北京', '江苏', '浙江', '广东', '四川', '重庆'],
      ['郑州', '洛阳', '开封', '新乡', '焦作', '安阳', '濮阳', '许昌', '漯河', '三门峡']
    ],
    hometownIndex: [0, 0],
    
    ageRange: ['20-25岁', '26-30岁', '31-35岁', '36-40岁', '40岁以上'],
    ageIndex: 0,
    
    budgetRange: ['20-30元', '30-50元', '50-80元', '80-100元', '100元以上'],
    budgetIndex: 1,
    
    // 口味等级描述
    spicyLevels: ['不辣', '微辣', '中辣', '重辣', '超辣'],
    sweetLevels: ['不甜', '微甜', '中甜', '偏甜', '很甜'],
    saltyLevels: ['清淡', '微咸', '适中', '偏咸', '重口'],
    
    // 菜系列表
    cuisineList: [
      { name: '川菜', selected: false },
      { name: '湘菜', selected: false },
      { name: '粤菜', selected: false },
      { name: '鲁菜', selected: false },
      { name: '苏菜', selected: false },
      { name: '浙菜', selected: false },
      { name: '闽菜', selected: false },
      { name: '徽菜', selected: false },
      { name: '本帮菜', selected: false },
      { name: '东北菜', selected: false },
      { name: '西北菜', selected: false },
      { name: '日本料理', selected: false },
      { name: '韩国料理', selected: false },
      { name: '泰国菜', selected: false },
      { name: '意大利菜', selected: false },
      { name: '快餐', selected: false }
    ],
    
    // 忌口列表
    restrictionsList: [
      { name: '香菜', selected: false },
      { name: '胡萝卜', selected: false },
      { name: '洋葱', selected: false },
      { name: '青椒', selected: false },
      { name: '芹菜', selected: false },
      { name: '韭菜', selected: false },
      { name: '茄子', selected: false },
      { name: '苦瓜', selected: false },
      { name: '豆腐', selected: false },
      { name: '海鲜', selected: false },
      { name: '牛肉', selected: false },
      { name: '羊肉', selected: false }
    ],
    
    customRestriction: '',
    saving: false
  },

  onLoad() {
    this.loadUserProfile()
    this.initHometownData()
  },

  onShow() {
    // 获取用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      app.userInfoReadyCallback = (res) => {
        this.setData({
          userInfo: res.userInfo
        })
      }
    }
  },

  // 加载用户配置
  loadUserProfile() {
    try {
      const profile = wx.getStorageSync('userProfile')
      if (profile) {
        // 更新菜系选择状态
        const cuisineList = this.data.cuisineList.map(item => ({
          ...item,
          selected: profile.preferredCuisines.includes(item.name)
        }))
        
        // 更新忌口选择状态
        const restrictionsList = this.data.restrictionsList.map(item => ({
          ...item,
          selected: profile.dietaryRestrictions.includes(item.name)
        }))
        
        this.setData({
          userProfile: {
            ...this.data.userProfile,
            ...profile
          },
          cuisineList,
          restrictionsList
        })
      }
    } catch (error) {
      console.error('加载用户配置失败', error)
    }
  },

  // 初始化籍贯数据
  initHometownData() {
    const hometownData = {
      '河南': ['郑州', '洛阳', '开封', '新乡', '焦作', '安阳', '濮阳', '许昌', '漯河', '三门峡'],
      '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州'],
      '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州'],
      '上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区']
    }
    
    const provinces = Object.keys(hometownData)
    this.setData({
      hometownRange: [provinces, hometownData[provinces[0]]]
    })
  },

  // 获取用户信息授权
  getUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
      app.globalData.userInfo = e.detail.userInfo
    }
  },

  // 籍贯选择变化
  onHometownChange(e) {
    const values = e.detail.value
    const provinces = this.data.hometownRange[0]
    const cities = this.data.hometownRange[1]
    
    const hometown = `${provinces[values[0]]} ${cities[values[1]]}`
    
    this.setData({
      hometownIndex: values,
      'userProfile.hometown': hometown
    })
  },

  // 年龄范围变化
  onAgeChange(e) {
    const index = e.detail.value
    this.setData({
      ageIndex: index,
      'userProfile.ageRange': this.data.ageRange[index]
    })
  },

  // 预算范围变化
  onBudgetChange(e) {
    const index = e.detail.value
    this.setData({
      budgetIndex: index,
      'userProfile.budgetRange': this.data.budgetRange[index]
    })
  },

  // 辣度偏好变化
  onSpicyLevelChange(e) {
    this.setData({
      'userProfile.tastePreferences.spicyLevel': e.detail.value
    })
  },

  // 甜度偏好变化
  onSweetLevelChange(e) {
    this.setData({
      'userProfile.tastePreferences.sweetLevel': e.detail.value
    })
  },

  // 咸度偏好变化
  onSaltyLevelChange(e) {
    this.setData({
      'userProfile.tastePreferences.saltyLevel': e.detail.value
    })
  },

  // 切换菜系选择
  toggleCuisine(e) {
    const cuisineName = e.currentTarget.dataset.name
    const cuisineList = this.data.cuisineList.map(item => {
      if (item.name === cuisineName) {
        return { ...item, selected: !item.selected }
      }
      return item
    })
    
    // 检查选择数量限制
    const selectedCount = cuisineList.filter(item => item.selected).length
    if (selectedCount > 5) {
      wx.showToast({
        title: '最多选择5个菜系',
        icon: 'none'
      })
      return
    }
    
    this.setData({ cuisineList })
  },

  // 切换忌口选择
  toggleRestriction(e) {
    const restrictionName = e.currentTarget.dataset.name
    const restrictionsList = this.data.restrictionsList.map(item => {
      if (item.name === restrictionName) {
        return { ...item, selected: !item.selected }
      }
      return item
    })
    
    this.setData({ restrictionsList })
  },

  // 自定义忌口输入
  onCustomRestrictionInput(e) {
    this.setData({
      customRestriction: e.detail.value
    })
  },

  // 添加自定义忌口
  addCustomRestriction() {
    const custom = this.data.customRestriction.trim()
    if (!custom) return
    
    // 检查是否已存在
    const exists = this.data.restrictionsList.some(item => item.name === custom)
    if (exists) {
      wx.showToast({
        title: '该忌口已存在',
        icon: 'none'
      })
      return
    }
    
    const restrictionsList = [...this.data.restrictionsList, { name: custom, selected: true }]
    this.setData({
      restrictionsList,
      customRestriction: ''
    })
  },

  // 素食主义者开关
  onVegetarianChange(e) {
    this.setData({
      'userProfile.isVegetarian': e.detail.value
    })
  },

  // 保存用户配置
  async saveProfile() {
    try {
      this.setData({ saving: true })
      
      // 收集选中的菜系
      const preferredCuisines = this.data.cuisineList
        .filter(item => item.selected)
        .map(item => item.name)
      
      // 收集选中的忌口
      const dietaryRestrictions = this.data.restrictionsList
        .filter(item => item.selected)
        .map(item => item.name)
      
      const profileData = {
        ...this.data.userProfile,
        preferredCuisines,
        dietaryRestrictions,
        updateTime: Date.now()
      }
      
      // 验证必填字段
      if (!profileData.hometown) {
        wx.showToast({
          title: '请选择籍贯',
          icon: 'none'
        })
        return
      }
      
      if (preferredCuisines.length === 0) {
        wx.showToast({
          title: '请至少选择一个喜欢的菜系',
          icon: 'none'
        })
        return
      }
      
      // 保存到本地存储
      wx.setStorageSync('userProfile', profileData)
      
      // TODO: 同步到云数据库
      // await this.syncToCloud(profileData)
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 返回首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
      
    } catch (error) {
      console.error('保存配置失败', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ saving: false })
    }
  },

  // 同步到云数据库
  async syncToCloud(profileData) {
    try {
      await wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: {
          profile: profileData
        }
      })
    } catch (error) {
      console.error('同步到云端失败', error)
    }
  }
}) 