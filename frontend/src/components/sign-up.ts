import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";
import {SignupFieldType} from "../types/login-signup/signup-field.type";
import {HttpUtilsResultType} from "../types/http/http-utils.type";
import {SignupResponseType} from "../types/login-signup/signup-response.type";
import {DefaultErrorResponseType} from "../types/http/default-error-respponse.type";
import {OpenRouteType} from "../types/router/open-route.type";

export class SignUp {
    readonly openNewRoute: OpenRouteType;
    private fields: SignupFieldType[] = [];
    readonly commonErrorElement: HTMLElement | null = null;
    readonly passwordElement: HTMLInputElement | null = null;
    readonly processElement: HTMLElement | null = null;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;

        if(AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)){
            this.openNewRoute('/');
            return;
        }

        this.fields = [
            {
                name: 'name',
                id: 'name',
                element: null,
                regex: /^[А-ЯA-Z][а-яa-z]+(-[А-ЯA-Z][а-яa-z]+)?(\s[А-ЯA-Z][а-яa-z]+(-[А-ЯA-Z][а-яa-z]+)?)*$/,
                valid: false
            },
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                valid: false
            },
            {
                name: 'repeatPassword',
                id: 'password-repeat',
                element: null,
                regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                valid: false
            },
        ]

        this.commonErrorElement = document.getElementById('common-error');
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.processElement = document.getElementById('process-button');

        this.init();
        if(this.processElement) {
            this.processElement.addEventListener('click', this.signUp.bind(this));
        }
    }

    //запускаем валидацию формы
    private init(){
        const that: SignUp = this;
        this.fields.forEach((item: SignupFieldType): void => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            item.element.onchange = function(){
              that.validateField.call(that, item, <HTMLInputElement>this);
            }
        });
    }

    //валидируем каждое поле
    private validateField(field: SignupFieldType, element: HTMLInputElement): void {
        // проверка, что поле повторения пароля совпадает с полем пароля
        if (field.name === 'repeatPassword' && this.passwordElement && element.previousElementSibling instanceof HTMLElement) {
            if (element.value !== this.passwordElement.value) {
                element.classList.add('is-invalid');
                element.previousElementSibling.style.borderColor = 'red';
                field.valid = false;
            } else {
                element.classList.remove('is-invalid');
                element.previousElementSibling.removeAttribute('style');
                field.valid = true;
            }
        } else {
            // Валидация остальных полей
            if(element.previousElementSibling instanceof HTMLElement){
                if (!element.value || !element.value.match(field.regex)) {
                    element.classList.add('is-invalid');
                    element.previousElementSibling.style.borderColor = 'red';
                    field.valid = false;
                } else {
                    element.classList.remove('is-invalid');
                    element.previousElementSibling.removeAttribute('style');
                    field.valid = true;
                }
            }
        }
        this.validateForm();
    }

    //если все поля валидны, разблокируем кнопку
    private validateForm(): boolean {
        const validForm: boolean = this.fields.every((item: SignupFieldType) => item.valid);
        if(this.processElement) {
            if(validForm){
                this.processElement.removeAttribute('disabled');
            } else {
                this.processElement.setAttribute('disabled', 'disabled');
            }
        }
        return validForm;
    }

    private async signUp (): Promise<void> {
        if(this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }
        if (this.validateForm()) {
            try{
                const result: HttpUtilsResultType<SignupResponseType> = await HttpUtils.request('/signup', 'POST', false, {
                    name: this.fields.find((item: SignupFieldType): boolean => item.name === 'name')?.element?.value.split(' ')[0],
                    lastName: this.fields.find((item: SignupFieldType): boolean => item.name === 'name')?.element?.value.split(' ')[1],
                    email: this.fields.find((item: SignupFieldType): boolean => item.name === 'email')?.element?.value,
                    password: this.fields.find((item: SignupFieldType): boolean => item.name === 'password')?.element?.value,
                    passwordRepeat: this.fields.find((item: SignupFieldType): boolean => item.name === 'repeatPassword')?.element?.value
                });

                const response: DefaultErrorResponseType |SignupResponseType | null = result.response;
                if (result.error || !response || (response && !(response as SignupResponseType).user)) {
                    throw new Error('Login failed');
                }
            } catch (error) {
                if(this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                }
            }

            try {
                await AuthUtils.performLogin(
                    this.fields.find((item: SignupFieldType): boolean => item.name === 'email')?.element?.value as string,
                    this.fields.find((item: SignupFieldType): boolean => item.name === 'password')?.element?.value as string
                );
                this.openNewRoute('/');
            } catch (error) {
                if(this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                }
            }
        }
    }
}
