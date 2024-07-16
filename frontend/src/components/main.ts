import {DateFilter} from "../services/date-filter";
import {HttpUtils} from "../utils/http-utils";
import Chart from 'chart.js/auto';

export class Main {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.getOperations('all').then();
        new DateFilter(this.getOperations.bind(this));
    }

    async getOperations(period, dateFrom = '', dateTo = '') {
        let url = '/operations?period=all';
        if (period !== 'all') {
            url = '/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo;
        }
        const result = await HttpUtils.request(url);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе операций');
        }
        this.loadOperationsIntoChart(result.response);
    }

    loadOperationsIntoChart(operations) { //загружаем данные по операциям в чарты
        const incomeData = this.getDataByType(operations, 'income'); //сюда размещаем доходы
        const expensesData = this.getDataByType(operations, 'expense'); //сюда размещаем расходы

        this.renderCharts(incomeData, expensesData); //создаем и обновляем данные в чартах
    }

    getDataByType(operations, type) { //фильтруем операции по типу
        const filteredOperations = operations.filter(operation => operation.type === type); //создаем массив, в который попадают операции с соответствующим типом
        const categoriesSum = {}; //тут будем хранить категории с суммами

        filteredOperations.forEach(operation => { //проходим по каждой отфильтрованной операции
            if (!categoriesSum[operation.category]) { //проверяем наличие категории в объекте categories, обращаемся к свойству category текущей операции
                categoriesSum[operation.category] = 0; //если категории еще нет, то создаем ее с суммой 0
            }
            categoriesSum[operation.category] += parseFloat(operation.amount); //добавляем сумму текущей операции к значению этой категории в объекте categories.
        });
        //console.log(categoriesSum);

        //извлекаем ключи и значения из объекта categories, задаем цвета для графиков:
        const labels = Object.keys(categoriesSum);
        const data = Object.values(categoriesSum);
        const backgroundColor = ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'];

        return { labels, data, backgroundColor }; //возвращаем объект с этими данными
    }

    renderCharts(incomeData, expensesData) { //отрисовываем чарты
        const incomeChartCanvas = document.getElementById('chart-income');
        const expensesChartCanvas = document.getElementById('chart-expenses');

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