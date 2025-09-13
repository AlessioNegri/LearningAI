import axios, { AxiosInstance } from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs : ClassValue[]) : string => { return twMerge(clsx(inputs)); };

export const api : AxiosInstance = axios.create({ baseURL: 'http://localhost:8000' });