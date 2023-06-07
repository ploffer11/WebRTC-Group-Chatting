import { useCallback, useEffect, useRef, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  IconButton,
} from '@mui/material';

interface MediaDeviceSelectDialogProps {
  open: boolean;
  mode: 'audio' | 'video';
  onCancel: () => void;
  onConfirm: (stream: MediaStream) => void;
}

async function getInitialUserMediaAndDevices(mode: 'audio' | 'video') {
  const constraints =
    mode === 'audio'
      ? { audio: true, video: false }
      : {
          audio: true,
          video: { facingMode: 'user', width: 1280, height: 720 },
        };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const devices = await navigator.mediaDevices.enumerateDevices();

  return { stream, devices };
}
const MediaDeviceSelectDialog = (props: MediaDeviceSelectDialogProps) => {
  const { open, mode, onCancel, onConfirm } = props;

  const modeRef = useRef(mode);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [audioInputDevice, setAudioInputDevice] = useState('auto');
  const [videoInputDevice, setVideoInputDevice] = useState('auto');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const mode = modeRef.current;

    setAudioInputDevices([]);
    setVideoInputDevices([]);
    setAudioInputDevice('auto');
    setVideoInputDevice('auto');
    setMediaStream(null);

    getInitialUserMediaAndDevices(mode).then(({ stream, devices }) => {
      const audioInputDevices = devices.filter(
        (device) => device.kind === 'audioinput',
      );
      const videoInputDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );

      setAudioInputDevices(audioInputDevices);
      setVideoInputDevices(videoInputDevices);
      setMediaStream(stream);

      if (videoRef.current) {
        const video = videoRef.current;
        video.volume = 0; // 하울링 방지
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
      }
    });

    return;
  }, [open]);

  const updateStream = useCallback(
    async ({
      audio: newAudioDeviceId,
      video: newVideoDeviceId,
    }: {
      audio?: string;
      video?: string;
    }) => {
      const mode = modeRef.current;

      const audioDevice = newAudioDeviceId ?? audioInputDevice;
      const videoDevice = newVideoDeviceId ?? videoInputDevice;

      const audioConstraints =
        audioDevice === 'auto'
          ? { audio: true }
          : { audio: { deviceId: audioDevice } };

      const videoConstraints =
        mode !== 'video'
          ? { video: false }
          : videoDevice === 'auto'
          ? { video: { facingMode: 'user', width: 1280, height: 720 } }
          : { video: { deviceId: videoDevice, width: 1280, height: 720 } };

      const constraints = Object.assign({}, audioConstraints, videoConstraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setMediaStream(stream);

      if (videoRef.current) {
        const video = videoRef.current;
        video.volume = 0; // 하울링 방지
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
      }
    },
    [audioInputDevice, videoInputDevice],
  );

  return (
    <Dialog open={open} onClose={onCancel} maxWidth={'sm'} fullWidth={true}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        기기 선택
        <IconButton onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* TODO: mode가 audio인 경우, video 대신 audio meter를 사용해보기
        https://webrtc.github.io/samples/src/content/getusermedia/volume/
         */}
        <Box
          sx={{
            width: 1,
            aspectRatio: `${16 / 9}`,
            display: mode === 'video' ? 'block' : 'none',
          }}
        >
          <video ref={videoRef} style={{ width: '100%', height: '100%' }} />
        </Box>

        <DialogContentText>
          {mode === 'video' && '카메라 /'} 마이크 권한 요청이 발생하는 경우,
          권한을 허용해 주세요.
        </DialogContentText>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {mode === 'video' && (
            <FormControl>
              <InputLabel id={'video-input-device-select-label'}>
                카메라
              </InputLabel>
              <Select
                labelId={'video-input-device-select-label'}
                id={'video-input-device-select'}
                label={'카메라'}
                value={videoInputDevice}
                onChange={(event) => {
                  setVideoInputDevice(event.target.value);
                  updateStream({ video: event.target.value });
                }}
              >
                <MenuItem value={'auto'}>자동 선택</MenuItem>
                {videoInputDevices.map((device) => {
                  return (
                    <MenuItem value={device.deviceId}>{device.label}</MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
          <FormControl>
            <InputLabel id={'audio-input-device-select-label'}>
              마이크
            </InputLabel>
            <Select
              labelId={'audio-input-device-select-label'}
              id={'audio-input-device-select'}
              label={'마이크'}
              value={audioInputDevice}
              onChange={(event) => {
                setAudioInputDevice(event.target.value);
                updateStream({ audio: event.target.value });
              }}
            >
              <MenuItem value={'auto'}>자동 선택</MenuItem>
              {audioInputDevices.map((device) => {
                return (
                  <MenuItem value={device.deviceId}>{device.label}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>취소</Button>
        <Button
          disabled={mediaStream === null}
          onClick={() => {
            if (mediaStream !== null) {
              onConfirm(mediaStream);
            }
          }}
        >
          입장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export type { MediaDeviceSelectDialogProps };
export default MediaDeviceSelectDialog;
