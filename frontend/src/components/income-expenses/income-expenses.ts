import {HttpUtils} from "../../utils/http-utils";
import {DateFilter} from "../../services/date-filter";

export class IncomeAndExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        new DateFilter(this.getOperations.bind(this)); //создаем экземпляр класса с фильтром и передаем ему метод для запроса с фильтром
        this.getOperations('today').then();
    }

    async getOperations(period, dateFrom = '', dateTo = '') { //запрос на сервер для получения операций с фильтром
        let url = '/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo; //данные подставляются из фильтра
        if (period === 'all') {
            url = '/operations?period=all';
        }
        const result = await HttpUtils.request(url);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе операций');
        }
        this.showIncomeAndExpensesList(result.response);
    }

    showIncomeAndExpensesList(operations) { //рисуем таблицу с операциями
        const recordsElement = document.getElementById('records');
        recordsElement.innerHTML = ''; // Очищаем таблицу перед отображением новых данных
        for (let i = 0; i < operations.length; i++) {
            const trElement = document.createElement('tr');
            trElement.insertCell().innerText = i + 1;
            trElement.insertCell().innerText = operations[i].type === 'expense' ? 'Расход' : 'Доход';
            trElement.cells[1].className = operations[i].type === 'expense' ? 'text-danger' : 'text-success';
            trElement.insertCell().innerText = operations[i].category;
            trElement.insertCell().innerText = operations[i].amount + '$';
            const date = new Date(operations[i].date);
            trElement.insertCell().innerText = date.toLocaleDateString('ru-Ru');
            trElement.insertCell().innerText = operations[i].comment;
            trElement.insertCell().innerHTML = '<a href="javascript:void(0)" class="btn delete-btn" data-id="' + operations[i].id + '" role="button" ' +
                'data-bs-toggle="modal" data-bs-target="#exampleModalCenter"><i class="bi bi-trash"></i></a>' +
                '<a href="/income-and-expenses-edit?id=' + operations[i].id + '" class="btn" role="button"><i class="bi bi-pencil"></i></a>';

            recordsElement.appendChild(trElement);
        }
        this.operationDeleteEventListeners();
    }

    operationDeleteEventListeners() { //передаем id операции в каждую кнопку удаления
        const deleteButtons = document.querySelectorAll('.delete-btn');
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (event) => {
                let operationId = event.target.closest('.delete-btn').getAttribute('data-id');
                let deleteBtn = document.getElementById('delete-btn');
                deleteBtn.setAttribute('href', '/income-and-expenses-delete?id=' + operationId);
            });
        }
    }
}