//этот тип используется в запросах для фильтрации на главной странице и для таблицы доходов и расходов

export type OperationsType = {
    id: number,
    type: string,
    amount: number,
    date: string,
    comment: string,
    category: string
}