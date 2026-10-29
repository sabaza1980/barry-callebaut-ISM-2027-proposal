// Barry Callebaut CMD 2027 · Academy demonstration room, to scale (metres).
// x runs down the room from the set wall (0) to the rear wall (13.68); z across (±3.065); y up.
export const ROOM = { L: 13.68, W: 6.13, H: 2.64 };

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

function canvasTex(THREE, w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function drawBackdrop(g, w, h, logo) {
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#523a2b'); grd.addColorStop(1, '#2e2018');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  // layered cocoa contours, echoing the webcast frame
  for (let k = 0; k < 14; k++) {
    g.beginPath();
    const base = h * (0.45 + k * 0.045), amp = h * (0.05 + k * 0.004), ph = k * 0.55;
    for (let x = 0; x <= w; x += 8) {
      const y = base + Math.sin(x / w * Math.PI * 2.2 + ph) * amp + Math.sin(x / w * Math.PI * 5 + ph * 2) * amp * 0.25;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.strokeStyle = `rgba(232,218,204,${0.05 + k * 0.006})`; g.lineWidth = h * 0.0035; g.stroke();
  }
  // fine red accent
  g.fillStyle = '#b52e24'; g.fillRect(0, h * 0.955, w, h * 0.008);
  // logo + title, centred above the presenter
  if (logo) {
    const lw = w * 0.2, lh = lw * logo.height / logo.width;
    g.drawImage(logo, (w - lw) / 2, h * 0.12, lw, lh);
  }
  g.fillStyle = '#eee8df'; g.textAlign = 'center';
  g.font = `${Math.round(h * 0.06)}px Georgia, 'Times New Roman', serif`;
  g.fillText('Capital Markets Day 2027', w / 2, h * 0.37);
  g.font = `${Math.round(h * 0.03)}px Arial, Helvetica, sans-serif`;
  g.fillStyle = 'rgba(238,232,223,0.75)';
  g.fillText('HARDRICOURT  ·  4 MAY 2027', w / 2, h * 0.43);
}

function drawSlide(g, w, h, logo) {
  g.fillStyle = '#eee8df'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#443227'; g.fillRect(0, 0, w, h * 0.16);
  g.fillStyle = '#b52e24'; g.fillRect(0, h * 0.16, w, h * 0.012);
  if (logo) { const lh = h * 0.09, lw = lh * logo.width / logo.height; g.drawImage(logo, w * 0.04, h * 0.035, lw, lh); }
  const bars = [0.30, 0.42, 0.51, 0.63, 0.78];
  bars.forEach((v, i) => { g.fillStyle = ['#c9b8a6', '#a88d76', '#8a6c56', '#6b4f3d', '#443227'][i]; const bw = w * 0.07; g.fillRect(w * (0.08 + i * 0.09), h * (0.9 - v * 0.65), bw, h * v * 0.65); });
  g.strokeStyle = '#33271f'; g.lineWidth = h * 0.012; g.beginPath();
  [0.35, 0.42, 0.47, 0.58, 0.66, 0.74].forEach((v, i) => { const x = w * (0.58 + i * 0.07), y = h * (0.9 - v * 0.75); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.stroke();
  g.fillStyle = '#d8cfc2'; g.fillRect(w * 0.54, h * 0.25, w * 0.003, h * 0.65);
}

function figure(THREE, M, suit, skin, seated) {
  const g = new THREE.Group(), ms = M({ color: suit, roughness: 0.85 }), mk = M({ color: skin, roughness: 0.7 });
  const mesh = (geo, mat, x, y, z, sx = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, 1, sz); m.castShadow = true; g.add(m); return m; };
  const torso = new THREE.CapsuleGeometry(0.15, 0.3, 6, 16);
  if (seated) {
    mesh(torso, ms, 0.07, 0.86, 0, 0.75, 1.35);
    mesh(new THREE.CapsuleGeometry(0.065, 0.38, 4, 10), ms, -0.12, 0.52, -0.1, 1, 1).rotation.z = Math.PI / 2;
    mesh(new THREE.CapsuleGeometry(0.065, 0.38, 4, 10), ms, -0.12, 0.52, 0.1, 1, 1).rotation.z = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 10), mk, 0.06, 1.15, 0);
    mesh(new THREE.SphereGeometry(0.095, 20, 16), mk, 0.05, 1.27, 0, 0.92, 0.85);
  } else {
    mesh(new THREE.CapsuleGeometry(0.07, 0.75, 4, 10), ms, 0, 0.45, -0.1);
    mesh(new THREE.CapsuleGeometry(0.07, 0.75, 4, 10), ms, 0, 0.45, 0.1);
    mesh(torso, ms, 0, 1.2, 0, 0.75, 1.35);
    mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 10), mk, 0, 1.52, 0);
    mesh(new THREE.SphereGeometry(0.095, 20, 16), mk, 0, 1.64, 0, 0.92, 0.85);
  }
  return g;
}

export async function buildScene(THREE, { assetBase = '' } = {}) {
  const { L, W, H } = ROOM, hw = W / 2;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dfe6ea');
  let logo = null; try { logo = await loadImage(assetBase + 'barry-callebaut-logo.png'); } catch (e) {}

  const M = (o) => new THREE.MeshStandardMaterial(o);
  const add = (geo, mat, x, y, z, opt = {}) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (opt.ry) m.rotation.y = opt.ry; if (opt.rx) m.rotation.x = opt.rx; if (opt.rz) m.rotation.z = opt.rz;
    m.castShadow = opt.cast !== false; m.receiveShadow = true; (opt.parent || scene).add(m); return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1, r2, h, s = 16) => new THREE.CylinderGeometry(r1, r2, h, s);

  // materials
  const floorTex = canvasTex(THREE, 512, 512, (g, w) => { g.fillStyle = '#ddd7ce'; g.fillRect(0, 0, w, w); g.strokeStyle = '#cfc8bd'; g.lineWidth = 3; g.strokeRect(0, 0, w, w); });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(L / 0.6, W / 0.6);
  const mFloor = M({ map: floorTex, roughness: 0.55 });
  const mWall = M({ color: '#f3f1ec', roughness: 0.9 });
  const mCeil = M({ color: '#f6f5f2', roughness: 0.95 });
  const mGlass = new THREE.MeshPhysicalMaterial({ color: '#cfe0e6', roughness: 0.05, transmission: 0.0, transparent: true, opacity: 0.18, metalness: 0 });
  const mFrame = M({ color: '#2b2b2b', roughness: 0.5, metalness: 0.4 });
  const mBlack = M({ color: '#141414', roughness: 0.85 });
  const mCarpet = M({ color: '#1b1b1b', roughness: 1 });
  const mOak = M({ color: '#b8875a', roughness: 0.6 });
  const mSteel = M({ color: '#3a3a3a', roughness: 0.4, metalness: 0.7 });
  const mChairSeat = M({ color: '#c7965f', roughness: 0.55 });
  const slideTex = canvasTex(THREE, 1280, 720, (g, w, h) => drawSlide(g, w, h, logo));
  const mSlide = new THREE.MeshBasicMaterial({ map: slideTex, toneMapped: false });
  const backTex = canvasTex(THREE, 3600, 1200, (g, w, h) => drawBackdrop(g, w, h, logo));
  const mBack = M({ map: backTex, roughness: 0.85 });

  const groups = { ceiling: new THREE.Group(), nearWall: new THREE.Group(), webcast: new THREE.Group(), outside: new THREE.Group() };
  Object.values(groups).forEach(g => scene.add(g));

  // shell
  add(new THREE.PlaneGeometry(L, W), mFloor, L / 2, 0, 0, { rx: -Math.PI / 2, cast: false });
  add(box(L, 0.05, W), mCeil, L / 2, H + 0.025, 0, { parent: groups.ceiling, cast: false });
  for (let x = 1.2; x < L; x += 2.4) add(box(0.6, 0.02, 0.6), M({ color: '#e9e8e4' }), x, H - 0.01, 0, { parent: groups.ceiling, cast: false }); // ceiling cassettes
  add(box(0.1, H, W), mWall, -0.05, H / 2, 0, { cast: false });
  add(box(0.1, H, W), mWall, L + 0.05, H / 2, 0, { cast: false });

  // glazed long walls with mullions, curtain boxes, and garden outside
  const outside = canvasTex(THREE, 1024, 256, (g, w, h) => {
    const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, '#cfe3ee'); s.addColorStop(0.45, '#dfeaf0'); s.addColorStop(0.46, '#9fb38f'); s.addColorStop(1, '#8aa07a');
    g.fillStyle = s; g.fillRect(0, 0, w, h);
    g.filter = 'blur(6px)'; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(${95 + rnd() * 40},${130 + rnd() * 40},${85 + rnd() * 30},0.55)`; g.beginPath(); g.arc(rnd() * w, h * (0.2 + rnd() * 0.3), 14 + rnd() * 30, 0, 7); g.fill(); } g.filter = 'none';
  });
  for (const side of [-1, 1]) {
    const parent = side > 0 ? groups.nearWall : scene;
    add(new THREE.PlaneGeometry(L, H), mGlass, L / 2, H / 2, side * hw, { ry: side > 0 ? Math.PI : 0, parent, cast: false });
    for (let x = 0; x <= L + 0.01; x += L / 9) add(box(0.06, H, 0.06), mFrame, x, H / 2, side * hw, { parent });
    add(box(L, 0.06, 0.06), mFrame, L / 2, 0.03, side * hw, { parent });
    add(cyl(0.05, 0.05, L, 12), M({ color: '#d9d4cb' }), L / 2, H - 0.12, side * (hw - 0.08), { rz: Math.PI / 2, parent }); // rolled curtain
    const o = add(new THREE.PlaneGeometry(L + 10, 6), new THREE.MeshBasicMaterial({ map: outside }), L / 2, 2.4, side * (hw + 5), { ry: side > 0 ? Math.PI : 0, parent: groups.outside, cast: false });
    o.receiveShadow = false;
  }

  // ---- the set ----
  const BX = 0.30; // backdrop position
  add(box(0.08, 2.0, 6.0), mBlack, BX, 1.0, 0); // frame
  add(new THREE.PlaneGeometry(6.0, 2.0), mBack, BX + 0.041, 1.0, 0, { ry: Math.PI / 2, cast: false });
  // house 65" hanging from the ceiling, behind the backdrop
  add(box(0.05, 0.81, 1.43), mBlack, 0.12, 2.05, 0);
  add(new THREE.PlaneGeometry(1.39, 0.77), mSlide, 0.146, 2.05, 0, { ry: Math.PI / 2, cast: false });
  add(cyl(0.015, 0.015, 0.25), mSteel, 0.12, 2.55, 0);
  // two 65" screens on the backdrop
  for (const z of [-2.15, 2.15]) {
    add(box(0.05, 0.83, 1.46), mBlack, BX + 0.07, 1.33, z);
    add(new THREE.PlaneGeometry(1.42, 0.79), mSlide, BX + 0.096, 1.33, z, { ry: Math.PI / 2, cast: false });
  }
  // stage 4 x 2 x 0.10 with black carpet and skirt
  const SX = BX + 0.06 + 1.0;
  add(box(2.0, 0.10, 4.0), mCarpet, SX, 0.05, 0);
  // lectern (oak) and presenter
  const LX = SX - 0.15, LZ = 1.0;
  add(box(0.42, 1.08, 0.56), mOak, LX + 0.05, 0.10 + 0.54, LZ);
  add(box(0.48, 0.04, 0.62), mOak, LX + 0.02, 0.10 + 1.1, LZ, { rz: 0.18 });
  { const g = figure(THREE, M, '#1e2633', '#c99a7b', false); g.position.set(LX - 0.42, 0.10, LZ - 0.05); scene.add(g); }
  // confidence monitor and speaker timer on the floor, facing the stage
  for (const [z, w] of [[-0.45, 0.72], [0.45, 0.55]]) {
    add(box(0.25, 0.08, 0.3), mBlack, SX + 1.25, 0.04, z);
    add(box(0.05, w * 0.58, w), mBlack, SX + 1.25, 0.32, z, { rz: -0.45 });
  }

  // lights: 4 daylight LED on telescopic uprights (2 front sides, 2 rear)
  const addLight = (x, z, target) => {
    add(cyl(0.02, 0.02, 2.05), mSteel, x, 1.02, z);
    for (let a = 0; a < 3; a++) add(box(0.55, 0.02, 0.02), mSteel, x + Math.cos(a * 2.1) * 0.25, 0.02, z + Math.sin(a * 2.1) * 0.25, { ry: -a * 2.1 });
    const head = add(cyl(0.12, 0.16, 0.24, 20), mBlack, x, 2.12, z);
    head.lookAt(target); head.rotateX(Math.PI / 2);
    const sp = new THREE.SpotLight('#fff6ea', 18, 14, 0.55, 0.6, 1.4);
    sp.position.set(x, 2.12, z); sp.target.position.copy(target); scene.add(sp, sp.target);
  };
  const tgt = new THREE.Vector3(SX - 0.3, 1.45, 0.4);
  addLight(2.85, -2.75, tgt); addLight(2.85, 2.75, tgt); addLight(8.75, -2.55, tgt); addLight(8.75, 2.55, tgt);

  // L-Acoustics X8 on stands: 2 front, 2 halfway
  for (const [x, z] of [[2.55, -2.95], [2.55, 2.95], [6.6, -2.98], [6.6, 2.98]]) {
    add(cyl(0.018, 0.018, 1.55), mSteel, x, 0.78, z);
    for (let a = 0; a < 3; a++) add(box(0.5, 0.02, 0.02), mSteel, x, 0.02, z, { ry: a * 2.1 });
    const sp = add(box(0.24, 0.42, 0.25), mBlack, x, 1.75, z);
    sp.lookAt(x + (x < 4 ? 6 : 6), 1.2, 0);
  }

  // house 55" return screens, ceiling-hung mid-room, facing the rear rows
  for (const z of [-2.0, 2.0]) {
    add(box(0.05, 0.70, 1.24), mBlack, 5.4, 2.12, z);
    add(new THREE.PlaneGeometry(1.2, 0.66), mSlide, 5.427, 2.12, z, { ry: Math.PI / 2, cast: false });
    add(cyl(0.015, 0.015, 0.2), mSteel, 5.4, 2.55, z);
  }

  // 60 chairs: 6 rows of 10, centre aisle
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(box(0.44, 0.03, 0.44), mChairSeat); seat.position.set(0, 0.46, 0);
  const back = new THREE.Mesh(box(0.03, 0.36, 0.44), mChairSeat); back.position.set(0.21, 0.72, 0); back.rotation.z = -0.12;
  chair.add(seat, back);
  for (const [dx, dz] of [[-0.19, -0.19], [-0.19, 0.19], [0.19, -0.19], [0.19, 0.19]]) { const l = new THREE.Mesh(cyl(0.012, 0.012, 0.46, 8), mBlack); l.position.set(dx, 0.23, dz); chair.add(l); }
  chair.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const seated = [];
  for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++) for (const s of [-1, 1]) {
    const c = chair.clone(); c.position.set(3.35 + r * 0.95, 0, s * (0.45 + 0.25 + k * 0.5)); scene.add(c); seated.push(c.position.clone());
  }
  // a seated audience (about two thirds full), simple figures
  const suits = ['#1e2633', '#2b2b2f', '#3a3f4a', '#4a3e36', '#22303f'];
  const skins = ['#c99a7b', '#8d5f45', '#e0b899', '#b07e5c'];
  seated.forEach((p, i) => {
    if ((i * 7) % 10 > 6) return;
    const g = new THREE.Group(); g.position.copy(p); scene.add(g);
    g.add(figure(THREE, M, suits[i % 5], skins[i % 4], true));
  });

  // ---- webcast position: 3 PTZ on tripods, control behind a 1.2 m black drape ----
  for (const z of [-1.3, 0, 1.3]) {
    add(cyl(0.02, 0.02, 1.75), mSteel, 9.15, 0.88, z, { parent: groups.webcast });
    for (let a = 0; a < 3; a++) add(box(0.6, 0.02, 0.02), mSteel, 9.15, 0.02, z, { ry: a * 2.1, parent: groups.webcast });
    add(box(0.18, 0.2, 0.16), M({ color: '#e6e6e6', roughness: 0.5 }), 9.15, 1.85, z, { parent: groups.webcast });
    add(cyl(0.05, 0.05, 0.1), mBlack, 9.05, 1.87, z, { rz: Math.PI / 2, parent: groups.webcast });
  }
  add(box(0.04, 1.2, 5.0), mBlack, 9.8, 0.6, 0);
  add(box(0.8, 0.75, 3.0), mBlack, 10.4, 0.375, 0);
  for (const z of [-0.9, 0, 0.9]) add(box(0.04, 0.4, 0.6), M({ color: '#202020', emissive: '#29425a', emissiveIntensity: 0.6 }), 10.25, 0.98, z, { rz: 0.15 });

  // coffee bar and oak shelving at the rear wall
  add(box(0.7, 1.05, 3.6), mOak, L - 1.2, 0.525, 0.6);
  add(box(0.04, 2.1, 4.4), mOak, L - 0.05, 1.05, 0.2);
  for (let y = 0.6; y < 2.2; y += 0.42) add(box(0.3, 0.03, 4.4), mOak, L - 0.2, y, 0.2);
  for (let z = -1.8; z <= 2.3; z += 0.55) add(box(0.32, 1.7, 0.03), mOak, L - 0.2, 1.4, z);

  // lighting
  scene.add(new THREE.HemisphereLight('#f4f7fb', '#cbbfaf', 1.1));
  const sun = new THREE.DirectionalLight('#fff3e2', 1.6); sun.position.set(4, 9, -12); sun.target.position.set(6, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  for (let x = 1.5; x < L; x += 3) { const p = new THREE.PointLight('#fff8ee', 1.2, 7, 2); p.position.set(x, H - 0.2, 0); scene.add(p); }

  const views = {
    audience: { pos: [8.5, 1.65, 0.1], look: [0.3, 1.2, 0.05], fov: 48 },
    stage: { pos: [4.6, 1.55, -2.35], look: [0.4, 1.05, 0.55], fov: 50 },
    webcast: { pos: [9.0, 1.87, 0], look: [0.6, 1.15, 0.15], fov: 24 },
    overview: { pos: [L + 0.2, 6.6, 6.2], look: [5.2, 0, -0.4], fov: 46, cutaway: true },
  };
  const setCutaway = (on) => { groups.ceiling.visible = !on; groups.nearWall.visible = !on; groups.outside.visible = !on; };
  const setWebcast = (on) => { groups.webcast.visible = on; };
  return { scene, views, setCutaway, setWebcast };
}
