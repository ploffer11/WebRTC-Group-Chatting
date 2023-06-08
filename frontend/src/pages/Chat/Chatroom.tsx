import React, { useEffect, useMemo, useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import VideoChatIcon from '@mui/icons-material/VideoChat';
import VoiceChatIcon from '@mui/icons-material/VoiceChat';
import {
  AppBar,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Zoom,
  Button,
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import {
  IClientToServerEvents,
  IServerToClientEvents,
} from '../../../../schema/ws';
import MediaDeviceSelectDialog from '../../components/MediaDeviceSelectDialog.tsx';
import RTCChatSection from '../../components/RTCChatSection.tsx';
import UserAvatar from '../../components/UserAvatar.js';
import useTitle from '../../hooks/useTitle.js';
import useAuthStore from '../../store/auth.ts';
import useChatStore from '../../store/chat.js';
import useRTCStore from '../../store/rtc.ts';

type SocketType = Socket<IServerToClientEvents, IClientToServerEvents>;

const createSocket = () => {
  const { access_token } = useAuthStore.getState();

  const socket: SocketType = io(import.meta.env.VITE_API_URL, {
    extraHeaders: {
      authorization: `Bearer ${access_token}`,
    },
  });

  return socket;
};

const Chatroom = () => {
  useTitle('Chatroom');

  const navigate = useNavigate();

  const params = useParams();
  const roomId = useMemo(() => params['roomId'] ?? null, [params]);
  const chatStore = useChatStore();
  const chatStoreRef = useRef(chatStore);
  const rtcStore = useRTCStore();
  const rtcStoreRef = useRef(rtcStore);

  const [chatText, setChatText] = useState('');
  const [chatMenuAnchorEl, setChatMenuAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const [openDeviceSelectDialog, setOpenDeviceSelectDialog] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const chatStore = chatStoreRef.current;
    const rtcStore = rtcStoreRef.current;

    chatStore.enter(roomId);

    return () => {
      rtcStore.leave();
      chatStore.leave(roomId);
    };
  }, [roomId]);

  useEffect(() => {
    let socket = createSocket();
    const chatStore = chatStoreRef.current;
    const rtcStore = rtcStoreRef.current;
    function connect(reconnect?: boolean) {
      if (reconnect) {
        socket = createSocket();
      }
      chatStore.initialize(socket);
      rtcStore.initialize(socket);

      socket.on('disconnect', () => {
        // try reconnect
        // connect(true);
      });
    }

    connect();

    return () => {
      chatStore.cleanUp();
      rtcStore.cleanUp();

      socket.removeAllListeners();
      socket.close();
    };
  }, []);

  useEffect(() => {
    scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatStore.messages]);

  return (
    <React.Fragment>
      <AppBar position={'sticky'}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <IconButton
              color={'inherit'}
              onClick={() => {
                navigate(-1);
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant={'h6'} align={'center'}>
              {/* TODO: 채팅방 이름을 표시 */}
              Chatroom
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}></Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ maxWidth: '100%', maxHeight: '100%' }}>
        {rtcStore.enabled && <RTCChatSection />}
        <Stack alignItems={'stretch'} spacing={2}>
          <Stack sx={{ overflow: 'auto', mb: 8 }}>
            {chatStore.messages.map((message, idx) => (
              <Zoom in={true} key={idx}>
                <Paper elevation={1} sx={{ p: 1, m: 1 }}>
                  <Stack direction={'row'} spacing={1}>
                    <UserAvatar username={message.user.username} />
                    <Stack>
                      <Typography variant={'subtitle2'}>
                        {message.user.username}
                      </Typography>
                      <Typography sx={{ width: 1 }} variant={'body2'}>
                        {message.chatText}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Zoom>
            ))}
          </Stack>
          <Box sx={{ height: 16 }} />
        </Stack>

        <Box
          maxWidth={'sm'}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            margin: '0 auto',
            paddingX: 2,
            paddingBottom: 2,
          }}
        >
          <Paper elevation={5} sx={{ p: 1 }}>
            <Stack direction={'row'} spacing={1}>
              <IconButton
                size={'small'}
                onClick={(event) => {
                  setChatMenuAnchorEl(event.currentTarget);
                }}
              >
                <AddIcon />
              </IconButton>
              <Menu
                open={!!chatMenuAnchorEl}
                anchorEl={chatMenuAnchorEl}
                onClose={() => {
                  setChatMenuAnchorEl(null);
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                <MenuItem
                  onClick={() => {
                    rtcStore.setChatMode('audio');
                    setOpenDeviceSelectDialog(true);
                  }}
                  disabled={rtcStore.enabled}
                >
                  <ListItemIcon>
                    <VoiceChatIcon />
                  </ListItemIcon>
                  <ListItemText primary={'음성 채팅 참여하기'} />
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    rtcStore.setChatMode('video');
                    setOpenDeviceSelectDialog(true);
                  }}
                  disabled={rtcStore.enabled}
                >
                  <ListItemIcon>
                    <VideoChatIcon />
                  </ListItemIcon>
                  <ListItemText primary={'화상 채팅 참여하기'} />
                </MenuItem>
              </Menu>
              <Stack
                component={'form'}
                direction={'row'}
                alignItems={'flex-end'}
                sx={{ flex: 1 }}
                spacing={1}
                id={'chat-input'}
                onSubmit={(e) => {
                  e.preventDefault();

                  if (chatText !== '') {
                    chatStore.chat(chatText);
                    setChatText('');
                  }

                  return false;
                }}
              >
                <TextField
                  sx={{ flex: 1 }}
                  size={'medium'}
                  fullWidth={true}
                  variant="standard"
                  placeholder="여기에 메시지를 입력해보세요!"
                  autoComplete="off"
                  value={chatText}
                  onInput={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                    setChatText(target.value ?? '')
                  }
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  form={'chat-input'}
                  type={'submit'}
                >
                  전송
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Container>
      <MediaDeviceSelectDialog
        open={openDeviceSelectDialog}
        onCancel={() => {
          setOpenDeviceSelectDialog(false);
          setChatMenuAnchorEl(null);
        }}
        onConfirm={(stream) => {
          setOpenDeviceSelectDialog(false);
          setChatMenuAnchorEl(null);

          if (rtcStore.socket !== null) {
            rtcStore.registerMediaStream(stream);
            rtcStore.startCall();
          }
        }}
      />
    </React.Fragment>
  );
};

export default Chatroom;
