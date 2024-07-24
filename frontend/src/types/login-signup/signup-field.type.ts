import {LoginFieldType} from "./login-field.type";

export type SignupFieldType = LoginFieldType & {
    regex: RegExp
}