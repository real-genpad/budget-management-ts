import {DateFilter} from "../services/date-filter";
import {HttpUtils} from "../utils/http-utils";
import Chart from 'chart.js/auto';
import {HttpUtilsResultType} from "../types/http/http-utils.type";
import {DefaultErrorResponseType} from "../types/http/default-error-respponse.type";
import {ChartDataType} from "../types/chart/chart-data.type";
import {OpenRouteType} from "../types/router/open-route.type";
import {OperationsType} from "../types/operations/operations.type";

export class Main {
    readonly openNewRoute: OpenRouteType;
    private incomeChart: Chart<"pie", number[], string> | null;
    private expensesChart: Chart<"pie", number[], string> | null;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;
        this.incomeChart = null;
        this.expensesChart = null;
        this.getOperations('all').then();
        new DateFilter(this.getOperations.bind(this));
    }

    private async getOperations(period: string, dateFrom: string = '', dateTo: string = ''): Promise<void> {
        let url: string = '/operations?period=all';
        if (period !== 'all') {
            url = '/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo;
        }
        const result: HttpUtilsResultType<OperationsType[]> = await HttpUtils.request(url);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        const response: OperationsType[] | DefaultErrorResponseType | null = result.response;
        if (result.error || !response || (response && (response as DefaultErrorResponseType).error)) {
            return alert('Возникла ошибка при запросе операций');
        }
        this.loadOperationsIntoChart(result.response as OperationsType[]);
    }

    private loadOperationsIntoChart(operations: OperationsType[]): void { //загружаем данные по операциям в чарты
        const incomeData: ChartDataType = this.getDataByType(operations, 'income');
        const expensesData: ChartDataType = this.getDataByType(operations, 'expense');

        this.renderCharts(incomeData, expensesData); //создаем и обновляем данные в чартах
    }

    private getDataByType(operations: OperationsType[], type: string): ChartDataType { //фильтруем операции по типу
        const filteredOperations: OperationsType[] = operations.filter((operation: OperationsType): boolean => operation.type === type); //создаем массив, в который попадают операции с соответствующим типом
        const categoriesSum: { [key: string]: number } = {}; //тут будем хранить категории с суммами

        filteredOperations.forEach((operation: OperationsType): void => {
            if (typeof categoriesSum[operation.category] === 'number') {
                categoriesSum[operation.category] += operation.amount;
            } else {
                categoriesSum[operation.category] = operation.amount;
            }
        });
        //console.log(categoriesSum);

        //извлекаем ключи и значения из объекта categories, задаем цвета для графиков:
        const labels: string[] = Object.keys(categoriesSum);
        const data: number[] = Object.values(categoriesSum);
        const backgroundColor: string[] = ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'];

        return { labels, data, backgroundColor }; //возвращаем объект с этими данными
    }

    private renderCharts(incomeData: ChartDataType, expensesData: ChartDataType): void { //отрисовываем чарты
        const incomeChartCanvas: HTMLCanvasElement = document.getElementById('chart-income') as HTMLCanvasElement;
        const expensesChartCanvas: HTMLCanvasElement = document.getElementById('chart-expenses') as HTMLCanvasElement;

        //удаляем существующие чарты, если они есть, чтобы фильтр обновлял данные
        if (this.incomeChart) {
            this.incomeChart.destroy();
        }
        if (this.expensesChart) {
            this.expensesChart.destroy();
        }

        // Создаем новые чарты
        this.incomeChart = new Chart(incomeChartCanvas, {
            type: 'pie',
            data: {
                labels: incomeData.labels, //сюда подставляем полученные выше значения, которые передаем как аргументы при вызове
                datasets: [{
                    backgroundColor: incomeData.backgroundColor,
                    data: incomeData.data
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#000',
                            boxWidth: 35,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                    },
                    title: {
                        display: false,
                    }
                }
            }
        });

        this.expensesChart = new Chart(expensesChartCanvas, {
            type: 'pie',
            data: {
                labels: expensesData.labels,
                datasets: [{
                    backgroundColor: expensesData.backgroundColor,
                    data: expensesData.data
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#000',
                            boxWidth: 35,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                    },
                    title: {
                        display: false,
                    }
                }
            }
        });
    }
}