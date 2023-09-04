import axios from "axios";
import { api } from "../helpers/urlConfigs";
import store from "../store/index";
import { toast } from "react-hot-toast";
import { signout } from "../actions/authActions";
import { keyExchange } from "../actions/webSessionActions"

const abortController = new AbortController()
const timeout = setTimeout(() => {
    abortController.abort()
    store.dispatch(signout())
    console.log("Aborted")
}, 2000)


const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: api,
    
    headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Upgrade-Insecure-Requests': '1',
        'Accept-Language': 'en-US',
        'Accept': 'application/json',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Security-Policy': "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'",
        'Referrer-Policy': 'no-referrer',
        'Feature-Policy': "geolocation 'none'; midi 'none'; sync-xhr 'none'; microphone 'none'; camera 'none'; magnetometer 'none'; gyroscope 'none'; speaker 'none'; fullscreen 'self'; payment 'none'",
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Origin': `${api}`
    },
    timeout: 50000,
    signal: abortController.signal,
})

axiosInstance.interceptors.response.use((res) => {
    if (res) {
        console.log(res)
        clearTimeout(timeout)
    }
    return res
}, async (error) => {
    //store.dispatch(keyExchange())
    clearTimeout(timeout)
    try {
        toast.dismiss('loading')
        toast.dismiss('Deleting')
        toast.dismiss('Updating')
        toast.dismiss('sending')
        toast.dismiss('Unlocking')
        toast.dismiss('Creating')
        toast.dismiss('Removing')
        toast.dismiss('Loading')
        toast.dismiss('Adding')
        toast.dismiss('generating')
    }
    catch (err) {
        console.log(error)
    }

    console.log(error.response)
    if (error.response === undefined) {
        store.dispatch(signout())
    }
    const { status } = error.response

    if (status === 429) {
        toast.error("Too many requests, Try again later...", { id: 'ratelim' })
    }
    else if (status === 408) {
        toast.error("Request timed out, Try again later...", { id: 'timeout' })
    }

    else if (
        (status === 401 &&
            (error.response.data.message === "Session Expired" ||
                error.response.data.message === "Unauthorized" ||
                error.response.data.message === "Potential Malicious Atempt" ||
                error.response.data.message === "Invalid Web Session" ||
                error.response.data.message === "Invalid Web Session Token" ||
                error.response.data.message === "Invalid Web Session IP")) ||
        (status === 400 &&
            (error.response.data.message === "Invalid Session" ||
                error.response.data.message === "Invalid Token" ||
                error.response.data.message === "Authorization Required!" ||
                error.response.data.message === "Not Logged In" ||
                error.response.data.message === "User and Web sessions mismatch")) ||
        (status === 500)
    ) {
        store.dispatch(signout())
    }
    return error
})

export default axiosInstance