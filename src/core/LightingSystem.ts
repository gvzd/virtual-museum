import * as THREE from 'three';

export class LightingSystem {
    private scene: THREE.Scene;
    private pointLight: THREE.PointLight;
    private cornerLights: THREE.PointLight[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.pointLight = new THREE.PointLight(0xffffff, 50, 1000);
        this.pointLight.position.set(0, 4, 0);
        this.pointLight.castShadow = true;
        this.scene.add(this.pointLight);
        const cornerPositions = [
            [-12.5, 9, -12.5],
            [12.5, 9, -12.5],
            [-12.5, 9, 12.5],
            [12.5, 9, 12.5]
        ];
        for (const pos of cornerPositions) {
            const light = new THREE.PointLight(0xffffff, 60, 500);
            light.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(light);
            this.cornerLights.push(light);
        }
    }

    public setup(): void {}

    public dispose(): void {
        this.scene.remove(this.pointLight);
        for (const light of this.cornerLights) {
            this.scene.remove(light);
        }
        this.cornerLights = [];
    }
} 