import {HttpUtils} from "../../utils/http-utils";

export class CreateCategory {
    constructor(openNewRoute, categoryType) {
        this.openNewRoute = openNewRoute;
        this.categoryType = categoryType;
        this.inputElement = document.querySelector('.edit-input');
        document.getElementById('create-button').addEventListener('click', this.saveCategory.bind(this));
        document.getElementById('cancel-button').addEventListener('click', () => this.openNewRoute(`/${this.categoryType}`));
        const category = this.categoryType === 'income' ? 'доходов' : 'расходов';
        document.querySelector('.category-header').innerHTML = `Создание категории ${category}`;
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

    async saveCategory(e){
        e.preventDefault;
        if(this.validateForm()){
            const result = await HttpUtils.request(`/categories/${this.categoryType}`, 'POST', true, {
                title: this.inputElement.value
            });
            if(result.redirect){
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                const category = this.categoryType === 'income' ? 'дохода' : 'расхода';
                return alert(`Возникла ошибка добавлении категории ${category}`);
            }
            return this.openNewRoute(`/${this.categoryType}`);
        }
    }
}