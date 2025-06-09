import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTerrain } from './terrain.js';
import { createTrees, createRocks } from './props.js';

let scene, camera, renderer, controls, water, clock;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 400, 1200);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 120, 400);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    clock = new THREE.Clock();

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 20, 0);
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 80;
    controls.maxDistance = 800;
    controls.enableDamping = true;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(-30, 50, -30);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 310;
    dirLight.shadow.camera.bottom = -310;
    dirLight.shadow.camera.left = -260;
    dirLight.shadow.camera.right = 260;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);

    // Create terrain
    const terrain = createTerrain();
    scene.add(terrain);

    // Add props
    const trees = createTrees(terrain);
    scene.add(trees);

    const rocks = createRocks(terrain);
    scene.add(rocks);

    // Water
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x60A3D9,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        metalness: 0.2,
    });
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 5.5; // Water level
    water.receiveShadow = true;
    scene.add(water);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Animate water
    const waterVertices = water.geometry.attributes.position;
    for (let i = 0; i < waterVertices.count; i++) {
        const x = waterVertices.getX(i);
        const y = waterVertices.getY(i);
        const wave1 = Math.sin(x * 0.05 + elapsedTime * 0.5) * 0.3;
        const wave2 = Math.sin(y * 0.06 + elapsedTime * 0.8) * 0.3;
        waterVertices.setZ(i, wave1 + wave2);
    }
    water.geometry.attributes.position.needsUpdate = true;
    water.geometry.computeVertexNormals();

    controls.update();
    renderer.render(scene, camera);
}

init();
animate();