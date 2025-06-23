// utils/recommend.js
// 团队午餐推荐算法

/**
 * 根据团队成员口味偏好推荐餐厅
 * @param {Array} teamMembers - 团队成员信息
 * @param {Array} restaurants - 餐厅列表
 * @param {Object} options - 推荐选项
 * @returns {Array} 推荐餐厅列表
 */
function getRecommendations(teamMembers, restaurants, options = {}) {
  if (!teamMembers || teamMembers.length === 0) {
    return restaurants.slice(0, 5) // 默认返回前5个
  }

  const scoredRestaurants = restaurants.map(restaurant => ({
    ...restaurant,
    matchScore: calculateMatchScore(restaurant, teamMembers),
    reasons: getMatchReasons(restaurant, teamMembers)
  }))

  // 按匹配度排序
  const sortedRestaurants = scoredRestaurants.sort((a, b) => b.matchScore - a.matchScore)

  // 应用过滤条件
  const filteredRestaurants = applyFilters(sortedRestaurants, options)

  return filteredRestaurants.slice(0, options.limit || 10)
}

/**
 * 计算餐厅与团队的匹配分数
 * @param {Object} restaurant - 餐厅信息
 * @param {Array} teamMembers - 团队成员
 * @returns {number} 匹配分数 (0-100)
 */
function calculateMatchScore(restaurant, teamMembers) {
  let totalScore = 0
  let weights = {
    cuisine: 0.35,      // 菜系匹配权重
    taste: 0.25,        // 口味匹配权重
    distance: 0.20,     // 距离权重
    price: 0.15,        // 价格权重
    rating: 0.05        // 评分权重
  }

  // 1. 菜系匹配得分
  const cuisineScore = calculateCuisineScore(restaurant, teamMembers)
  totalScore += cuisineScore * weights.cuisine

  // 2. 口味匹配得分
  const tasteScore = calculateTasteScore(restaurant, teamMembers)
  totalScore += tasteScore * weights.taste

  // 3. 距离得分
  const distanceScore = calculateDistanceScore(restaurant.distance)
  totalScore += distanceScore * weights.distance

  // 4. 价格得分
  const priceScore = calculatePriceScore(restaurant, teamMembers)
  totalScore += priceScore * weights.price

  // 5. 评分得分
  const ratingScore = (restaurant.rating / 5) * 100
  totalScore += ratingScore * weights.rating

  return Math.round(totalScore)
}

/**
 * 计算菜系匹配得分
 */
function calculateCuisineScore(restaurant, teamMembers) {
  const restaurantCuisine = restaurant.cuisine_type || restaurant.cuisine
  let matchCount = 0

  teamMembers.forEach(member => {
    if (member.preferredCuisines && member.preferredCuisines.includes(restaurantCuisine)) {
      matchCount++
    }
  })

  // 考虑籍贯偏好
  const hometownBonus = calculateHometownBonus(restaurant, teamMembers)
  
  const baseScore = (matchCount / teamMembers.length) * 100
  return Math.min(baseScore + hometownBonus, 100)
}

/**
 * 计算籍贯口味加成
 */
function calculateHometownBonus(restaurant, teamMembers) {
  const cuisineHometownMap = {
    '川菜': ['四川', '重庆'],
    '湘菜': ['湖南'],
    '豫菜': ['河南'],
    '徽菜': ['安徽'],
    '本帮菜': ['上海'],
    '粤菜': ['广东'],
    '鲁菜': ['山东']
  }

  const restaurantCuisine = restaurant.cuisine_type || restaurant.cuisine
  const relatedHometowns = cuisineHometownMap[restaurantCuisine] || []
  
  let bonus = 0
  teamMembers.forEach(member => {
    if (member.hometown) {
      const memberProvince = member.hometown.split(' ')[0]
      if (relatedHometowns.includes(memberProvince)) {
        bonus += 15 // 籍贯匹配加15分
      }
    }
  })

  return bonus
}

/**
 * 计算口味匹配得分
 */
function calculateTasteScore(restaurant, teamMembers) {
  if (!restaurant.tags) return 50 // 默认分数

  const spicyTags = ['麻辣', '香辣', '重辣', '微辣', '不辣']
  const sweetTags = ['甜', '微甜', '不甜']
  const saltyTags = ['清淡', '适中', '重口', '咸']

  let totalScore = 0
  let validMembers = 0

  teamMembers.forEach(member => {
    if (!member.tastePreferences) return

    let memberScore = 0
    let factorCount = 0

    // 检查辣度匹配
    const spicyMatch = checkSpicyMatch(restaurant.tags, member.tastePreferences.spicyLevel)
    if (spicyMatch !== null) {
      memberScore += spicyMatch
      factorCount++
    }

    // 检查甜度匹配
    const sweetMatch = checkSweetMatch(restaurant.tags, member.tastePreferences.sweetLevel)
    if (sweetMatch !== null) {
      memberScore += sweetMatch
      factorCount++
    }

    if (factorCount > 0) {
      totalScore += memberScore / factorCount
      validMembers++
    }
  })

  return validMembers > 0 ? totalScore / validMembers : 50
}

/**
 * 检查辣度匹配
 */
function checkSpicyMatch(restaurantTags, userSpicyLevel) {
  const spicyTagMap = {
    '不辣': 1,
    '微辣': 2,
    '中辣': 3,
    '重辣': 4,
    '麻辣': 4,
    '香辣': 4,
    '超辣': 5
  }

  for (let tag of restaurantTags) {
    if (spicyTagMap[tag]) {
      const restaurantLevel = spicyTagMap[tag]
      const diff = Math.abs(restaurantLevel - userSpicyLevel)
      return Math.max(0, 100 - diff * 20) // 差1级扣20分
    }
  }

  return null
}

/**
 * 检查甜度匹配
 */
function checkSweetMatch(restaurantTags, userSweetLevel) {
  const sweetTagMap = {
    '不甜': 1,
    '微甜': 2,
    '甜': 4,
    '很甜': 5
  }

  for (let tag of restaurantTags) {
    if (sweetTagMap[tag]) {
      const restaurantLevel = sweetTagMap[tag]
      const diff = Math.abs(restaurantLevel - userSweetLevel)
      return Math.max(0, 100 - diff * 20)
    }
  }

  return null
}

/**
 * 计算距离得分
 */
function calculateDistanceScore(distance) {
  if (distance <= 200) return 100
  if (distance <= 500) return 80
  if (distance <= 1000) return 60
  if (distance <= 1500) return 40
  return 20
}

/**
 * 计算价格得分
 */
function calculatePriceScore(restaurant, teamMembers) {
  const avgPrice = restaurant.avgPrice || restaurant.price_range * 25
  
  // 根据团队预算偏好计算得分
  let budgetScore = 0
  let validMembers = 0

  teamMembers.forEach(member => {
    if (member.budgetRange) {
      const [min, max] = parseBudgetRange(member.budgetRange)
      if (avgPrice >= min && avgPrice <= max) {
        budgetScore += 100
      } else if (avgPrice < min) {
        budgetScore += Math.max(0, 100 - (min - avgPrice) * 2)
      } else {
        budgetScore += Math.max(0, 100 - (avgPrice - max) * 2)
      }
      validMembers++
    }
  })

  return validMembers > 0 ? budgetScore / validMembers : 70
}

/**
 * 解析预算范围
 */
function parseBudgetRange(budgetRange) {
  const rangeMap = {
    '20-30元': [20, 30],
    '30-50元': [30, 50],
    '50-80元': [50, 80],
    '80-100元': [80, 100],
    '100元以上': [100, 200]
  }
  return rangeMap[budgetRange] || [30, 50]
}

/**
 * 获取匹配原因
 */
function getMatchReasons(restaurant, teamMembers) {
  const reasons = []
  
  // 菜系匹配原因
  const cuisineReasons = getCuisineReasons(restaurant, teamMembers)
  reasons.push(...cuisineReasons)

  // 口味匹配原因
  const tasteReasons = getTasteReasons(restaurant, teamMembers)
  reasons.push(...tasteReasons)

  // 距离原因
  if (restaurant.distance <= 300) {
    reasons.push('距离很近，步行即可到达')
  }

  // 价格原因
  if (restaurant.avgPrice && restaurant.avgPrice <= 40) {
    reasons.push('价格实惠，性价比高')
  }

  return reasons.slice(0, 3) // 最多返回3个原因
}

/**
 * 获取菜系匹配原因
 */
function getCuisineReasons(restaurant, teamMembers) {
  const reasons = []
  const restaurantCuisine = restaurant.cuisine_type || restaurant.cuisine

  teamMembers.forEach(member => {
    if (member.preferredCuisines && member.preferredCuisines.includes(restaurantCuisine)) {
      reasons.push(`符合${member.name || '团队成员'}的菜系偏好`)
    }
    
    if (member.hometown) {
      const memberProvince = member.hometown.split(' ')[0]
      if (isHometownMatch(restaurantCuisine, memberProvince)) {
        reasons.push(`${memberProvince}老乡的家乡口味`)
      }
    }
  })

  return reasons
}

/**
 * 获取口味匹配原因
 */
function getTasteReasons(restaurant, teamMembers) {
  const reasons = []
  
  if (restaurant.tags) {
    if (restaurant.tags.includes('不辣') || restaurant.tags.includes('微辣')) {
      reasons.push('口味适中，大部分人都能接受')
    }
    
    if (restaurant.tags.includes('下饭')) {
      reasons.push('下饭菜品，很有饱腹感')
    }
    
    if (restaurant.tags.includes('实惠')) {
      reasons.push('价格实惠，适合团队聚餐')
    }
  }

  return reasons
}

/**
 * 检查籍贯菜系匹配
 */
function isHometownMatch(cuisine, province) {
  const matchMap = {
    '川菜': ['四川', '重庆'],
    '湘菜': ['湖南'],
    '豫菜': ['河南'],
    '徽菜': ['安徽'],
    '本帮菜': ['上海']
  }
  
  return matchMap[cuisine] && matchMap[cuisine].includes(province)
}

/**
 * 应用过滤条件
 */
function applyFilters(restaurants, options) {
  let filtered = restaurants

  // 价格过滤
  if (options.maxPrice) {
    filtered = filtered.filter(r => (r.avgPrice || r.price_range * 25) <= options.maxPrice)
  }

  // 距离过滤
  if (options.maxDistance) {
    filtered = filtered.filter(r => r.distance <= options.maxDistance)
  }

  // 菜系过滤
  if (options.cuisineTypes && options.cuisineTypes.length > 0) {
    filtered = filtered.filter(r => options.cuisineTypes.includes(r.cuisine_type || r.cuisine))
  }

  // 排除最近去过的餐厅
  if (options.excludeRecent && options.excludeRecent.length > 0) {
    filtered = filtered.filter(r => !options.excludeRecent.includes(r.id))
  }

  return filtered
}

module.exports = {
  getRecommendations,
  calculateMatchScore,
  calculateCuisineScore,
  calculateTasteScore,
  calculateDistanceScore,
  calculatePriceScore
} 