import { FormEvent, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AcceptTermSelectBackend from '../common/AcceptTermSelectBackend';
import AcceptTermSelectFrontend from '../common/AcceptTermSelectFrontend';
import AcceptTermSelectRole from '../common/AcceptTermSelectRole';
import { ReduxHelper } from '../core/redux-helper';

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Checkbox,
  Button,
  Select,
  Option,
} from '@material-tailwind/react';

const AcceptTermForm = ({ setIsLoading }) => {
  const [acceptTermSelectBackend, setAcceptTermSelectBackend] = useState('');
  const [acceptTermSelectFrontend, setAcceptTermSelectFrontend] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  /*let createSuperAdmin_result = useSelector((state) => state?.createSuperAdmin);

  useEffect(() => {
    if (createSuperAdmin_result.data) {
      alert('Organization Created Succesfully');
      navigate("/dashboard");
    } else if (createSuperAdmin_result.error) {
      setIsLoading(false);
      alert(createSuperAdmin_result.error);
    }
  }, [createSuperAdmin_result]);*/

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectBackendHandler = (selectedValue) => {
    setAcceptTermSelectBackend(selectedValue);
  };

  const selectFrontendHandler = (selectedValue) => {
    setAcceptTermSelectFrontend(selectedValue);
  };

  const selectRoleHandler = (selectedValue) => {
    setSelectedRole(selectedValue);
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();

    var selectedData = {
      acceptBackend: acceptTermSelectBackend,
      acceptFrontend: acceptTermSelectFrontend,
      selectRole: selectedRole,
    };

    const jsonData = JSON.stringify(selectedData);

    setIsLoading(true);
    dispatch(
      ReduxHelper.Actions.createSuperAdmin({
        Organization: 'Demo1',
        Email: 'Test@Demo1.com',
        Password: '123456',
        BackendLanguge: 'sql',
        IsMobile: true,
      }),
    );
  };

  return (
    <Card className="px-4" color="transparent" shadow={false}>
      <form onSubmit={formSubmitHandler}>
        <CardBody className="flex flex-col gap-3 ">
          <AcceptTermSelectBackend
            crossOrigin={''}
            label="Hands on Backend Language"
            size="lg"
            color="blue"
            required
            value={acceptTermSelectBackend}
            onChange={selectBackendHandler}
          />
          <AcceptTermSelectFrontend
            crossOrigin={''}
            label="Hands on Frontend Language"
            size="lg"
            color="blue"
            required
            value={acceptTermSelectFrontend}
            onChange={selectFrontendHandler}
          />
          <AcceptTermSelectRole
            crossOrigin={''}
            label="Whats Your Role"
            size="lg"
            color="blue"
            required
            value={selectedRole}
            onChange={selectRoleHandler}
          />

          <div className=" flex justify-between ">
            <Checkbox
              variant="paragraph"
              label="Accept to terms & condition"
              className="text-sm"
              color="blue"
            />
          </div>
        </CardBody>

        <CardFooter className="pt-0 flex">
          <Button
            className=" bg-[#056EE9] font-poppins  "
            type="submit"
            shadow={false}
            fullWidth
            disabled={false}
          >
            Create Account
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AcceptTermForm;
