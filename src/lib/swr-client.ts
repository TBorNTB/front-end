import useSWR from 'swr';
import { apiClient } from './api/client';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export { fetcher, useSWR };
