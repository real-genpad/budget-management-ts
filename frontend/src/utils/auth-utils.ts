import {HttpUtils} from "./http-utils";
import config from "../config/config";
import {UserInfoType} from "../types/auth/user-info.type";
import {AuthInfoType} from "../types/auth/auth-info.type";
import {RefreshResponseType} from "../types/auth/refresh-response.type";
import {PerformLoginType} from "../types/auth/perfom-login.type";

export class AuthUtils {
    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';
    public static userInfoTokenKey: string = 'userInfo';

    public static removeAuthInfo(): void{
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    public static getAuthInfo(key: string | null): string | AuthInfoType | null {
        if(key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)){
            return localStorage.getItem(key);
        } else {
            const accessToken: string = localStorage.getItem(this.accessTokenKey) || '';
            const refreshToken: string = localStorage.getItem(this.refreshTokenKey) || '';
            let name: string = localStorage.getItem(this.userInfoTokenKey) || '';

            name = (JSON.parse(name) as UserInfoType).name;
            return {
                accessToken,
                refreshToken,
                name,
            };
        }
    }

    public static async performLogin(email: string, password: string, rememberMe: boolean): Promise<void> {
        const result: PerformLoginType = await HttpUtils.request('/login', 'POST', false, { email, password, rememberMe });

        if (result.error || !result.response || (result.response && (!result.response.tokens || !result.response.user))) {
            throw new Error('Login failed');
        }

        this.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {
            id: result.response.user.id,
            name: result.response.user.name + ' ' + result.response.user.lastName
        });
    }

    public static async updateRefreshToken(): Promise<boolean>{
        let result: boolean = false;
        const refreshToken: AuthInfoType | null = this.getAuthInfo(this.refreshTokenKey) as AuthInfoType | null;
        if(refreshToken){
            const response: Response = await fetch(config.api + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });
            if(response && response.status === 200){
                const tokens: RefreshResponseType | null = await response.json();
                if(tokens && tokens.tokens && !tokens.error){
                    this.setAuthInfo(tokens.tokens.accessToken, tokens.tokens.refreshToken);
                    result = true;
                }
            }
        }
        if(!result){
            this.removeAuthInfo();
        }
        return result;
    }

    private static setAuthInfo(accessToken: string, refreshToken:string, userInfo?: UserInfoType): void{
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if(userInfo){
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }
}