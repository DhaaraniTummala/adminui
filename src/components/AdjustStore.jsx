import React, { useState } from 'react';
import {
  TextField,
  MenuItem,
  Button,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  Typography,
} from '@mui/material';

const AdjustScore = () => {
  const [boardNo, setBoardNo] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [northSouthNo, setNorthSouthNo] = useState('');
  const [eastWest, setEastWest] = useState('');
  const [contractLevel, setContractLevel] = useState('');
  const [contractSuit, setContractSuit] = useState('');
  const [doubled, setDoubled] = useState('');
  const [declared, setDeclared] = useState('');
  const [tricksSign, setTricksSign] = useState('+');
  const [tricksValue, setTricksValue] = useState(7);
  const [scoreSummary, setScoreSummary] = useState({});
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!boardNo) newErrors.boardNo = 'Board number is required';
    if (!tableNo) newErrors.tableNo = 'Table number is required';
    if (!northSouthNo) newErrors.northSouthNo = 'North-South number is required';
    if (!eastWest) newErrors.eastWest = 'East-West number is required';
    if (!contractLevel) newErrors.contractLevel = 'Contract level is required';
    if (!contractSuit) newErrors.contractSuit = 'Contract suit is required';
    if (!doubled) newErrors.doubled = 'Doubled option is required';
    if (!declared) newErrors.declared = 'Declared direction is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNumberChange = (setter) => (event) => {
    const value = event.target.value;
    setter(value >= 0 && value <= 999 ? value : '');
  };

  const handleContractLevelChange = (event) => {
    setContractLevel(event.target.value);
  };

  const handleContractSuitChange = (event) => {
    setContractSuit(event.target.value);
  };

  const handleDoubledChange = (event) => {
    setDoubled(event.target.value);
  };

  const handleDeclaredChange = (event) => {
    setDeclared(event.target.value);
  };

  const handleTricksSignChange = (event) => {
    setTricksSign(event.target.value);
  };

  const handleTricksValueChange = (event) => {
    setTricksValue(event.target.value);
  };

  const handleScore = () => {
    if (validate()) {
      setScoreSummary({
        boardNo,
        tableNo,
        northSouthNo,
        eastWest,
        contractLevel,
        contractSuit,
        doubled,
        declared,
        tricks: `${tricksSign}${tricksValue}`,
      });
    }
  };

  return (
    <div>
      <Box
        className="bg-gray-200 p-4 rounded-lg shadow-md max-w-4xl mx-auto mt-10"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
        }}
      >
        <TextField
          label="Board no"
          variant="standard"
          size="small"
          fullWidth
          type="number"
          value={boardNo}
          onChange={handleNumberChange(setBoardNo)}
          error={!!errors.boardNo}
          helperText={errors.boardNo}
          InputProps={{
            inputProps: { min: 1, max: 999 },
          }}
        />

        <TextField
          label="Table no"
          variant="standard"
          size="small"
          fullWidth
          type="number"
          value={tableNo}
          onChange={handleNumberChange(setTableNo)}
          error={!!errors.tableNo}
          helperText={errors.tableNo}
          InputProps={{
            inputProps: { min: 1, max: 999 },
          }}
        />

        <TextField
          label="North South no"
          variant="standard"
          size="small"
          fullWidth
          type="number"
          value={northSouthNo}
          onChange={handleNumberChange(setNorthSouthNo)}
          error={!!errors.northSouthNo}
          helperText={errors.northSouthNo}
          InputProps={{
            inputProps: { min: 1, max: 999 },
          }}
        />

        <TextField
          label="East West no"
          type="number"
          variant="standard"
          size="small"
          fullWidth
          value={eastWest}
          onChange={handleNumberChange(setEastWest)}
          error={!!errors.eastWest}
          helperText={errors.eastWest}
          InputProps={{
            inputProps: { min: 1, max: 999 },
          }}
        />

        <FormControl component="fieldset" fullWidth error={!!errors.contractLevel}>
          <FormLabel component="legend">Contract Level</FormLabel>
          <RadioGroup row value={contractLevel} onChange={handleContractLevelChange}>
            {[1, 2, 3, 4, 5, 6, 7].map((level) => (
              <FormControlLabel
                key={level}
                value={level.toString()}
                control={<Radio />}
                label={level.toString()}
              />
            ))}
          </RadioGroup>
          {errors.contractLevel && <Typography color="error">{errors.contractLevel}</Typography>}
        </FormControl>

        <FormControl component="fieldset" fullWidth error={!!errors.contractSuit}>
          <FormLabel component="legend">Contract Suit</FormLabel>
          <RadioGroup row value={contractSuit} onChange={handleContractSuitChange}>
            {['C', 'D', 'H', 'S', 'NT'].map((suit) => (
              <FormControlLabel key={suit} value={suit} control={<Radio />} label={suit} />
            ))}
          </RadioGroup>
          {errors.contractSuit && <Typography color="error">{errors.contractSuit}</Typography>}
        </FormControl>

        <FormControl component="fieldset" fullWidth error={!!errors.doubled}>
          <FormLabel component="legend">Doubled</FormLabel>
          <RadioGroup row value={doubled} onChange={handleDoubledChange}>
            {['Undoubled', 'Doubled', 'Re-double'].map((option) => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
          {errors.doubled && <Typography color="error">{errors.doubled}</Typography>}
        </FormControl>

        <FormControl component="fieldset" fullWidth error={!!errors.declared}>
          <FormLabel component="legend">Declared</FormLabel>
          <RadioGroup row value={declared} onChange={handleDeclaredChange}>
            {['North', 'South', 'East', 'West'].map((direction) => (
              <FormControlLabel
                key={direction}
                value={direction}
                control={<Radio />}
                label={direction}
              />
            ))}
          </RadioGroup>
          {errors.declared && <Typography color="error">{errors.declared}</Typography>}
        </FormControl>

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Tricks</FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RadioGroup row value={tricksSign} onChange={handleTricksSignChange}>
              <FormControlLabel value="+" control={<Radio />} label="+" />
              <FormControlLabel value="-" control={<Radio />} label="-" />
            </RadioGroup>
            <Select
              value={tricksValue}
              onChange={handleTricksValueChange}
              variant="standard"
              sx={{ marginLeft: 2 }}
            >
              {[...Array(14).keys()].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </FormControl>

        <Box className="col-span-3 flex justify-center mt-4">
          <Button variant="contained" color="primary" className="bg-blue-500" onClick={handleScore}>
            Score
          </Button>
        </Box>

        {Object.keys(scoreSummary).length > 0 && (
          <Box className="col-span-3 mt-4">
            <h3>All Values</h3>
            <ul>
              <li>Board No: {scoreSummary.boardNo}</li>
              <li>Table No: {scoreSummary.tableNo}</li>
              <li>North South No: {scoreSummary.northSouthNo}</li>
              <li>East West No: {scoreSummary.eastWest}</li>
              <li>Contract Level: {scoreSummary.contractLevel}</li>
              <li>Contract Suit: {scoreSummary.contractSuit}</li>
              <li>Doubled: {scoreSummary.doubled}</li>
              <li>Declared: {scoreSummary.declared}</li>
              <li>Tricks: {scoreSummary.tricks}</li>
            </ul>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default AdjustScore;
