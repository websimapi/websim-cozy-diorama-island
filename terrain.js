import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

export function createTerrain() {
    const width = 500;
    const height = 600;
    const widthSegments = 250;
    const heightSegments = 300;

    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    geometry.rotateX(-Math.PI / 2);

    const noise = new ImprovedNoise();
    const positions = geometry.attributes.position;
    const colors = [];

    const sandColor = new THREE.Color(0xEEDC82);
    const grassColor = new THREE.Color(0x55AE3A);
    const rockColor = new THREE.Color(0xA9A9A9);
    const darkRockColor = new THREE.Color(0x696969);

    const terrainLevels = {
        sand: 7,
        grass: 20,
        rock: 30,
    };

    const riverCenterZ = 0;
    const riverWidth = 5;
    const riverDepth = 4;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // Cylindrical curve
        const curveFactor = 0.0004;
        let y = - (x * x * curveFactor);

        // Add noise for terrain height
        const quality = 1.5;
        let h = noise.noise(x / 200 * quality, z / 200 * quality, 0) * 15;
        h += noise.noise(x / 80 * quality, z / 80 * quality, 0) * 8;
        h += noise.noise(x / 30 * quality, z / 30 * quality, 0) * 3;
        
        y += h;

        // Create cliffs by tiering height
        if (y < terrainLevels.grass) {
             y = Math.floor(y/1.5)*1.5;
        } else {
            y = Math.floor(y/2)*2;
        }

        // River carving
        const riverDist = Math.abs(z - riverCenterZ);
        if (riverDist < riverWidth) {
            const riverProfile = Math.cos((riverDist / riverWidth) * (Math.PI/2));
            y -= riverDepth * riverProfile;
            y = Math.max(y, 4.0); // River bed floor
        }
        
        positions.setY(i, y);

        // Set vertex colors based on height
        let color;
        const isRiverBed = riverDist < riverWidth + 2 && y < terrainLevels.sand;

        if (isRiverBed) {
            color = darkRockColor;
        } else if (y < terrainLevels.sand) {
            color = sandColor;
        } else if (y < terrainLevels.rock) {
            color = grassColor;
        } else {
            color = rockColor;
        }
        
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    
    return mesh;
}