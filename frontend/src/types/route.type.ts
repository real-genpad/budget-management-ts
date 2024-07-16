//тип для роутов в файле router.ts

//Так Роман показал в практике по квизу, но в этом случае во всех роутах могут быть или не быть почти любые свойства
// export type RouteType = {
//     route: string,
//     title?: string,
//     filePathTemplate?: string,
//     useLayout?: string | boolean,
//     requiresAuth: boolean,
//     load(): void,
//     unload?(): void
// }

export type RouteType = ContentPages | AuthorizationPages | DeleteAndLogout;

type BasePoints = { //свойства, которые есть у всех роутов
    route: string,
    requiresAuth: boolean,
    load(): void,
}

type CommonPoints = { //общие свойства для контента и авторизации
    title: string,
    filePathTemplate: string
}

type ContentPages = BasePoints & CommonPoints & { //для основных роутов с контентом
    useLayout: string,
    name: 'content',
}

type AuthorizationPages = BasePoints & CommonPoints & { //для регистрации и логина
    name: 'authorization',
    unload(): void
}

type DeleteAndLogout = BasePoints & { //для логаута и удаления
    name: 'deleteAndLogout',
};

