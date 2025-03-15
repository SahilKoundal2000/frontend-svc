import { useCallback } from "react";
import axiosClient from "./axiosClient";
import { useAuth } from "@/context/authContext";

const API_VERSION = "/api/v1";

export interface Reminder {
  id?: string | number;
  customer_id?: string | number;
  title: string;
  description: string;
  schedule_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const useReminderAPI = () => {
  const { token } = useAuth();

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getCustomerReminders = useCallback(
    async (params?: Record<string, any>) => {
      const response = await axiosClient.get(`${API_VERSION}/reminders`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    },
    [getAuthHeaders]
  );

  const scheduleReminder = useCallback(
    async (reminderData: Reminder) => {
      try {
        const response = await axiosClient.post(
          `${API_VERSION}/reminders`,
          reminderData,
          getAuthHeaders()
        );
        return response.data;
      } catch (error: any) {
        if (error.response && error.response.data) {
          throw new Error(
            error.response.data.message || "Failed to schedule reminder."
          );
        }
        throw new Error("Network error. Please try again.");
      }
    },
    [getAuthHeaders]
  );

  const updateReminder = useCallback(
    async (id: string | number, reminderData: Reminder) => {
      try {
        const response = await axiosClient.put(
          `${API_VERSION}/reminders/${id}`,
          reminderData,
          getAuthHeaders()
        );
        return response.data;
      } catch (error: any) {
        if (error.response && error.response.data) {
          throw new Error(
            error.response.data.message || "Failed to update reminder."
          );
        }
        throw new Error("Network error. Please try again.");
      }
    },
    [getAuthHeaders]
  );

  const deleteReminder = useCallback(
    async (id: string | number) => {
      const response = await axiosClient.delete(
        `${API_VERSION}/reminders/${id}`,
        getAuthHeaders()
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  const toggleReminder = useCallback(
    async (id: string | number) => {
      const response = await axiosClient.patch(
        `${API_VERSION}/reminders/${id}`,
        {},
        getAuthHeaders()
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  const getReminderLogs = useCallback(
    async (id: string | number, params?: Record<string, any>) => {
      const response = await axiosClient.get(
        `${API_VERSION}/reminders/${id}/logs`,
        { ...getAuthHeaders(), params }
      );
      return response.data;
    },
    [getAuthHeaders]
  );

  const getAllReminders = useCallback(
    async (params?: Record<string, any>) => {
      const response = await axiosClient.get(`${API_VERSION}/admin/reminders`, {
        ...getAuthHeaders(),
        params,
      });
      return response.data;
    },
    [getAuthHeaders]
  );

  return {
    getCustomerReminders,
    scheduleReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    getReminderLogs,
    getAllReminders,
  };
};
