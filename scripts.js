// --- Início: Função do Temporizador de Relacionamento ---
function updateTimer() {
    const startDate = new Date(2023, 2, 29, 3, 0, 0); // Data: 29 de Março de 2023, 03:00
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
// --- Fim: Função do Temporizador de Relacionamento ---


// --- Início: Slider Automático de Vídeos com Botões ---
function setupVideoSlider() {
    const catalogContainer = document.querySelector('.video-catalog-container');
    const videos = catalogContainer ? Array.from(catalogContainer.querySelectorAll('.catalog-video')) : [];
    const prevButton = document.getElementById('prev-video-btn');
    const nextButton = document.getElementById('next-video-btn');

    if (!catalogContainer || videos.length === 0) {
        if(prevButton) prevButton.style.display = 'none'; 
        if(nextButton) nextButton.style.display = 'none';
        return;
    }

    const slideIntervalTime = 15000; 
    let currentVisibleVideoIndex = 0;  
    let autoSlideTimer = null;
    let isManuallySliding = false;
    const manualSlideCooldown = 1000;

    function slideToVideo(index) {
        if (index < 0 || index >= videos.length) return; 
        const targetVideo = videos[index];
        catalogContainer.scrollTo({ left: targetVideo.offsetLeft, behavior: 'smooth' });
        currentVisibleVideoIndex = index;
    }

    function autoSlideNext() {
        let nextIndex = currentVisibleVideoIndex + 1;
        if (nextIndex >= videos.length) nextIndex = 0;
        slideToVideo(nextIndex);
    }

    function startAutoSliding() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(autoSlideNext, slideIntervalTime);
    }

    function handleManualSlide(direction) {
        if (isManuallySliding) return;
        isManuallySliding = true; 
        if (autoSlideTimer) clearInterval(autoSlideTimer); 
        
        let newIndex = currentVisibleVideoIndex;
        if (direction === 'next') {
            newIndex++;
            if (newIndex >= videos.length) newIndex = 0;
        } else if (direction === 'prev') {
            newIndex--;
            if (newIndex < 0) newIndex = videos.length - 1;
        }
        slideToVideo(newIndex); 
        startAutoSliding(); 

        setTimeout(() => {
            isManuallySliding = false;
        }, manualSlideCooldown);
    }

    if (prevButton) prevButton.addEventListener('click', () => handleManualSlide('prev'));
    if (nextButton) nextButton.addEventListener('click', () => handleManualSlide('next'));

    catalogContainer.addEventListener('mouseenter', () => { if (autoSlideTimer) clearInterval(autoSlideTimer); });
    catalogContainer.addEventListener('mouseleave', () => { if (!isManuallySliding) startAutoSliding(); });

    if (videos.length > 0) {
        slideToVideo(0); 
        currentVisibleVideoIndex = 0;
        startAutoSliding(); 
    }
}
// --- Fim: Slider Automático de Vídeos com Botões ---


// --- Início: Lógica do Player de Músicas ---
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
    const playerSection = document.getElementById('music-player'); // Seleciona a seção do player

    if(!audio || typeof musicPlaylist === 'undefined' || musicPlaylist.length === 0) {
        if (playerSection) playerSection.style.display = 'none';
        return;
    }

    let trackIndex = 0;
    let isPlaying = false;

    const playIconSVG = `<svg role="img" height="24" width="24" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>`; // Pause
    const pauseIconSVG = `<svg role="img" height="24" width="24" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.86 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>`; // Play

    function loadTrack(index) {
        trackIndex = index;
        const track = musicPlaylist[trackIndex];
        const artSrc = track.artSrc || "caminho/para/arte-padrao.jpg";

        trackArt.src = artSrc;
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        audio.src = track.audioSrc;
        
        // ✨ ATUALIZAÇÃO: Aplica a capa como imagem de fundo do player ✨
        if (playerSection) {
            playerSection.style.backgroundImage = `url('${artSrc}')`;
        }
    }

    function playTrack() {
        isPlaying = true;
        playBtn.innerHTML = playIconSVG;
        audio.play();
    }

    function pauseTrack() {
        isPlaying = false;
        playBtn.innerHTML = pauseIconSVG;
        audio.pause();
    }

    function nextTrack() {
        trackIndex = (trackIndex + 1) % musicPlaylist.length;
        loadTrack(trackIndex);
        if(isPlaying) playTrack();
    }

    function prevTrack() {
        trackIndex = (trackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
        loadTrack(trackIndex);
        if(isPlaying) playTrack();
    }

    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        if(progressBar) progressBar.style.width = `${progressPercent}%`;
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
    
    loadTrack(0);
}
// --- Fim: Lógica do Player de Músicas ---


// --- Início: Inicialização dos Scripts após o carregamento do DOM ---
function initializeAllScripts() {
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
// --- Fim: Inicialização dos Scripts ---