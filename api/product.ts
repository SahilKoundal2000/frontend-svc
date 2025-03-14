import axiosClient from "./axiosClient";
import { useAuth } from "@/context/authContext";

const API_VERSION = "/api/v1";

export interface Product {
    id?: string | number;
    name: string;
    description: string;
    price: number;
    stock: number;
    [key: string]: any;
}

export interface UpdateProduct {
    id?: string | number;
    name: string;
    description: string;
    price: number;
    [key: string]: any;
}

export interface StockUpdate {
    quantity_change: number;
    reason: string;
}

export const useProductAPI = () => {
    const { token } = useAuth();

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const addProduct = async (productData: Product & { image: File }) => {
        const formData = new FormData();

        Object.entries(productData).forEach(([key, value]) => {
            formData.append(key, value instanceof File ? value : String(value));
        });

        try {
            const response = await axiosClient.post(
                `${API_VERSION}/admin/products`,
                formData,
                {
                    ...getAuthHeaders(),
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(
                    error.response.data.message || "Failed to add product."
                );
            }
            throw new Error("Network error. Please try again.");
        }
    };

    const updateProduct = async (
        id: string | number,
        productData: UpdateProduct & { image?: File | undefined }
    ) => {
        const formData = new FormData();

        Object.entries(productData).forEach(([key, value]) => {
            formData.append(key, value instanceof File ? value : String(value));
        });


        try {
            const response = await axiosClient.put(
                `${API_VERSION}/admin/products/${id}`,
                formData,
                {
                    ...getAuthHeaders(),
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(
                    error.response.data.message || "Failed to add product."
                );
            }
            throw new Error("Network error. Please try again.");
        }
    };

    const deleteProduct = async (id: string | number) => {
        const response = await axiosClient.delete(
            `${API_VERSION}/admin/products/${id}`,
            getAuthHeaders()
        );
        return response.data;
    };

    const updateProductStock = async (
        id: string | number,
        stockData: StockUpdate
    ) => {
        const response = await axiosClient.put(
            `${API_VERSION}/admin/products/${id}/stock`,
            stockData,
            getAuthHeaders()
        );
        return response.data;
    };

    const getInventoryLogs = async (id: string | number) => {
        const response = await axiosClient.get(
            `${API_VERSION}/admin/products/${id}/logs`,
            getAuthHeaders()
        );
        return response.data;
    }

    return {
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        getInventoryLogs,
    };
};

export const getAllProducts = async (params?: Record<string, any>) => {
    const response = await axiosClient.get(`${API_VERSION}/products`, { params });
    return response.data;
};

export const getProductById = async (id: string | number) => {
    const response = await axiosClient.get(`${API_VERSION}/products/${id}`);
    return response.data;
};
