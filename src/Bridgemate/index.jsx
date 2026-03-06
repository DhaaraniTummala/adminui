import React, { useState, useEffect } from 'react';
import './index.css';
import clubs from './images/clubs.png';
import diamonds from './images/diamonds.png';
import hearts from './images/hearts.png';
import spades from './images/spades.png';
import secureStorage from '../utils/secureStorage';

const pointValues = {
  CLUB: 20,
  DIAMOND: 20,
  HEART: 30,
  SPADE: 30,
};
const basevalueNT = 40;

const ButtonLayout = () => {
  const [displayValues, setDisplayValues] = useState([]);
  const [result, setResult] = useState(''); // State to hold the result text
  const [activeButton, setActiveButton] = useState('green'); // State to hold the mode

  useEffect(() => {
    const savedDisplayValues = secureStorage.getItem('bridgemate_displayValues');
    const savedResult = secureStorage.getItem('bridgemate_result');
    const savedActiveButton = secureStorage.getItem('bridgemate_activeButton');

    if (savedDisplayValues) {
      setDisplayValues(JSON.parse(savedDisplayValues));
    }
    if (savedResult) {
      setResult(savedResult);
    }
    if (savedActiveButton) {
      setActiveButton(savedActiveButton);
    }
  }, []);

  useEffect(() => {
    secureStorage.setItem('bridgemate_displayValues', JSON.stringify(displayValues));
    secureStorage.setItem('bridgemate_result', result);
    secureStorage.setItem('bridgemate_activeButton', activeButton);
  }, [displayValues, result, activeButton]);

  const getValuesOnButtonClick = (newValue) => {
    if (displayValues.length === 2) {
      alert('You have already selected a number and a suit.');
      return;
    }
    if (displayValues.length === 0) {
      if (newValue >= '1' && newValue <= '7') {
        setDisplayValues([newValue]);
      } else {
        alert('Please enter a number between 1 and 7 first.');
      }
    } else if (displayValues.length === 1) {
      if (['CLUB', 'DIAMOND', 'HEART', 'SPADE', 'NT'].includes(newValue)) {
        setDisplayValues([...displayValues, newValue]);
      } else {
        alert('Please enter a valid suit.');
      }
    }
  };

  const handleCancelClick = () => {
    setDisplayValues([]);
    setResult(''); // Clear the result when cancel is clicked
  };

  const handleOkClick = () => {
    if (displayValues.length !== 2) {
      alert('Please enter a number and a suit.');
      return;
    }
    let totalPoints = 0;

    const number = parseInt(displayValues[0], 10);
    const suit = displayValues[1];

    if (!isNaN(number) && suit in pointValues) {
      totalPoints += number * pointValues[suit];
      if (number === 6) {
        totalPoints += 500;
      } else if (number === 7) {
        totalPoints += 1000;
      }
    } else if (suit === 'NT') {
      totalPoints += basevalueNT + (number - 1) * 30;
      if (number === 6) {
        totalPoints += 500;
      } else if (number === 7) {
        totalPoints += 1000;
      }
    }

    if (totalPoints >= 100) {
      totalPoints += 300;
    }

    // Modify points based on the active button state
    if (activeButton === 'red') {
      if (number >= 1 && number <= 5) {
        totalPoints += 250;
      } else if (number === 6) {
        totalPoints += 250;
      } else if (number === 7) {
        totalPoints += 500;
      }
    }

    setResult(`${totalPoints} points`);
  };

  const handleToggleClick = (button) => {
    setActiveButton(button);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'relative',
        width: '50%',
      }}
    >
      <div className="main">
        <textarea
          className="display-screen"
          value={`BOARD: ${displayValues.join(' ')}\nRESULT: ${result}`}
          readOnly
        />

        <div className="button-grid">
          <button onClick={() => getValuesOnButtonClick('CLUB')} className="grid-button">
            <center>
              <img src={clubs} height={20} width={20} alt="" />
            </center>
          </button>
          <button onClick={() => getValuesOnButtonClick('DIAMOND')} className="grid-button">
            <center>
              <img src={diamonds} height={20} width={20} alt="" />
            </center>
          </button>
          <button onClick={() => getValuesOnButtonClick('HEART')} className="grid-button">
            <center>
              <img src={hearts} height={25} width={25} alt="" />
            </center>
          </button>
          <button onClick={() => getValuesOnButtonClick('SPADE')} className="grid-button">
            <center>
              <img src={spades} height={20} width={20} alt="" />
            </center>
          </button>
          <button
            onClick={() => getValuesOnButtonClick('NT')}
            value="NT"
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            NT
          </button>
          <button
            onClick={() => getValuesOnButtonClick('1')}
            value="1"
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            1
          </button>
          <button
            onClick={() => getValuesOnButtonClick('2')}
            value="2"
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            2
          </button>
          <button
            onClick={() => getValuesOnButtonClick('3')}
            value="3"
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            3
          </button>
          <button className="grid-button" style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{ fontSize: '16px', marginTop: '-3px', width: '100%', marginLeft: '-21px' }}
            >
              J
            </span>
            <span
              style={{
                color: 'red',
                width: '100%',
                fontSize: '20px',
                marginLeft: '17px',
                marginTop: '-6px',
              }}
            >
              +
            </span>
          </button>
          <button className="grid-button" style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{ fontSize: '16px', marginTop: '-3px', width: '100%', marginLeft: '-17px' }}
            >
              Q
            </span>
            <span
              style={{
                color: 'red',
                width: '100%',
                fontSize: '20px',
                marginLeft: '15px',
                marginTop: '-6px',
              }}
            >
              -
            </span>
          </button>
          <button
            onClick={() => getValuesOnButtonClick('4')}
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            4
          </button>
          <button
            onClick={() => getValuesOnButtonClick('5')}
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            5
          </button>
          <button
            onClick={() => getValuesOnButtonClick('6')}
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            6
          </button>
          <button className="grid-button" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', marginTop: '-3px', fontSize: '16px' }}>K</span>
            <span
              style={{
                color: 'green',

                fontSize: '12px',
                marginLeft: '8px',
                width: '100%',
              }}
            >
              PASS
            </span>
          </button>
          <button className="grid-button" style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{ fontSize: '16px', marginTop: '-3px', width: '100%', marginLeft: '-17px' }}
            >
              A
            </span>
            <span
              style={{
                color: 'red',
                width: '100%',
                fontSize: '20px',
                marginLeft: '15px',
                marginTop: '-6px',
              }}
            >
              =
            </span>
          </button>
          <button
            onClick={() => getValuesOnButtonClick('7')}
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            7
          </button>
          <button
            onClick={() => getValuesOnButtonClick('8')}
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            8
          </button>
          <button
            onClick={() => getValuesOnButtonClick('9')}
            className="grid-button"
            style={{ fontWeight: 'bold' }}
          >
            9
          </button>
          <button className="grid-button" style={{ color: 'blue' }}>
            XX
          </button>
          <button className="grid-button" style={{ color: 'red' }}>
            X
          </button>
          <button className="grid-button" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', marginLeft: '12px', marginTop: '3px' }}>N</span>
            <span style={{ fontSize: '14px', marginTop: '-15px', marginLeft: '21px' }}>/</span>
            <span style={{ fontSize: '14px', marginTop: '-18px', marginLeft: '28px' }}>S</span>
          </button>
          <button className="grid-button" style={{ fontWeight: 'bold' }}>
            <span style={{ fontSize: '11px' }}>1</span>
            <span>0</span>
          </button>
          <button className="grid-button" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', marginLeft: '8px', marginTop: '3px' }}>E</span>
            <span style={{ fontSize: '14px', marginTop: '-15px', marginLeft: '16px' }}>/</span>
            <span style={{ fontSize: '14px', marginTop: '-18px', marginLeft: '24px' }}>W</span>
          </button>
          <button onClick={() => handleCancelClick()} className="grid-button">
            CAN
          </button>
          <button onClick={() => handleOkClick()} className="grid-button">
            OK
          </button>
        </div>
      </div>
      <div
        className="mode-toggle-buttons"
        style={{ display: 'flex', position: 'relative', right: '50px', bottom: '105px' }}
      >
        <button
          onClick={() => handleToggleClick('green')}
          style={{
            backgroundColor: activeButton === 'green' ? 'green' : '#cacaca',
            width: '50px',
            height: '50px',
            border: '1px solid black',
            borderRadius: '5px',
          }}
        ></button>
        <button
          onClick={() => handleToggleClick('red')}
          style={{
            backgroundColor: activeButton === 'red' ? 'red' : '#cacaca',
            width: '50px',
            height: '50px',
            border: '1px solid black',
            borderRadius: '5px',
          }}
        ></button>
      </div>
    </div>
  );
};

export default ButtonLayout;
