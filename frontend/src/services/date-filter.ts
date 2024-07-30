import {CalculateDatesType} from "../types/date-filter/calculate-dates.type";
import {DateFilterType} from "../types/date-filter/date-filter.type";

export class DateFilter { //отвечает за выбор периода и интервалов дат
    readonly getOperations: DateFilterType;
    private periodButtons: NodeListOf<Element>;
    readonly startDatePicker: HTMLInputElement | null;
    readonly endDatePicker: HTMLInputElement | null;

    constructor(getOperations: DateFilterType) {
        this.getOperations = getOperations; //при изменении фильтра делает новый запрос на сервер(метод из файла income-expenses.ts)
        this.periodButtons = document.querySelectorAll('.diagram-btn');
        this.startDatePicker = document.getElementById('start-date') as HTMLInputElement;
        this.endDatePicker = document.getElementById('end-date') as HTMLInputElement;
        this.startDatePicker.addEventListener('focus', (): void => {
            (this.startDatePicker as HTMLInputElement).setAttribute('type', 'date');
        });
        this.endDatePicker.addEventListener('focus', (): void => {
            (this.endDatePicker as HTMLInputElement).setAttribute('type', 'date');
        });
        this.initButtonsListeners();
    }

    private initButtonsListeners(): void { //обработчики событий на кнопки периодов и выбора даты
        this.periodButtons.forEach((button: Element): void => {
            button.addEventListener('click', (): void => {
                this.periodButtons.forEach((btn: Element) => btn.classList.remove('active'));
                button.classList.add('active');
                const period: string | null = button.getAttribute('data-period'); //получаем строковое значение
                // периода из атрибута для вычисления периода в calculateDates
                this.filterChange(period as string);
            });
        });

        (this.startDatePicker as HTMLInputElement).addEventListener('change', (): void => {
            const activeButton: Element | null = document.querySelector('.diagram-btn.active');
            if (activeButton && activeButton.getAttribute('data-period') === 'interval') {
                this.filterChange('interval');
            }
        });

        (this.endDatePicker as HTMLInputElement).addEventListener('change', (): void => {
            const activeButton: Element | null = document.querySelector('.diagram-btn.active');
            if (activeButton && activeButton.getAttribute('data-period') === 'interval') {
                this.filterChange('interval');
            }
        });
    }

    private filterChange(period: string): void {
        const { dateFrom, dateTo } = this.calculateDates(period); //получаем dateFrom и dateTo для запроса
        this.getOperations(period, dateFrom, dateTo); //передаем полученные данные для запроса при изменении фильтра
    }

    private calculateDates(period: string): CalculateDatesType { //вычисляем периоды для фильтра
        let dateFrom: string = '';
        let dateTo: string = '';
        const today: Date = new Date();

        switch (period) {
            case 'today':
                dateFrom = dateTo = today.toISOString().split('T')[0];
                break;
            case 'week':
                const dayOfWeek: number = today.getDay();
                const diff: number = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                const startOfWeek: Date = new Date(today.setDate(diff));
                dateFrom = startOfWeek.toISOString().split('T')[0];
                dateTo = new Date().toISOString().split('T')[0];
                break;
            case 'month':
                const startOfMonth: Date = new Date(today.getFullYear(), today.getMonth(), 1);
                dateFrom = startOfMonth.toISOString().split('T')[0];
                dateTo = new Date().toISOString().split('T')[0];
                break;
            case 'year':
                const startOfYear: Date = new Date(today.getFullYear(), 0, 1);
                dateFrom = startOfYear.toISOString().split('T')[0];
                dateTo = new Date().toISOString().split('T')[0];
                break;
            case 'all':
                dateFrom = '';
                dateTo = '';
                break;
            case 'interval':
                if(this.startDatePicker && this.endDatePicker) {
                    dateFrom = this.startDatePicker.value;
                    dateTo = this.endDatePicker.value;
                    break;
                }
        }

        return { dateFrom, dateTo };
    }
}