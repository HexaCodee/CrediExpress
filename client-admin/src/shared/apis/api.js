import axios from "axios";

const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL,
    timeout: 5000,
    headers:{
        "Content-Type": "application/json"
    }
});

const axiosAdmin = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_URL,
    timeout: 5000,
    headers:{
        "Content-Type": "application/json"
    }
});

export { axiosAuth, axiosAdmin };