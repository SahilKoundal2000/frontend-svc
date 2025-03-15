import { useCallback } from "react";
import axiosClient from "./axiosClient";
import { useAuth } from "@/context/authContext";

const API_VERSION = "/api/v1";

export interface Payment {
  id: string | number;
  order_id: string | number;
  amount: number;
  status: string;
  payment_url?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const usePaymentAPI = () => {
  const { token } = useAuth();

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getPaymentById = useCallback(
    async (id: string | number) => {
      const response = await axiosClient.get(
        `${API_VERSION}/payments/${id}`,
        getAuthHeaders()
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  const getPaymentByOrderId = useCallback(
    async (orderId: string | number) => {
      const response = await axiosClient.get(
        `${API_VERSION}/payments/order/${orderId}`,
        getAuthHeaders()
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  return {
    getPaymentById,
    getPaymentByOrderId,
  };
};
