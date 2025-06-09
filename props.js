import * as THREE from 'three';

function createTree(x, y, z) {
    const tree = new THREE.Group();

    const trunkHeight = Math.random() * 2 + 3;
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 5);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, flatShading: true });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    const leavesHeight = Math.random() * 4 + 4;
    const leavesGeometry = new THREE.IcosahedronGeometry(leavesHeight / 2, 0);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50, flatShading: true });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = trunkHeight;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    tree.add(leaves);

    tree.position.set(x, y, z);
    const scale = Math.random() * 0.2 + 0.8;
    tree.scale.set(scale, scale, scale);
    tree.rotation.y = Math.random() * Math.PI * 2;

    return tree;
}

export function createTrees(terrainMesh) {
    const trees = new THREE.Group();
    const treeCount = 600;
    const placementArea = { x: 290, z: 390 };
    const grassLevel = 7;
    const rockLevel = 20;
    const riverWidth = 8;
    
    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);

    for (let i = 0; i < treeCount; i++) {
        const x = (Math.random() - 0.5) * placementArea.x;
        const z = (Math.random() - 0.5) * placementArea.z;

        if (Math.abs(z) < riverWidth) continue;

        raycaster.set(new THREE.Vector3(x, 50, z), down);
        const intersects = raycaster.intersectObject(terrainMesh);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            if (point.y > grassLevel && point.y < rockLevel) {
                trees.add(createTree(point.x, point.y, point.z));
            }
        }
    }
    return trees;
}

function createRock(x, y, z) {
    const rockSize = Math.random() * 2 + 1;
    const detail = Math.random() < 0.5 ? 0 : 1;
    const geometry = new THREE.IcosahedronGeometry(rockSize, detail);
    const material = new THREE.MeshStandardMaterial({ color: 0xADADAD, flatShading: true });
    const rock = new THREE.Mesh(geometry, material);
    rock.position.set(x, y + rockSize / 4, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
}

export function createRocks(terrainMesh) {
    const rocks = new THREE.Group();
    const rockCount = 400;
    const placementArea = { x: 290, z: 390 };
    const riverWidth = 8;
    const grassLevel = 7;
    const rockLevel = 20;

    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);

    for (let i = 0; i < rockCount; i++) {
        const x = (Math.random() - 0.5) * placementArea.x;
        const z = (Math.random() - 0.5) * placementArea.z;

        if (Math.abs(z) > riverWidth - 2 && Math.abs(z) < riverWidth + 4) {
             // more rocks near river
        } else if (Math.random() > 0.3) {
            continue;
        }

        raycaster.set(new THREE.Vector3(x, 50, z), down);
        const intersects = raycaster.intersectObject(terrainMesh);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            if (point.y < grassLevel || point.y > rockLevel) {
                 rocks.add(createRock(point.x, point.y, point.z));
            }
        }
    }
    return rocks;
}