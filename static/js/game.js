import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// === Globals ===
let scene, camera, renderer, controls;
let textures = {};
let testCard;
let cameraKey = 0;
let pickerTimer = 0;
const cards = [];
const hand = [];
let hoverTimer = 0;
const offsets = Array.from({ length: 3 }, () => Math.random() * 2 * Math.PI);


class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }
 
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}

const pickPosition = {x: 0, y: 0};
clearPickPosition();
const pickHelper = new PickHelper();
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
  //const tableGeo = new THREE.CylinderGeometry(20, 20, 1, 64);
  //const table = new THREE.Mesh(tableGeo, tableMat);
  //const tableMat = new THREE.MeshStandardMaterial({ map: textures.table });
  const gltfLoader = new GLTFLoader();
  const url = '/static/assets/table.glb'
  gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    root.receiveShadow = true
    scene.add(root);
  });
  //table.receiveShadow = true;
  //table.position.y = -0.51;
  //scene.add(table);
}

function createHand(xoff, yoff) {
  const positions = [-2.7, 0, 2.7];
  positions.forEach((x, i) => {
    const card = createCard(x, xoff, yoff);
    hand.push(card);
    scene.add(card);
  });
}

let picked = []

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}
 
function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}
 
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);

window.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});
 
window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});
 
window.addEventListener('touchend', clearPickPosition);

function animate() {
  requestAnimationFrame(animate);
  testCard.rotation.y += 0.006;
  hoverTimer += 0.007;
  pickerTimer += 0.001

  hand.forEach((card, i) => {
    card.position.y = 0.2 + Math.cos(hoverTimer + offsets[i]) / 19;
    card.rotation.x = Math.PI / 2 + Math.cos(hoverTimer + offsets[i] * 1.7) / 40;
  });
  
  controls.update();
  pickHelper.pick(pickPosition, scene, camera, pickerTimer);
  renderer.render(scene, camera);

  //Camera Pan
  //cameraKey += 0.001
  //camera.position.set(16 * Math.sin(cameraKey), 8, 16 * Math.cos(cameraKey));
  //camera.lookAt(0, 0, 0);
}
