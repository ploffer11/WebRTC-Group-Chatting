import { Avatar, Tooltip } from '@mui/material';

function userColor(username: string) {
  let hash = 0;
  const MOD = 1 << 24;
  for (const ch of username) {
    hash = (hash * 3 + ch.charCodeAt(0)) % MOD;
  }

  return `#${hash.toString(16).padStart(6, '0')}`;
}

const UserAvatar = ({ username }: { username: string }) => {
  return (
    <Tooltip title={username}>
      <Avatar sx={{ bgcolor: userColor(username) }}>
        {username.slice(0, 1)}
      </Avatar>
    </Tooltip>
  );
};

export default UserAvatar;
