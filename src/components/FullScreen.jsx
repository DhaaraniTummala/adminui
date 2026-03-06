import React, { useState } from 'react';
import { BsAspectRatioFill } from 'react-icons/bs';
import './component.css';

const FullScreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      // Firefox
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      // IE/Edge
      document.documentElement.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
  };

  return (
    <div className="text-center mt-1 mr-2 ml-4">
      <div className="relative inline-block group w-9 h-9">
        <button onClick={toggleFullscreen} className=" focus:outline-none">
          <img
            src="fullScreen.png"
            alt=""
            className="p-2 dark:rounded-full rounded-full hover:bg-gray-100 dark:bg-gray-400  w-9 dark:w-8"
          />
        </button>
        <div className=" fullScreenPopup mt-1 absolute left-1/2 transform -translate-x-1/2 mb-2 w-max px-3 py-2  text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          <div className="arrow"></div>
        </div>
      </div>
    </div>
  );
};

export default FullScreen;
