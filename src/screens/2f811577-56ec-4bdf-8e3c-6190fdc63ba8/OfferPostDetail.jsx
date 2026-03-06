import React, { Component, useState } from 'react';
import Layout from '../../components/Layout';
import { useLocation } from 'react-router-dom';
import SimpleForm from '../../components/BaseView/simple-form';
import { Carousel } from 'react-responsive-carousel';
import '../2f811577-56ec-4bdf-8e3c-6190fdc63ba8/style.css';

const PlaceOffer = {
  idColumn: 'PlaceOfferId',
};

function renderItem(item) {
  if (item.PostType == 'Image' || item.PostType == 'Event') {
    if (item.AttachmentUrl.split(',').length > 1) {
      return (
        <Carousel style={{ height: '200px', width: 'calc(100%)' }} showThumbs={false}>
          {item.AttachmentUrl.split(',').map((imageSrc) => (
            <div>
              <img src={imageSrc} style={{ height: '80%', width: 'calc(100%)' }} />
            </div>
          ))}
        </Carousel>
      );
    } else {
      return (
        <img
          src={item.AttachmentUrl}
          style={{
            height: '80%',
            width: '100%',
            objectFit: 'contain',
          }}
        />
      );
    }
  } else if (item.PostType == 'Video') {
    return (
      <>
        <video
          poster={item.ThumbnailUrl}
          controlsList="nofullscreen"
          controls
          style={{
            height: '80%',
            width: '100%',
            objectFit: 'contain',
          }}
        >
          <source src={item.AttachmentUrl} type="video/mp4" />
        </video>

        {/* <div>
                    <p>{item.Description ? item.Description : 'No description available'}</p>
                    <p>{item.BatchName}</p>
                </div> */}
      </>
    );
  } else {
    return <div>Event</div>;
  }
}

function PlaceOfferDetail() {
  const location = useLocation();
  const item = location.state?.item;

  const columns = [
    { title: 'PlaceId', type: 'combo', dataIndex: 'PlaceId', comboType: '10057' },
    { title: 'Offer Day', dataIndex: 'OfferDay' },
    { title: 'Offer Start Time', dataIndex: 'OfferStartTime' },
    { title: 'Offer End Time', dataIndex: 'OfferEndTime' },
    { title: 'Offering', dataIndex: 'Offering' },
    { title: 'Price', dataIndex: 'OfferPrice' },
  ];

  if (!item) {
    return <div>No item data available</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        <div style={{ flex: '0 0 400px' }}>{renderItem(item)}</div>
        <div style={{ flex: 1 }}>
          <SimpleForm
            columns={columns}
            identifier={'10721'}
            apiIdentifier={'10721'}
            config={PlaceOffer}
            activeRecordId="NEW_RECORD"
          />
        </div>
      </div>
    </div>
  );
}

export default Layout(PlaceOfferDetail);
