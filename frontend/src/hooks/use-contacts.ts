import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contact.service';
import { CreateContactRequest, CreateInteractionRequest } from '@/types/contact';

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: contactService.getContacts,
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactService.getContactById(id),
    enabled: !!id,
  });
}

export function useClientSummary(id: string) {
  return useQuery({
    queryKey: ['contacts', id, 'summary'],
    queryFn: () => contactService.getClientSummary(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateContactRequest }) => 
      contactService.updateContact(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', data.id] });
    }
  });
}

export function useAddInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: string, data: CreateInteractionRequest }) => 
      contactService.addInteraction(contactId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.contactId] });
    }
  });
}
