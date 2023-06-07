import { MutableRefObject, useEffect, useMemo, useRef } from 'react';

import { Stack } from '@mui/material';

import useRTCStore from '../store/rtc';

const RTCVideo = () => {
  const rtcStore = useRTCStore();

  const streams = useMemo(() => rtcStore.streams ?? {}, [rtcStore.streams]);
  const streamKeys = Object.keys(rtcStore.streams);

  const videoRefs: MutableRefObject<HTMLVideoElement | null>[] = [];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  for (let i = 0; i < 6; i++) videoRefs.push(useRef<HTMLVideoElement>(null));

  useEffect(() => {
    streamKeys.forEach((key, idx) => {
      const video = videoRefs[idx].current;
      if (video && video.srcObject !== streams[key]) {
        video.srcObject = streams[key];
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamKeys]);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const myMediaStream = rtcStore.mediaStream;

  useEffect(() => {
    if (myMediaStream !== null && myVideoRef.current) {
      myVideoRef.current.volume = 0; // 하울링 방지
      myVideoRef.current.srcObject = myMediaStream;
    }
  }, [myMediaStream]);

  return (
    <Stack direction={'row'} mt={8}>
      {myMediaStream !== null && (
        <video
          style={{ width: '200px', aspectRatio: 16 / 9 }}
          ref={myVideoRef}
          onLoadedMetadata={({ target }) => {
            (target as HTMLVideoElement).play();
          }}
        />
      )}

      {Object.entries(streams).map((_, idx) => (
        <video
          style={{ width: '200px', aspectRatio: 16 / 9 }}
          key={idx}
          ref={videoRefs[idx]}
          onLoadedMetadata={({ target }) => {
            (target as HTMLVideoElement).play();
          }}
        />
      ))}
    </Stack>
  );
};
export default RTCVideo;
