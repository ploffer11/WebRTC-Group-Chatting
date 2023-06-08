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

import MediaDeviceSelectDialog from '../../components/MediaDeviceSelectDialog.tsx';
import RTCVideo from '../../components/RTCVideo.js';
import UserAvatar from '../../components/UserAvatar.js';
import useTitle from '../../hooks/useTitle.js';
import useChatStore from '../../store/chat.js';
import useRTCStore from '../../store/rtc.ts';

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
    if (!chatStore.socket) chatStore.connect();
  }, [chatStore]);

  useEffect(() => {
    if (chatStore.socket) {
      rtcStoreRef.current.initialize(chatStore.socket);

      return () => {
        rtcStoreRef.current.clear();
      };
    }
  }, [chatStore.socket]);

  useEffect(() => {
    if (!roomId) return;

    chatStoreRef.current.enter(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => chatStoreRef.current.leave(roomId);
  }, [roomId]);

  useEffect(() => {
    scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatStore.messages]);

  return (
    <React.Fragment>
      <AppBar>
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
      <Toolbar />
      <Container maxWidth="sm" sx={{ maxWidth: '100%' }}>
        {rtcStore.enabled && <RTCVideo />}
        <MediaDeviceSelectDialog
          open={openDeviceSelectDialog}
          mode={rtcChatMode}
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
    </React.Fragment>
  );
};

export default Chatroom;
