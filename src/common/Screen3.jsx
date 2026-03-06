import { PencilIcon } from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Input,
} from '@material-tailwind/react';

const TABLE_HEAD = ['Transaction', 'Amount', 'Date', 'Status', 'Account', ''];

const TABLE_ROWS = [
  {
    img: 'https://docs.material-tailwind.com/img/logos/logo-spotify.svg',
    name: 'Spotify',
    amount: '$2,500',
    date: 'Wed 3:00pm',
    status: 'paid',
    account: 'visa',
    accountNumber: '1234',
    expiry: '06/2026',
  },
  {
    img: 'https://docs.material-tailwind.com/img/logos/logo-amazon.svg',
    name: 'Amazon',
    amount: '$5,000',
    date: 'Wed 1:00pm',
    status: 'paid',
    account: 'master-card',
    accountNumber: '1234',
    expiry: '06/2026',
  },
  {
    img: 'https://docs.material-tailwind.com/img/logos/logo-pinterest.svg',
    name: 'Pinterest',
    amount: '$3,400',
    date: 'Mon 7:40pm',
    status: 'pending',
    account: 'master-card',
    accountNumber: '1234',
    expiry: '06/2026',
  },
  {
    img: 'https://docs.material-tailwind.com/img/logos/logo-google.svg',
    name: 'Google',
    amount: '$1,000',
    date: 'Wed 5:00pm',
    status: 'paid',
    account: 'visa',
    accountNumber: '1234',
    expiry: '06/2026',
  },
  {
    img: 'https://docs.material-tailwind.com/img/logos/logo-netflix.svg',
    name: 'netflix',
    amount: '$14,000',
    date: 'Wed 3:30am',
    status: 'cancelled',
    account: 'visa',
    accountNumber: '1234',
    expiry: '06/2026',
  },
];

export default function Screen3() {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-60 bg-gray-100 p-5">
        <div className="mb-8">
          <h2 className="text-lg font-semibold" style={{ color: '#5c8ed5', fontSize: '18px' }}>
            MaidenCube
          </h2>
          <nav className="mt-2">
            <a className="flex items-center space-x-2 py-1 text-gray-700" href="#">
              <LayoutDashboardIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>Dashboard</span>
            </a>
            <a
              className="flex items-center space-x-2 py-1 text-gray-700 bg-gray-200 rounded"
              href="#"
            >
              <LayoutDashboardIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>Projects</span>
            </a>
            <a className="flex items-center space-x-2 py-1 text-gray-700" href="#">
              <LayoutDashboardIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>Profile</span>
            </a>
            <a className="flex items-center space-x-2 py-1 text-gray-700" href="#">
              <LayoutDashboardIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>Reports</span>
            </a>
          </nav>
        </div>
        <div>
          <br />
          <h3 className="text-sm font-semibold ">Masters</h3>
          <nav className="mt-2">
            <a className="flex items-center space-x-2 py-1 text-gray-700" href="#">
              <ViewIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>User Management</span>
            </a>
            <a className="flex items-center space-x-2 py-1 text-gray-700" href="#">
              <ViewIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>Designations</span>
            </a>
            <a className="flex items-center space-x-2 py-1 text-gray-700" href="#">
              <ViewIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>Roles</span>
            </a>
            <a className="flex items-center space-x-2 py-1 text-gray-700" href="#">
              <ViewIcon className="h-4 w-4" />
              <span style={{ marginLeft: '10px' }}>Access Control</span>
            </a>
          </nav>
        </div>
      </aside>
      <div className="flex-1 px-10 py-8">
        <div className="mt-8">
          <div className="mt-4 flex space-x-4"></div>
          <Card className="h-full w-full" style={{ margin: '0px !important' }}>
            <CardHeader floated={false} shadow={false} className="rounded-none">
              <div className="flex justify-between">
                <p className="text-lg font-semibold">Project</p>
                <div className="flex items-center space-x-7">
                  <BellIcon className="h-6 w-6 text-gray-600" />
                  <span style={{ marginLeft: '10px' }}></span>
                  <UserCircleIcon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <br />
              <hr />
              <br />
              <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold">Project 01</h2>
                  <Button className="bg-blue-500 text-white">+ Add Module</Button>
                </div>

                <div className="flex justify-between">
                  <div className=" md:w-72">
                    <Input label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody className="overflow-scroll px-0">
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_ROWS.map(
                    (
                      { img, name, amount, date, status, account, accountNumber, expiry },
                      index,
                    ) => {
                      const isLast = index === TABLE_ROWS.length - 1;
                      const classes = isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50';

                      return (
                        <tr key={name}>
                          <td className={classes}>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={img}
                                alt={name}
                                size="md"
                                className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                              />
                              <Typography variant="small" color="blue-gray" className="font-bold">
                                {name}
                              </Typography>
                            </div>
                          </td>
                          <td className={classes}>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {amount}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              {date}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <div className="w-max">
                              <Chip
                                size="sm"
                                variant="ghost"
                                value={status}
                                color={
                                  status === 'paid'
                                    ? 'green'
                                    : status === 'pending'
                                      ? 'amber'
                                      : 'red'
                                }
                              />
                            </div>
                          </td>
                          <td className={classes}>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-12 rounded-md border border-blue-gray-50 p-1">
                                <Avatar
                                  src={
                                    account === 'visa'
                                      ? 'https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/visa.png'
                                      : 'https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/mastercard.png'
                                  }
                                  size="sm"
                                  alt={account}
                                  variant="square"
                                  className="h-full w-full object-contain p-1"
                                />
                              </div>
                              <div className="flex flex-col">
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal capitalize"
                                >
                                  {account.split('-').join(' ')} {accountNumber}
                                </Typography>
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal opacity-70"
                                >
                                  {expiry}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={classes}>
                            <Tooltip content="Edit User">
                              <IconButton variant="text">
                                <PencilIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </CardBody>
            <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
              <Button variant="outlined" size="sm">
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <IconButton variant="outlined" size="sm">
                  1
                </IconButton>
                <IconButton variant="text" size="sm">
                  2
                </IconButton>
                <IconButton variant="text" size="sm">
                  3
                </IconButton>
                <IconButton variant="text" size="sm">
                  ...
                </IconButton>
                <IconButton variant="text" size="sm">
                  8
                </IconButton>
                <IconButton variant="text" size="sm">
                  9
                </IconButton>
                <IconButton variant="text" size="sm">
                  10
                </IconButton>
              </div>
              <Button variant="outlined" size="sm">
                Next
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LayoutDashboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function ViewIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z" />
      <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
      <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function UserCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}
