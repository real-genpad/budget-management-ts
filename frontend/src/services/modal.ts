import {HttpUtilsResultType} from "../types/http/http-utils.type";
import {OpenRouteType} from "../types/router/open-route.type";
import {BalanceType} from "../types/router/balance.type";
import {HttpUtils} from "../utils/http-utils";
import {DefaultErrorResponseType} from "../types/http/default-error-respponse.type";

export class CustomModal {
    readonly openNewRoute: OpenRouteType;
    private modalElement: HTMLElement;
    readonly inputElement: HTMLInputElement;
    private confirmButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    readonly balanceElementMenu: HTMLInputElement;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;
        this.modalElement = document.getElementById('customModal') as HTMLElement;
        this.inputElement = document.getElementById('edit-balance') as HTMLInputElement;
        this.balanceElementMenu = document.getElementById('balance-menu') as HTMLInputElement;
        this.confirmButton = document.getElementById('confirm-balance-btn') as HTMLButtonElement;
        this.cancelButton = document.getElementById('cancel-balance-btn') as HTMLButtonElement;

        this.addEventListeners();
    }

    public open() {
        this.modalElement.style.display = 'block';
    }

    private addEventListeners() {
        this.confirmButton.addEventListener('click', () => {
            this.editBalance();
            this.closeModal();
        });

        this.cancelButton.addEventListener('click', () => {
            this.closeModal();
        });
    }

    private closeModal() {
        this.modalElement.style.display = 'none';
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
            this.inputElement.innerText = String(response.balance);
            this.balanceElementMenu.innerText = String(response.balance);
        }
    }
}