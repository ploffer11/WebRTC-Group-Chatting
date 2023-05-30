import { useEffect, useMemo, useState } from 'react';

import {
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Zoom,
} from '@mui/material';
import { useParams } from 'react-router-dom';

import UserAvatar from '../../components/UserAvatar.js';
import useTitle from '../../hooks/useTitle.js';
import useChatStore from '../../store/chat.js';

const Chatroom = () => {
  useTitle('Chatroom');

  const params = useParams();
  const roomId = useMemo(() => params['roomId'] ?? null, [params]);
  const roomStore = useChatStore();

  const [chatText, setChatText] = useState('');

  useEffect(() => {
    if (!roomStore.socket) roomStore.connect();
  }, [roomStore]);

  useEffect(() => {
    if (!roomId) return;

    roomStore.enter(roomId);
  }, [roomStore, roomId]);

  useEffect(() => {
    scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [roomStore.messages]);

  return (
    <Container maxWidth="sm" sx={{ maxHeight: '100%' }}>
      <Stack sx={{ mt: 16 }} alignItems={'stretch'} spacing={2}>
        <Typography align={'center'} variant={'h1'}>
          Chatroom
        </Typography>
        <Stack sx={{ maxHeight: 'sm', overflow: 'auto', mb: 32 }}>
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
        <Paper
          elevation={5}
          sx={{
            p: 1,
            position: 'sticky',
            bottom: 32,
          }}
        >
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
              value={chatText}
              onInput={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                setChatText(target.value ?? '')
              }
            />
          </form>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Chatroom;
