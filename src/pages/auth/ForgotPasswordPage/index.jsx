import ForgotPasswordForm from '../../../components/ForgotPasswordForm';
import { useState } from 'react';
import Loader from '../../../common/Loader';

export default () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Loader isLoading={isLoading} />
      <ForgotPasswordForm setIsLoading={setIsLoading} />
    </>
  );
};
