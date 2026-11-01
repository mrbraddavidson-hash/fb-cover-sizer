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
    fitMode: 'contain', // 'contain' | 'cover' | 'safe'
    zoom: 1.0, // 0.3 to 3.0 (1.0 = 100% of chosen fit mode)
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
      avatarMode: 'both', // 'both' by default so profile circles are always visible
      opacity: 0.65
    },
    avatarImage: null,
    avatarLoaded: false,
    avatarDataUrl: null,
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
    // Canvases & Overlays
    bgCanvas: document.getElementById('bgCanvas'),
    mainCanvas: document.getElementById('mainCanvas'),
    guideCanvas: document.getElementById('guideCanvas'),
    layersOverlay: document.getElementById('layersOverlay'),
    toggleLayersBtn: document.getElementById('toggleLayersBtn'),
    restoreLayersBtn: document.getElementById('restoreLayersBtn'),
    resetLayersBtn: document.getElementById('resetLayersBtn'),
    restoreAllElementsBtn: document.getElementById('restoreAllElementsBtn'),
    clearAllElementsBtn: document.getElementById('clearAllElementsBtn'),
    layersManagerList: document.getElementById('layersManagerList'),
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

    // Transforms & Sizing
    fitContainBtn: document.getElementById('fitContainBtn'),
    fitCoverBtn: document.getElementById('fitCoverBtn'),
    fitSafeBtn: document.getElementById('fitSafeBtn'),
    alignTopBtn: document.getElementById('alignTopBtn'),
    alignBottomBtn: document.getElementById('alignBottomBtn'),
    centerImageBtn: document.getElementById('centerImageBtn'),
    imageAspectBadge: document.getElementById('imageAspectBadge'),
    statImgDimensions: document.getElementById('statImgDimensions'),
    statFitMode: document.getElementById('statFitMode'),
    zoomSlider: document.getElementById('zoomSlider'),
    zoomVal: document.getElementById('zoomVal'),
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    rotateLeftBtn: document.getElementById('rotateLeftBtn'),
    rotateRightBtn: document.getElementById('rotateRightBtn'),
    flipHBtn: document.getElementById('flipHBtn'),
    flipVBtn: document.getElementById('flipVBtn'),

    // Background
    bgTypeSelect: document.getElementById('bgTypeSelect'),
    bgColorRow: document.getElementById('bgColorRow'),
    bgColorPicker: document.getElementById('bgColorPicker'),
    bgColorHex: document.getElementById('bgColorHex'),

    // Guides & Avatars
    showSafeZoneCheck: document.getElementById('showSafeZoneCheck'),
    showDesktopCropCheck: document.getElementById('showDesktopCropCheck'),
    showMobileCropCheck: document.getElementById('showMobileCropCheck'),
    showThirdsCheck: document.getElementById('showThirdsCheck'),
    avatarModeSelect: document.getElementById('avatarModeSelect'),
    uploadAvatarBtn: document.getElementById('uploadAvatarBtn'),
    avatarFileInput: document.getElementById('avatarFileInput'),
    avatarThumbPreview: document.getElementById('avatarThumbPreview'),
    avatarThumbImg: document.getElementById('avatarThumbImg'),
    removeAvatarBtn: document.getElementById('removeAvatarBtn'),
    desktopAvatar: document.getElementById('desktopAvatar'),
    mobileAvatar: document.querySelector('.fb-mobile-avatar'),
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
    toast: document.getElementById('toast'),
    layersOverlay: document.getElementById('layersOverlay'),
    resetLayersBtn: document.getElementById('resetLayersBtn')
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
    setupLayerDragging();
    setupSimulatorCanvases();
    loadSampleImage('davidson');
  }

  // Generate procedural sample images so the user sees a rich design immediately
  function loadSampleImage(type) {
    if (type === 'davidson') {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        if (elements.layersOverlay) elements.layersOverlay.classList.remove('hidden');
        if (elements.toggleLayersBtn) {
          elements.toggleLayersBtn.textContent = '✥ Moveable Sections: ON';
          elements.toggleLayersBtn.classList.add('btn-primary');
          elements.toggleLayersBtn.classList.remove('btn-secondary');
        }
        showToast('Loaded Davidson Digital Design — all sections are moveable!');
      };
      img.onerror = () => {
        // Procedurally generate high-tech cyber background so it works even offline
        const off = document.createElement('canvas');
        off.width = CANVAS_WIDTH;
        off.height = CANVAS_HEIGHT;
        const octx = off.getContext('2d');

        octx.fillStyle = '#05070d';
        octx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const glowL = octx.createRadialGradient(290, 150, 20, 290, 150, 420);
        glowL.addColorStop(0, 'rgba(0, 210, 255, 0.35)');
        glowL.addColorStop(0.5, 'rgba(0, 140, 255, 0.12)');
        glowL.addColorStop(1, 'rgba(0, 0, 0, 0)');
        octx.fillStyle = glowL;
        octx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const glowR = octx.createRadialGradient(1350, 280, 20, 1350, 280, 520);
        glowR.addColorStop(0, 'rgba(147, 51, 234, 0.32)');
        glowR.addColorStop(0.5, 'rgba(79, 70, 229, 0.10)');
        glowR.addColorStop(1, 'rgba(0, 0, 0, 0)');
        octx.fillStyle = glowR;
        octx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        octx.strokeStyle = 'rgba(0, 210, 255, 0.08)';
        octx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 40) {
          octx.beginPath();
          octx.moveTo(x, 0);
          octx.lineTo(x, CANVAS_HEIGHT);
          octx.stroke();
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
          octx.beginPath();
          octx.moveTo(0, y);
          octx.lineTo(CANVAS_WIDTH, y);
          octx.stroke();
        }

        const procImg = new Image();
        procImg.onload = () => {
          setImage(procImg);
          if (elements.layersOverlay) elements.layersOverlay.classList.remove('hidden');
          showToast('Loaded Davidson Digital Design — all sections are moveable!');
        };
        procImg.src = off.toDataURL();
      };
      img.src = 'cyber_background.png';
      return;
    }

    if (elements.layersOverlay) elements.layersOverlay.classList.add('hidden');

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

      // Core typography placed strategically in the Safe Zone (High enough to avoid all avatar overlaps!)
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 58px Inter, sans-serif';
      ctx.fillText('NEXUS CREATIVE LAB', 300, 230);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 28px Inter, sans-serif';
      ctx.fillText('Digital Products & Strategic Growth', 300, 280);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 22px Inter, sans-serif';
      ctx.fillText('Safe Zone Guaranteed: Perfectly positioned for Mobile & PC', 300, 325);

      // Button badge mockup
      ctx.fillStyle = '#1877F2';
      ctx.beginPath();
      ctx.roundRect(300, 365, 210, 52, 26);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 20px Inter, sans-serif';
      ctx.fillText('Visit Website →', 330, 398);

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

  function getBaseDimensions() {
    if (!state.image) return { w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
    const imgW = state.image.width;
    const imgH = state.image.height;

    if (state.fitMode === 'contain') {
      // Scales so 100% of the photo fits inside the 1640x720 canvas without any edges cut off
      const scale = Math.min(CANVAS_WIDTH / imgW, CANVAS_HEIGHT / imgH);
      return { w: imgW * scale, h: imgH * scale };
    } else if (state.fitMode === 'safe') {
      // Scales so photo fits inside the 1280px wide zone and above the 2 profile avatar circles (height ~410px)
      const avatarClearHeight = 410; // clears Desktop (Y=455) and Mobile (Y=470) circles
      const scale = Math.min(SAFE_ZONE.width / imgW, avatarClearHeight / imgH);
      return { w: imgW * scale, h: imgH * scale };
    } else {
      // 'cover': fills the 1640x720 canvas completely
      const scale = Math.max(CANVAS_WIDTH / imgW, CANVAS_HEIGHT / imgH);
      return { w: imgW * scale, h: imgH * scale };
    }
  }

  function setImage(img) {
    state.image = img;
    state.imageLoaded = true;

    // Detect aspect ratio
    const aspect = img.width / img.height;
    let aspectName = '';
    if (Math.abs(aspect - (16 / 9)) < 0.05) aspectName = '16:9';
    else if (Math.abs(aspect - (4 / 3)) < 0.05) aspectName = '4:3';
    else if (Math.abs(aspect - 1.0) < 0.05) aspectName = '1:1 Square';
    else if (Math.abs(aspect - (205 / 78)) < 0.08) aspectName = 'FB Desktop 2.63:1';
    else if (Math.abs(aspect - (1640 / 720)) < 0.08) aspectName = 'FB Standard 2.28:1';
    else aspectName = `${aspect.toFixed(2)}:1`;

    if (elements.imageAspectBadge) {
      elements.imageAspectBadge.textContent = aspectName;
    }
    if (elements.statImgDimensions) {
      elements.statImgDimensions.textContent = `${img.width} × ${img.height} px (${aspectName})`;
    }

    // Smart default: If the image is already a wide banner (~2.28:1), default to cover.
    // If it's a standard camera photo (4:3, 1:1, or 16:9), default to 'contain' so nothing is cut off!
    if (Math.abs(aspect - (1640 / 720)) < 0.1) {
      setFitMode('cover', false);
    } else {
      setFitMode('contain', false);
    }

    updateZoomSlider();
    renderAll();
    syncPreviews();
  }

  function setFitMode(mode, triggerRender = true) {
    state.fitMode = mode;
    state.zoom = 1.0;
    state.x = CANVAS_WIDTH / 2;
    // Elevate to Y=260 in safe mode so the image is centered above the 2 profile avatar circles
    state.y = mode === 'safe' ? 260 : CANVAS_HEIGHT / 2;

    // Update active button state
    if (elements.fitContainBtn) elements.fitContainBtn.classList.toggle('active', mode === 'contain');
    if (elements.fitCoverBtn) elements.fitCoverBtn.classList.toggle('active', mode === 'cover');
    if (elements.fitSafeBtn) elements.fitSafeBtn.classList.toggle('active', mode === 'safe');

    if (elements.statFitMode) {
      const modeNames = {
        contain: 'Fit Whole Photo (No Cutoff)',
        cover: 'Fill Full Canvas',
        safe: 'Fit Inside Safe Zone'
      };
      elements.statFitMode.textContent = modeNames[mode] || mode;
    }

    updateZoomSlider();
    if (triggerRender) {
      renderAll();
    }
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
      const scale = Math.max(CANVAS_WIDTH / state.image.width, CANVAS_HEIGHT / state.image.height) * 1.25;
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
      vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
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
    mainCtx.scale(state.zoom * state.flipH, state.zoom * state.flipV);

    const base = getBaseDimensions();
    mainCtx.drawImage(state.image, -base.w / 2, -base.h / 2, base.w, base.h);

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
      const isDesktop = mode === 'both' || mode === 'desktop' || mode === 'personal';
      const isMobile = mode === 'both' || mode === 'mobile' || mode === 'page';

      // 1. Desktop Profile (Bottom-left circular overlap)
      if (isDesktop) {
        const desktopAvatarR = 135;
        const desktopAvatarX = SAFE_ZONE.x + 140; // 320px
        const desktopAvatarY = 590; // Overlaps bottom edge of desktop cover (624 visible, y=48..672)

        drawAvatarGuide(
          guideCtx,
          desktopAvatarX,
          desktopAvatarY,
          desktopAvatarR,
          'Desktop Avatar Overlap (PC)',
          '#38bdf8',
          'Covers this area on PC & Mac'
        );
      }

      // 2. Mobile Profile (Centered bottom circular overlap)
      if (isMobile) {
        const mobileAvatarR = 110;
        const mobileAvatarX = CANVAS_WIDTH / 2; // 820px
        const mobileAvatarY = 580; // Overlaps bottom center

        drawAvatarGuide(
          guideCtx,
          mobileAvatarX,
          mobileAvatarY,
          mobileAvatarR,
          'Mobile Avatar Overlap (Phone)',
          '#ec4899',
          'Covers this area on smartphones'
        );
      }
    }
    syncPreviews();
  }

  // Draw clean profile circle overlay without any floating badges or text over it
  function drawAvatarGuide(ctx, x, y, r, label, color, subtitle) {
    ctx.save();

    // Subtle drop shadow matching realistic Facebook avatar
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Outer circular boundary fill
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fill();

    // Crisp high-contrast avatar border (like Facebook's real white border)
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Inner subtle guide ring
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = color || 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Custom avatar image OR clean silhouette icon inside circle
    if (state.avatarLoaded && state.avatarImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r - 4, 0, Math.PI * 2);
      ctx.clip();
      const img = state.avatarImage;
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    } else {
      // Clean silhouette icon inside circle
      const headR = r * 0.32;
      const headY = y - r * 0.16;
      ctx.beginPath();
      ctx.arc(x, headY, headR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();

      // Shoulders / chest
      const bodyW = r * 0.62;
      const bodyTop = y + r * 0.22;
      const bodyBottom = y + r * 0.72;
      ctx.beginPath();
      ctx.moveTo(x - bodyW, bodyBottom);
      ctx.quadraticCurveTo(x - bodyW * 0.7, bodyTop, x, bodyTop);
      ctx.quadraticCurveTo(x + bodyW * 0.7, bodyTop, x + bodyW, bodyBottom);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
    }

    ctx.restore();
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

  const emblemImg = new Image();
  emblemImg.src = 'assets/emblem_clean_alpha.png';

  // Draw moveable text, logo, and telemetry layers on any canvas context
  function drawMoveableLayers(ctx) {
    if (!elements.layersOverlay || elements.layersOverlay.classList.contains('hidden')) return;

    function isLayerActive(el) {
      return el && !el.classList.contains('deleted') && el.style.display !== 'none';
    }

    // 1. Emblem & Brand Title
    const emblemEl = document.getElementById('layer-emblem');
    if (isLayerActive(emblemEl)) {
      const x = parseInt(emblemEl.dataset.x, 10) || 210;
      const y = parseInt(emblemEl.dataset.y, 10) || 70;
      if (emblemImg.complete && emblemImg.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 210, 255, 0.7)';
        ctx.shadowBlur = 16;
        ctx.drawImage(emblemImg, x, y, 64, 64);
        ctx.restore();
      } else {
        // High-tech vector emblem fallback
        ctx.save();
        ctx.shadowColor = 'rgba(0, 210, 255, 0.7)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(8, 20, 36, 0.9)';
        ctx.strokeStyle = '#00d2ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + 32, y + 32, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#00d2ff';
        ctx.font = '900 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('D3', x + 32, y + 32);
        ctx.restore();
      }
      ctx.save();
      ctx.font = '800 28px Bahnschrift, "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('DAVIDSON ', x + 82, y + 38);
      const dw = ctx.measureText('DAVIDSON ').width;
      ctx.fillStyle = '#00d2ff';
      ctx.fillText('DIGITAL DESIGN', x + 82 + dw, y + 38);

      ctx.font = '600 13px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#b9cde1';
      ctx.fillText('LOCAL WEBSITES • SIMPLE AI • HONEST SERVICE', x + 82, y + 58);
      ctx.restore();
    }

    // 2. Top-Right HUD Module
    const hudEl = document.getElementById('layer-hud');
    if (isLayerActive(hudEl)) {
      const x = parseInt(hudEl.dataset.x, 10) || 1040;
      const y = parseInt(hudEl.dataset.y, 10) || 64;
      const w = 390;
      const h = 72;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 16, 28, 0.9)';
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x + 18, y + 26, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 13px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#00d2ff';
      ctx.fillText('SYS_STATUS: ONLINE // PERTH NODE', x + 30, y + 30);

      ctx.font = '500 12px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('LISTOWEL, ONTARIO', x + 16, y + 54);
      ctx.fillStyle = '#a855f7';
      ctx.fillText('RTT: 12ms', x + 300, y + 54);
      ctx.restore();
    }

    // 3. Headline
    const hlEl = document.getElementById('layer-headline');
    if (isLayerActive(hlEl)) {
      const x = parseInt(hlEl.dataset.x, 10) || 210;
      const y = parseInt(hlEl.dataset.y, 10) || 140;
      ctx.save();
      ctx.font = '600 13px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#00d2ff';
      ctx.fillText('[ 01 // ARCHITECTURE & INTELLIGENCE ]', x, y + 14);

      ctx.font = '800 36px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('High-Performance Web Platforms.', x, y + 54);
      ctx.fillStyle = '#00beff';
      ctx.fillText('Autonomous AI Systems.', x, y + 96);
      ctx.restore();
    }

    // 4. Sub-lead
    const subEl = document.getElementById('layer-sublead');
    if (isLayerActive(subEl)) {
      const x = parseInt(subEl.dataset.x, 10) || 210;
      const y = parseInt(subEl.dataset.y, 10) || 278;
      ctx.save();
      ctx.font = '400 18px "Segoe UI", sans-serif';
      ctx.fillStyle = '#cde0f0';
      ctx.fillText('Engineered for pure speed, local organic dominance, and automated lead workflows.', x, y + 18);
      ctx.restore();
    }

    // 5. Telemetry Chips
    const chipsEl = document.getElementById('layer-chips');
    if (isLayerActive(chipsEl)) {
      const startX = parseInt(chipsEl.dataset.x, 10) || 210;
      const y = parseInt(chipsEl.dataset.y, 10) || 335;
      const chips = [
        { tag: '⚡ 99+ SPEED', detail: 'Zero bloat · Sub-second TTFB', col: '#00e6ff', border: 'rgba(0, 210, 255, 0.45)', bg: 'rgba(10, 22, 38, 0.9)' },
        { tag: '🤖 CUSTOM AI', detail: 'Autonomous workflows & bots', col: '#c084fc', border: 'rgba(168, 85, 247, 0.45)', bg: 'rgba(20, 14, 38, 0.9)' },
        { tag: '🎯 LOCAL RANK', detail: 'Top 3-Pack SEO in Perth & Minto', col: '#ffffff', border: 'rgba(0, 210, 255, 0.35)', bg: 'rgba(10, 18, 30, 0.9)' }
      ];
      const chipW = 270;
      const chipH = 58;
      chips.forEach((c, i) => {
        const cx = startX + i * (chipW + 14);
        ctx.save();
        ctx.fillStyle = c.bg;
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx, y, chipW, chipH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.col;
        ctx.fillRect(cx + 3, y + 6, 3, chipH - 12);

        ctx.font = '700 13px "JetBrains Mono", Consolas, monospace';
        ctx.fillStyle = c.col;
        ctx.fillText(c.tag, cx + 14, y + 24);

        ctx.font = '500 11px "JetBrains Mono", Consolas, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(c.detail, cx + 14, y + 44);
        ctx.restore();
      });
    }

    // 6. Terminal Module
    const termEl = document.getElementById('layer-terminal');
    if (isLayerActive(termEl)) {
      const x = parseInt(termEl.dataset.x, 10) || 1090;
      const y = parseInt(termEl.dataset.y, 10) || 330;
      const w = 340;
      const h = 64;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 14, 25, 0.95)';
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 11px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#00b4ff';
      ctx.fillText('root@davidson:~$ ./init_project', x + 14, y + 22);

      ctx.font = '700 16px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('davidsondigitaldesign.com', x + 14, y + 46);

      const curX = x + 14 + ctx.measureText('davidsondigitaldesign.com').width + 4;
      ctx.fillStyle = '#00dcff';
      ctx.fillRect(curX, y + 33, 8, 15);
      ctx.restore();
    }
  }

  // Interactive Drag & Drop, Selection & Deletion for Moveable Layers
  let selectedLayer = null;
  let deletedHistory = [];

  function deleteLayer(layer) {
    if (!layer) return;
    layer.classList.remove('selected');
    layer.classList.add('deleted');
    if (!deletedHistory.includes(layer.id)) {
      deletedHistory.push(layer.id);
    }
    updateRestoreBtnState();
    syncPreviews();

    const layerTitle = layer.querySelector('.handle-title')?.textContent?.replace('✥', '').trim() || 'Element';
    showToast(`Deleted ${layerTitle} • Click "Restore" to undo`);
  }

  function restoreLayer(layerId) {
    const layer = document.getElementById(layerId);
    if (layer) {
      layer.classList.remove('deleted');
      deletedHistory = deletedHistory.filter(id => id !== layerId);
      updateRestoreBtnState();
      syncPreviews();
    }
  }

  function restoreAllLayers() {
    document.querySelectorAll('.moveable-layer').forEach(l => {
      l.classList.remove('deleted');
    });
    deletedHistory = [];
    updateRestoreBtnState();
    if (elements.layersOverlay) elements.layersOverlay.classList.remove('hidden');
    syncPreviews();
    showToast('Restored all deleted elements');
  }

  function clearAllLayers() {
    document.querySelectorAll('.moveable-layer').forEach(l => {
      l.classList.remove('selected');
      l.classList.add('deleted');
      if (!deletedHistory.includes(l.id)) deletedHistory.push(l.id);
    });
    selectedLayer = null;
    updateRestoreBtnState();
    syncPreviews();
    showToast('All elements removed • Clean background active');
  }

  function updateRestoreBtnState() {
    const deletedCount = document.querySelectorAll('.moveable-layer.deleted').length;
    if (elements.restoreLayersBtn) {
      elements.restoreLayersBtn.textContent = `↺ Restore (${deletedCount})`;
      elements.restoreLayersBtn.style.display = deletedCount > 0 ? 'inline-flex' : 'none';
    }

    // Update checkboxes & styles in #layersManagerList
    document.querySelectorAll('.layer-item-row').forEach(row => {
      const targetId = row.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      const cb = row.querySelector('.layer-toggle-cb');
      const isDel = targetEl ? targetEl.classList.contains('deleted') : false;
      row.classList.toggle('is-deleted', isDel);
      if (cb) cb.checked = !isDel;
    });
  }

  function setupLayerDragging() {
    const layers = document.querySelectorAll('.moveable-layer');
    layers.forEach(layer => {
      let isDraggingLayer = false;
      let startClientX = 0;
      let startClientY = 0;
      let startX = 0;
      let startY = 0;

      // Click to select layer
      layer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-layer-delete')) return;
        document.querySelectorAll('.moveable-layer').forEach(l => l.classList.remove('selected'));
        layer.classList.add('selected');
        selectedLayer = layer;
      });

      // Delete buttons on layer handle and corner
      layer.querySelectorAll('.btn-layer-delete').forEach(delBtn => {
        delBtn.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
        });
        delBtn.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteLayer(layer);
        });
      });

      layer.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('.btn-layer-delete')) {
          e.stopPropagation();
          return;
        }
        e.stopPropagation();
        isDraggingLayer = true;
        layer.classList.add('dragging');

        // Select when user clicks/drags
        document.querySelectorAll('.moveable-layer').forEach(l => l.classList.remove('selected'));
        layer.classList.add('selected');
        selectedLayer = layer;

        startClientX = e.clientX;
        startClientY = e.clientY;
        startX = parseInt(layer.dataset.x, 10) || 0;
        startY = parseInt(layer.dataset.y, 10) || 0;

        try {
          layer.setPointerCapture(e.pointerId);
        } catch (_) {}
      });

      layer.addEventListener('pointermove', (e) => {
        if (!isDraggingLayer) return;
        const wrapper = elements.canvasWrapper;
        const rect = wrapper.getBoundingClientRect();
        const scale = rect.width / CANVAS_WIDTH;

        const dx = (e.clientX - startClientX) / scale;
        const dy = (e.clientY - startClientY) / scale;

        const newX = Math.round(startX + dx);
        const newY = Math.round(startY + dy);

        layer.dataset.x = newX;
        layer.dataset.y = newY;
        layer.style.left = (newX / CANVAS_WIDTH * 100) + '%';
        layer.style.top = (newY / CANVAS_HEIGHT * 100) + '%';

        syncPreviews();
      });

      const stopLayerDrag = (e) => {
        if (isDraggingLayer) {
          isDraggingLayer = false;
          layer.classList.remove('dragging');
          try {
            if (layer.hasPointerCapture(e.pointerId)) {
              layer.releasePointerCapture(e.pointerId);
            }
          } catch (_) {}
          syncPreviews();
        }
      };

      layer.addEventListener('pointerup', stopLayerDrag);
      layer.addEventListener('pointercancel', stopLayerDrag);
    });

    // Keyboard Delete (Del or Backspace)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayer) {
        e.preventDefault();
        deleteLayer(selectedLayer);
      }
    });

    // Clicking outside canvas elements deselects
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.moveable-layer') && !e.target.closest('.layer-quick-actions') && !e.target.closest('#layersManagerList')) {
        document.querySelectorAll('.moveable-layer').forEach(l => l.classList.remove('selected'));
        selectedLayer = null;
      }
    });

    // Toolbar Restore Button (Restores last deleted or all)
    if (elements.restoreLayersBtn) {
      elements.restoreLayersBtn.addEventListener('click', () => {
        if (deletedHistory.length > 0) {
          const lastId = deletedHistory.pop();
          const lastEl = document.getElementById(lastId);
          if (lastEl) {
            lastEl.classList.remove('deleted');
            updateRestoreBtnState();
            syncPreviews();
            const name = lastEl.querySelector('.handle-title')?.textContent?.replace('✥', '').trim() || 'Element';
            showToast(`Restored ${name}`);
          }
        } else {
          restoreAllLayers();
        }
      });
    }

    // Reset All button
    if (elements.resetLayersBtn) {
      elements.resetLayersBtn.addEventListener('click', () => {
        const defaults = {
          'layer-emblem': { x: 210, y: 68 },
          'layer-hud': { x: 1040, y: 64 },
          'layer-headline': { x: 210, y: 140 },
          'layer-sublead': { x: 210, y: 278 },
          'layer-chips': { x: 210, y: 335 },
          'layer-terminal': { x: 1090, y: 330 }
        };
        Object.entries(defaults).forEach(([id, coords]) => {
          const el = document.getElementById(id);
          if (el) {
            el.dataset.x = coords.x;
            el.dataset.y = coords.y;
            el.style.left = (coords.x / CANVAS_WIDTH * 100) + '%';
            el.style.top = (coords.y / CANVAS_HEIGHT * 100) + '%';
            el.classList.remove('deleted');
            el.classList.remove('selected');
          }
        });
        deletedHistory = [];
        updateRestoreBtnState();
        if (elements.layersOverlay) elements.layersOverlay.classList.remove('hidden');
        if (elements.toggleLayersBtn) {
          elements.toggleLayersBtn.textContent = '✥ Moveable Sections: ON';
          elements.toggleLayersBtn.classList.add('btn-primary');
          elements.toggleLayersBtn.classList.remove('btn-secondary');
        }
        syncPreviews();
        showToast('All sections restored and reset to default positions');
      });
    }

    // Restore All Elements button in card
    if (elements.restoreAllElementsBtn) {
      elements.restoreAllElementsBtn.addEventListener('click', restoreAllLayers);
    }

    // Clear All Elements button in card
    if (elements.clearAllElementsBtn) {
      elements.clearAllElementsBtn.addEventListener('click', clearAllLayers);
    }

    // Checkboxes in #layersManagerList
    document.querySelectorAll('.layer-toggle-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const targetId = cb.getAttribute('data-layer');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          if (cb.checked) {
            targetEl.classList.remove('deleted');
            deletedHistory = deletedHistory.filter(id => id !== targetId);
          } else {
            targetEl.classList.add('deleted');
            if (!deletedHistory.includes(targetId)) deletedHistory.push(targetId);
          }
          updateRestoreBtnState();
          syncPreviews();
        }
      });
    });

    // Delete buttons in #layersManagerList
    document.querySelectorAll('.btn-row-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-layer');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          deleteLayer(targetEl);
        }
      });
    });

    updateRestoreBtnState();
  }

  function syncPreviews() {
    // 1. Generate full composite (bg + main + moveable layers)
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = CANVAS_WIDTH;
    compositeCanvas.height = CANVAS_HEIGHT;
    const compCtx = compositeCanvas.getContext('2d');

    compCtx.drawImage(elements.bgCanvas, 0, 0);
    compCtx.drawImage(elements.mainCanvas, 0, 0);
    drawMoveableLayers(compCtx);

    const opacity = state.guides.opacity;

    // 2. Desktop Preview: crop top 48px, height 624px
    const dCtx = elements.desktopPreviewCanvas.getContext('2d');
    dCtx.clearRect(0, 0, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT);
    dCtx.drawImage(
      compositeCanvas,
      0, DESKTOP_CROP_TOP, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT,
      0, 0, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT
    );

    // Overlay Safe Zone & Cutoffs on Desktop Preview
    if (state.guides.safeZone) {
      dCtx.save();
      // Mobile cutoff side strips (0..180 and 1460..1640)
      if (state.guides.mobileCrop) {
        drawStripedZone(dCtx, 0, 0, MOBILE_CROP_SIDE, DESKTOP_VISIBLE_HEIGHT, 'rgba(6, 182, 212, ' + (opacity * 0.4) + ')', 'rgba(6, 182, 212, ' + (opacity * 0.8) + ')');
        drawStripedZone(dCtx, CANVAS_WIDTH - MOBILE_CROP_SIDE, 0, MOBILE_CROP_SIDE, DESKTOP_VISIBLE_HEIGHT, 'rgba(6, 182, 212, ' + (opacity * 0.4) + ')', 'rgba(6, 182, 212, ' + (opacity * 0.8) + ')');
        
        dCtx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, opacity + 0.35) + ')';
        dCtx.font = '600 13px Inter, sans-serif';
        dCtx.save();
        dCtx.translate(90, DESKTOP_VISIBLE_HEIGHT / 2);
        dCtx.rotate(-Math.PI / 2);
        dCtx.textAlign = 'center';
        dCtx.fillText('⚠️ CUT ON MOBILE (-180px)', 0, 0);
        dCtx.restore();

        dCtx.save();
        dCtx.translate(CANVAS_WIDTH - 90, DESKTOP_VISIBLE_HEIGHT / 2);
        dCtx.rotate(Math.PI / 2);
        dCtx.textAlign = 'center';
        dCtx.fillText('⚠️ CUT ON MOBILE (-180px)', 0, 0);
        dCtx.restore();
      }

      // Universal Safe Zone Box
      dCtx.strokeStyle = 'rgba(16, 185, 129, ' + opacity + ')';
      dCtx.lineWidth = 3;
      dCtx.setLineDash([12, 8]);
      dCtx.strokeRect(MOBILE_CROP_SIDE, 0, MOBILE_VISIBLE_WIDTH, DESKTOP_VISIBLE_HEIGHT);

      // Corner brackets
      dCtx.setLineDash([]);
      dCtx.lineWidth = 5;
      const bLen = 28;
      // Top-Left
      dCtx.beginPath();
      dCtx.moveTo(MOBILE_CROP_SIDE, bLen);
      dCtx.lineTo(MOBILE_CROP_SIDE, 0);
      dCtx.lineTo(MOBILE_CROP_SIDE + bLen, 0);
      dCtx.stroke();
      // Top-Right
      dCtx.beginPath();
      dCtx.moveTo(MOBILE_CROP_SIDE + MOBILE_VISIBLE_WIDTH - bLen, 0);
      dCtx.lineTo(MOBILE_CROP_SIDE + MOBILE_VISIBLE_WIDTH, 0);
      dCtx.lineTo(MOBILE_CROP_SIDE + MOBILE_VISIBLE_WIDTH, bLen);
      dCtx.stroke();
      // Bottom-Left
      dCtx.beginPath();
      dCtx.moveTo(MOBILE_CROP_SIDE, DESKTOP_VISIBLE_HEIGHT - bLen);
      dCtx.lineTo(MOBILE_CROP_SIDE, DESKTOP_VISIBLE_HEIGHT);
      dCtx.lineTo(MOBILE_CROP_SIDE + bLen, DESKTOP_VISIBLE_HEIGHT);
      dCtx.stroke();
      // Bottom-Right
      dCtx.beginPath();
      dCtx.moveTo(MOBILE_CROP_SIDE + MOBILE_VISIBLE_WIDTH - bLen, DESKTOP_VISIBLE_HEIGHT);
      dCtx.lineTo(MOBILE_CROP_SIDE + MOBILE_VISIBLE_WIDTH, DESKTOP_VISIBLE_HEIGHT);
      dCtx.lineTo(MOBILE_CROP_SIDE + MOBILE_VISIBLE_WIDTH, DESKTOP_VISIBLE_HEIGHT - bLen);
      dCtx.stroke();

      // Top center badge
      const bText = '✨ UNIVERSAL SAFE ZONE (1280 × 624 px) — Visible Everywhere';
      dCtx.font = '700 13px Inter, sans-serif';
      const tW = dCtx.measureText(bText).width;
      const bX = (CANVAS_WIDTH - tW - 28) / 2;
      dCtx.fillStyle = 'rgba(16, 185, 129, ' + (opacity * 0.95) + ')';
      dCtx.beginPath();
      dCtx.roundRect(bX, 10, tW + 28, 26, 13);
      dCtx.fill();
      dCtx.fillStyle = '#ffffff';
      dCtx.textAlign = 'center';
      dCtx.fillText(bText, CANVAS_WIDTH / 2, 27);

      dCtx.restore();
    }

    // 3. Mobile Preview: crop sides 180px, width 1280px
    const mCtx = elements.mobilePreviewCanvas.getContext('2d');
    mCtx.clearRect(0, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT);
    mCtx.drawImage(
      compositeCanvas,
      MOBILE_CROP_SIDE, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT,
      0, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT
    );

    // Overlay Safe Zone & Cutoffs on Mobile Preview
    if (state.guides.safeZone) {
      mCtx.save();
      // Desktop cutoff top & bottom strips (0..48 and 672..720)
      if (state.guides.desktopCrop) {
        drawStripedZone(mCtx, 0, 0, MOBILE_VISIBLE_WIDTH, DESKTOP_CROP_TOP, 'rgba(245, 158, 11, ' + (opacity * 0.4) + ')', 'rgba(245, 158, 11, ' + (opacity * 0.8) + ')');
        drawStripedZone(mCtx, 0, CANVAS_HEIGHT - DESKTOP_CROP_TOP, MOBILE_VISIBLE_WIDTH, DESKTOP_CROP_TOP, 'rgba(245, 158, 11, ' + (opacity * 0.4) + ')', 'rgba(245, 158, 11, ' + (opacity * 0.8) + ')');
        
        mCtx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, opacity + 0.35) + ')';
        mCtx.font = '600 13px Inter, sans-serif';
        mCtx.textAlign = 'center';
        mCtx.fillText('⚠️ CUT ON PC (TOP -48px)', MOBILE_VISIBLE_WIDTH / 2, 30);
        mCtx.fillText('⚠️ CUT ON PC (BOTTOM -48px)', MOBILE_VISIBLE_WIDTH / 2, CANVAS_HEIGHT - 16);
      }

      // Universal Safe Zone Box on Mobile (x: 0..1280, y: 48..672)
      mCtx.strokeStyle = 'rgba(16, 185, 129, ' + opacity + ')';
      mCtx.lineWidth = 3;
      mCtx.setLineDash([12, 8]);
      mCtx.strokeRect(0, DESKTOP_CROP_TOP, MOBILE_VISIBLE_WIDTH, DESKTOP_VISIBLE_HEIGHT);

      // Corner brackets
      mCtx.setLineDash([]);
      mCtx.lineWidth = 5;
      const bLen = 28;
      // Top-Left
      mCtx.beginPath();
      mCtx.moveTo(0, DESKTOP_CROP_TOP + bLen);
      mCtx.lineTo(0, DESKTOP_CROP_TOP);
      mCtx.lineTo(bLen, DESKTOP_CROP_TOP);
      mCtx.stroke();
      // Top-Right
      mCtx.beginPath();
      mCtx.moveTo(MOBILE_VISIBLE_WIDTH - bLen, DESKTOP_CROP_TOP);
      mCtx.lineTo(MOBILE_VISIBLE_WIDTH, DESKTOP_CROP_TOP);
      mCtx.lineTo(MOBILE_VISIBLE_WIDTH, DESKTOP_CROP_TOP + bLen);
      mCtx.stroke();
      // Bottom-Left
      mCtx.beginPath();
      mCtx.moveTo(0, DESKTOP_CROP_TOP + DESKTOP_VISIBLE_HEIGHT - bLen);
      mCtx.lineTo(0, DESKTOP_CROP_TOP + DESKTOP_VISIBLE_HEIGHT);
      mCtx.lineTo(bLen, DESKTOP_CROP_TOP + DESKTOP_VISIBLE_HEIGHT);
      mCtx.stroke();
      // Bottom-Right
      mCtx.beginPath();
      mCtx.moveTo(MOBILE_VISIBLE_WIDTH - bLen, DESKTOP_CROP_TOP + DESKTOP_VISIBLE_HEIGHT);
      mCtx.lineTo(MOBILE_VISIBLE_WIDTH, DESKTOP_CROP_TOP + DESKTOP_VISIBLE_HEIGHT);
      mCtx.lineTo(MOBILE_VISIBLE_WIDTH, DESKTOP_CROP_TOP + DESKTOP_VISIBLE_HEIGHT - bLen);
      mCtx.stroke();

      // Top center badge
      const bText = '✨ UNIVERSAL SAFE ZONE (1280 × 624 px) — Visible Everywhere';
      mCtx.font = '700 13px Inter, sans-serif';
      const tW = mCtx.measureText(bText).width;
      const bX = (MOBILE_VISIBLE_WIDTH - tW - 28) / 2;
      mCtx.fillStyle = 'rgba(16, 185, 129, ' + (opacity * 0.95) + ')';
      mCtx.beginPath();
      mCtx.roundRect(bX, DESKTOP_CROP_TOP + 10, tW + 28, 26, 13);
      mCtx.fill();
      mCtx.fillStyle = '#ffffff';
      mCtx.textAlign = 'center';
      mCtx.fillText(bText, MOBILE_VISIBLE_WIDTH / 2, DESKTOP_CROP_TOP + 27);

      mCtx.restore();
    }

    // 4. Dual View previews
    const dualDCtx = elements.dualDesktopCanvas.getContext('2d');
    dualDCtx.clearRect(0, 0, CANVAS_WIDTH, DESKTOP_VISIBLE_HEIGHT);
    dualDCtx.drawImage(elements.desktopPreviewCanvas, 0, 0);

    const dualMCtx = elements.dualMobileCanvas.getContext('2d');
    dualMCtx.clearRect(0, 0, MOBILE_VISIBLE_WIDTH, CANVAS_HEIGHT);
    dualMCtx.drawImage(elements.mobilePreviewCanvas, 0, 0);

    // 5. Sync simulator avatar DOM elements
    const mode = state.guides.avatarMode;
    const hideDesktop = mode === 'none' || mode === 'mobile' || mode === 'page';
    const hideMobile = mode === 'none' || mode === 'desktop' || mode === 'personal';

    if (elements.desktopAvatar) {
      elements.desktopAvatar.style.display = hideDesktop ? 'none' : 'flex';
      if (state.avatarLoaded && state.avatarDataUrl) {
        elements.desktopAvatar.innerHTML = `<img src="${state.avatarDataUrl}" alt="Avatar">`;
      } else {
        elements.desktopAvatar.innerHTML = `<span class="avatar-letter">U</span>`;
      }
    }

    if (elements.mobileAvatar) {
      elements.mobileAvatar.style.display = hideMobile ? 'none' : 'flex';
      if (state.avatarLoaded && state.avatarDataUrl) {
        elements.mobileAvatar.innerHTML = `<img src="${state.avatarDataUrl}" alt="Avatar">`;
      } else {
        elements.mobileAvatar.innerHTML = `<span class="avatar-letter">U</span>`;
      }
    }
  }

  // --- Transform Helpers ---
  function updateZoomSlider() {
    const pct = Math.round(state.zoom * 100);
    const clampedPct = Math.min(300, Math.max(30, pct));
    if (elements.zoomSlider) elements.zoomSlider.value = clampedPct;
    if (elements.zoomVal) elements.zoomVal.textContent = pct + '%';
    document.querySelectorAll('.zoom-range-input').forEach(slider => {
      slider.value = clampedPct;
    });
    document.querySelectorAll('.zoom-val-badge').forEach(badge => {
      badge.textContent = pct + '%';
    });
  }

  // --- Pointer & Touch Dragging on Canvas ---
  function setupDragging() {
    const wrapper = elements.canvasWrapper;

    wrapper.addEventListener('pointerdown', (e) => {
      // Primary button only
      if (e.button !== 0) return;
      // Do NOT start canvas drag if clicking on an interactive layer or delete button!
      if (e.target.closest('.moveable-layer') || e.target.closest('.btn-layer-delete') || e.target.closest('.layer-handle')) {
        return;
      }
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

      const zoomFactor = e.deltaY < 0 ? 1.06 : 0.94;
      const newZoom = Math.min(3.0, Math.max(0.3, +(state.zoom * zoomFactor).toFixed(3)));

      // Zoom towards cursor
      state.x = cursorX - (cursorX - state.x) * (newZoom / state.zoom);
      state.y = cursorY - (cursorY - state.y) * (newZoom / state.zoom);
      state.zoom = newZoom;

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

    // Generate AI Cover with Cloudflare Workers AI (100% Watermark-Free)
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
      elements.aiStatusText.textContent = 'Generating native Facebook Cover (1640 × 720) with Cloudflare AI...';
      showToast('Generating widescreen Facebook Cover (~3-5s)...');

      try {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocal 
          ? 'https://fb-cover-sizer.pages.dev/api/generate' 
          : '/api/generate';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: userPrompt,
            style: selectedStyle
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to parse generated image blob'));
          img.src = objectUrl;
        });

        // setImage automatically detects Facebook Standard (1640x720 / 2.28:1) and sets 'cover' mode to fill the canvas edge-to-edge
        setImage(img);
        URL.revokeObjectURL(objectUrl);

        elements.aiStatusText.textContent = '✨ Pixel-Perfect Facebook Cover (1640 × 720) Generated!';
        showToast('Facebook Cover generated (1640 × 720) — 100% Watermark-Free!');
      } catch (err) {
        console.error('AI Generation error:', err);
        elements.aiStatusText.textContent = `Generation error: ${err.message || 'Please try again'}`;
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

    // Zoom Controls (Syncs both the bar under the Facebook demo and any sidebar controls)
    document.querySelectorAll('.zoom-range-input').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.zoom = parseInt(e.target.value, 10) / 100;
        updateZoomSlider();
        renderAll();
      });
    });

    document.querySelectorAll('.btn-zoom-in').forEach(btn => {
      btn.addEventListener('click', () => {
        state.zoom = Math.min(3.0, +(state.zoom + 0.1).toFixed(2));
        updateZoomSlider();
        renderAll();
      });
    });

    document.querySelectorAll('.btn-zoom-out').forEach(btn => {
      btn.addEventListener('click', () => {
        state.zoom = Math.max(0.3, +(state.zoom - 0.1).toFixed(2));
        updateZoomSlider();
        renderAll();
      });
    });

    document.querySelectorAll('.btn-reset-view').forEach(btn => {
      btn.addEventListener('click', () => {
        state.zoom = 1.0;
        state.x = CANVAS_WIDTH / 2;
        state.y = CANVAS_HEIGHT / 2;
        state.rotation = 0;
        state.flipH = 1;
        state.flipV = 1;
        updateZoomSlider();
        renderAll();
        showToast('Reset zoom and centered position');
      });
    });

    // Fit Mode buttons
    if (elements.fitContainBtn) {
      elements.fitContainBtn.addEventListener('click', () => {
        setFitMode('contain');
        showToast('Fitted whole photo (no edges cut off)');
      });
    }

    if (elements.fitCoverBtn) {
      elements.fitCoverBtn.addEventListener('click', () => {
        setFitMode('cover');
        showToast('Expanded to fill entire canvas');
      });
    }

    if (elements.fitSafeBtn) {
      elements.fitSafeBtn.addEventListener('click', () => {
        setFitMode('safe');
        showToast('Fitted inside Universal Safe Zone');
      });
    }

    if (elements.centerImageBtn) {
      elements.centerImageBtn.addEventListener('click', () => {
        state.x = CANVAS_WIDTH / 2;
        state.y = CANVAS_HEIGHT / 2;
        renderAll();
        showToast('Image re-centered');
      });
    }

    if (elements.alignTopBtn) {
      elements.alignTopBtn.addEventListener('click', () => {
        const base = getBaseDimensions();
        const drawH = base.h * state.zoom;
        // Align top edge of image to top edge of canvas (or top of desktop crop)
        state.y = drawH / 2;
        renderAll();
        showToast('Aligned photo to top');
      });
    }

    if (elements.alignBottomBtn) {
      elements.alignBottomBtn.addEventListener('click', () => {
        const base = getBaseDimensions();
        const drawH = base.h * state.zoom;
        // Align bottom edge of image to bottom edge of canvas
        state.y = CANVAS_HEIGHT - drawH / 2;
        renderAll();
        showToast('Aligned photo to bottom');
      });
    }

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

    document.querySelectorAll('.avatar-mode-sync').forEach(sel => {
      sel.addEventListener('change', (e) => {
        state.guides.avatarMode = e.target.value;
        document.querySelectorAll('.avatar-mode-sync').forEach(s => {
          if (s !== e.target) s.value = e.target.value;
        });
        renderGuides();
        syncPreviews();
      });
    });

    if (elements.toggleLayersBtn && elements.layersOverlay) {
      elements.toggleLayersBtn.addEventListener('click', () => {
        const isHidden = elements.layersOverlay.classList.toggle('hidden');
        elements.toggleLayersBtn.textContent = isHidden ? '✥ Moveable Sections: OFF' : '✥ Moveable Sections: ON';
        elements.toggleLayersBtn.classList.toggle('btn-primary', !isHidden);
        elements.toggleLayersBtn.classList.toggle('btn-secondary', isHidden);
        syncPreviews();
        showToast(isHidden ? 'Moveable sections hidden' : 'Moveable sections enabled — drag each section!');
      });
    }

    if (elements.uploadAvatarBtn && elements.avatarFileInput) {
      elements.uploadAvatarBtn.addEventListener('click', () => {
        elements.avatarFileInput.click();
      });

      elements.avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            state.avatarImage = img;
            state.avatarLoaded = true;
            state.avatarDataUrl = ev.target.result;
            if (elements.avatarThumbImg) elements.avatarThumbImg.src = ev.target.result;
            if (elements.avatarThumbPreview) elements.avatarThumbPreview.classList.remove('hidden');
            renderGuides();
            syncPreviews();
            showToast('Profile photo overlay updated!');
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (elements.removeAvatarBtn) {
      elements.removeAvatarBtn.addEventListener('click', () => {
        state.avatarImage = null;
        state.avatarLoaded = false;
        state.avatarDataUrl = null;
        if (elements.avatarFileInput) elements.avatarFileInput.value = '';
        if (elements.avatarThumbImg) elements.avatarThumbImg.src = '';
        if (elements.avatarThumbPreview) elements.avatarThumbPreview.classList.add('hidden');
        renderGuides();
        syncPreviews();
        showToast('Custom profile photo removed');
      });
    }

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
    drawMoveableLayers(compCtx);

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
