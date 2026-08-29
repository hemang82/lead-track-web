const PRODUCTION = import.meta.env.PROD

const Constant = {
    APP_NAME: import.meta.env.VITE_APP_NAME,
    API_KEY: import.meta.env.VITE_API_KEY,
    CONTENT_TYPE: import.meta.env.VITE_CONTENT_TYPE || "Application/json",
    API_BASE_URL: PRODUCTION
        ? import.meta.env.VITE_LIVE_API_BASE_URL
        : import.meta.env.VITE_LOCAL_API_BASE_URL,

    LOGIN_KEY: "is_login",
    AUTH_KEY: 'auth',

    OK: 200,

    CREATED: 201,
    NO_CONTENT: 204,

    ERROR: 400,
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 400,

    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,

    INTERNAL_SERVER_ERROR: 500,

}



export default Constant