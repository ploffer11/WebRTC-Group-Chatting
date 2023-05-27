import { Socket, io } from 'socket.io-client';
import { create } from 'zustand';

import { IClientToServerEvents, IServerToClientEvents } from '@schema/ws';
import { ChatroomChatMessageS2C } from '@schema/ws/s2c';

import useAuthStore from './auth';

type SocketType = Socket<IServerToClientEvents, IClientToServerEvents>;

interface ChatStore {
  socket: SocketType | null;

  messages: ChatroomChatMessageS2C[];

  connect: () => void;

  chat: (chatText: string) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  messages: [],

  connect: () => {
    const { access_token } = useAuthStore.getState();

    if (get().socket) return;

    const socket: SocketType = io(import.meta.env.VITE_API_URL, {
      extraHeaders: {
        authorization: `Bearer ${access_token}`,
      },
    });

    socket.on('chat', (msg) =>
      set(({ messages }) => ({
        messages: messages.concat(msg),
      })),
    );

    socket.on('disconnect', () => set({ socket: null }));

    set({ socket });
  },

  chat: (chatText: string) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit('chat', { chatText });
  },
}));

export default useChatStore;
