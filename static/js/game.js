import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// === Globals ===
let scene, camera, renderer, controls;
let textures = {};
let testCard;
let cameraKey = 0;
const cards = [];
const hand = [];
let hoverTimer = 0;
const offsets = Array.from({ length: 3 }, () => Math.random() * 2 * Math.PI);
let cardFont;


// === Init Functions ===
initScene();
await loadFonts();
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
//

function loadFonts() {
  const fontLoader = new FontLoader();
  fontLoader.load('/assets/Roboto_Regular.json', font => {
    console.log("Font loaded:\n", font)
    cardFont = font;
  });
}

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

  scene.add( new THREE.AmbientLight(0xffffff, 0.4) );

  const dirLight = new THREE.DirectionalLight(0xffffff, 4);
  dirLight.position.set(30, 20, 20);
  dirLight.castShadow = true;
  dirLight.target.position.set(-5, 0, 0);
  dirLight.shadow.camera.left   = -40;
  dirLight.shadow.camera.right  =  40;
  dirLight.shadow.camera.top    =  40;
  dirLight.shadow.camera.bottom = -40;
  dirLight.shadow.camera.near   =  0.5;
  dirLight.shadow.camera.far    = 100;
  scene.add(dirLight);
  scene.add(dirLight.target);
  //scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
}

function createCard(x, y, z, label = '') {
  const card = new THREE.Group();

  // front + back as before…
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 3.5),
    new THREE.MeshStandardMaterial({ map: textures.blank, transparent: true })
  );
  front.castShadow = true;
  front.receiveShadow= true;
  
  card.add(front);

  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 3.5),
    new THREE.MeshStandardMaterial({ map: textures.back, transparent: true })
  );
  back.rotation.y = Math.PI;
  back.castShadow = true;
  back.receiveShadow = true;
  card.add(back);

  // only if the font has loaded
  if (cardFont && label) {
    // ← use TextGeometry directly
    const textGeo = new TextGeometry(label, {
      font:        cardFont,
      size:        0.4,
      height:      0.0005,
      curveSegments: 4
    });
    textGeo.computeBoundingBox();
    const bb = textGeo.boundingBox;
    const textWidth = bb.max.x - bb.min.x;

    const textMesh = new THREE.Mesh(
      textGeo,
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );

    const halfH = 3.5/2;
    textMesh.position.set(
      -textWidth/2,
      halfH - 0.6,
      0.01
    );
    //textMesh.position.z = 0.025 + 0.001;  // half of 0.05 extrusion + small offset
    textMesh.scale.z = 0.001
    card.add(textMesh);
  } else {
    if (!cardFont) {
      console.log("Card font is null.")
    }
    if (!label) {
      console.log("Label is null.")
    }
  }

  card.position.set(x, y, z);
  card.rotation.x = Math.PI/2;
  cards.push(card)
  return card;
}


function createDeck() {
  const suits = ["🍵", "🏒", "🪙", "⚔️"]
  const values = ["1", "2", "3", "4", "5", "6", "7", "10", "11", "12"]
  let i = 0; 
  suits.forEach(suit => {
    values.forEach(value => {
      const card = createCard(4, i * 0.02, 0, value + "of" + suit);
      cards.push(card);
      scene.add(card);
      i+=1
    });
  });

  testCard = createCard(0, 2, 0, "12 of Swords");
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
  const loader = new GLTFLoader();

  loader.load(
    'assets/table.glb', gltf => {
      gltf.scene.position.y = -0.05
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    scene.add( gltf.scene );
  });

}


function createHand(xoff, yoff) {
  const positions = [-2.7, 0, 2.7];
  positions.forEach((x, i) => {
    const card = createCard(x, xoff, yoff, "Test");
    hand.push(card);
    scene.add(card);
  });
}


function animate() {
  requestAnimationFrame(animate);
  testCard.rotation.y += 0.008;
  hoverTimer += 0.007;

  hand.forEach((card, i) => {
    card.position.y = 0.2 + Math.cos(hoverTimer + offsets[i]) / 19;
    card.rotation.x = Math.PI / 2 + Math.cos(hoverTimer + offsets[i] * 1.7) / 40;
  });
  
  controls.update();
  renderer.render(scene, camera);

  //Camera Pan
  //cameraKey += 0.001
  //camera.position.set(16 * Math.sin(cameraKey), 8, 16 * Math.cos(cameraKey));
  //camera.lookAt(0, 0, 0);
}

window.addEventListener('resize', () => {
      camera.aspect = innerWidth/innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
