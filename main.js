import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  90, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 5, 12)
camera.lookAt(0,0,0)

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load textures
const loader = new THREE.TextureLoader();
const blankTexture = await loader.loadAsync('blank.png');
const backTexture = await loader.loadAsync('back.png');
const pileTexture = await loader.loadAsync('pile.png')
blankTexture.colorSpace = THREE.SRGBColorSpace;
backTexture.colorSpace = THREE.SRGBColorSpace;
pileTexture.colorSpace = THREE.SRGBColorSpace;

const cardGeometry = new THREE.PlaneGeometry(2.5, 3.5);
const deckGeometry = new THREE.BoxGeometry(2.5, 3.5, 1);

const cards = [];
const spacingX = 3;
const spacingY = 4;

//Load Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // soft white light
scene.add(ambientLight);

// Directional light (like sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 7.5); // x, y, z
scene.add(directionalLight);


const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // This is the center of orbit
controls.enableDamping = true; // smooth motion
controls.dampingFactor = 0.05;

// Create card group with front and back
function createCard(x, y, z) {
  const front = new THREE.Mesh(cardGeometry, new THREE.MeshStandardMaterial({ map: blankTexture }));
  const back = new THREE.Mesh(cardGeometry, new THREE.MeshStandardMaterial({ map: backTexture }));
  back.rotation.y = Math.PI;

  const card = new THREE.Group();
  card.rotation.x = Math.PI/2
  card.add(front);
  card.add(back);
  card.position.set(x, y, z);
  return card;
}


// Deck
for (let i = 0; i < 40; i++){
  const card = createCard (0, (i * 0.02), 0 )
  cards.push(card);
  scene.add(card);
}

var card2 = createCard(0, 4, 0);
card2.rotation.y = Math.PI/2
card2.rotation.z = Math.PI/2
cards.push(card2);
scene.add(card2);

const pile = new THREE.Mesh(cardGeometry, new THREE.MeshStandardMaterial({map: pileTexture}));
pile.position.z = 4
pile.rotation.x = -Math.PI/2
cards.push(pile);
scene.add(pile)

function animate() {
  requestAnimationFrame(animate);
  card2.rotation.x += 0.005
  controls.update(); // required for damping
  renderer.render(scene, camera);
}
animate();
