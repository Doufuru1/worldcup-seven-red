// World Cup 2026 Prediction Platform - App Logic
// 更新内容：
// 1. 添加平台机制页面
// 2. 首页显示当天可下注赛事 + 下注规则
// 3. 预测逻辑：开赛前可下注，比赛开始锁定
// 4. 个人界面：增加领取奖励按钮给赢家

const App = {
    // State
    state: {
        wallet: {
            connected: false,
            address: '',
            balance: 10000
        },
        matches: [],
        predictions: [],
        leaderboard: [],
        currentMatch: null,
        selectedOutcome: null,
        currentPage: 'home'
    },

    // Teams data - 48 teams for 2026 World Cup
    teams: [
        { name: 'Argentina', flag: '🇦🇷', code: 'ARG', group: 'A' },
        { name: 'Mexico', flag: '🇲🇽', code: 'MEX', group: 'A' },
        { name: 'USA', flag: '🇺🇸', code: 'USA', group: 'A' },
        { name: 'Germany', flag: '🇩🇪', code: 'GER', group: 'B' },
        { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', group: 'B' },
        { name: 'Italy', flag: '🇮🇹', code: 'ITA', group: 'C' },
        { name: 'Belgium', flag: '🇧🇪', code: 'BEL', group: 'C' },
        { name: 'France', flag: '🇫🇷', code: 'FRA', group: 'D' },
        { name: 'Netherlands', flag: '🇳🇱', code: 'NED', group: 'D' },
        { name: 'Spain', flag: '🇪🇸', code: 'ESP', group: 'E' },
        { name: 'Japan', flag: '🇯🇵', code: 'JPN', group: 'E' },
        { name: 'Croatia', flag: '🇭🇷', code: 'CRO', group: 'F' },
        { name: 'South Korea', flag: '🇰🇷', code: 'KOR', group: 'F' },
        { name: 'Brazil', flag: '🇧🇷', code: 'BRA', group: 'G' },
        { name: 'Portugal', flag: '🇵🇹', code: 'POR', group: 'H' },
        { name: 'Uruguay', flag: '🇺🇾', code: 'URU', group: 'H' }
    ],

    init() {
        this.loadMatches();
        this.loadLeaderboard();
        this.loadPredictions();
        this.setupEventListeners();
        this.renderMatches('today');
        this.renderLeaderboard();
        this.renderPredictions();
        this.updateWalletUI();
    },

    loadMatches() {
        const now = new Date();
        const matches = [];
        let matchId = 1;

        // Generate group stage matches
        const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        groups.forEach(group => {
            const groupTeams = this.teams.filter(t => t.group === group);
            if (groupTeams.length >= 2) {
                for (let i = 0; i < groupTeams.length; i++) {
                    for (let j = i + 1; j < groupTeams.length; j++) {
                        // Create matches with different dates - some today, some upcoming, some finished
                        const dayOffset = (matchId % 5) - 2; // -2, -1, 0, 1, 2 days from now
                        const matchDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
                        matchDate.setHours(14 + (matchId % 8), 0, 0, 0); // Different times

                        const odds = {
                            home: (1.5 + Math.random() * 2).toFixed(2),
                            draw: (2.5 + Math.random() * 1.5).toFixed(2),
                            away: (1.8 + Math.random() * 2.2).toFixed(2)
                        };

                        // Determine status based on date
                        let status = 'upcoming';
                        let score = { home: 0, away: 0 };
                        let actualResult = null;

                        if (matchDate < now) {
                            // Match has started or finished
                            const hoursSinceStart = (now - matchDate) / (1000 * 60 * 60);
                            if (hoursSinceStart < 2) {
                                status = 'live';
                                score = { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 3) };
                            } else {
                                status = 'finished';
                                score = { home: Math.floor(Math.random() * 4), away: Math.floor(Math.random() * 4) };
                                // Determine actual result
                                if (score.home > score.away) actualResult = 'home';
                                else if (score.home < score.away) actualResult = 'away';
                                else actualResult = 'draw';
                            }
                        }

                        matches.push({
                            id: matchId++,
                            homeTeam: groupTeams[i],
                            awayTeam: groupTeams[j],
                            date: matchDate,
                            stage: 'Group Stage',
                            group: group,
                            odds: odds,
                            status: status,
                            score: score,
                            actualResult: actualResult,
                            totalBets: Math.floor(Math.random() * 500000) + 50000,
                            poolCapacity: 1000000
                        });
                    }
                }
            }
        });

        this.state.matches = matches;
    },

    loadLeaderboard() {
        const names = ['CryptoKing', 'PredictionPro', 'FootballFan', 'BetMaster', 'WorldCup2026', 'LuckyStrike', 'GoalHunter', 'MatchWizard', 'SoccerGuru', 'BettingExpert'];
        this.state.leaderboard = names.map((name, index) => ({
            rank: index + 1,
            name,
            avatar: ['🦁', '🦊', '🐯', '🐺', '🦅', '🐉', '🦉', '🐻', '🦈', '🐊'][index],
            predictions: Math.floor(Math.random() * 50) + 20,
            correct: Math.floor(Math.random() * 30) + 15,
            accuracy: (Math.random() * 30 + 50).toFixed(1),
            points: Math.floor(Math.random() * 50000) + 10000
        })).sort((a, b) => b.points - a.points);

        // Update ranks after sorting
        this.state.leaderboard.forEach((user, index) => {
            user.rank = index + 1;
        });
    },

    loadPredictions() {
        const saved = localStorage.getItem('worldcup_predictions');
        if (saved) {
            this.state.predictions = JSON.parse(saved);
            // Check for finished matches and update results
            this.updatePredictionResults();
        }
    },

    updatePredictionResults() {
        const now = new Date();
        this.state.predictions.forEach(pred => {
            const match = this.state.matches.find(m => m.id === pred.matchId);
            if (match && match.status === 'finished' && pred.result === 'pending') {
                // Determine if prediction is correct
                const outcomeMap = {
                    [match.homeTeam.name + ' Win']: 'home',
                    'Draw': 'draw',
                    [match.awayTeam.name + ' Win']: 'away'
                };
                const predictedResult = outcomeMap[pred.outcome];
                if (predictedResult === match.actualResult) {
                    pred.result = 'won';
                    pred.reward = pred.potentialWin;
                    pred.claimed = false;
                } else {
                    pred.result = 'lost';
                }
            }
        });
        this.savePredictions();
    },

    savePredictions() {
        localStorage.setItem('worldcup_predictions', JSON.stringify(this.state.predictions));
    },

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page || 'home';
                this.navigate(page);
            });
        });

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('open');
            });
        }

        // Wallet buttons
        const walletBtn = document.getElementById('walletBtn');
        const mobileWalletBtn = document.getElementById('mobileWalletBtn');
        if (walletBtn) walletBtn.addEventListener('click', () => this.openWalletModal());
        if (mobileWalletBtn) mobileWalletBtn.addEventListener('click', () => this.openWalletModal());

        // Wallet options
        document.querySelectorAll('.wallet-option').forEach(option => {
            option.addEventListener('click', () => this.connectWallet());
        });

        // Modal close buttons
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('walletModalClose')?.addEventListener('click', () => this.closeWalletModal());

        // Prediction options
        document.querySelectorAll('.prediction-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectOutcome(e.currentTarget.dataset.result));
        });

        // Stake input
        const stakeInput = document.getElementById('stakeInput');
        if (stakeInput) {
            stakeInput.addEventListener('input', () => this.updatePotentialWin());
        }

        // Submit prediction
        const submitBtn = document.getElementById('submitPrediction');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.placePrediction());
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterMatches(e.target.dataset.filter);
            });
        });

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                    this.closeWalletModal();
                }
            });
        });
    },

    navigate(page) {
        this.state.currentPage = page;
        
        // Update nav links
        document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Show/hide pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(page);
        if (targetPage) targetPage.classList.add('active');

        // Close mobile menu
        document.getElementById('mobileMenu')?.classList.remove('open');

        // Update page content
        if (page === 'home') this.renderMatches('today');
        if (page === 'predictions') this.renderPredictions();
        if (page === 'leaderboard') this.renderLeaderboard();

        window.scrollTo(0, 0);
    },

    renderMatches(filter = 'today') {
        const grid = document.getElementById('matchesGrid');
        if (!grid) return;

        const now = new Date();
        let matches = this.state.matches;

        if (filter === 'today') {
            // Show matches from today (same calendar day)
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            matches = matches.filter(m => m.date >= today && m.date < tomorrow && m.status === 'upcoming');
        } else if (filter === 'upcoming') {
            // Show future matches (not today)
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            matches = matches.filter(m => m.date >= tomorrow && m.status === 'upcoming');
        } else if (filter === 'live') {
            matches = matches.filter(m => m.status === 'live');
        } else if (filter === 'finished') {
            matches = matches.filter(m => m.status === 'finished');
        }

        // Sort by date
        matches.sort((a, b) => a.date - b.date);

        if (matches.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>暂无赛事</h3>
                    <p>该分类下暂时没有可下注的赛事</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = matches.map(match => this.createMatchCard(match)).join('');

        // Add click handlers
        grid.querySelectorAll('.match-card').forEach(card => {
            card.addEventListener('click', () => this.openPredictionModal(parseInt(card.dataset.matchId)));
        });
    },

    createMatchCard(match) {
        const isLive = match.status === 'live';
        const isFinished = match.status === 'finished';
        const isUpcoming = match.status === 'upcoming';
        
        const timeStr = match.date.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Calculate time until match starts
        const now = new Date();
        const timeUntil = match.date - now;
        const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
        
        let countdownText = '';
        if (isUpcoming && timeUntil > 0) {
            if (hoursUntil > 0) {
                countdownText = `<span class="countdown">${hoursUntil}小时 ${minutesUntil}分钟后开始</span>`;
            } else if (minutesUntil > 0) {
                countdownText = `<span class="countdown">${minutesUntil}分钟后开始</span>`;
            }
        }

        let statusBadge = '';
        if (isLive) {
            statusBadge = '<span class="match-time live"><span class="live-dot"></span> 进行中</span>';
        } else if (isFinished) {
            statusBadge = '<span class="match-time finished">已结束</span>';
        } else {
            statusBadge = `<span class="match-time">${timeStr}</span>${countdownText}`;
        }

        let betButton = '';
        if (isUpcoming) {
            betButton = `<button class="predict-btn ${!this.state.wallet.connected ? 'disabled' : ''}">
                ${this.state.wallet.connected ? '立即下注' : '连接钱包后下注'}
            </button>`;
        } else if (isLive) {
            betButton = `<button class="predict-btn disabled" disabled>已锁定</button>`;
        } else if (isFinished) {
            betButton = `<button class="predict-btn finished">已开奖</button>`;
        }

        return `
            <div class="match-card ${isLive ? 'live' : ''} ${isFinished ? 'finished' : ''}" data-match-id="${match.id}">
                <div class="match-status">
                    <span class="match-stage">${match.stage} · ${match.group}组</span>
                    ${statusBadge}
                </div>
                <div class="match-teams">
                    <div class="team">
                        <span class="team-flag">${match.homeTeam.flag}</span>
                        <div class="team-info">
                            <span class="team-name">${match.homeTeam.name}</span>
                            <span class="team-odds">${match.odds.home}x</span>
                        </div>
                    </div>
                    <div class="match-score">
                        ${isLive || isFinished ? 
                            `<span>${match.score.home}</span><span class="score-divider">-</span><span>${match.score.away}</span>` : 
                            '<span class="score-divider">VS</span>'}
                    </div>
                    <div class="team away">
                        <span class="team-flag">${match.awayTeam.flag}</span>
                        <div class="team-info">
                            <span class="team-name">${match.awayTeam.name}</span>
                            <span class="team-odds">${match.odds.away}x</span>
                        </div>
                    </div>
                </div>
                <div class="match-odds">
                    <button class="odds-btn" data-result="home">
                        <span>主胜</span>
                        <span class="odds-value">${match.odds.home}</span>
                    </button>
                    <button class="odds-btn" data-result="draw">
                        <span>平局</span>
                        <span class="odds-value">${match.odds.draw}</span>
                    </button>
                    <button class="odds-btn" data-result="away">
                        <span>客胜</span>
                        <span class="odds-value">${match.odds.away}</span>
                    </button>
                </div>
                ${betButton}
            </div>
        `;
    },

    filterMatches(filter) {
        this.renderMatches(filter);
    },

    openPredictionModal(matchId) {
        if (!this.state.wallet.connected) {
            this.showToast('请先连接钱包', '⚠️');
            this.openWalletModal();
            return;
        }

        const match = this.state.matches.find(m => m.id === matchId);
        if (!match) return;

        // Check if match is upcoming (can bet)
        if (match.status !== 'upcoming') {
            if (match.status === 'live') {
                this.showToast('比赛已开始，无法下注', '🔒');
            } else if (match.status === 'finished') {
                this.showToast('比赛已结束', '⏹️');
            }
            return;
        }

        this.state.currentMatch = match;
        this.state.selectedOutcome = null;

        // Update match status banner
        const statusBanner = document.getElementById('matchStatusBanner');
        if (statusBanner) {
            const now = new Date();
            const timeUntil = match.date - now;
            const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
            const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
            
            let timeText = '';
            if (hoursUntil > 0) {
                timeText = `${hoursUntil}小时 ${minutesUntil}分钟后开始`;
            } else if (minutesUntil > 0) {
                timeText = `${minutesUntil}分钟后开始`;
            } else {
                timeText = '即将开始';
            }

            statusBanner.innerHTML = `
                <div class="status-banner-content">
                    <span class="status-icon">⏰</span>
                    <span class="status-text">${timeText}</span>
                    <span class="status-note">开赛前可下注，比赛开始后锁定</span>
                </div>
            `;
        }

        // Update modal content
        document.getElementById('homeTeamName').textContent = match.homeTeam.name;
        document.getElementById('awayTeamName').textContent = match.awayTeam.name;
        document.getElementById('homeOdds').textContent = match.odds.home + 'x';
        document.getElementById('drawOdds').textContent = match.odds.draw + 'x';
        document.getElementById('awayOdds').textContent = match.odds.away + 'x';

        const preview = document.getElementById('modalMatchPreview');
        if (preview) {
            preview.innerHTML = `
                <div class="preview-team">
                    <span class="team-flag">${match.homeTeam.flag}</span>
                    <span class="team-name">${match.homeTeam.name}</span>
                </div>
                <span class="preview-vs">VS</span>
                <div class="preview-team">
                    <span class="team-flag">${match.awayTeam.flag}</span>
                    <span class="team-name">${match.awayTeam.name}</span>
                </div>
            `;
        }

        // Reset form
        document.querySelectorAll('.prediction-option').forEach(opt => opt.classList.remove('selected'));
        document.getElementById('stakeInput').value = '';
        document.getElementById('potentialWin').textContent = '0.00 USDT';
        document.getElementById('submitPrediction').disabled = true;
        document.getElementById('walletBalance').textContent = this.state.wallet.balance.toFixed(2);

        document.getElementById('predictionModal').classList.add('open');
    },

    closeModal() {
        document.getElementById('predictionModal').classList.remove('open');
        this.state.currentMatch = null;
        this.state.selectedOutcome = null;
    },

    openWalletModal() {
        document.getElementById('walletModal').classList.add('open');
    },

    closeWalletModal() {
        document.getElementById('walletModal').classList.remove('open');
    },

    connectWallet() {
        // Simulate wallet connection
        this.state.wallet.connected = true;
        this.state.wallet.address = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        this.state.wallet.balance = 10000;

        this.updateWalletUI();
        this.closeWalletModal();
        this.showToast('钱包连接成功！', '✅');

        // Re-render matches to update button states
        this.renderMatches('today');
    },

    updateWalletUI() {
        const walletBtn = document.getElementById('walletBtn');
        const mobileWalletBtn = document.getElementById('mobileWalletBtn');

        if (this.state.wallet.connected) {
            const shortAddress = this.state.wallet.address.slice(0, 6) + '...' + this.state.wallet.address.slice(-4);
            if (walletBtn) {
                walletBtn.innerHTML = `<span class="wallet-icon">💼</span><span class="wallet-text">${shortAddress}</span>`;
                walletBtn.classList.add('connected');
            }
            if (mobileWalletBtn) {
                mobileWalletBtn.innerHTML = `<span class="wallet-icon">💼</span><span class="wallet-text">${shortAddress}</span>`;
                mobileWalletBtn.classList.add('connected');
            }
        }
    },

    selectOutcome(result) {
        this.state.selectedOutcome = result;
        document.querySelectorAll('.prediction-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.result === result);
        });
        this.updatePotentialWin();
    },

    updatePotentialWin() {
        const stake = parseFloat(document.getElementById('stakeInput').value) || 0;
        const match = this.state.currentMatch;
        const outcome = this.state.selectedOutcome;

        if (!match || !outcome || stake <= 0) {
            document.getElementById('potentialWin').textContent = '0.00 USDT';
            document.getElementById('submitPrediction').disabled = true;
            return;
        }

        const odds = parseFloat(match.odds[outcome]);
        const potentialWin = (stake * odds).toFixed(2);
        document.getElementById('potentialWin').textContent = `${potentialWin} USDT`;
        document.getElementById('submitPrediction').disabled = false;
    },

    placePrediction() {
        const stake = parseFloat(document.getElementById('stakeInput').value);
        const match = this.state.currentMatch;
        const outcome = this.state.selectedOutcome;

        if (!match || !outcome || !stake || stake <= 0) return;
        if (stake > this.state.wallet.balance) {
            this.showToast('余额不足', '❌');
            return;
        }

        // Check again if match is still upcoming
        if (match.status !== 'upcoming') {
            this.showToast('该赛事已无法下注', '🔒');
            this.closeModal();
            return;
        }

        const odds = parseFloat(match.odds[outcome]);
        const outcomeNames = {
            home: match.homeTeam.name + ' Win',
            draw: 'Draw',
            away: match.awayTeam.name + ' Win'
        };

        const prediction = {
            id: Date.now(),
            matchId: match.id,
            match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            outcome: outcomeNames[outcome],
            odds: odds,
            stake: stake,
            potentialWin: (stake * odds).toFixed(2),
            result: 'pending',
            claimed: false,
            date: new Date().toISOString(),
            matchDate: match.date.toISOString()
        };

        this.state.predictions.unshift(prediction);
        this.state.wallet.balance -= stake;
        this.savePredictions();

        this.closeModal();
        this.showToast('下注成功！', '✅');
        this.updateWalletUI();

        // Navigate to predictions page
        this.navigate('predictions');
    },

    claimReward(predictionId) {
        const prediction = this.state.predictions.find(p => p.id === predictionId);
        if (!prediction) return;

        if (prediction.result !== 'won') {
            this.showToast('该预测未中奖', '❌');
            return;
        }

        if (prediction.claimed) {
            this.showToast('奖励已领取', '⚠️');
            return;
        }

        // Add reward to balance
        const reward = parseFloat(prediction.potentialWin);
        this.state.wallet.balance += reward;
        prediction.claimed = true;
        this.savePredictions();

        this.updateWalletUI();
        this.renderPredictions();
        this.showToast(`成功领取 ${reward.toFixed(2)} USDT 奖励！`, '🎉');
    },

    renderPredictions() {
        const list = document.getElementById('predictionsList');
        const totalEl = document.getElementById('totalPredictions');
        const correctEl = document.getElementById('correctPredictions');
        const accuracyEl = document.getElementById('accuracyRate');
        const winningsEl = document.getElementById('totalWinnings');

        if (!list) return;

        const predictions = this.state.predictions;
        const correct = predictions.filter(p => p.result === 'won').length;
        const accuracy = predictions.length > 0 ? ((correct / predictions.length) * 100).toFixed(1) : 0;
        const totalWinnings = predictions.reduce((sum, p) => {
            if (p.result === 'won' && p.claimed) return sum + parseFloat(p.potentialWin);
            return sum;
        }, 0);

        if (totalEl) totalEl.textContent = predictions.length;
        if (correctEl) correctEl.textContent = correct;
        if (accuracyEl) accuracyEl.textContent = accuracy + '%';
        if (winningsEl) winningsEl.textContent = totalWinnings.toFixed(0);

        if (predictions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>暂无预测记录</h3>
                    <p>开始预测赛事，查看你的历史记录</p>
                </div>
            `;
            return;
        }

        list.innerHTML = predictions.map(pred => {
            const statusClass = pred.result === 'won' ? 'won' : pred.result === 'lost' ? 'lost' : 'pending';
            const statusText = pred.result === 'won' ? '已中奖' : pred.result === 'lost' ? '未中奖' : '进行中';
            
            let resultAmount = '';
            let claimButton = '';
            
            if (pred.result === 'won') {
                resultAmount = `+${pred.potentialWin} USDT`;
                if (!pred.claimed) {
                    claimButton = `<button class="claim-reward-btn" data-prediction-id="${pred.id}">领取奖励</button>`;
                } else {
                    claimButton = `<span class="claimed-badge">已领取</span>`;
                }
            } else if (pred.result === 'lost') {
                resultAmount = `-${pred.stake} USDT`;
            }

            return `
                <div class="prediction-item ${statusClass}">
                    <div class="prediction-match">
                        <div class="prediction-teams">
                            <span class="team-flag">${pred.homeTeam.flag}</span>
                            <span class="team-name">${pred.homeTeam.name}</span>
                            <span class="prediction-vs">vs</span>
                            <span class="team-name">${pred.awayTeam.name}</span>
                            <span class="team-flag">${pred.awayTeam.flag}</span>
                        </div>
                    </div>
                    <div class="prediction-details">
                        <div class="prediction-choice">
                            <span class="choice-label">预测</span>
                            <span class="choice-value">${pred.outcome}</span>
                        </div>
                        <div class="stake-info">
                            <span class="stake-amount">${pred.stake} USDT</span>
                            <span class="stake-odds">@${pred.odds}x</span>
                        </div>
                    </div>
                    <div class="prediction-result ${statusClass}">
                        <div class="result-status">${statusText}</div>
                        <div class="result-amount">${resultAmount}</div>
                        ${claimButton}
                    </div>
                </div>
            `;
        }).join('');

        // Add claim button handlers
        list.querySelectorAll('.claim-reward-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const predId = parseInt(e.target.dataset.predictionId);
                this.claimReward(predId);
            });
        });
    },

    renderLeaderboard() {
        const tbody = document.getElementById('leaderboardBody');
        if (!tbody) return;

        tbody.innerHTML = this.state.leaderboard.map((user, index) => {
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
            return `
                <tr>
                    <td><span class="rank ${rankClass}">${index + 1}</span></td>
                    <td>
                        <div class="predictor-cell">
                            <span class="predictor-avatar">${user.avatar}</span>
                            <span class="predictor-name">${user.name}</span>
                        </div>
                    </td>
                    <td>${user.predictions}</td>
                    <td>${user.correct}</td>
                    <td>${user.accuracy}%</td>
                    <td class="points-cell">${user.points.toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    },

    showToast(message, icon = '✅') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        document.getElementById('toastIcon').textContent = icon;
        document.getElementById('toastMessage').textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
