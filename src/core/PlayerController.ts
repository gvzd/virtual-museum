import * as THREE from 'three';

export class PlayerController {
    private camera: THREE.PerspectiveCamera;
    private velocity: THREE.Vector3;
    private keys: { [key: string]: boolean };
    private mouseX: number = 0;
    private mouseY: number = 0;
    private isPointerLocked: boolean = false;
    private pitch: number = 0;
    private yaw: number = 0;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.keys = {};
        this.camera.position.set(0, 2, 10);
    }

    public setup(): void {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        document.addEventListener('mousemove', (event) => {
            if (this.isPointerLocked) {
                this.mouseX = event.movementX || 0;
                this.mouseY = event.movementY || 0;
            }
        });
        document.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            }
        });
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement !== null;
        });
        this.yaw = this.camera.rotation.y;
        this.pitch = this.camera.rotation.x;
    }

    public update(): void {
        this.handleMovement();
        this.handleRotation();
    }

    private handleMovement(): void {
        const speed = 0.05;
        this.velocity.set(0, 0, 0);
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3();
        right.crossVectors(forward, this.camera.up).normalize();
        if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['KeyЦ']) {
            this.velocity.add(forward.clone().multiplyScalar(speed));
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['KeyЫ']) {
            this.velocity.add(forward.clone().multiplyScalar(-speed));
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['KeyФ']) {
            this.velocity.add(right.clone().multiplyScalar(-speed));
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['KeyВ']) {
            this.velocity.add(right.clone().multiplyScalar(speed));
        }
        const floorWidth = 25;
        const floorDepth = 25;
        const margin = 0.5;
        const minX = -floorWidth / 2 + margin;
        const maxX = floorWidth / 2 - margin;
        const minZ = -floorDepth / 2 + margin;
        const maxZ = floorDepth / 2 - margin;
        const newX = this.camera.position.x + this.velocity.x;
        const newZ = this.camera.position.z + this.velocity.z;
        if (newX >= minX && newX <= maxX) {
            this.camera.position.x = newX;
        }
        if (newZ >= minZ && newZ <= maxZ) {
            this.camera.position.z = newZ;
        }
    }

    private handleRotation(): void {
        if (!this.isPointerLocked) return;
        const sensitivity = 0.002;
        this.yaw -= this.mouseX * sensitivity;
        this.pitch -= this.mouseY * sensitivity;
        const pitchLimit = Math.PI / 2 - 0.05;
        this.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, this.pitch));
        this.camera.rotation.set(this.pitch, this.yaw, 0);
        this.mouseX = 0;
        this.mouseY = 0;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public getPosition(): THREE.Vector3 {
        return this.camera.position.clone();
    }

    public dispose(): void {
        document.removeEventListener('keydown', () => {});
        document.removeEventListener('keyup', () => {});
        document.removeEventListener('mousemove', () => {});
        document.removeEventListener('click', () => {});
        document.removeEventListener('pointerlockchange', () => {});
    }
} 