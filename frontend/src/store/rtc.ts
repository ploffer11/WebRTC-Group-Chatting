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

  videoStream: Promise<MediaStream>;
  audioStream: Promise<MediaStream>;

  socket: SocketType | null;

  initialize: (socket: SocketType) => void;

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

  videoStream: navigator.mediaDevices.getUserMedia({
    video: true,
  }),
  audioStream: navigator.mediaDevices.getUserMedia({
    audio: true,
  }),

  initialize: (socket: SocketType) => {
    const {
      socket: oldSocket,
      refreshUsers,
      responseOffer,
      handleAnswer,
      checkIceCandidate,
    } = get();

    oldSocket?.close();

    socket.on('users', (msg) => refreshUsers(msg));
    socket.on('offer', (msg) => responseOffer(msg));
    socket.on('answer', (msg) => handleAnswer(msg));
    socket.on('candidate', (msg) => checkIceCandidate(msg));

    set({ socket });
  },

  newConnection: async (toSocketId: string) => {
    const { socket, videoStream, audioStream } = get();

    if (!socket) throw new Error('Socket is null');

    const conn = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
      ],
    });

    const streams = await Promise.all([videoStream, audioStream]);
    const allTracks = streams.map((stream) => stream.getTracks()).flat();

    allTracks.forEach((track) => conn.addTrack(track));

    conn.addEventListener('icecandidate', ({ candidate }) => {
      socket.emit('candidate', { toSocketId, candidate });
    });

    conn.addEventListener('track', ({ track }) =>
      set(({ streams }) => {
        if (!streams[toSocketId]) streams[toSocketId] = new MediaStream();
        streams[toSocketId].addTrack(track);

        console.log('ontrack');

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
    const { socket, rtcConnections, streams, newConnection } = get();

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

    set({ rtcConnections });

    for (const user of users) {
      // Earlier Socket ID starts connection
      if (!rtcConnections[user.socketId] && socket.id < user.socketId) {
        const connection = await newConnection(user.socketId);

        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        socket.emit('offer', {
          offer,
          toSocketId: user.socketId,
        });
      }
    }
  },

  responseOffer: async ({ fromSocketId, offer }: RTCOfferMessageS2C) => {
    const { socket, rtcConnections, newConnection } = get();

    if (!socket) throw new Error('Socket is null');

    if (rtcConnections[fromSocketId]) {
      throw new Error(`Duplicate webrtc offer from socketId ${fromSocketId}`);
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
    const { socket, rtcConnections } = get();

    if (!socket) throw new Error('Socket is null');

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
