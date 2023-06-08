import { Socket } from 'socket.io-client';
import { create } from 'zustand';

import { IClientToServerEvents, IServerToClientEvents } from '@schema/ws';
import { ChatroomChatMessageS2C } from '@schema/ws/s2c';

type SocketType = Socket<IServerToClientEvents, IClientToServerEvents>;

interface ChatStore {
  socket: SocketType | null;
  roomId: string | null;

  messages: ChatroomChatMessageS2C[];

  initialize: (socket: SocketType) => void;
  cleanUp: () => void;

  enter: (roomId: string) => void;
  chat: (chatText: string) => void;
  leave: (roomId: string) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  roomId: null,
  messages: [],
  rtc: null,

  initialize: (socket: SocketType) => {
    socket.on('chat', (msg) =>
      set(({ messages }) => ({
        messages: messages.concat(msg),
      })),
    );

    socket.on('connect', () => {
      set({ socket });
      const { roomId } = get();
      if (roomId) {
        socket.emit('enter', { roomId });
      }
    });

    socket.on('disconnect', () => {
      set({ socket: null });
    });
  },

  cleanUp: () => {
    const { leave, roomId } = get();

    if (roomId !== null) leave(roomId);
    set({ socket: null });
  },

  enter: (roomId: string) => {
    const { socket, roomId: oldRoomId } = get();
    set({ roomId });

    if (!socket) {
      return;
    }

    if (oldRoomId !== null) {
      throw new Error('double enter');
    }

    socket.emit('enter', { roomId });
  },

  leave: (roomId: string) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit('leave', { roomId });
    set({ roomId: null, messages: [] });
  },

  chat: (chatText: string) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit('chat', { chatText });
  },
}));

export default useChatStore;
