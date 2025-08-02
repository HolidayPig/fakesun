// 游戏状态和配置
const gameConfig = {
    totalCards: 19,        // 18张黑桃 + 1张红桃
    spadeCount: 18,        // 黑桃数量
    heartCount: 1          // 红桃数量
};

const gameState = {
    deck: [],              // 牌堆
    currentPlayer: null,   // 当前玩家 ('player' 或 'npc')
    startingPlayer: null,  // 起始玩家
    currentCard: null,     // 当前抽取的牌
    playerSpadeMarks: 0,   // 玩家的黑桃标记计数
    npcSpadeMarks: 0,      // NPC的黑桃标记计数
    roundNumber: 1,        // 当前回合数
    playerHeartCount: 0,   // 玩家获得红桃次数
    npcHeartCount: 0,      // NPC获得红桃次数
    isSpinUsed: false, // 新增：标记本回合是否已抽奖
    isProcessing: false,    // 是否正在处理游戏逻辑
    npcSpadeSkillProgress: 0,  // NPC黑桃技能进度 (0-10)
    npcHeartSkillProgress: 0,  // NPC红桃技能进度 (0-3)
    playerEnergy: 0,           // 玩家能量 (0-3)
    totalRoundsPlayed: 0,      // 总回合数统计
};

// DOM元素
const elements = {
    // 卡牌元素
    playerCard: document.getElementById('playerCard'),
    npcCard: document.getElementById('npcCard'),
    deck: document.getElementById('deck'),
    cardCount: document.getElementById('cardCount'),
    remainingCards: document.getElementById('remainingCards'),
    actionButtons: document.getElementById('actionButtons'),
    // 状态和信息元素
    playerStatus: document.getElementById('playerStatus'),
    npcStatus: document.getElementById('npcStatus'),
    gameMessage: document.getElementById('gameMessage'),
    
    // 按钮元素
    keepBtn: document.getElementById('keepBtn'),
    giveBtn: document.getElementById('giveBtn'),
    continueBtn: document.getElementById('continueBtn'),
    
    // 统计元素
    playerSpadeCount: document.getElementById('playerSpadeCount'),
    npcSpadeCount: document.getElementById('npcSpadeCount'),
    roundCount: document.getElementById('roundCount'),
    playerHeartCount: document.getElementById('playerHeartCount'),
    npcHeartCount: document.getElementById('npcHeartCount'),
    
    // 模态框元素
    resultModal: document.getElementById('resultModal'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    
     // 新增NPC技能条元素
    npcSpadeSkillBar: document.getElementById('npcSpadeSkillBar'),
    npcHeartSkillBar: document.getElementById('npcHeartSkillBar'),
    // 新增玩家能量条元素
    playerEnergyBar: document.getElementById('playerEnergyBar'),
    fillEnergyBtn: document.getElementById('fillEnergyBtn'),
    energyLabel: document.querySelector('.energy-label'),
    // 游戏结束模态框
    gameOverModal: document.getElementById('gameOverModal'),
    totalRounds: document.getElementById('totalRounds'),
    finalPlayerHearts: document.getElementById('finalPlayerHearts'),
    finalNpcHearts: document.getElementById('finalNpcHearts'),
    finalResult: document.getElementById('finalResult'),
    restartGameBtn: document.getElementById('restartGameBtn'),
};
function resetGame() {
    // 重置所有游戏状态
    gameState.deck = createDeck();
    gameState.currentPlayer = null;
    gameState.startingPlayer = null;
    gameState.currentCard = null;
    gameState.playerSpadeMarks = 0;
    gameState.npcSpadeMarks = 0;
    gameState.roundNumber = 1;
    gameState.playerHeartCount = 0;
    gameState.npcHeartCount = 0;
    gameState.isSpinUsed = false;
    gameState.isProcessing = false;
    gameState.npcSpadeSkillProgress = 0;
    gameState.npcHeartSkillProgress = 0;
    gameState.playerEnergy = 0;
    gameState.totalRoundsPlayed = 0;
    
    // 重置UI
    resetCardsUI();
    updateStats();
    updateSkillBars();
    elements.gameMessage.textContent = "游戏即将开始，正在决定先手...";
    elements.playerStatus.textContent = "等待中";
    elements.npcStatus.textContent = "等待中";
    elements.remainingCards.textContent = gameState.deck.length;
    elements.cardCount.textContent = gameState.deck.length;
    
    // 隐藏按钮和模态框
    toggleActionButtons(false);
    elements.resultModal.classList.remove('show');
    elements.gameOverModal.classList.remove('show');
    
    // 随机决定先手玩家
    setTimeout(() => {
        determineStartingPlayer();
    }, 1500);
}

// 初始化游戏
function initGame() {
    // 重置游戏状态（保留红桃计数，重置当局数据）
    gameState.deck = createDeck();
    gameState.currentCard = null;
    gameState.isProcessing = false;
    gameState.roundNumber = 1;
    updateSkillBars();
    
    // 重置UI
    resetCardsUI();
    updateStats();
    elements.gameMessage.textContent = "游戏即将开始，正在决定先手...";
    elements.playerStatus.textContent = "等待中";
    elements.npcStatus.textContent = "等待中";
    elements.remainingCards.textContent = gameState.deck.length;
    elements.cardCount.textContent = gameState.deck.length;
    
    // 隐藏按钮和模态框
    toggleActionButtons(false);
    elements.resultModal.classList.remove('show');
    
    // 随机决定先手玩家
    setTimeout(() => {
        determineStartingPlayer();
    }, 1500);
}

// 创建牌堆
function createDeck() {
    const deck = [];
    
    // 添加黑桃牌
    for (let i = 0; i < gameConfig.spadeCount; i++) {
        deck.push({ type: 'spade' });
    }
    
    // 添加红桃牌
    for (let i = 0; i < gameConfig.heartCount; i++) {
        deck.push({ type: 'heart' });
    }
    
    // 洗牌 - Fisher-Yates 洗牌算法
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

// 随机决定先手玩家
function determineStartingPlayer() {
    const isPlayerStarting = Math.random() > 0.5;
    gameState.startingPlayer = isPlayerStarting ? 'player' : 'npc';
    gameState.currentPlayer = gameState.startingPlayer;
    
    elements.gameMessage.textContent = `${isPlayerStarting ? '你' : '巨根正太'}获得先手！`;
    
    // 开始游戏
    setTimeout(() => {
        startTurn();
    }, 1000);
}

// 开始当前玩家的回合
function startTurn() {
    gameState.isSpinUsed = false;
    if (gameState.deck.length === 0) {
        // 牌堆为空，重新开始游戏
        elements.gameMessage.textContent = "牌堆已空，重新开始游戏...";
        setTimeout(() => {
            initGame();
        }, 2000);
        return;
    }
    
    elements.gameMessage.textContent = `${gameState.currentPlayer === 'player' ? '你的' : '正太的'}回合`;
    
    // 从牌堆抽牌
    gameState.currentCard = gameState.deck.pop();
    elements.remainingCards.textContent = gameState.deck.length;
    elements.cardCount.textContent = gameState.deck.length;
    
    if (gameState.currentPlayer === 'player') {
        // 玩家回合
        spinButton.disabled = false;
        spinButton.style.cursor = 'pointer';

        elements.playerStatus.textContent = "请选择：保留或上贡";
        elements.npcStatus.textContent = "等待中";
        elements.playerCard.className = 'card back pulse';
        toggleActionButtons(true);
    } else {
        // NPC回合
        spinButton.disabled = true;
        spinButton.style.cursor = 'not-allowed';
        elements.npcStatus.textContent = "正在思考...";
        elements.playerStatus.textContent = "等待中";
        elements.npcCard.className = 'card back pulse';
        toggleActionButtons(false);
        
        // NPC的AI决策
        setTimeout(makeNPCDecision, 2000);
    }
}

// NPC的决策逻辑
function makeNPCDecision() {
    // NPC决策逻辑：50%概率保留，50%概率送出
    const keepProbability = 0.5;
    const keepCard = Math.random() < keepProbability;
    
    if (keepCard) {
        elements.npcStatus.textContent = "瞥了你一眼";
        processCardDecision(true);
    } else {
        elements.npcStatus.textContent = "正在爆耍你";
        processCardDecision(false);
    }
}

// 处理玩家的决策
function playerDecision(keepCard) {
    if (gameState.currentPlayer !== 'player' || gameState.isProcessing) return;
    
    toggleActionButtons(false);
    elements.playerStatus.textContent = keepCard ? "选择赌一次" : "选择上贡高潮的希望";
    processCardDecision(keepCard);
}

// 处理卡牌决策（保留或送出）
function processCardDecision(keepCard) {
    gameState.isProcessing = true;
    
    // 翻牌动画
    setTimeout(() => {
        const currentCardElement = gameState.currentPlayer === 'player' ? elements.playerCard : elements.npcCard;
        currentCardElement.classList.remove('back', 'pulse');
        currentCardElement.classList.add(gameState.currentCard.type, 'flipped');
        
        // 显示牌面后处理结果
        setTimeout(() => {
            resolveCardResult(keepCard);
        }, 1000);
    }, 500);
}

// 处理卡牌结果
function resolveCardResult(keepCard) {
    const targetPlayer = keepCard ? gameState.currentPlayer : (gameState.currentPlayer === 'player' ? 'npc' : 'player');
    const cardType = gameState.currentCard.type;
    // 更新NPC技能进度
    if (cardType === 'spade' && targetPlayer === 'npc') {
        gameState.npcSpadeSkillProgress++;
    }
    // 检查并触发NPC技能
    checkNpcSkills();
    
    // 更新状态信息
    if (cardType === 'spade') {
        elements.gameMessage.textContent = `${targetPlayer === 'player' ? '你' : '巨根正太'}翻开牌：是寸止卡`;
        
        // 分别统计玩家和NPC的黑桃
        if (targetPlayer === 'player') {
            gameState.playerSpadeMarks++;
        } else {
            gameState.npcSpadeMarks++;
        }
        updateStats();
    } else {
        elements.gameMessage.textContent = `${targetPlayer === 'player' ? '你' : 'NPC'}翻开牌：是高潮卡！`;
        // 统计红桃并结束本局
        handleHeartResult(targetPlayer);
        return;
    }
    
    // 游戏继续，切换玩家
    gameState.currentPlayer = gameState.currentPlayer === 'player' ? 'npc' : 'player';
    gameState.roundNumber++;
    updateStats();
    
    // 准备下一回合
    setTimeout(() => {
        resetCardsUI(false);
        gameState.isProcessing = false;
          spinButton.disabled = gameState.currentPlayer !== 'player'; // 根据当前玩家更新转盘按钮状态
        startTurn();
    }, 2000);
}
const spinButton = document.getElementById('spinButton');
const prizeWheel = document.getElementById('prizeWheel');
// 初始化转盘
function initWheel() {
    // 设置转盘分区文本
    const sections = document.querySelectorAll('.wheel-section');
    sections.forEach(section => {
        const text = section.textContent;
        const span = document.createElement('span');
        span.textContent = text;
        
        // 根据分区位置旋转文本
        const rotation = parseFloat(section.style.transform.match(/rotate\(([^)]+)\)/)[1]);
        span.style.transform = `rotate(${rotation + 180}deg)`;
        
        section.innerHTML = '';
        section.appendChild(span);
    });
    
    // 添加转盘指针
    const pointer = document.createElement('div');
    pointer.className = 'wheel-pointer';
    document.querySelector('.wheel-container').insertBefore(pointer, prizeWheel);
}

// 执行抽奖
function spinWheel() {

       if (gameState.currentPlayer !== 'player') {
        showMessage('只有你的回合才能当赌狗！');
        return;
    }
    
    if (gameState.isSpinUsed) {
        showMessage('本回合已赌了，下一回合再试！');
        return;
    }
    // 检查是否有足够的黑桃标记
    if (gameState.playerSpadeMarks < 1) {
        showMessage('寸止次数不足，无法抽奖！');
        return;
    }
    
    // 检查游戏是否正在进行中
    if (gameState.isProcessing) {
        return;
    }
    
    gameState.isProcessing = true;
    gameState.isSpinUsed = true; // 标记为已使用
    spinButton.disabled = true;  // 禁用按钮
    
    spinButton.style.cursor = 'not-allowed';
    
    // 消耗一个黑桃标记
    gameState.playerSpadeMarks--;
    updateStats();
    
    // 随机生成旋转角度 (3-5圈 + 随机角度)
    const baseRotation = 360 * (3 + Math.random() * 2);
    const randomRotation = Math.random() * 360;
    const totalRotation = baseRotation + randomRotation;
    
    // 旋转转盘
    prizeWheel.style.transform = `rotate(${totalRotation}deg)`;
    
    // 计算中奖结果
    setTimeout(() => {
        calculatePrize(randomRotation);
        gameState.isProcessing = false;
        spinButton.disabled = false;
        spinButton.style.cursor = 'pointer';
    }, 5000); // 等待转盘停止
}

// 计算抽奖结果
function calculatePrize(rotation) {
    // 计算最终落在哪个分区 (每个分区36度)
    const normalizedRotation = (rotation % 360 + 360) % 360;
    const sectionIndex = Math.floor(normalizedRotation / 36);
    
    let prize = '';
    let message = '';
    
    // 根据概率分配奖励 (与分区对应)
    switch(sectionIndex) {
        case 0: // 10% 概率 - 获得1个黑桃
            gameState.playerSpadeMarks ++;
            prize = '+1 寸止次数';
            break;
        case 1: case 2: case 3: case 4: // 40% 概率 - 获得2个黑桃
            gameState.playerSpadeMarks += 2;
            prize = '+2 寸止次数';
            break;
        case 5: case 6: case 7: case 8: // 40% 概率 - 获得1个黑桃
            gameState.npcSpadeMarks --;
            prize = '-1 正太注意';
            break;
        case 9: // 2% 概率 - 特殊奖励
            // 5% 概率获得3个红桃，5% 概率黑桃翻倍
            if (Math.random() < 0.4) {
                gameState.playerHeartCount += 3;
                prize = '+3 快感值 (稀有奖励)';
            } else {
                gameState.playerSpadeMarks *= 2;
                prize = '寸止次数数量翻倍 (爆)';
            }
            break;
    }
    
    updateStats();
    showMessage(`恭喜！你获得了${prize}`);
}

// 显示消息提示
function showMessage(text) {
    elements.gameMessage.textContent = text;
    
    // 5秒后恢复原消息
    setTimeout(() => {
        if (!gameState.isProcessing) {
            elements.gameMessage.textContent = `${gameState.currentPlayer === 'player' ? '你的' : 'NPC的'}回合`;
        }
    }, 5000);
}
// 处理红桃结果（任意一方拿到红桃后重新开始）
function handleHeartResult(winner) {
     if (winner === 'npc') {
        gameState.npcHeartSkillProgress++;
        checkNpcSkills();
    }
    // 统计红桃次数
    if (winner === 'player') {
        gameState.playerHeartCount++;
    } else {
        gameState.npcHeartCount++;
    }
    updateStats();
    
    // 显示结果弹窗
    elements.resultTitle.textContent = winner === 'player' ? "恭喜你拿到获得快感！" : "正太没收了你的高潮";
    elements.resultMessage.textContent = "游戏将重新洗牌开始";
    elements.resultModal.classList.add('show');
    gameState.isProcessing = false;
}

// 重置卡牌UI
function resetCardsUI(fullReset = true) {
    if (fullReset) {
        elements.playerCard.className = 'card back';
        elements.npcCard.className = 'card back';
    } else {
        // 只重置当前回合的卡牌
        if (gameState.currentPlayer === 'player') {
            elements.playerCard.className = 'card back';
        } else {
            elements.npcCard.className = 'card back';
        }
    }
}

// 更新技能进度条显示
function updateSkillBars() {
    // 更新NPC黑桃技能条 (10为满)
    const spadePercent = (gameState.npcSpadeSkillProgress / 10) * 100;
    elements.npcSpadeSkillBar.style.height = `${spadePercent}%`;
    
    // 更新NPC红桃技能条 (3为满)
    const heartPercent = (gameState.npcHeartSkillProgress / 3) * 100;
    elements.npcHeartSkillBar.style.height = `${heartPercent}%`;
    
    // 更新玩家能量条 (3为满)
    const energyPercent = (gameState.playerEnergy / 3) * 100;
    elements.playerEnergyBar.style.height = `${energyPercent}%`;
    elements.energyLabel.textContent = `快感值 (${gameState.playerEnergy}/3)`;
}

// 检查并触发NPC技能
function checkNpcSkills() {
    // 黑桃技能：达到10点时触发
    if (gameState.npcSpadeSkillProgress >= 10) {
        gameState.playerSpadeMarks += 5;
        elements.gameMessage.textContent = "正太爆耍了你一顿！你获得5次寸止次数！";
        gameState.npcSpadeSkillProgress = 0; // 重置技能进度
        updateStats();
    }
    
    // 红桃技能：达到3点时触发
    if (gameState.npcHeartSkillProgress >= 3) {
        gameState.playerSpadeMarks *= 2;
        elements.gameMessage.textContent = "正太射满了你的全身！你的寸止次数翻倍！";
        gameState.npcHeartSkillProgress = 0; // 重置技能进度
        updateStats();
    }
    
    updateSkillBars();
}

// 玩家充能功能
function fillEnergy() {
    if (gameState.isProcessing) return;
    
    // 检查是否有足够的红桃标记
    if (gameState.playerHeartCount < 1) {
        showMessage("快感值不足，无法高潮！");
        return;
    }
    
    // 检查能量是否已满
    if (gameState.playerEnergy >= 3) {
        showMessage("快感已充满！");
        return;
    }
    
    // 消耗1个红桃标记充能
    gameState.playerHeartCount--;
    gameState.playerEnergy++;
    updateStats();
    updateSkillBars();
    showMessage("成功！");
    
    // 检查是否充能完成
    if (gameState.playerEnergy >= 3) {
        endGame();
    }
}

// 结束游戏并显示统计
function endGame() {
    gameState.isProcessing = true;
    elements.totalRounds.textContent = gameState.totalRoundsPlayed;
    elements.finalPlayerHearts.textContent = gameState.playerHeartCount;
    elements.finalNpcHearts.textContent = gameState.npcHeartCount;
    
    // 判定胜负
    if (gameState.playerHeartCount > gameState.npcHeartCount) {
        elements.finalResult.textContent = "你获胜了！";
    } else if (gameState.playerHeartCount < gameState.npcHeartCount) {
        elements.finalResult.textContent = "正太获胜了！";
    } else {
        elements.finalResult.textContent = "平局！";
    }
    
    // 显示游戏结束模态框
    elements.gameOverModal.classList.add('show');
}

// 更新统计数据显示
function updateStats() {
    elements.playerSpadeCount.textContent = gameState.playerSpadeMarks;
    elements.npcSpadeCount.textContent = gameState.npcSpadeMarks;
    elements.roundCount.textContent = gameState.roundNumber;
    elements.playerHeartCount.textContent = gameState.playerHeartCount;
    elements.npcHeartCount.textContent = gameState.npcHeartCount;
    gameState.totalRoundsPlayed = gameState.roundNumber - 1;
}

// 显示/隐藏操作按钮
function toggleActionButtons(show) {
    elements.actionButtons.style.display = show ? 'flex' : 'none';
}

// 绑定事件监听
function bindEvents() {

    
    // 玩家操作按钮
    elements.keepBtn.addEventListener('click', () => playerDecision(true));
    elements.giveBtn.addEventListener('click', () => playerDecision(false));
     // 玩家充能按钮
    elements.fillEnergyBtn.addEventListener('click', fillEnergy);
  elements.fillEnergyBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fillEnergy();
    });
    // 游戏结束后重新开始按钮
        elements.restartGameBtn.addEventListener('click', resetGame);
    elements.restartGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resetGame();
    });
     // 抽奖转盘事件
    spinButton.addEventListener('click', spinWheel);
    spinButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        spinWheel();
    });
    
    // 触摸设备支持
    elements.keepBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playerDecision(true);
    });
    
    elements.giveBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playerDecision(false);
    });
    
    // 继续按钮
    elements.continueBtn.addEventListener('click', () => {
        elements.resultModal.classList.remove('show');
        initGame(); // 重新初始化游戏（洗牌开始新局）
    });
    
    elements.continueBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        elements.resultModal.classList.remove('show');
        initGame();
    });
    
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    initGame();
    initWheel(); // 初始化转盘
});