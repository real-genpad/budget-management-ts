import {HttpUtils} from "../../utils/http-utils";

export class IncomeAndExpensesDelete {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search); //находим нужный id
        const id = urlParams.get('id');
        if(!id){
            return this.openNewRoute('/');
        }
        this.deleteOperation(id).then();
    }

    async deleteOperation(id){ //удаляем операцию
        const result = await HttpUtils.request('/operations/' + id, 'DELETE', true);
        if(result.redirect){
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при удалении операции');
        }
        return this.openNewRoute('/income-and-expenses');
    }
}