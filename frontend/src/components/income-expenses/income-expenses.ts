import {HttpUtils} from "../../utils/http-utils";
import {DateFilter} from "../../services/date-filter";
import {HttpUtilsResultType} from "../../types/http/http-utils.type";
import {OperationsType} from "../../types/operations/operations.type";
import {DefaultErrorResponseType} from "../../types/http/default-error-respponse.type";
import {OpenRouteType} from "../../types/router/open-route.type";

export class IncomeAndExpenses {
    readonly openNewRoute: OpenRouteType;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;
        new DateFilter(this.getOperations.bind(this)); //создаем экземпляр класса с фильтром и передаем ему метод для запроса с фильтром
        this.getOperations('today').then();
    }

    private async getOperations(period: string, dateFrom: string = '', dateTo: string = ''): Promise<void> { //запрос на сервер для получения операций с фильтром
        let url: string = '/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo; //данные подставляются из фильтра
        if (period === 'all') {
            url = '/operations?period=all';
        }
        const result: HttpUtilsResultType<OperationsType[]> = await HttpUtils.request(url);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        const response: OperationsType[] | DefaultErrorResponseType | null = result.response;
        if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
            return alert('Возникла ошибка при запросе операций');
        }
        this.showIncomeAndExpensesList(result.response as OperationsType[]);
    }

    private showIncomeAndExpensesList(operations: OperationsType[]): void { //рисуем таблицу с операциями
        const recordsElement: HTMLElement | null = document.getElementById('records');
        if(recordsElement) {
            recordsElement.innerHTML = ''; // Очищаем таблицу перед отображением новых данных
        }
        for (let i: number = 0; i < operations.length; i++) {
            const trElement: HTMLTableRowElement = document.createElement('tr');
            trElement.insertCell().innerText = `${i + 1}`;
            trElement.insertCell().innerText = operations[i].type === 'expense' ? 'Расход' : 'Доход';
            trElement.cells[1].className = operations[i].type === 'expense' ? 'text-danger' : 'text-success';
            trElement.insertCell().innerText = operations[i].category;
            trElement.insertCell().innerText = operations[i].amount + '$';
            const date: Date = new Date(operations[i].date);
            trElement.insertCell().innerText = date.toLocaleDateString('ru-Ru');
            trElement.insertCell().innerText = operations[i].comment;
            trElement.insertCell().innerHTML = '<a href="javascript:void(0)" class="btn delete-btn" data-id="' + operations[i].id + '" role="button" ' +
                'data-bs-toggle="modal" data-bs-target="#exampleModalCenter"><i class="bi bi-trash"></i></a>' +
                '<a href="/income-and-expenses-edit?id=' + operations[i].id + '" class="btn" role="button"><i class="bi bi-pencil"></i></a>';

            if(recordsElement) {
                recordsElement.appendChild(trElement);
            }
        }
        this.operationDeleteEventListeners();
    }

    private operationDeleteEventListeners(): void { //передаем id операции в каждую кнопку удаления
        const deleteButtons: NodeListOf<Element> = document.querySelectorAll('.delete-btn');
        for (let i: number = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (event: Event): void => {
                if(event.target instanceof HTMLElement) {
                    const targetElement: HTMLElement | null = event.target.closest('.delete-btn');
                    if(targetElement) {
                        let operationId: string | null = targetElement.getAttribute('data-id');
                        let deleteBtn: HTMLElement | null = document.getElementById('delete-btn');
                        (deleteBtn as HTMLElement).setAttribute('href', '/income-and-expenses-delete?id=' + operationId);
                    }
                }
            });
        }
    }
}