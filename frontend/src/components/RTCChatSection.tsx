import { useMemo } from 'react';

import CallEnd from '@mui/icons-material/CallEnd';
import { Box, Button, Grid, Paper } from '@mui/material';

import RTCVideo from './RTCVideo.tsx';
import useRTCStore from '../store/rtc';

const usingThird = new Set([3, 5, 6]);

const RTCChatSection = () => {
  const rtcStore = useRTCStore();
  const streams = useMemo(() => rtcStore.streams ?? {}, [rtcStore.streams]);

  const userCount = Object.keys(streams).length + 1;

  return (
    <Paper
      sx={{ mt: 1, py: 1, position: 'sticky', top: 64, zIndex: 5 }}
      elevation={5}
    >
      <Grid container spacing={1} justifyContent={'center'}>
        <Grid item xs={usingThird.has(userCount) ? 4 : 6}>
          <RTCVideo
            userName={
              rtcStore.socket
                ? rtcStore.userNames[rtcStore.socket.id] ?? ''
                : ''
            }
            stream={rtcStore.mediaStream}
            mute
          />
        </Grid>
        {Object.entries(streams).map(([socketId, stream]) => (
          <Grid item xs={userCount in usingThird ? 4 : 6}>
            <RTCVideo
              userName={rtcStore.userNames[socketId] ?? ''}
              stream={stream}
              key={socketId}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Button
          startIcon={<CallEnd />}
          color={'error'}
          variant={'contained'}
          size={'small'}
          onClick={() => {
            rtcStore.hangUpCall();
          }}
        >
          {rtcStore.chatMode === 'audio' ? '음성 채팅 종료' : '화상 채팅 종료'}
        </Button>
      </Box>
    </Paper>
  );
};
export default RTCChatSection;
