//public static async request<T> - тип, который мы получим в ответе от сервера. Если не добавить <T>,
// то response.json() будет иметь тип any.

//<HttpUtilsResultType<T> в типе, который возвращает метод - это описание того, что вернет request - объект,
// который содержит поля (необязательные): error, response: данные, которые мы получим от сервера
// (тип данных будет `T`) или redirect. Без 'Т' response в HttpUtilsResultType будет иметь тип any.

//Promise<HttpUtilsResultType<T>> - это "обещание" вернуть в будущем  объект ServerResponse<T>,
// который содержит данные типа `T`.

//await response.json() as T - сам response.json() возвращает Promise<any>, это значит, что
// TS не знает какой типа данных будет в ответе и не сможет проверить корректность дальнейшей работы с этим объектом.
//Если мы вызываем, например, request для получения баланса, то 'as T' в этом случае говорит,
// что мы ждем объект типа BalanceType (он вызывается в роутере)

//Если не передать <Т> в то, что принимает метод или в то, что возвращает промис, то это повлияет на
// response.json() as T и приведет к ошибкам типизации

//result: HttpUtilsResultType<T> - тип, который присваиваем переменной result, в которой хранятся данные от сервера.
// result будет иметь структуру, определённую в HttpUtilsResultType, и поле response в result будет иметь тип T.

import config from "../config/config";
import {AuthUtils} from "./auth-utils";
import {HttpUtilsResultType} from "../types/http/http-utils.type";
import {AuthInfoType} from "../types/auth/auth-info.type";

export class HttpUtils {
    public static async request<T> (url: string, method: string = "GET", useAuth: boolean =true, body: any = null): Promise<HttpUtilsResultType<T>>{
        const result: HttpUtilsResultType<T> = {
            error: false,
            response: null
        };
        const params: any = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
        };

        let token: string | AuthInfoType | null = null;
        if(useAuth){
            token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
            if(token){
                params.headers['x-auth-token'] = token;
            }
        }

        if(body){
            params.body = JSON.stringify(body)
        }

        let response: Response | null = null;
        try{
            response = await fetch(config.api + url, params);
            result.response = await response.json() as T;
        } catch (e) {
            result.error = true;
            return result;
        }

        if(response.status < 200 || response.status >= 300){
            result.error = true;
            if(useAuth && response.status === 401){ //для запросов, в которых отправляем токен
                if(!token){
                    //1.токена нет
                    result.redirect = '/login';
                } else {
                    //2.токен устарел или невалидный
                    const updateTokenResult: boolean = await AuthUtils.updateRefreshToken();
                    if(updateTokenResult){
                        //запрос повторно
                        return this.request(url, method, useAuth, body);
                    } else {
                        result.redirect = '/login';
                    }
                }
            }
        }
        return result;
    }
}