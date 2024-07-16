import {HttpUtils} from "../../utils/http-utils";

export class EditCategory{
    constructor(openNewRoute, categoryType) {
        this.openNewRoute = openNewRoute;
        this.categoryType = categoryType;
        const urlParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        if (!this.id) {
            return this.openNewRoute('/');
        }
        this.inputElement = document.querySelector('.edit-input');
        const category = this.categoryType === 'income' ? 'доходов' : 'расходов';
        document.querySelector('.category-header').innerHTML = `Редактирование категории ${category}`;
        document.getElementById('save-button').addEventListener('click', this.editCategory.bind(this));
        document.getElementById('cancel-button').addEventListener('click', () => this.openNewRoute(`/${this.categoryType}`));
        this.getOperation(this.id).then();
    }

    async getOperation(id) { //получаем данные для таблицы
        const result = await HttpUtils.request(`/categories/${this.categoryType}/` + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при запросе категории');
        }
        console.log(result.response);
        this.showCategory(result.response);
    }

    showCategory(category){
        this.inputElement.value = category.title;
    }

    validateForm(){
        let isValid = true;
        if(this.inputElement.value){
            this.inputElement.classList.remove('is-invalid');
        } else {
            this.inputElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async editCategory(e){
        e.preventDefault;
        if(this.validateForm()){
            const result = await HttpUtils.request(`/categories/${this.categoryType}/` + this.id, 'PUT', true, {
                title: this.inputElement.value
            });
            if(result.redirect){
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                const category = this.categoryType === 'income' ? 'дохода' : 'расхода';
                return alert(`Возникла ошибка редактировании категории ${category}`);
            }
            return this.openNewRoute(`/${this.categoryType}`);
        }
    }
}