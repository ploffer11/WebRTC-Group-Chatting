import { Avatar, AvatarProps, Tooltip } from '@mui/material';

function userColor(username: string) {
  let hash = 0;
  const MOD = 1 << 24;
  for (const ch of username) {
    hash = (hash * 3 + ch.charCodeAt(0)) % MOD;
  }

  return `#${hash.toString(16).padStart(6, '0')}`;
}

interface UserAvatarProps extends AvatarProps {
  username: string;
}

const UserAvatar = (props: UserAvatarProps) => {
  const { username, ...otherProps } = props;

  return (
    <Tooltip title={username}>
      <Avatar sx={{ bgcolor: userColor(username) }} {...otherProps}>
        {username.slice(0, 1)}
      </Avatar>
    </Tooltip>
  );
};

export default UserAvatar;
