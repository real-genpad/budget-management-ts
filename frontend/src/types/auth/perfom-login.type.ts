import {TokensType} from "./tokens.type";

export  type  PerformLoginType = {
    tokens: TokensType
    user: {
        name: string,
        lastName: string,
        id: number
    }
}