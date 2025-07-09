import * as THREE from 'three';
import { Exhibit, ExhibitData } from './Exhibit';

export class ExhibitManager {
    private scene: THREE.Scene;
    private exhibits: Map<string, Exhibit>;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.exhibits = new Map();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    public addExhibit(data: ExhibitData): void {
        const exhibit = new Exhibit(data);
        this.exhibits.set(data.id, exhibit);
        this.scene.add(exhibit.getMesh());
        const stand = exhibit.getStand();
        if (stand) {
            this.scene.add(stand);
        }
    }

    public addDemoExhibits(): void {
        this.addGLBExhibits();
    }

    private addGLBExhibits(): void {
        const floorWidth = 25;
        const floorDepth = 25;
        const margin = 3;
        const halfW = floorWidth / 2 - margin;
        const halfD = floorDepth / 2 - margin;
        const exp1 = {
            id: 'exp1',
            title: 'Роботическая рука',
            description: 'пропрлорлпроапрпрлпропарвпропролпарапторпропррлпр',
            position: new THREE.Vector3(-halfW, 1, -halfD),
            modelType: 'glb' as 'glb',
            modelPath: '/models/industrial_robotic_arm.glb',
            scale: new THREE.Vector3(1.5, 1.5, 1.5),
            standHeight: 1.2
        };
        const exp4 = {
            id: 'exp4',
            title: 'Процессор Intel 8086',
            description: 'Intel 8086 — первый 16-битный микропроцессор компании Intel. Разрабатывался с весны 1976 года и выпущен 8 июня 1978 года. Реализованная в процессоре архитектура набора команд стала основой широко известной архитектуры x86. Процессоры этой архитектуры стали наиболее успешной линией процессоров Intel.',
            position: new THREE.Vector3(halfW, 1.75, halfD),
            modelType: 'glb' as 'glb',
            modelPath: '/models/cpu_intel_8086.glb',
            scale: new THREE.Vector3(0.35, 0.35, 0.35),
            rotationZ: Math.PI / 2,
            standHeight: 1.5
        };
        const exp3 = {
            id: 'exp3',
            title: 'Двигатель самолета',
            description: 'Двигатель самолета без текстуры',
            position: new THREE.Vector3(-halfW, 2.1, halfD),
            modelType: 'glb' as 'glb',
            modelPath: '/models/airplane_engine.glb',
            scale: new THREE.Vector3(0.06, 0.06, 0.06),
            standHeight: 1.5
        };
        const exp2 = {
            id: 'exp2',
            title: 'Калькулятор',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et sodales tellus. Quisque ut enim efficitur, dignissim sem faucibus, sagittis sem. Nullam libero eros, convallis id feugiat a, condimentum sit amet erat. Sed eget risus urna.',
            modelType: 'glb' as 'glb',
            modelPath: '/models/calculator.glb',
            position: new THREE.Vector3(halfW, 2, -halfD),
            scale: new THREE.Vector3(0.03, 0.03, 0.03),
            rotationY: Math.PI / 2,
            standHeight: 1.5
        };
        const exp7 = {
            id: 'exp7',
            title: 'КАИ-1',
            description: '3D модель учебного самолета КАИ-1, созданная в blender в рамках лабораторных работ "Компьютерная графика".',
            position: new THREE.Vector3(0, 1.5, 0),
            modelType: 'glb' as 'glb',
            modelPath: '/models/2.glb',
            scale: new THREE.Vector3(0.12, 0.12, 0.12),
            standHeight: 1.5
        };
        const exp5 = {
            id: 'exp5',
            title: 'Лампадка',
            description: 'Лампадка, изготовленная на «Николаевском хрустально- стекольном заводе торгового дома». Если в летнее время еще можно было отправлять продукцию из Казани на юг, то зимой вся перевозка останавливалась, хрусталь и другие изделия сортового стекла не находили сбыта. Казань оказалась вдали от железных дорог, связывающих юг и восток с центром России. С производства были сняты трудоемкие и стеклоемкие изделия. За счет этого увеличился выпуск изделий массового потребления: ламповые стекла, лампадки, мухоловки.',
            position: new THREE.Vector3(-halfW, 0, 0),
            modelType: 'glb' as 'glb',
            modelPath: '/models/1.glb',
            scale: new THREE.Vector3(1, 1, 1),
            standHeight: 1.5
        };
        const exp8 = {
            id: 'exp8',
            title: 'ТУ-144',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et sodales tellus. Quisque ut enim efficitur, dignissim sem faucibus, sagittis sem. Nullam libero eros, convallis id feugiat a, condimentum sit amet erat. Sed eget risus urna.',
            position: new THREE.Vector3(4, 2.5, 0),
            modelType: 'decor' as 'decor',
            modelPath: '/models/tu144.glb',
            scale: new THREE.Vector3(0.41, 0.41, 0.41),
            standHeight: 1.5
        };
        const decor1 = {
            id: 'decor1',
            title: 'Люстра',
            description: 'Декоративная люстра',
            position: new THREE.Vector3(0, 4.6, 0),
            modelType: 'decor' as 'decor',
            modelPath: '/models/lustra.glb',
            scale: new THREE.Vector3(0.35, 0.35, 0.35)
        };
        [exp1, exp2, exp3, exp4, exp5, exp7, exp8, decor1].forEach(exhibitData => {
            if (exhibitData.modelPath) {
                fetch(exhibitData.modelPath, { method: 'HEAD' })
                    .then(response => {
                        if (response.ok) {
                            this.addExhibit(exhibitData);
                        }
                    })
                    .catch(() => {});
            }
        });
    }

    public getExhibitAt(mousePosition: THREE.Vector2, camera: THREE.PerspectiveCamera): Exhibit | null {
        this.mouse.copy(mousePosition);
        this.raycaster.setFromCamera(this.mouse, camera);
        const exhibitObjects: THREE.Object3D[] = [];
        this.exhibits.forEach(exhibit => {
            exhibitObjects.push(exhibit.getMesh());
        });
        const intersects = this.raycaster.intersectObjects(exhibitObjects);
        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const exhibitId = intersectedMesh.userData.id;
            return this.exhibits.get(exhibitId) || null;
        }
        return null;
    }

    public selectExhibit(exhibitId: string): void {
        this.exhibits.forEach(exhibit => {
            exhibit.deselect();
        });
        const exhibit = this.exhibits.get(exhibitId);
        if (exhibit) {
            exhibit.select();
        }
    }

    public deselectAll(): void {
        this.exhibits.forEach(exhibit => {
            exhibit.deselect();
        });
    }

    public getExhibitById(id: string): Exhibit | undefined {
        return this.exhibits.get(id);
    }

    public getAllExhibits(): Exhibit[] {
        return Array.from(this.exhibits.values());
    }

    public update(): void {
        this.exhibits.forEach(exhibit => {
            exhibit.update();
        });
    }

    public removeExhibit(id: string): void {
        const exhibit = this.exhibits.get(id);
        if (exhibit) {
            this.scene.remove(exhibit.getMesh());
            exhibit.dispose();
            this.exhibits.delete(id);
        }
    }

    public clear(): void {
        this.exhibits.forEach(exhibit => {
            this.scene.remove(exhibit.getMesh());
        });
        this.exhibits.clear();
    }

    public dispose(): void {
        this.clear();
    }
} 