// Axios is a JavaScript HTTP client library used to communicate with a backend server.
// AxiosHelper stores backend configuration, not data.
import axios from "axios"

export const baseURL = "http://localhost:8080"
export const httpClient = axios.create({
    baseURL:baseURL,
    timeout:1000,   //maximum time Axios waits for server response
    header:{
        'Content-Type' : 'application/json'
    }
})
