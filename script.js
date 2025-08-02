/* ========= 基础配置 ========= */
const prizes = ["喷！！", "憋死噜", "肥臀母猪不配高潮", "继续寸！", "寸止中毒+1", "哦齁齁齁"];
const rootStyles = getComputedStyle(document.documentElement);
const colors = rootStyles.getPropertyValue('--prize-colors').split(',').map(c => c.trim());

/* ========= DOM ========= */
const resultBanner = document.getElementById('result-banner');
const resultText   = document.getElementById('result-text');
const closeBtn     = document.getElementById('close-btn');
const spinBtn      = document.getElementById('spin-btn');
const wheel        = document.getElementById('wheel');
const spinCountEl  = document.getElementById('spin-count');
const specialEffect= document.getElementById('special-effect');
const resetBtn     = document.getElementById('reset-btn');
const circle       = resetBtn.querySelector('.progress-ring__circle');
const counterBox   = document.querySelector('.counter');
const probabilityEl = document.getElementById('first-prize-probability');
const refreshProbBtn = document.getElementById('refresh-prob-btn');
const refreshCircle = refreshProbBtn.querySelector('.refresh-progress-ring__circle');

let firstPrizeProbability = 6; // 初始概率
let isRefreshing = false;
/* ========= 状态 ========= */
let spinCount  = Number(localStorage.getItem('spinCount')) || 0;
let unlockTime = 0;                       // 冷却结束时间戳
let isSpinning = false;
let firstPrizeLocked = false;
/* ========= 添加关闭按钮事件： ========= */
closeBtn.addEventListener('click', () => {
  resultBanner.classList.remove('show');
});
/* ========= 倒计时容器 ========= */
const countDownEl = document.createElement('div');
countDownEl.style.cssText = 'margin-top:10px;font-size:16px;color:#e74c3c;';
counterBox.after(countDownEl);



/* ========= 新增：更新概率显示 ========= */
function updateProbability(prob) {
  firstPrizeProbability = prob;
  // 添加变化动画
  probabilityEl.classList.add('changing');
  
  // 格式化显示为000%形式
  const formattedProb = prob.toString().padStart(3, '0') + '%';
  probabilityEl.textContent = formattedProb;
  
  // 移除动画类
  setTimeout(() => {
    probabilityEl.classList.remove('changing');
  }, 500);
}
// 初始化概率显示
function initProbability() {
  updateProbability(firstPrizeProbability);
}
/* ========= 新增：长按刷新概率 ========= */
let refreshPressTimer = null;

refreshProbBtn.addEventListener('pointerdown', startPressRefresh);
refreshProbBtn.addEventListener('pointerup', cancelPressRefresh);
refreshProbBtn.addEventListener('pointerleave', cancelPressRefresh);

function startPressRefresh(e) {
  if (isRefreshing || refreshProbBtn.disabled) return;
  isRefreshing = true;
  refreshCircle.style.strokeDashoffset = circumference;
  refreshProbBtn.setPointerCapture(e.pointerId);
  
  let t = 0;
  refreshPressTimer = setInterval(() => {
    t += 100;
    const offset = circumference * (1 - Math.min(t / 3000, 1));
    refreshCircle.style.strokeDashoffset = offset;
    
    if (t >= 3000) {
      finishPressRefresh();
    }
  }, 100);
}

function cancelPressRefresh(e) {
  if (e) refreshProbBtn.releasePointerCapture(e.pointerId);
  clearInterval(refreshPressTimer);
  refreshCircle.style.strokeDashoffset = circumference;
  isRefreshing = false;
}

function finishPressRefresh() {
  cancelPressRefresh();
  
  // 生成0-100的随机概率
  const newProb = Math.floor(Math.random() * 101);
  updateProbability(newProb);
  
  // 抽奖次数+10
  spinCount += 10;
  localStorage.setItem('spinCount', spinCount);
  spinCountEl.textContent = spinCount;
  
  // 同步按钮状态
  syncButtons();
}





/* ========= 创建转盘切片 ========= */
function createWheelSlices() {
  if (wheel.children.length) return;
  wheel.innerHTML = '';
  const sliceAngle = 360 / prizes.length;
  prizes.forEach((prize, idx) => {
    const slice = document.createElement('div');
    slice.className = 'slice';
    slice.style.backgroundColor = colors[idx % colors.length];
    slice.style.transform = `rotate(${idx * sliceAngle}deg)`;
    slice.style.clipPath = 'polygon(50% 50%, 100% 0%, 0% 0%)';
    const text = document.createElement('span');
    text.textContent = prize;
    text.style.transform = `rotate(${sliceAngle / 2}deg) translateX(70px) rotate(-${sliceAngle / 2}deg)`;
    text.style.transformOrigin = 'left center';
    slice.appendChild(text);
    wheel.appendChild(slice);
  });
}

/* ========= 按钮状态同步 ========= */
function syncButtons() {
  const now = Date.now();
  const locked = now < unlockTime;

  if (firstPrizeLocked) {
    // 一等奖倒计时期间
    if (locked) {
      spinBtn.disabled  = true;
      resetBtn.disabled = false;
    } else {
      // 倒计时结束，必须 spinCount=0 才能再抽
      spinBtn.disabled  = spinCount !== 0;
      resetBtn.disabled = false;
      countDownEl.textContent = '';
    }
  } else {
    // 未触发一等奖，按钮始终可用
    spinBtn.disabled  = false;
    resetBtn.disabled = false;
    countDownEl.textContent = '';
  }
}

/* ========= 倒计时 ========= */
let cdTimer;
function startCountDown() {
  clearInterval(cdTimer);
  cdTimer = setInterval(() => {
    const left = Math.max(0, unlockTime - Date.now());
    if (left === 0) {
      clearInterval(cdTimer);
      syncButtons();
      return;
    }
    const h = String(Math.floor(left / 3600000)).padStart(2, '0');
    const m = String(Math.floor(left % 3600000 / 60000)).padStart(2, '0');
    const s = String(Math.floor(left % 60000 / 1000)).padStart(2, '0');
    countDownEl.textContent = `在 ${h}时${m}分${s}秒完成寸止`;
  }, 1000);
}

/* ========= 一等奖特效 ========= */
function showSpecialEffect() {
  specialEffect.innerHTML = '';
  specialEffect.style.display = 'block';
  const heart = document.createElement('div');
  heart.className = 'heart';
  specialEffect.appendChild(heart);
  wheel.classList.add('glow');
  setTimeout(() => {
    specialEffect.style.display = 'none';
    specialEffect.innerHTML = '';
    wheel.classList.remove('glow');
  }, 5000);
}

/* ========= 抽奖 ========= */
/* ========= 修改：更新抽奖逻辑，使用当前概率 ========= */
// 在spinBtn的click事件处理中，修改抽奖逻辑
spinBtn.addEventListener('click', () => {
  if (isSpinning || spinBtn.disabled) return;
  isSpinning = true;

  createWheelSlices();
  resultBanner.classList.remove('show');
  wheel.style.transition = 'none';
  wheel.style.transform = 'rotate(0deg)';
  void wheel.offsetWidth; // 触发重绘

  spinCount++;
  localStorage.setItem('spinCount', spinCount);
  spinCountEl.textContent = spinCount;

  /* 根据当前概率随机结果 */
  let idx;
  // 使用当前一等奖概率
  const random = Math.random() * 100;
  if (random < firstPrizeProbability) {
    idx = 0; // 中一等奖
  } else {
    // 否则从其他奖项中随机
    idx = Math.floor(Math.random() * (prizes.length - 1)) + 1;
  }
  
  if (idx === 0) {
    firstPrizeLocked = true; // 仅保留状态标记
    startCountDown();
  }

  /* 计算冷却时间：一等奖＝已抽次数×1000秒；其他＝30秒 */
  if (idx === 0) {
    firstPrizeLocked = true;
    unlockTime = Date.now() + spinCount * 9000000; // 仅一等奖设置冷却时间
    startCountDown(); // 仅一等奖启动倒计时
  } else {
    unlockTime = 0; // 非一等奖不设置冷却
  }
  syncButtons(); // 同步按钮状态（非一等奖时按钮可立即点击）

  const deg = 360 * 5 + (360 - (360 / prizes.length) * idx);
  wheel.style.transition = 'transform 4s cubic-bezier(.2,.8,.3,1)';
  wheel.style.transform = `rotate(${deg}deg)`;

  // 监听动画结束，重置isSpinning并显示结果
  wheel.addEventListener('transitionend', function onTransitionEnd() {
    isSpinning = false; // 关键：重置抽奖状态
    wheel.removeEventListener('transitionend', onTransitionEnd); // 避免重复触发
    // 显示抽奖结果
    resultText.textContent = `肥臀母猪：${prizes[idx]}`;
    resultBanner.classList.add('show');
    // 一等奖特效
    if (idx === 0) {
      showSpecialEffect();
    }
  });
});
/* ========= 修改：启动时初始化概率 ========= */
document.addEventListener('DOMContentLoaded', () => {
  createWheelSlices();
  syncButtons();
  initProbability(); // 初始化概率显示
});

/* ========= 长按清除 ========= */
const circumference = 2 * Math.PI * 45;
let pressTimer = null;

resetBtn.addEventListener('pointerdown', startPressRst);
resetBtn.addEventListener('pointerup', cancelPressRst);
resetBtn.addEventListener('pointerleave', cancelPressRst);

function startPressRst(e) {
  if (resetBtn.disabled) return;
  circle.style.strokeDashoffset = circumference;
  resetBtn.setPointerCapture(e.pointerId);
  let t = 0;
  pressTimer = setInterval(() => {
    t += 100;
    const offset = circumference * (1 - Math.min(t / 5000, 1));
    circle.style.strokeDashoffset = offset;
    if (t >= 5000) finishPressRst();
  }, 100);
}
function cancelPressRst(e) {
  if (e) resetBtn.releasePointerCapture(e.pointerId);
  clearInterval(pressTimer);
  circle.style.strokeDashoffset = circumference;
}
function finishPressRst() {
  cancelPressRst();
  spinCount = Math.max(0, spinCount - 1);
  localStorage.setItem('spinCount', spinCount);
  spinCountEl.textContent = spinCount;
  
  // 新增：当抽奖次数归零时，清空倒计时
  if (spinCount === 0) {
    firstPrizeLocked = false;
    clearInterval(cdTimer); // 停止定时器
    countDownEl.textContent = ''; // 清空显示
  } else {
    // 非零时检查是否需要继续倒计时
    if (Date.now() < unlockTime) {
      startCountDown();
    }
  }
  
  syncButtons();
}

/* ========= 启动 ========= */
document.addEventListener('DOMContentLoaded', () => {
  createWheelSlices();
  syncButtons();        // ← 关键：首次同步按钮状态
});