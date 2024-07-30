import {HttpUtils} from "../../utils/http-utils";
import {OpenRouteType} from "../../types/router/open-route.type";
import {HttpUtilsResultType} from "../../types/http/http-utils.type";
import {CategoriesType} from "../../types/categories/categories.type";
import {CategoryRouteType} from "../../types/categories/category-route.type";
import {OperationsType} from "../../types/operations/operations.type";
import {DefaultErrorResponseType} from "../../types/http/default-error-respponse.type";

export class Category{
    readonly openNewRoute: OpenRouteType;
    readonly categoryType: string;

    constructor(openNewRoute: OpenRouteType, categoryType: CategoryRouteType) {
        this.openNewRoute = openNewRoute;
        this.categoryType = categoryType;
        const category: string = this.categoryType === 'income' ? 'Доходы' : 'Расходы';
        (document.querySelector('.category-header') as HTMLHeadingElement).innerText = `${category}`;
        this.getExpenseList().then();
    }

    private async getExpenseList(): Promise<void>{ //запрос на получение категорий
        const result: HttpUtilsResultType<CategoriesType[]> = await HttpUtils.request(`/categories/${this.categoryType}`);
        if(result.redirect){
            return this.openNewRoute(result.redirect);
        }

        const response: CategoriesType[] | DefaultErrorResponseType | null = result.response;
        if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
            const category: string = this.categoryType === 'income' ? 'доходов' : 'расходов';
            return alert(`Возникла ошибка при запросе категорий ${category}`);
        }
        this.showCategoryList(result.response as CategoriesType[]);
    }

    private showCategoryList(category: CategoriesType[]): void{ //рисуем блоки с категориями
        const cardsElement: HTMLElement | null = document.getElementById('cards');
        for (let i: number = 0; i < category.length; i++) {
            const cardElement: HTMLDivElement = document.createElement('div');
            cardElement.className = 'card';

            const cardBodyElement: HTMLDivElement = document.createElement('div');
            cardBodyElement.className = 'card-body';

            const cardTitleElement:HTMLHeadingElement = document.createElement('h5');
            cardTitleElement.className = 'card-title';
            cardTitleElement.innerHTML = category[i].title;

            const editElement: HTMLAnchorElement = document.createElement('a');
            editElement.setAttribute('href', `/${this.categoryType}-edit?id=` + category[i].id);
            editElement.setAttribute('role', 'button');
            editElement.className = 'operations-btn btn btn-primary';
            editElement.innerHTML = 'Редактировать';

            const deleteElement: HTMLAnchorElement = document.createElement('a');
            deleteElement.setAttribute('href', 'javascript:void(0)');
            deleteElement.setAttribute('role', 'button');
            deleteElement.setAttribute('data-id', String(category[i].id));
            deleteElement.setAttribute('data-bs-toggle', 'modal');
            deleteElement.setAttribute('data-bs-target', '#exampleModalCenter');
            deleteElement.className = 'operations-btn btn delete-btn btn-danger';
            deleteElement.innerHTML = 'Удалить';

            cardBodyElement.appendChild(cardTitleElement);
            cardBodyElement.appendChild(editElement);
            cardBodyElement.appendChild(deleteElement);

            cardElement.appendChild(cardBodyElement);

            if(cardsElement) {
                cardsElement.appendChild(cardElement);
            }
        }

        const cardElement: HTMLDivElement = document.createElement('div');
        cardElement.className = 'card card-new';

        const cardBodyElement: HTMLDivElement = document.createElement('div');
        cardBodyElement.className = 'card-body card-body-new';

        const newElement: HTMLSpanElement = document.createElement('span');
        newElement.innerHTML = '+';

        cardBodyElement.appendChild(newElement);
        cardElement.appendChild(cardBodyElement);
        if(cardsElement) {
            cardsElement.appendChild(cardElement);
        }

        this.categoryDeleteEventListeners();
        cardElement.addEventListener('click', () => this.openNewRoute(`/${this.categoryType}-create`));
    }

    private categoryDeleteEventListeners(): void { //передаем id операции в каждую кнопку удаления
        const deleteButtons: NodeListOf<Element> = document.querySelectorAll('.delete-btn');
        for (let i: number = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (event: Event): void => {
                if(event.target instanceof HTMLElement) {
                    const targetElement: HTMLElement | null = event.target.closest('.delete-btn');
                    if(targetElement) {
                        let operationId: string | null = targetElement.getAttribute('data-id');
                        let deleteBtn: HTMLElement | null = document.getElementById('delete-btn');
                        (deleteBtn as HTMLElement).setAttribute('href', `/${this.categoryType}-delete?id=` + operationId);
                    }
                }
            });
        }
    }
}