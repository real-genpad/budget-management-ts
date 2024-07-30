import {HttpUtils} from "../../utils/http-utils";
import {OpenRouteType} from "../../types/router/open-route.type";
import {CategoryRouteType} from "../../types/categories/category-route.type";
import {HttpUtilsResultType} from "../../types/http/http-utils.type";
import {DefaultErrorResponseType} from "../../types/http/default-error-respponse.type";

export class DeleteCategory {
    readonly openNewRoute: OpenRouteType;
    readonly categoryType: string;

    constructor(openNewRoute: OpenRouteType, categoryType: CategoryRouteType) {
        this.openNewRoute = openNewRoute;
        this.categoryType = categoryType;
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search); //находим нужный id
        const id: string | null = urlParams.get('id');
        if(!id){
            this.openNewRoute('/');
            return
        }
        this.deleteCategory(id).then();
    }

    async deleteCategory(id: string): Promise<void>{ //удаляем операцию
        const result: HttpUtilsResultType<DefaultErrorResponseType> = await HttpUtils.request(`/categories/${this.categoryType}/` + id, 'DELETE', true);
        if(result.redirect){
            return this.openNewRoute(result.redirect);
        }

        const response: DefaultErrorResponseType | null = result.response;
        if (result.error || !response || (response && response.error)) {
            console.log((response as DefaultErrorResponseType).message);
            return alert('Возникла ошибка при удалении категории');
        }
        return this.openNewRoute(`/${this.categoryType}`);
    }
}