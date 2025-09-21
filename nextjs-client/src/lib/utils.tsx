import axios, { AxiosInstance } from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs : ClassValue[]) : string => { return twMerge(clsx(inputs)); };

export const api : AxiosInstance = axios.create({ baseURL: 'http://localhost:8000' });

// >>> Generate a random color string
export function getRandomColor()
{
    var letters = '0123456789ABCDEF';

    var color = '#';

    for (var i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    
    return color;
}