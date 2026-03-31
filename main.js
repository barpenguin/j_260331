const vocabulary = [
    { korean: '사과', english: 'apple' },
    { korean: '바나나', english: 'banana' },
    { korean: '오렌지', english: 'orange' },
    { korean: '딸기', english: 'strawberry' },
    { korean: '포도', english: 'grape' },
    { korean: '수박', english: 'watermelon' },
    { korean: '레몬', english: 'lemon' },
    { korean: '복숭아', english: 'peach' },
    { korean: '자두', english: 'plum' },
    { korean: '체리', english: 'cherry' },
];

const koreanWordEl = document.getElementById('korean-word');
const answerInputEl = document.getElementById('answer-input');
const checkButtonEl = document.getElementById('check-button');
const nextButtonEl = document.getElementById('next-button');
const feedbackEl = document.getElementById('feedback');
const successSound = document.getElementById('success-sound');

let currentWord;

function nextWord() {
    answerInputEl.value = '';
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    currentWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    koreanWordEl.textContent = currentWord.korean;
    
    answerInputEl.style.display = 'block';
    checkButtonEl.style.display = 'block';
    nextButtonEl.style.display = 'none';
}

function checkAnswer() {
    const userAnswer = answerInputEl.value.trim().toLowerCase();
    if (userAnswer === currentWord.english) {
        feedbackEl.textContent = 'Correct!';
        feedbackEl.className = 'correct';
        successSound.play();
        spawnNewPiece(); // From tetris.js

        answerInputEl.style.display = 'none';
        checkButtonEl.style.display = 'none';
        nextButtonEl.style.display = 'block';

    } else {
        feedbackEl.textContent = `Incorrect. The answer is ${currentWord.english}`;
        feedbackEl.className = 'incorrect';
        
        answerInputEl.style.display = 'none';
        checkButtonEl.style.display = 'none';
        nextButtonEl.style.display = 'block';
    }
}

checkButtonEl.addEventListener('click', checkAnswer);
nextButtonEl.addEventListener('click', nextWord);
answerInputEl.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

nextWord();
initTetris(); // From tetris.js