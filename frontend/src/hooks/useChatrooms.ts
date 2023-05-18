import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { IChatroom, ICreateChatroom } from '@schema/chatroom';

import apiRequest from '../api/index.ts';

export const useChatroom = () => {
  const rooms = useQuery({
    queryKey: ['chat'],
    queryFn: async () =>
      apiRequest<IChatroom[]>({
        method: 'GET',
        url: '/chat',
      }),
  });

  return rooms.data;
};

export const useCreateChatRoom = () => {
  const queryClient = useQueryClient();
  const createChatroom = useMutation({
    mutationKey: ['chat', 'create'],
    mutationFn: async (chat: ICreateChatroom) =>
      apiRequest({
        method: 'POST',
        url: '/chat',
        data: chat,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat']);
    },
  });

  return createChatroom;
};
