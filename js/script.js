/* ====================================================
   Distrito Guaraní — Lógica de navegación
   Controla: navegación con botones, teclado y swipe
   Dots: carril horizontal deslizante con ventana fija
==================================================== */

const slides  = document.querySelectorAll('.slide');
const dotsEl  = document.getElementById('dots');
const counter = document.getElementById('counter');
const progress = document.getElementById('progress');
let cur = 0;
const total = slides.length;

// ── Parámetros del carril ─────────────────────────────
const DOT_SIZE = 6;
const DOT_GAP  = 8;
const STEP     = DOT_SIZE + DOT_GAP;  // 14px por dot
const WIN_W    = 110;  // debe coincidir con #dots { width } en CSS

// ── Crear el carril interior ──────────────────────────
const track = document.createElement('div');
track.className = 'dots-track';
dotsEl.appendChild(track);

for (let i = 0; i < total; i++) {
  const d = document.createElement('div');
  d.className = 'nav-dot' + (i === 0 ? ' active' : '');
  d.addEventListener('click', (function(idx){ return function(){ go(idx); }; })(i));
  track.appendChild(d);
}

// ── Actualizar carril ─────────────────────────────────
function updateTrack() {
  track.querySelectorAll('.nav-dot').forEach(function(d, i) {
    d.classList.toggle('active', i === cur);
  });

  // Centrar el dot activo dentro de la ventana
  const centerInWindow = (WIN_W / 2) - (DOT_SIZE / 2);
  const rawOffset      = centerInWindow - cur * STEP;

  // Clampear para que el carril no pase sus extremos
  const totalTrackW   = total * STEP - DOT_GAP;
  const minOffset     = WIN_W - totalTrackW - DOT_SIZE;
  const offset        = Math.min(0, Math.max(minOffset, rawOffset));

  track.style.transform = 'translateY(-50%) translateX(' + offset + 'px)';
}

// ── Navegar ───────────────────────────────────────────
function go(n) {
  slides[cur].classList.remove('active');
  slides[cur].classList.add('prev');
  const prev = cur;
  setTimeout(function() { slides[prev].classList.remove('prev'); }, 500);

  cur = ((n % total) + total) % total;
  slides[cur].classList.add('active');
  counter.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  progress.style.width = ((cur + 1) / total * 100) + '%';
  updateTrack();
}

// ── Init ──────────────────────────────────────────────
updateTrack();
progress.style.width = (1 / total * 100) + '%';

// ── Eventos ───────────────────────────────────────────
document.getElementById('nextBtn').onclick = function() { go(cur + 1); };
document.getElementById('prevBtn').onclick = function() { go(cur - 1); };

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(cur + 1); }
  if (e.key === 'ArrowLeft') go(cur - 1);
});

let tx0 = null;
document.addEventListener('touchstart', function(e) { tx0 = e.touches[0].clientX; });
document.addEventListener('touchend',   function(e) {
  if (tx0 === null) return;
  const dx = e.changedTouches[0].clientX - tx0;
  if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
  tx0 = null;
});

// ====================================================
// Lightbox / Modal de Imágenes
// ====================================================

// 1. Creamos el contenedor del Modal dinámicamente
const lightbox = document.createElement('div');
lightbox.className = 'lightbox-modal';
lightbox.innerHTML = `
  <span class="lightbox-close">&times;</span>
  <img class="lightbox-content" id="lightbox-img">
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('#lightbox-img');
const closeBtn = lightbox.querySelector('.lightbox-close');

// 2. Seleccionamos todas las imágenes de las slides (ignoramos la cover)
const slideImages = document.querySelectorAll('.slide:not(.slide-cover) img');

// 3. Le asignamos el evento de click a cada imagen
slideImages.forEach(img => {
  // Cambiamos el cursor para indicar que es clickeable
  img.style.cursor = 'pointer';
  
  img.addEventListener('click', () => {
    lightboxImg.src = img.src; // Copiamos la ruta de la imagen clickeada
    lightbox.classList.add('show');
  });
});

// 4. Lógica para cerrar el Modal
const closeLightbox = () => {
  lightbox.classList.remove('show');
  // Esperamos que termine la transición de opacidad para vaciar el src
  setTimeout(() => { lightboxImg.src = ''; }, 300);
};

// Cerrar con el botón "X"
closeBtn.addEventListener('click', closeLightbox);

// Cerrar haciendo click en cualquier parte del fondo oscuro
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

// Cerrar apretando la tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('show')) {
    closeLightbox();
  }
});