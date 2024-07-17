export type RefreshResponseType = {
    tokens?: {
        accessToken: string,
        refreshToken: string,
    },
    error?: boolean,
    message?: string
}

//все поля необязательные, так как в случае успеха или ошибки приходят разные данные