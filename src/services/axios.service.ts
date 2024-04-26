import axios from "axios";

const URL = "https://wekip-backend.onrender.com/api/v1"

export interface PrivateRequestProps {
    token: string;
    signOut: () => void;
}

export interface AxiosResponseMessage {
    message: string
}

export const privateRequest = ({
    token,
    signOut
}: PrivateRequestProps) => {

    const axiosInstance = axios.create({
        baseURL: URL,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    })

    axiosInstance.interceptors.request.use(
        config => {
            config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    )

    axiosInstance.interceptors.response.use(
        response => {
            return response
        },
        async (error) => {
            if (error.response.status === 401 && token) signOut()
            return Promise.reject(error)
        }
    )

    return axiosInstance

}

export const publicRequest = axios.create({
    baseURL: URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})