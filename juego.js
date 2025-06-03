document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const celdas = document.querySelectorAll('.celda');
    const mensajeElemento = document.querySelector('.estado-juego');
    const reiniciarboton = document.querySelector('.boton');
    const resetearjuego = document.querySelector('.boton-secundario');
    const turnoIndicador = document.querySelector('.jugador-actual');
    const puntuacionX = document.getElementById('puntuacionX');
    const puntuacionO = document.getElementById('puntuacionO');
    const puntuacionempate = document.getElementById('puntuacionEmpates');
    const historialX = document.getElementById('x-history');
    const historialO = document.getElementById('o-history');
    
    // Estado del juego
    let vacio = ['', '', '', '', '', '', '', '', ''];
    let jugadorinicial = 'X';
    let activarJuego = true;
    let listado = { X: 0, O: 0, ties: 0 };
    let historialjuego = { X: [], O: [] };
    let numeroronda = 1;
    let perdedor = null;
    
    // Combinaciones ganadoras
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
        [0, 4, 8], [2, 4, 6]             // diagonales
    ];
    
    // Inicializar el juego
    iniciar();
    
    function iniciar() {
        // Determinar el jugador inicial
        if (perdedor) {
            jugadorinicial = perdedor;
        } else {
            jugadorinicial = 'X'; // Por defecto empieza X en la primera partida
        }
        
        // Reiniciar el tablero
        vacio = ['', '', '', '', '', '', '', '', ''];
        activarJuego = true;
        
        // Event listeners para las celdas
        celdas.forEach((cell, index) => {
            cell.addEventListener('click', () => verificarcelda(index));
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });
        
        // Event listeners para los botones
        reiniciarboton.addEventListener('click', reiniciarjuego);
        resetearjuego.addEventListener('click', reiniciar);
        
        // Actualizar la interfaz
     atualizarturno();
        actualizardisplay();
        mensaje();
    }
    
    function verificarcelda(index) {
        // Si la celda ya está ocupada o el juego no está activo, no hacer nada
        if (vacio[index] !== '' || !activarJuego) {
            return;
        }
        
        // Actualizar el tablero y la interfaz
        vacio[index] = jugadorinicial;
        actualizarcelda(index);
        
        // Verificar si hay un ganador o empate
        verResultado();
    }
    
    function actualizarcelda(index) {
        const cell = celdas[index];
        // Añadir la marca del jugador
        cell.textContent = jugadorinicial;
        cell.classList.add(jugadorinicial.toLowerCase());
        
        // Agregar animación
        cell.style.animation = 'fadeIn 0.5s';
        setTimeout(() => {
            cell.style.animation = '';
        }, 500);
    }
    
    function verResultado() {
        let roundWon = false;
        
        // Verificar todas las combinaciones ganadoras
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            
            if (vacio[a] === '' || vacio[b] === '' || vacio[c] === '') {
                continue;
            }
            
            if (vacio[a] === vacio[b] && vacio[b] === vacio[c]) {
                roundWon = true;
                
                // Resaltar las celdas ganadoras
                celdas[a].classList.add('winning-cell');
                celdas[b].classList.add('winning-cell');
                celdas[c].classList.add('winning-cell');
                break;
            }
        }
        
        // Si hay un ganador
        if (roundWon) {
            finjuego(false);
            return;
        }
        
        // Si es un empate
        if (!vacio.includes('')) {
            finjuego(true);
            return;
        }
        
        // Cambiar de jugador
        turnojugador();
    }
    
    function finjuego(isDraw) {
        activarJuego = false;
        
        if (isDraw) {
            mensajes('¡Empate!', 'empate');
            listado.ties++;
            // En empate, el último perdedor sigue comenzando
        } else {
            mensajes(`¡Jugador ${jugadorinicial} gana!`, 'ganador');
            // Actualizar el marcador
            listado[jugadorinicial]++;
            
            // Registrar en el historial
            agregarhistorial(jugadorinicial);
            
            // El perdedor comienza la próxima partida
            perdedor = jugadorinicial === 'X' ? 'O' : 'X';
        }
        
        actualizardisplay();
    }
    
    function agregarhistorial(winner) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        
        const historyItem = {
            round: numeroronda,
            winner: winner,
            timestamp: `${dateString} ${timeString}`
        };
        
        historialjuego[winner].push(historyItem);
        actualizarhistorial();
        numeroronda++;
    }
    
    function actualizarhistorial() {
        // Limpiar listas
        historialX.innerHTML = '';
        historialO.innerHTML = '';
        
        // Llenar historial de X (orden descendente)
        historialjuego.X.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Ronda ${item.round}</span><span>${item.timestamp}</span>`;
            historialX.appendChild(li);
        });
        
        // Llenar historial de O (orden descendente)
        historialjuego.O.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>Ronda ${item.round}</span><span>${item.timestamp}</span>`;
            historialO.appendChild(li);
        });
    }
    
    function turnojugador() {
        jugadorinicial = jugadorinicial === 'X' ? 'O' : 'X';
     atualizarturno();
    }
    
    function atualizarturno() {
        turnoIndicador.textContent = `Turno: Jugador ${jugadorinicial}`;
        turnoIndicador.style.backgroundColor = jugadorinicial === 'X' ? '#dc3545' : '#007bff';
    }
    
    function actualizardisplay() {
        puntuacionX.textContent = listado.X;
        puntuacionO.textContent = listado.O;
        puntuacionempate.textContent = listado.ties;
    }
    
    function mensajes(msg, type) {
        mensajeElemento.textContent = msg;
        mensajeElemento.className = 'estado-juego';
        mensajeElemento.classList.add(type);
    }
    
    function mensaje() {
        mensajeElemento.textContent = '';
        mensajeElemento.className = 'estado-juego';
    }
    
    function reiniciarjuego() {
        // Reiniciar el estado del juego
        iniciar();
    }
    
    function reiniciar() {
        // Reiniciar todos los marcadores
        listado = { X: 0, O: 0, ties: 0 };
        historialjuego = { X: [], O: [] };
        numeroronda = 1;
        perdedor = null;
        actualizardisplay();
        actualizarhistorial();
        reiniciarjuego();
    }
});