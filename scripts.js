// ===================================================================================
//
//                                  NOSSO SITE - SCRIPTS
//
// ===================================================================================


// ===================================================================================
// SEÇÃO 1: TEMPORIZADOR DE RELACIONAMENTO
// Objetivo: Calcula e exibe o tempo de relacionamento em tempo real.
// ===================================================================================
function updateTimer() {
    // Defina aqui a data e hora exatas do início do relacionamento
    const startDate = new Date(2023, 2, 29, 3, 0, 0); // Ano, Mês-1, Dia, Hora, Minuto, Segundo
    const now = new Date();
    let diff = now - startDate;

    // Converte a diferença de milissegundos para anos, meses, dias, etc.
    let years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    diff -= years * (1000 * 60 * 60 * 24 * 365.25);
    let months = Math.floor(diff / (1000 * 60 * 60 * 24 * (365.25 / 12)));
    diff -= months * (1000 * 60 * 60 * 24 * (365.25 / 12));
    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    let hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    let minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    let seconds = Math.floor(diff / 1000);

    // Seleciona os elementos no HTML para exibir os valores
    const yearsEl = document.getElementById('years');
    const monthsEl = document.getElementById('months');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Atualiza o conteúdo de cada elemento
    if (yearsEl) yearsEl.textContent = years;
    if (monthsEl) monthsEl.textContent = months;
    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
    
    // Atualiza o ano no rodapé
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        const yearNow = new Date().getFullYear().toString();
        if (currentYearEl.textContent !== yearNow) {
            currentYearEl.textContent = yearNow;
        }
    }
}


// ===================================================================================
// SEÇÃO 2: SLIDER DE VÍDEOS (ESTILO "STORIES")
// Objetivo: Controlar o carrossel de vídeos com autoplay, avanço automático e
//           barras de progresso no topo.
// ===================================================================================
function setupVideoSlider() {
    // Seleção de elementos do DOM
    const catalogContainer = document.querySelector('.video-catalog-container');
    const videos = catalogContainer ? Array.from(catalogContainer.querySelectorAll('.catalog-video')) : [];
    const prevButton = document.getElementById('prev-video-btn');
    const nextButton = document.getElementById('next-video-btn');
    const progressBarsContainer = document.querySelector('.story-progress-bars');

    // Se não houver vídeos, esconde toda a seção
    if (!catalogContainer || videos.length === 0) {
        const catalogSection = document.getElementById('video-catalog');
        if (catalogSection) catalogSection.style.display = 'none';
        return;
    }

    // Variável para controlar qual vídeo está ativo
    let currentVisibleVideoIndex = 0;

    // Cria as barrinhas de progresso no topo da tela
    function createProgressBars() {
        if (!progressBarsContainer) return;
        progressBarsContainer.innerHTML = '';
        videos.forEach(() => {
            const segment = document.createElement('div');
            segment.classList.add('progress-segment');
            const fill = document.createElement('div');
            fill.classList.add('progress-fill');
            segment.appendChild(fill);
            progressBarsContainer.appendChild(segment);
        });
    }

    // Atualiza o preenchimento da barra de progresso do vídeo atual
    function updateCurrentProgressBar() {
        const currentVideo = videos[currentVisibleVideoIndex];
        const { duration, currentTime } = currentVideo;
        const progressPercent = (currentTime / duration) * 100;
        
        const fills = document.querySelectorAll('.story-progress-bars .progress-fill');
        if (fills[currentVisibleVideoIndex]) {
            fills[currentVisibleVideoIndex].style.width = `${progressPercent}%`;
        }
    }
    
    // Gerencia o estado visual de todas as barras (quais estão cheias, vazias, etc.)
    function manageProgressBarStates(index) {
        const fills = document.querySelectorAll('.story-progress-bars .progress-fill');
        fills.forEach((fill, idx) => {
            if (idx < index) {
                fill.style.width = '100%'; // Vídeos que já passaram ficam com a barra cheia
            } else {
                fill.style.width = '0%'; // Vídeo atual e futuros ficam com a barra vazia
            }
        });
    }

    // Toca o vídeo do índice fornecido e pausa todos os outros
    function playVideoAtIndex(index) {
        videos.forEach((video, idx) => {
            if (idx === index) {
                video.currentTime = 0; // Sempre começa o vídeo do início
                video.play().catch(e => console.log("Autoplay do vídeo bloqueado."));
            } else {
                video.pause();
            }
        });
    }

    // Função principal que rola para o vídeo alvo e o executa
    function slideToVideo(index) {
        if (index < 0 || index >= videos.length) return; 
        
        const targetVideo = videos[index];
        currentVisibleVideoIndex = index;

        // Rola o contêiner horizontalmente até a posição do vídeo
        catalogContainer.scrollTo({ left: targetVideo.offsetLeft, behavior: 'smooth' });
        
        // Atualiza o estado visual das barras e toca o vídeo
        manageProgressBarStates(index);
        playVideoAtIndex(index);
    }

    // Funções para os botões e para o fim de um vídeo
    function slideToNext() {
        let newIndex = currentVisibleVideoIndex + 1;
        if (newIndex >= videos.length) {
            newIndex = 0; // Volta para o primeiro se chegar ao fim
        }
        slideToVideo(newIndex);
    }

    function slideToPrev() {
        let newIndex = currentVisibleVideoIndex - 1;
        if (newIndex < 0) {
            newIndex = videos.length - 1; // Vai para o último se estiver no primeiro
        }
        slideToVideo(newIndex);
    }
    
    // --- Configuração dos Eventos ---
    if (prevButton) prevButton.addEventListener('click', slideToPrev);
    if (nextButton) nextButton.addEventListener('click', slideToNext);
    
    videos.forEach(video => {
        // Quando um vídeo acaba, avança para o próximo
        video.addEventListener('ended', slideToNext);
        // Enquanto o vídeo toca, atualiza sua barra de progresso
        video.addEventListener('timeupdate', updateCurrentProgressBar);
    });

    // --- Estado Inicial ---
    createProgressBars(); // Cria as barras
    if (videos.length > 0) {
        slideToVideo(0); // Mostra e toca o primeiro vídeo
    }
}


// ===================================================================================
// SEÇÃO 3: PLAYER DE MÚSICAS
// Objetivo: Controlar o player de música, lendo a playlist do arquivo 
//           `playlist-data.js` e tentando tocar no carregamento da página.
// ===================================================================================
function setupMusicPlayer() {
    // Seleção de elementos do DOM
    const audio = document.getElementById('player-audio-source');
    const playBtn = document.getElementById('player-play-btn');
    const prevBtn = document.getElementById('player-prev-btn');
    const nextBtn = document.getElementById('player-next-btn');
    const trackArt = document.getElementById('player-track-art');
    const trackTitle = document.getElementById('player-track-title');
    const trackArtist = document.getElementById('player-track-artist');
    const progressBarWrapper = document.querySelector('.progress-bar-wrapper');
    const progressBar = document.getElementById('player-progress-bar');
    const currentTimeEl = document.getElementById('player-current-time');
    const totalDurationEl = document.getElementById('player-total-duration');
    const playerSection = document.getElementById('music-player');

    // Se o player ou a playlist não existirem, esconde o player e para a execução
    if(!audio || typeof musicPlaylist === 'undefined' || musicPlaylist.length === 0) {
        if (playerSection) playerSection.style.display = 'none';
        return;
    }

    // Variáveis de estado do player
    let trackIndex = 0;
    let isPlaying = false;
    let userHasInteracted = false; // Controla o "primeiro clique" do usuário

    // Ícones SVG para os botões
    const playIconSVG = `<svg role="img" height="24" width="24" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>`; // Pause
    const pauseIconSVG = `<svg role="img" height="24" width="24" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.86 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>`; // Play

    // Função para tocar a música
    function playTrack() {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                playBtn.innerHTML = playIconSVG;
            }).catch(() => {
                isPlaying = false;
                playBtn.innerHTML = pauseIconSVG;
            });
        }
    }
    
    // Função a ser chamada na primeira interação do usuário com a página
    function firstInteractionHandler() {
        if (!userHasInteracted) {
            userHasInteracted = true;
            // Tenta tocar a música. Como foi disparado por um clique, o navegador deve permitir.
            playTrack();
            // Remove o "escutador" para não ser disparado novamente.
            document.body.removeEventListener('click', firstInteractionHandler);
            document.body.removeEventListener('keydown', firstInteractionHandler);
        }
    }

    // Carrega os dados de uma faixa no player
    function loadTrack(index) {
        trackIndex = index;
        const track = musicPlaylist[trackIndex];
        const artSrc = track.artSrc || "caminho/para/arte-padrao.jpg";
        
        trackArt.src = artSrc;
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        audio.src = track.audioSrc;
        
        if (playerSection) {
            playerSection.style.backgroundImage = `url('${artSrc}')`;
        }
    }

    // Pausa a música
    function pauseTrack() {
        isPlaying = false;
        playBtn.innerHTML = pauseIconSVG;
        audio.pause();
    }

    // Vai para a próxima música
    function nextTrack() {
        trackIndex = (trackIndex + 1) % musicPlaylist.length;
        loadTrack(trackIndex);
        if(isPlaying) playTrack();
    }

    // Vai para a música anterior
    function prevTrack() {
        trackIndex = (trackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
        loadTrack(trackIndex);
        if(isPlaying) playTrack();
    }

    // Atualiza a barra de progresso visualmente
    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            if(progressBar) progressBar.style.width = `${progressPercent}%`;
        }
        function formatTime(time) {
            const minutes = Math.floor(time / 60);
            let seconds = Math.floor(time % 60);
            if (seconds < 10) seconds = `0${seconds}`;
            return isNaN(minutes) || !isFinite(time) ? "0:00" : `${minutes}:${seconds}`;
        }
        if (duration) totalDurationEl.textContent = formatTime(duration);
        currentTimeEl.textContent = formatTime(currentTime);
    }

    // Permite clicar na barra de progresso para avançar/retroceder
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if(duration) audio.currentTime = (clickX / width) * duration;
    }
    
    // --- Configuração dos Eventos do Player de Música ---
    playBtn.addEventListener('click', () => {
        // Qualquer clique no botão de play/pause conta como a primeira interação
        if (!userHasInteracted) {
             firstInteractionHandler();
        } else {
            isPlaying ? pauseTrack() : playTrack();
        }
    });

    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextTrack); // Avança quando a música acaba
    if(progressBarWrapper) progressBarWrapper.addEventListener('click', setProgress);
    
    // --- Estado Inicial ---
    loadTrack(0); // Carrega a primeira música sem tentar tocar
    // Configura o "escutador" para o primeiro clique em qualquer lugar da página
    document.body.addEventListener('click', firstInteractionHandler);
    document.body.addEventListener('keydown', firstInteractionHandler);
}


// ===================================================================================
// SEÇÃO 4: INICIALIZAÇÃO GERAL
// Objetivo: Chamar todas as funções de configuração depois que a página carregar.
// ===================================================================================
function initializeAllScripts() {
    // Inicia o Timer
    updateTimer(); 
    setInterval(updateTimer, 1000); 
    
    // Inicia o Slider de Vídeos
    setupVideoSlider();
    
    // Inicia o Player de Músicas
    setupMusicPlayer(); 
}

// Garante que os scripts rodem apenas após o carregamento completo do DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllScripts);
} else {
    initializeAllScripts(); 
}