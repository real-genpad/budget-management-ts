import {Main} from "./components/main";
import {Login} from "./components/login";
import {SignUp} from "./components/sign-up";
import {IncomeAndExpenses} from "./components/income-expenses/income-expenses";
import {IncomeAndExpensesCreate} from "./components/income-expenses/income-expenses-create";
import {IncomeAndExpensesEdit} from "./components/income-expenses/income-expenses-edit";
import {Logout} from "./components/logout";
import {IncomeAndExpensesDelete} from "./components/income-expenses/income-expenses-delete";
import {AuthUtils} from "./utils/auth-utils";
import {HttpUtils} from "./utils/http-utils";
import {CreateCategory} from "./components/category/create-category";
import {Category} from "./components/category/category";
import {EditCategory} from "./components/category/edit-category";
import {DeleteCategory} from "./components/category/delete-category";
import Modal from 'bootstrap/js/dist/modal.js';
import {RouteType} from "./types/route.type";
import {AuthInfoType} from "./types/auth/auth-info.type";
import {UserInfoType} from "./types/auth/user-info.type";

export class Router {
    readonly titlePageElement: HTMLElement | null;
    private contentPageElement: HTMLElement | null;
    private profileNameElement: HTMLElement | null;
    private profileNameElementMenu: HTMLElement | null;
    private balanceElement: HTMLElement | null;
    private balanceElementMenu: HTMLElement | null;
    private balanceLink: HTMLElement | null;
    private confirmBalanceBtn: HTMLElement | null;
    private cancelBalanceBtn: HTMLElement | null;
    private balanceInput: HTMLElement | null;
    private routes: RouteType[];
    private modal: Modal;

    constructor() {
        this.initEvents();
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = null;
        this.profileNameElement = null;
        this.profileNameElementMenu = null;
        this.balanceElement = null;
        this.balanceElementMenu = null;
        this.balanceLink = null;
        this.confirmBalanceBtn = null;
        this.cancelBalanceBtn = null;
        this.balanceInput = null;
        this.modal = new Modal('#balanceModal');
        this.routes = [
            {
                name: 'content',
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/main.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new Main(this.openNewRoute.bind(this));
                }
            },
            {
                name: 'authorization',
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/login.html',
                requiresAuth: false,
                load: () => {
                    document.body.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'vh-100');
                    new Login(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.body.classList.remove('d-flex', 'justify-content-center', 'align-items-center', 'vh-100');
                }
            },
            {
                name: 'authorization',
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/sign-up.html',
                requiresAuth: false,
                load: () => {
                    document.body.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'vh-100');
                    new SignUp(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.body.classList.remove('d-flex', 'justify-content-center', 'align-items-center', 'vh-100');
                }
            },
            {
                name: 'content',
                route: '/income-and-expenses',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/income-and-expenses/income-expenses.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new IncomeAndExpenses(this.openNewRoute.bind(this));
                },
            },
            {
                name: 'content',
                route: '/income-and-expenses-create',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/income-and-expenses/income-expenses-create.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new IncomeAndExpensesCreate(this.openNewRoute.bind(this));
                },
            },
            {
                name: 'content',
                route: '/income-and-expenses-edit',
                title: 'Редактирование дохода/расхода',
                filePathTemplate: '/templates/income-and-expenses/income-expenses-edit.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new IncomeAndExpensesEdit(this.openNewRoute.bind(this));
                },
            },
            {
                name: 'deleteAndLogout',
                route: '/income-and-expenses-delete',
                requiresAuth: false,
                load: () => {
                    new IncomeAndExpensesDelete(this.openNewRoute.bind(this));
                },
            },
            {
                name: 'content',
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/category/category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new Category(this.openNewRoute.bind(this), 'income');
                },
            },
            {
                name: 'content',
                route: '/income-edit',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/category/edit-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new EditCategory(this.openNewRoute.bind(this), 'income');
                },
            },
            {
                name: 'content',
                route: '/income-create',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/category/create-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new CreateCategory(this.openNewRoute.bind(this), 'income');
                },
            },
            {
                name: 'deleteAndLogout',
                route: '/income-delete',
                requiresAuth: false,
                load: () => {
                    new DeleteCategory(this.openNewRoute.bind(this), 'income');
                },
            },
            {
                name: 'content',
                route: '/expense',
                title: 'Расходы',
                filePathTemplate: '/templates/category/category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new Category(this.openNewRoute.bind(this), 'expense');
                },
            },
            {
                name: 'content',
                route: '/expense-edit',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/category/edit-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new EditCategory(this.openNewRoute.bind(this), 'expense');
                },
            },
            {
                name: 'content',
                route: '/expense-create',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/category/create-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new CreateCategory(this.openNewRoute.bind(this), 'expense');
                },
            },
            {
                name: 'deleteAndLogout',
                route: '/expense-delete',
                requiresAuth: false,
                load: () => {
                    new DeleteCategory(this.openNewRoute.bind(this), 'expense');
                },
            },
            {
                name: 'deleteAndLogout',
                route: '/logout',
                requiresAuth: false,
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                }
            }
        ]
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRout.bind(this));
        window.addEventListener('popstate', this.activateRout.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));
    }

    public async openNewRoute(url: string): Promise<void> {
        const currentRoute: string = window.location.pathname;
        history.pushState({}, '', url);
            await this.activateRout(null, currentRoute);
    }

    private async clickHandler(e: Event): Promise<void> {
        let element:  = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }

        if (element) {
            e.preventDefault();
            //4.берем из него url-адрес
            const url: string = element.href.replace(window.location.origin, '');
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }
            await this.openNewRoute(url);
        }
    }

    async activateRout(e: Event | null, oldRoute?: string | null | undefined) {
        if (oldRoute) {
            const currentRoute: RouteType | undefined = this.routes.find(item => item.route === oldRoute);
            if (currentRoute && currentRoute.name === 'authorization' && currentRoute.unload && typeof currentRoute.unload === 'function') {
                currentRoute.unload();
            }
        }
        const urlRoute: string = window.location.pathname;
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.requiresAuth && !this.isAuthenticated()) {
                return this.openNewRoute('/login');
            }

            if(!this.titlePageElement) { //titlePageElement может быть null, получаем ошибку
                if(oldRoute === '/'){
                    return;
                } else {
                    return this.openNewRoute('/');
                }
            }

            if (newRoute.name === 'content' || newRoute.name === 'authorization') { //т.к. у удаления или выхода нет этих полей, получали ошибки
                if (newRoute.title) {
                    this.titlePageElement.innerText = newRoute.title;
                }

                if (newRoute.filePathTemplate) {
                    let contentBlock: HTMLElement | null = document.getElementById('content');
                    if (newRoute.name === 'content' && newRoute.useLayout) {
                        if (!this.contentPageElement) {
                            this.contentPageElement = document.getElementById('content') as HTMLElement;
                            this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());

                            //находим элементы для сайдбара
                            this.profileNameElement = document.getElementById('profile-name');
                            this.profileNameElementMenu = document.getElementById('profile-name-menu');
                            this.balanceElement = document.getElementById('balance');
                            this.balanceElementMenu = document.getElementById('balance-menu');
                            this.balanceLink = document.getElementById("balance-link");
                            this.confirmBalanceBtn = document.getElementById("confirm-balance-btn");
                            this.cancelBalanceBtn = document.getElementById("cancel-balance-btn");
                            this.balanceInput = document.getElementById("edit-balance");

                            //вставляем имя пользователя
                            //поля могут быть null, получаем ошибки
                            if(!this.profileNameElement || !this.profileNameElementMenu || !this.balanceLink
                            || !this.cancelBalanceBtn ||!this.confirmBalanceBtn) {
                                if(oldRoute === '/'){
                                    return;
                                } else {
                                    return this.openNewRoute('/');
                                }
                            }
                            if (this.profileNameElement.innerText === '' || this.profileNameElementMenu.innerText === '') {
                                let userInfo = AuthUtils.getAuthInfo(AuthUtils.userInfoTokenKey);
                                if (userInfo) {
                                    if (typeof userInfo === "string") {
                                        userInfo = JSON.parse(userInfo);
                                    }
                                    if (userInfo && userInfo.name) {
                                        this.profileNameElement.innerText = userInfo.name;
                                        this.profileNameElementMenu.innerText = userInfo.name;
                                    }
                                }
                            }
                            await this.showBalance();

                            //открываем модальное окно при нажатии на ссылку "Баланс"
                            this.balanceLink.addEventListener("click", () => {
                                this.modal.show();
                            });
                            //закрываем модальное окно при нажатии на кнопку "Отменить"
                            this.cancelBalanceBtn.addEventListener("click", () => {
                                if(this.balanceInput){
                                    this.balanceInput.value = ''; // Сбросить значение инпута
                                }
                                this.modal.hide();
                            });
                            //обновляем баланс
                            this.confirmBalanceBtn.addEventListener('click', this.editBalance.bind(this));
                        }
                        this.activateMenuItem(newRoute); //подсвечиваем активные ссылки
                        contentBlock = document.getElementById('content-layout');
                    } else {
                        this.contentPageElement = null;
                    }
                    if(contentBlock) {
                        contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
                    }
                }

                if (newRoute.load && typeof newRoute.load === 'function') {
                    newRoute.load();
                }
            }
        } else {
            console.log('requested route was not found');
            history.pushState({}, '', '/');
            await this.activateRout();
        }
    }

    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }

    activateMenuItem(route) {
        document.querySelectorAll('.sidebar .nav-link, .navbar .nav-link').forEach(item => {
            const href = item.getAttribute('href');
            if (route.route === href) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        })
    }

    async showBalance() {
        const result = await HttpUtils.request('/balance');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе баланса');
        }
        if (this.balanceElement.innerText === '' || this.balanceElementMenu.innerText === '') {
            if (result.response.balance) {
                this.balanceElement.innerText = result.response.balance;
                this.balanceElementMenu.innerText = result.response.balance;
            }
        }
    }

    async editBalance() {
        const result = await HttpUtils.request('/balance', 'PUT', true, {
            newBalance: this.balanceInput.value
        });
        this.modal.hide();
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при обновлении баланса');
        }
        if (result.response.balance) {
            this.balanceElement.innerText = result.response.balance;
            this.balanceElementMenu.innerText = result.response.balance;
        }
    }
}