import {HttpUtils} from "../../utils/http-utils";

export class Category{
    constructor(openNewRoute, categoryType) {
        this.openNewRoute = openNewRoute;
        this.categoryType = categoryType;
        const category = this.categoryType === 'income' ? 'Доходы' : 'Расходы';
        document.querySelector('.category-header').innerText = `${category}`;
        this.getExpenseList().then();
    }

    async getExpenseList(){ //запрос на получение категорий
        const result = await HttpUtils.request(`/categories/${this.categoryType}`);
        if(result.redirect){
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            const category = this.categoryType === 'income' ? 'доходов' : 'расходов';
            return alert(`Возникла ошибка при запросе категорий ${category}`);
        }
        this.showCategoryList(result.response);
    }

    showCategoryList(category){ //рисуем блоки с категориями
        const cardsElement = document.getElementById('cards');
        for (let i = 0; i < category.length; i++) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            const cardBodyElement = document.createElement('div');
            cardBodyElement.className = 'card-body';

            const cardTitleElement = document.createElement('h5');
            cardTitleElement.className = 'card-title';
            cardTitleElement.innerHTML = category[i].title;

            const editElement = document.createElement('a');
            editElement.setAttribute('href', `/${this.categoryType}-edit?id=` + category[i].id);
            editElement.setAttribute('role', 'button');
            editElement.className = 'operations-btn btn btn-primary';
            editElement.innerHTML = 'Редактировать';

            const deleteElement = document.createElement('a');
            deleteElement.setAttribute('href', 'javascript:void(0)');
            deleteElement.setAttribute('role', 'button');
            deleteElement.setAttribute('data-id', category[i].id);
            deleteElement.setAttribute('data-bs-toggle', 'modal');
            deleteElement.setAttribute('data-bs-target', '#exampleModalCenter');
            deleteElement.className = 'operations-btn btn delete-btn btn-danger';
            deleteElement.innerHTML = 'Удалить';

            cardBodyElement.appendChild(cardTitleElement);
            cardBodyElement.appendChild(editElement);
            cardBodyElement.appendChild(deleteElement);

            cardElement.appendChild(cardBodyElement);

            cardsElement.appendChild(cardElement);
        }

        const cardElement = document.createElement('div');
        cardElement.className = 'card card-new';

        const cardBodyElement = document.createElement('div');
        cardBodyElement.className = 'card-body card-body-new';

        const newElement = document.createElement('span');
        newElement.innerHTML = '+';

        cardBodyElement.appendChild(newElement);
        cardElement.appendChild(cardBodyElement);
        cardsElement.appendChild(cardElement);

        this.categoryDeleteEventListeners();
        cardElement.addEventListener('click', () => this.openNewRoute(`/${this.categoryType}-create`));
    }

    categoryDeleteEventListeners() { //передаем id операции в каждую кнопку удаления
        const deleteButtons = document.querySelectorAll('.delete-btn');
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (event) => {
                let operationId = event.target.closest('.delete-btn').getAttribute('data-id');
                let deleteBtn = document.getElementById('delete-btn');
                deleteBtn.setAttribute('href', `/${this.categoryType}-delete?id=` + operationId);
            });
        }
    }
}