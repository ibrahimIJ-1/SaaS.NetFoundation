import { apiClient } from './api-client';
import { 
  Contact, 
  ClientSummary, 
  CreateContactRequest, 
  CreateInteractionRequest,
  ContactInteraction 
} from '@/types/contact';

export const contactService = {
  getContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get('/contacts');
    return response.data;
  },

  getContactById: async (id: string): Promise<Contact> => {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data;
  },

  getClientSummary: async (id: string): Promise<ClientSummary> => {
    const response = await apiClient.get(`/contacts/${id}/summary`);
    return response.data;
  },

  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const response = await apiClient.post('/contacts', data);
    return response.data;
  },

  updateContact: async (id: string, data: CreateContactRequest): Promise<Contact> => {
    const response = await apiClient.put(`/contacts/${id}`, data);
    return response.data;
  },

  addInteraction: async (contactId: string, data: CreateInteractionRequest): Promise<ContactInteraction> => {
    const response = await apiClient.post(`/contacts/${contactId}/interactions`, data);
    return response.data;
  }
};
