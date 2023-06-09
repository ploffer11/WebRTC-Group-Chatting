import { Socket } from 'socket.io-client';
import { create } from 'zustand';

import {
  ChatroomUsersMessageS2C,
  IClientToServerEvents,
  IServerToClientEvents,
  RTCAnswerMessageS2C,
  RTCICECandidateMesageS2C,
  RTCOfferMessageS2C,
} from '@schema/ws';

type SocketType = Socket<IServerToClientEvents, IClientToServerEvents>;

interface RTCStore {
  rtcConnections: { [socketId: string]: RTCPeerConnection };
  streams: { [socketId: string]: MediaStream };
  userNames: { [socketId: string]: string };

  mediaStream: MediaStream | null;

  socket: SocketType | null;

  chatMode: 'audio' | 'video';

  enabled: boolean;

  initialize: (socket: SocketType) => void;
  leave: () => void;
  cleanUp: () => void;

  registerMediaStream: (stream: MediaStream) => void;
  setChatMode: (mode: 'audio' | 'video') => void;

  startCall: () => void;
  hangUpCall: () => void;

  newConnection: (toSocketId: string) => Promise<RTCPeerConnection>;
  refreshUsers: ({ users }: ChatroomUsersMessageS2C) => Promise<void>;
  responseOffer: ({ fromSocketId, offer }: RTCOfferMessageS2C) => Promise<void>;
  handleAnswer: ({
    fromSocketId,
    answer,
  }: RTCAnswerMessageS2C) => Promise<void>;

  checkIceCandidate: ({
    fromSocketId,
    candidate,
  }: RTCICECandidateMesageS2C) => Promise<void>;
}

const useRTCStore = create<RTCStore>((set, get) => ({
  rtcConnections: {},
  streams: {},
  userNames: {},

  socket: null,

  mediaStream: null,

  enabled: false,

  chatMode: 'video',

  initialize: (socket: SocketType) => {
    const { refreshUsers, responseOffer, handleAnswer, checkIceCandidate } =
      get();

    socket.on('users', (msg) => refreshUsers(msg));
    socket.on('offer', (msg) => responseOffer(msg));
    socket.on('answer', (msg) => handleAnswer(msg));
    socket.on('candidate', (msg) => checkIceCandidate(msg));

    set({ socket });
  },

  cleanUp: () => {
    const { leave } = get();
    leave();
    set({ socket: null });
  },

  leave: () => {
    const { enabled, hangUpCall } = get();

    if (enabled) {
      hangUpCall();
    }

    set({ userNames: {} });
  },

  registerMediaStream: (stream: MediaStream) => {
    set({ mediaStream: stream });
  },

  setChatMode: (mode: 'audio' | 'video') => {
    set({ chatMode: mode });
  },

  startCall: async () => {
    const { socket, userNames, newConnection } = get();

    if (socket === null) {
      throw new Error('Socket is null!');
    }

    const users = Object.entries(userNames);

    for (const [socketId] of users) {
      if (socket.id === socketId) {
        continue;
      }

      const connection = await newConnection(socketId);
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      socket.emit('offer', {
        offer,
        toSocketId: socketId,
      });
    }

    set({ enabled: true });
  },

  hangUpCall: () => {
    const { rtcConnections, mediaStream } = get();

    Object.values(rtcConnections).forEach((conn) => {
      conn.close();
    });

    (mediaStream?.getTracks() ?? []).forEach((track) => track.stop());

    set({
      enabled: false,
      mediaStream: null,
      rtcConnections: {},
      streams: {},
    });
  },

  newConnection: async (toSocketId: string) => {
    const { socket, mediaStream } = get();

    if (!socket) throw new Error('Socket is null');

    const conn = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'turn:122.44.165.52:8090',
          username: 'username',
          credential: 'password',
        },
      ],
    });

    if (mediaStream === null) {
      throw new Error('mediaStream is null');
    }

    mediaStream.getTracks().forEach((track) => {
      conn.addTrack(track, mediaStream);
    });

    conn.addEventListener('icecandidate', ({ candidate }) => {
      socket.emit('candidate', { toSocketId, candidate });
    });

    conn.addEventListener('track', (event) =>
      set(({ streams }) => {
        streams[toSocketId] = event.streams[0];
        return { streams };
      }),
    );

    set(({ rtcConnections }) => {
      rtcConnections[toSocketId] = conn;
      return { rtcConnections };
    });

    return conn;
  },

  refreshUsers: async ({ users }: ChatroomUsersMessageS2C) => {
    const { socket, rtcConnections, streams } = get();

    if (!socket) throw new Error('Socket is null');

    // Update usernames
    set({
      userNames: Object.fromEntries(
        users.map((user) => [user.socketId, user.username]),
      ),
    });

    const expiredSocketIds: string[] = [];

    // Close expired connections
    Object.keys(rtcConnections).forEach((socketId) => {
      if (users.every((user) => user.socketId !== socketId)) {
        expiredSocketIds.push(socketId);
      }
    });

    expiredSocketIds.forEach((socketId) => {
      (streams[socketId]?.getTracks() || []).forEach((track) =>
        streams[socketId].removeTrack(track),
      );
      rtcConnections[socketId].close();

      delete streams[socketId];
      delete rtcConnections[socketId];
    });

    set({ rtcConnections, streams });
  },

  responseOffer: async ({ fromSocketId, offer }: RTCOfferMessageS2C) => {
    const { socket, enabled, rtcConnections, newConnection } = get();

    if (!socket) throw new Error('Socket is null');
    if (!enabled) {
      return;
    }

    if (rtcConnections[fromSocketId]) {
      rtcConnections[fromSocketId].close();
    }

    const connection = await newConnection(fromSocketId);
    await connection.setRemoteDescription(offer as RTCSessionDescriptionInit);

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);

    socket.emit('answer', { toSocketId: fromSocketId, answer });
  },

  handleAnswer: async ({ fromSocketId, answer }: RTCAnswerMessageS2C) => {
    const { socket, rtcConnections } = get();

    if (!socket) throw new Error('Socket is null');

    if (rtcConnections[fromSocketId]?.signalingState === 'stable') {
      throw new Error(`Unexpected webrtc answer from socketId ${fromSocketId}`);
    }

    await rtcConnections[fromSocketId].setRemoteDescription(
      answer as RTCSessionDescriptionInit,
    );
  },

  checkIceCandidate: async ({
    fromSocketId,
    candidate,
  }: RTCICECandidateMesageS2C) => {
    const { socket, enabled, rtcConnections } = get();

    if (!socket) throw new Error('Socket is null');
    if (!enabled) {
      return;
    }

    if (!rtcConnections[fromSocketId]) {
      throw new Error(
        `Unexpected ICE candidate exchange from socketId ${fromSocketId}`,
      );
    }

    await rtcConnections[fromSocketId].addIceCandidate(
      candidate as RTCIceCandidateInit,
    );
  },
}));

export default useRTCStore;
