import { useState, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiHook<T, P> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (params?: P) => Promise<T | null>;
  reset: () => void;
}

interface ApiErrorResponse {
  message?: string;
}

/**
 * Custom hook for handling API calls with loading, error states
 * @param apiFunction The API function to call
 * @returns Object containing data, loading state, error, execute function, and reset function
 */
export function useApi<T, P = void>(
  apiFunction: (params?: P) => Promise<AxiosResponse<T>>
): ApiHook<T, P> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (params?: P): Promise<T | null> => {
      setState({ data: null, isLoading: true, error: null });
      try {
        const response = await apiFunction(params);
        setState({ data: response.data, isLoading: false, error: null });
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage = 
          axiosError.response?.data?.message || 
          axiosError.message || 
          'An error occurred';
        setState({ data: null, isLoading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useApi;
