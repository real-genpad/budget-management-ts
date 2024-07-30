import {HttpUtils} from "../../utils/http-utils";
import {OpenRouteType} from "../../types/router/open-route.type";
import {CategoryRouteType} from "../../types/categories/category-route.type";
import {HttpUtilsResultType} from "../../types/http/http-utils.type";
import {CategoriesType} from "../../types/categories/categories.type";
import {OperationsType} from "../../types/operations/operations.type";
import {DefaultErrorResponseType} from "../../types/http/default-error-respponse.type";

export class EditCategory{
    readonly openNewRoute: OpenRouteType;
    readonly categoryType: string;
    readonly id: string | null;
    private inputElement: HTMLInputElement | null = document.querySelector('.edit-input');

    constructor(openNewRoute: OpenRouteType, categoryType: CategoryRouteType) {
        this.openNewRoute = openNewRoute;
        this.categoryType = categoryType;
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        if (!this.id) {
            this.openNewRoute('/');
            return
        }
        const category: string = this.categoryType === 'income' ? 'доходов' : 'расходов';
        (document.querySelector('.category-header') as HTMLHeadingElement).innerHTML = `Редактирование категории ${category}`;
        (document.getElementById('save-button') as HTMLElement).addEventListener('click', this.editCategory.bind(this));
        (document.getElementById('cancel-button') as HTMLElement).addEventListener('click', () => this.openNewRoute(`/${this.categoryType}`));
        this.getOperation(this.id).then();
    }

    async getOperation(id: string): Promise<void> { //получаем данные для таблицы
        const result: HttpUtilsResultType<CategoriesType> = await HttpUtils.request(`/categories/${this.categoryType}/` + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        const response: CategoriesType | DefaultErrorResponseType | null = result.response;
        if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
            console.log((response as DefaultErrorResponseType).message);
            return alert('Возникла ошибка при запросе категории');
        }
        this.showCategory(result.response as CategoriesType);
    }

    showCategory(category: CategoriesType): void{
        (this.inputElement as HTMLInputElement).value = category.title;
    }

    validateForm(): boolean{
        let isValid: boolean = true;
        if(this.inputElement && this.inputElement.value){
            this.inputElement.classList.remove('is-invalid');
        } else {
            (this.inputElement as HTMLInputElement).classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async editCategory(e: Event): Promise<void>{
        e.preventDefault;
        if(this.validateForm()){
            const result: HttpUtilsResultType<CategoriesType> = await HttpUtils.request(`/categories/${this.categoryType}/` + this.id, 'PUT', true, {
                title: (this.inputElement as HTMLInputElement).value
            });
            if(result.redirect){
                return this.openNewRoute(result.redirect);
            }

            const response: CategoriesType | DefaultErrorResponseType | null = result.response;
            if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
                console.log((response as DefaultErrorResponseType).message);
                const category: string = this.categoryType === 'income' ? 'дохода' : 'расхода';
                return alert(`Возникла ошибка редактировании категории ${category}`);
            }
            return this.openNewRoute(`/${this.categoryType}`);
        }
    }
}