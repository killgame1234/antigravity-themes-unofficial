(function (global) {
  'use strict';

  function createButterflyGeometry(THREE) {
    // Tall swallowtail wing quads matching the official HSR Castorice wing aspect (~1:2)
    const positions = new Float32Array([
      -0.21, -0.22, 0.0,   0.0, -0.22, 0.0,   0.0,  0.22, 0.0,
      -0.21, -0.22, 0.0,   0.0,  0.22, 0.0,  -0.21,  0.22, 0.0,
       0.0,  -0.22, 0.0,   0.21, -0.22, 0.0,  0.21,  0.22, 0.0,
       0.0,  -0.22, 0.0,   0.21,  0.22, 0.0,  0.0,   0.22, 0.0,
    ]);
    const uvs = new Float32Array([
      1.0, 0.0,  0.0, 0.0,  0.0, 1.0,
      1.0, 0.0,  0.0, 1.0,  1.0, 1.0,
      0.0, 0.0,  1.0, 0.0,  1.0, 1.0,
      0.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geo;
  }

  function detectSidebarWidth() {
    const selectors = [
      '.monaco-workbench .part.sidebar',
      '.castorice-hsr-sidebar',
      'aside',
      'nav',
      '[data-testid*="sidebar"]',
      '#root div'
    ];
    let leftEdge = 0;
    for (const sel of selectors) {
      const els = sel === '#root div' ? document.querySelectorAll(sel) : [document.querySelector(sel)];
      for (const el of els) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.left <= 24 && r.width >= 160 && r.width <= global.innerWidth * 0.35 && r.height > global.innerHeight * 0.7) {
          leftEdge = Math.max(leftEdge, Math.round(r.right));
          break;
        }
      }
      if (leftEdge > 0) break;
    }
    return leftEdge;
  }

  global.initCastorice3D = function initCastorice3D(opts) {
    const THREE = global.THREE;
    if (!THREE) throw new Error('THREE not loaded');

    if (typeof global.__castorice3DCleanup === 'function') {
      try { global.__castorice3DCleanup(); } catch (_) {}
    }

    const container = opts.container || document.body;
    const interactiveAlways = Boolean(opts.interactiveAlways);
    const sidebarAware = Boolean(opts.sidebarAware);
    const layers = opts.layers || {};
    const videoLayers = opts.videoLayers || {};
    const blobUrlsToRevoke = Array.isArray(opts.blobUrls) ? opts.blobUrls : [];

    const canvas = document.createElement('canvas');
    canvas.id = 'castorice-3d-canvas';
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'bottom:0',
      'right:0',
      'left:0px',
      'width:100vw',
      'height:100vh',
      'z-index:-1',
      'pointer-events:' + (interactiveAlways ? 'auto' : 'none'),
      'display:block',
      layers.ambient ? `background:#07050f url("${layers.ambient}") center/cover no-repeat` : 'background:#07050f'
    ].join(';');
    container.prepend(canvas);

    function getViewportRect() {
      const sb = sidebarAware ? detectSidebarWidth() : 0;
      const w = Math.max(320, Math.round(canvas.clientWidth || global.innerWidth));
      const h = Math.max(240, Math.round(canvas.clientHeight || global.innerHeight));
      return { sb, w, h };
    }

    let vp = getViewportRect();

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 1.5));
    renderer.setSize(vp.w, vp.h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07050f);

    const FOV = 40;
    const PLANE_W = 16.0;
    const PLANE_H = 9.0;
    const PLANE_ASPECT = PLANE_W / PLANE_H;
    const REF_Z = (PLANE_H * 0.5) / Math.tan((FOV * Math.PI) / 360);

    const camera = new THREE.PerspectiveCamera(FOV, vp.w / vp.h, 0.1, 100);
    let baseZ = REF_Z;
    let centerOffsetX = 0;

    function updateContainCamera() {
      const contentW = Math.max(320, vp.w - vp.sb);
      const contentAspect = contentW / vp.h;
      const viewAspect = vp.w / vp.h;
      baseZ = contentAspect < PLANE_ASPECT ? REF_Z * (PLANE_ASPECT / contentAspect) : REF_Z;
      camera.aspect = viewAspect;
      camera.updateProjectionMatrix();
      const visH = 2.0 * baseZ * Math.tan((FOV * Math.PI) / 360);
      const visW = visH * viewAspect;
      centerOffsetX = (vp.sb / vp.w) * visW * 0.5;
    }
    updateContainCamera();
    camera.position.set(0, 0, baseZ);

    const stage = new THREE.Group();
    stage.position.x = centerOffsetX;
    scene.add(stage);

    const loader = new THREE.TextureLoader();
    const textures = [];
    const videos = [];

    function loadImgTex(url) {
      const t = loader.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      textures.push(t);
      return t;
    }

    function loadVideoTex(url) {
      const vid = document.createElement('video');
      vid.src = url;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.preload = 'auto';
      vid.crossOrigin = 'anonymous';
      videos.push(vid);
      const tex = new THREE.VideoTexture(vid);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      textures.push(tex);
      return { vid, tex };
    }

    const tAmbient = loadImgTex(layers.ambient);
    const tDepth = loadImgTex(layers.depthMap);
    const tButterflyWing = layers.butterflyWing ? loadImgTex(layers.butterflyWing) : null;

    // Single hardware-accelerated 1080p video decoder -> zero desync, zero seek glitches, zero alpha noise!
    const vMaster = loadVideoTex(videoLayers.master || videoLayers.bg);

    let started = false;
    function tryStart() {
      if (started) return;
      if (vMaster.vid.readyState >= 2) {
        if (!document.getElementById('castorice-intro-overlay')) {
          started = true;
          vMaster.vid.play().catch(() => {});
        }
      }
    }
    global.__castoriceWake25D = function () {
      handoffOrigin = performance.now();
      started = true;
      try {
        vMaster.vid.currentTime = 0;
        vMaster.vid.play().catch(() => {});
      } catch (_) {}
    };
    vMaster.vid.addEventListener('canplay', tryStart);
    vMaster.vid.load();
    setTimeout(tryStart, 250);

    const disposables = [];
    function makeLayer(zPos, mat) {
      const geo = new THREE.PlaneGeometry(PLANE_W, PLANE_H, 1, 1);
      disposables.push(geo, mat);
      const mesh = new THREE.Mesh(geo, mat);
      const perspScale = (REF_Z - zPos) / REF_Z;
      mesh.position.z = zPos;
      mesh.scale.set(perspScale, perspScale, 1.0);
      stage.add(mesh);
      return { mesh, baseScale: perspScale, zPos };
    }

    // True per-side YouTube Ambient Light backdrop (540x320 padded from 320x180)
    const ambMat = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: tAmbient }, uTime: { value: 0 } },
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec3 col = texture2D(uMap, clamp(vUv, 0.005, 0.995)).rgb;
          // Gently brighten the dark lower ambient edge so the bottom melts smoothly into the theme
          float bottomLift = smoothstep(0.34, 0.0, vUv.y);
          col = col * (1.0 + bottomLift * 0.72) + vec3(0.055, 0.038, 0.135) * bottomLift;
          float breathe = 0.94 + 0.06 * sin(uTime * 0.75 + vUv.x * 2.0);
          gl_FragColor = vec4(col * breathe, 1.0);
        }
      `
    });
    const ambGeo = new THREE.PlaneGeometry(PLANE_W * (540 / 320), PLANE_H * (320 / 180), 1, 1);
    disposables.push(ambGeo, ambMat);
    const ambientMesh = new THREE.Mesh(ambGeo, ambMat);
    ambientMesh.position.z = -4.8;
    const ambPersp = (REF_Z - ambientMesh.position.z) / REF_Z;
    ambientMesh.scale.set(ambPersp * 1.18, ambPersp * 1.18, 1.0);
    stage.add(ambientMesh);

    // 5-Zone 2.5D Relief Video Mesh (Sky -> Pollux Wings -> Pollux Head -> Castorice -> FG Butterfly)
    // Driven by ONE ultra-crisp 1080p video decoder + Projective Camera-Mapping Compensation (0% perspective bloat at rest!)
    const reliefGeo = new THREE.PlaneGeometry(PLANE_W, PLANE_H, 96, 54);
    const reliefMat = new THREE.ShaderMaterial({
      uniforms: {
        uVideo: { value: vMaster.tex },
        uDepthMap: { value: tDepth },
        uDepthScale: { value: 2.55 },
        uRefZ: { value: baseZ },
        uHandoff: { value: 0.0 },
        uParallax: { value: new THREE.Vector2(0, 0) }
      },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        uniform sampler2D uDepthMap;
        uniform float uDepthScale;
        uniform float uRefZ;
        uniform float uHandoff;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          float d = texture2D(uDepthMap, uv).r;
          vec3 pos = position;
          float dz = (d - 0.42) * uDepthScale * uHandoff;
          // Projective camera-mapping compensation: at center camera (0, 0, uRefZ), every vertex projects to its exact flat 2D pixel!
          pos.xy *= (uRefZ - dz) / max(1.0, uRefZ);
          pos.z += dz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uVideo;
        uniform sampler2D uDepthMap;
        uniform vec2 uParallax;
        uniform float uHandoff;
        varying vec2 vUv;
        void main() {
          // 2-step iterative parallax UV shift (Apple Spatial Photo / Wallpaper Engine Depth Parallax)
          float d0 = texture2D(uDepthMap, vUv).r;
          vec2 uv1 = clamp(vUv - uParallax * (d0 - 0.45), 0.001, 0.999);
          float d1 = texture2D(uDepthMap, uv1).r;
          vec2 uv2 = clamp(vUv - uParallax * (mix(d0, d1, 0.5) - 0.45), 0.001, 0.999);
          vec4 col = texture2D(uVideo, uv2);
          float feather = 0.055 * uHandoff;
          vec2 e = feather > 0.0005
            ? smoothstep(vec2(0.0), vec2(feather), vUv) * smoothstep(vec2(1.0), vec2(1.0 - feather), vUv)
            : vec2(1.0);
          float alpha = e.x * e.y;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col.rgb, alpha);
        }
      `
    });
    disposables.push(reliefGeo, reliefMat);
    const reliefMesh = new THREE.Mesh(reliefGeo, reliefMat);
    stage.add(reliefMesh);

    // 10 Subtle Foreground 3D OG HSR Castorice Butterflies (complementing the video's real butterflies)
    const BUTTERFLY_COUNT = 10;
    const bGeo = createButterflyGeometry(THREE);
    const phases = new Float32Array(BUTTERFLY_COUNT);
    for (let i = 0; i < BUTTERFLY_COUNT; i++) phases[i] = Math.random() * Math.PI * 2;
    bGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));

    const bMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uWingMap: { value: tButterflyWing }, uHandoff: { value: 0.0 } },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aPhase;
        uniform float uTime;
        varying vec2 vUv;
        varying float vPhase;
        void main() {
          vUv = uv;
          vPhase = aPhase;
          vec3 p = position;
          float flap = sin(uTime * 7.2 + aPhase * 6.0) * 0.88;
          float side = sign(p.x);
          float dist = abs(p.x);
          p.z += sin(flap) * dist * 1.15;
          p.x = side * cos(flap * 0.65) * dist;
          vec4 worldPos = modelMatrix * instanceMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uWingMap;
        uniform float uHandoff;
        varying vec2 vUv;
        varying float vPhase;
        void main() {
          vec4 tex = texture2D(uWingMap, vUv);
          if (tex.a < 0.02 || uHandoff < 0.01) discard;
          float shimmer = 0.85 + 0.2 * sin(vPhase * 5.0 + vUv.y * 4.0);
          gl_FragColor = vec4(tex.rgb * shimmer, tex.a * 0.82 * uHandoff);
        }
      `
    });
    disposables.push(bGeo, bMat);

    const butterflies = new THREE.InstancedMesh(bGeo, bMat, BUTTERFLY_COUNT);
    stage.add(butterflies);

    const bState = Array.from({ length: BUTTERFLY_COUNT }, (_, i) => ({
      bx: (Math.random() - 0.5) * 13.0,
      by: (Math.random() - 0.5) * 7.2,
      bz: 1.45 + Math.random() * 1.45,
      sx: 0.36 + Math.random() * 0.30,
      speed: 0.22 + Math.random() * 0.30,
      phase: phases[i]
    }));
    const dummy = new THREE.Object3D();

    // Camera Orbit + Cursor Parallax State
    let targetYaw = 0;
    let targetPitch = 0;
    let curYaw = 0;
    let curPitch = 0;
    let targetZoomMul = 1.0;
    let curZoomMul = 1.0;
    let mouseNx = 0;
    let mouseNy = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const onMouseMove = (e) => {
      mouseNx = clamp(((e.clientX - vp.sb) / Math.max(320, vp.w - vp.sb)) * 2 - 1, -1, 1);
      mouseNy = clamp((e.clientY / vp.h) * 2 - 1, -1, 1);
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        targetYaw = clamp(targetYaw - dx * 0.004, -0.35, 0.35);
        targetPitch = clamp(targetPitch - dy * 0.003, -0.22, 0.22);
      }
    };

    const onMouseDown = (e) => {
      if (e.button === 0 && (interactiveAlways || e.altKey)) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        if (e.altKey) e.preventDefault();
      }
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e) => {
      if (interactiveAlways || e.altKey) {
        targetZoomMul = clamp(targetZoomMul + e.deltaY * 0.0005, 0.65, 1.25);
        if (e.altKey) e.preventDefault();
      }
    };

    const onDblClick = (e) => {
      if (interactiveAlways || e.altKey) {
        targetYaw = 0;
        targetPitch = 0;
        targetZoomMul = 1.0;
      }
    };

    const onResize = () => {
      vp = getViewportRect();
      updateContainCamera();
      stage.position.x = centerOffsetX;
      renderer.setSize(vp.w, vp.h, false);
      renderer.render(scene, camera);
    };

    const onMouseLeave = () => {
      mouseNx = 0;
      mouseNy = 0;
      isDragging = false;
    };

    const onVisChange = () => {
      if (document.hidden) {
        vMaster.vid.pause();
      } else if (started) {
        vMaster.vid.play().catch(() => {});
      }
    };

    global.addEventListener('pointermove', onMouseMove, { capture: true, passive: true });
    global.addEventListener('mousemove', onMouseMove, { capture: true, passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    global.addEventListener('blur', onMouseLeave);
    global.addEventListener('mousedown', onMouseDown);
    global.addEventListener('mouseup', onMouseUp);
    global.addEventListener('wheel', onWheel, { passive: false });
    global.addEventListener('dblclick', onDblClick);
    global.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisChange);

    let rafId = 0;
    const startTime = performance.now();
    let handoffOrigin = document.getElementById('castorice-intro-overlay') ? 0 : performance.now() - 2000;

    function animate(now) {
      rafId = global.requestAnimationFrame(animate);
      if (document.hidden) return;

      // Sync WebGL aspect & buffer on any maximize/snap/DPI/sidebar change so Castorice never stretches
      const cw = Math.max(320, Math.round(canvas.clientWidth || global.innerWidth));
      const ch = Math.max(240, Math.round(canvas.clientHeight || global.innerHeight));
      if (cw !== vp.w || ch !== vp.h) {
        onResize();
      }

      const t = (now - startTime) * 0.001;
      // Smooth S-curve handoff ramp: 0.0 while intro overlay is active -> wakes to 1.0 over 1.25s after intro ends
      const rawHandoff = handoffOrigin > 0 ? Math.min(1.0, Math.max(0.0, (now - handoffOrigin) * 0.0008)) : 0.0;
      const handoff = rawHandoff * rawHandoff * (3.0 - 2.0 * rawHandoff);

      ambMat.uniforms.uTime.value = t;
      bMat.uniforms.uTime.value = t;
      bMat.uniforms.uHandoff.value = handoff;
      reliefMat.uniforms.uHandoff.value = handoff;
      reliefMat.uniforms.uRefZ.value = baseZ * curZoomMul;

      // Smooth idle 2.5D parallax + responsive cursor follow + Alt+Drag orbit (scaled by handoff so Frame 0 is 100% locked to the intro!)
      const idleYaw = Math.sin(t * 0.42) * 0.025;
      const idlePitch = Math.cos(t * 0.31) * 0.015;
      const goalYaw = (targetYaw + idleYaw + mouseNx * 0.135) * handoff;
      const goalPitch = (targetPitch + idlePitch - mouseNy * 0.085) * handoff;

      curYaw += (goalYaw - curYaw) * 0.11;
      curPitch += (goalPitch - curPitch) * 0.11;
      curZoomMul += (targetZoomMul - curZoomMul) * 0.09;

      // Drive fragment-shader depth parallax UV shift for deep Spatial-Photo 2.5D pop
      reliefMat.uniforms.uParallax.value.set(curYaw * 0.14 * handoff, -curPitch * 0.14 * handoff);

      const zDist = baseZ * curZoomMul;
      camera.position.x = Math.sin(curYaw) * zDist;
      camera.position.y = Math.sin(curPitch) * zDist * 0.75;
      camera.position.z = Math.cos(curYaw) * Math.cos(curPitch) * zDist;
      camera.lookAt(0, 0, 0);

      for (let i = 0; i < BUTTERFLY_COUNT; i++) {
        const b = bState[i];
        const ang = t * b.speed + b.phase;
        dummy.position.set(
          b.bx + Math.sin(ang * 1.1) * 0.85,
          b.by + Math.cos(ang * 0.85) * 0.5 + Math.sin(t * 0.6 + b.phase) * 0.18,
          b.bz + Math.cos(ang * 0.7) * 0.35
        );
        dummy.rotation.set(
          0.35 + Math.sin(ang) * 0.25,
          Math.sin(ang * 0.9) * 0.6,
          Math.cos(ang * 1.2) * 0.3
        );
        dummy.scale.setScalar(b.sx);
        dummy.updateMatrix();
        butterflies.setMatrixAt(i, dummy.matrix);
      }
      butterflies.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    }

    rafId = global.requestAnimationFrame(animate);

    global.__castorice3DCleanup = function () {
      global.cancelAnimationFrame(rafId);
      global.removeEventListener('pointermove', onMouseMove, true);
      global.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('mouseleave', onMouseLeave);
      global.removeEventListener('blur', onMouseLeave);
      global.removeEventListener('mousedown', onMouseDown);
      global.removeEventListener('mouseup', onMouseUp);
      global.removeEventListener('wheel', onWheel);
      global.removeEventListener('dblclick', onDblClick);
      global.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisChange);
      for (const v of videos) {
        try { v.pause(); v.removeAttribute('src'); v.load(); } catch (_) {}
      }
      for (const u of blobUrlsToRevoke) {
        try { URL.revokeObjectURL(u); } catch (_) {}
      }
      for (const d of disposables) d.dispose();
      for (const tx of textures) tx.dispose();
      renderer.dispose();
      canvas.remove();
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
