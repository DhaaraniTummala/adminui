import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Select, Avatar, Progress, message } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  LogoutOutlined,
  UserOutlined,
  TruckOutlined,
  ArrowRightOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import Layout from '@/components/Layout';
import { Pie } from '@ant-design/plots';
import API from '../store/requests';

const { Option } = Select;

/* ---------- SMALL COMPONENTS ---------- */

const MetricCard = ({ icon, title, value, color }) => (
  <Card
    style={{
      borderRadius: 12,
      border: '1px solid #F2F4F7',
      boxShadow: 'none',
      height: '100%',
    }}
    bodyStyle={{ padding: 14 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          fontSize: 16,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#667085' }}>{title}</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  </Card>
);

const StatusPill = ({ status }) => {
  const isIn = status === 'CHECK IN';
  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: isIn ? '#ECFDF3' : '#FEF3F2',
        color: isIn ? '#027A48' : '#B42318',
        whiteSpace: 'nowrap',
      }}
    >
      ● {status}
    </span>
  );
};

/* ---------- MAIN PAGE ---------- */

const VisitorsDashboard = ({ actions }) => {
  const [vehicleData, setVehicleData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // List API
  const fetchVehicleData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await API.triggerPost('10825', {
        pageNo: '',
        pageSize: '',
        filterInfo: '',
        action: 'list',
        // sortInfo: [{

        // }],
        identifier: '10825',
        apiIdentifier: '10825',
      });

      if (response?.data) {
        setVehicleData(response.data.data);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch visitor data');
      }
    } catch (err) {
      console.error('Error fetching visitor data:', err);
      message.error(`Error loading visitor data: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchVisitorData = useCallback(async () => {
    try {
      const response = await API.triggerPost('10826', {
        pageNo: '',
        pageSize: '',
        filterInfo: '',
        action: 'list',
        identifier: '10826',
        apiIdentifier: '10826',
      });

      if (response?.data?.data) {
        setVisitorData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching visitor data:', err);
      message.error(`Error loading visitor data: ${err.message}`);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchVehicleData();
    fetchVisitorData();
  }, [fetchVehicleData, fetchVisitorData]);

  useEffect(() => {});
  // Calculate visitor percentages
  const recurringVisitors = 60;
  const oneTimeVisitors = 10;

  const donutData = [
    {
      type: 'Recurring Visitors',
      value: recurringVisitors,
    },
    {
      type: 'One-time Visitors',
      value: oneTimeVisitors,
    },
  ];

  const donutConfig = {
    data: donutData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.78,
    paddingAngle: 2,
    legend: false,
    label: false,
    color: ['#12B76A', '#2E90FA'],
    statistic: {
      title: false,
      content: false,
    },
  };

  // ---------------- VEHICLE METRICS CALCULATION ----------------

  const vehicleList = vehicleData || [];
  // Vehicle Check In = InDateTime present AND OutDateTime null
  const vehicleCheckIn = vehicleList.filter((item) => item.InDateTime && !item.OutDateTime).length;

  // Vehicle Check Out = OutDateTime present
  const vehicleCheckOut = vehicleList.filter((item) => item.OutDateTime).length;

  // Vehicle Total
  const vehicleTotal = vehicleList.length;

  const visitorList = visitorData || [];

  // Visitor CHECK IN → InDateTime present & OutDateTime null
  const visitorCheckIn = visitorList.filter((v) => v.InDateTime && !v.OutDateTime).length;

  // Visitor CHECK OUT → OutDateTime present
  const visitorCheckOut = visitorList.filter((v) => v.OutDateTime).length;

  // Visitor TOTAL → backend records
  const visitorTotal = visitorList.length;

  // ---------------- TABLE DATA ----------------

  const metricsTableData = [
    {
      type: 'Visitor',
      checkIn: visitorCheckIn,
      checkOut: visitorCheckOut,
      total: visitorTotal,
    },
    {
      type: 'Vehicle',
      checkIn: vehicleCheckIn,
      checkOut: vehicleCheckOut,
      total: vehicleTotal,
    },
    {
      type: 'Total',
      checkIn: visitorCheckIn + vehicleCheckIn,
      checkOut: visitorCheckOut + vehicleCheckOut,
      total: visitorTotal + vehicleTotal,
    },
  ];

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '16px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        {/* HEADER */}
        <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: 'black' }}>
          Visitors Dashboard
        </h2>
        <p style={{ fontSize: 12, color: 'black', maxWidth: 760 }}>
          Access The Visitors Dashboard To Monitor Entries, Track Visit Activity, And Manage All
          Visitor Records Efficiently For Enhanced Security.
        </p>

        {/* METRICS + DONUT */}
        <Row gutter={[12, 16]} style={{ marginTop: 16 }}>
          <Col span={14}>
            <Card style={{ borderRadius: 12, height: '100%' }} bodyStyle={{ padding: '16px' }}>
              <div
                style={{
                  border: '1px solid lightgray',
                  borderRadius: '6px',
                  background: '#fff',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    background: 'rgb(105, 65, 198)',
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Visitor Metrics</span>
                </div>

                {/* Table Container */}
                <div
                  style={{
                    position: 'relative',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: '400px',
                    background: '#fff',
                  }}
                >
                  <table style={{ minWidth: '100%', fontSize: '13px', color: '#444' }}>
                    <thead
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        background: '#F9FAFB',
                      }}
                    >
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <th
                          style={{
                            position: 'sticky',
                            top: 0,
                            background: '#F9FAFB',
                            padding: '12px 16px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'left',
                            color: '#6B7280',
                            zIndex: 10,
                          }}
                        >
                          Type
                        </th>
                        <th
                          style={{
                            position: 'sticky',
                            top: 0,
                            background: '#F9FAFB',
                            padding: '12px 16px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'left',
                            color: '#6B7280',
                            zIndex: 10,
                          }}
                        >
                          Check In
                        </th>
                        <th
                          style={{
                            position: 'sticky',
                            top: 0,
                            background: '#F9FAFB',
                            padding: '12px 16px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'left',
                            color: '#6B7280',
                            zIndex: 10,
                          }}
                        >
                          Check Out
                        </th>
                        <th
                          style={{
                            position: 'sticky',
                            top: 0,
                            background: '#F9FAFB',
                            padding: '12px 16px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'left',
                            color: '#6B7280',
                            zIndex: 10,
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {metricsTableData.map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: '1px solid #E5E7EB',
                            backgroundColor: 'white',
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 12, color: '#111827', fontWeight: 600 }}>
                              {item.type}
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 14, color: '#6B7280' }}>{item.checkIn}</div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 14, color: '#6B7280' }}>{item.checkOut}</div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 14, color: '#6B7280' }}>{item.total}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </Col>

          {/* RETURNING VISITORS */}
          <Col span={10}>
            <Card
              style={{ borderRadius: 12, height: '100%' }}
              title={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Returning Visitors
                  <Select size="small" defaultValue="month">
                    <Option value="month">This Month</Option>
                  </Select>
                </div>
              }
              bodyStyle={{
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Pie {...donutConfig} height={220} />

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                <span style={{ color: ' #2E90FA' }}>● </span>
                Recurring Visitors : {recurringVisitors}
                &nbsp;&nbsp;
                <span style={{ color: '#12B76A' }}>● </span>
                One-time Visitors : {oneTimeVisitors}
              </div>
            </Card>
          </Col>
        </Row>

        {/* LIVE FEEDS + DEPARTMENTS */}
        <Row gutter={[12, 16]} style={{ marginTop: 16 }}>
          <Col span={14}>
            <Row gutter={[12, 16]}>
              <Col span={12}>
                <Card
                  style={{ borderRadius: 12 }}
                  title={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Visitors Live Feed <ArrowRightOutlined />
                    </div>
                  }
                  bodyStyle={{ padding: '8px 16px' }}
                >
                  {visitorData && visitorData.length > 0 ? (
                    visitorData.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom:
                            i !== 4 && i < visitorData.length - 1 ? '1px solid #F2F4F7' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Avatar size={32} src={item.ImageUrl} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>{item.FullName}</div>
                            {/* <div style={{ fontSize: 12, color: '#667085' }}>{item.MobileNo}</div> */}
                          </div>
                        </div>
                        <StatusPill status={item.InStatus} />
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>
                      No visitor data available
                    </div>
                  )}
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  style={{ borderRadius: 12 }}
                  title={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Vehicles Live Feed <ArrowRightOutlined />
                    </div>
                  }
                  bodyStyle={{ padding: '8px 16px' }}
                >
                  {vehicleData && vehicleData.length > 0 ? (
                    vehicleData.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom:
                            i !== 4 && i < vehicleData.length - 1 ? '1px solid #F2F4F7' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: '1px solid #E4E7EC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Avatar size={32} src={item.ImageUrlDriver} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>{item.DriverName}</div>
                            <div style={{ fontSize: 12, color: '#667085' }}>{item.VehicleNo} </div>
                          </div>
                        </div>
                        <StatusPill status={item.InStatus} />
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>
                      No vehicle data available
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </Col>

          <Col span={10}>
            <Card
              style={{ borderRadius: 12 }}
              title={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Most Visit Departments{' '}
                  <Select size="small" defaultValue="week">
                    <Option value="week">This Week</Option>
                  </Select>
                </div>
              }
              bodyStyle={{ padding: '8px 16px' }}
            >
              {[
                'Ecommerce',
                'Sales',
                'C Suite',
                'Tech',
                'Customer Care',
                'HR',
                'Product',
                'Growth',
                'Fleet Management',
              ].map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    fontSize: 12,
                    borderBottom: i !== 8 ? '1px solid #F2F4F7' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ApartmentOutlined />
                    {d}
                  </div>
                  <strong>--</strong>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default Layout(VisitorsDashboard);
