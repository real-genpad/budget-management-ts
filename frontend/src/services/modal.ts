import {HttpUtilsResultType} from "../types/http/http-utils.type";
import {OpenRouteType} from "../types/router/open-route.type";
import {BalanceType} from "../types/router/balance.type";
import {HttpUtils} from "../utils/http-utils";
import {DefaultErrorResponseType} from "../types/http/default-error-respponse.type";

export class CustomModal {
    readonly openNewRoute: OpenRouteType;
    private balanceElement: HTMLElement
    private modalElement: HTMLElement;
    readonly inputElement: HTMLInputElement;
    private confirmButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private bodyElement: HTMLBodyElement;
    private modalBackdrop!: HTMLElement;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;
        this.balanceElement = document.getElementById('balance') as HTMLElement;
        this.modalElement = document.getElementById('customModal') as HTMLElement;
        this.inputElement = document.getElementById('edit-balance') as HTMLInputElement;
        this.confirmButton = document.getElementById('confirm-balance-btn') as HTMLButtonElement;
        this.cancelButton = document.getElementById('cancel-balance-btn') as HTMLButtonElement;
        this.bodyElement = document.querySelector('body') as HTMLBodyElement;


        this.confirmButton.addEventListener('click', () => {
            this.editBalance();
            this.closeModal();
        });

        this.cancelButton.addEventListener('click', () => {
            this.closeModal();
        });
        // this.addEventListeners();
    }

    public open() {
        this.modalElement.classList.add('show');
        this.modalElement.style.display = 'block';
        this.bodyElement.style.overflow = 'hidden';
        this.bodyElement.style.paddingRight = '17px';
        this.createBackdrop();
    }

    // private addEventListeners() {
    //     this.confirmButton.addEventListener('click', () => {
    //         this.editBalance();
    //         this.closeModal();
    //     });
    //
    //     this.cancelButton.addEventListener('click', () => {
    //         this.closeModal();
    //     });
    // }

    private closeModal() {
        this.modalElement.classList.remove('show');
        this.modalElement.style.display = '';
        this.bodyElement.style.overflow = '';
        this.bodyElement.style.paddingRight = '';
        this.removeBackdrop();
    }

    private createBackdrop(): void {
        this.modalBackdrop = document.createElement('div');
        this.modalBackdrop.className = 'modal-backdrop fade';
        this.bodyElement.appendChild(this.modalBackdrop);
        this.modalBackdrop.classList.add('show');
    }

    private removeBackdrop(): void {
        this.modalBackdrop.classList.remove('show');
        this.modalBackdrop.remove();
    }

    private async editBalance(): Promise<void> {
        const newBalance: string | undefined = this.inputElement?.value;
        const result: HttpUtilsResultType<BalanceType> = await HttpUtils.request('/balance', 'PUT', true, {
            newBalance
        });

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        const response: DefaultErrorResponseType | BalanceType | null = result.response;
        if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
            return alert('Возникла ошибка при обновлении баланса');
        }
        if (response && 'balance' in response && this.inputElement) {
            this.balanceElement.innerText = String(response.balance);
        }
    }
}