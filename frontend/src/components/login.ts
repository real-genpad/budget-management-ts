import {AuthUtils} from "../utils/auth-utils";
import {LoginFieldType} from "../types/login-signup/login-field.type";

export class Login {
    readonly openNewRoute: (url: string) => Promise<void>;
    private fields: LoginFieldType[] = []; //инициализируем сразу, так как вначале конструктора есть return,
    readonly commonErrorElement: HTMLElement | null = null; // а, значит, эти переменные могут остаться неинициализированными
    private rememberMeElement: HTMLInputElement | null = null;
    readonly processElement: HTMLElement | null = null;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        if(AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)){
            this.openNewRoute('/');
            return;
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
        this.rememberMeElement = document.getElementById('flexCheckDefault') as HTMLInputElement;
        this.processElement = document.getElementById('process-button');

        this.init();
        if(this.processElement){
            this.processElement.addEventListener('click', this.login.bind(this));
        }
    }

    //запускаем валидацию формы
    private init(): void {
        const that: Login = this;
        this.fields.forEach((item: LoginFieldType): void => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if(item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }
        });
    }

    //валидируем каждое поле
    private validateField(field: LoginFieldType, element: HTMLInputElement): void {
        if(element.previousElementSibling instanceof HTMLElement){
            if (!element.value) {
                element.classList.add('is-invalid');
                element.previousElementSibling.style.borderColor = 'red';
                field.valid = false;
            } else {
                element.classList.remove('is-invalid');
                element.previousElementSibling.removeAttribute('style');
                field.valid = true;
            }
        }
        this.validateForm();
    }

    //если все поля валидны, разблокируем кнопку
    private validateForm(): boolean {
        const validForm: boolean = this.fields.every((item: LoginFieldType) => item.valid);
        if(this.processElement) {
            if (validForm) {
                this.processElement.removeAttribute('disabled');
            } else {
                this.processElement.setAttribute('disabled', 'disabled');
            }
        }
        return validForm;
    }

    private async login(): Promise<void> {
        if(this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }
        if (this.validateForm()) {
                try {
                    await AuthUtils.performLogin(
                        this.fields.find((item: LoginFieldType): boolean => item.name as string === 'email')?.element?.value as string,
                        this.fields.find((item: LoginFieldType): boolean => item.name === 'password')?.element?.value as string,
                        (this.rememberMeElement as HTMLInputElement).checked
                    );
                    this.openNewRoute('/');
                } catch (error) {
                    if(this.commonErrorElement){
                        this.commonErrorElement.style.display = 'block';
                    }
                }
        }
    }
}
