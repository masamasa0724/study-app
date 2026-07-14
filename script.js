// グローバル変数
let currentIndex = 0;
let correctCount = 0;
let userAnswers = [];
let answered = false;

// 初期化
function initApp() {
    loadProgress();
    updateDisplay();
}

// クイズ開始
function startQuiz() {
    // 既に進捗がある場合は確認
    if (localStorage.getItem('quizProgress')) {
        if (!confirm('前回の進捗がありますが、新しく開始しますか？')) {
            showScreen('quizScreen');
            updateDisplay();
            return;
        }
    }
    
    resetProgress();
    showScreen('quizScreen');
    updateDisplay();
}

// クイズ画面への遷移
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 進捗の読み込み
function loadProgress() {
    const saved = localStorage.getItem('quizProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        currentIndex = progress.currentIndex || 0;
        correctCount = progress.correctCount || 0;
        userAnswers = progress.userAnswers || [];
    }
}

// 進捗の保存
function saveProgress() {
    const progress = {
        currentIndex,
        correctCount,
        userAnswers
    };
    localStorage.setItem('quizProgress', JSON.stringify(progress));
}

// 画面表示の更新
function updateDisplay() {
    const totalQuestions = quizData.length;
    document.getElementById('currentQuestion').textContent = currentIndex + 1;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('correctCount').textContent = correctCount;
    
    const progress = Math.round((currentIndex / totalQuestions) * 100);
    document.getElementById('progressPercent').textContent = progress;
    document.getElementById('progressBar').style.width = progress + '%';

    if (currentIndex < quizData.length) {
        displayQuestion();
    }
}

// 質問の表示
function displayQuestion() {
    const question = quizData[currentIndex];
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        
        // 前回の回答を表示
        if (userAnswers[currentIndex] !== undefined) {
            button.disabled = true;
            
            if (index === question.correct) {
                button.classList.add('correct');
            } else if (index === userAnswers[currentIndex]) {
                button.classList.add('incorrect');
            }
        }
        
        button.onclick = () => selectOption(index);
        optionsContainer.appendChild(button);
    });
    
    // 解説の表示
    if (userAnswers[currentIndex] !== undefined) {
        document.getElementById('explanationText').textContent = question.explanation;
        document.getElementById('explanationBox').style.display = 'block';
    } else {
        document.getElementById('explanationBox').style.display = 'none';
    }
    
    // ボタンの表示/非表示
    updateButtons();
}

// 選択肢を選ぶ
function selectOption(index) {
    const question = quizData[currentIndex];
    
    userAnswers[currentIndex] = index;
    
    if (index === question.correct) {
        correctCount++;
    }
    
    saveProgress();
    displayQuestion();
}

// 前へボタン
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        updateDisplay();
    }
}

// 次へボタン
function nextQuestion() {
    if (currentIndex < quizData.length - 1) {
        currentIndex++;
        updateDisplay();
    } else {
        // クイズ完了
        showResult();
    }
}

// ボタン表示の更新
function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentIndex > 0) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }
    
    if (userAnswers[currentIndex] !== undefined) {
        if (currentIndex < quizData.length - 1) {
            nextBtn.textContent = '次へ →';
            nextBtn.style.display = 'inline-block';
        } else {
            nextBtn.textContent = '結果を見る';
            nextBtn.style.display = 'inline-block';
        }
    } else {
        nextBtn.style.display = 'none';
    }
}

// 結果表示
function showResult() {
    const totalQuestions = quizData.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    document.getElementById('finalScore').textContent = `${correctCount}/${totalQuestions}`;
    document.getElementById('finalPercentage').textContent = `${percentage}%`;
    
    const feedback = document.getElementById('resultFeedback');
    let message = '';
    
    if (percentage === 100) {
        message = '🎉 完璧です！あなたは原子力発電の基礎をマスターしました！';
    } else if (percentage >= 80) {
        message = '🌟 素晴らしい！原子力発電について深く理解できています。';
    } else if (percentage >= 60) {
        message = '👍 良くできました！もう一度復習するとさらに理解が深まります。';
    } else if (percentage >= 40) {
        message = '📚 もう一度挑戦してみてください。繰り返し学習が大切です。';
    } else {
        message = '💪 頑張りましょう！基本から学び直すことをお勧めします。';
    }
    
    feedback.innerHTML = `<h3>${message}</h3>`;
    
    showScreen('resultScreen');
}

// クイズ再スタート
function restartQuiz() {
    resetProgress();
    startQuiz();
}

// 進捗リセット
function resetProgress() {
    currentIndex = 0;
    correctCount = 0;
    userAnswers = [];
    answered = false;
    localStorage.removeItem('quizProgress');
    showScreen('startScreen');
}

// ページロード時の初期化
window.addEventListener('DOMContentLoaded', initApp);

// ページを離れる時の確認
window.addEventListener('beforeunload', (e) => {
    if (userAnswers.length > 0 && currentIndex < quizData.length) {
        e.preventDefault();
        e.returnValue = '';
    }
});
