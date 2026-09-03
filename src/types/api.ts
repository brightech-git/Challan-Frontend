// Generic envelope returned by every endpoint on the Spring Boot backend.
// See com.Brightech.Challan.ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Shape of the error body the backend / interceptor surfaces to callers.
export interface ApiError {
  success: false;
  message: string;
  status?: number;
}
