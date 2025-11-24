// ==========================================================
// 1. ESTRUTURAS DE DADOS E VARIÁVEIS GLOBAIS
// ==========================================================

// Estrutura de Dados: Lista completa de personagens
const allOnePieceCards = [
    { name: 'Luffy', imgClass: 'luffy' },
    { name: 'Zoro', imgClass: 'zoro' },
    { name: 'Nami', imgClass: 'nami' },
    { name: 'Usopp', imgClass: 'usopp' },
    { name: 'Sanji', imgClass: 'sanji' },
    { name: 'Chopper', imgClass: 'chopper' },
    { name: 'Robin', imgClass: 'robin' },
    { name: 'Franky', imgClass: 'franky' },
    { name: 'Brook', imgClass: 'brook' },
    { name: 'Jimbe', imgClass: 'jimbe' }
];

// Definições de dificuldade (número de pares)
const difficultySettings = {
    easy: 4,    // 8 cartas (4x2 ou 4x4)
    medium: 6,  // 12 cartas (4x3)
    hard: 9     // 18 cartas (6x3)
};

// Objeto de Gerenciamento de Estado do Jogo (STATE)
const gameState = {
    totalPairs: 0,
    matchedPairs: 0,
    attempts: 0,
    time: 0,
    timerInterval: null
};

// Variáveis de Controle do Mecanismo de Virar Cartas
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

// Elementos DOM para manipulação de interface
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
const gameGrid = document.querySelector('.grid');
const attemptsCounter = document.getElementById('attempts-counter');
const timerDisplay = document.getElementById('timer');

// ==========================================================
// 2. LÓGICA DE TEMPORIZADOR
// ==========================================================

function formatTime(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    gameState.timerInterval = setInterval(() => {
        gameState.time++;
        timerDisplay.textContent = formatTime(gameState.time);
    }, 1000);
}

function stopTimer() {
    clearInterval(gameState.timerInterval);
}

// ==========================================================
// 3. LÓGICA DE FLUXO DO JOGO (START, END, RESTART)
// ==========================================================

function startGame(difficulty) {
    // 1. Esconde a tela de dificuldade e mostra a tela do jogo
    difficultyScreen.style.display = 'none';
    winScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    
    // 2. Define o estado inicial do jogo
    gameState.totalPairs = difficultySettings[difficulty];
    gameState.matchedPairs = 0;
    gameState.attempts = 0;
    gameState.time = 0;
    
    // 3. Reseta o placar visual e o timer
    attemptsCounter.textContent = gameState.attempts;
    timerDisplay.textContent = formatTime(gameState.time);
    
    // 4. Cria e embaralha o tabuleiro
    createBoard(difficulty);
    
    // 5. Inicia o timer
    startTimer();
}

function showWinScreen() {
    stopTimer();
    gameScreen.style.display = 'none';
    winScreen.style.display = 'flex';

    // Formata o tempo para exibição
    const finalTime = formatTime(gameState.time);
    
    // Manipulação do DOM: Insere os resultados finais
    const resultsDiv = document.getElementById('win-results');
    resultsDiv.innerHTML = `
        <p>Dificuldade: <strong>${gameState.totalPairs} Pares</strong></p>
        <p>Tempo total: <strong>${finalTime}</strong></p>
        <p>Tentativas: <strong>${gameState.attempts}</strong></p>
    `;
}

function resetGame() {
    // Limpa o tabuleiro e volta para a tela de dificuldade
    gameGrid.innerHTML = '';
    gameScreen.style.display = 'none';
    winScreen.style.display = 'none';
    difficultyScreen.style.display = 'flex';
    resetBoard(); // Reseta flags de controle
}


// ==========================================================
// 4. CRIAÇÃO DO TABULEIRO (Embaralhamento e DOM)
// ==========================================================

function shuffle(array) {
    // Algoritmo: Fisher-Yates (ou similar)
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
}

function createBoard(difficulty) {
    gameGrid.innerHTML = ''; // Limpa o tabuleiro anterior
    
    // 1. Seleciona os personagens com base na dificuldade
    const selectedCards = allOnePieceCards.slice(0, gameState.totalPairs);
    
    // 2. Cria o array final de cartas (pares)
    const cardsToShuffle = [...selectedCards, ...selectedCards];

    // 3. Embaralha as cartas
    const shuffledCards = shuffle(cardsToShuffle);

    // 4. Ajusta o CSS da grid de acordo com a dificuldade
    gameGrid.className = 'grid'; // Reseta a classe
    gameGrid.classList.add(`grid-${difficulty}`);
    if (difficulty === 'hard') {
        // Reduz o tamanho da carta para caber mais na tela
        gameGrid.querySelectorAll('.card').forEach(c => c.style.width = '100px');
    }

    // 5. Cria e anexa os elementos no DOM
    shuffledCards.forEach(card => {
        const cardElement = document.createElement('div');
        const frontFace = document.createElement('div');
        const backFace = document.createElement('div');

        // Manipulação do DOM e data-attributes
        cardElement.classList.add('card');
        cardElement.dataset.character = card.name; 
        
        frontFace.classList.add('card-face', 'card-front');
        backFace.classList.add('card-face', 'card-back', card.imgClass); 

        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);
        gameGrid.appendChild(cardElement);

        // Eventos: Adiciona event listener
        cardElement.addEventListener('click', flipCard);
    });
}


// ==========================================================
// 5. LÓGICA DO JOGO (Cliques e Tentativas)
// ==========================================================

function flipCard() {
    // Controle de Fluxo: Trava, ou se já está virada, sai
    if (lockBoard) return;
    if (this === firstCard) return; 

    // Manipulação do DOM: Vira a carta
    this.classList.add('flip');

    if (!hasFlippedCard) {
        // Primeiro clique
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Segundo clique
    secondCard = this;
    lockBoard = true; 

    // Tentativas: Incrementa e atualiza o placar
    gameState.attempts++;
    attemptsCounter.textContent = gameState.attempts;

    checkForMatch();
}


function checkForMatch() {
    // Lógica Condicional: Compara data-attributes
    const isMatch = firstCard.dataset.character === secondCard.dataset.character;

    isMatch ? disableCards() : unflipCards();
}


function disableCards() {
    // Cartas formaram um par
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    firstCard.classList.add('match');
    secondCard.classList.add('match');

    gameState.matchedPairs++; 
    
    // Lógica Condicional: Checa se o jogo terminou
    if (gameState.matchedPairs === gameState.totalPairs) {
        showWinScreen();
    }

    resetBoard();
}


function unflipCards() {
    // Assincronismo Básico: Cria pausa visual
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1500); 
}


function resetBoard() {
    // Reseta as flags de controle
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}


// ==========================================================
// 6. INICIALIZAÇÃO DO EVENTOS DA INTERFACE
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners para seleção de dificuldade
    document.getElementById('btn-easy').addEventListener('click', () => startGame('easy'));
    document.getElementById('btn-medium').addEventListener('click', () => startGame('medium'));
    document.getElementById('btn-hard').addEventListener('click', () => startGame('hard'));

    // Event Listener para reiniciar o jogo na tela de vitória
    document.getElementById('btn-restart').addEventListener('click', resetGame);
});

// Começa mostrando apenas a tela de dificuldade
// A exibição inicial é controlada pelos estilos CSS e pela função startGame