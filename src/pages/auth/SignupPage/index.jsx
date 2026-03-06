import React from 'react';
import SignupForm from '../../../components/SignupForm';
import Loader from '../../../common/Loader';

const SignupPage = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <>
      {isLoading && <Loader />}
      <SignupForm setIsLoading={setIsLoading} />
    </>
  );
};

export default SignupPage;
