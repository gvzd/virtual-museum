import * as THREE from 'three';
import { ExhibitManager } from './ExhibitManager';
import { UIManager } from './UIManager';

export class InteractionHandler {
    private camera: THREE.PerspectiveCamera;
    private exhibitManager: ExhibitManager;
    private uiManager: UIManager;
    private selectedExhibit: string | null = null;

    constructor(
        camera: THREE.PerspectiveCamera,
        _renderer: THREE.WebGLRenderer,
        exhibitManager: ExhibitManager,
        uiManager: UIManager
    ) {
        this.camera = camera;
        this.exhibitManager = exhibitManager;
        this.uiManager = uiManager;
    }

    public onMouseClick(event: MouseEvent): void {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        const exhibit = this.exhibitManager.getExhibitAt(mouse, this.camera);
        if (exhibit) {
            this.handleExhibitClick(exhibit);
        } else {
            this.handleEmptyClick();
        }
    }

    private handleExhibitClick(exhibit: any): void {
        const exhibitId = exhibit.getId();
        if (this.selectedExhibit === exhibitId) {
            this.deselectExhibit();
        } else {
            this.selectExhibit(exhibit);
        }
    }

    private handleEmptyClick(): void {
        this.deselectExhibit();
    }

    private selectExhibit(exhibit: any): void {
        if (this.selectedExhibit) {
            this.exhibitManager.deselectAll();
        }
        if (exhibit.getMesh && exhibit.getMesh().userData && exhibit.getMesh().userData.type === 'decor') {
            this.selectedExhibit = null;
            return;
        }
        const exhibitId = exhibit.getId();
        this.selectedExhibit = exhibitId;
        this.exhibitManager.selectExhibit(exhibitId);
        this.uiManager.showDescription(
            exhibit.getTitle(),
            exhibit.getDescription()
        );
    }

    private deselectExhibit(): void {
        if (this.selectedExhibit) {
            this.exhibitManager.deselectAll();
            this.selectedExhibit = null;
            this.uiManager.hideDescription();
        }
    }

    public getSelectedExhibit(): string | null {
        return this.selectedExhibit;
    }

    public isExhibitSelected(): boolean {
        return this.selectedExhibit !== null;
    }
} 