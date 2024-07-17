import {HttpUtilsResultType} from "../http/http-utils.type";

export type BalanceType = HttpUtilsResultType & { //один тип для показа и редактирования баланса, т.к. возвращает одинаковые данные
    balance?: number, //может прийти баланс или ошибка с сообщением
    message?: string,
}