(function () {
  'use strict';

  const STORAGE_KEY = 'deepti-portfolio-theme';
  const TITLES = [
    'AI & ML Engineer',
    'Full-Stack Developer'
  ];

  /* ---- Theme Management ---- */
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#0F172A' : '#FAFAFA'
    );
  }

  function initTheme() {
    const saved = getSavedTheme();
    const theme = saved || getSystemTheme();
    applyTheme(theme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!getSavedTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch { /* private browsing */ }
  }

  /* ---- Typing Animation ---- */
  function initTyping() {
    const el = document.getElementById('typingText');
    if (!el) return;

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const current = TITLES[titleIndex];

      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === current.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % TITLES.length;
        delay = 400;
      }

      setTimeout(type, delay);
    }

    type();
  }

  /* ---- Scroll Animations ---- */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ---- Skill Bars ---- */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const width = entry.target.getAttribute('data-width');
            entry.target.style.width = width + '%';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    bars.forEach((bar) => observer.observe(bar));
  }

  /* ---- Navigation ---- */
  function initNavigation() {
    const header = document.getElementById('header');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    navToggle?.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '-40% 0px -40% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---- Contact Form ---- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !subject || !message) {
        status.className = 'form-status error';
        status.textContent = 'Please fill in all fields.';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.className = 'form-status error';
        status.textContent = 'Please enter a valid email address.';
        return;
      }

      const mailtoLink = `mailto:deeptimetri6@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      )}`;

      window.location.href = mailtoLink;

      status.className = 'form-status success';
      status.textContent = 'Opening your email client...';
      form.reset();
    });
  }

  /* ---- Footer Year ---- */
  function initFooter() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---- Certificates Lightbox ---- */
  let currentZoom = 1.0;
  let isDragging = false;
  let startX = 0, startY = 0;
  let translateX = 0, translateY = 0;

  window.handleCertImageError = function (img, title, issuer) {
    img.onerror = null;
    const container = img.parentElement;
    container.classList.add('cert-placeholder-active');

    const placeholderHTML = `
      <div class="cert-image-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="placeholder-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span class="placeholder-text">Preview Pending</span>
        <span class="placeholder-subtitle">Click Enlarge to View</span>
      </div>
    `;
    img.style.display = 'none';
    container.insertAdjacentHTML('afterbegin', placeholderHTML);
  };

  window.openLightbox = function (mediaUrl, downloadUrl, title, issuer, date) {
    const lightbox = document.getElementById('certLightbox');
    const mediaWrapper = document.getElementById('lightboxMediaWrapper');
    const lbTitle = document.getElementById('lightboxTitle');
    const lbIssuer = document.getElementById('lightboxIssuer');
    const lbDownload = document.getElementById('lightboxDownload');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomLevelText = document.getElementById('zoomLevel');

    if (!lightbox || !mediaWrapper) return;

    lbTitle.textContent = title;
    lbIssuer.textContent = `${issuer} • ${date}`;
    lbDownload.href = downloadUrl;

    // Reset zoom state
    currentZoom = 1.0;
    translateX = 0;
    translateY = 0;
    updateZoomUI();

    // Check if media is PDF
    const isPDF = mediaUrl.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      // For PDF, embed in an iframe
      mediaWrapper.innerHTML = `<iframe src="${mediaUrl}#toolbar=0" class="lightbox-iframe" frameborder="0"></iframe>`;
      if (zoomInBtn) zoomInBtn.disabled = true;
      if (zoomOutBtn) zoomOutBtn.disabled = true;
      if (zoomLevelText) zoomLevelText.textContent = 'N/A';
    } else {
      // For image
      mediaWrapper.innerHTML = `<img src="${mediaUrl}" class="lightbox-img" alt="${title}" id="lightboxImg" draggable="false">`;
      if (zoomInBtn) zoomInBtn.disabled = false;
      if (zoomOutBtn) zoomOutBtn.disabled = false;
      if (zoomLevelText) zoomLevelText.textContent = '100%';

      // Add dragging event listeners to the image
      const img = document.getElementById('lightboxImg');
      if (img) {
        img.addEventListener('mousedown', startDrag);
        img.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', stopDrag);
      }
    }

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock body scroll
  };

  function closeLightbox() {
    const lightbox = document.getElementById('certLightbox');
    if (!lightbox) return;

    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock body scroll

    const mediaWrapper = document.getElementById('lightboxMediaWrapper');
    if (mediaWrapper) mediaWrapper.innerHTML = '';

    window.removeEventListener('mouseup', stopDrag);
  }

  function updateZoomUI() {
    const img = document.getElementById('lightboxImg');
    const zoomLevelText = document.getElementById('zoomLevel');
    if (zoomLevelText) {
      zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
    }
    if (img) {
      img.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    }
  }

  function zoomIn() {
    if (currentZoom >= 3.0) return;
    currentZoom += 0.25;
    updateZoomUI();
  }

  function zoomOut() {
    if (currentZoom <= 0.5) return;
    currentZoom -= 0.25;
    if (currentZoom <= 1.0) {
      translateX = 0;
      translateY = 0;
    }
    updateZoomUI();
  }

  function startDrag(e) {
    if (currentZoom <= 1.0) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    e.target.style.cursor = 'grabbing';
  }

  function drag(e) {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateZoomUI();
  }

  function stopDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    const img = document.getElementById('lightboxImg');
    if (img) {
      img.style.cursor = 'zoom-in';
    }
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTyping();
    initScrollAnimations();
    initSkillBars();
    initNavigation();
    initContactForm();
    initFooter();

    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Lightbox triggers
    document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
    document.getElementById('zoomInBtn')?.addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn')?.addEventListener('click', zoomOut);
    document.getElementById('certLightbox')?.addEventListener('click', (e) => {
      if (e.target.id === 'certLightbox') {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  });
})();
