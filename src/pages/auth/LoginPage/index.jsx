import LoginForm from '../../../components/LoginForm';
import { useState } from 'react';
import Loader from '../../../common/Loader';

export default () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Loader isLoading={isLoading} />
      <LoginForm setIsLoading={setIsLoading} />
    </>
  );
};
