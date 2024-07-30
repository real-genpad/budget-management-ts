import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";
import {DefaultErrorResponseType} from "../types/http/default-error-respponse.type";
import {OpenRouteType} from "../types/router/open-route.type";

export class Logout {
    readonly openNewRoute: OpenRouteType;

    constructor(openNewRoute: OpenRouteType) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) {
            this.openNewRoute('/login-signup');
            return;
        }
        this.logout().then();
    }

    async logout(): Promise<void> { //тут при любом раскладе в ответе error(с разыми значениями) и message
         await HttpUtils.request<DefaultErrorResponseType>('/logout', 'POST', false, {
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)
        });
        //независимо от успешности запроса разлогиниваем пользователя
        AuthUtils.removeAuthInfo()

        this.openNewRoute('/login-signup');
    }
}
