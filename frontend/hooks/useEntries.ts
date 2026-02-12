import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Entry } from '../types';
import { toast } from 'sonner';

// Backend often returns data wrappers, we parse them here
const fetchEntries = async (): Promise<Entry[]> => {
    const res = await api.get('/user/entries');
    const rawData = Array.isArray(res.data) ? res.data : (res.data.data || res.data.entries || []);

    // Normalize data to handle ID/id and case mismatch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawData.map((item: any) => ({
        ID: item.ID || item.id,
        situation: item.situation || item.Situation,
        text: item.text || item.Text,
        colour: item.colour || item.Colour,
        icon: item.icon || item.Icon,
        CreatedAt: item.CreatedAt || item.created_at,
        user_id: item.user_id || item.UserID
    }));
};

export const useEntries = () => {
    return useQuery({
        queryKey: ['entries'],
        queryFn: fetchEntries,
    });
};

export const useCreateEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newEntry: Omit<Entry, 'ID' | 'CreatedAt' | 'UserID'>) => {
            // API expects lowercase keys for creation based on current form
            // We map the Uppercase keys of Entry to the payload
            const payload = {
                situation: newEntry.situation,
                text: newEntry.text,
                colour: newEntry.colour,
                icon: newEntry.icon,
            };
            const res = await api.post('/user/entries', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.success('Memory created successfully!');
        },
        onError: () => {
            const msg = 'Failed to create memory';
            toast.error(msg);
        },
    });
};

export const useUpdateEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (entry: Entry) => {
            const payload = {
                situation: entry.situation,
                text: entry.text,
                colour: entry.colour,
                icon: entry.icon,
            };
            const res = await api.put(`/user/entries/${entry.ID}`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.success('Memory updated');
        },
        onError: () => {
            toast.error('Failed to update memory');
        },
    });
};

export const useDeleteEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/user/entries/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.success('Memory deleted');
        },
        onError: () => {
            toast.error('Failed to delete memory');
        },
    });
};
