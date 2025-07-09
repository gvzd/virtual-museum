export class UIManager {
    private descriptionPanel: HTMLElement | null;
    private titleElement: HTMLElement | null;
    private descriptionElement: HTMLElement | null;

    constructor() {
        this.descriptionPanel = document.getElementById('description-panel');
        this.titleElement = document.getElementById('exhibit-title');
        this.descriptionElement = document.getElementById('exhibit-description');
    }

    public showDescription(title: string, description: string): void {
        if (this.descriptionPanel && this.titleElement && this.descriptionElement) {
            this.titleElement.textContent = title;
            this.descriptionElement.textContent = description;
            this.descriptionPanel.style.display = 'block';
            this.descriptionPanel.style.opacity = '0';
            this.descriptionPanel.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => {
                if (this.descriptionPanel) {
                    this.descriptionPanel.style.transition = 'all 0.3s ease';
                    this.descriptionPanel.style.opacity = '1';
                    this.descriptionPanel.style.transform = 'translateX(-50%) translateY(0)';
                }
            }, 10);
        }
    }

    public hideDescription(): void {
        if (this.descriptionPanel) {
            this.descriptionPanel.style.transition = 'all 0.3s ease';
            this.descriptionPanel.style.opacity = '0';
            this.descriptionPanel.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => {
                if (this.descriptionPanel) {
                    this.descriptionPanel.style.display = 'none';
                }
            }, 300);
        }
    }

    public updateInfo(text: string): void {
        const infoElement = document.querySelector('#ui-overlay p');
        if (infoElement) infoElement.textContent = text;
    }

    public showLoadingMessage(): void {
        this.updateInfo('Загрузка экспонатов...');
    }

    public showReadyMessage(): void {
        this.updateInfo('Подойдите к экспонатам и нажмите на них для просмотра');
    }

    public showInteractionHint(): void {
        this.updateInfo('Нажмите на экспонат для взаимодействия');
    }

    public isDescriptionVisible(): boolean {
        return this.descriptionPanel ? this.descriptionPanel.style.display !== 'none' : false;
    }
} 