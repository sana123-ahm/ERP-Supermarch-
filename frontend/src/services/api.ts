const API_BASE_URL = "http://localhost:3000/api";

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options?.method || "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiCall<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (data: any) =>
    apiCall<{ user: any }>("/auth/register", {
      method: "POST",
      body: data,
    }),
};

// Products API
export const productsApi = {
  getAll: () => apiCall<any[]>("/products"),

  getById: (id: string) => apiCall<any>(`/products/${id}`),

  getByBarcode: (barcode: string) => apiCall<any>(`/products/barcode/${barcode}`),

  getByCategory: (category: string) => apiCall<any[]>(`/products/category/${category}`),

  create: (data: any) =>
    apiCall<any>("/products", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/products/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    apiCall<void>(`/products/${id}`, {
      method: "DELETE",
    }),
};

// Stock API
export const stockApi = {
  getAll: () => apiCall<any[]>("/stock"),

  getByProductId: (productId: string) =>
    apiCall<any>(`/stock/${productId}`),

  create: (data: any) =>
    apiCall<any>("/stock", {
      method: "POST",
      body: data,
    }),

  update: (productId: string, quantity: number) =>
    apiCall<any>(`/stock/${productId}`, {
      method: "PUT",
      body: { quantity },
    }),

  increment: (productId: string, quantity: number) =>
    apiCall<any>(`/stock/${productId}/increment`, {
      method: "PUT",
      body: { quantity },
    }),

  decrement: (productId: string, quantity: number) =>
    apiCall<any>(`/stock/${productId}/decrement`, {
      method: "PUT",
      body: { quantity },
    }),

  getMovements: () => apiCall<any[]>("/stock/movements"),

  addMovement: (data: any) =>
    apiCall<any>("/stock/movements", {
      method: "POST",
      body: data,
    }),
};

// Suppliers API
export const suppliersApi = {
  getAll: () => apiCall<any[]>("/suppliers"),

  getById: (id: string) => apiCall<any>(`/suppliers/${id}`),

  create: (data: any) =>
    apiCall<any>("/suppliers", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/suppliers/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    apiCall<void>(`/suppliers/${id}`, {
      method: "DELETE",
    }),
};

// Purchases API
export const purchasesApi = {
  getAll: () => apiCall<any[]>("/purchases"),

  getById: (id: string) => apiCall<any>(`/purchases/${id}`),

  create: (data: any) =>
    apiCall<any>("/purchases", {
      method: "POST",
      body: data,
    }),

  updateStatus: (id: string, status: string) =>
    apiCall<any>(`/purchases/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  delete: (id: string) =>
    apiCall<void>(`/purchases/${id}`, {
      method: "DELETE",
    }),
};

// Sales API
export const salesApi = {
  getAll: () => apiCall<any[]>("/sales"),

  getById: (id: string) => apiCall<any>(`/sales/${id}`),

  getByCashier: (cashierId: string) =>
    apiCall<any[]>(`/sales/cashier/${cashierId}`),

  create: (data: any) =>
    apiCall<any>("/sales", {
      method: "POST",
      body: data,
    }),
};

// Employees API
export const employeesApi = {
  getAll: () => apiCall<any[]>("/employees"),

  getById: (id: string) => apiCall<any>(`/employees/${id}`),

  getByDepartment: (department: string) =>
    apiCall<any[]>(`/employees/department/${department}`),

  create: (data: any) =>
    apiCall<any>("/employees", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/employees/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    apiCall<void>(`/employees/${id}`, {
      method: "DELETE",
    }),
};

export const dashboardApi = {
  getStats: () =>
    apiCall<any>("/dashboard/stats", {
      method: "GET",
    }),
};

// Leaves API
export const leavesApi = {
  getAll: () => apiCall<any[]>("/leaves"),

  getByEmployee: (employeeId: string) =>
    apiCall<any[]>(`/leaves/employee/${employeeId}`),

  getPending: () => apiCall<any[]>("/leaves/pending"),

  create: (data: any) =>
    apiCall<any>("/leaves", {
      method: "POST",
      body: data,
    }),

  createForEmployee: (employeeId: string, data: any) =>
    apiCall<any>(`/leaves/employee/${employeeId}` , {
      method: "POST",
      body: data,
    }),

  approve: (id: string) =>
    apiCall<any>(`/leaves/${id}/approve`, {
      method: "PATCH",
    }),

  reject: (id: string, reason: string) =>
    apiCall<any>(`/leaves/${id}/reject`, {
      method: "PATCH",
      body: { reason },
    }),

  delete: (id: string) =>
    apiCall<void>(`/leaves/${id}`, {
      method: "DELETE",
    }),
};

// Timesheets API
export const timesheetsApi = {
  checkIn: (employeeId: string) =>
    apiCall<any>(`/timesheets/${employeeId}/check-in`, {
      method: "POST",
    }),

  checkOut: (timesheetId: string) =>
    apiCall<any>(`/timesheets/${timesheetId}/check-out`, {
      method: "PATCH",
    }),

  getByEmployee: (employeeId: string, startDate: string, endDate: string) =>
    apiCall<any[]>(`/timesheets/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`),

  getAllByDate: (startDate: string, endDate: string) =>
    apiCall<any[]>(`/timesheets?startDate=${startDate}&endDate=${endDate}`),

  delete: (id: string) =>
    apiCall<void>(`/timesheets/${id}`, {
      method: "DELETE",
    }),
};

// Reports API
export const reportsApi = {
  getById: (id: string) => apiCall<any>(`/reports/${id}`),

  getByUser: (userId: string) => apiCall<any[]>(`/reports/user/${userId}`),

  exportReport: (reportType: string) =>
    apiCall<{ reportType: string; status: string; message: string }>(`/reports/export/${reportType}`),

  generateSalesReport: (data: any) =>
    apiCall<any>("/reports/sales", {
      method: "POST",
      body: data,
    }),

  getAnalytics: () => apiCall<any>("/reports/analytics"),
};

// Notifications API
export const notificationsApi = {
  getByRole: (role: string) => apiCall<any[]>(`/notifications/role/${role}`),
  
  send: (data: { senderName: string; senderRole: string; targetRole: string; message: string }) =>
    apiCall<any>("/notifications", {
      method: "POST",
      body: data,
    }),

  markRead: (id: string) =>
    apiCall<void>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: (senderRole: string, targetRole: string) =>
    apiCall<void>(`/notifications/read-all/${senderRole}/${targetRole}`, {
      method: "PATCH",
    }),
};

