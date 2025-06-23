// 团队午餐推荐 JavaScript 逻辑

// 全局变量
let userProfile = {
    hometown: '',
    spicyLevel: 3,
    sweetLevel: 3,
    saltyLevel: 3,
    preferredCuisines: [],
    budget: '30-50'
};

let restaurants = [];
let currentRecommendations = [];
let votes = {};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadMockData();
});

// 初始化应用
function initializeApp() {
    setupSliders();
    setupCuisineTags();
}

// 设置事件监听
function setupEventListeners() {
    document.getElementById('hometown').addEventListener('change', function() {
        userProfile.hometown = this.value;
        saveUserProfile();
    });
    
    document.getElementById('budget').addEventListener('change', function() {
        userProfile.budget = this.value;
        saveUserProfile();
    });
}

// 设置滑块
function setupSliders() {
    const sliders = [
        { id: 'spicyLevel', textId: 'spicyLevelText', levels: ['不辣', '微辣', '中辣', '重辣', '超辣'] },
        { id: 'sweetLevel', textId: 'sweetLevelText', levels: ['不甜', '微甜', '中甜', '偏甜', '很甜'] },
        { id: 'saltyLevel', textId: 'saltyLevelText', levels: ['清淡', '微咸', '适中', '偏咸', '重口'] }
    ];
    
    sliders.forEach(slider => {
        const element = document.getElementById(slider.id);
        const textElement = document.getElementById(slider.textId);
        
        element.addEventListener('input', function() {
            const level = parseInt(this.value);
            textElement.textContent = slider.levels[level - 1];
            userProfile[slider.id] = level;
            saveUserProfile();
        });
        
        const initialLevel = userProfile[slider.id];
        element.value = initialLevel;
        textElement.textContent = slider.levels[initialLevel - 1];
    });
}

// 设置菜系标签
function setupCuisineTags() {
    const tags = document.querySelectorAll('#cuisineTags .tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const cuisine = this.dataset.cuisine;
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                userProfile.preferredCuisines = userProfile.preferredCuisines.filter(c => c !== cuisine);
            } else {
                if (userProfile.preferredCuisines.length < 5) {
                    this.classList.add('selected');
                    userProfile.preferredCuisines.push(cuisine);
                } else {
                    alert('最多选择5个菜系');
                    return;
                }
            }
            
            saveUserProfile();
        });
    });
}

// 保存用户配置
function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// 加载模拟数据
function loadMockData() {
    restaurants = [
        {
            id: '1',
            name: '川味小厨',
            cuisine: '川菜',
            rating: 4.5,
            distance: 300,
            avgPrice: 45,
            tags: ['麻辣', '下饭', '实惠', '正宗'],
            address: '松江区千帆路102号',
            phone: '021-12345678',
            description: '正宗四川口味，麻辣鲜香，分量足，适合团队聚餐。招牌菜：水煮鱼、麻婆豆腐、口水鸡。'
        },
        {
            id: '2',
            name: '湘菜馆',
            cuisine: '湘菜',
            rating: 4.3,
            distance: 450,
            avgPrice: 50,
            tags: ['香辣', '口味重', '家常', '下饭'],
            address: '松江区千帆路256号',
            phone: '021-87654321',
            description: '湖南家常菜，口味偏重，香辣开胃。招牌菜：剁椒鱼头、辣椒炒肉、毛血旺。'
        },
        {
            id: '3',
            name: '本帮菜馆',
            cuisine: '本帮菜',
            rating: 4.2,
            distance: 200,
            avgPrice: 55,
            tags: ['本地口味', '清淡', '精致', '传统'],
            address: '松江区千帆路88号',
            phone: '021-11122233',
            description: '上海本帮菜，口味偏甜，制作精致。招牌菜：红烧肉、糖醋排骨、白切鸡。'
        },
        {
            id: '4',
            name: '徽菜园',
            cuisine: '徽菜',
            rating: 4.4,
            distance: 380,
            avgPrice: 48,
            tags: ['家乡味', '清香', '营养', '滋补'],
            address: '松江区千帆路198号',
            phone: '021-33344455',
            description: '安徽菜系，口味清香，注重养生。招牌菜：臭鳜鱼、毛豆腐、徽州刀板香。'
        },
        {
            id: '5',
            name: '快食堂',
            cuisine: '快餐',
            rating: 4.0,
            distance: 150,
            avgPrice: 25,
            tags: ['快速', '实惠', '分量足', '不辣'],
            address: '松江区千帆路66号',
            phone: '021-55566677',
            description: '快餐连锁，出餐快速，价格实惠。有各种盖饭、面条、汤品可选。'
        }
    ];
}

// 生成推荐
function generateRecommendations() {
    if (!userProfile.hometown) {
        alert('请先选择您的籍贯');
        return;
    }
    
    if (userProfile.preferredCuisines.length === 0) {
        alert('请至少选择一个喜欢的菜系');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        currentRecommendations = calculateRecommendations();
        displayRecommendations();
        showRecommendations();
        hideLoading();
    }, 1000);
}

// 计算推荐
function calculateRecommendations() {
    const scoredRestaurants = restaurants.map(restaurant => {
        const score = calculateMatchScore(restaurant);
        const reasons = getMatchReasons(restaurant);
        
        return {
            ...restaurant,
            matchScore: score,
            reasons: reasons
        };
    });
    
    return scoredRestaurants
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
}

// 计算匹配分数（简化版）
function calculateMatchScore(restaurant) {
    let score = 50;
    
    // 菜系匹配
    if (userProfile.preferredCuisines.includes(restaurant.cuisine)) {
        score += 40;
    }
    
    // 籍贯加成
    const bonusMap = {
        '川菜': { '四川': 15 },
        '湘菜': { '湖南': 15 },
        '徽菜': { '安徽': 15 },
        '本帮菜': { '上海': 10 }
    };
    
    if (bonusMap[restaurant.cuisine] && bonusMap[restaurant.cuisine][userProfile.hometown]) {
        score += bonusMap[restaurant.cuisine][userProfile.hometown];
    }
    
    // 距离加分
    if (restaurant.distance <= 300) {
        score += 10;
    }
    
    // 价格合理性
    const [min, max] = parseBudgetRange(userProfile.budget);
    if (restaurant.avgPrice >= min && restaurant.avgPrice <= max) {
        score += 15;
    }
    
    return Math.min(score, 100);
}

// 获取匹配原因
function getMatchReasons(restaurant) {
    const reasons = [];
    
    if (userProfile.preferredCuisines.includes(restaurant.cuisine)) {
        reasons.push('符合您的菜系偏好');
    }
    
    if (restaurant.distance <= 300) {
        reasons.push('距离很近，步行即可');
    }
    
    if (restaurant.avgPrice <= 40) {
        reasons.push('价格实惠，性价比高');
    }
    
    return reasons.slice(0, 3);
}

// 解析预算范围
function parseBudgetRange(budget) {
    const rangeMap = {
        '20-30': [20, 30],
        '30-50': [30, 50],
        '50-80': [50, 80],
        '80-100': [80, 100],
        '100+': [100, 200]
    };
    
    return rangeMap[budget] || [30, 50];
}

// 显示推荐结果
function displayRecommendations() {
    const container = document.getElementById('recommendationsList');
    container.innerHTML = '';
    
    currentRecommendations.forEach((restaurant, index) => {
        const item = createRestaurantItem(restaurant, index);
        container.appendChild(item);
    });
}

// 创建餐厅项目
function createRestaurantItem(restaurant, index) {
    const item = document.createElement('div');
    item.className = 'restaurant-item fade-in';
    item.style.animationDelay = `${index * 0.1}s`;
    
    const reasonsHtml = restaurant.reasons.map(reason => 
        `<span class="reason">• ${reason}</span>`
    ).join(' ');
    
    const tagsHtml = restaurant.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    item.innerHTML = `
        <div class="restaurant-header">
            <div class="restaurant-name">${restaurant.name}</div>
            <div class="restaurant-rating">
                <span class="rating-score">${restaurant.rating}</span>
                <span>⭐</span>
            </div>
        </div>
        
        <div class="restaurant-details">
            <span class="restaurant-cuisine">${restaurant.cuisine}</span>
            <span>📍 ${restaurant.distance}m</span>
            <span>💰 人均¥${restaurant.avgPrice}</span>
        </div>
        
        <div class="restaurant-tags">
            ${tagsHtml}
        </div>
        
        <div class="match-score">
            <div class="match-reasons">${reasonsHtml}</div>
            <div class="match-percentage">${restaurant.matchScore}%</div>
        </div>
    `;
    
    item.addEventListener('click', () => showRestaurantDetails(restaurant));
    
    return item;
}

// 显示餐厅详情
function showRestaurantDetails(restaurant) {
    const modal = document.getElementById('restaurantModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h2>${restaurant.name}</h2>
        <div class="restaurant-info">
            <p><strong>菜系：</strong>${restaurant.cuisine}</p>
            <p><strong>评分：</strong>${restaurant.rating} ⭐</p>
            <p><strong>距离：</strong>${restaurant.distance}m</p>
            <p><strong>人均：</strong>¥${restaurant.avgPrice}</p>
            <p><strong>地址：</strong>${restaurant.address}</p>
            <p><strong>电话：</strong>${restaurant.phone}</p>
        </div>
        <div class="restaurant-description">
            <p>${restaurant.description}</p>
        </div>
        <div class="restaurant-actions">
            <button class="btn btn-primary" onclick="addToVote('${restaurant.id}')">加入投票</button>
            <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    document.getElementById('restaurantModal').style.display = 'none';
}

// 添加到投票
function addToVote(restaurantId) {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant && !votes[restaurantId]) {
        votes[restaurantId] = {
            restaurant: restaurant,
            count: 0,
            voters: []
        };
        
        updateVoteDisplay();
        closeModal();
        
        setTimeout(() => {
            alert(`已将 ${restaurant.name} 加入投票列表`);
        }, 300);
    }
}

// 更新投票显示
function updateVoteDisplay() {
    const container = document.getElementById('voteList');
    container.innerHTML = '';
    
    Object.values(votes).forEach(vote => {
        const item = document.createElement('div');
        item.className = 'vote-item';
        
        item.innerHTML = `
            <div class="vote-restaurant">
                <div class="restaurant-name">${vote.restaurant.name}</div>
                <div class="restaurant-details">
                    ${vote.restaurant.cuisine} · ${vote.restaurant.distance}m · ¥${vote.restaurant.avgPrice}
                </div>
            </div>
            <div class="vote-actions">
                <span class="vote-count">${vote.count} 票</span>
                <button class="vote-btn" onclick="castVote('${vote.restaurant.id}')" 
                        ${vote.voters.includes('user') ? 'disabled' : ''}>
                    ${vote.voters.includes('user') ? '已投票' : '投票'}
                </button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// 投票
function castVote(restaurantId) {
    if (votes[restaurantId] && !votes[restaurantId].voters.includes('user')) {
        votes[restaurantId].count++;
        votes[restaurantId].voters.push('user');
        
        setTimeout(() => {
            simulateTeamVotes();
        }, 1000);
        
        updateVoteDisplay();
    }
}

// 模拟团队投票
function simulateTeamVotes() {
    const members = ['member1', 'member2', 'member3'];
    const voteIds = Object.keys(votes);
    
    members.forEach(member => {
        const randomRestaurant = voteIds[Math.floor(Math.random() * voteIds.length)];
        if (!votes[randomRestaurant].voters.includes(member)) {
            votes[randomRestaurant].count++;
            votes[randomRestaurant].voters.push(member);
        }
    });
    
    updateVoteDisplay();
    showVoteResults();
}

// 显示投票结果
function showVoteResults() {
    const results = Object.values(votes).sort((a, b) => b.count - a.count);
    const winner = results[0];
    
    if (winner && winner.count > 0) {
        const resultsContainer = document.getElementById('voteResults');
        const winnerContainer = document.getElementById('winnerResult');
        
        winnerContainer.innerHTML = `
            <div class="winner-restaurant">
                <h3>${winner.restaurant.name}</h3>
                <p>获得 ${winner.count} 票，成为团队午餐首选！</p>
                <div class="winner-details">
                    ${winner.restaurant.cuisine} · ${winner.restaurant.distance}m · ¥${winner.restaurant.avgPrice}
                </div>
                <button class="btn btn-primary" onclick="finalizeChoice('${winner.restaurant.id}')">
                    确认选择
                </button>
            </div>
        `;
        
        resultsContainer.style.display = 'block';
    }
}

// 确认选择
function finalizeChoice(restaurantId) {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    alert(`太好了！今天的午餐就定在 ${restaurant.name} 了！\n\n📍 ${restaurant.address}\n📞 ${restaurant.phone}\n\n大家记得准时哦~ 🍽️`);
}

// 页面切换函数
function showProfile() {
    hideAllSections();
    document.getElementById('profileSection').style.display = 'block';
    updateNavigation('profile');
}

function showRecommendations() {
    if (currentRecommendations.length === 0) {
        alert('请先生成推荐结果');
        return;
    }
    hideAllSections();
    document.getElementById('recommendationsSection').style.display = 'block';
    updateNavigation('recommendations');
}

function showVote() {
    if (Object.keys(votes).length === 0) {
        alert('请先添加餐厅到投票列表');
        return;
    }
    hideAllSections();
    document.getElementById('voteSection').style.display = 'block';
    updateNavigation('vote');
}

function hideAllSections() {
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('recommendationsSection').style.display = 'none';
    document.getElementById('voteSection').style.display = 'none';
}

function updateNavigation(active) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeMap = {
        'profile': 0,
        'recommendations': 1,
        'vote': 2
    };
    
    if (activeMap[active] !== undefined) {
        navItems[activeMap[active]].classList.add('active');
    }
}

// 显示加载状态
function showLoading() {
    const container = document.getElementById('recommendationsList');
    container.innerHTML = '<div class="loading">正在分析您的口味偏好...</div>';
}

function hideLoading() {
    // 加载完成后会被推荐结果替换
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('restaurantModal');
    if (event.target === modal) {
        closeModal();
    }
}
