// --- VARIABLES GLOBALES ---
let agents = [], maps = [], skins = [];
let myAgent = null, mode = '', gameOver = false, isPicking = false;
let qCount = 0, fCount = 0;
let miniAns = '', miniAnsAlt = '', miniMode = '';
let miniStreak = 0, miniTimer = null, timeLeft = 15;
let wordleWord = '', wordleGuesses = [], wordleCurrent = '', wordleOver = false, wordleStreak = 0;
let discardModeAsk = false; // Modo descarte para "Adivina el Agente"

// Temporizadores personalizados por modo
const TIMER_CONFIG = {
    'agente': 20,
    'habilidad': 20,
    'arma': 15,
    'mapa': 15,
    'skin': 60,
    'trivia': 15
};

const agentExtra = {
    "Jett": { c: "Corea del Sur", g: "Femenino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Raze": { c: "Brasil", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Breach": { c: "Suecia", g: "Masculino", flash: "Sí", stunt: "Sí", humo: "No", slow: "No", reveal: "No" },
    "Omen": { c: "Desconocido", g: "No Humano", flash: "Sí", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Brimstone": { c: "Estados Unidos", g: "Masculino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Phoenix": { c: "Reino Unido", g: "Masculino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Sage": { c: "China", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "No" },
    "Sova": { c: "Rusia", g: "Masculino", flash: "No", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Viper": { c: "Estados Unidos", g: "Femenino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Cypher": { c: "Marruecos", g: "Masculino", flash: "No", stunt: "Sí", humo: "Sí", slow: "No", reveal: "Sí" },
    "Reyna": { c: "México", g: "Femenino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Killjoy": { c: "Alemania", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Skye": { c: "Australia", g: "Femenino", flash: "Sí", stunt: "Sí", humo: "No", slow: "No", reveal: "Sí" },
    "Yoru": { c: "Japón", g: "Masculino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "Sí" },
    "Astra": { c: "Ghana", g: "Femenino", flash: "No", stunt: "Sí", humo: "Sí", slow: "No", reveal: "No" },
    "Chamber": { c: "Francia", g: "Masculino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "Sí" },
    "Neon": { c: "Filipinas", g: "Femenino", flash: "No", stunt: "Sí", humo: "No", slow: "Sí", reveal: "No" },
    "Fade": { c: "Turquía", g: "Femenino", flash: "Sí", stunt: "No", humo: "No", slow: "Sí", reveal: "Sí" },
    "Harbor": { c: "India", g: "Masculino", flash: "Sí", stunt: "Sí", humo: "No", slow: "Sí", reveal: "No" },
    "Gekko": { c: "Estados Unidos", g: "Masculino", flash: "Sí", stunt: "Sí", humo: "No", slow: "Sí", reveal: "No" },
    "Deadlock": { c: "Noruega", g: "Femenino", flash: "No", stunt: "Sí", humo: "Sí", slow: "Sí", reveal: "No" },
    "Tejo" : { c: "Colombia", g: "Masculino", flash: "No", stunt: "Sí", humo: "No", slow: "No", reveal: "Sí" },
    "Veto": { c: "Senegal", g: "Masculino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "No" },
    "Miks" : { c: "Croacia", g: "Masculino", flash: "No", stunt: "Sí", humo: "Sí", slow: "No", reveal: "No" },
    "Waylay" : { c: "Tailandia", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "No" },
    "KAY/O" : { c: "Desconocido", g: "No Humano", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "Sí" },
    "Iso" : { c: "China", g: "Masculino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Vyse" : { c: "Desconocido", g: "No Humano", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Clove" : { c: "Escocia", g: "Femenino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" }
};

// Función para normalizar texto (remover tildes y convertir a minúsculas)
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// --- Manejo de la historia y flechas de navegación ---
window.addEventListener('popstate', (e) => {
    if (document.getElementById('main-menu').style.display === 'none') {
        backToMenu(true);
    }
});

// --- INICIALIZACIÓN ---
async function init() {
    try {
        const [rA, rM, rS] = await Promise.all([
            fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=es-ES'),
            fetch('https://valorant-api.com/v1/maps?language=es-ES'),
            fetch('https://valorant-api.com/v1/weapons/skins?language=es-ES')
        ]);
        
        if (!rA.ok || !rM.ok || !rS.ok) {
            throw new Error('Error al obtener datos de la API');
        }
        
        agents = (await rA.json()).data;
        maps = (await rM.json()).data.filter(m => m.displayIcon && m.displayName !== "District" && m.displayName !== "Kasbah" && m.displayName !== "Piazza" && m.displayName !== "Drift" && m.displayName !== "Glitch");
        skins = (await rS.json()).data.filter(s => s.displayIcon && !s.displayName.includes("Standard"));
        
        document.getElementById('menu-grid').innerHTML = `
            <div class="mode-card" onclick="startGame('classic')">
                <h2>Modo Clásico</h2>
                <p>Juega al ¿quién es quién? con un amigo.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startGame('ask')">
                <h2>Adivina el Agente</h2>
                <p>Adivina el agente secreto mediante preguntas de atributos.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('agente')">
                <h2>¿Quién es?</h2>
                <p>Lee la descripción y adivina de qué agente se trata.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('habilidad')">
                <h2>Habilidades</h2>
                <p>Mira el ícono de la habilidad y adivina de qué agente es.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('arma')">
                <h2>Armas</h2>
                <p>Adivina el arma basándote en su precio y capacidad de balas.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('mapa')">
                <h2>Mapas</h2>
                <p>Identifica el mapa de Valorant solo por su radar.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('skin')">
                <h2>Skins</h2>
                <p>¿Eres un experto en la tienda? Adivina el nombre de la skin.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('trivia')">
                <h2>Trivia</h2>
                <p>Preguntas sobre lore, nombres reales y mecánicas del juego.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startWordle()">
                <h2>Wordle</h2>
                <p>Adivina el nombre del agente letra a letra. ¡Tenés 5 intentos!</p>
                <button class="btn">JUGAR</button>
            </div>
        `;
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('menu-grid').style.display = 'grid';
    } catch (e) { 
        console.error(e);
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('menu-grid').innerHTML = `
            <div class="error-message">
                ⚠️ Error al cargar los datos del juego.<br>
                Por favor, verifica tu conexión a internet e intenta recargar la página.
            </div>
        `;
        document.getElementById('menu-grid').style.display = 'block';
    }
}

// --- LÓGICA MODOS PRINCIPALES ---
function startGame(m) {
    history.pushState({inGame: true}, '');
    mode = m;
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-interface').style.display = 'block';
    document.getElementById('game-interface').classList.add('fade-in');
    document.getElementById('display-mode').textContent = m === 'classic' ? 'MODO CLÁSICO' : 'ADIVINA EL AGENTE';
    document.getElementById('panel-title').textContent = "Agente Secreto";
    resetGame();
}

function resetGame() {
    gameOver = false; isPicking = false; qCount = 0; fCount = 0; discardModeAsk = false;
    myAgent = (mode === 'ask') ? agents[Math.floor(Math.random() * agents.length)] : null;
    
    document.getElementById('stat-q').textContent = "0";
    document.getElementById('stat-f').textContent = "0";
    
    const askContainer = document.getElementById('ask-interface-container');
    askContainer.style.display = (mode === 'ask') ? 'block' : 'none';
    
    document.getElementById('ask-controls').style.display = 'block';
    const btnDiscard = document.getElementById('btn-discard');
    if(btnDiscard) {
        btnDiscard.textContent = "Modo Descarte: DESACTIVADO";
        btnDiscard.style.background = "transparent";
        btnDiscard.style.color = "#ff4655";
    }
    
    document.getElementById('classic-pick-zone').style.display = (mode === 'classic') ? 'block' : 'none';
    document.getElementById('game-message').style.display = 'none';
    document.getElementById('game-message').className = '';
    document.getElementById('reset-zone').style.display = (mode === 'classic' || mode === 'ask') ? 'block' : 'none';
    document.getElementById('q-mark').style.display = 'block';
    document.getElementById('secret-img').style.display = 'none';
    document.getElementById('secret-name').textContent = "???";
    document.getElementById('history-list').innerHTML = '';
    
    updateValOptions();
    renderBoard();
}

function toggleDiscardMode() {
    discardModeAsk = !discardModeAsk;
    const btn = document.getElementById('btn-discard');
    btn.textContent = `Modo Descarte: ${discardModeAsk ? 'ACTIVADO' : 'DESACTIVADO'}`;
    btn.style.background = discardModeAsk ? '#ff4655' : 'transparent';
    btn.style.color = discardModeAsk ? 'white' : '#ff4655';
}

function renderBoard() {
    const b = document.getElementById('board');
    b.innerHTML = '';
    agents.forEach(a => {
        const div = document.createElement('div');
        div.className = 'agent-card';
        div.innerHTML = `<img src="${a.displayIcon}" style="width:60px; height:60px; margin-bottom:5px;"><br>${a.displayName}`;
        if (mode === 'classic') {
            div.onclick = () => pickAgent(a);
        } else if (mode === 'ask') {
            div.onclick = () => guessAgentAsk(a);
        }
        b.appendChild(div);
    });
}

function startPicking() {
    isPicking = true;
    document.getElementById('panel-title').textContent = "Elige a tu Agente";
    document.getElementById('classic-pick-zone').style.display = 'none';
}

function pickAgent(a) {
    if (!isPicking || gameOver) return;
    myAgent = a;
    document.getElementById('q-mark').style.display = 'none';
    document.getElementById('secret-img').src = a.displayIcon;
    document.getElementById('secret-img').style.display = 'block';
    document.getElementById('secret-name').textContent = a.displayName;
    document.getElementById('panel-title').textContent = "Tu Agente";
    isPicking = false;
}

function updateValOptions() {
    const cat = document.getElementById('cat-sel').value;
    const valSel = document.getElementById('val-sel');
    let opts = [];
    if (cat === 'role') opts = ['Duelista', 'Controlador', 'Iniciador', 'Centinela'];
    else if (cat === 'country') opts = [...new Set(Object.values(agentExtra).map(x => x.c))].sort();
    else if (cat === 'gender') opts = ['Masculino', 'Femenino', 'No Humano'];
    else opts = ['Sí', 'No'];
    valSel.innerHTML = opts.map(o => `<option value="${o}">${o}</option>`).join('');
}

function askQuestion() {
    if (gameOver || qCount >= 10) return;
    const cat = document.getElementById('cat-sel').value;
    const val = document.getElementById('val-sel').value;
    qCount++;
    document.getElementById('stat-q').textContent = qCount;

    let match = false;
    const myData = agentExtra[myAgent.displayName];
    if (cat === 'role') match = myAgent.role.displayName === val;
    else if (cat === 'country') match = myData.c === val;
    else if (cat === 'gender') match = myData.g === val;
    else if (cat === 'flash') match = myData.flash === val;
    else if (cat === 'stunt') match = myData.stunt === val;
    else if (cat === 'humo') match = myData.humo === val;
    else if (cat === 'slow') match = myData.slow === val;
    else if (cat === 'reveal') match = myData.reveal === val;

    const labels = {
        role: "Rol", country: "País", gender: "Género",
        flash: "Flash", stunt: "Stun", humo: "Humo", slow: "Slow", reveal: "Reveal"
    };

    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `<span>${labels[cat]}: ${val}</span><span class="${match ? 'res-si' : 'res-no'}">${match ? 'SÍ' : 'NO'}</span>`;
    document.getElementById('history-list').prepend(row);

    if (!match) {
        fCount++;
        document.getElementById('stat-f').textContent = fCount;
        if (fCount >= 3 && !discardModeAsk) {
            endGameAsk(false);
            return;
        }
    }

    if (discardModeAsk && !match) {
        agents.forEach(a => {
            const div = Array.from(document.querySelectorAll('.agent-card')).find(el => el.textContent.includes(a.displayName));
            if (!div) return;
            const aData = agentExtra[a.displayName];
            let shouldDiscard = false;
            if (cat === 'role') shouldDiscard = a.role.displayName === val;
            else if (cat === 'country') shouldDiscard = aData.c === val;
            else if (cat === 'gender') shouldDiscard = aData.g === val;
            else if (cat === 'flash') shouldDiscard = aData.flash === val;
            else if (cat === 'stunt') shouldDiscard = aData.stunt === val;
            else if (cat === 'humo') shouldDiscard = aData.humo === val;
            else if (cat === 'slow') shouldDiscard = aData.slow === val;
            else if (cat === 'reveal') shouldDiscard = aData.reveal === val;
            if (shouldDiscard) div.classList.add('discarded');
        });
    } else if (discardModeAsk && match) {
        agents.forEach(a => {
            const div = Array.from(document.querySelectorAll('.agent-card')).find(el => el.textContent.includes(a.displayName));
            if (!div) return;
            const aData = agentExtra[a.displayName];
            let shouldKeep = false;
            if (cat === 'role') shouldKeep = a.role.displayName === val;
            else if (cat === 'country') shouldKeep = aData.c === val;
            else if (cat === 'gender') shouldKeep = aData.g === val;
            else if (cat === 'flash') shouldKeep = aData.flash === val;
            else if (cat === 'stunt') shouldKeep = aData.stunt === val;
            else if (cat === 'humo') shouldKeep = aData.humo === val;
            else if (cat === 'slow') shouldKeep = aData.slow === val;
            else if (cat === 'reveal') shouldKeep = aData.reveal === val;
            if (!shouldKeep) div.classList.add('discarded');
        });
    }

    if (qCount >= 10) {
        document.getElementById('ask-controls').style.display = 'none';
        const msg = document.getElementById('game-message');
        msg.textContent = "¡Se acabaron las preguntas! Ahora debes adivinar el agente.";
        msg.className = 'msg-info';
    }
}

function guessAgentAsk(a) {
    if (gameOver || qCount < 10) return;
    if (a.displayName === myAgent.displayName) {
        endGameAsk(true);
    } else {
        endGameAsk(false);
    }
}

function endGameAsk(won) {
    gameOver = true;
    document.getElementById('q-mark').style.display = 'none';
    document.getElementById('secret-img').src = myAgent.displayIcon;
    document.getElementById('secret-img').style.display = 'block';
    document.getElementById('secret-name').textContent = myAgent.displayName;
    const msg = document.getElementById('game-message');
    msg.textContent = won ? `¡GANASTE! Era ${myAgent.displayName}` : `PERDISTE. Era ${myAgent.displayName}`;
    msg.className = won ? 'msg-win' : 'msg-lose';
    document.getElementById('ask-controls').style.display = 'none';
}

function backToMenu(fromPopState = false) {
    if (miniTimer) clearInterval(miniTimer);
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('main-menu').classList.add('fade-in');
    document.getElementById('game-interface').style.display = 'none';
    document.getElementById('minigame-interface').style.display = 'none';
    document.getElementById('wordle-interface').style.display = 'none';
    if (!fromPopState) history.pushState({}, '', location.pathname);
}

// --- MINIJUEGOS ---
function startMini(m) {
    history.pushState({inGame: true}, '');
    miniMode = m;
    miniStreak = 0;
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('minigame-interface').style.display = 'block';
    document.getElementById('minigame-interface').classList.add('fade-in');
    
    const titles = {
        agente: '¿QUIÉN ES?',
        habilidad: 'HABILIDADES',
        arma: 'ARMAS',
        mapa: 'MAPAS',
        skin: 'SKINS',
        trivia: 'TRIVIA'
    };
    document.getElementById('mini-title-display').textContent = titles[m];
    document.getElementById('mini-streak-display').textContent = miniStreak;
    loadMiniRound();
}

function loadMiniRound() {
    if (miniTimer) clearInterval(miniTimer);
    
    // Configurar temporizador personalizado
    timeLeft = TIMER_CONFIG[miniMode] || 15;
    document.getElementById('mini-timer-display').textContent = timeLeft;
    
    document.getElementById('mini-msg').style.display = 'none';
    document.getElementById('mini-msg').className = '';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('mini-img').style.display = 'none';
    document.getElementById('mini-clue').textContent = '';
    document.getElementById('mini-input-zone').style.display = 'none';
    document.getElementById('mini-options').style.display = 'none';
    document.getElementById('mini-options').innerHTML = '';

    if (miniMode === 'agente') loadAgentRound();
    else if (miniMode === 'habilidad') loadAbilityRound();
    else if (miniMode === 'arma') loadWeaponRound();
    else if (miniMode === 'mapa') loadMapRound();
    else if (miniMode === 'skin') loadSkinRound();
    else if (miniMode === 'trivia') loadTriviaRound();

    miniTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('mini-timer-display').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(miniTimer);
            miniStreak = 0;
            document.getElementById('mini-streak-display').textContent = miniStreak;
            showMiniResult(false, `Se acabó el tiempo. Era: ${miniAns}`);
        }
    }, 1000);
}

function loadAgentRound() {
    const ag = agents[Math.floor(Math.random() * agents.length)];
    miniAns = ag.displayName;
    document.getElementById('mini-clue').textContent = ag.description;
    document.getElementById('mini-input-zone').style.display = 'block';
    document.getElementById('mini-input').value = '';
}

function loadAbilityRound() {
    const ag = agents[Math.floor(Math.random() * agents.length)];
    const abs = ag.abilities.filter(ab => ab.displayIcon);
    if (abs.length === 0) return loadAbilityRound();
    const ab = abs[Math.floor(Math.random() * abs.length)];
    miniAns = ag.displayName;
    document.getElementById('mini-img').src = ab.displayIcon;
    document.getElementById('mini-img').style.display = 'block';
    document.getElementById('mini-clue').textContent = `Habilidad: ${ab.displayName}`;
    document.getElementById('mini-input-zone').style.display = 'block';
    document.getElementById('mini-input').value = '';
}

async function loadWeaponRound() {
    try {
        const res = await fetch('https://valorant-api.com/v1/weapons?language=es-ES');
        if (!res.ok) throw new Error('Error al cargar armas');
        const weapons = (await res.json()).data.filter(w => w.shopData);
        const wp = weapons[Math.floor(Math.random() * weapons.length)];
        miniAns = wp.displayName;
        const price = wp.shopData.cost;
        const mag = wp.weaponStats ? wp.weaponStats.magazineSize : '?';
        document.getElementById('mini-clue').innerHTML = `<strong>Precio:</strong> ${price} créditos<br><strong>Capacidad:</strong> ${mag} balas`;
        
        const opts = [wp];
        while (opts.length < 4) {
            const rand = weapons[Math.floor(Math.random() * weapons.length)];
            if (!opts.includes(rand)) opts.push(rand);
        }
        opts.sort(() => Math.random() - 0.5);
        
        const grid = document.getElementById('mini-options');
        grid.style.display = 'grid';
        opts.forEach(o => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = o.displayName;
            btn.onclick = () => checkMiniOption(o.displayName);
            grid.appendChild(btn);
        });
    } catch (e) {
        console.error(e);
        showMiniResult(false, 'Error al cargar el arma. Intenta de nuevo.');
    }
}

function loadMapRound() {
    const mp = maps[Math.floor(Math.random() * maps.length)];
    miniAns = mp.displayName;
    document.getElementById('mini-img').src = mp.displayIcon;
    document.getElementById('mini-img').style.display = 'block';
    document.getElementById('mini-clue').textContent = 'Identifica el mapa por su radar';
    
    const opts = [mp];
    while (opts.length < 4) {
        const rand = maps[Math.floor(Math.random() * maps.length)];
        if (!opts.includes(rand)) opts.push(rand);
    }
    opts.sort(() => Math.random() - 0.5);
    
    const grid = document.getElementById('mini-options');
    grid.style.display = 'grid';
    opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = o.displayName;
        btn.onclick = () => checkMiniOption(o.displayName);
        grid.appendChild(btn);
    });
}

function loadSkinRound() {
    const sk = skins[Math.floor(Math.random() * skins.length)];
    miniAns = sk.displayName;
    document.getElementById('mini-img').src = sk.displayIcon;
    document.getElementById('mini-img').style.display = 'block';
    document.getElementById('mini-clue').textContent = 'Adivina el nombre de la skin';
    
    // Crear datalist con sugerencias
    const inputZone = document.getElementById('mini-input-zone');
    inputZone.style.display = 'block';
    const input = document.getElementById('mini-input');
    input.value = '';
    input.setAttribute('list', 'skin-suggestions');
    
    // Eliminar datalist anterior si existe
    const oldDatalist = document.getElementById('skin-suggestions');
    if (oldDatalist) oldDatalist.remove();
    
    // Crear nuevo datalist
    const datalist = document.createElement('datalist');
    datalist.id = 'skin-suggestions';
    skins.forEach(s => {
        const option = document.createElement('option');
        option.value = s.displayName;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);
}

function loadTriviaRound() {
    const trivia = [
        { q: "¿Cuál es el nombre real de Jett?", a: "Sunwoo Han", alt: "Han Sunwoo" },
        { q: "¿De qué país es Viper?", a: "Estados Unidos", alt: "USA" },
        { q: "¿Cuántas habilidades básicas tiene cada agente?", a: "2", alt: "dos" },
        { q: "¿Cómo se llama la organización antagonista?", a: "Omega", alt: "" },
        { q: "¿Qué agente tiene la habilidad 'Ojo de Halcón'?", a: "Sova", alt: "" },
        { q: "¿Cuál es el nombre real de Phoenix?", a: "Jamie Adeyemi", alt: "" },
        { q: "¿Qué agente puede teletransportarse?", a: "Omen", alt: "Yoru" },
        { q: "¿De qué país es Breach?", a: "Suecia", alt: "" },
        { q: "¿Cuántos créditos cuesta el Vandal?", a: "2900", alt: "" },
        { q: "¿Qué agente usa un robot llamado Alarmbot?", a: "Killjoy", alt: "" }
    ];
    const t = trivia[Math.floor(Math.random() * trivia.length)];
    miniAns = t.a;
    miniAnsAlt = t.alt;
    document.getElementById('mini-clue').textContent = t.q;
    document.getElementById('mini-input-zone').style.display = 'block';
    document.getElementById('mini-input').value = '';
}

function checkMiniAnswer() {
    const userAns = document.getElementById('mini-input').value.trim();
    const normalizedUser = normalizeText(userAns);
    const normalizedAns = normalizeText(miniAns);
    const normalizedAlt = miniAnsAlt ? normalizeText(miniAnsAlt) : '';
    
    const correct = normalizedUser === normalizedAns || (normalizedAlt && normalizedUser === normalizedAlt);
    
    if (correct) {
        miniStreak++;
        document.getElementById('mini-streak-display').textContent = miniStreak;
        showMiniResult(true, miniStreak >= 3 ? `¡Correcto! 🔥 Racha: ${miniStreak}` : '¡Correcto!');
    } else {
        miniStreak = 0;
        document.getElementById('mini-streak-display').textContent = miniStreak;
        showMiniResult(false, `Incorrecto. Era: ${miniAns}`);
    }
}

function checkMiniOption(opt) {
    const correct = opt === miniAns;
    if (correct) {
        miniStreak++;
        document.getElementById('mini-streak-display').textContent = miniStreak;
        showMiniResult(true, miniStreak >= 3 ? `¡Correcto! 🔥 Racha: ${miniStreak}` : '¡Correcto!');
    } else {
        miniStreak = 0;
        document.getElementById('mini-streak-display').textContent = miniStreak;
        showMiniResult(false, `Incorrecto. Era: ${miniAns}`);
    }
}

function showMiniResult(won, text) {
    if (miniTimer) clearInterval(miniTimer);
    const msg = document.getElementById('mini-msg');
    msg.textContent = text;
    msg.className = won ? 'msg-win' : 'msg-lose';
    document.getElementById('btn-next').style.display = 'block';
    document.getElementById('mini-input-zone').style.display = 'none';
    document.getElementById('mini-options').style.display = 'none';
}

// --- WORDLE ---
const WORDLE_AGENTS = ["JETT", "RAZE", "BREACH", "OMEN", "BRIMSTONE", "PHOENIX", "SAGE", "SOVA", "VIPER", "CYPHER", "REYNA", "KILLJOY", "SKYE", "YORU", "ASTRA", "CHAMBER", "NEON", "FADE", "HARBOR", "GEKKO", "DEADLOCK", "TEJO", "VETO", "MIKS", "WAYLAY", "ISO", "VYSE", "CLOVE"];

function startWordle() {
    history.pushState({inGame: true}, '');
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('minigame-interface').style.display = 'none';
    document.getElementById('wordle-interface').style.display = 'block';
    document.getElementById('wordle-interface').classList.add('fade-in');
    wordleWord = WORDLE_AGENTS[Math.floor(Math.random() * WORDLE_AGENTS.length)].toUpperCase();
    wordleGuesses = [];
    wordleCurrent = '';
    wordleOver = false;
    document.getElementById('wordle-streak').textContent = wordleStreak;
    document.getElementById('wordle-msg').textContent = '';
    document.getElementById('wordle-hint').textContent = `Agente de ${wordleWord.length} letras`;
    document.getElementById('wordle-next-btn').style.display = 'none';
    buildWordleGrid();
    buildWordleKeyboard();
}

function buildWordleGrid() {
    const grid = document.getElementById('wordle-grid');
    grid.innerHTML = '';
    for (let r = 0; r < 5; r++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        row.id = `wrow-${r}`;
        for (let c = 0; c < wordleWord.length; c++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.id = `wcell-${r}-${c}`;
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function buildWordleKeyboard() {
    const kb = document.getElementById('wordle-keyboard');
    kb.innerHTML = '';
    const rows = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['ENTER','Z','X','C','V','B','N','M','⌫']
    ];
    rows.forEach(r => {
        const div = document.createElement('div');
        div.className = 'wordle-kb-row';
        r.forEach(k => {
            const btn = document.createElement('button');
            btn.className = 'wordle-key' + (k === 'ENTER' || k === '⌫' ? ' wide' : '');
            btn.textContent = k;
            btn.id = `wkey-${k}`;
            btn.onclick = () => handleWordleKey(k);
            div.appendChild(btn);
        });
        kb.appendChild(div);
    });
}

document.addEventListener('keydown', e => {
    if (document.getElementById('wordle-interface').style.display === 'none') return;
    if (wordleOver) return;
    if (e.key === 'Enter') handleWordleKey('ENTER');
    else if (e.key === 'Backspace') handleWordleKey('⌫');
    else if (/^[a-zA-Z]$/.test(e.key)) handleWordleKey(e.key.toUpperCase());
});

function handleWordleKey(k) {
    if (wordleOver) return;
    const row = wordleGuesses.length;
    if (k === '⌫') {
        if (wordleCurrent.length > 0) {
            wordleCurrent = wordleCurrent.slice(0, -1);
            document.getElementById(`wcell-${row}-${wordleCurrent.length}`).textContent = '';
        }
    } else if (k === 'ENTER') {
        if (wordleCurrent.length !== wordleWord.length) {
            shakeRow(row);
            return;
        }
        submitWordleGuess();
    } else {
        if (wordleCurrent.length < wordleWord.length) {
            document.getElementById(`wcell-${row}-${wordleCurrent.length}`).textContent = k;
            wordleCurrent += k;
        }
    }
}

function shakeRow(r) {
    const row = document.getElementById(`wrow-${r}`);
    row.style.animation = 'none';
    row.style.transform = 'translateX(-8px)';
    setTimeout(() => row.style.transform = 'translateX(8px)', 80);
    setTimeout(() => row.style.transform = 'translateX(-5px)', 160);
    setTimeout(() => row.style.transform = '', 240);
}

function submitWordleGuess() {
    const row = wordleGuesses.length;
    const guess = wordleCurrent;
    wordleGuesses.push(guess);

    const result = Array(wordleWord.length).fill('absent');
    const used = Array(wordleWord.length).fill(false);
    const guessUsed = Array(guess.length).fill(false);

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === wordleWord[i]) {
            result[i] = 'correct';
            used[i] = true;
            guessUsed[i] = true;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        if (guessUsed[i]) continue;
        for (let j = 0; j < wordleWord.length; j++) {
            if (!used[j] && guess[i] === wordleWord[j]) {
                result[i] = 'present';
                used[j] = true;
                break;
            }
        }
    }

    for (let i = 0; i < guess.length; i++) {
        const cell = document.getElementById(`wcell-${row}-${i}`);
        setTimeout(() => cell.classList.add(result[i]), i * 120);
    }

    setTimeout(() => {
        for (let i = 0; i < guess.length; i++) {
            const keyEl = document.getElementById(`wkey-${guess[i]}`);
            if (!keyEl) continue;
            const cur = keyEl.className;
            if (result[i] === 'correct') keyEl.className = 'wordle-key' + (keyEl.classList.contains('wide') ? ' wide' : '') + ' correct';
            else if (result[i] === 'present' && !cur.includes('correct')) keyEl.className = 'wordle-key' + (keyEl.classList.contains('wide') ? ' wide' : '') + ' present';
            else if (result[i] === 'absent' && !cur.includes('correct') && !cur.includes('present')) keyEl.className = 'wordle-key' + (keyEl.classList.contains('wide') ? ' wide' : '') + ' absent';
        }
    }, guess.length * 120 + 100);

    wordleCurrent = '';

    const won = result.every(r => r === 'correct');
    if (won) {
        wordleStreak++;
        document.getElementById('wordle-streak').textContent = wordleStreak;
        setTimeout(() => {
            document.getElementById('wordle-msg').textContent = wordleStreak >= 4 ? `¡GANASTE! 🔥 Racha: ${wordleStreak}` : '¡GANASTE!';
            document.getElementById('wordle-msg').style.color = '#4caf50';
            document.getElementById('wordle-next-btn').style.display = 'inline-block';
        }, guess.length * 120 + 200);
        wordleOver = true;
    } else if (wordleGuesses.length >= 5) {
        wordleStreak = 0;
        document.getElementById('wordle-streak').textContent = wordleStreak;
        setTimeout(() => {
            document.getElementById('wordle-msg').textContent = `PERDISTE. Era: ${wordleWord}`;
            document.getElementById('wordle-msg').style.color = '#ff4655';
            document.getElementById('wordle-next-btn').style.display = 'inline-block';
        }, guess.length * 120 + 200);
        wordleOver = true;
    }
}

// Iniciar aplicación
init();