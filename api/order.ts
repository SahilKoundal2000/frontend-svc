import { useCallback } from "react";
import axiosClient from "./axiosClient";
import { useAuth } from "@/context/authContext";

const API_VERSION = "/api/v1";

export interface OrderItem {
  product_id: string | number;
  product_name: string;
  quantity: number;
  price?: number;
}

export interface Order {
  order_id: string | number;
  items: OrderItem[];
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export interface OrderStatusUpdate {
  status: string;
  notes?: string;
}

export const useOrderAPI = () => {
  const { token } = useAuth();

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getCustomerOrders = useCallback(
    async (params?: Record<string, any>) => {
      const response = await axiosClient.get(`${API_VERSION}/orders`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    },
    [getAuthHeaders]
  );

  const getOrderById = useCallback(
    async (id: string | number) => {
      const response = await axiosClient.get(
        `${API_VERSION}/orders/${id}`,
        getAuthHeaders()
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  const placeOrder = useCallback(
    async (orderData: { items: OrderItem[]; prescription?: File }) => {
      const formData = new FormData();

      const itemsJson = JSON.stringify({ items: orderData.items });

      formData.append("items", itemsJson);
      if (orderData.prescription) {
        formData.append("prescription", orderData.prescription);
      }

      try {
        const response = await axiosClient.post(
          `${API_VERSION}/orders`,
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
            error.response.data.message || "Failed to place order."
          );
        }
        throw new Error("Network error. Please try again.");
      }
    },
    [getAuthHeaders]
  );

  const generatePaymentURL = useCallback(
    async (id: string | number) => {
      const response = await axiosClient.post(
        `${API_VERSION}/orders/${id}/payment`,
        {},
        getAuthHeaders()
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  const getAllOrders = useCallback(
    async (params?: Record<string, any>) => {
      const response = await axiosClient.get(`${API_VERSION}/admin/orders`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    },
    [getAuthHeaders]
  );

  const updateOrderStatus = useCallback(
    async (id: string | number, statusData: OrderStatusUpdate) => {
      const response = await axiosClient.put(
        `${API_VERSION}/admin/orders/${id}`,
        statusData,
        getAuthHeaders()
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  return {
    getCustomerOrders,
    getOrderById,
    placeOrder,
    generatePaymentURL,
    getAllOrders,
    updateOrderStatus,
  };
};
