import { useEffect, useMemo, useRef, useState } from 'react';

import ChatIcon from '@mui/icons-material/Chat';
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
} from '@mui/material';
import { useParams } from 'react-router-dom';

import RTCVideo from '../../components/RTCVideo.js';
import UserAvatar from '../../components/UserAvatar.js';
import useTitle from '../../hooks/useTitle.js';
import useChatStore from '../../store/chat.js';

const Chatroom = () => {
  useTitle('Chatroom');

  const params = useParams();
  const roomId = useMemo(() => params['roomId'] ?? null, [params]);
  const roomStore = useChatStore();
  const storeRef = useRef(() => roomStore);

  const [chatText, setChatText] = useState('');

  useEffect(() => {
    if (!roomStore.socket) roomStore.connect();
  }, [roomStore]);

  useEffect(() => {
    if (!roomId) return;

    storeRef.current().enter(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => storeRef.current().leave(roomId);
  }, [roomId]);

  useEffect(() => {
    scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [roomStore.messages]);

  return (
    <Container maxWidth="sm" sx={{ maxHeight: '100%' }}>
      <AppBar>
        <Toolbar>
          <IconButton color="inherit">
            <ChatIcon />
          </IconButton>
          <Typography align={'center'} variant={'h6'}>
            Chatroom
          </Typography>
        </Toolbar>
      </AppBar>
      <RTCVideo />
      <Stack sx={{ mt: 12 }} alignItems={'stretch'} spacing={2}>
        <Stack sx={{ overflow: 'auto', mb: 8 }}>
          {roomStore.messages.map((message, idx) => (
            <Zoom in={true} key={idx}>
              <Paper elevation={1} sx={{ p: 1, m: 1 }}>
                <Stack direction={'row'} spacing={1}>
                  <UserAvatar username={message.user.username} />
                  <Typography sx={{ width: 1 }}>{message.chatText}</Typography>
                </Stack>
              </Paper>
            </Zoom>
          ))}
        </Stack>
        <Container sx={{ height: 16 }} />
      </Stack>
      <Container
        maxWidth="sm"
        sx={{
          position: 'fixed',
          bottom: 32,
          left: 0,
          right: 0,
        }}
      >
        <Paper elevation={5} sx={{ p: 1 }}>
          <form
            onSubmit={(e) => {
              roomStore.chat(chatText);
              setChatText('');
              e.preventDefault();
              return false;
            }}
          >
            <TextField
              fullWidth={true}
              variant="standard"
              placeholder="Chat here"
              autoComplete="off"
              value={chatText}
              onInput={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                setChatText(target.value ?? '')
              }
            />
          </form>
        </Paper>
      </Container>
    </Container>
  );
};

export default Chatroom;
