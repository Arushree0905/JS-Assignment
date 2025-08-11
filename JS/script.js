const authSection = document.getElementById('auth-section');
const dashboard = document.getElementById('dashboard');
const quizTaking = document.getElementById('quiz-taking');
const scoresSection = document.getElementById('scores-section');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authButton = document.getElementById('auth-button');
const toggleAuth = document.getElementById('toggle-auth');
const quizForm = document.getElementById('quiz-form');
const addQuestionBtn = document.getElementById('add-question');
const questionsContainer = document.getElementById('questions-container');
const quizList = document.getElementById('quiz-list');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout');
const quizTakingTitle = document.getElementById('quiz-taking-title');
const quizQuestions = document.getElementById('quiz-questions');
const submitQuiz = document.getElementById('submit-quiz');
const scoresQuizTitle = document.getElementById('scores-quiz-title');
const scoresBody = document.getElementById('scores-body');
const backToDashboard = document.getElementById('back-to-dashboard');

let isRegister = false;
let currentUser = null;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!username || !email || !password) {
        alert('All fields are required');
        return;
    }

    if (isRegister) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[email]) {
            alert('User already exists');
            return;
        }
        users[email] = { username, password };
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please login.');
        toggleAuthMode();
    } else {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[email] && users[email].password === password) {
            currentUser = { email, username };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            alert('Invalid credentials');
        }
    }
});

toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});

function toggleAuthMode() {
    isRegister = !isRegister;
    authTitle.textContent = isRegister ? 'Register' : 'Login';
    authButton.textContent = isRegister ? 'Register' : 'Login';
    toggleAuth.textContent = isRegister ? 'Switch to Login' : 'Switch to Register';
}

addQuestionBtn.addEventListener('click', () => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
        <input type="text" class="question-text" placeholder="Question" required>
        <input type="text" class="option" placeholder="Option 1" required>
        <input type="text" class="option" placeholder="Option 2" required>
        <input type="text" class="option" placeholder="Option 3" required>
        <input type="text" class="option" placeholder="Option 4" required>
        <select class="correct-answer" required>
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
        </select>
    `;
    questionsContainer.appendChild(questionDiv);
});

quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('quiz-title').value;
    const questions = Array.from(document.querySelectorAll('.question')).map(q => ({
        text: q.querySelector('.question-text').value,
        options: Array.from(q.querySelectorAll('.option')).map(o => o.value),
        correct: parseInt(q.querySelector('.correct-answer').value)
    }));

    const quizId = generateUUID();
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '{}');
    quizzes[quizId] = { title, questions, creator: currentUser.email, scores: [] };
    localStorage.setItem('quizzes', JSON.stringify(quizzes));

    const shareLink = `${window.location.origin}?quiz=${quizId}`;
    alert(`Quiz created! Share this link: ${shareLink}`);
    quizForm.reset();
    questionsContainer.innerHTML = questionsContainer.children[0].outerHTML;
    updateQuizList();
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAuth();
});

function showAuth() {
    authSection.style.display = 'block';
    dashboard.style.display = 'none';
    quizTaking.style.display = 'none';
    scoresSection.style.display = 'none';
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboard.style.display = 'block';
    quizTaking.style.display = 'none';
    scoresSection.style.display = 'none';
    currentUserSpan.textContent = currentUser.username;
    updateQuizList();
}

function updateQuizList() {
    quizList.innerHTML = '';
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '{}');
    Object.entries(quizzes).forEach(([id, quiz]) => {
        if (quiz.creator === currentUser.email) {
            const quizDiv = document.createElement('div');
            quizDiv.className = 'quiz-item';
            quizDiv.innerHTML = `
                <h4>${quiz.title}</h4>
                <p>Link: <a href="?quiz=${id}">${window.location.origin}?quiz=${id}</a></p>
                <button onclick="viewScores('${id}')">View Scores</button>
            `;
            quizList.appendChild(quizDiv);
        }
    });
}

function viewScores(quizId) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '{}');
    const quiz = quizzes[quizId];
    if (!quiz) return;

    authSection.style.display = 'none';
    dashboard.style.display = 'none';
    quizTaking.style.display = 'none';
    scoresSection.style.display = 'block';

    scoresQuizTitle.textContent = quiz.title;
    scoresBody.innerHTML = '';
    quiz.scores.sort((a, b) => b.score - a.score).forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.participant}</td>
            <td>${score.score}/${quiz.questions.length}</td>
            <td>${new Date(score.date).toLocaleString()}</td>
        `;
        scoresBody.appendChild(row);
    });
}

backToDashboard.addEventListener('click', showDashboard);

function loadQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz');
    if (!quizId) return;

    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '{}');
    const quiz = quizzes[quizId];
    if (!quiz) {
        alert('Quiz not found');
        return;
    }

    authSection.style.display = 'none';
    dashboard.style.display = 'none';
    quizTaking.style.display = 'block';
    scoresSection.style.display = 'none';

    quizTakingTitle.textContent = quiz.title;
    quizQuestions.innerHTML = '';
    quiz.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.innerHTML = `
            <h4>Question ${index + 1}: ${q.text}</h4>
            ${q.options.map((opt, i) => `
                <label><input type="radio" name="q${index}" value="${i}"> ${opt}</label><br>
            `).join('')}
        `;
        quizQuestions.appendChild(questionDiv);
    });

    submitQuiz.onclick = () => {
        const answers = Array.from(document.querySelectorAll('.quiz-question')).map((q, i) => {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            return selected ? parseInt(selected.value) : -1;
        });

        let score = 0;
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correct) score++;
        });

        const participant = prompt('Enter your name:');
        if (participant) {
            quiz.scores.push({
                participant,
                score,
                date: new Date().toISOString()
            });
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            alert(`Your score: ${score}/${quiz.questions.length}`);
            window.location.href = window.location.origin;
        }
    };
}

window.onload = () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showAuth();
    }
    loadQuiz();
};