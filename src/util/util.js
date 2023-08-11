import {ref} from "vue";

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
