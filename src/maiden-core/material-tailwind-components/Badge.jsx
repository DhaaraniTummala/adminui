import { Badge, Button, IconButton, Avatar } from '@material-tailwind/react';
import { HomeIcon } from '@heroicons/react/24/solid';

export function BadgeColors(props) {
  return (
    <>
      <h1 style={{ marginTop: '30px' }}>{props.label}</h1>
      <br />
      <div className="flex items-center gap-4">
        <Badge color="red">
          <Button>Red</Button>
        </Badge>
        <Badge color="green">
          <Button>Green</Button>
        </Badge>
        <Badge color="amber">
          <Button>Amber</Button>
        </Badge>
        <Badge color="purple">
          <Button>Purple</Button>
        </Badge>
      </div>
    </>
  );
}

export function BadgeOverlap(props) {
  return (
    <>
      <h1 style={{ marginTop: '30px' }}>{props.label}</h1>
      <br />
      <div className="flex items-center gap-8">
        <Badge content="5">
          <IconButton>
            <HomeIcon className="h-4 w-4" />
          </IconButton>
        </Badge>
        <Badge>
          <IconButton>
            <HomeIcon className="h-4 w-4" />
          </IconButton>
        </Badge>
        <Badge content="5" overlap="circular" placement="bottom-end">
          <Avatar
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
            alt="profile picture"
          />
        </Badge>
        <Badge overlap="circular" placement="bottom-end">
          <Avatar
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
            alt="profile picture"
          />
        </Badge>
      </div>
    </>
  );
}
