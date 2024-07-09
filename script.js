document.getElementById('start-game').addEventListener('click', startGame);

let player1 = '';
let player2 = '';
let currentPlayer = 1;
let categories = [];
let questions = [];
let currentQuestionIndex = 0;
let scores = { player1: 0, player2: 0 };
let usedCategories = new Set();

function startGame() {
    player1 = document.getElementById('player1-name').value;
    player2 = document.getElementById('player2-name').value;
    if (player1 && player2) {
        document.getElementById('player-setup').style.display = 'none';
        fetchCategories();
    } else {
        alert('Please enter names for both players.');
    }
}

function fetchCategories() {
    document.getElementById('loader').style.display = 'block'; // Show loader
    fetch('https://the-trivia-api.com/api/categories')
        .then(response => response.json())
        .then(data => {
            categories = Object.keys(data);
            displayCategories();
            document.getElementById('loader').style.display = 'none'; // Hide loader
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            document.getElementById('loader').style.display = 'none'; // Hide loader
        });
}

function displayCategories() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categories.forEach(category => {
        if (!usedCategories.has(category)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryList.appendChild(option);
        }
    });
    document.getElementById('category-selection').style.display = 'block';
}

document.getElementById('select-category').addEventListener('click', selectCategory);

function selectCategory() {
    const categoryId = document.getElementById('category-list').value;
    if (categoryId) {
        usedCategories.add(categoryId);
        document.getElementById('category-selection').style.display = 'none';
        fetchQuestions(categoryId);
    } else {
        alert('Please select a category.');
    }
}

function fetchQuestions(categoryId) {
    document.getElementById('loader').style.display = 'block'; // Show loader
    questions = [];
    
    const fetchDifficultyQuestions = async (difficulty) => {
        try {
            const response = await fetch(`https://the-trivia-api.com/v2/questions?categories=${categoryId}&limit=2&difficulty=${difficulty}`);
            const data = await response.json();
            if (!data) {
                throw new Error('No results found');
            }
            return data.map(q => ({ ...q, difficulty }));
        } catch (error) {
            console.error(`Error fetching ${difficulty} questions:`, error);
            return [];
        }
    };
    
    Promise.all([
        fetchDifficultyQuestions('easy'),
        fetchDifficultyQuestions('medium'),
        fetchDifficultyQuestions('hard')
    ]).then(results => {
        questions = [...results[0], ...results[1], ...results[2]];
        document.getElementById('loader').style.display = 'none'; 
        if (questions.length > 0) {
            displayQuestion();
        } else {
            alert('No questions available for this category. Please select another category.');
            document.getElementById('category-selection').style.display = 'block';
        }
    }).catch(error => {
        console.error('Error fetching questions:', error);
        document.getElementById('loader').style.display = 'none'; 
    });
}

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        document.getElementById('question-text').innerHTML = question.question.text;
        document.getElementById('difficulty-level').innerHTML = `Difficulty: ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}`;
        const answersDiv = document.getElementById('answers');
        answersDiv.innerHTML = '';
        const allAnswers = [...question.incorrectAnswers, question.correctAnswer].sort(() => Math.random() - 0.5);
        allAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.addEventListener('click', () => selectAnswer(answer, question.correctAnswer));
            answersDiv.appendChild(button);
        });
        document.getElementById('question-display').style.display = 'block';
        updateCurrentPlayerDisplay();
    } else {
        endGame();
    }
}

function selectAnswer(selectedAnswer, correctAnswer) {
    if (selectedAnswer === correctAnswer) {
        const points = questions[currentQuestionIndex].difficulty === 'easy' ? 10 :
                       questions[currentQuestionIndex].difficulty === 'medium' ? 15 : 20;
        if (currentPlayer === 1) {
            scores.player1 += points;
        } else {
            scores.player2 += points;
        }
    }
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentQuestionIndex++;
    displayQuestion();
}

function updateCurrentPlayerDisplay() {
    const currentPlayerDisplay = document.getElementById('current-player');
    currentPlayerDisplay.textContent = currentPlayer === 1 ? `Current Player: ${player1}` : `Current Player: ${player2}`;
    currentPlayerDisplay.classList.toggle('player1', currentPlayer === 1);
    currentPlayerDisplay.classList.toggle('player2', currentPlayer === 2);
}

function endGame() {
    document.getElementById('question-display').style.display = 'none';
    document.getElementById('game-end').style.display = 'block';
    document.getElementById('final-scores').textContent = `Player 1: ${scores.player1}, Player 2: ${scores.player2}`;
    document.getElementById('winner').textContent = scores.player1 > scores.player2 ? 'Player 1 Wins!' : 'Player 2 Wins!';
}

document.getElementById('restart-game').addEventListener('click', () => {
    player1 = '';
    player2 = '';
    currentPlayer = 1;
    questions = [];
    currentQuestionIndex = 0;
    scores = { player1: 0, player2: 0 };
    usedCategories.clear();
    document.getElementById('player-setup').style.display = 'block';
    document.getElementById('game-end').style.display = 'none';
});
