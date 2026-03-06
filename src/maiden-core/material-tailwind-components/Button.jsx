import { Button } from '@material-tailwind/react';

export function ButtonVariants(props) {
  return (
    <>
      <h1 style={{ marginTop: '30px' }}>{props.label}</h1>
      <br />
      <div className="flex w-max gap-4">
        <Button variant="filled">filled</Button>
        <Button variant="gradient">gradient</Button>
        <Button variant="outlined">outlined</Button>
        <Button variant="text">text</Button>
      </div>
    </>
  );
}

export function ButtonColors(props) {
  return (
    <>
      <h1 style={{ marginTop: '30px' }}>{props.label}</h1>
      <br />
      <div className="flex w-max gap-4">
        <Button color="blue">color blue</Button>
        <Button color="red">color red</Button>
        <Button color="green">color green</Button>
        <Button color="amber">color amber</Button>
      </div>
    </>
  );
}
