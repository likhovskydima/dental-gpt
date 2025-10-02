const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  }
);

revealElements.forEach((el) => revealObserver.observe(el));

const testimonialCards = Array.from(document.querySelectorAll('.testimonial-card'));
const sliderButtons = document.querySelectorAll('.slider-btn');
let testimonialIndex = 0;
let sliderTimer;

function updateTestimonials(index) {
  testimonialCards.forEach((card, i) => {
    card.classList.toggle('is-active', i === index);
  });
}

function nextTestimonial(direction = 1) {
  testimonialIndex = (testimonialIndex + direction + testimonialCards.length) % testimonialCards.length;
  updateTestimonials(testimonialIndex);
  restartAutoSlide();
}

function restartAutoSlide() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => nextTestimonial(1), 6500);
}

if (testimonialCards.length) {
  updateTestimonials(testimonialIndex);
  restartAutoSlide();

  sliderButtons.forEach((btn) => {
    const direction = btn.dataset.direction === 'prev' ? -1 : 1;
    btn.addEventListener('click', () => nextTestimonial(direction));
  });
}

const form = document.querySelector('.appointment__form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    form.reset();
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = `${name || 'Дякуємо'}, ми скоро з вами зв'яжемося!`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 400);
    }, 3600);
  });
}

const calculatorForm = document.getElementById('pricingCalculator');

if (calculatorForm) {
  const priceDisplay = document.querySelector('.pricing-summary [data-price]');
  const durationDisplay = document.querySelector('.pricing-summary [data-duration]');
  const complexityDisplay = document.querySelector('.pricing-summary [data-complexity-label]');
  const breakdownList = document.querySelector('.pricing-summary [data-breakdown]');
  const optionCards = Array.from(calculatorForm.querySelectorAll('.option-card'));
  const addonCards = Array.from(calculatorForm.querySelectorAll('.addon-card'));
  const slider = calculatorForm.querySelector('#complexity');
  const sliderBubble = calculatorForm.querySelector('[data-slider-value]');

  if (!priceDisplay || !durationDisplay || !complexityDisplay || !breakdownList || !slider || !sliderBubble) {
    console.warn('Pricing calculator elements are missing.');
    return;
  }

  const complexityLabels = {
    1: 'Легка',
    2: 'Середня',
    3: 'Складна'
  };

  const pricingMatrix = {
    diagnostics: {
      label: 'Цифрова діагностика',
      base: 1800,
      complexity: [0, 450, 900],
      duration: ['1 візит', '1-2 візити', '2-3 візити'],
      breakdown: ['Цифровий скан iTero', 'Фотопротокол', 'Консультація головного лікаря']
    },
    aesthetics: {
      label: 'Естетична стоматологія',
      base: 6800,
      complexity: [0, 3200, 6200],
      duration: ['2 візити', '3-4 візити', '4-6 візитів'],
      breakdown: ['Діагностика з Digital Smile Design', 'Підготовка емалі', 'Індивідуальні вініри або реставрації']
    },
    orthodontics: {
      label: 'Ортодонтія',
      base: 32000,
      complexity: [0, 9800, 16400],
      duration: ['6 місяців', '9-12 місяців', '12-18 місяців'],
      breakdown: ['3D-планування руху зубів', 'Набір елайнерів або брекет-система', 'Щомісячні контрольні візити']
    },
    surgery: {
      label: 'Хірургія та імплантація',
      base: 18500,
      complexity: [0, 5200, 9400],
      duration: ['2 візити', '3-4 візити', '4-6 візитів'],
      breakdown: ['Цифрове планування операції', 'Навігаційна хірургія', 'Індивідуальна коронка CAD/CAM']
    }
  };

  const addonsConfig = {
    sedation: {
      label: 'Седація для комфорту',
      price: 1900
    },
    expressLab: {
      label: 'Експрес-лабораторія',
      price: 4500
    },
    wellness: {
      label: 'Преміум догляд',
      price: 1200
    },
    guarantee: {
      label: 'Розширена гарантія',
      price: 2400
    }
  };

  let currentPrice = pricingMatrix.diagnostics.base;
  let priceAnimationFrame;

  function formatCurrency(value) {
    return `₴ ${value.toLocaleString('uk-UA')}`;
  }

  function animatePrice(from, to) {
    cancelAnimationFrame(priceAnimationFrame);
    const start = performance.now();
    const duration = 600;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      priceDisplay.textContent = formatCurrency(value);

      if (progress < 1) {
        priceAnimationFrame = requestAnimationFrame(tick);
      }
    }

    priceDisplay.classList.add('is-updated');
    priceAnimationFrame = requestAnimationFrame(tick);
    setTimeout(() => priceDisplay.classList.remove('is-updated'), duration);
  }

  function renderBreakdown(items) {
    breakdownList.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      breakdownList.appendChild(li);
    });
  }

  function updateSliderBubble() {
    const value = Number(slider.value);
    const min = Number(slider.min);
    const max = Number(slider.max);
    const percent = ((value - min) / (max - min)) * 100;
    sliderBubble.textContent = complexityLabels[value];
    sliderBubble.style.left = `calc(${percent}% + (${8 - percent * 0.16}px))`;
  }

  function updateActiveStates() {
    optionCards.forEach((card) => {
      const input = card.querySelector('input');
      card.classList.toggle('is-active', input.checked);
    });

    addonCards.forEach((card) => {
      const input = card.querySelector('input');
      card.classList.toggle('is-active', input.checked);
    });
  }

  function updateCalculator() {
    const selectedTreatment = calculatorForm.querySelector('input[name="treatment"]:checked');
    if (!selectedTreatment) return;

    const complexity = Number(slider.value);
    const treatmentConfig = pricingMatrix[selectedTreatment.value];
    const addonsSelected = Array.from(calculatorForm.querySelectorAll('input[name="addons"]:checked')).map(
      (input) => input.value
    );

    let total = treatmentConfig.base + treatmentConfig.complexity[complexity - 1];
    const breakdown = [treatmentConfig.label, ...treatmentConfig.breakdown];

    addonsSelected.forEach((key) => {
      const addon = addonsConfig[key];
      if (!addon) return;
      total += addon.price;
      breakdown.push(addon.label);
    });

    animatePrice(currentPrice, total);
    currentPrice = total;

    durationDisplay.textContent = `Тривалість плану: ${treatmentConfig.duration[complexity - 1]}`;
    complexityDisplay.textContent = `Складність: ${complexityLabels[complexity]}`;
    renderBreakdown(breakdown);
  }

  optionCards.forEach((card) => {
    const input = card.querySelector('input');
    input.addEventListener('change', () => {
      updateActiveStates();
      updateCalculator();
    });
  });

  addonCards.forEach((card) => {
    const input = card.querySelector('input');
    input.addEventListener('change', () => {
      updateActiveStates();
      updateCalculator();
    });
  });

  slider.addEventListener('input', () => {
    updateSliderBubble();
    complexityDisplay.textContent = `Складність: ${complexityLabels[Number(slider.value)]}`;
    updateCalculator();
  });

  updateActiveStates();
  updateSliderBubble();
  updateCalculator();
}

function initToothScene() {
  const canvas = document.getElementById('toothCanvas');
  if (!canvas || typeof THREE === 'undefined') {
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe3f2fd, 0.11);

  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.4, 5.2);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const topLight = new THREE.DirectionalLight(0xffffff, 0.9);
  topLight.position.set(2.2, 3.4, 3.5);
  scene.add(topLight);

  const rimLight = new THREE.PointLight(0x8ec5ff, 1.2, 15);
  rimLight.position.set(-3.5, 2.4, -3.8);
  scene.add(rimLight);

  const group = new THREE.Group();

  const enamelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfafcff,
    roughness: 0.32,
    transmission: 0.12,
    thickness: 0.6,
    metalness: 0.08,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    reflectivity: 0.72
  });

  const crownGeometry = new THREE.SphereGeometry(1.1, 68, 68);
  const crown = new THREE.Mesh(crownGeometry, enamelMaterial);
  crown.scale.set(1, 0.82, 1);
  crown.position.y = 0.65;
  group.add(crown);

  const lobeGeometry = new THREE.SphereGeometry(0.54, 48, 48);
  const offsets = [
    [0.45, 0.85, 0.32],
    [-0.45, 0.85, 0.32],
    [0.45, 0.85, -0.32],
    [-0.45, 0.85, -0.32]
  ];

  offsets.forEach(([x, y, z]) => {
    const lobe = new THREE.Mesh(lobeGeometry, enamelMaterial);
    lobe.scale.set(1, 0.85, 1);
    lobe.position.set(x, y, z);
    group.add(lobe);
  });

  const rootMaterial = enamelMaterial.clone();
  rootMaterial.roughness = 0.45;

  const rootGeometry = new THREE.CylinderGeometry(0.55, 0.25, 1.8, 48, 1, true);

  const rootLeft = new THREE.Mesh(rootGeometry, rootMaterial);
  rootLeft.position.set(-0.35, -0.45, 0);
  rootLeft.rotation.z = Math.PI / 18;
  group.add(rootLeft);

  const rootRight = rootLeft.clone();
  rootRight.position.x = 0.35;
  rootRight.rotation.z = -Math.PI / 18;
  group.add(rootRight);

  const rootBack = rootLeft.clone();
  rootBack.position.set(0, -0.45, 0.35);
  rootBack.rotation.x = Math.PI / 22;
  group.add(rootBack);

  const rootBackRight = rootBack.clone();
  rootBackRight.position.z = -0.35;
  rootBackRight.rotation.x = -Math.PI / 18;
  group.add(rootBackRight);

  const baseGeometry = new THREE.SphereGeometry(0.95, 48, 48, 0, Math.PI * 2, 0, Math.PI / 1.65);
  const base = new THREE.Mesh(baseGeometry, enamelMaterial);
  base.position.y = -0.42;
  group.add(base);

  group.rotation.x = -0.3;
  scene.add(group);

  const glowGeometry = new THREE.SphereGeometry(0.12, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x90cdf4 });

  const glow1 = new THREE.Mesh(glowGeometry, glowMaterial);
  glow1.position.set(1.4, 1.9, 0.8);
  scene.add(glow1);

  const glow2 = glow1.clone();
  glow2.position.set(-1.6, 1.3, -1.2);
  scene.add(glow2);

  const planeGeometry = new THREE.RingGeometry(1.2, 2.3, 64);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1.4;
  scene.add(plane);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 6;
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 1.6;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;

  function resizeRenderer() {
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }

  resizeRenderer();

  window.addEventListener('resize', resizeRenderer);

  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();
    glow1.position.y = 1.9 + Math.sin(elapsed * 1.4) * 0.2;
    glow2.position.y = 1.3 + Math.cos(elapsed * 1.1) * 0.18;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

initToothScene();
