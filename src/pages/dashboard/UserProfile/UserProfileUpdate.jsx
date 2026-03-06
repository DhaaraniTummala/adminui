import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { Card, CardBody, Input, Button } from '@material-tailwind/react';
import Webcam from 'react-webcam';
import './style.css';
import secureStorage from '../../../utils/secureStorage';

const UserProfileUpdate = (props) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(secureStorage.getItem('email'));
  const webcamRef = useRef(null);

  const handleSubmit = () => {};

  const handleGalleryUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakeSelfie = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setIsCameraOpen(false);
  };

  return (
    <>
      <Card className="max-w-md mx-auto my-10">
        <CardBody className="dark:bg-gray-900 dark:text-white dark:border dark:rounded ">
          <div className="mb-6">
            <label htmlFor="name" className="dark:text-white block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              class="appearance-none block w-full text-gray-400 border border-gray-400 rounded py-2 px-3 mb-3 leading-tight focus:outline-none bg-gray-100 dark:border dark:bg-gray-900 dark:focus:bg-gray-900"
              id=""
              type="text"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="dark:text-white block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              class="appearance-none block w-full text-gray-400 border border-gray-400 rounded py-2 px-3 mb-3 leading-tight focus:outline-none bg-gray-100 dark:bg-gray-900 dark:focus:bg-gray-900"
              id=""
              type="email"
              value={userProfile}
              disabled
            />
          </div>
          <div className="mb-6 ">
            <h2 className="dark:text-white text-gray-700 font-medium">Select an Image</h2>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleGalleryUpload}
                className="inputStyle w-full"
              />
            </div>
            <div>
              <button
                className="text-gray-700 font-medium buttonStyle"
                onClick={() => setIsCameraOpen(!isCameraOpen)}
              >
                {isCameraOpen ? 'Close Camera' : 'Open Camera'}
              </button>
            </div>
            {isCameraOpen && (
              <div>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ margin: '10px 0' }}
                />
                <button onClick={handleTakeSelfie} className="buttonStyle">
                  Take Selfie
                </button>
              </div>
            )}
            {imageSrc && (
              <div>
                <h3>Selected Image:</h3>
                <img src={imageSrc} alt="Selected" style={{ width: '300px' }} />
              </div>
            )}
          </div>
          <button className="saveButton" onClick={handleSubmit}>
            Save
          </button>
        </CardBody>
      </Card>
    </>
  );
};

export default Layout(UserProfileUpdate);
