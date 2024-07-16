import {AuthUtils} from "../utils/auth-utils";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if(AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)){
            return this.openNewRoute('/');
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                valid: false
            }
        ]

        this.commonErrorElement = document.getElementById('common-error');
        this.rememberMeElement = document.getElementById('flexCheckDefault');
        this.processElement = document.getElementById('process-button');

        this.init();
        this.processElement.addEventListener('click', this.login.bind(this));
    }

    //запускаем валидацию формы
    init() {
        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });
    }

    //валидируем каждое поле
    validateField(field, element) {
        if (!element.value) {
            element.classList.add('is-invalid');
            element.previousElementSibling.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.classList.remove('is-invalid');
            element.previousElementSibling.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    //если все поля валидны, разблокируем кнопку
    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        if (validForm) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return validForm;
    }

    async login() {
        this.commonErrorElement.style.display = 'none';
        if (this.validateForm()) {
            try {
                await AuthUtils.performLogin(
                    this.fields.find(item => item.name === 'email').element.value,
                    this.fields.find(item => item.name === 'password').element.value,
                    this.rememberMeElement.checked
                );
                this.openNewRoute('/');
            } catch (error) {
                this.commonErrorElement.style.display = 'block';
            }
        }
    }
}
