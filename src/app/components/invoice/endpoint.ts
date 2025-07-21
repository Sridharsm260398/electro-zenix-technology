export const invoiceEndpoints = {
  getAll: '/api/v1/invoice',           
  create: '/api/v1/invoice',            
  getById: (id: string) => `/api/v1/invoice/${id}`,   
  update: (id: string) => `/api/v1/invoice/${id}`,     
  delete: (id: string) => `/api/v1/invoice/${id}`,  
};
