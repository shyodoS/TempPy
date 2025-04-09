document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const thermometerFill = document.querySelector('.temperature-fill');
    const temperatureValue = document.querySelector('.temperature-value');
    const questionElement = document.querySelector('.question');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-answer');
    const feedbackElement = document.querySelector('.feedback');
    const attemptsValue = document.querySelector('.attempts-value');
    const correctValue = document.querySelector('.correct-value');
    const quizContainer = document.querySelector('.quiz-container');
    const resultContainer = document.querySelector('.result-container');
    const winContainer = document.querySelector('.win-container');
    const loseContainer = document.querySelector('.lose-container');
    const claimPrizeButton = document.getElementById('claim-prize');
    const downloadEbookButton = document.getElementById('download-ebook');

    // Estado do jogo
    let currentQuestionIndex = 0;
    let temperature = 0;
    let attempts = 0;
    let correctAnswers = 0;
    let maxAttempts = 5;
    let gameFinished = false;
    let questions = [
        {
            id: 1,
            question: "Qual linguagem de programação usa a função 'print()' para exibir texto?"
        },
        {
            id: 2,
            question: "Em Python, qual estrutura de dados é usada para armazenar pares de chave-valor?"
        },
        {
            id: 3,
            question: "Qual método é usado para adicionar um elemento ao final de uma lista em Python?"
        }
    ];

    // Inicializar o quiz
    function initQuiz() {
        updateTemperature(0);
        showQuestion(currentQuestionIndex);
        updateCounters();
    }

    // Mostrar a questão atual
    function showQuestion(index) {
        if (index < questions.length) {
            questionElement.textContent = questions[index].question;
            answerInput.value = '';
            answerInput.focus();
        }
    }

    // Atualizar o termômetro
    function updateTemperature(newTemp) {
        // Limitar entre 0 e 100
        temperature = Math.max(0, Math.min(100, newTemp));
        
        // Atualizar visual
        thermometerFill.style.height = `${temperature}%`;
        temperatureValue.textContent = `${Math.round(temperature)}°C`;
        
        // Mudar cor baseado na temperatura
        if (temperature <= 33) {
            thermometerFill.style.backgroundColor = 'var(--temp-cold)';
        } else if (temperature <= 66) {
            thermometerFill.style.backgroundColor = 'var(--temp-warm)';
        } else {
            thermometerFill.style.backgroundColor = 'var(--temp-hot)';
        }
    }

    // Atualizar contadores
    function updateCounters() {
        attemptsValue.textContent = `${attempts}/${maxAttempts}`;
        correctValue.textContent = correctAnswers;
    }

    // Mostrar feedback
    function showFeedback(isCorrect, correctAnswer = null) {
        feedbackElement.classList.remove('correct', 'incorrect', 'show');
        
        setTimeout(() => {
            if (isCorrect) {
                feedbackElement.textContent = "Correto! 🎉";
                feedbackElement.classList.add('correct', 'show');
            } else {
                feedbackElement.textContent = `Incorreto! A resposta correta é: ${correctAnswer}`;
                feedbackElement.classList.add('incorrect', 'show');
            }
        }, 10);
    }

    // Verificar resposta
    function checkAnswer() {
        if (gameFinished) return;
        
        if (!answerInput.value.trim()) {
            alert("Por favor, insira uma resposta.");
            return;
        }
        
        const answer = answerInput.value.trim();
        const currentQuestion = questions[currentQuestionIndex];
        
        fetch('/check-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                questionId: currentQuestion.id,
                answer: answer
            })
        })
        .then(response => response.json())
        .then(data => {
            attempts++;
            
            if (data.correct) {
                correctAnswers++;
                updateTemperature(temperature + 20);
                showFeedback(true);
            } else {
                updateTemperature(temperature - 10);
                showFeedback(false, data.correctAnswer);
            }
            
            updateCounters();
            
            // Verificar condições de término
            if (correctAnswers >= 3) {
                // Vitória: acertou 3 perguntas
                gameFinished = true;
                setTimeout(endQuiz, 1500);
                return;
            }
            
            if (attempts >= maxAttempts) {
                // Derrota: usou todas as 5 tentativas sem acertar 3 perguntas
                gameFinished = true;
                setTimeout(endQuiz, 1500);
                return;
            }
            
            // Avançar para próxima pergunta se a resposta atual estiver correta
            if (data.correct && currentQuestionIndex < questions.length - 1) {
                setTimeout(() => {
                    currentQuestionIndex++;
                    showQuestion(currentQuestionIndex);
                }, 1500);
            } 
            // Se errou e ainda tem perguntas para responder, permanece na mesma pergunta
            else if (!data.correct && currentQuestionIndex < questions.length) {
                setTimeout(() => {
                    // Mantém na mesma pergunta, apenas limpa o input
                    answerInput.value = '';
                    answerInput.focus();
                }, 1500);
            }
            // Se já respondeu todas as perguntas mas não alcançou 3 acertos, volta para a primeira
            else if (currentQuestionIndex >= questions.length - 1 && correctAnswers < 3) {
                setTimeout(() => {
                    currentQuestionIndex = 0;
                    showQuestion(currentQuestionIndex);
                }, 1500);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao verificar a resposta. Tente novamente.');
        });
    }

    // Finalizar o quiz
    function endQuiz() {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        if (correctAnswers >= 3) {
            winContainer.style.display = 'block';
            loseContainer.style.display = 'none';
        } else {
            winContainer.style.display = 'none';
            loseContainer.style.display = 'block';
        }
    }

    // Event listeners
    submitButton.addEventListener('click', checkAnswer);
    
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    claimPrizeButton.addEventListener('click', function() {
        alert('Parabéns! Anote seu nome e apresente ao organizador para receber seu prêmio físico!');
    });
    
    downloadEbookButton.addEventListener('click', function() {
        alert('Seu ebook será aberto em uma nova aba para download!');
        // Em produção, isso redirecionaria para um arquivo real
        window.open('about:blank', '_blank');
    });

    // Inicializar o quiz
    initQuiz();
});