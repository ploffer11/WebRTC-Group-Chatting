import { useEffect, useMemo, useRef } from 'react';

import MicIcon from '@mui/icons-material/Mic';
import { Box, Chip } from '@mui/material';

import UserAvatar from './UserAvatar.tsx';
import useRTCStore from '../store/rtc.ts';

interface RTCVideoProps {
  stream: MediaStream | null;
  userName: string;
  mute?: boolean;
}

const RTCVideo = (props: RTCVideoProps) => {
  const rtcStore = useRTCStore();
  const { userName, stream, mute } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const mode = rtcStore.chatMode;

  const isAudioOnly = useMemo(() => {
    return (
      mode === 'audio' ||
      (stream?.getTracks() ?? []).every((track) => track.kind === 'audio')
    );
  }, [mode, stream]);

  useEffect(() => {
    if (!videoRef.current || !stream) {
      return;
    }

    videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.volume = mute ? 0 : 1;
  }, [mute]);

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: `${16 / 9}`,
        position: 'relative',
      }}
    >
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onLoadedMetadata={(event) => {
          (event.currentTarget as HTMLVideoElement).play();
        }}
      />

      {isAudioOnly && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 1,
            backgroundColor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MicIcon sx={{ color: 'white' }} fontSize={'large'} />
        </Box>
      )}

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          m: 0.5,
          opacity: 0.4,
        }}
      >
        <Chip
          avatar={<UserAvatar username={userName} />}
          label={userName}
          variant={'filled'}
          color={'primary'}
          size={'small'}
        ></Chip>
      </Box>
    </Box>
  );
};

export type { RTCVideoProps };

export default RTCVideo;
