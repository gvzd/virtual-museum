import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';

export interface ExhibitData {
    id: string;
    title: string;
    description: string;
    position: THREE.Vector3;
    modelType: 'glb' | 'decor' | 'picture';
    scale?: THREE.Vector3;
    modelPath: string;
    pedestalHeight?: number;
    standHeight?: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
}

export class Exhibit {
    private id: string;
    private title: string;
    private description: string;
    private mesh: THREE.Group;
    private isSelected: boolean = false;
    private rotationSpeed: number = 0.01;
    private isRotating: boolean = false;
    private originalRotation: THREE.Euler;
    private modelLoader: ModelLoader;
    private isDecor: boolean = false;
    private isPicture: boolean = false;
    private stand: THREE.Mesh | null;
    private standBoundingBox: THREE.Box3 | null = null;

    constructor(data: ExhibitData, modelLoader?: ModelLoader) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.modelLoader = modelLoader || new ModelLoader();
        this.isDecor = data.modelType === 'decor';
        this.isPicture = data.modelType === 'picture';
        this.stand = null;
        let meshPosition = data.position.clone();
        if (!this.isDecor && !this.isPicture) {
            const standHeight = data.standHeight ?? 0.5;
            const standGeometry = new THREE.CylinderGeometry(1, 1, standHeight, 15);
            const standMaterial = new THREE.MeshLambertMaterial({ color: 0xefc03d });
            const stand = new THREE.Mesh(standGeometry, standMaterial);
            stand.position.set(data.position.x, standHeight / 2, data.position.z);
            stand.receiveShadow = true;
            this.stand = stand;
            this.standBoundingBox = new THREE.Box3().setFromObject(stand);
        }
        this.mesh = this.createGLBMesh({ ...data, position: meshPosition });
        this.mesh.position.copy(meshPosition);
        this.mesh.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
            }
        });
        let typeValue;
        if (this.isDecor) {
            typeValue = 'decor';
        } else if (this.isPicture) {
            typeValue = 'picture';
        } else {
            typeValue = 'exhibit';
        }
        this.mesh.userData = {
            type: typeValue,
            id: this.id,
            scale: data.scale
        };
        if (data.scale) {
            this.mesh.scale.copy(data.scale);
        }
        this.originalRotation = this.mesh.rotation.clone();
    }

    private createGLBMesh(data: ExhibitData): THREE.Group {
        const group = new THREE.Group();
        this.loadGLBModel(data.modelPath, group, data.scale);
        return group;
    }

    private async loadGLBModel(modelPath: string, group: THREE.Group, scale?: THREE.Vector3): Promise<void> {
        try {
            await this.modelLoader.loadModel(modelPath);
            const glbInstance = this.modelLoader.createModelInstance(modelPath);
            if (glbInstance) {
                if (scale) {
                    glbInstance.scale.copy(scale);
                }
                glbInstance.traverse((child: THREE.Object3D) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        let typeValue;
                        if (this.isDecor) {
                            typeValue = 'decor';
                        } else if (this.isPicture) {
                            typeValue = 'picture';
                        } else {
                            typeValue = 'exhibit';
                        }
                        child.userData = {
                            type: typeValue,
                            id: this.id,
                            scale: scale
                        };
                    }
                });
                group.add(glbInstance);
                const exhibitData = (this as any).exhibitData as ExhibitData | undefined;
                const rotationX = (exhibitData && exhibitData.rotationX) || (this as any).rotationX || undefined;
                const rotationY = (exhibitData && exhibitData.rotationY) || (this as any).rotationY || undefined;
                const rotationZ = (exhibitData && exhibitData.rotationZ) || (this as any).rotationZ || undefined;
                if (typeof rotationX === 'number') glbInstance.rotation.x = rotationX;
                if (typeof rotationY === 'number') glbInstance.rotation.y = rotationY;
                if (typeof rotationZ === 'number') glbInstance.rotation.z = rotationZ;
                if (!this.isDecor && !this.isPicture) {
                    const box = new THREE.Box3().setFromObject(glbInstance);
                    const minY = box.min.y;
                    let standHeight = 0;
                    if (this.stand) {
                        const standGeo = this.stand.geometry as THREE.CylinderGeometry;
                        standHeight = this.stand.position.y + (standGeo.parameters.height / 2);
                    } else {
                        standHeight = this.mesh.position.y ?? 0;
                    }
                    glbInstance.position.y += standHeight - minY;
                }
            }
        } catch (error) {}
    }

    public select(): void {
        if (this.isDecor || this.isPicture) return;
        this.isSelected = true;
        this.isRotating = true;
        if (this.mesh instanceof THREE.Mesh) {
            const material = this.mesh.material as THREE.MeshLambertMaterial;
            material.emissive.setHex(0x444444);
        } else {
            this.mesh.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat instanceof THREE.MeshLambertMaterial) {
                                mat.emissive.setHex(0x444444);
                            }
                        });
                    } else if (child.material instanceof THREE.MeshLambertMaterial) {
                        child.material.emissive.setHex(0x444444);
                    }
                }
            });
        }
    }

    public deselect(): void {
        if (this.isDecor || this.isPicture) return;
        this.isSelected = false;
        this.isRotating = false;
        if (this.mesh instanceof THREE.Mesh) {
            const material = this.mesh.material as THREE.MeshLambertMaterial;
            material.emissive.setHex(0x000000);
        } else {
            this.mesh.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat instanceof THREE.MeshLambertMaterial) {
                                mat.emissive.setHex(0x000000);
                            }
                        });
                    } else if (child.material instanceof THREE.MeshLambertMaterial) {
                        child.material.emissive.setHex(0x000000);
                    }
                }
            });
        }
        this.mesh.rotation.copy(this.originalRotation);
    }

    public update(): void {
        if (this.isDecor || this.isPicture) return;
        if (this.isRotating) {
            this.mesh.rotation.y += this.rotationSpeed;
        }
    }

    public getMesh(): THREE.Mesh | THREE.Group {
        return this.mesh;
    }

    public getId(): string {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    public getDescription(): string {
        return this.description;
    }

    public isExhibitSelected(): boolean {
        return this.isSelected;
    }

    public getPosition(): THREE.Vector3 {
        return this.mesh.position.clone();
    }

    public setRotationSpeed(speed: number): void {
        this.rotationSpeed = speed;
    }

    public dispose(): void {
        if (this.mesh instanceof THREE.Mesh) {
            this.mesh.geometry.dispose();
            if (Array.isArray(this.mesh.material)) {
                this.mesh.material.forEach(mat => mat.dispose());
            } else {
                this.mesh.material.dispose();
            }
        } else {
            this.mesh.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }

    public getStand(): THREE.Mesh | null {
        return this.stand;
    }

    public getStandBoundingBox(): THREE.Box3 | null {
        return this.standBoundingBox;
    }
} 