import {TokensType} from "./tokens.type";

export type RefreshResponseType = {
    tokens: TokensType
}

//все поля необязательные, так как в случае успеха или ошибки приходят разные данные