import { Socket, io } from 'socket.io-client';
import { create } from 'zustand';

import { IClientToServerEvents, IServerToClientEvents } from '@schema/ws';
import { ChatroomChatMessageS2C } from '@schema/ws/s2c';

import useAuthStore from './auth';

type SocketType = Socket<IServerToClientEvents, IClientToServerEvents>;

interface ChatStore {
  socket: SocketType | null;
  roomId: string | null;

  messages: ChatroomChatMessageS2C[];

  connect: () => void;

  enter: (roomId: string) => void;
  chat: (chatText: string) => void;
  leave: (roomId: string) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  roomId: null,
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

  enter: (roomId: string) => {
    const { socket, roomId: oldRoomId } = get();
    if (!socket) return false;
    if (oldRoomId !== null) {
      if (oldRoomId === roomId) return true;

      socket.emit('leave', { roomId: oldRoomId });
    }

    socket.emit('enter', { roomId });
    set({ roomId });
  },

  chat: (chatText: string) => {
    const { socket } = get();
    if (!socket) return false;

    socket.emit('chat', { chatText });
  },

  leave: (roomId: string) => {
    const { socket } = get();
    if (!socket) return false;

    socket.emit('leave', { roomId });
    set({ roomId: null });
  },
}));

export default useChatStore;
