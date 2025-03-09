import axiosClient from './axiosClient';

const API_VERSION = '/api/v1';

const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(input);
};

export const login = async (identifier: string, password: string) => {
  const data = isEmail(identifier)
    ? { email: identifier, password }
    : { username: identifier, password };
  const response = await axiosClient.post(`${API_VERSION}/login`, data);
  return response.data;
};

export const register = async (userData: Record<string, string>) => {
  const response = await axiosClient.post(`${API_VERSION}/register`, userData);
  return response.data;
};
