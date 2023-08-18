import {ref} from "vue";
import axios from "axios";
import {NotificationService} from "vue-devui/notification";

export function getParam(paramName) {
    let uri = window.location.href.split('?');
    if (uri.length === 2) {
        let vars = uri[1].split('&');
        let getVars = {};
        let tmp = '';
        vars.forEach(function (v) {
            tmp = v.split('=');
            if (tmp.length === 2)
                getVars[tmp[0]] = tmp[1];
        });

        return ref(getVars[paramName]);
    }
}
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
export async function post(url, data) {
    const Authorization = localStorage.getItem('Authorization');
    const response = await axios.post('http://' + import.meta.env.VITE_BACKEND_URL +':8095' + url, data, {
        headers: {
            'Authorization': Authorization
        }
    }).catch(function (error) {
        if (error.response.status === 401) {
            NotificationService.open({
                title: '登录失效，请重新登录',
                type: 'error',
                duration: 3000
            });
            window.location.href = "#login";
        }
        return error.response;
    });

    if (response.headers['authorization'] != null) {
        localStorage.setItem('Authorization', response.headers['authorization']);
    }
    return response;
}
