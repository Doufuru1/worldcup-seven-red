// DevLend DApp - AI资产质押平台
const App = {
    state: {
        currentPage: 'home',
        wallet: {
            connected: false,
            address: null,
            chainId: null
        },
        user: {
            balance: '0.00',
            staked: '0.00',
            rewards: '0.00',
            hashrate: '0'
        }
    },

    init() {
        this.setupEventListeners();
        this.render();
    },

    // ===== 页面渲染 =====
    pages: {
        home: () => `
            <header class="top-header">
                <div class="logo">
                    <img src="logo.jpg" alt="DevLend">
                    <span class="logo-text">DevLend</span>
                </div>
                <div class="header-actions">
                    <button class="wallet-btn" id="walletBtn">
                        <span>${App.state.wallet.connected ? App.formatAddress(App.state.wallet.address) : '链接钱包'}</span>
                    </button>
                    <button class="lang-btn">🌐</button>
                </div>
            </header>
            
            <div class="page-content">
                <section class="hero-section">
                    <div class="hero-logo">
                        <img src="logo.jpg" alt="DevLend Logo">
                    </div>
                    <h1 class="hero-title">DevLend</h1>
                    <p class="hero-subtitle">AI资产质押平台<br>开启智能挖矿新时代</p>
                    <button class="cta-button" onclick="App.navigateTo('mining')">立即质押</button>
                </section>
                
                <section class="features-section">
                    <h2 class="section-title">核心<span class="highlight">功能</span></h2>
                    
                    <div class="feature-card" onclick="App.navigateTo('mining')">
                        <div class="feature-info">
                            <h3>质押入口</h3>
                            <p>质押UUSD获取高收益</p>
                        </div>
                        <div class="feature-icon">⛏️</div>
                    </div>
                    
                    <div class="feature-grid">
                        <div class="feature-grid-item" onclick="App.showClaimModal()">
                            <div class="icon">💰</div>
                            <h4>收益领取</h4>
                            <p>领取挖矿奖励</p>
                        </div>
                        <div class="feature-grid-item" onclick="App.navigateTo('nodes')">
                            <div class="icon">🎁</div>
                            <h4>FOMO奖励</h4>
                            <p>节点分红奖励</p>
                        </div>
                        <div class="feature-grid-item" onclick="App.navigateTo('trade')">
                            <div class="icon">🔄</div>
                            <h4>生态资金</h4>
                            <p>交易兑换</p>
                        </div>
                    </div>
                </section>
            </div>
        `,

        mining: () => `
            <header class="top-header">
                <div class="logo">
                    <span class="logo-text">算力挖矿</span>
                </div>
                <div class="header-actions">
                    <button class="wallet-btn" id="walletBtn">
                        <span>${App.state.wallet.connected ? App.formatAddress(App.state.wallet.address) : '链接钱包'}</span>
                    </button>
                </div>
            </header>
            
            <div class="page-content">
                <section class="mining-stats">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="label">我的算力</div>
                            <div class="value">${App.state.user.hashrate}</div>
                            <div class="unit">TH/s</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">累计收益</div>
                            <div class="value">${App.state.user.rewards}</div>
                            <div class="unit">USDT</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">质押金额</div>
                            <div class="value">${App.state.user.staked}</div>
                            <div class="unit">USDT</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">钱包余额</div>
                            <div class="value">${App.state.user.balance}</div>
                            <div class="unit">USDT</div>
                        </div>
                    </div>
                </section>
                
                <section class="mining-pools">
                    <h2 class="section-title">矿池<span class="highlight">列表</span></h2>
                    
                    <div class="pool-card">
                        <div class="pool-header">
                            <div class="pool-name">
                                <div class="icon">⚡</div>
                                <div>
                                    <h3>USDT 矿池</h3>
                                    <span>稳定币质押</span>
                                </div>
                            </div>
                            <div class="pool-apr">
                                <div class="label">年化收益</div>
                                <div class="value">12.5%</div>
                            </div>
                        </div>
                        <div class="pool-stats">
                            <div class="pool-stat">
                                <div class="label">总质押</div>
                                <div class="value">2.5M</div>
                            </div>
                            <div class="pool-stat">
                                <div class="label">剩余额度</div>
                                <div class="value">500K</div>
                            </div>
                            <div class="pool-stat">
                                <div class="label">参与人数</div>
                                <div class="value">1,234</div>
                            </div>
                        </div>
                        <div class="pool-actions">
                            <button class="btn-primary" onclick="App.showStakeModal('USDT')">质押</button>
                            <button class="btn-secondary" onclick="App.showUnstakeModal('USDT')">赎回</button>
                        </div>
                    </div>
                    
                    <div class="pool-card">
                        <div class="pool-header">
                            <div class="pool-name">
                                <div class="icon">🔷</div>
                                <div>
                                    <h3>UUSD 矿池</h3>
                                    <span>平台币质押</span>
                                </div>
                            </div>
                            <div class="pool-apr">
                                <div class="label">年化收益</div>
                                <div class="value">25.8%</div>
                            </div>
                        </div>
                        <div class="pool-stats">
                            <div class="pool-stat">
                                <div class="label">总质押</div>
                                <div class="value">1.8M</div>
                            </div>
                            <div class="pool-stat">
                                <div class="label">剩余额度</div>
                                <div class="value">200K</div>
                            </div>
                            <div class="pool-stat">
                                <div class="label">参与人数</div>
                                <div class="value">856</div>
                            </div>
                        </div>
                        <div class="pool-actions">
                            <button class="btn-primary" onclick="App.showStakeModal('UUSD')">质押</button>
                            <button class="btn-secondary" onclick="App.showUnstakeModal('UUSD')">赎回</button>
                        </div>
                    </div>
                </section>
            </div>
        `,

        trade: () => `
            <header class="top-header">
                <div class="logo">
                    <span class="logo-text">交易</span>
                </div>
                <div class="header-actions">
                    <button class="wallet-btn" id="walletBtn">
                        <span>${App.state.wallet.connected ? App.formatAddress(App.state.wallet.address) : '链接钱包'}</span>
                    </button>
                </div>
            </header>
            
            <div class="page-content">
                <section class="trade-container">
                    <div class="trade-card">
                        <div class="trade-tabs">
                            <button class="trade-tab active" data-tab="swap">兑换</button>
                            <button class="trade-tab" data-tab="liquidity">流动性</button>
                        </div>
                        
                        <div class="trade-input-group">
                            <label>支付</label>
                            <div class="trade-input">
                                <input type="number" placeholder="0.0" id="fromAmount">
                                <div class="token-select">
                                    <span>USDT</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="swap-divider">
                            <button class="swap-btn">⇅</button>
                        </div>
                        
                        <div class="trade-input-group">
                            <label>接收</label>
                            <div class="trade-input">
                                <input type="number" placeholder="0.0" id="toAmount" readonly>
                                <div class="token-select">
                                    <span>UUSD</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="trade-info">
                            <div class="trade-info-row">
                                <span class="label">汇率</span>
                                <span class="value">1 USDT = 1.02 UUSD</span>
                            </div>
                            <div class="trade-info-row">
                                <span class="label">滑点</span>
                                <span class="value">0.5%</span>
                            </div>
                            <div class="trade-info-row">
                                <span class="label">手续费</span>
                                <span class="value">0.3%</span>
                            </div>
                        </div>
                        
                        <button class="cta-button" style="width: 100%; margin-top: 16px;">
                            ${App.state.wallet.connected ? '确认兑换' : '连接钱包'}
                        </button>
                    </div>
                </section>
            </div>
        `,

        nodes: () => `
            <header class="top-header">
                <div class="logo">
                    <span class="logo-text">节点</span>
                </div>
                <div class="header-actions">
                    <button class="wallet-btn" id="walletBtn">
                        <span>${App.state.wallet.connected ? App.formatAddress(App.state.wallet.address) : '链接钱包'}</span>
                    </button>
                </div>
            </header>
            
            <div class="page-content">
                <section class="nodes-container">
                    <h2 class="section-title">节点<span class="highlight">等级</span></h2>
                    
                    <div class="node-tier bronze">
                        <div class="node-tier-header">
                            <div class="node-tier-name">
                                <span class="badge badge-bronze">青铜节点</span>
                            </div>
                        </div>
                        <ul class="node-tier-benefits">
                            <li>每日挖矿收益加成 5%</li>
                            <li>交易手续费折扣 10%</li>
                            <li>邀请奖励加成 5%</li>
                        </ul>
                        <div class="node-tier-price">
                            <span class="value">1,000</span>
                            <span class="unit">UUSD</span>
                        </div>
                        <button class="btn-primary" style="width: 100%;">购买节点</button>
                    </div>
                    
                    <div class="node-tier silver">
                        <div class="node-tier-header">
                            <div class="node-tier-name">
                                <span class="badge badge-silver">白银节点</span>
                            </div>
                        </div>
                        <ul class="node-tier-benefits">
                            <li>每日挖矿收益加成 15%</li>
                            <li>交易手续费折扣 20%</li>
                            <li>邀请奖励加成 10%</li>
                        </ul>
                        <div class="node-tier-price">
                            <span class="value">5,000</span>
                            <span class="unit">UUSD</span>
                        </div>
                        <button class="btn-primary" style="width: 100%;">购买节点</button>
                    </div>
                    
                    <div class="node-tier gold">
                        <div class="node-tier-header">
                            <div class="node-tier-name">
                                <span class="badge badge-gold">黄金节点</span>
                            </div>
                        </div>
                        <ul class="node-tier-benefits">
                            <li>每日挖矿收益加成 30%</li>
                            <li>交易手续费折扣 35%</li>
                            <li>邀请奖励加成 20%</li>
                        </ul>
                        <div class="node-tier-price">
                            <span class="value">20,000</span>
                            <span class="unit">UUSD</span>
                        </div>
                        <button class="btn-primary" style="width: 100%;">购买节点</button>
                    </div>
                    
                    <div class="node-tier platinum">
                        <div class="node-tier-header">
                            <div class="node-tier-name">
                                <span class="badge badge-platinum">白金节点</span>
                            </div>
                        </div>
                        <ul class="node-tier-benefits">
                            <li>每日挖矿收益加成 50%</li>
                            <li>交易手续费折扣 50%</li>
                            <li>邀请奖励加成 30%</li>
                            <li>专属客服支持</li>
                        </ul>
                        <div class="node-tier-price">
                            <span class="value">100,000</span>
                            <span class="unit">UUSD</span>
                        </div>
                        <button class="btn-primary" style="width: 100%;">购买节点</button>
                    </div>
                </section>
            </div>
        `,

        profile: () => `
            <header class="top-header">
                <div class="logo">
                    <span class="logo-text">我的</span>
                </div>
                <div class="header-actions">
                    <button class="lang-btn">🌐</button>
                </div>
            </header>
            
            <div class="page-content">
                <section class="profile-header">
                    <div class="profile-avatar">
                        <div class="profile-avatar-inner">👤</div>
                    </div>
                    <div class="profile-address">
                        ${App.state.wallet.connected ? App.formatAddress(App.state.wallet.address) : '未连接钱包'}
                    </div>
                    ${App.state.wallet.connected ? '<span class="profile-network">● BSC 主网</span>' : ''}
                </section>
                
                <section class="profile-stats">
                    <div class="profile-stat">
                        <div class="value">${App.state.user.balance}</div>
                        <div class="label">钱包余额</div>
                    </div>
                    <div class="profile-stat">
                        <div class="value">${App.state.user.staked}</div>
                        <div class="label">质押金额</div>
                    </div>
                    <div class="profile-stat">
                        <div class="value">${App.state.user.rewards}</div>
                        <div class="label">待领取收益</div>
                    </div>
                </section>
                
                <section class="profile-menu">
                    <div class="menu-group">
                        <div class="menu-item" onclick="App.navigateTo('mining')">
                            <div class="menu-item-left">
                                <div class="icon">⛏️</div>
                                <span>我的矿池</span>
                            </div>
                            <div class="menu-item-right">›</div>
                        </div>
                        <div class="menu-item" onclick="App.showClaimModal()">
                            <div class="menu-item-left">
                                <div class="icon">🎁</div>
                                <span>领取奖励</span>
                            </div>
                            <div class="menu-item-right">
                                <span class="badge">${parseFloat(App.state.user.rewards) > 0 ? '可领' : ''}</span>
                                ›
                            </div>
                        </div>
                        <div class="menu-item">
                            <div class="menu-item-left">
                                <div class="icon">📋</div>
                                <span>订单记录</span>
                            </div>
                            <div class="menu-item-right">›</div>
                        </div>
                    </div>
                    
                    <div class="menu-group">
                        <div class="menu-item">
                            <div class="menu-item-left">
                                <div class="icon">👥</div>
                                <span>邀请好友</span>
                            </div>
                            <div class="menu-item-right">›</div>
                        </div>
                        <div class="menu-item">
                            <div class="menu-item-left">
                                <div class="icon">⚙️</div>
                                <span>设置</span>
                            </div>
                            <div class="menu-item-right">›</div>
                        </div>
                        <div class="menu-item">
                            <div class="menu-item-left">
                                <div class="icon">❓</div>
                                <span>帮助中心</span>
                            </div>
                            <div class="menu-item-right">›</div>
                        </div>
                    </div>
                    
                    ${App.state.wallet.connected ? `
                    <button class="btn-secondary" style="width: 100%; margin-top: 20px; padding: 14px;" onclick="App.disconnectWallet()">
                        断开钱包连接
                    </button>
                    ` : ''}
                </section>
            </div>
        `
    },

    // ===== 工具函数 =====
    formatAddress(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    },

    navigateTo(page) {
        this.state.currentPage = page;
        this.render();
        this.updateNavActive();
    },

    updateNavActive() {
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === this.state.currentPage);
        });
    },

    render() {
        const app = document.getElementById('app');
        app.innerHTML = this.pages[this.state.currentPage]();
        
        // 重新绑定钱包按钮事件
        const walletBtn = document.getElementById('walletBtn');
        if (walletBtn) {
            walletBtn.addEventListener('click', () => this.toggleWalletModal());
        }
    },

    // ===== 钱包功能 =====
    toggleWalletModal() {
        if (this.state.wallet.connected) {
            return;
        }
        document.getElementById('walletModal').classList.add('open');
    },

    closeWalletModal() {
        document.getElementById('walletModal').classList.remove('open');
    },

    connectWallet(type) {
        // 模拟钱包连接
        this.state.wallet.connected = true;
        this.state.wallet.address = '0x' + Array(40).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
        this.state.user.balance = (Math.random() * 10000).toFixed(2);
        this.state.user.staked = (Math.random() * 5000).toFixed(2);
        this.state.user.rewards = (Math.random() * 500).toFixed(2);
        this.state.user.hashrate = Math.floor(Math.random() * 1000);
        
        this.closeWalletModal();
        this.render();
        this.showToast('钱包连接成功！', '✅');
    },

    disconnectWallet() {
        this.state.wallet.connected = false;
        this.state.wallet.address = null;
        this.state.user = { balance: '0.00', staked: '0.00', rewards: '0.00', hashrate: '0' };
        this.render();
        this.showToast('钱包已断开连接', '👋');
    },

    // ===== 领取奖励 =====
    showClaimModal() {
        const modal = document.getElementById('claimModal');
        const amountEl = document.getElementById('claimAmount');
        if (amountEl) {
            amountEl.textContent = this.state.user.rewards + ' USDT';
        }
        modal.classList.add('open');
    },

    closeClaimModal() {
        document.getElementById('claimModal').classList.remove('open');
    },

    claimRewards() {
        const btn = document.getElementById('confirmClaim');
        btn.textContent = '领取中...';
        btn.disabled = true;
        
        setTimeout(() => {
            this.state.user.rewards = '0.00';
            btn.textContent = '领取成功！';
            btn.style.background = '#10B981';
            
            setTimeout(() => {
                this.closeClaimModal();
                this.render();
                this.showToast('奖励领取成功！', '🎉');
            }, 1500);
        }, 2000);
    },

    // ===== 质押功能 =====
    showStakeModal(token) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.id = 'stakeModal';
        modal.innerHTML = `
            <div class="bottom-sheet">
                <div class="bottom-sheet-handle"></div>
                <div class="bottom-sheet-header">
                    <h3>质押 ${token}</h3>
                    <button class="sheet-close" onclick="App.closeModal('stakeModal')">✕</button>
                </div>
                <div class="bottom-sheet-body">
                    <div class="trade-input-group">
                        <label>质押数量</label>
                        <div class="trade-input">
                            <input type="number" placeholder="0.0" id="stakeAmount">
                            <div class="token-select">
                                <span>${token}</span>
                            </div>
                        </div>
                    </div>
                    <div class="trade-info">
                        <div class="trade-info-row">
                            <span class="label">钱包余额</span>
                            <span class="value">${this.state.user.balance} ${token}</span>
                        </div>
                        <div class="trade-info-row">
                            <span class="label">预期年化</span>
                            <span class="value" style="color: #10B981;">12.5%</span>
                        </div>
                    </div>
                    <button class="submit-btn" style="margin-top: 16px;" onclick="App.executeStake('${token}')">确认质押</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    showUnstakeModal(token) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.id = 'unstakeModal';
        modal.innerHTML = `
            <div class="bottom-sheet">
                <div class="bottom-sheet-handle"></div>
                <div class="bottom-sheet-header">
                    <h3>赎回 ${token}</h3>
                    <button class="sheet-close" onclick="App.closeModal('unstakeModal')">✕</button>
                </div>
                <div class="bottom-sheet-body">
                    <div class="trade-input-group">
                        <label>赎回数量</label>
                        <div class="trade-input">
                            <input type="number" placeholder="0.0" id="unstakeAmount">
                            <div class="token-select">
                                <span>${token}</span>
                            </div>
                        </div>
                    </div>
                    <div class="trade-info">
                        <div class="trade-info-row">
                            <span class="label">已质押</span>
                            <span class="value">${this.state.user.staked} ${token}</span>
                        </div>
                    </div>
                    <button class="submit-btn" style="margin-top: 16px;" onclick="App.executeUnstake('${token}')">确认赎回</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    },

    executeStake(token) {
        const amount = parseFloat(document.getElementById('stakeAmount').value);
        if (!amount || amount <= 0) {
            this.showToast('请输入有效的质押数量', '⚠️');
            return;
        }
        
        const btn = document.querySelector('#stakeModal .submit-btn');
        btn.textContent = '质押中...';
        btn.disabled = true;
        
        setTimeout(() => {
            this.state.user.staked = (parseFloat(this.state.user.staked) + amount).toFixed(2);
            this.state.user.balance = (parseFloat(this.state.user.balance) - amount).toFixed(2);
            this.closeModal('stakeModal');
            this.render();
            this.showToast(`成功质押 ${amount} ${token}`, '🎉');
        }, 2000);
    },

    executeUnstake(token) {
        const amount = parseFloat(document.getElementById('unstakeAmount').value);
        if (!amount || amount <= 0) {
            this.showToast('请输入有效的赎回数量', '⚠️');
            return;
        }
        
        const btn = document.querySelector('#unstakeModal .submit-btn');
        btn.textContent = '赎回中...';
        btn.disabled = true;
        
        setTimeout(() => {
            this.state.user.staked = (parseFloat(this.state.user.staked) - amount).toFixed(2);
            this.state.user.balance = (parseFloat(this.state.user.balance) + amount).toFixed(2);
            this.closeModal('unstakeModal');
            this.render();
            this.showToast(`成功赎回 ${amount} ${token}`, '🎉');
        }, 2000);
    },

    // ===== Toast =====
    showToast(message, icon = '✅') {
        const toast = document.getElementById('toast');
        document.getElementById('toastIcon').textContent = icon;
        document.getElementById('toastMessage').textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    // ===== 事件监听 =====
    setupEventListeners() {
        // 底部导航
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(item.dataset.page);
            });
        });

        // 关闭钱包弹窗
        document.getElementById('walletModalClose').addEventListener('click', () => this.closeWalletModal());
        document.getElementById('walletModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeWalletModal();
        });

        // 钱包选项
        document.querySelectorAll('.wallet-card').forEach(option => {
            option.addEventListener('click', () => {
                this.connectWallet(option.dataset.wallet);
            });
        });

        // 关闭领取弹窗
        document.getElementById('claimModalClose').addEventListener('click', () => this.closeClaimModal());
        document.getElementById('claimModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeClaimModal();
        });

        // 确认领取
        document.getElementById('confirmClaim').addEventListener('click', () => this.claimRewards());

        // 交易标签切换
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('trade-tab')) {
                document.querySelectorAll('.trade-tab').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
