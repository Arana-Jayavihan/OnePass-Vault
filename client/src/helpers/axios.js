import axios from "axios";
import { authConsts } from '../actions/constants'
import { api } from "../urlConfigs";
import store from "store";
import { toast } from "react-hot-toast";
import Cookies from "universal-cookie";

const cookies = new Cookies()

const axiosInstance = axios.create({
    // withCredentials: true,
    baseURL: api,
    headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Upgrade-Insecure-Requests': '1',
        'Accept-Language': 'en-US',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '0',
        'X-Content-Type-Options': 'nosniff'
    }
})

axiosInstance.interceptors.request.use((req) => {
    const token = cookies.get('token')
    if (token) {
        req.headers.Authorization = `${token}`
    }
    const encToken = cookies.get('encToken')
    if (encToken) {
        req.data["encToken"] = encToken
    }
    const encVaultUnlockToken = cookies.get('encVaultUnlockToken')
    if (encVaultUnlockToken) {
        req.data["encVaultUnlockToken"] = encVaultUnlockToken
    }
    return req
})

axiosInstance.interceptors.response.use((res) => {
    if(res){
        console.log(res)
    }
    return res
}, (error) => {
    try{
        toast.dismiss('loading')
        toast.dismiss('Deleting')
        toast.dismiss('Updating')
        toast.dismiss('sending')
    }
    catch (err){
        console.log(error)
    }
    
    console.log(error.response)
    const { status } = error.response
    if (status === 401 && error.response.data.message === "Session Expired") {
        toast.error(`${error.response.data.message}`, {
            id: 'sessiontout'
        })
        cookies.remove('token', {
            path: '/'
        })
        cookies.remove('refreshToken', {
            path: '/'
        })
        cookies.remove('encToken', {
            path: '/'
        })
        sessionStorage.clear()
        store.dispatch({ type: authConsts.LOGOUT_SUCCESS })
        window.location.href = '/'
    }
    if (status === 429){
        toast.error("Too many requests, Try again later...", {id: 'ratelim'})
    }
    if (status === 408){
        toast.error("Request timed out, Try again later...", {id: 'timeout'})
    }

    if ((status === 401 && error.response.data.message === "Potential Malicious Atempt") || (status === 400 && (error.response.data.message === "Invalid Session" || error.response.data.message === "Invalid Token"))) {
        toast.error(`${error.response.data.message}`, {
            id: 'sessiontout'
        })
        cookies.remove('token', {
            path: '/'
        })
        cookies.remove('refreshToken', {
            path: '/'
        })
        cookies.remove('encToken', {
            path: '/'
        })
        sessionStorage.clear()
        store.dispatch({ type: authConsts.LOGOUT_SUCCESS })
        window.location.href = '/'
    }
    return error
})

export default axiosInstance