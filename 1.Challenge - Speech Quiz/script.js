const questions = [
    {
        question: "What is the capital of France?",
        answers: ["Paris", "Berlin", "Madrid", "Rome"],
        correct: "Paris",
        image: "images/vraag1.jpg"
    },
    {
        question: "What is the capital of Germany?",
        answers: ["Paris", "Berlin", "Madrid", "Rome"],
        correct: "Berlin",
        image: "images/vraag2.jpg"
    },
    {
        question: "What is the capital of Spain?",
        answers: ["Lisbon", "Berlin", "Madrid", "Rome"],
        correct: "Madrid",
        image: "images/vraag3.jpg"
    },
    {
        question: "What is the capital of Italy?",
        answers: ["Paris", "Berlin", "Madrid", "Rome"],
        correct: "Rome",
        image: "images/vraag4.jpg"
    },
    {
        question: "What is the capital of Canada?",
        answers: ["Toronto", "Ottawa", "Vancouver", "Montreal"],
        correct: "Ottawa",
        image: "images/vraag5.jpg"
    },
    {
        question: "What is the capital of Australia?",
        answers: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        correct: "Canberra",
        image: "images/vraag6.jpg"
    },
    {
        question: "What is the capital of Japan?",
        answers: ["Tokyo", "Osaka", "Kyoto", "Nagoya"],
        correct: "Tokyo",
        image: "images/vraag7.jpg"
    },
    {
        question: "What is the capital of Russia?",
        answers: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg"],
        correct: "Moscow",
        image: "images/vraag8.jpg"
    },
    {
        question: "What is the capital of China?",
        answers: ["Shanghai", "Beijing", "Guangzhou", "Shenzhen"],
        correct: "Beijing",
        image: "images/vraag9.jpg"
    },
    {
        question: "What is the capital of India?",
        answers: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        correct: "Delhi",
        image: "images/vraag10.jpg"
    }
];

let currentQuestionIndex = 0;
let score = 0;
let userAnswerReceived = false; // Flag om bij te houden of de gebruiker al een antwoord heeft gegeven

const introScreen = document.getElementById('intro');
const quizScreen = document.getElementById('quiz');
const resultScreen = document.getElementById('result');
const progressBar = document.getElementById('progress');
const questionElement = document.getElementById('question');
const answersContainer = document.getElementById('answers');
const resultMessage = document.getElementById('result-message');
const scoreMessage = document.getElementById('score-message');

function startQuiz() {
    introScreen.classList.add('hidden');
    quizScreen.classList.add('active');
    loadQuestion();
}

function loadQuestion() {
    userAnswerReceived = false; // Reset de vlag elke keer dat een nieuwe vraag wordt geladen
    const questionData = questions[currentQuestionIndex];
    questionElement.innerText = questionData.question;
    answersContainer.innerHTML = '';
    questionData.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('answer-btn');
        button.addEventListener('click', () => handleAnswer(answer)); // Voeg een eventlistener toe aan de knoppen
        answersContainer.appendChild(button);
    });

    speakText(`${questionData.question}. The options are ${questionData.answers.join(', ')}.`, () => {
        recognition.start();
    });

    document.body.style.backgroundImage = `url(${questionData.image})`;
    progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
}

function handleAnswer(answer) {
    if (!userAnswerReceived) { // Controleer of de gebruiker al een antwoord heeft gegeven
        userAnswerReceived = true; // Zet de vlag op true om aan te geven dat er een antwoord is ontvangen
        recognition.abort(); // Stop met luisteren naar spraak zodra een knop is geklikt
        checkAnswer(answer);
    }
}

function checkAnswer(answer) {
    const questionData = questions[currentQuestionIndex];
    const isCorrect = answer.toLowerCase() === questionData.correct.toLowerCase();

    showFeedback(isCorrect, () => {
        if (isCorrect) {
            score++;
        }
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResult();
        }
    });
}

function showFeedback(isCorrect, callback) {
    const feedbackMessage = isCorrect ? "That answer is correct!" : "That answer is incorrect!";
    speakText(feedbackMessage, callback);
}

function showResult() {
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    resultMessage.innerText = `Your score is ${score} out of ${questions.length}.`;
    scoreMessage.innerText = getScoreMessage(score);
    speakText(resultMessage.innerText);
}

function getScoreMessage(score) {
    if (score === questions.length) {
        return "Excellent job!";
    } else if (score >= questions.length / 2) {
        return "Good job!";
    } else {
        return "Try again!";
    }
}

function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    resultScreen.classList.remove('active');
    introScreen.classList.add('active');
}

function speakText(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    const englishVoice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-GB' || voice.lang === 'en-US');
    utterance.voice = englishVoice;

    utterance.onend = callback;
    speechSynthesis.speak(utterance);
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
    const spokenAnswer = event.results[0][0].transcript.toLowerCase();
    checkAnswer(spokenAnswer);
};

recognition.onend = () => {
    if (currentQuestionIndex < questions.length && !userAnswerReceived) {
        recognition.start(); // Start de spraakherkenning opnieuw als er nog geen antwoord is ontvangen
    }
};

document.addEventListener('DOMContentLoaded', () => {
    introScreen.classList    .add('active');
    speakText("Welcome to the quiz. Press the button to start.");
});

// Event listener voor de startknop
document.getElementById('start-btn').addEventListener('click', startQuiz);

// Event listener voor de knop om de quiz opnieuw te starten
document.getElementById('restart-btn').addEventListener('click', restartQuiz);