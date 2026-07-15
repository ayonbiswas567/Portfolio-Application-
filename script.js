// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => { this.mouse.x = e.x; this.mouse.y = e.y; });
    this.init();
    this.animate();
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  init() {
    this.particles = [];
    const count = Math.min(40, Math.floor((this.canvas.width * this.canvas.height) / 30000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p, i) => {
      p.x += p.speedX; p.y += p.speedY;
      if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
      // Mouse interaction
      if (this.mouse.x) {
        const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          p.x += dx / dist * 1.5;
          p.y += dy / dist * 1.5;
        }
      }
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(108,92,231,${p.opacity})`;
      this.ctx.fill();
      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x, dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(108,92,231,${0.1 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    });
    requestAnimationFrame(() => this.animate());
  }
}

// ===== NAVBAR =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// ===== TYPING EFFECT =====
class TypeWriter {
  constructor(el, words, wait = 2000) {
    this.el = el; this.words = words; this.wait = wait;
    this.wordIndex = 0; this.txt = ''; this.isDeleting = false;
    this.type();
  }
  type() {
    const current = this.words[this.wordIndex % this.words.length];
    this.txt = this.isDeleting
      ? current.substring(0, this.txt.length - 1)
      : current.substring(0, this.txt.length + 1);
    this.el.textContent = this.txt;
    let speed = this.isDeleting ? 50 : 100;
    if (!this.isDeleting && this.txt === current) { speed = this.wait; this.isDeleting = true; }
    else if (this.isDeleting && this.txt === '') { this.isDeleting = false; this.wordIndex++; speed = 400; }
    setTimeout(() => this.type(), speed);
  }
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

// ===== 3D TILT CARDS =====
document.querySelectorAll('.tilt-card').forEach(card => {
  let entryTimeout = null;

  card.addEventListener('mouseenter', () => {
    // Smooth transition filter for initial hover entry (lift & scale)
    card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, border-color 0.3s ease';
    
    // Switch to a fast, responsive transition for active mousemove tracking after entry completes
    clearTimeout(entryTimeout);
    entryTimeout = setTimeout(() => {
      card.style.transition = 'transform 0.08s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
    }, 300);
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const centerX = rect.width / 2, centerY = rect.height / 2;
    
    // Calculate rotation angles
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    
    // Detect vertical hover lift amount based on card type to prevent design clipping/jumping
    let lift = -4;
    if (card.classList.contains('project-card') || card.classList.contains('service-card')) {
      lift = -8;
    }
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${lift}px) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    clearTimeout(entryTimeout);
    // Graceful spring transition back to original center baseline
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s ease, border-color 0.5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale3d(1, 1, 1)';
  });
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(counter => {
    const target = counter.getAttribute('data-count');
    const suffix = counter.getAttribute('data-suffix') || '';
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = current + suffix;
    }, 30);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCounters(); statsObserver.unobserve(entry.target); }
  });
}, { threshold: 0.15 });

const statsSection = document.querySelector('.hero-stats');
if (statsSection) statsObserver.observe(statsSection);

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== CUSTOM RECURSIVE WORD SPLITTER FOR REVEALS =====
function splitTextIntoWords(element) {
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text.trim()) return;

      const words = text.split(/(\s+)/);
      const fragment = document.createDocumentFragment();

      words.forEach(word => {
        if (/\s+/.test(word)) {
          fragment.appendChild(document.createTextNode(word));
        } else {
          const wrapper = document.createElement('span');
          wrapper.className = 'word-wrapper';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = word;
          wrapper.appendChild(inner);
          fragment.appendChild(wrapper);
        }
      });
      node.parentNode.replaceChild(fragment, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains('word-wrapper') || node.classList.contains('word-inner')) return;
      const children = Array.from(node.childNodes);
      children.forEach(processNode);
    }
  };
  const children = Array.from(element.childNodes);
  children.forEach(processNode);
}

// ===== MAGNETIC BUTTONS SYSTEM =====
function initMagneticButtons() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const pull = 0.3; // magnetic pull coefficient
      btn.style.transform = `translate(${x * pull}px, ${y * pull}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1.2)';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
    });
  });
}

// ===== CUSTOM CURSOR LOGIC =====
function initCustomCursor() {
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorOutline = document.querySelector('.custom-cursor-outline');

  if (!cursorDot || !cursorOutline) return;

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let outlineX = 0, outlineY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const animateCursor = () => {
    dotX = mouseX;
    dotY = mouseY;
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;

    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  // Hover events on interactive elements
  const interactives = document.querySelectorAll('a, button, .magnetic, .tilt-card, input, textarea, select');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.classList.add('hovered');
      cursorOutline.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('hovered');
      cursorOutline.classList.remove('hovered');
    });
  });

  // Click states
  window.addEventListener('mousedown', () => {
    cursorDot.classList.add('clicked');
    cursorOutline.classList.add('clicked');
  });
  window.addEventListener('mouseup', () => {
    cursorDot.classList.remove('clicked');
    cursorOutline.classList.remove('clicked');
  });
}

// ===== BACK-TO-TOP & PROGRESS RING =====
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  const progressCircle = document.querySelector('.progress-ring-circle');

  if (!backToTopBtn || !progressCircle) return;

  const radius = progressCircle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      const scrollPercent = window.scrollY / scrollHeight;
      const offset = circumference - (scrollPercent * circumference);
      progressCircle.style.strokeDashoffset = Math.max(0, Math.min(circumference, offset));
    }

    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== LOADING SCREEN MANAGER =====
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.querySelector('.loader-progress-bar');
  const progressPercentage = document.querySelector('.loader-percentage');
  const progressStatus = document.querySelector('.loader-status');

  if (!loadingScreen || !progressBar || !progressPercentage) return;

  let progress = 0;
  const statuses = [
    'Initializing System...',
    'Loading AI Workflows...',
    'Rendering Graphic Buffers...',
    'Synthesizing Neural Nets...',
    'Welcome!'
  ];

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 2;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      progressBar.style.width = '100%';
      progressPercentage.textContent = '100%';
      progressStatus.textContent = statuses[statuses.length - 1];

      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        document.body.classList.remove('loading');

        // Instantly trigger reveal-text animations in hero
        const heroReveals = document.querySelectorAll('#hero .reveal-text');
        heroReveals.forEach(el => el.classList.add('active'));
      }, 600);

      setTimeout(() => {
        loadingScreen.remove();
      }, 1800);
    } else {
      progressBar.style.width = `${progress}%`;
      progressPercentage.textContent = `${progress}%`;

      const statusIdx = Math.min(
        statuses.length - 2,
        Math.floor((progress / 100) * (statuses.length - 1))
      );
      progressStatus.textContent = statuses[statusIdx];
    }
  }, 40);
}

// ============================================================
// ===== NEW PREMIUM FEATURES =====
// ============================================================

// ===== 1. LENIS SMOOTH SCROLL =====
function initLenisSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Store globally so other functions can use it
  window.__lenis = lenis;
}

// ===== 2. CURSOR SPOTLIGHT ON CARDS =====
function initCursorSpotlight() {
  const cards = document.querySelectorAll('.bento-card, .project-card, .edu-card, .stat-card, .timeline-card, .service-card');

  cards.forEach(card => {
    const spotlight = document.createElement('div');
    spotlight.className = 'card-spotlight';
    card.appendChild(spotlight);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(108,92,231,0.15), rgba(0,206,201,0.05) 40%, transparent 70%)`;
      spotlight.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });
  });
}

// ===== 3. NOISE / GRAIN OVERLAY =====
// initNoiseGrain is disabled - CPU noise animation replaced by GPU-accelerated CSS keyframe noise

// ===== 4. ANIMATED GRADIENT BORDERS =====
function initAnimatedBorders() {
  const cards = document.querySelectorAll('.bento-card, .project-card, .edu-card, .stat-card, .timeline-card, .service-card');

  cards.forEach(card => {
    // Create the glow border element
    const glowBorder = document.createElement('div');
    glowBorder.className = 'card-glow-border';

    // Create inner fill to mask the center
    const glowInner = document.createElement('div');
    glowInner.className = 'card-glow-inner';

    // Detect the right background color
    const section = card.closest('section');
    if (section) {
      const sectionBg = getComputedStyle(section).backgroundColor;
      if (sectionBg && sectionBg !== 'rgba(0, 0, 0, 0)') {
        glowInner.style.background = sectionBg;
      }
    }

    card.insertBefore(glowBorder, card.firstChild);
    card.insertBefore(glowInner, card.children[1]);
  });
}

// ===== 5. STAGGERED CARD REVEALS =====
function initStaggeredReveals() {
  const grids = document.querySelectorAll('.skills-bento-grid, .projects-grid, .edu-grid, .about-stats, .services-grid');

  grids.forEach(grid => {
    const items = grid.querySelectorAll('.reveal');
    items.forEach((item, idx) => {
      item.classList.add(`stagger-${Math.min(idx + 1, 6)}`);
    });
  });
}

// ===== 6. PARALLAX DEPTH ON ORBS =====
function initParallax() {
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  const heroContent = document.querySelector('.hero-content');

  if (!orb1 && !orb2) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (orb1) orb1.style.transform = `translate(${Math.sin(scrollY * 0.002) * 30}px, ${scrollY * 0.25}px)`;
        if (orb2) orb2.style.transform = `translate(${Math.cos(scrollY * 0.002) * 20}px, ${scrollY * -0.15}px)`;
        if (heroContent && scrollY < window.innerHeight) {
          heroContent.style.transform = `translateY(${scrollY * 0.08}px)`;
          heroContent.style.opacity = `${1 - scrollY / (window.innerHeight * 0.8)}`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ===== 7. TEXT SCRAMBLE ON HOVER =====
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.originalText = el.textContent;
    this.isAnimating = false;
  }

  scramble() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    const length = this.originalText.length;
    let iteration = 0;

    const interval = setInterval(() => {
      this.el.textContent = this.originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) return this.originalText[index];
          if (char === ' ') return ' ';
          return this.chars[Math.floor(Math.random() * this.chars.length)];
        })
        .join('');

      if (iteration >= length) {
        this.el.textContent = this.originalText;
        clearInterval(interval);
        this.isAnimating = false;
      }
      iteration += 0.5;
    }, 25);
  }
}

function initTextScramble() {
  const targets = document.querySelectorAll('.timeline-role, .project-title, .edu-degree, .service-title');

  targets.forEach(el => {
    const scrambler = new TextScramble(el);
    el.classList.add('scramble-target');
    el.addEventListener('mouseenter', () => scrambler.scramble());
  });
}

// ===== 8. CLICK RIPPLE EFFECT =====
function initRippleEffect() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = this.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

// ===== 9. ACTIVE NAV SECTION TRACKING =====
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navAnchors.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

  sections.forEach(section => observer.observe(section));
}

// ===== 10. SECTION GLOW DIVIDERS =====
function initSectionDividers() {
  const sections = document.querySelectorAll('section');

  sections.forEach((section, idx) => {
    // Don't add after the last section or after the hero
    if (idx === 0 || idx >= sections.length - 1) return;

    const divider = document.createElement('div');
    divider.className = 'section-divider';
    section.parentNode.insertBefore(divider, section);
  });
}

// ===== 11. AI CHATBOT PERSONA & GROQ STREAM SYSTEM =====
const CHATBOT_PERSONA_PROMPT = `You are the digital twin/AI persona of Ayon Biswas, a highly accomplished Applied AI Engineer & Cloud-Native Systems Architect working at Keysight Technologies R&D in Gurugram, India.
Your mission is to represent Ayon perfectly to recruiters, hiring managers, and portfolio visitors.

Guidelines:
1. Speak in the first person ("I", "my") as Ayon Biswas.
2. Be professional, highly technical, confident, but humble and warm.
3. Keep responses concise, clear, and focused. Do not output massive walls of text unless explicitly asked. Use bullet points or code snippets when helpful.
4. If asked about contact info, provide: email (ayonbiswas567@gmail.com) and phone (+91-8617607547).
5. If asked about opportunities, state that you are active and interested in advanced AI, distributed backend systems, or cloud-native architecture engineering roles.
6. If asked about services you offer, state that you provide custom workflow automation with AI agents, premium web app engineering with AI integrations, strategic architecture & cloud consulting, and 1-on-1 technical/career mentorship.

Key professional background to use:
- Current Role: Software Engineer – R&D at Keysight Technologies. Clients include Lockheed Martin, Boeing, Emirates. You built "The R&D Finder" (an internal semantic search RAG application using Python and LangChain). You do heavy prompt engineering, Pydantic validation, and QA testing.
- Prior Role: Software Engineer – R&D at AMETEK Mocon. Optimized SQL queries, decreasing monolithic load times by 60%.
- Education: Master's in Signal & Image Processing (AI focus) from NIT Rourkela (CGPA: 7.34), B.Tech in ECE from Haldia Institute of Technology (CGPA: 8.75).
- Main Skills: LangChain, LangGraph, LangSmith, FastAPI, Python, Docker, Kubernetes (AKS), PostgreSQL, vector search databases (FAISS, ChromaDB), C#, ASP.NET Core.

Be brief, intelligent, and highly relevant! Give one line response not more than that`;

class AIChatbot {
  constructor() {
    this.widget = document.getElementById('ai-chat-widget');
    this.bubble = document.getElementById('ai-chat-bubble');
    this.window = document.getElementById('ai-chat-window');
    this.closeBtn = document.getElementById('close-chat-btn');
    this.messagesContainer = document.getElementById('chat-messages');
    this.form = document.getElementById('chat-form-el');
    this.input = document.getElementById('chat-input-field');
    this.suggestContainer = document.getElementById('chat-suggests');
    this.ctaBubble = document.getElementById('chat-cta-bubble');

    this.chatHistory = [];
    this.isGenerating = false;
    this.defaultApiKey = atob("Z3NrX3VVVTZCVlJEY0VPYjRsMHhBR0NmV0dkeXJvZlhZM1ZIbGNyRWc2UkFGbDYzdlNPTmExSXA=");
    this.groqApiKey = localStorage.getItem("groq_api_key") || this.defaultApiKey;

    this.initEvents();
    this.initCTA();
  }

  initEvents() {
    // Open/Close
    this.bubble.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.toggleChat());

    // Settings gear button click
    const settingsBtn = document.getElementById('chat-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const currentKey = localStorage.getItem("groq_api_key") || "";
        const newKey = prompt("Configure your Chatbot Twin API Key:\n\nTo make the chatbot work, please generate a Groq API Key from console.groq.com and paste it below. Leaving it blank resets to default:", currentKey);
        
        if (newKey !== null) {
          const trimmed = newKey.trim();
          if (trimmed) {
            localStorage.setItem("groq_api_key", trimmed);
            this.groqApiKey = trimmed;
            alert("API Key updated successfully! Please refresh or continue chatting.");
          } else {
            localStorage.removeItem("groq_api_key");
            this.groqApiKey = this.defaultApiKey;
            alert("API Key reset to default. Please refresh or continue chatting.");
          }
        }
      });
    }

    // Submit input
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserSubmit();
    });

    // Quick suggest chips
    this.suggestContainer.querySelectorAll('.suggest-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (this.isGenerating) return;
        this.input.value = chip.textContent;
        this.handleUserSubmit();
      });
    });

    // Hover chatbot bubble to reveal CTA tooltip
    this.bubble.addEventListener('mouseenter', () => {
      if (this.ctaBubble && !this.window.classList.contains('show')) {
        this.ctaBubble.classList.add('show');
      }
    });

    this.bubble.addEventListener('mouseleave', () => {
      if (this.ctaBubble) {
        this.ctaBubble.classList.remove('show');
      }
    });

    // Let clicking the CTA tooltip open the chat
    if (this.ctaBubble) {
      this.ctaBubble.addEventListener('click', () => this.toggleChat());
    }
  }

  initCTA() {
    if (!this.ctaBubble) return;

    // Momentarily display CTA bubble after 5s page load delay to attract the user
    setTimeout(() => {
      if (this.ctaBubble && !this.window.classList.contains('show')) {
        this.ctaBubble.classList.add('show');

        // Automatically hide it after 7 seconds
        setTimeout(() => {
          if (this.ctaBubble) {
            this.ctaBubble.classList.remove('show');
          }
        }, 7000);
      }
    }, 5000);
  }

  toggleChat() {
    this.window.classList.toggle('show');
    if (this.window.classList.contains('show')) {
      setTimeout(() => this.input.focus(), 300);
      // Immediately hide the CTA tooltip when chat window opens
      if (this.ctaBubble) {
        this.ctaBubble.classList.remove('show');
      }
    }
  }

  appendMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = text; // support formatting/markdown if needed

    msgDiv.appendChild(bubble);
    this.messagesContainer.appendChild(msgDiv);
    this.scrollToBottom();

    return bubble; // Return bubble reference for streaming updates
  }

  appendTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ai-message typing-indicator-wrapper';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing-indicator';
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;

    msgDiv.appendChild(bubble);
    this.messagesContainer.appendChild(msgDiv);
    this.scrollToBottom();
    return msgDiv;
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  async handleUserSubmit() {
    const text = this.input.value.trim();
    if (!text || this.isGenerating) return;

    this.input.value = '';
    this.appendMessage(text, true);

    this.chatHistory.push({ role: "user", content: text });
    this.isGenerating = true;

    // Show thinking animation
    const indicator = this.appendTypingIndicator();

    // Setup active streaming bubble
    let aiBubble = null;
    let aiResponseText = "";

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: CHATBOT_PERSONA_PROMPT },
            ...this.chatHistory
          ],
          temperature: 0.7,
          max_tokens: 1024,
          stream: true
        })
      });

      // Remove typing indicator once stream starts
      indicator.remove();

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // Initialize empty AI bubble for streaming chunks
      aiBubble = this.appendMessage("", false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep partial line in buffer

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned || cleaned === "data: [DONE]") continue;
          if (cleaned.startsWith("data: ")) {
            try {
              const json = JSON.parse(cleaned.substring(6));
              const content = json.choices[0]?.delta?.content || "";
              if (content) {
                aiResponseText += content;
                // Render nicely (handle linebreaks simple conversion)
                aiBubble.innerHTML = aiResponseText.replace(/\n/g, "<br>");
                this.scrollToBottom();
              }
            } catch (err) {
              // Ignore partial chunk syntax errors
            }
          }
        }
      }

      this.chatHistory.push({ role: "assistant", content: aiResponseText });

    } catch (error) {
      if (indicator) indicator.remove();
      console.error("Groq Chatbot error:", error);
      this.appendMessage("Sorry, I encountered an issue connecting to my brain. Please try again! ⚡", false);
    } finally {
      this.isGenerating = false;
    }
  }
}

// ===== 13. BENTO WIDGET ANIMATIONS =====
function initTerminalAnimation() {
  const termBody = document.getElementById('terminal-code');
  if (!termBody) return;

  const lines = [
    { text: "pip install fastapi langgraph uvicorn", type: "cmd" },
    { text: "Installing dependencies... Done.", type: "log" },
    { text: "python app.py", type: "cmd" },
    { text: "from fastapi import FastAPI\nfrom langgraph.graph import StateGraph\n\napp = FastAPI()\nworkflow = StateGraph(AgentState)\n", type: "code" },
    { text: "INFO:     Started server process [12874]", type: "log" },
    { text: "INFO:     Uvicorn server running on http://127.0.0.1:8000", type: "log" },
    { text: "INFO:     Waiting for application startup.", type: "log" },
    { text: "INFO:     Application startup complete.", type: "log" }
  ];

  let lineIdx = 0;
  termBody.innerHTML = "";

  function typeLine() {
    if (lineIdx >= lines.length) {
      setTimeout(() => {
        termBody.innerHTML = "";
        lineIdx = 0;
        typeLine();
      }, 4000);
      return;
    }

    const line = lines[lineIdx];
    const div = document.createElement('div');
    div.className = `term-line ${line.type}`;
    termBody.appendChild(div);

    let charIdx = 0;
    const textToType = line.text;

    function typeChar() {
      if (charIdx < textToType.length) {
        div.textContent += textToType.charAt(charIdx);
        charIdx++;
        setTimeout(typeChar, line.type === 'code' ? 12 : 25);
      } else {
        if (line.type === 'cmd') {
          div.innerHTML = `<span class="prompt">$</span> ` + div.textContent;
        }
        lineIdx++;
        setTimeout(typeLine, 600);
      }
    }
    typeChar();
  }

  typeLine();
}

function initVectorDBSimulation() {
  const queryTextEl = document.querySelector('.query-text');
  const results = document.querySelectorAll('.result-item');
  if (!queryTextEl || !results.length) return;

  const queries = [
    "Find AI Agent developers...",
    "Search RAG architecture experience...",
    "Keysight Technologies R&D Finder...",
    "Cloud-native system design projects..."
  ];

  let qIdx = 0;

  function runQuery() {
    const q = queries[qIdx % queries.length];
    queryTextEl.textContent = "";
    queryTextEl.style.opacity = "1";
    
    let charIdx = 0;
    function typeQuery() {
      if (charIdx < q.length) {
        queryTextEl.textContent += q.charAt(charIdx);
        charIdx++;
        setTimeout(typeQuery, 40);
      } else {
        setTimeout(() => {
          results.forEach((item, idx) => {
            setTimeout(() => {
              item.style.background = 'rgba(0, 206, 201, 0.12)';
              item.style.borderColor = 'var(--accent2)';
              setTimeout(() => {
                item.style.background = 'rgba(255,255,255,0.02)';
                item.style.borderColor = 'rgba(255,255,255,0.03)';
              }, 1200);
            }, idx * 150);
          });
          
          setTimeout(() => {
            qIdx++;
            runQuery();
          }, 3500);
        }, 800);
      }
    }
    typeQuery();
  }
  
  runQuery();
}

function initAccentPicker() {
  const dots = document.querySelectorAll('.color-dot');
  const mockBrowser = document.querySelector('.mock-browser');
  if (mockBrowser) {
    mockBrowser.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active-dot'));
      dot.classList.add('active-dot');
      const color = dot.getAttribute('data-accent');
      
      document.documentElement.style.setProperty('--accent', color);
      if (color === '#6c5ce7') {
        document.documentElement.style.setProperty('--accent2', '#00cec9');
      } else if (color === '#00cec9') {
        document.documentElement.style.setProperty('--accent2', '#fd79a8');
      } else if (color === '#fd79a8') {
        document.documentElement.style.setProperty('--accent2', '#6c5ce7');
      } else if (color === '#00b894') {
        document.documentElement.style.setProperty('--accent2', '#00cec9');
      }

      // Trigger high-end dashboard feedback animation
      if (mockBrowser) {
        mockBrowser.style.transform = 'scale(1.03)';
        setTimeout(() => {
          mockBrowser.style.transform = 'scale(1)';
        }, 300);
      }
    });
  });
}

// ===== 12. VIDEO MODAL LIGHTBOX =====
function initVideoModal() {
  const openBtn = document.getElementById('hero-play-btn');
  const modal = document.getElementById('video-modal');
  const closeBtn = document.getElementById('video-modal-close');
  const video = document.getElementById('modal-video-player');

  if (!openBtn || !modal || !closeBtn || !video) return;

  openBtn.addEventListener('click', () => {
    modal.classList.add('show');
    video.play();
    if (window.__lenis) window.__lenis.stop();
  });

  const closeModal = () => {
    modal.classList.remove('show');
    video.pause();
    video.currentTime = 0;
    if (window.__lenis) window.__lenis.start();
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Start the loading screen
  initLoadingScreen();

  const canvas = document.getElementById('particles-canvas');
  if (canvas) new ParticleSystem(canvas);

  const typeEl = document.getElementById('typewriter');
  if (typeEl) {
    new TypeWriter(typeEl, [
      'Applied AI Engineer',
      'Cloud-Native Architect',
      'Backend Developer',
      'Distributed Systems Engineer'
    ], 2000);
  }

  // Set up Word Splitting for Text Reveal
  const revealTexts = document.querySelectorAll('.reveal-text');
  revealTexts.forEach(el => {
    splitTextIntoWords(el);
    el.querySelectorAll('.word-inner').forEach((w, idx) => {
      w.style.transitionDelay = `${idx * 0.03}s`;
    });
  });

  // Observer for word reveals (only triggers if NOT inside Hero, since Hero is handled on load)
  const wordRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        wordRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealTexts.forEach(el => {
    if (!el.closest('#hero')) {
      wordRevealObserver.observe(el);
    }
  });

  // Initialize existing premium features
  initMagneticButtons();
  initCustomCursor();
  initBackToTop();

  // ===== Initialize NEW premium features =====
  initLenisSmoothScroll();
  // initNoiseGrain(); // Disabled for CPU performance - now handled by GPU-accelerated CSS noise
  initCursorSpotlight();
  initAnimatedBorders();
  initStaggeredReveals();
  initParallax();
  initTextScramble();
  initRippleEffect();
  initActiveNav();
  initSectionDividers();
  initVideoModal();
  initTerminalAnimation();
  initVectorDBSimulation();
  initAccentPicker();

  // ===== Initialize Chatbot Twin =====
  new AIChatbot();
});

