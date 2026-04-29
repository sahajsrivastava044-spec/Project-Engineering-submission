import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("auth_token");

    // if(token){
    //     config.headers.Authorization=`Bearer ${token}`;
    // }

    return config;
});

api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        const status=error.response?.status;

        if(status===401){
            console.warn("Unauthorized - Global handler");
        }

        if(status===403){
            console.warn("Forbidden");
        }

        if(status>=500){
            console.error("Server error");
        }

        return Promise.reject(error);
    }
)

export const getProducts=()=>api.get("/products");


export const getProductById=(id)=>{
    return api.get("/products/categories");
}

export const getCategories = () =>
  api.get("/products/categories");

export const getProductsByCategory=(category)=>{
    return api.get(`/products/category/${category}`);
}

export const getUserCart=(userId=1)=>{
    return api.get(`/carts/user/${userId}`);
}

export const addToCart=(data)=>{
    return api.post(`/carts/${cartId}`);
}

export const deleteCart = (cartId) =>
  api.delete(`/carts/${cartId}`);

export const getUserProfile=(data)=>{
    return api.post("/users",data);
}

export const submitReview = (data) =>
  api.post("/users", data);

export default api;