import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// === Globals ===
let scene, camera, renderer, controls;
let textures = {};
let testCard;
let cameraKey = 0;
const cards = [];
const hand = [];
let hoverTimer = 0;
const offsets = Array.from({ length: 3 }, () => Math.random() * 2 * Math.PI);

// === Init Functions ===
initScene();
await loadTextures();
createCamera();
createRenderer();
createControls();
addLights();
addTable();
createDeck();
createPile();
createHand(3,8);
createHand(-3,8);
createHand(-3,-8);
createHand(3,-8);
animate();

// === Function Definitions ===

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87cefa);
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, 16);
  camera.lookAt(0, 0, 0);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function createControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
}

async function loadTextures() {
  const loader = new THREE.TextureLoader();
  const names = ['blank', 'back', 'pile', 'table'];
  const paths = {
    blank: '../assets/blank.png',
    back: '../assets/back.png',
    pile: '../assets/pile.png',
    table: '../assets/table.jpg',
  };

  for (const name of names) {
    textures[name] = await loader.loadAsync(paths[name]);
    textures[name].colorSpace = THREE.SRGBColorSpace;
  }
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 2);
  scene.add(hemi);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 10, 5);
  dirLight.castShadow = true;
  dirLight.target.position.set(-5, 0, 0);
  scene.add(dirLight);
  scene.add(dirLight.target);
}

function createCard(x, y, z, mapFront = textures.blank, mapBack = textures.back) {
  const frontMat = new THREE.MeshStandardMaterial({ map: mapFront, transparent: true });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), frontMat);
  front.castShadow = true;
  //front.receiveShadow = true;
  front.draggable = true;

  const backMat = new THREE.MeshStandardMaterial({ map: mapBack, transparent: true });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), backMat);
  back.castShadow = true;
  back.receiveShadow = true;
  back.rotation.y = Math.PI;
  back.position.z -= 0.05

  const card = new THREE.Group();
  card.rotation.x = Math.PI / 2;
  card.position.set(x, y, z);
  card.add(front, back);

  return card;
}

function createDeck() {
  for (let i = 0; i < 40; i++) {
    const card = createCard(4, i * 0.02, 0);
    cards.push(card);
    scene.add(card);
  }

  testCard = createCard(0, 2, 0);
  testCard.rotation.x -= Math.PI / 2;
  scene.add(testCard);
  cards.push(testCard);
}

function createPile() {
  const pileMat = new THREE.MeshStandardMaterial({ map: textures.pile });
  const pile = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), pileMat);
  pile.rotation.x = -Math.PI / 2;
  pile.receiveShadow = true;
  scene.add(pile);
  cards.push(pile);
}

function addTable() {
  const tableGeo = new THREE.CylinderGeometry(20, 20, 1, 64);
  const tableMat = new THREE.MeshStandardMaterial({ map: textures.table });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.receiveShadow = true;
  table.position.y = -0.51;
  scene.add(table);
}

function createHand(xoff, yoff) {
  const positions = [-2.7, 0, 2.7];
  positions.forEach((x, i) => {
    const card = createCard(x, xoff, yoff);
    hand.push(card);
    scene.add(card);
  });
}

document.addEventListener("click", (event) => {
  let mouse = new THREE.Vector2();
  mouse.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    ((window.innerHeight - event.clientY)/ window.innerHeight) * 2 - 1);
  const rayGun = new THREE.Raycaster();
  rayGun.setFromCamera(mouse, camera);
  const direction = rayGun.ray.direction;
  const pointClick = rayGun.ray.origin.add(direction.multiplyScalar(4));
  console.log(pointClick)

})

function animate() {
  requestAnimationFrame(animate);
  testCard.rotation.y += 0.006;
  hoverTimer += 0.007;

  hand.forEach((card, i) => {
    card.position.y = 0.2 + Math.cos(hoverTimer + offsets[i]) / 19;
    card.rotation.x = Math.PI / 2 + Math.cos(hoverTimer + offsets[i] * 1.7) / 40;
  });
  
  controls.update();
  renderer.render(scene, camera);

  //Camera Pan
  //cameraKey += 0.001
  //camera.position.set(16 * Math.cos(cameraKey), 8, 16 * Math.sin(cameraKey));
  //camera.lookAt(0, 0, 0);
}
