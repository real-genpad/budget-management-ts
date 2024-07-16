import {HttpUtils} from "../../utils/http-utils";

export class IncomeAndExpensesCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.incomeOperation = null; //сюда сохраним категории доходов
        this.expenseOperation = null; //сюда сохраним категории расходов
        this.typeSelectElement = document.getElementById('type-select');
        this.categorySelectElement = document.getElementById('category-select');
        this.sumElement = document.getElementById('sum');
        this.dateElement = document.getElementById('date');
        this.commentElement = document.getElementById('floatingTextarea');

        this.dateElement.addEventListener('focus', () => {
            this.dateElement.setAttribute('type', 'date');
        });

        this.getTypeOfOperation(); //определяем тип, который изначально выбрал пользователь
        this.typeSelectElement.addEventListener('change', () => { //обработчик события на изменение селекта типа
            this.showCategories(this.incomeOperation, this.expenseOperation);
        });

        document.getElementById('create-button').addEventListener('click', this.saveOperation.bind(this));
    }

    async getTypeOfOperation(){
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        if(type === 'income'){
            this.typeSelectElement.value = 'income';
        } else {
            this.typeSelectElement.value = 'expense';
        }
        await this.getIncomeCategories();
        await this.getExpenseCategories();
        this.showCategories(this.incomeOperation, this.expenseOperation);
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
        //console.log(incomeOperation, expenseOperation);
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

    validateForm(){ //валидация формы на заполненность полей
        let isValid = true;
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
        const regex = /^[1-9]\d*$/;
        if (this.sumElement.value !== '' && regex.test(this.sumElement.value)) {
            this.sumElement.classList.remove('is-invalid');
        } else {
            this.sumElement.classList.add('is-invalid');
            isValid = false;
        }
        if(this.dateElement.value){
            this.dateElement.classList.remove('is-invalid');
        } else {
            this.dateElement.classList.add('is-invalid');
            isValid = false;
        }
        if(this.commentElement.value){
            this.commentElement.classList.remove('is-invalid');
        } else {
            this.commentElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async saveOperation(e){ //запрос для сохранения операции
        e.preventDefault();
        if (this.validateForm()){
            const result = await HttpUtils.request('/operations', 'POST', true, {
                type: this.typeSelectElement.value,
                amount: this.sumElement.value,
                date: this.dateElement.value,
                comment: this.commentElement.value,
                category_id: Number(this.categorySelectElement.value)
            });
            if(result.redirect){
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                return alert('Возникла ошибка при запросе категорий');
            }
            return this.openNewRoute('/income-and-expenses');
        }
    }
}