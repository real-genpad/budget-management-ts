import {HttpUtils} from "../../utils/http-utils";
import {OpenRouteType} from "../../types/router/open-route.type";
import {CategoriesType} from "../../types/categories/categories.type";
import {HttpUtilsResultType} from "../../types/http/http-utils.type";
import {OperationsType} from "../../types/operations/operations.type";
import {DefaultErrorResponseType} from "../../types/http/default-error-respponse.type";

export class IncomeAndExpensesEdit {
    readonly openNewRoute: OpenRouteType;
    private incomeOperation: CategoriesType[] = []; //сразу инициализируем, так как в конструкторе может сработать return
    private expenseOperation: CategoriesType[] = [];
    private typeSelectElement: HTMLSelectElement = document.getElementById('type-select') as HTMLSelectElement;
    private categorySelectElement: HTMLSelectElement = document.getElementById('category-select') as HTMLSelectElement;
    readonly sumElement: HTMLInputElement | null = document.getElementById('sum') as HTMLInputElement;
    readonly dateElement: HTMLInputElement | null = document.getElementById('date') as HTMLInputElement;
    readonly commentElement: HTMLTextAreaElement | null = document.getElementById('floatingTextarea') as HTMLTextAreaElement;
    private originalData: OperationsType | null = null;
    private date: Date | null = null;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const id: string | null = urlParams.get('id');
        if (!id) {
            this.openNewRoute('/');
            return;
        }

        (this.dateElement as HTMLInputElement).addEventListener('focus', () => {
            (this.dateElement as HTMLInputElement).setAttribute('type', 'date');
        });

        this.getOperation(id).then();

        this.typeSelectElement.addEventListener('change', () => { //если юзер поменял тип в селекте, то меняем наполнение для категорий
            this.showCategories(this.incomeOperation, this.expenseOperation);
        });

        (document.getElementById('update-button') as HTMLElement).addEventListener('click', this.updateOperation.bind(this));
    }

    private async getOperation(id: string): Promise<void> { //получаем данные для таблицы
        const result: HttpUtilsResultType<OperationsType> = await HttpUtils.request('/operations/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        const response: OperationsType | DefaultErrorResponseType | null = result.response;
        if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
            console.log((response as DefaultErrorResponseType).message);
            return alert('Возникла ошибка при запросе операции');
        }
        this.originalData = result.response as OperationsType; //сохраняем объект с данными для подстановки id в запрос на сохранение

        //сразу определяем тип операции в селекте, чтобы категории потом подгружались верно
        for (let i: number = 0; i < this.typeSelectElement.options.length; i++) {
            if (this.typeSelectElement.options[i].value === (result.response as OperationsType).type) {
                this.typeSelectElement.selectedIndex = i;
            }
        }

        await this.getIncomeCategories(); //ждем получение категорий, прежде, чем рисовать таблицу
        await this.getExpenseCategories();
        this.showCategories(this.incomeOperation, this.expenseOperation);
        this.showOperation(result.response as OperationsType);
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

    private showOperation(operation: OperationsType): void { //заполняем таблицу, тип уже заранее выбран
        for (let i: number = 0; i < this.categorySelectElement.options.length; i++) {
            if (this.categorySelectElement.options[i].innerText === operation.category) {
                this.categorySelectElement.selectedIndex = i;
            }
        }
        if (this.sumElement) {
            this.sumElement.value = String(operation.amount);
        }
        if(this.originalData) {
            this.date = new Date(this.originalData.date);
        }
        if(this.dateElement) {
            this.dateElement.value = (this.date as Date).toLocaleDateString('ru-RU');
        }
        if(this.commentElement) {
            this.commentElement.value = operation.comment;
        }

        //возвращаем дату, если пользователь не стал ее менять пссле нажатия на инпут
        if(this.dateElement) {
            this.dateElement.addEventListener('blur', () => {
                if (this.dateElement && this.dateElement.value === '') {
                    this.dateElement.value = (this.date as Date).toISOString().slice(0, 10);
                }
            });
        }
    }

    private validateForm(): boolean { //валидация формы на заполненность полей, кроме селектов
        let isValid: boolean = true;
        const regex: RegExp = /^[1-9]\d*$/;
        if (this.sumElement && this.sumElement.value !== '' && regex.test(this.sumElement.value)) {
            this.sumElement.classList.remove('is-invalid');
        } else {
            (this.sumElement as HTMLInputElement).classList.add('is-invalid');
            isValid = false;
        }
        if (this.dateElement && this.dateElement.value) {
            this.dateElement.classList.remove('is-invalid');
        } else {
            (this.dateElement as HTMLInputElement).classList.add('is-invalid');
            isValid = false;
        }
        if (this.commentElement && this.commentElement.value) {
            this.commentElement.classList.remove('is-invalid');
        } else {
            (this.commentElement as HTMLTextAreaElement).classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    private async updateOperation(e: Event): Promise<void> {
        e.preventDefault();
        if (this.validateForm()) {
            const date: Date = new Date((this.dateElement as HTMLInputElement).value);
            (this.dateElement as HTMLInputElement).value = date.toISOString().slice(0, 10);
            const result: HttpUtilsResultType<OperationsType> = await HttpUtils.request('/operations/' + (this.originalData as OperationsType).id, 'PUT', true, {
                type: this.typeSelectElement.value,
                amount: (this.sumElement as HTMLInputElement).value,
                date: (this.dateElement as HTMLInputElement).value,
                comment: (this.commentElement as HTMLTextAreaElement).value,
                category_id: Number(this.categorySelectElement.value)
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            const response: OperationsType | DefaultErrorResponseType | null = result.response;
            if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
                console.log((response as DefaultErrorResponseType).message);
                return alert('Возникла ошибка при редактировании операции');
            }
            return this.openNewRoute('/income-and-expenses');

        }

    }
}
