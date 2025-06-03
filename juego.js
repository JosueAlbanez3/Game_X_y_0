document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const cells = document.querySelectorAll('.celda');
    const messageElement = document.querySelector('.estado-juego');
    const resetButton = document.querySelector('.boton');
    const resetScoreButton = document.querySelector('.boton-secundario');
    const turnIndicator = document.querySelector('.jugador-actual');
    const playerXScore = document.getElementById('puntuacionX');
    const playerOScore = document.getElementById('puntuacionO');
    const tiesScore = document.getElementById('puntuacionEmpates');
    const xHistoryList = document.getElementById('x-history');
    const oHistoryList = document.getElementById('o-history');
    
    // Estado del juego
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { X: 0, O: 0, ties: 0 };
    let gameHistory = { X: [], O: [] };
    let roundNumber = 1;
    let lastLoser = null;
    
    // Combinaciones ganadoras
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
        [0, 4, 8], [2, 4, 6]             // diagonales
    ];
    
    // Inicializar el juego
    init();
    
    function init() {
        // Determinar el jugador inicial
        if (lastLoser) {
            currentPlayer = lastLoser;
        } else {
            currentPlayer = 'X'; // Por defecto empieza X en la primera partida
        }
        
        // Reiniciar el tablero
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        
        // Event listeners para las celdas
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => handleCellClick(index));
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });
        
        // Event listeners para los botones
        resetButton.addEventListener('click', resetGame);
        resetScoreButton.addEventListener('click', resetScore);
        
        // Actualizar la interfaz
        updateTurnIndicator();
        updateScoreDisplay();
        clearMessage();
    }
    
    function handleCellClick(index) {
        // Si la celda ya está ocupada o el juego no está activo, no hacer nada
        if (board[index] !== '' || !gameActive) {
            return;
        }
        
        // Actualizar el tablero y la interfaz
        board[index] = currentPlayer;
        updateCell(index);
        
        // Verificar si hay un ganador o empate
        checkResult();
    }
    
    function updateCell(index) {
        const cell = cells[index];
        // Añadir la marca del jugador
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Agregar animación
        cell.style.animation = 'fadeIn 0.5s';
        setTimeout(() => {
            cell.style.animation = '';
        }, 500);
    }
    
    function checkResult() {
        let roundWon = false;
        
        // Verificar todas las combinaciones ganadoras
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            
            if (board[a] === '' || board[b] === '' || board[c] === '') {
                continue;
            }
            
            if (board[a] === board[b] && board[b] === board[c]) {
                roundWon = true;
                
                // Resaltar las celdas ganadoras
                cells[a].classList.add('winning-cell');
                cells[b].classList.add('winning-cell');
                cells[c].classList.add('winning-cell');
                break;
            }
        }
        
        // Si hay un ganador
        if (roundWon) {
            endGame(false);
            return;
        }
        
        // Si es un empate
        if (!board.includes('')) {
            endGame(true);
            return;
        }
        
        // Cambiar de jugador
        changePlayer();
    }
    
    function endGame(isDraw) {
        gameActive = false;
        
        if (isDraw) {
            showMessage('¡Empate!', 'empate');
            scores.ties++;
            // En empate, el último perdedor sigue comenzando
        } else {
            showMessage(`¡Jugador ${currentPlayer} gana!`, 'ganador');
            // Actualizar el marcador
            scores[currentPlayer]++;
            
            // Registrar en el historial
            addToHistory(currentPlayer);
            
            // El perdedor comienza la próxima partida
            lastLoser = currentPlayer === 'X' ? 'O' : 'X';
        }
        
        updateScoreDisplay();
    }
    
    function addToHistory(winner) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        
        const historyItem = {
            round: roundNumber,
            winner: winner,
            timestamp: `${dateString} ${timeString}`
        };
        
        gameHistory[winner].push(historyItem);
        updateHistoryDisplay();
        roundNumber++;
    }
    
    function updateHistoryDisplay() {
        // Limpiar listas
        xHistoryList.innerHTML = '';
        oHistoryList.innerHTML = '';
        
        // Llenar historial de X (orden descendente)
        gameHistory.X.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Ronda ${item.round}</span><span>${item.timestamp}</span>`;
            xHistoryList.appendChild(li);
        });
        
        // Llenar historial de O (orden descendente)
        gameHistory.O.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Ronda ${item.round}</span><span>${item.timestamp}</span>`;
            oHistoryList.appendChild(li);
        });
    }
    
    function changePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }
    
    function updateTurnIndicator() {
        turnIndicator.textContent = `Turno: Jugador ${currentPlayer}`;
        turnIndicator.style.backgroundColor = currentPlayer === 'X' ? '#dc3545' : '#007bff';
    }
    
    function updateScoreDisplay() {
        playerXScore.textContent = scores.X;
        playerOScore.textContent = scores.O;
        tiesScore.textContent = scores.ties;
    }
    
    function showMessage(msg, type) {
        messageElement.textContent = msg;
        messageElement.className = 'estado-juego';
        messageElement.classList.add(type);
    }
    
    function clearMessage() {
        messageElement.textContent = '';
        messageElement.className = 'estado-juego';
    }
    
    function resetGame() {
        // Reiniciar el estado del juego
        init();
    }
    
    function resetScore() {
        // Reiniciar todos los marcadores
        scores = { X: 0, O: 0, ties: 0 };
        gameHistory = { X: [], O: [] };
        roundNumber = 1;
        lastLoser = null;
        updateScoreDisplay();
        updateHistoryDisplay();
        resetGame();
    }
});