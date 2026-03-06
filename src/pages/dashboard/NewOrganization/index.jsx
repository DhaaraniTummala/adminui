import { useState } from 'react';
import Modal from './Modal';
import Layout from '../../../common/Layout';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="mobile:overflow-hidden">
      <Layout>
        <div className="flex flex-col items-center mt-6 h-[90vh] ">
          <div className="laptop:mt-11 w-[100%] mobile:mt-20 ">
            <h1 className="font-bold lg:text-left text-center  mt-4 lg:mt-0 lg:ml-4 md:mt-12 xl:mt-8 font-poppins">
              Organization
            </h1>
          </div>
          <div className="text-center mt-8 shadow-sm rounded-lg border p-6 mx-4 sm:w-3/4 md:w-2/3">
            <div>
              <p className="mt-4 mobile:text-[12px] laptop:text-sm  laptop:text-center mobile:text-justify font-poppins">
                It seems like you haven't created an organization yet. Organizations are essential
                for managing your data, projects, and team collaboration efficiently. By creating an
                organization, you'll unlock a range of features and benefits
              </p>
              <button
                className="bg-[#056EE9] text-white py-1.5 px-4 rounded text-sm font-poppins"
                style={{ marginTop: '40px' }}
                onClick={toggleModal}
              >
                Create Organization
              </button>
            </div>
          </div>
        </div>

        <Modal open={isModalOpen} onClose={toggleModal} title="Create Organization"></Modal>
      </Layout>
    </div>
  );
};

export default Index;
