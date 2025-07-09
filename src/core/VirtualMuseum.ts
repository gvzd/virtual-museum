import * as THREE from 'three';
import { PlayerController } from './PlayerController';
import { ExhibitManager } from './ExhibitManager';
import { LightingSystem } from './LightingSystem';
import { UIManager } from './UIManager';
import { InteractionHandler } from './InteractionHandler';

export class VirtualMuseum {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private playerController: PlayerController;
    private exhibitManager: ExhibitManager;
    private lightingSystem: LightingSystem;
    private uiManager: UIManager;
    private interactionHandler: InteractionHandler;
    private animationId: number | null = null;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.exhibitManager = new ExhibitManager(this.scene);
        this.playerController = new PlayerController(this.camera);
        this.lightingSystem = new LightingSystem(this.scene);
        this.uiManager = new UIManager();
        this.interactionHandler = new InteractionHandler(
            this.camera, 
            this.renderer, 
            this.exhibitManager, 
            this.uiManager
        );
    }

    public init(): void {
        const container = document.getElementById('canvas-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
        }
        this.setupScene();
        this.setupLighting();
        this.setupExhibits();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    private setupScene(): void {
        const floorWidth = 25;
        const floorDepth = 25;
        const loader = new THREE.TextureLoader();
        const floorTexture = loader.load('floor.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(5, 5);
        const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
        const floorMaterial = new THREE.MeshLambertMaterial({ map: floorTexture, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);
        const ceilingGeometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
        const ceilingTexture = loader.load('p.jpg');
        ceilingTexture.wrapS = THREE.RepeatWrapping;
        ceilingTexture.wrapT = THREE.RepeatWrapping;
        ceilingTexture.repeat.set(2, 4);
        const ceilingMaterial = new THREE.MeshLambertMaterial({ map: ceilingTexture, side: THREE.DoubleSide });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = 9;
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);
        const wallTexture = loader.load('wall1.jpg');
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(4, 2);
        this.createWalls(floorWidth, floorDepth, wallTexture);
    }

    private createWalls(floorWidth: number, floorDepth: number, wallTexture: THREE.Texture): void {
        const wallHeight = 10;
        const wallY = wallHeight / 2 - 1;
        const wallMaterial = new THREE.MeshLambertMaterial({ map: wallTexture, side: THREE.DoubleSide });
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(floorWidth, wallHeight),
            wallMaterial
        );
        backWall.position.set(0, wallY, -floorDepth / 2);
        this.scene.add(backWall);
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(floorDepth, wallHeight),
            wallMaterial
        );
        leftWall.position.set(-floorWidth / 2, wallY, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
        const frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(floorWidth, wallHeight),
            wallMaterial
        );
        frontWall.position.set(0, wallY, floorDepth / 2);
        frontWall.rotation.y = Math.PI;
        this.scene.add(frontWall);
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(floorDepth, wallHeight),
            wallMaterial
        );
        rightWall.position.set(floorWidth / 2, wallY, 0);
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
    }

    private setupLighting(): void {
        this.lightingSystem.setup();
    }

    private setupExhibits(): void {
        this.exhibitManager.addDemoExhibits();
    }

    private setupControls(): void {
        this.playerController.setup();
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.renderer.domElement.addEventListener('click', (event) => {
            this.interactionHandler.onMouseClick(event);
        });
        const closeButton = document.getElementById('close-description');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.uiManager.hideDescription();
            });
        }
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.playerController.update();
        this.exhibitManager.update();
        this.renderer.render(this.scene, this.camera);
    }

    public dispose(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.renderer.dispose();
        this.exhibitManager.dispose();
        this.playerController.dispose();
    }
} 