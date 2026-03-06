import { Input } from '@material-tailwind/react';

export function InputVariants(props) {
  return (
    <div>
      <div className="flex w-72 flex-col gap-6 " style={{ marginTop: '30px' }}>
        <h1>{props.label}</h1>
        <Input variant="static" label="Static" placeholder="Static" />
        <Input variant="standard" label="Standard" placeholder="Standard" />
        <Input variant="outlined" label="Outlined" placeholder="Outlined" />
      </div>
    </div>
  );
}

export function InputSizes(props) {
  return (
    <div>
      <div className="flex w-72 flex-col items-end gap-6" style={{ marginTop: '30px' }}>
        <h1>{props.label}</h1>
        <Input size="md" label="Input Medium" />
        <Input size="lg" label="Input Large" />
      </div>
    </div>
  );
}

export function InputColors(props) {
  return (
    <div>
      <div className="flex w-72 flex-col gap-6" style={{ marginTop: '30px' }}>
        <h1>{props.label}</h1>
        <Input color="blue" label="Input Blue" />
        <Input color="purple" label="Input Purple" />
        <Input color="indigo" label="Input Indigo" />
        <Input color="teal" label="Input Teal" />
      </div>
    </div>
  );
}
