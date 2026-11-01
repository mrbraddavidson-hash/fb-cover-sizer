/**
 * Facebook Cover Photo Sizer — Desktop & Mobile Perfect
 * Interactive HTML5 Canvas Editor & Real-Time Device Simulator
 */

(() => {
  'use strict';

  // --- Constants: Dimensions in 2x High-Resolution (1640 x 720) ---
  const CANVAS_WIDTH = 1640;
  const CANVAS_HEIGHT = 720;

  // Desktop visible slice (cropped top & bottom)
  const DESKTOP_CROP_TOP = 48; // (720 - 624) / 2
  const DESKTOP_VISIBLE_HEIGHT = 624; // 820 x 312 at 2x

  // Mobile visible slice (cropped left & right)
  const MOBILE_CROP_SIDE = 180; // (1640 - 1280) / 2
  const MOBILE_VISIBLE_WIDTH = 1280; // 640 x 360 at 2x

  // Universal Safe Zone (Intersection of PC & Mobile)
  const SAFE_ZONE = {
    x: MOBILE_CROP_SIDE, // 180
    y: DESKTOP_CROP_TOP, // 48
    width: MOBILE_VISIBLE_WIDTH, // 1280
    height: DESKTOP_VISIBLE_HEIGHT // 624
  };

  // --- State ---
  const state = {
    image: null,
    imageLoaded: false,
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    scale: 1.0,
    rotation: 0, // in degrees: 0, 90, 180, 270
    flipH: 1, // 1 or -1
    flipV: 1, // 1 or -1
    bgType: 'blur', // 'blur' | 'color' | 'gradient' | 'transparent'
    bgColor: '#1877F2',
    guides: {
      safeZone: true,
      desktopCrop: true,
      mobileCrop: true,
      ruleOfThirds: false,
      avatarMode: 'both', // 'both' | 'personal' | 'page' | 'none'
      opacity: 0.65
    },
    export: {
      resolution: '2x',
      format: 'png',
      quality: 0.92
    },
    activeTab: 'editor',
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initialImageX: 0,
    initialImageY: 0
  };

  // --- DOM Elements ---
  const elements = {
    // Canvases
    bgCanvas: document.getElementById('bgCanvas'),
    mainCanvas: document.getElementById('mainCanvas'),
    guideCanvas: document.getElementById('guideCanvas'),
    canvasWrapper: document.getElementById('canvasWrapper'),
    canvasContainer: document.getElementById('canvasContainer'),

    // Simulators
    desktopPreviewCanvas: document.getElementById('desktopPreviewCanvas'),
    mobilePreviewCanvas: document.getElementById('mobilePreviewCanvas'),
    dualDesktopCanvas: document.getElementById('dualDesktopCanvas'),
    dualMobileCanvas: document.getElementById('dualMobileCanvas'),

    // Upload & AI Generator Elements
    sourceUploadTab: document.getElementById('sourceUploadTab'),
    sourceAiTab: document.getElementById('sourceAiTab'),
    uploadPane: document.getElementById('uploadPane'),
    aiGenPane: document.getElementById('aiGenPane'),
    aiPromptInput: document.getElementById('aiPromptInput'),
    styleChips: document.querySelectorAll('.style-chip'),
    ideaButtons: document.querySelectorAll('.btn-idea'),
    generateAiBtn: document.getElementById('generateAiBtn'),
    aiLoadingSpinner: document.getElementById('aiLoadingSpinner'),
    aiStatusText: document.getElementById('aiStatusText'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    sampleButtons: document.querySelectorAll('.sample-picker [data-sample]'),

    // Transforms
    zoomSlider: document.getElementById('zoomSlider'),
    zoomVal: document.getElementById('zoomVal'),
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    fitCoverBtn: document.getElementById('fitCoverBtn'),
    fitSafeBtn: document.getElementById('fitSafeBtn'),
    centerImageBtn: document.getElementById('centerImageBtn'),
    resetTransformBtn: document.getElementById('resetTransformBtn'),
    rotateLeftBtn: document.getElementById('rotateLeftBtn'),
    rotateRightBtn: document.getElementById('rotateRightBtn'),
    flipHBtn: document.getElementById('flipHBtn'),
    flipVBtn: document.getElementById('flipVBtn'),

    // Background
    bgTypeSelect: document.getElementById('bgTypeSelect'),
    bgColorRow: document.getElementById('bgColorRow'),
    bgColorPicker: document.getElementById('bgColorPicker'),
    bgColorHex: document.getElementById('bgColorHex'),

    // Guides
    showSafeZoneCheck: document.getElementById('showSafeZoneCheck'),
    showDesktopCropCheck: document.getElementById('showDesktopCropCheck'),
    showMobileCropCheck: document.getElementById('showMobileCropCheck'),
    showThirdsCheck: document.getElementById('showThirdsCheck'),
    avatarModeSelect: document.getElementById('avatarModeSelect'),
    overlayOpacitySlider: document.getElementById('overlayOpacitySlider'),
    overlayOpacityVal: document.getElementById('overlayOpacityVal'),

    // Export
    resolutionSelect: document.getElementById('resolutionSelect'),
    exportFormatSelect: document.getElementById('exportFormatSelect'),
    jpgQualitySlider: document.getElementById('jpgQualitySlider'),
    qualityLabel: document.getElementById('qualityLabel'),
    qualityVal: document.getElementById('qualityVal'),
    downloadBtn: document.getElementById('downloadBtn'),
    exportTopBtn: document.getElementById('exportTopBtn'),
    copyClipboardBtn: document.getElementById('copyClipboardBtn'),

    // Tabs & Navigation
    tabs: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),

    // Theme & Modals
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIconSun: document.getElementById('themeIconSun'),
    themeIconMoon: document.getElementById('themeIconMoon'),
    quickGuideBtn: document.getElementById('quickGuideBtn'),
    guideModal: document.getElementById('guideModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    gotItBtn: document.getElementById('gotItBtn'),
    toast: document.getElementById('toast')
  };

  // Get contexts
  const bgCtx = elements.bgCanvas.getContext('2d');
  const mainCtx = elements.mainCanvas.getContext('2d');
  const guideCtx = elements.guideCanvas.getContext('2d');

  // --- Notification Toast Helper ---
  let toastTimer = null;
  function showToast(message, duration = 3000) {
    if (toastTimer) clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, duration);
  }

  // --- Initial Setup & Sample Image Generator ---
  function init() {
    setupEventListeners();
    setupSimulatorCanvases();
    loadSampleImage('business');
  }

  // Generate procedural sample images so the user sees a rich design immediately
  function loadSampleImage(type) {
    if (type === 'ai-generated') {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        showToast('Loaded latest AI-generated cover!');
      };
      img.onerror = () => {
        showToast('Could not load AI cover, falling back to business preset');
        loadSampleImage('business');
      };
      img.src = 'generated-cover.jpg';
      return;
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = 1640;
    offscreen.height = 720;
    const ctx = offscreen.getContext('2d');

    if (type === 'business') {
      // Modern Tech / Agency Banner
      const grad = ctx.createLinearGradient(0, 0, 1640, 720);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0f2347');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1640, 720);

      // Geometric accents
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 1640; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 720);
        ctx.stroke();
      }

      // Glowing orbs
      const glowGrad = ctx.createRadialGradient(1200, 300, 20, 1200, 300, 380);
      glowGrad.addColorStop(0, 'rgba(24, 119, 242, 0.6)');
      glowGrad.addColorStop(1, 'rgba(24, 119, 242, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1640, 720);

      // Core typography placed strategically in the Safe Zone!
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 58px Inter, sans-serif';
      ctx.fillText('NEXUS CREATIVE LAB', 300, 330);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 28px Inter, sans-serif';
      ctx.fillText('Digital Products & Strategic Growth', 300, 380);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 22px Inter, sans-serif';
      ctx.fillText('Safe Zone Guaranteed: Perfectly positioned for Mobile & PC', 300, 425);

      // Button badge mockup
      ctx.fillStyle = '#1877F2';
      ctx.beginPath();
      ctx.roundRect(300, 460, 210, 52, 26);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 20px Inter, sans-serif';
      ctx.fillText('Visit Website →', 330, 493);

    } else if (type === 'nature') {
      // Scenic Sunset Landscape
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 550);
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.35, '#581c87');
      skyGrad.addColorStop(0.7, '#ea580c');
      skyGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1640, 720);

      // Sun
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(820, 420, 90, 0, Math.PI * 2);
      ctx.fill();

      // Mountain silhouettes
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.moveTo(0, 720);
      ctx.lineTo(0, 480);
      ctx.lineTo(350, 310);
      ctx.lineTo(720, 500);
      ctx.lineTo(1100, 260);
      ctx.lineTo(1450, 450);
      ctx.lineTo(1640, 380);
      ctx.lineTo(1640, 720);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f0728';
      ctx.beginPath();
      ctx.moveTo(0, 720);
      ctx.lineTo(0, 560);
      ctx.lineTo(480, 420);
      ctx.lineTo(820, 560);
      ctx.lineTo(1250, 410);
      ctx.lineTo(1640, 530);
      ctx.lineTo(1640, 720);
      ctx.closePath();
      ctx.fill();

      // Elegant quote
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 48px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chasing Horizons & Golden Hours', 820, 220);
      ctx.textAlign = 'left';

    } else if (type === 'creative') {
      // Modern vibrant abstract
      const bg = ctx.createLinearGradient(0, 0, 1640, 720);
      bg.addColorStop(0, '#0a0a0c');
      bg.addColorStop(1, '#1a102f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1640, 720);

      // Colorful flowing ribbons
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 200 + i * 90);
        ctx.bezierCurveTo(400, 100 + i * 80, 900, 550 - i * 60, 1640, 260 + i * 90);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(236, 72, 153, 0.45)' : 'rgba(59, 130, 246, 0.45)';
        ctx.lineWidth = 45;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 64px Inter, sans-serif';
      ctx.fillText('STUDIO APEX', 500, 340);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 24px Inter, sans-serif';
      ctx.fillText('Brand Identity • Photography • UI/UX Design', 500, 390);
    }

    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = offscreen.toDataURL('image/png');
  }

  function setImage(img) {
    state.image = img;
    state.imageLoaded = true;
    fitToCover();
    renderAll();
    syncPreviews();
  }

  // --- Rendering Pipeline ---
  function renderAll() {
    renderBackground();
    renderMainImage();
    renderGuides();
    syncPreviews();
  }

  // 1. Render Background (Blur, Solid, Gradient, Transparent)
  function renderBackground() {
    bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (state.bgType === 'transparent') {
      // Show transparent checkerboard
      drawCheckerboard(bgCtx);
      return;
    }

    if (state.bgType === 'color') {
      bgCtx.fillStyle = state.bgColor;
      bgCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    if (state.bgType === 'gradient') {
      const grad = bgCtx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    if (state.bgType === 'blur' && state.image) {
      // Smart blurred fill: scale image to cover full canvas with blur
      bgCtx.save();
      bgCtx.filter = 'blur(40px) brightness(0.7)';
      // Draw oversized image to prevent blurred border bleed
      const scale = Math.max(CANVAS_WIDTH / state.image.width, CANVAS_HEIGHT / state.image.height) * 1.2;
      const w = state.image.width * scale;
      const h = state.image.height * scale;
      const x = (CANVAS_WIDTH - w) / 2;
      const y = (CANVAS_HEIGHT - h) / 2;
      bgCtx.drawImage(state.image, x, y, w, h);
      bgCtx.restore();

      // Subtle vignette overlay on top of blur
      const vignette = bgCtx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT / 3,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 1.8
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
      bgCtx.fillStyle = vignette;
      bgCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  function drawCheckerboard(ctx) {
    const size = 20;
    for (let x = 0; x < CANVAS_WIDTH; x += size) {
      for (let y = 0; y < CANVAS_HEIGHT; y += size) {
        ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#1f2937' : '#111827';
        ctx.fillRect(x, y, size, size);
      }
    }
  }

  // 2. Render Main Image with user transformations
  function renderMainImage() {
    mainCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (!state.image || !state.imageLoaded) return;

    mainCtx.save();
    // Translate to center position
    mainCtx.translate(state.x, state.y);
    mainCtx.rotate((state.rotation * Math.PI) / 180);
    mainCtx.scale(state.scale * state.flipH, state.scale * state.flipV);

    const w = state.image.width;
    const h = state.image.height;
    mainCtx.drawImage(state.image, -w / 2, -h / 2, w, h);

    mainCtx.restore();
  }

  // 3. Render Overlays & Guides
  function renderGuides() {
    guideCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const opacity = state.guides.opacity;

    // --- Desktop Cutoff Stripes (Top & Bottom) ---
    if (state.guides.desktopCrop) {
      guideCtx.save();
      // Top bar
      drawStripedZone(guideCtx, 0, 0, CANVAS_WIDTH, DESKTOP_CROP_TOP, 'rgba(245, 158, 11, ' + (opacity * 0.45) + ')', 'rgba(245, 158, 11, ' + opacity + ')');
      // Bottom bar
      drawStripedZone(guideCtx, 0, CANVAS_HEIGHT - DESKTOP_CROP_TOP, CANVAS_WIDTH, DESKTOP_CROP_TOP, 'rgba(245, 158, 11, ' + (opacity * 0.45) + ')', 'rgba(245, 158, 11, ' + opacity + ')');

      // Labels
      guideCtx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, opacity + 0.3) + ')';
      guideCtx.font = '600 16px Inter, sans-serif';
      guideCtx.textAlign = 'center';
      guideCtx.fillText('⚠️ DESKTOP CUTOFF (CROPPED ON PC - 48px)', CANVAS_WIDTH / 2, 32);
      guideCtx.fillText('⚠️ DESKTOP CUTOFF (CROPPED ON PC - 48px)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 18);
      guideCtx.restore();
    }

    // --- Mobile Cutoff Stripes (Left & Right) ---
    if (state.guides.mobileCrop) {
      guideCtx.save();
      // Left bar
      drawStripedZone(guideCtx, 0, 0, MOBILE_CROP_SIDE, CANVAS_HEIGHT, 'rgba(6, 182, 212, ' + (opacity * 0.45) + ')', 'rgba(6, 182, 212, ' + opacity + ')');
      // Right bar
      drawStripedZone(guideCtx, CANVAS_WIDTH - MOBILE_CROP_SIDE, 0, MOBILE_CROP_SIDE, CANVAS_HEIGHT, 'rgba(6, 182, 212, ' + (opacity * 0.45) + ')', 'rgba(6, 182, 212, ' + opacity + ')');

      // Vertical text labels
      guideCtx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, opacity + 0.3) + ')';
      guideCtx.font = '600 15px Inter, sans-serif';

      guideCtx.save();
      guideCtx.translate(90, CANVAS_HEIGHT / 2);
      guideCtx.rotate(-Math.PI / 2);
      guideCtx.textAlign = 'center';
      guideCtx.fillText('⚠️ MOBILE CUTOFF (-180px)', 0, 0);
      guideCtx.restore();

      guideCtx.save();
      guideCtx.translate(CANVAS_WIDTH - 90, CANVAS_HEIGHT / 2);
      guideCtx.rotate(Math.PI / 2);
      guideCtx.textAlign = 'center';
      guideCtx.fillText('⚠️ MOBILE CUTOFF (-180px)', 0, 0);
      guideCtx.restore();

      guideCtx.restore();
    }

    // --- Universal Safe Zone (Center Box) ---
    if (state.guides.safeZone) {
      guideCtx.save();
      guideCtx.strokeStyle = 'rgba(16, 185, 129, ' + opacity + ')';
      guideCtx.lineWidth = 3;
      guideCtx.setLineDash([12, 8]);

      // Bounding box
      guideCtx.strokeRect(SAFE_ZONE.x, SAFE_ZONE.y, SAFE_ZONE.width, SAFE_ZONE.height);

      // Corner brackets for professional feel
      guideCtx.setLineDash([]);
      guideCtx.lineWidth = 5;
      const bracketLen = 30;

      // Top-Left
      guideCtx.beginPath();
      guideCtx.moveTo(SAFE_ZONE.x, SAFE_ZONE.y + bracketLen);
      guideCtx.lineTo(SAFE_ZONE.x, SAFE_ZONE.y);
      guideCtx.lineTo(SAFE_ZONE.x + bracketLen, SAFE_ZONE.y);
      guideCtx.stroke();

      // Top-Right
      guideCtx.beginPath();
      guideCtx.moveTo(SAFE_ZONE.x + SAFE_ZONE.width - bracketLen, SAFE_ZONE.y);
      guideCtx.lineTo(SAFE_ZONE.x + SAFE_ZONE.width, SAFE_ZONE.y);
      guideCtx.lineTo(SAFE_ZONE.x + SAFE_ZONE.width, SAFE_ZONE.y + bracketLen);
      guideCtx.stroke();

      // Bottom-Left
      guideCtx.beginPath();
      guideCtx.moveTo(SAFE_ZONE.x, SAFE_ZONE.y + SAFE_ZONE.height - bracketLen);
      guideCtx.lineTo(SAFE_ZONE.x, SAFE_ZONE.y + SAFE_ZONE.height);
      guideCtx.lineTo(SAFE_ZONE.x + bracketLen, SAFE_ZONE.y + SAFE_ZONE.height);
      guideCtx.stroke();

      // Bottom-Right
      guideCtx.beginPath();
      guideCtx.moveTo(SAFE_ZONE.x + SAFE_ZONE.width - bracketLen, SAFE_ZONE.y + SAFE_ZONE.height);
      guideCtx.lineTo(SAFE_ZONE.x + SAFE_ZONE.width, SAFE_ZONE.y + SAFE_ZONE.height);
      guideCtx.lineTo(SAFE_ZONE.x + SAFE_ZONE.width, SAFE_ZONE.y + SAFE_ZONE.height - bracketLen);
      guideCtx.stroke();

      // Badge in center top
      const badgeText = '✨ UNIVERSAL SAFE ZONE (1280 × 624 px) — Visible on All Screens';
      guideCtx.font = '700 15px Inter, sans-serif';
      const textWidth = guideCtx.measureText(badgeText).width;
      const badgeX = (CANVAS_WIDTH - textWidth - 36) / 2;
      const badgeY = SAFE_ZONE.y + 12;

      guideCtx.fillStyle = 'rgba(16, 185, 129, ' + (opacity * 0.95) + ')';
      guideCtx.beginPath();
      guideCtx.roundRect(badgeX, badgeY, textWidth + 36, 32, 16);
      guideCtx.fill();

      guideCtx.fillStyle = '#ffffff';
      guideCtx.textAlign = 'left';
      guideCtx.fillText(badgeText, badgeX + 18, badgeY + 22);

      guideCtx.restore();
    }

    // --- Rule of Thirds ---
    if (state.guides.ruleOfThirds) {
      guideCtx.save();
      guideCtx.strokeStyle = 'rgba(255, 255, 255, ' + (opacity * 0.3) + ')';
      guideCtx.lineWidth = 1;
      guideCtx.setLineDash([4, 4]);

      // Vertical thirds
      const wThird = CANVAS_WIDTH / 3;
      guideCtx.beginPath();
      guideCtx.moveTo(wThird, 0);
      guideCtx.lineTo(wThird, CANVAS_HEIGHT);
      guideCtx.moveTo(wThird * 2, 0);
      guideCtx.lineTo(wThird * 2, CANVAS_HEIGHT);
      guideCtx.stroke();

      // Horizontal thirds
      const hThird = CANVAS_HEIGHT / 3;
      guideCtx.beginPath();
      guideCtx.moveTo(0, hThird);
      guideCtx.lineTo(CANVAS_WIDTH, hThird);
      guideCtx.moveTo(0, hThird * 2);
      guideCtx.lineTo(CANVAS_WIDTH, hThird * 2);
      guideCtx.stroke();

      guideCtx.restore();
    }

    // --- Profile Picture Avatars Overlay ---
    if (state.guides.avatarMode !== 'none') {
      const mode = state.guides.avatarMode;

      // 1. Desktop Profile (Bottom-left circular overlap)
      if (mode === 'both' || mode === 'personal' || mode === 'page') {
        const desktopAvatarR = 120; // 240px diameter at 2x
        const desktopAvatarX = SAFE_ZONE.x + 140;
        const desktopAvatarY = CANVAS_HEIGHT - DESKTOP_CROP_TOP + 10;

        guideCtx.save();
        guideCtx.fillStyle = 'rgba(30, 41, 59, ' + (opacity * 0.85) + ')';
        guideCtx.strokeStyle = 'rgba(59, 130, 246, ' + opacity + ')';
        guideCtx.lineWidth = 3;
        guideCtx.beginPath();
        guideCtx.arc(desktopAvatarX, desktopAvatarY, desktopAvatarR, 0, Math.PI * 2);
        guideCtx.fill();
        guideCtx.stroke();

        guideCtx.fillStyle = '#ffffff';
        guideCtx.font = '600 14px Inter, sans-serif';
        guideCtx.textAlign = 'center';
        guideCtx.fillText('Desktop Avatar Overlap', desktopAvatarX, desktopAvatarY - 50);
        guideCtx.restore();
      }

      // 2. Mobile Profile (Centered bottom circular overlap)
      if (mode === 'both' || mode === 'personal') {
        const mobileAvatarR = 110;
        const mobileAvatarX = CANVAS_WIDTH / 2;
        const mobileAvatarY = CANVAS_HEIGHT - 20;

        guideCtx.save();
        guideCtx.fillStyle = 'rgba(30, 41, 59, ' + (opacity * 0.85) + ')';
        guideCtx.strokeStyle = 'rgba(236, 72, 153, ' + opacity + ')';
        guideCtx.lineWidth = 3;
        guideCtx.beginPath();
        guideCtx.arc(mobileAvatarX, mobileAvatarY, mobileAvatarR, 0, Math.PI * 2);
        guideCtx.fill();
        guideCtx.stroke();

        guideCtx.fillStyle = '#ffffff';
        guideCtx.font = '600 14px Inter, sans-serif';
        guideCtx.textAlign = 'center';
        guideCtx.fillText('Mobile Avatar Overlap', mobileAvatarX, mobileAvatarY - 50);
        guideCtx.restore();
      }
    }
  }

  // Draw semi-transparent diagonal stripes on cutoff areas
  function drawStripedZone(ctx, x, y, width, height, bgColor, stripeColor) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 2;
    const step = 20;
    for (let i = -height; i < width + height; i += step) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + height, y + height);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Real-time Simulator Canvases Syncing ---
  function setupSimulatorCanvases() {
    // Desktop: 1640 x 624
    elements.desktopPreviewCanvas.width = CANVAS_WIDTH;
    elements.desktopPreviewCanvas.height = DESKTOP_VISIBLE_HEIGHT;

    // Mobile: 1280 x 720
    elements.mobilePreviewCanvas.width = MOBILE_VISIBLE_WIDTH;
    elements.mobilePreviewCanvas.height = CANVAS_HEIGHT;

    // Dual:
    elements.dualDesktopCanvas.width = CANVAS_WIDTH;
    elements.dualDesktopCanvas.height = DESKTOP_VISIBLE_HEIGHT;
    elements.dualMobileCanvas.width = MOBILE_VISIBLE_WIDTH;
    elements.dualMobileCanvas.height = CANVAS_HEIGHT;
  }

  function syncPreviews() {
    // 1. Generate full composite (bg + main) without guides
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = CANVAS_WIDTH;
    compositeCanvas.height = CANVAS_HEIGHT;
    const compCtx = compositeCanvas.getContext('2d');

    compCtx.drawImage(elements.bgCanvas, 0, 0);
    compCtx.drawImage(elements.mainCanvas, 0, 0);

    // 2. Desktop Preview: crop top 48px, height 624px
    const dCtx = elements.desktopPreviewCanvas.getContext('2d');
    dCtx.clearRect(0, 0, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT);
    dCtx.drawImage(
      compositeCanvas,
      0, DESKTOP_CROP_TOP, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT,
      0, 0, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT
    );

    // 3. Mobile Preview: crop sides 180px, width 1280px
    const mCtx = elements.mobilePreviewCanvas.getContext('2d');
    mCtx.clearRect(0, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT);
    mCtx.drawImage(
      compositeCanvas,
      MOBILE_CROP_SIDE, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT,
      0, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT
    );

    // 4. Dual View previews
    const dualDCtx = elements.dualDesktopCanvas.getContext('2d');
    dualDCtx.clearRect(0, 0, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT);
    dualDCtx.drawImage(elements.desktopPreviewCanvas, 0, 0);

    const dualMCtx = elements.dualMobileCanvas.getContext('2d');
    dualMCtx.clearRect(0, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT);
    dualMCtx.drawImage(elements.mobilePreviewCanvas, 0, 0);
  }

  // --- Transform Helpers ---
  function fitToCover() {
    if (!state.image) return;
    const scaleX = CANVAS_WIDTH / state.image.width;
    const scaleY = CANVAS_HEIGHT / state.image.height;
    state.scale = Math.max(scaleX, scaleY);
    state.x = CANVAS_WIDTH / 2;
    state.y = CANVAS_HEIGHT / 2;
    updateZoomSlider();
  }

  function fitToSafeZone() {
    if (!state.image) return;
    const scaleX = SAFE_ZONE.width / state.image.width;
    const scaleY = SAFE_ZONE.height / state.image.height;
    state.scale = Math.min(scaleX, scaleY);
    state.x = CANVAS_WIDTH / 2;
    state.y = CANVAS_HEIGHT / 2;
    updateZoomSlider();
  }

  function centerImage() {
    state.x = CANVAS_WIDTH / 2;
    state.y = CANVAS_HEIGHT / 2;
    renderAll();
  }

  function resetTransforms() {
    state.rotation = 0;
    state.flipH = 1;
    state.flipV = 1;
    fitToCover();
    renderAll();
    showToast('Transforms reset to cover');
  }

  function updateZoomSlider() {
    const pct = Math.round(state.scale * 100);
    elements.zoomSlider.value = Math.min(400, Math.max(20, pct));
    elements.zoomVal.textContent = pct + '%';
  }

  // --- Pointer & Touch Dragging on Canvas ---
  function setupDragging() {
    const wrapper = elements.canvasWrapper;

    wrapper.addEventListener('pointerdown', (e) => {
      // Primary button only
      if (e.button !== 0) return;
      state.isDragging = true;
      wrapper.classList.add('dragging');
      wrapper.setPointerCapture(e.pointerId);

      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.initialImageX = state.x;
      state.initialImageY = state.y;
    });

    wrapper.addEventListener('pointermove', (e) => {
      if (!state.isDragging) return;

      const rect = wrapper.getBoundingClientRect();
      const canvasScaleFactor = CANVAS_WIDTH / rect.width;

      const dx = (e.clientX - state.dragStartX) * canvasScaleFactor;
      const dy = (e.clientY - state.dragStartY) * canvasScaleFactor;

      state.x = state.initialImageX + dx;
      state.y = state.initialImageY + dy;

      renderAll();
    });

    const stopDrag = (e) => {
      if (state.isDragging) {
        state.isDragging = false;
        wrapper.classList.remove('dragging');
        try {
          if (wrapper.hasPointerCapture(e.pointerId)) {
            wrapper.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}
      }
    };

    wrapper.addEventListener('pointerup', stopDrag);
    wrapper.addEventListener('pointercancel', stopDrag);

    // Mouse wheel zoom centered on cursor
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = wrapper.getBoundingClientRect();
      const cursorX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      const cursorY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newScale = Math.min(4.0, Math.max(0.2, state.scale * zoomFactor));

      // Zoom towards cursor
      state.x = cursorX - (cursorX - state.x) * (newScale / state.scale);
      state.y = cursorY - (cursorY - state.y) * (newScale / state.scale);
      state.scale = newScale;

      updateZoomSlider();
      renderAll();
    }, { passive: false });
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    setupDragging();

    // Source Mode Toggle (Upload vs AI)
    let selectedStyle = 'photorealistic';

    elements.sourceUploadTab.addEventListener('click', () => {
      elements.sourceUploadTab.classList.add('active');
      elements.sourceUploadTab.setAttribute('aria-selected', 'true');
      elements.sourceAiTab.classList.remove('active');
      elements.sourceAiTab.setAttribute('aria-selected', 'false');
      elements.uploadPane.classList.remove('hidden');
      elements.aiGenPane.classList.add('hidden');
    });

    elements.sourceAiTab.addEventListener('click', () => {
      elements.sourceAiTab.classList.add('active');
      elements.sourceAiTab.setAttribute('aria-selected', 'true');
      elements.sourceUploadTab.classList.remove('active');
      elements.sourceUploadTab.setAttribute('aria-selected', 'false');
      elements.aiGenPane.classList.remove('hidden');
      elements.uploadPane.classList.add('hidden');
    });

    // Style chips
    elements.styleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        elements.styleChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedStyle = chip.getAttribute('data-style');
      });
    });

    // Idea buttons
    elements.ideaButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.aiPromptInput.value = btn.getAttribute('data-idea');
        elements.aiPromptInput.focus();
      });
    });

    // Generate AI Cover
    elements.generateAiBtn.addEventListener('click', async () => {
      const userPrompt = elements.aiPromptInput.value.trim();
      if (!userPrompt) {
        showToast('Please type a prompt description first!');
        elements.aiPromptInput.focus();
        return;
      }

      // UI Loading state
      elements.generateAiBtn.disabled = true;
      elements.aiLoadingSpinner.classList.remove('hidden');
      elements.aiStatusText.textContent = 'Generating high-res Facebook cover...';
      showToast('Generating AI image, please wait ~3-5 seconds...');

      try {
        const fullPrompt = `${userPrompt}, style: ${selectedStyle}, banner layout, high quality, 8k resolution, cinematic lighting, sharp details`;
        const randomSeed = Math.floor(Math.random() * 999999);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1640&height=720&nologo=true&seed=${randomSeed}`;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load generated image'));
          img.src = imageUrl;
        });

        setImage(img);
        elements.aiStatusText.textContent = '✨ Cover generated & placed on canvas!';
        showToast('AI Cover generated successfully!');
      } catch (err) {
        console.error(err);
        elements.aiStatusText.textContent = 'Generation failed. Please try again or rephrase prompt.';
        showToast('Error generating image. Please try again.');
      } finally {
        elements.generateAiBtn.disabled = false;
        elements.aiLoadingSpinner.classList.add('hidden');
      }
    });

    // File Input & Drag/Drop
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadFile(e.target.files[0]);
      }
    });

    // Drag-over styling
    ['dragenter', 'dragover'].forEach(name => {
      elements.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      elements.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
      });
    });

    elements.dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });

    // Whole window drop support
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });

    // Clipboard paste support (Ctrl+V)
    window.addEventListener('paste', (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const blob = item.getAsFile();
          loadFile(blob);
          showToast('Image pasted from clipboard!');
          break;
        }
      }
    });

    // Sample image buttons
    elements.sampleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-sample');
        loadSampleImage(type);
        showToast(`Loaded ${type} sample!`);
      });
    });

    // Zoom Controls
    elements.zoomSlider.addEventListener('input', (e) => {
      state.scale = parseInt(e.target.value, 10) / 100;
      elements.zoomVal.textContent = e.target.value + '%';
      renderAll();
    });

    elements.zoomInBtn.addEventListener('click', () => {
      state.scale = Math.min(4.0, state.scale + 0.1);
      updateZoomSlider();
      renderAll();
    });

    elements.zoomOutBtn.addEventListener('click', () => {
      state.scale = Math.max(0.2, state.scale - 0.1);
      updateZoomSlider();
      renderAll();
    });

    // Transforms
    elements.fitCoverBtn.addEventListener('click', () => {
      fitToCover();
      renderAll();
      showToast('Fitted to full canvas');
    });

    elements.fitSafeBtn.addEventListener('click', () => {
      fitToSafeZone();
      renderAll();
      showToast('Fitted within Universal Safe Zone');
    });

    elements.centerImageBtn.addEventListener('click', centerImage);
    elements.resetTransformBtn.addEventListener('click', resetTransforms);

    elements.rotateLeftBtn.addEventListener('click', () => {
      state.rotation = (state.rotation - 90 + 360) % 360;
      renderAll();
    });

    elements.rotateRightBtn.addEventListener('click', () => {
      state.rotation = (state.rotation + 90) % 360;
      renderAll();
    });

    elements.flipHBtn.addEventListener('click', () => {
      state.flipH *= -1;
      renderAll();
    });

    elements.flipVBtn.addEventListener('click', () => {
      state.flipV *= -1;
      renderAll();
    });

    // Background type
    elements.bgTypeSelect.addEventListener('change', (e) => {
      state.bgType = e.target.value;
      if (state.bgType === 'color') {
        elements.bgColorRow.classList.remove('hidden');
      } else {
        elements.bgColorRow.classList.add('hidden');
      }
      renderAll();
    });

    elements.bgColorPicker.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      elements.bgColorHex.textContent = e.target.value.toUpperCase();
      renderAll();
    });

    // Safe Zone Guides
    elements.showSafeZoneCheck.addEventListener('change', (e) => {
      state.guides.safeZone = e.target.checked;
      renderGuides();
    });

    elements.showDesktopCropCheck.addEventListener('change', (e) => {
      state.guides.desktopCrop = e.target.checked;
      renderGuides();
    });

    elements.showMobileCropCheck.addEventListener('change', (e) => {
      state.guides.mobileCrop = e.target.checked;
      renderGuides();
    });

    elements.showThirdsCheck.addEventListener('change', (e) => {
      state.guides.ruleOfThirds = e.target.checked;
      renderGuides();
    });

    elements.avatarModeSelect.addEventListener('change', (e) => {
      state.guides.avatarMode = e.target.value;
      renderGuides();
    });

    elements.overlayOpacitySlider.addEventListener('input', (e) => {
      state.guides.opacity = parseInt(e.target.value, 10) / 100;
      elements.overlayOpacityVal.textContent = e.target.value + '%';
      renderGuides();
    });

    // Export Controls
    elements.resolutionSelect.addEventListener('change', (e) => {
      state.export.resolution = e.target.value;
    });

    elements.exportFormatSelect.addEventListener('change', (e) => {
      state.export.format = e.target.value;
      if (e.target.value === 'jpeg') {
        elements.jpgQualitySlider.classList.remove('hidden');
        elements.qualityLabel.classList.remove('hidden');
      } else {
        elements.jpgQualitySlider.classList.add('hidden');
        elements.qualityLabel.classList.add('hidden');
      }
    });

    elements.jpgQualitySlider.addEventListener('input', (e) => {
      state.export.quality = parseInt(e.target.value, 10) / 100;
      elements.qualityVal.textContent = e.target.value + '%';
    });

    elements.downloadBtn.addEventListener('click', downloadCover);
    elements.exportTopBtn.addEventListener('click', downloadCover);
    elements.copyClipboardBtn.addEventListener('click', copyToClipboard);

    // Tab Navigation
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Guide Modal
    elements.quickGuideBtn.addEventListener('click', () => elements.guideModal.showModal());
    elements.closeModalBtn.addEventListener('click', () => elements.guideModal.close());
    elements.gotItBtn.addEventListener('click', () => elements.guideModal.close());
    elements.guideModal.addEventListener('click', (e) => {
      if (e.target === elements.guideModal) elements.guideModal.close();
    });
  }

  // --- File Reader Helper ---
  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        showToast('Photo uploaded successfully!');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Tab Switching ---
  function switchTab(tabId) {
    state.activeTab = tabId;
    elements.tabs.forEach(t => {
      const isActive = t.getAttribute('data-tab') === tabId;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    elements.tabPanels.forEach(p => {
      p.classList.toggle('active', p.id === `panel-${tabId}`);
    });

    syncPreviews();
  }

  // --- Theme Toggle ---
  function toggleTheme() {
    const isLight = document.body.classList.toggle('theme-light');
    if (isLight) {
      document.body.classList.remove('theme-dark');
      elements.themeIconSun.classList.add('hidden');
      elements.themeIconMoon.classList.remove('hidden');
    } else {
      document.body.classList.add('theme-dark');
      elements.themeIconSun.classList.remove('hidden');
      elements.themeIconMoon.classList.add('hidden');
    }
  }

  // --- Export Pipeline ---
  function generateExportCanvas() {
    const res = state.export.resolution;
    let targetWidth = CANVAS_WIDTH;
    let targetHeight = CANVAS_HEIGHT;
    let sourceX = 0;
    let sourceY = 0;
    let sourceW = CANVAS_WIDTH;
    let sourceH = CANVAS_HEIGHT;

    if (res === '2x') {
      targetWidth = 1640;
      targetHeight = 720;
    } else if (res === '1x') {
      targetWidth = 820;
      targetHeight = 360;
    } else if (res === 'desktop') {
      targetWidth = 1640;
      targetHeight = DESKTOP_VISIBLE_HEIGHT;
      sourceY = DESKTOP_CROP_TOP;
      sourceH = DESKTOP_VISIBLE_HEIGHT;
    } else if (res === 'mobile') {
      targetWidth = MOBILE_VISIBLE_WIDTH;
      targetHeight = CANVAS_HEIGHT;
      sourceX = MOBILE_CROP_SIDE;
      sourceW = MOBILE_VISIBLE_WIDTH;
    }

    // Composite canvas (bg + main image without guides)
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = CANVAS_WIDTH;
    compositeCanvas.height = CANVAS_HEIGHT;
    const compCtx = compositeCanvas.getContext('2d');
    compCtx.drawImage(elements.bgCanvas, 0, 0);
    compCtx.drawImage(elements.mainCanvas, 0, 0);

    // Final output canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetWidth;
    exportCanvas.height = targetHeight;
    const expCtx = exportCanvas.getContext('2d');

    // High quality scaling
    expCtx.imageSmoothingEnabled = true;
    expCtx.imageSmoothingQuality = 'high';

    expCtx.drawImage(
      compositeCanvas,
      sourceX, sourceY, sourceW, sourceH,
      0, 0, targetWidth, targetHeight
    );

    return exportCanvas;
  }

  function downloadCover() {
    const exportCanvas = generateExportCanvas();
    const format = state.export.format;
    const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const quality = format === 'png' ? undefined : state.export.quality;

    exportCanvas.toBlob((blob) => {
      if (!blob) {
        showToast('Export failed. Please try again.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `facebook-cover-${exportCanvas.width}x${exportCanvas.height}.${format === 'jpeg' ? 'jpg' : format}`;
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Downloaded: ${filename}`);
    }, mimeType, quality);
  }

  async function copyToClipboard() {
    const exportCanvas = generateExportCanvas();
    try {
      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Copied to clipboard as PNG!');
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('Clipboard copy not supported by browser. Use Download instead.');
    }
  }

  // --- Kickoff ---
  init();

})();
