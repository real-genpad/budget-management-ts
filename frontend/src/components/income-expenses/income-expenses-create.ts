import {HttpUtils} from "../../utils/http-utils";
import {OpenRouteType} from "../../types/router/open-route.type";
import {HttpUtilsResultType} from "../../types/http/http-utils.type";
import {CategoriesType} from "../../types/categories/categories.type";
import {OperationsType} from "../../types/operations/operations.type";
import {DefaultErrorResponseType} from "../../types/http/default-error-respponse.type";

export class IncomeAndExpensesCreate {
    readonly openNewRoute: OpenRouteType;
    private incomeOperation: CategoriesType[];
    private expenseOperation: CategoriesType[];
    private typeSelectElement: HTMLSelectElement;
    private categorySelectElement: HTMLSelectElement;
    readonly sumElement: HTMLInputElement | null;
    readonly dateElement: HTMLInputElement | null;
    readonly commentElement: HTMLTextAreaElement | null;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;
        this.incomeOperation = []; //сюда сохраним категории доходов
        this.expenseOperation = []; //сюда сохраним категории расходов
        this.typeSelectElement = document.getElementById('type-select') as HTMLSelectElement;
        this.categorySelectElement = document.getElementById('category-select') as HTMLSelectElement;
        this.sumElement = document.getElementById('sum') as HTMLInputElement;
        this.dateElement = document.getElementById('date') as HTMLInputElement;
        this.commentElement = document.getElementById('floatingTextarea') as HTMLTextAreaElement;

        this.dateElement.addEventListener('focus', (): void => {
            (this.dateElement as HTMLInputElement).setAttribute('type', 'date');
        });

        this.getTypeOfOperation(); //определяем тип, который изначально выбрал пользователь
        this.typeSelectElement.addEventListener('change', (): void => { //обработчик события на изменение селекта типа
            this.showCategories(this.incomeOperation, this.expenseOperation);
        });

        (document.getElementById('create-button') as HTMLElement).addEventListener('click', this.saveOperation.bind(this));
    }

    private async getTypeOfOperation(): Promise<void> {
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const type: string | null = urlParams.get('type');
        if(type === 'income'){
            this.typeSelectElement.value = 'income';
        } else {
            this.typeSelectElement.value = 'expense';
        }
        await this.getIncomeCategories();
        await this.getExpenseCategories();
        this.showCategories(this.incomeOperation, this.expenseOperation);
    }

    private async getIncomeCategories(): Promise<void> { //получаем категории для доходов
        const result: HttpUtilsResultType<CategoriesType[]> = await HttpUtils.request('/categories/income');
        this.incomeOperation = result.response as CategoriesType[];
    }

    private async getExpenseCategories(): Promise<void> { //подучаем категории для расходов
        const result: HttpUtilsResultType<CategoriesType[]> = await HttpUtils.request('/categories/expense');
        this.expenseOperation = result.response as CategoriesType[];
    }

    private showCategories(incomeOperation: CategoriesType[], expenseOperation: CategoriesType[]): void { //наполняем селекты в зависимости от выбранного типа
        this.categorySelectElement.innerHTML = '';

        if (this.typeSelectElement.value === 'income') {
            for (let i: number = 0; i < incomeOperation.length; i++) {
                const optionElement: HTMLOptionElement = document.createElement('option');
                optionElement.setAttribute("value", String(incomeOperation[i].id));
                optionElement.innerText = incomeOperation[i].title;
                this.categorySelectElement.appendChild(optionElement);
            }
        } else if (this.typeSelectElement.value === 'expense') {
            for (let i: number = 0; i < expenseOperation.length; i++) {
                const optionElement: HTMLOptionElement = document.createElement('option');
                optionElement.setAttribute("value", String(expenseOperation[i].id));
                optionElement.innerText = expenseOperation[i].title;
                this.categorySelectElement.appendChild(optionElement);
            }
        }
    }

    private validateForm(): boolean{ //валидация формы на заполненность полей
        let isValid: boolean = true;
        if (this.typeSelectElement.value === 'type'){
            this.typeSelectElement.classList.add('is-invalid');
            isValid = false;
        } else {
            this.typeSelectElement.classList.remove('is-invalid');
        }
        if (this.categorySelectElement.value){
            this.categorySelectElement.classList.remove('is-invalid');
        } else {
            this.categorySelectElement.classList.add('is-invalid');
            isValid = false;
        }
        const regex: RegExp = /^[1-9]\d*$/;
        if (this.sumElement && this.sumElement.value !== '' && regex.test(this.sumElement.value)) {
            this.sumElement.classList.remove('is-invalid');
        } else {
            (this.sumElement as HTMLInputElement).classList.add('is-invalid');
            isValid = false;
        }
        if(this.dateElement && this.dateElement.value){
            this.dateElement.classList.remove('is-invalid');
        } else {
            (this.dateElement as HTMLInputElement).classList.add('is-invalid');
            isValid = false;
        }
        if(this.commentElement && this.commentElement.value){
            this.commentElement.classList.remove('is-invalid');
        } else {
            (this.commentElement as HTMLTextAreaElement).classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    private async saveOperation(e: Event): Promise<void>{ //запрос для сохранения операции
        e.preventDefault();
        if (this.validateForm()){
            const result: HttpUtilsResultType<OperationsType> = await HttpUtils.request('/operations', 'POST', true, {
                type: this.typeSelectElement.value,
                amount: (this.sumElement as HTMLInputElement).value,
                date: (this.dateElement as HTMLInputElement).value,
                comment: (this.commentElement as HTMLTextAreaElement).value,
                category_id: Number(this.categorySelectElement.value)
            });
            if(result.redirect){
                return this.openNewRoute(result.redirect);
            }

            const response: OperationsType | DefaultErrorResponseType | null = result.response;
            if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
                console.log((response as DefaultErrorResponseType).message);
                return alert('Возникла ошибка при запросе категорий');
            }
            return this.openNewRoute('/income-and-expenses');
        }
    }
}