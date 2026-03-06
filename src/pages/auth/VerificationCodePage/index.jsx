import React from 'react';
import VerificationCodeForm from '../../../components/VerificationCodeForm';
import Loader from '../../../common/Loader';

const VerificationCodePage = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <>
      {isLoading && <Loader />}
      <VerificationCodeForm setIsLoading={setIsLoading} />
    </>
  );
};

export default VerificationCodePage;
