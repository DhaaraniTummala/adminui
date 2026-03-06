import { Typography } from '@material-tailwind/react';
import { useState } from 'react';
import Loader from '../../common/Loader';

export const welcomePage = (RenderComponent, Footer) => {
  const [isLoading, setIsLoading] = useState(false);

  let text = '';
  if (RenderComponent.name == 'LoginForm') {
    text += 'Welcome Back ';
  } else if (RenderComponent.name == 'SignupForm') {
    text += 'Create Account. ';
  } else if (RenderComponent.name == 'AcceptTermForm') {
    text += 'Help us to personalize your experience. ';
  }

  return (
    <>
      <Loader isLoading={isLoading} />
      <div className="flex flex-col h-screen">
        <main className="h-screen flex-grow flex flex-col laptop:overflow-hidden mobile:overflow-x-hidden">
          <div className="lg:flex h-full" style={{ height: '100vh' }}>
            <div className="lg:w-1/2 h-full sm:block">
              <div className="w-full h-full bg-white shadow-lg overflow-hidden">
                <div className="flex justify-center items-center bg-gradient-to-r from-[#00CED1] to-[#056EE9] h-screen p-4">
                  <div className="text-center md:text-left m-4">
                    <Typography
                      variant="h5"
                      color="white"
                      className="font-poppins text-lg sm:text-xl md:text-2xl lg:text-3xl"
                    >
                      MaidenCube
                    </Typography>
                    <Typography
                      variant="h1"
                      color="white"
                      className="mt-4 font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                    >
                      Your gateway
                    </Typography>
                    <Typography
                      variant="h1"
                      color="white"
                      className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                    >
                      to progress.
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="second-partition lg:w-1/2 laptop:mt-[-10px] mobile:mt-2 p-6 flex flex-col justify-between">
              <main className="flex-grow w-full flex flex-col bg-sky-300 justify-center items-center">
                <div className="laptop:text-start laptopM:-mr-[-110px] laptop:mt-0 mobile:text-center">
                  <Typography
                    style={{ color: '#056EE9', fontSize: '40px' }}
                    className="font-poppinss font-black mb-[-20px] mobileM:items-center laptopM:text-start laptop:text-[20px] mobile:text-2xl"
                  >
                    MaidenCube
                  </Typography>
                  <br />
                  <Typography
                    variant="h5"
                    style={{ color: 'black', fontSize: '24px' }}
                    className="font-poppinss mobileM:text-center laptopM:text-start laptop:mt-8 mobile:mt-6 mobile:text-sm"
                  >
                    {text}
                  </Typography>
                  <Typography
                    style={{ color: 'black' }}
                    className="mt-2 laptop:text-xs mobile:text-[14px] font-poppins"
                  >
                    It is a long established fact that a reader will be distracted by the <br />{' '}
                    readable content of a page when looking at its layout.
                  </Typography>
                </div>
                <div className="w-full mx-auto flex justify-center items-center">
                  <RenderComponent setIsLoading={setIsLoading} />
                </div>
              </main>
              <Footer />
            </div> */}
            <div className="second-partition lg:w-1/2 p-6 flex flex-col justify-between mobile:mt-2 laptop:mt-[-10px] overflow-y-auto">
              <main className="flex-grow w-full flex flex-col bg-sky-300 justify-center items-center p-4">
                <div className="text-center laptop:text-start laptopM:-mr-[-110px] laptop:mt-0 mobile:mt-4">
                  <Typography
                    style={{ color: '#056EE9' }}
                    className="font-poppinss font-black mb-[-20px] text-4xl laptop:text-3xl mobile:text-4xl"
                  >
                    MaidenCube
                  </Typography>
                  <br />
                  <Typography
                    variant="h5"
                    style={{ color: 'black' }}
                    className="font-poppinss mt-6 text-base laptop:mt-8 laptop:text-xl mobile:text-lg"
                  >
                    {text}
                  </Typography>
                  <Typography
                    style={{ color: 'black' }}
                    className="mt-2 font-poppins text-sm laptop:text-xs mobile:text-sm text-center laptop:text-left"
                  >
                    It is a long established fact that a reader will be distracted by the <br />
                    readable content of a page when looking at its layout.
                  </Typography>
                </div>
                <div className="w-full mx-auto flex justify-center items-center mt-4">
                  <RenderComponent setIsLoading={setIsLoading} />
                </div>
              </main>
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
