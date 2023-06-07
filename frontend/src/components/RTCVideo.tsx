import { MutableRefObject, useEffect, useMemo, useRef } from 'react';

import { Stack } from '@mui/material';

import useChatStore from '../store/chat';
import useRTCStore from '../store/rtc';

const RTCVideo = () => {
  const chatStore = useChatStore();
  const rtcStore = useRTCStore();
  const storeRef = useRef(() => rtcStore);

  useEffect(() => {
    if (chatStore.socket) storeRef.current().initialize(chatStore.socket);
  }, [chatStore.socket]);

  const streams = useMemo(() => rtcStore.streams ?? {}, [rtcStore.streams]);

  const videoRefs: MutableRefObject<HTMLVideoElement | null>[] = [];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  for (let i = 0; i < 6; i++) videoRefs.push(useRef<HTMLVideoElement>(null));

  const streamKeys = Object.keys(streams);

  useEffect(() => {
    streamKeys.forEach((key, idx) => {
      const video = videoRefs[idx].current;
      if (video && video.srcObject !== streams[key]) {
        console.log('set srcobject');
        video.srcObject = streams[key];
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamKeys]);

  return (
    <Stack direction={'row'} mt={8}>
      {Object.entries(streams || {}).map((_, idx) => (
        <video
          key={idx}
          ref={videoRefs[idx]}
          onLoadedMetadata={({ target }) => {
            console.log('metadata loaded');
            (target as HTMLVideoElement).play();
          }}
        />
      ))}
    </Stack>
  );
};
export default RTCVideo;
