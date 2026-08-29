import axios from 'axios';
import Constant from '../lib/Constant';

const AxiosClientApi = axios.create({
    baseURL: Constant.API_BASE_URL,
});

AxiosClientApi.interceptors.request.use(function (request) {
    request.headers['content-type'] = Constant.CONTENT_TYPE;
    request.headers['api-key'] = Constant.API_KEY;
    return request;
});

AxiosClientApi.interceptors.response.use(
    response => {
        return response?.data;
    },
    error => {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return Promise.reject(error);
    }
);

export default AxiosClientApi;
