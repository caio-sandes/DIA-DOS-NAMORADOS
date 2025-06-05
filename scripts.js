// --- Início: Função do Temporizador de Relacionamento ---
function updateTimer() {
    const startDate = new Date(2023, 2, 29, 3, 0, 0); // Data: 29 de Março de 2023, 03:00
    const now = new Date();
    let diff = now - startDate;

    // Calcula anos, meses, dias, horas, minutos, segundos
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

    // Pega os elementos do HTML para atualizar
    const yearsEl = document.getElementById('years');
    const monthsEl = document.getElementById('months');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Atualiza o texto dos elementos
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
// --- Fim: Função do Temporizador de Relacionamento ---


// --- Início: Slider Automático de Vídeos com Botões ---
function setupVideoSlider() {
    const catalogContainer = document.querySelector('.video-catalog-container');
    const videos = catalogContainer ? Array.from(catalogContainer.querySelectorAll('.catalog-video')) : [];
    const prevButton = document.getElementById('prev-video-btn');
    const nextButton = document.getElementById('next-video-btn');

    if (!catalogContainer) {
        // console.warn('Contêiner do catálogo de vídeos (.video-catalog-container) não encontrado.');
        if(prevButton) prevButton.style.display = 'none'; 
        if(nextButton) nextButton.style.display = 'none';
        return;
    }
    if (videos.length === 0) {
        // console.warn('Nenhum vídeo (.catalog-video) encontrado no catálogo.');
        if(prevButton) prevButton.style.display = 'none'; 
        if(nextButton) nextButton.style.display = 'none';
        return;
    }

    const slideIntervalTime = 15000; 
    let currentVisibleVideoIndex = 0;  
    let autoSlideTimer = null;
    
    let isManuallySliding = false;
    const manualSlideCooldown = 1000; // Cooldown para cliques manuais (1 segundo)

    // ✨ FUNÇÃO ATUALIZADA COM LOGS PARA DIAGNÓSTICO ✨
    function slideToVideo(index) {
        if (index < 0 || index >= videos.length) {
            console.warn('Índice do vídeo inválido para o slide:', index);
            return; 
        }
        
        const targetVideo = videos[index];
        const containerWidth = catalogContainer.clientWidth;
        const videoWidth = targetVideo.offsetWidth;

        // --- Início: Logs para Diagnóstico ---
        console.log(`--- Slide para Vídeo ${index} ---`);
        console.log(`Container: clientWidth = ${containerWidth}, scrollWidth = ${catalogContainer.scrollWidth}`);
        console.log(`Vídeo Alvo (${targetVideo.src.substring(targetVideo.src.lastIndexOf('/')+1)}): offsetWidth = ${videoWidth}, offsetLeft = ${targetVideo.offsetLeft}`);
        // --- Fim: Logs para Diagnóstico ---

        let targetScrollLeft = targetVideo.offsetLeft;

        // Garantias de limites para targetScrollLeft
        const maxScrollLeft = catalogContainer.scrollWidth - containerWidth;
        targetScrollLeft = Math.max(0, targetScrollLeft); 
        targetScrollLeft = Math.min(targetScrollLeft, maxScrollLeft); 

        // --- Log do Cálculo Final ---
        console.log(`Calculado: targetScrollLeft = ${targetScrollLeft}, maxScrollLeft = ${maxScrollLeft}`);
        // --- Fim: Log do Cálculo Final ---

        catalogContainer.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
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
        if (isManuallySliding) {
            return; 
        }
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

    catalogContainer.addEventListener('mouseenter', () => { 
        if (autoSlideTimer) clearInterval(autoSlideTimer); 
    });
    catalogContainer.addEventListener('mouseleave', () => {
        if (!isManuallySliding) {
            startAutoSliding();
        }
    });

    if (videos.length > 0) {
        // Ao carregar, posiciona o primeiro vídeo (índice 0)
        slideToVideo(0); 
        currentVisibleVideoIndex = 0; // Garante que o índice inicial seja 0
    }
    // O primeiro auto-slide ocorrerá após slideIntervalTime
    // Se não houver vídeos, startAutoSliding() não será chamado efetivamente pois autoSlideNext->slideToVideo não farão nada.
    if (videos.length > 0) { // Só inicia o timer se houver vídeos
        startAutoSliding(); 
    }
}
// --- Fim: Slider Automático de Vídeos com Botões ---


// --- Início: Inicialização dos Scripts após o carregamento do DOM ---
function initializeAllScripts() {
    updateTimer(); 
    setInterval(updateTimer, 1000); 
    setupVideoSlider(); 
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllScripts);
} else {
    initializeAllScripts(); 
}
// --- Fim: Inicialização dos Scripts ---