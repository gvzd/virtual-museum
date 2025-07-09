import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadedModel {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
    originalScale: THREE.Vector3;
}

export class ModelLoader {
    private loader: GLTFLoader;
    private loadedModels: Map<string, LoadedModel>;
    private loadingPromises: Map<string, Promise<LoadedModel>>;

    constructor() {
        this.loader = new GLTFLoader();
        this.loadedModels = new Map();
        this.loadingPromises = new Map();
    }

    public async loadModel(modelPath: string): Promise<LoadedModel> {
        if (this.loadedModels.has(modelPath)) {
            return this.loadedModels.get(modelPath)!;
        }
        if (this.loadingPromises.has(modelPath)) {
            return this.loadingPromises.get(modelPath)!;
        }
        const loadPromise = new Promise<LoadedModel>((resolve, reject) => {
            this.loader.load(
                modelPath,
                (gltf) => {
                    const model: LoadedModel = {
                        scene: gltf.scene,
                        animations: gltf.animations,
                        originalScale: this.calculateOriginalScale(gltf.scene)
                    };
                    this.setupModel(model.scene);
                    this.loadedModels.set(modelPath, model);
                    this.loadingPromises.delete(modelPath);
                    resolve(model);
                },
                () => {},
                (error) => {
                    this.loadingPromises.delete(modelPath);
                    reject(error);
                }
            );
        });
        this.loadingPromises.set(modelPath, loadPromise);
        return loadPromise;
    }

    private setupModel(scene: THREE.Group): void {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => this.enhanceMaterial(mat));
                    } else {
                        this.enhanceMaterial(child.material);
                    }
                }
            }
        });
    }

    private enhanceMaterial(material: THREE.Material): void {
        if (material instanceof THREE.MeshStandardMaterial) {
            material.shadowSide = THREE.FrontSide;
        }
        if (material instanceof THREE.MeshLambertMaterial || 
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshStandardMaterial) {
            material.needsUpdate = true;
        }
    }

    private calculateOriginalScale(scene: THREE.Group): THREE.Vector3 {
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDimension;
        return new THREE.Vector3(scale, scale, scale);
    }

    public createModelInstance(modelPath: string): THREE.Group | null {
        const loadedModel = this.loadedModels.get(modelPath);
        if (!loadedModel) {
            return null;
        }
        const clonedScene = loadedModel.scene.clone();
        return clonedScene;
    }

    public getModelAnimations(modelPath: string): THREE.AnimationClip[] {
        const loadedModel = this.loadedModels.get(modelPath);
        return loadedModel ? loadedModel.animations : [];
    }

    public isModelLoaded(modelPath: string): boolean {
        return this.loadedModels.has(modelPath);
    }

    public clearCache(): void {
        this.loadedModels.clear();
        this.loadingPromises.clear();
    }

    public getLoadedModels(): string[] {
        return Array.from(this.loadedModels.keys());
    }
} 