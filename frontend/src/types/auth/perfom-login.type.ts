import {HttpUtilsResultType} from "../http/http-utils.type";

export  type  PerformLoginType = HttpUtilsResultType & {
    tokens?: {
        "accessToken": string,
        refreshToken: string
    },
    user?: {
        name: string,
        lastName: string,
        id: number
    },
    error?: boolean,
    message?: string
}