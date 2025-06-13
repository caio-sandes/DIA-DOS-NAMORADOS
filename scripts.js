// ===================================================================================
//
//                                  NOSSO SITE - SCRIPTS
//
// ===================================================================================


// ===================================================================================
// SEÇÃO 1: TEMPORIZADOR DE RELACIONAMENTO
// ===================================================================================
function updateTimer() {
    const startDate = new Date(2023, 2, 29, 3, 0, 0);
    const now = new Date();
    let diff = now - startDate;

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

    const yearsEl = document.getElementById('years');
    const monthsEl = document.getElementById('months');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (yearsEl) yearsEl.textContent = years;
    if (monthsEl) monthsEl.textContent = months;
    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
    
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
// ===================================================================================
function setupVideoSlider() {
    const catalogContainer = document.querySelector('.video-catalog-container');
    const videos = catalogContainer ? Array.from(catalogContainer.querySelectorAll('.catalog-video')) : [];
    const prevButton = document.getElementById('prev-video-btn');
    const nextButton = document.getElementById('next-video-btn');
    const progressBarsContainer = document.querySelector('.story-progress-bars');

    if (!catalogContainer || videos.length === 0) {
        const catalogSection = document.getElementById('video-catalog');
        if (catalogSection) catalogSection.style.display = 'none';
        return;
    }

    let currentVisibleVideoIndex = 0;

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

    function updateCurrentProgressBar() {
        if (videos.length === 0) return;
        const currentVideo = videos[currentVisibleVideoIndex];
        const { duration, currentTime } = currentVideo;
        const progressPercent = (currentTime / duration) * 100;
        
        const fills = document.querySelectorAll('.story-progress-bars .progress-fill');
        if (fills[currentVisibleVideoIndex]) {
            fills[currentVisibleVideoIndex].style.width = `${progressPercent}%`;
        }
    }
    
    function manageProgressBarStates(index) {
        const fills = document.querySelectorAll('.story-progress-bars .progress-fill');
        fills.forEach((fill, idx) => {
            if (idx < index) {
                fill.style.width = '100%';
            } else {
                fill.style.width = '0%';
            }
        });
    }

    function playVideoAtIndex(index) {
        videos.forEach((video, idx) => {
            if (idx === index) {
                video.currentTime = 0;
                video.play().catch(e => console.log("Autoplay do vídeo bloqueado."));
            } else {
                video.pause();
            }
        });
    }

    function slideToVideo(index) {
        if (index < 0 || index >= videos.length) return; 
        
        const targetVideo = videos[index];
        currentVisibleVideoIndex = index;

        catalogContainer.scrollTo({ left: targetVideo.offsetLeft, behavior: 'smooth' });
        
        manageProgressBarStates(index);
        playVideoAtIndex(index);
    }

    function slideToNext() {
        let newIndex = currentVisibleVideoIndex + 1;
        if (newIndex >= videos.length) {
            newIndex = 0; 
        }
        slideToVideo(newIndex);
    }

    function slideToPrev() {
        let newIndex = currentVisibleVideoIndex - 1;
        if (newIndex < 0) {
            newIndex = videos.length - 1;
        }
        slideToVideo(newIndex);
    }
    
    if (prevButton) prevButton.addEventListener('click', slideToPrev);
    if (nextButton) nextButton.addEventListener('click', slideToNext);
    
    videos.forEach(video => {
        video.addEventListener('ended', slideToNext);
        video.addEventListener('timeupdate', updateCurrentProgressBar);
    });

    createProgressBars();
    if (videos.length > 0) {
        slideToVideo(0);
    }
}


// ===================================================================================
// SEÇÃO 3: PLAYER DE MÚSICAS
// ===================================================================================
function setupMusicPlayer() {
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

    if(!audio || typeof musicPlaylist === 'undefined' || musicPlaylist.length === 0) {
        if (playerSection) playerSection.style.display = 'none';
        return;
    }

    let trackIndex = 0;
    let isPlaying = false;

    const playIconSVG = `<svg role="img" height="24" width="24" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>`;
    const pauseIconSVG = `<svg role="img" height="24" width="24" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.86 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>`;

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

    // ✨ FUNÇÃO PLAYTRACK ATUALIZADA E ROBUSTA ✨
    function playTrack() {
        if (!musicPlaylist.length) return; // Não faz nada se a playlist estiver vazia
        
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // A música está tocando!
                isPlaying = true;
                playBtn.innerHTML = playIconSVG; // Mostra o ícone de PAUSE
            }).catch(error => {
                // O navegador bloqueou o autoplay
                console.log("Autoplay da música seguinte bloqueado pelo navegador.", error);
                isPlaying = false;
                playBtn.innerHTML = pauseIconSVG; // Mostra o ícone de PLAY, indicando que precisa de um clique
            });
        }
    }

    function pauseTrack() {
        isPlaying = false;
        playBtn.innerHTML = pauseIconSVG;
        audio.pause();
    }

    function nextTrack() {
        trackIndex = (trackIndex + 1) % musicPlaylist.length;
        loadTrack(trackIndex);
        // Agora, em vez de verificar 'isPlaying', tentamos tocar e a função playTrack decide o que fazer.
        playTrack(); 
    }

    function prevTrack() {
        trackIndex = (trackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
        loadTrack(trackIndex);
        playTrack();
    }
    
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

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if(duration) audio.currentTime = (clickX / width) * duration;
    }
    
    playBtn.addEventListener('click', () => isPlaying ? pauseTrack() : playTrack());
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextTrack);
    if(progressBarWrapper) progressBarWrapper.addEventListener('click', setProgress);
    
    // Apenas carrega a primeira música. O play será acionado pela tela de entrada.
    loadTrack(0);
}


// ===================================================================================
// SEÇÃO 4: TELA DE ENTRADA (SPLASH SCREEN)
// ===================================================================================
function setupSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const enterBtn = document.getElementById('enter-site-btn');
    const audio = document.getElementById('player-audio-source');
    const playBtn = document.getElementById('player-play-btn');
    const playIconSVG = `<svg role="img" height="24" width="24" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>`;

    if (!splashScreen || !enterBtn || !audio) {
        if(splashScreen) splashScreen.style.display = 'none';
        return;
    }

    enterBtn.addEventListener('click', () => {
        // Tenta tocar a música, o que deve funcionar por ter sido iniciado por um clique
        audio.play().then(() => {
            // Se funcionar, atualiza o ícone do player principal para "pause"
            if (playBtn) {
                playBtn.innerHTML = playIconSVG;
                // Acessamos o 'isPlaying' de dentro da outra função para atualizá-lo.
                // Esta não é a melhor prática, mas para este caso funciona.
                // Uma solução mais avançada usaria "state management" ou eventos customizados.
                // Forçamos o estado para true, já que o play funcionou.
                const musicPlayerScope = getMusicPlayerScope();
                if (musicPlayerScope) musicPlayerScope.setIsPlaying(true);
            }
        }).catch(error => {
            console.log("Autoplay falhou mesmo após o clique inicial.", error);
        });
        
        splashScreen.classList.add('fade-out');
        splashScreen.addEventListener('transitionend', () => {
            splashScreen.remove();
        });
    });

    // Esta é uma forma de expor a função de "setter" para o estado 'isPlaying'
    // para que a splash screen possa atualizá-la.
    function getMusicPlayerScope() {
        const musicPlayer = document.getElementById('music-player');
        if (musicPlayer && musicPlayer._api) {
            return musicPlayer._api;
        }
        return null;
    }
}


// ===================================================================================
// SEÇÃO 5: INICIALIZAÇÃO GERAL
// ===================================================================================
function initializeAllScripts() {
    setupSplashScreen();
    updateTimer(); 
    setInterval(updateTimer, 1000); 
    setupVideoSlider();
    setupMusicPlayer(); 
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllScripts);
} else {
    initializeAllScripts(); 
}