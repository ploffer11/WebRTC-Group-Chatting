import { useEffect, useMemo, useRef, useState } from 'react';

import { Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

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

    const roomSocket = storeRef.current().socket;
    roomSocket?.emit('enter', { roomId });

    return () => void roomSocket?.emit('leave', { roomId });
  }, [roomId]);

  return (
    <Container maxWidth="sm">
      <Stack sx={{ mt: 16 }} alignItems={'stretch'} spacing={2}>
        <Typography align={'center'} variant={'h1'}>
          Chatroom
        </Typography>
        <Stack spacing={2}>
          {roomStore.messages.map((message, idx) => (
            <Paper sx={{ p: 1 }} key={idx}>
              <Stack direction={'row'} spacing={1}>
                <UserAvatar username={message.user.username} />
                <Typography sx={{ width: 1 }}>{message.chatText}</Typography>
              </Stack>
            </Paper>
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
