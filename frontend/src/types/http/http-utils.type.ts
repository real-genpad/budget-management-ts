import {DefaultErrorResponseType} from "../default-error-respponse.type";

export type HttpUtilsResultType<T> = { //<T>  определяет тип данных для response.
    error?: boolean,
    response: T | DefaultErrorResponseType |null,
    redirect?: string,
}