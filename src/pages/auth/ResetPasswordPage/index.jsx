import React from 'react';
import ResetPasswordForm from '../../../components/ResetPasswordForm';
import Loader from '../../../common/Loader';

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <>
      {isLoading && <Loader />}
      <ResetPasswordForm setIsLoading={setIsLoading} />
    </>
  );
};

export default ResetPasswordPage;
