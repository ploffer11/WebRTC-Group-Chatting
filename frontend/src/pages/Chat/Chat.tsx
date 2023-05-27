import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Fade,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import UserAvatar from '../../components/UserAvatar.tsx';
import { useChatroom, useCreateChatRoom } from '../../hooks/useChatrooms.ts';
import useTitle from '../../hooks/useTitle.ts';

const Chat = () => {
  useTitle('Chatrooms');

  const navigate = useNavigate();
  const room = useChatroom();
  const createRoom = useCreateChatRoom();

  return (
    <Container maxWidth="sm">
      <Stack sx={{ mt: 16 }} alignItems={'stretch'} spacing={2}>
        <Typography align={'center'} variant={'h1'}>
          Chatrooms
        </Typography>
        <Typography align={'center'} variant={'h2'}>
          Join our chatrooms
        </Typography>
        <Button
          sx={{ mx: 'auto' }}
          onClick={() =>
            createRoom.mutate({
              roomName: `New Room`,
              maxUserCount: 6,
              isTextOnly: false,
            })
          }
        >
          Or create a new one?
        </Button>
        <Grid container spacing={2}>
          {room?.data?.map((chatroom) => (
            <Grid item key={chatroom.roomId} xs={6}>
              <Fade in={true}>
                <Card>
                  <CardHeader
                    title={
                      <Typography variant={'h5'}>
                        {chatroom.roomName}
                      </Typography>
                    }
                    subheader={
                      <Chip
                        label={chatroom.isTextOnly ? 'textOnly' : 'videoChat'}
                        color={'primary'}
                        size={'small'}
                      />
                    }
                  />
                  <CardContent>
                    <Stack direction={'row'} alignItems={'center'} spacing={1}>
                      <UserAvatar username={chatroom.hostUser.username} />
                      {chatroom.currentUserCount > 1 && (
                        <Avatar>+{chatroom.currentUserCount - 1}</Avatar>
                      )}
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      size={'small'}
                      onClick={() => navigate(`./${chatroom.roomId}`)}
                    >
                      JOIN
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
};

export default Chat;
