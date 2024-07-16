import {HttpUtils} from "../../utils/http-utils";

export class IncomeAndExpensesEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }
        this.typeSelectElement = document.getElementById('type-select');
        this.categorySelectElement = document.getElementById('category-select');
        this.sumElement = document.getElementById('sum');
        this.dateElement = document.getElementById('date');
        this.commentElement = document.getElementById('floatingTextarea');
        this.incomeOperation = null; //сюда сохраним массив с категориями доходов
        this.expenseOperation = null; //сюда сохраним массив с категориями расходов

        this.dateElement.addEventListener('focus', () => {
            this.dateElement.setAttribute('type', 'date');
        });

        this.getOperation(id).then();

        this.typeSelectElement.addEventListener('change', () => { //если юзер поменял тип в селекте, то меняем наполнение для категорий
            this.showCategories(this.incomeOperation, this.expenseOperation);
        });

        document.getElementById('update-button').addEventListener('click', this.updateOperation.bind(this));
    }

    async getOperation(id) { //получаем данные для таблицы
        const result = await HttpUtils.request('/operations/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при запросе операции');
        }
        console.log(result.response);
        this.originalData = result.response; //сохраняем объект с данными для подстановки id в запрос на сохранение

        //сразу определяем тип операции в селекте, чтобы категории потом подгружались верно
        for (let i = 0; i < this.typeSelectElement.options.length; i++) {
            if (this.typeSelectElement.options[i].value === result.response.type) {
                this.typeSelectElement.selectedIndex = i;
            }
        }

        await this.getIncomeCategories(); //ждем получение категорий, прежде, чем рисовать таблицу
        await this.getExpenseCategories();
        this.showCategories(this.incomeOperation, this.expenseOperation);
        this.showOperation(result.response);
    }

    async getIncomeCategories() { //получаем категории для доходов
        const result = await HttpUtils.request('/categories/income');
        this.incomeOperation = result.response;
    }

    async getExpenseCategories() { //подучаем категории для расходов
        const result = await HttpUtils.request('/categories/expense');
        this.expenseOperation = result.response;
    }

    showCategories(incomeOperation, expenseOperation) { //наполняем селекты в зависимости от выбранного типа
        console.log(incomeOperation, expenseOperation);
        //console.log(this.typeSelectElement.value);
        this.categorySelectElement.innerHTML = '';
        if (this.typeSelectElement.value === 'income') {
            for (let i = 0; i < incomeOperation.length; i++) {
                const optionElement = document.createElement('option');
                optionElement.setAttribute("value", incomeOperation[i].id);
                optionElement.innerText = incomeOperation[i].title;
                this.categorySelectElement.appendChild(optionElement);
            }
        } else if (this.typeSelectElement.value === 'expense') {
            for (let i = 0; i < expenseOperation.length; i++) {
                const optionElement = document.createElement('option');
                optionElement.setAttribute("value", expenseOperation[i].id);
                optionElement.innerText = expenseOperation[i].title;
                this.categorySelectElement.appendChild(optionElement);
            }
        }
    }

    showOperation(operation) { //заполняем таблицу, тип уже заранее выбран
        for (let i = 0; i < this.categorySelectElement.options.length; i++) {
            if (this.categorySelectElement.options[i].innerText === operation.category) {
                this.categorySelectElement.selectedIndex = i;
            }
        }
        this.sumElement.value = operation.amount;
        this.date = new Date(this.originalData.date);
        this.dateElement.value = this.date.toLocaleDateString('ru-RU');

        this.commentElement.value = operation.comment;

        //возвращаем дату, если пользователь не стал ее менять пссле нажатия на инпут
        this.dateElement.addEventListener('blur', () => {
            if (this.dateElement.value === '') {
                this.dateElement.value = this.date.toISOString().slice(0, 10);
            }
        });
    }

    validateForm() { //валидация формы на заполненность полей, кроме селектов
        let isValid = true;
        const regex = /^[1-9]\d*$/;
        if (this.sumElement.value !== '' && regex.test(this.sumElement.value)) {
            this.sumElement.classList.remove('is-invalid');
        } else {
            this.sumElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.dateElement.value) {
            this.dateElement.classList.remove('is-invalid');
        } else {
            this.dateElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.commentElement.value) {
            this.commentElement.classList.remove('is-invalid');
        } else {
            this.commentElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async updateOperation(e) {
        e.preventDefault();
        if (this.validateForm()) {
            const date = new Date(this.dateElement.value);
            this.dateElement.value = date.toISOString().slice(0, 10);
            const result = await HttpUtils.request('/operations/' + this.originalData.id, 'PUT', true, {
                type: this.typeSelectElement.value,
                amount: this.sumElement.value,
                date: this.dateElement.value,
                comment: this.commentElement.value,
                category_id: Number(this.categorySelectElement.value)
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                return alert('Возникла ошибка при редактировании операции');
            }
            return this.openNewRoute('/income-and-expenses');

        }

    }
}
