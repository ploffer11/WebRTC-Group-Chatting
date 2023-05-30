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

  return (
    <Container maxWidth="sm">
      <Stack sx={{ mt: 16 }} alignItems={'stretch'} spacing={2}>
        <Typography align={'center'} variant={'h1'}>
          Chatroom
        </Typography>
        <Stack spacing={2}>
          {roomStore.messages.map((message, idx) => (
            <Zoom in={true} key={idx}>
              <Paper sx={{ p: 1 }}>
                <Stack direction={'row'} spacing={1}>
                  <UserAvatar username={message.user.username} />
                  <Typography sx={{ width: 1 }}>{message.chatText}</Typography>
                </Stack>
              </Paper>
            </Zoom>
          ))}
        </Stack>
        <form
          onSubmit={(e) => {
            roomStore.chat(chatText);
            setChatText('');
            e.preventDefault();
            return false;
          }}
        >
          <TextField
            variant="standard"
            value={chatText}
            onInput={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              setChatText(target.value ?? '')
            }
          />
        </form>
      </Stack>
    </Container>
  );
};

export default Chatroom;
