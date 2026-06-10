// World Cup 2026 Prediction Platform - Mobile App Logic
const App = {
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
        currentTab: 'home'
    },

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

        const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        groups.forEach(group => {
            const groupTeams = this.teams.filter(t => t.group === group);
            if (groupTeams.length >= 2) {
                for (let i = 0; i < groupTeams.length; i++) {
                    for (let j = i + 1; j < groupTeams.length; j++) {
                        const dayOffset = (matchId % 5) - 2;
                        const matchDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
                        matchDate.setHours(14 + (matchId % 8), 0, 0, 0);

                        const odds = {
                            home: (1.5 + Math.random() * 2).toFixed(2),
                            draw: (2.5 + Math.random() * 1.5).toFixed(2),
                            away: (1.8 + Math.random() * 2.2).toFixed(2)
                        };

                        let status = 'upcoming';
                        let score = { home: 0, away: 0 };
                        let actualResult = null;

                        if (matchDate < now) {
                            const hoursSinceStart = (now - matchDate) / (1000 * 60 * 60);
                            if (hoursSinceStart < 2) {
                                status = 'live';
                                score = { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 3) };
                            } else {
                                status = 'finished';
                                score = { home: Math.floor(Math.random() * 4), away: Math.floor(Math.random() * 4) };
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

        this.state.leaderboard.forEach((user, index) => {
            user.rank = index + 1;
        });
    },

    loadPredictions() {
        const saved = localStorage.getItem('worldcup_predictions');
        if (saved) {
            this.state.predictions = JSON.parse(saved);
            this.updatePredictionResults();
        }
    },

    updatePredictionResults() {
        this.state.predictions.forEach(pred => {
            const match = this.state.matches.find(m => m.id === pred.matchId);
            if (match && match.status === 'finished' && pred.result === 'pending') {
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
        // Bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderMatches(e.target.dataset.filter);
            });
        });

        // Rules toggle
        const rulesToggle = document.getElementById('rulesToggle');
        if (rulesToggle) {
            rulesToggle.addEventListener('click', () => {
                document.querySelector('.rules-banner-compact').classList.toggle('open');
            });
        }

        // Wallet buttons
        document.getElementById('walletBtn')?.addEventListener('click', () => this.openWalletModal());
        document.getElementById('connectWalletBtn')?.addEventListener('click', () => this.openWalletModal());

        // Wallet options
        document.querySelectorAll('.wallet-card').forEach(option => {
            option.addEventListener('click', () => this.connectWallet());
        });

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('walletModalClose')?.addEventListener('click', () => this.closeWalletModal());

        // Prediction options
        document.querySelectorAll('.odds-card').forEach(option => {
            option.addEventListener('click', (e) => this.selectOutcome(e.currentTarget.dataset.result));
        });

        // Quick stake buttons
        document.querySelectorAll('.quick-stake-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                document.getElementById('stakeInput').value = amount;
                this.updatePotentialWin();
            });
        });

        // Stake input
        document.getElementById('stakeInput')?.addEventListener('input', () => this.updatePotentialWin());

        // Submit prediction
        document.getElementById('submitPrediction')?.addEventListener('click', () => this.placePrediction());

        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.showFullPage(page);
                }
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const backTo = e.currentTarget.dataset.back;
                this.hideFullPage();
                if (backTo) {
                    this.switchTab(backTo);
                }
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

    switchTab(tab) {
        this.state.currentTab = tab;

        // Update bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });

        // Show/hide tab pages
        document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
        const targetTab = document.getElementById(tab);
        if (targetTab) targetTab.classList.add('active');

        // Update content
        if (tab === 'home') this.renderMatches('today');
        if (tab === 'predictions') this.renderPredictions();

        // Scroll to top
        document.querySelector('.app-content').scrollTop = 0;
    },

    showFullPage(pageId) {
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }
    },

    hideFullPage() {
        document.querySelectorAll('.full-page').forEach(p => p.classList.remove('active'));
    },

    renderMatches(filter = 'today') {
        const list = document.getElementById('matchesList');
        if (!list) return;

        const now = new Date();
        let matches = this.state.matches;

        if (filter === 'today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            matches = matches.filter(m => m.date >= today && m.date < tomorrow && m.status === 'upcoming');
        } else if (filter === 'upcoming') {
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            matches = matches.filter(m => m.date >= tomorrow && m.status === 'upcoming');
        } else if (filter === 'live') {
            matches = matches.filter(m => m.status === 'live');
        } else if (filter === 'finished') {
            matches = matches.filter(m => m.status === 'finished');
        }

        matches.sort((a, b) => a.date - b.date);

        if (matches.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>暂无赛事</h3>
                    <p>该分类下暂时没有可下注的赛事</p>
                </div>
            `;
            return;
        }

        list.innerHTML = matches.map(match => this.createMatchCard(match)).join('');

        list.querySelectorAll('.match-card-compact').forEach(card => {
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

        const now = new Date();
        const timeUntil = match.date - now;
        const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

        let countdownText = '';
        if (isUpcoming && timeUntil > 0) {
            if (hoursUntil > 0) {
                countdownText = `${hoursUntil}小时${minutesUntil}分钟后`;
            } else if (minutesUntil > 0) {
                countdownText = `${minutesUntil}分钟后`;
            }
        }

        let statusTag = '';
        if (isLive) {
            statusTag = '<span class="match-status-tag live">● 进行中</span>';
        } else if (isFinished) {
            statusTag = '<span class="match-status-tag finished">已结束</span>';
        } else {
            statusTag = `<span class="match-status-tag upcoming">${countdownText || timeStr}</span>`;
        }

        let scoreDisplay = '<span class="match-vs">VS</span>';
        if (isLive || isFinished) {
            scoreDisplay = `<span class="match-score-large">${match.score.home} - ${match.score.away}</span>`;
        }

        let actionBtn = '';
        if (isUpcoming) {
            actionBtn = `<button class="match-action-btn">立即下注</button>`;
        } else if (isLive) {
            actionBtn = `<button class="match-action-btn" disabled>已锁定</button>`;
        } else {
            actionBtn = `<button class="match-action-btn" disabled>已结束</button>`;
        }

        return `
            <div class="match-card-compact ${isLive ? 'live' : ''} ${isFinished ? 'finished' : ''}" data-match-id="${match.id}">
                <div class="match-card-header">
                    <span class="match-stage-tag">${match.stage} · ${match.group}组</span>
                    ${statusTag}
                </div>
                <div class="match-teams-row">
                    <div class="team-block home">
                        <span class="team-flag-large">${match.homeTeam.flag}</span>
                        <span class="team-name-compact">${match.homeTeam.name}</span>
                    </div>
                    <div class="match-center">
                        ${scoreDisplay}
                    </div>
                    <div class="team-block away">
                        <span class="team-flag-large">${match.awayTeam.flag}</span>
                        <span class="team-name-compact">${match.awayTeam.name}</span>
                    </div>
                </div>
                <div class="match-odds-row">
                    <div class="odds-pill">
                        <span class="odds-label">主胜</span>
                        <span class="odds-num">${match.odds.home}x</span>
                    </div>
                    <div class="odds-pill">
                        <span class="odds-label">平局</span>
                        <span class="odds-num">${match.odds.draw}x</span>
                    </div>
                    <div class="odds-pill">
                        <span class="odds-label">客胜</span>
                        <span class="odds-num">${match.odds.away}x</span>
                    </div>
                </div>
                ${actionBtn}
            </div>
        `;
    },

    openPredictionModal(matchId) {
        if (!this.state.wallet.connected) {
            this.showToast('请先连接钱包', '⚠️');
            this.openWalletModal();
            return;
        }

        const match = this.state.matches.find(m => m.id === matchId);
        if (!match) return;

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

        // Update status bar
        const statusBar = document.getElementById('matchStatusBar');
        if (statusBar) {
            const now = new Date();
            const timeUntil = match.date - now;
            const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
            const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
            let timeText = hoursUntil > 0 ? `${hoursUntil}小时${minutesUntil}分钟后开始` : minutesUntil > 0 ? `${minutesUntil}分钟后开始` : '即将开始';

            statusBar.innerHTML = `
                <span class="status-icon">⏰</span>
                <span class="status-text">${timeText}</span>
                <span class="status-note">开赛前可下注</span>
            `;
        }

        // Update teams
        const teamsLarge = document.getElementById('matchTeamsLarge');
        if (teamsLarge) {
            teamsLarge.innerHTML = `
                <div class="team-large">
                    <span class="team-flag">${match.homeTeam.flag}</span>
                    <span class="team-name">${match.homeTeam.name}</span>
                </div>
                <div class="match-center-large">
                    <span class="vs">VS</span>
                </div>
                <div class="team-large">
                    <span class="team-flag">${match.awayTeam.flag}</span>
                    <span class="team-name">${match.awayTeam.name}</span>
                </div>
            `;
        }

        // Update odds
        document.getElementById('homeTeamName').textContent = match.homeTeam.name;
        document.getElementById('awayTeamName').textContent = match.awayTeam.name;
        document.getElementById('homeOdds').textContent = match.odds.home + 'x';
        document.getElementById('drawOdds').textContent = match.odds.draw + 'x';
        document.getElementById('awayOdds').textContent = match.odds.away + 'x';

        // Reset form
        document.querySelectorAll('.odds-card').forEach(opt => opt.classList.remove('selected'));
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
        this.state.wallet.connected = true;
        this.state.wallet.address = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        this.state.wallet.balance = 10000;

        this.updateWalletUI();
        this.closeWalletModal();
        this.showToast('钱包连接成功！', '✅');
    },

    updateWalletUI() {
        const walletBtn = document.getElementById('walletBtn');
        const balanceDisplay = document.getElementById('walletBalanceDisplay');
        const connectBtn = document.getElementById('connectWalletBtn');
        const userName = document.getElementById('userName');
        const userAddress = document.getElementById('userAddress');

        if (this.state.wallet.connected) {
            const shortAddress = this.state.wallet.address.slice(0, 6) + '...' + this.state.wallet.address.slice(-4);

            if (walletBtn) {
                walletBtn.innerHTML = `<span class="wallet-icon">💼</span><span class="wallet-text">${shortAddress}</span>`;
                walletBtn.classList.add('connected');
            }

            if (balanceDisplay) {
                balanceDisplay.innerHTML = `${this.state.wallet.balance.toFixed(2)} <span>USDT</span>`;
            }

            if (connectBtn) {
                connectBtn.innerHTML = '<span>✅</span><span>已连接</span>';
                connectBtn.style.borderColor = 'var(--success)';
                connectBtn.style.color = 'var(--success)';
            }

            if (userName) userName.textContent = '预测者';
            if (userAddress) userAddress.textContent = shortAddress;
        }
    },

    selectOutcome(result) {
        this.state.selectedOutcome = result;
        document.querySelectorAll('.odds-card').forEach(opt => {
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
        this.switchTab('predictions');
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

        const reward = parseFloat(prediction.potentialWin);
        this.state.wallet.balance += reward;
        prediction.claimed = true;
        this.savePredictions();

        this.updateWalletUI();
        this.renderPredictions();
        this.showToast(`成功领取 ${reward.toFixed(2)} USDT`, '🎉');
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
                    <h3>暂无预测</h3>
                    <p>开始预测赛事，查看你的记录</p>
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
                    claimButton = `<button class="claim-btn" data-prediction-id="${pred.id}">领取</button>`;
                } else {
                    claimButton = `<span class="claimed-badge">已领取</span>`;
                }
            } else if (pred.result === 'lost') {
                resultAmount = `-${pred.stake} USDT`;
            }

            return `
                <div class="prediction-card ${statusClass}">
                    <div class="prediction-card-header">
                        <div class="prediction-teams-compact">
                            <span>${pred.homeTeam.flag}</span>
                            <span>${pred.homeTeam.name}</span>
                            <span style="color:var(--text-muted)">vs</span>
                            <span>${pred.awayTeam.name}</span>
                            <span>${pred.awayTeam.flag}</span>
                        </div>
                        <span class="prediction-status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="prediction-details-row">
                        <span class="prediction-choice">预测: <strong>${pred.outcome}</strong></span>
                        <span class="prediction-stake">${pred.stake} USDT @ ${pred.odds}x</span>
                    </div>
                    <div class="prediction-result-row">
                        <span class="prediction-result-amount ${statusClass}">${resultAmount}</span>
                        ${claimButton}
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.claim-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const predId = parseInt(e.target.dataset.predictionId);
                this.claimReward(predId);
            });
        });
    },

    renderLeaderboard() {
        const list = document.getElementById('leaderboardList');
        if (!list) return;

        list.innerHTML = this.state.leaderboard.map((user, index) => {
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
            return `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                    <span class="leaderboard-avatar">${user.avatar}</span>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${user.name}</div>
                        <div class="leaderboard-stats">${user.predictions}场 · ${user.correct}中 · ${user.accuracy}%</div>
                    </div>
                    <div class="leaderboard-points">${user.points.toLocaleString()}</div>
                </div>
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

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
