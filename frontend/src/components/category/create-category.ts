import {HttpUtils} from "../../utils/http-utils";
import {OpenRouteType} from "../../types/router/open-route.type";
import {CategoryRouteType} from "../../types/categories/category-route.type";
import {HttpUtilsResultType} from "../../types/http/http-utils.type";
import {CategoriesType} from "../../types/categories/categories.type";
import {OperationsType} from "../../types/operations/operations.type";
import {DefaultErrorResponseType} from "../../types/http/default-error-respponse.type";

export class CreateCategory {
    readonly openNewRoute: OpenRouteType;
    readonly categoryType: string;
    readonly inputElement: HTMLInputElement | null;

    constructor(openNewRoute: OpenRouteType, categoryType: CategoryRouteType) {
        this.openNewRoute = openNewRoute;
        this.categoryType = categoryType;
        this.inputElement = document.querySelector('.edit-input');
        (document.getElementById('create-button') as HTMLElement).addEventListener('click', this.saveCategory.bind(this));
        (document.getElementById('cancel-button') as HTMLElement).addEventListener('click', () => this.openNewRoute(`/${this.categoryType}`));
        const category: string = this.categoryType === 'income' ? 'доходов' : 'расходов';
        (document.querySelector('.category-header') as HTMLHeadingElement).innerHTML = `Создание категории ${category}`;
    }

    private validateForm(): boolean{
        let isValid: boolean = true;
        if(this.inputElement && this.inputElement.value){
            this.inputElement.classList.remove('is-invalid');
        } else {
            (this.inputElement as HTMLInputElement).classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    private async saveCategory(e: Event): Promise<void>{
        e.preventDefault;
        if(this.validateForm()){
            const result: HttpUtilsResultType<CategoriesType> = await HttpUtils.request(`/categories/${this.categoryType}`, 'POST', true, {
                title: (this.inputElement as HTMLInputElement).value
            });
            if(result.redirect){
                return this.openNewRoute(result.redirect);
            }

            const response: CategoriesType | DefaultErrorResponseType | null = result.response;
            if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
                console.log((response as DefaultErrorResponseType).message);
                const category = this.categoryType === 'income' ? 'дохода' : 'расхода';
                return alert(`Возникла ошибка добавлении категории ${category}`);
            }
            return this.openNewRoute(`/${this.categoryType}`);
        }
    }
}