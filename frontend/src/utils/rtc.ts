import { Socket } from 'socket.io-client';

import {
  ChatroomUsersMessageS2C,
  IClientToServerEvents,
  IServerToClientEvents,
  RTCAnswerMessageS2C,
  RTCICECandidateMesageS2C,
  RTCOfferMessageS2C,
} from '@schema/ws';

type SocketType = Socket<IServerToClientEvents, IClientToServerEvents>;

export default class RTC {
  rtcConnections: { [socketId: string]: RTCPeerConnection };

  videoStream: Promise<MediaStream>;
  audioStream: Promise<MediaStream>;

  constructor(private socket: SocketType) {
    this.rtcConnections = {};

    this.videoStream = navigator.mediaDevices.getUserMedia({
      video: true,
    });
    this.audioStream = navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    this.socket.on('users', (msg) => this.refreshUsers(msg));
    this.socket.on('offer', (msg) => this.responseOffer(msg));
    this.socket.on('answer', (msg) => this.handleAnswer(msg));
    this.socket.on('candidate', (msg) => this.checkIceCandidate(msg));
  }

  private async newConnection(toSocketId: string) {
    const conn = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
      ],
    });

    const streams = await Promise.all([this.videoStream, this.audioStream]);
    const allTracks = streams.map((stream) => stream.getTracks()).flat();

    allTracks.forEach((track) => conn.addTrack(track));

    conn.addEventListener('icecandidate', ({ candidate }) => {
      this.socket.emit('candidate', { toSocketId, candidate });
    });

    this.rtcConnections[toSocketId] = conn;

    return conn;
  }

  async refreshUsers({ users }: ChatroomUsersMessageS2C) {
    const expiredSocketIds: string[] = [];
    // Close expired connections
    Object.keys(this.rtcConnections).forEach((socketId) => {
      if (users.every((user) => user.socketId !== socketId)) {
        expiredSocketIds.push(socketId);
      }
    });

    expiredSocketIds.forEach((socketId) => {
      this.rtcConnections[socketId].close();
      delete this.rtcConnections[socketId];
    });

    for (const user of users) {
      // Earlier Socket ID starts connection
      if (
        !this.rtcConnections[user.socketId] &&
        this.socket.id < user.socketId
      ) {
        const connection = await this.newConnection(user.socketId);

        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        this.socket.emit('offer', {
          offer,
          toSocketId: user.socketId,
        });
      }
    }
  }

  async responseOffer({ fromSocketId, offer }: RTCOfferMessageS2C) {
    if (this.rtcConnections[fromSocketId]) {
      throw new Error(`Duplicate webrtc offer from socketId ${fromSocketId}`);
    }

    const connection = await this.newConnection(fromSocketId);
    await connection.setRemoteDescription(offer as RTCSessionDescriptionInit);

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);

    this.socket.emit('answer', { toSocketId: fromSocketId, answer });
  }

  async handleAnswer({ fromSocketId, answer }: RTCAnswerMessageS2C) {
    if (!this.rtcConnections[fromSocketId]) {
      throw new Error(`Unexpected webrtc answer from socketId ${fromSocketId}`);
    }

    await this.rtcConnections[fromSocketId].setRemoteDescription(
      answer as RTCSessionDescriptionInit,
    );
  }

  async checkIceCandidate({
    fromSocketId,
    candidate,
  }: RTCICECandidateMesageS2C) {
    if (!this.rtcConnections[fromSocketId]) {
      throw new Error(
        `Unexpected ICE candidate exchange from socketId ${fromSocketId}`,
      );
    }

    await this.rtcConnections[fromSocketId].addIceCandidate(
      candidate as RTCIceCandidateInit,
    );
  }
}
