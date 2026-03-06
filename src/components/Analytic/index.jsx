import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';

import Layout from '../Layout';
import './index.css';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxHelper } from '@/core/redux-helper';
import { FixedSizeList as List } from 'react-window';

const Chart = () => {
  const dispatch = useDispatch();

  const [chartData, setChartData] = useState([]);
  const [sortedPlaces, setSortedPlaces] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [placeNames, setPlaceNames] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState({});
  const [timeRange, setTimeRange] = useState('H4');
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedCity, setSelectedCity] = useState('723289D5-9983-4A2F-6538-08DCC857D3E1');
  const scouterCity_result = useSelector((state) => state?.requestForJson_ScouterCity);
  const scouterPlace_result = useSelector((state) => state?.list_ScouterPlace);
  const analytics_result = useSelector((state) => state?.requestForJson_Analytics);

  useEffect(() => {
    dispatch(
      ReduxHelper.Actions.requestForJsonScouterCity({ StoredProcedureName: 'APP_City_Search' }),
    );
    dispatch(
      ReduxHelper.Actions.listScouterPlace({
        filterInfo: [
          {
            filterBy: 'cityId',
            filterType: 'EQUALS',
            filterTerm: selectedCity,
          },
        ],
      }),
    );
  }, []);

  useEffect(() => {
    dispatch(
      ReduxHelper.Actions.listScouterPlace({
        filterInfo: [
          {
            filterBy: 'cityId',
            filterType: 'EQUALS',
            filterTerm: selectedCity,
          },
        ],
      }),
    );
  }, [selectedCity]);

  useEffect(() => {
    if (scouterCity_result.data && scouterCity_result.data.data) {
      setCities(scouterCity_result.data.data);
    }
  }, [scouterCity_result]);

  useEffect(() => {
    if (scouterPlace_result.data && scouterPlace_result.data.data) {
      setPlaces(scouterPlace_result.data.data);
    }
  }, [scouterPlace_result]);

  useEffect(() => {
    if (analytics_result.data && analytics_result.data.data) {
      updateChartData(analytics_result.data.data[0]?.PlaceInfo);
      extractPlaceNames(analytics_result.data.data[0]?.PlaceInfo);
    }
  }, [analytics_result]);

  /*useEffect(() => {
    if (chartDataJson.data.length > 0) {
      updateChartData(chartDataJson.data[0].PlaceInfo);
      extractPlaceNames(chartDataJson.data[0].PlaceInfo);
    }
  }, []);*/

  const RefreshData = () => {
    let placeInfo = [];
    let places = selectedPlaces;
    for (let place in places) {
      if (places[place]) {
        placeInfo.push({ PlaceId: place });
      }
    }

    //-- EXEC [10012_AnalyticsChart] N'[{"TimeFormat":"D1","PlaceInfo":[{"PlaceId":"376A5363-85EC-4E5F-B1FF-08DD0ECFFAA7"},{"PlaceId":"0104663E-5B9E-4E2B-B056-08DD0ECFFAA7"}]}]'
    var params = {
      StoredProcedureName: 'AnalyticsChart',
      Params1: JSON.stringify([
        {
          TimeFormat: timeRange, //D1
          PlaceInfo: placeInfo,
          /*"PlaceInfo": [
          { "PlaceId": "376A5363-85EC-4E5F-B1FF-08DD0ECFFAA7" },
          { "PlaceId": "0104663E-5B9E-4E2B-B056-08DD0ECFFAA7" }
        ]*/
        },
      ]),
    };
    dispatch(ReduxHelper.Actions.requestForJsonAnalytics(params));
  };

  const extractPlaceNames = (places) => {
    const names = places?.map((place) => place.PlaceName);
    setPlaceNames(names);

    /*const initialCheckboxState = names.reduce((acc, name) => {
      acc[name] = false;
      return acc;
    }, {});
    setSelectedPlaces(initialCheckboxState);*/
  };
  const handleCheckboxChange = (placeId) => {
    setSelectedPlaces((prev) => {
      const updatedSelection = {
        ...prev,
        [placeId]: !prev[placeId],
      };

      /*const selected = Object.keys(updatedSelection).filter((key) => updatedSelection[key]);

      if (selected.length > 0) {
        alert(`Selected Places: ${selected.join(', ')}`);
      }*/

      return updatedSelection;
    });
  };

  const updateChartData = (places) => {
    let combinedData = {};
    let allTimestamps = new Set();
    let lastKnownValues = {};

    places?.forEach((place) => {
      place.ChartInfo = place.ChartInfo || [];
      place.ChartInfo.forEach((entry) => {
        const timeKey = new Date(entry.CreatedDate).toISOString();
        allTimestamps.add(timeKey);
      });
    });

    allTimestamps = Array.from(allTimestamps).sort((a, b) => new Date(a) - new Date(b));

    allTimestamps.forEach((time) => {
      combinedData[time] = { x: moment(time).format('YYYY-MM-DD HH:mm') };
    });

    places?.forEach((place) => {
      lastKnownValues[place.PlaceName] = 0;

      allTimestamps.forEach((time) => {
        const entry = place.ChartInfo.find((e) => new Date(e.CreatedDate).toISOString() === time);
        if (entry) {
          lastKnownValues[place.PlaceName] = Number(entry.CurrentPopularity);
        }
        combinedData[time][place.PlaceName] = lastKnownValues[place.PlaceName];
      });
    });

    // Sort the places based on the popularity at each timestamp
    const sortedPlacesList = places
      ?.map((place) => ({
        ...place,
        totalPopularity: place.ChartInfo.reduce(
          (sum, entry) => sum + Number(entry.CurrentPopularity),
          0,
        ),
      }))
      .sort((a, b) => b.totalPopularity - a.totalPopularity); // Sorting high to low

    setSortedPlaces(sortedPlacesList);
    setChartData(Object.values(combinedData));
  };

  const colors = [
    'red',
    'green',
    '#007BFF',
    'purple',
    '#FFC107',
    '#17A2B8',
    'black',
    '#6610F2',
    '#E83E8C',
    'skyblue',
  ];
  const timeRanges = [
    //{ value: 'Past Hour' },
    //{ value: 'Past 2 Hours' },
    { text: 'Past 4 Hours', value: 'H4' },
    { text: 'Past Day', value: 'D1' },
    { text: 'Past 7 Days', value: 'D7' },
    { text: 'Past 30 Days', value: 'D30' },
    //{ value: 'Past 90 Days' },
    //{ value: 'Past 12 Months' },
    //{ value: 'Past 5 Years' },
    //{ value: '2004 - Present' },
  ];

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Paper
      elevation={8}
      className="chart-container"
      style={{ padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px' }}
    >
      <Box className="chart-wrapper" style={{ flex: 1 }}>
        <FormControl
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <FormControl style={{ display: 'flex', flexDirection: 'row', width: '500px' }}>
            {cities && (
              <List
                height={110}
                itemCount={cities.length}
                itemSize={42}
                width={290}
                itemData={cities}
              >
                {({ style, index }) => (
                  <div
                    style={{
                      ...style,
                      textOverflow: 'ecllipse',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                    key={cities[index].cityId}
                  >
                    <Checkbox
                      checked={cities[index].cityId == selectedCity}
                      onClick={(e) => {
                        setSelectedPlaces({});
                        setSelectedCity(cities[index].cityId);
                      }}
                    />
                    {cities[index].cityName}
                  </div>
                )}
              </List>
            )}

            {places && (
              <List
                height={110}
                itemCount={places.length}
                itemSize={42}
                width={290}
                itemData={places}
              >
                {({ style, index }) => (
                  <div
                    style={{
                      ...style,
                      textOverflow: 'ecllipse',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                    key={places[index].PlaceId}
                  >
                    <Checkbox
                      checked={selectedPlaces[places[index].PlaceId]}
                      onChange={() => handleCheckboxChange(places[index].PlaceId)}
                    />
                    {places[index].PlaceName}
                  </div>
                )}
              </List>
            )}
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: '10px', padding: '12px' }}
            onClick={() => setOpenModal(true)}
          >
            Open Modal
          </Button>
          <FormControl style={{ marginRight: '10px' }}>
            <Select
              value={timeRange}
              sx={{
                borderRadius: '5px',
                '& fieldset': { border: 'none' },
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid #d9d9d9',
                width: '150px',
                paddingLeft: '10px',
              }}
              onChange={handleTimeRangeChange}
              MenuProps={{
                anchorOrigin: { vertical: 'top', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                getContentAnchorEl: null,
                PaperProps: { className: 'dropdown-frame', style: { borderRadius: 0 } },
                MenuListProps: { className: 'dropdown-content' },
              }}
            >
              <MenuItem
                style={{
                  borderBottom: '1px solid  #d9d9d9',
                  backgroundColor: 'white',
                  height: '60px',
                }}
                key={timeRange}
                value={timeRange}
              >
                {timeRanges.find((item) => item.value === timeRange)?.text}
              </MenuItem>
              {timeRanges
                .filter((item) => item.value !== timeRange) // Filter out the selected item
                .map((item) => (
                  <MenuItem style={{ height: '50px' }} key={item.value} value={item.value}>
                    {item.text}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </FormControl>
        <ResponsiveContainer width="100%" height={450}>
          {/* Modal Dialog */}
          <Dialog open={openModal} onClose={() => setOpenModal(false)}>
            <DialogTitle>Place Name</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column">
                {places.map(({ PlaceId, PlaceName }) => (
                  <FormControlLabel
                    key={PlaceName}
                    control={
                      <Checkbox
                        checked={selectedPlaces[PlaceId]}
                        onChange={() => handleCheckboxChange(PlaceId)}
                      />
                    }
                    label={PlaceName}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <LineChart data={chartData} margin={{ top: 20, right: 50, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" tick={{ fill: '#666' }} minTickGap={50} />
            <YAxis tick={{ fill: '#666' }} />
            <Tooltip />

            {sortedPlaces?.map((place, index) => (
              <Line
                key={place.PlaceId}
                type="monotone"
                dataKey={place.PlaceName}
                stroke={colors[index % colors.length]}
                strokeWidth={2.5}
                dot={false}
                name={place.PlaceName}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Place Names Outside the Chart */}
      <Box
        style={{
          minWidth: '180px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderLeft: '1px solid #ddd',
        }}
      >
        <Typography variant="h6" style={{ marginBottom: '10px', textAlign: 'center' }}>
          Places
        </Typography>
        {sortedPlaces?.map((place, index) => (
          <Box key={place.PlaceId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: colors[index % colors.length],
                borderRadius: '50%',
              }}
            ></span>
            <Typography variant="body1">{place.PlaceName}</Typography>
          </Box>
        ))}
        <Button
          variant="contained"
          color="primary"
          // style={{ marginTop: '10px' }}
          onClick={() => RefreshData()}
        >
          Load/Refresh
        </Button>
      </Box>
    </Paper>
  );
};

export default Layout(Chart);
