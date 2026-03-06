import React from 'react';
import { Button, Menu } from 'antd';
import GridConfig from './config';
import Tooltip from '@mui/material/Tooltip';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
const { strings, paging } = GridConfig;

const Pagination = () => <div>Need to implement</div>;
export default class Pager extends React.PureComponent {
  constructor(props) {
    super(props);

    var methods = [
      'firstPage',
      'previousPage',
      'nextPage',
      'lastPage',
      'onCustomPageNoChange',
      'onkeyPressEvent',
      'refresh',
      'onPageSizeChange',
      'refreshGridPage',
    ];
    for (var method of methods) {
      this[method] = this[method].bind(this);
    }
  }

  firstPage() {
    this.onPageChange(0);
  }

  previousPage() {
    const { currentPage, pageSize, totalRecords, totalPage } = this.props;
    let newPage = 0;
    if (!(currentPage * pageSize + 1 < totalRecords)) {
      newPage = totalPage - 1;
    } else {
      newPage = currentPage;
    }

    this.onPageChange(newPage - 1);
  }

  nextPage() {
    this.onPageChange(this.props.currentPage + 1);
  }

  lastPage() {
    this.onPageChange(this.props.totalPage - 1);
  }

  onPageSizeChange(item) {
    this.props.onPageSizeChange(item.key);
  }

  onCustomPageNoChange(event) {
    var value = Number(event.target.value) - 1;
    value = value <= 0 ? 0 : value >= this.props.totalPage ? this.props.totalPage - 1 : value;
    this.onPageChange(value);
  }

  onkeyPressEvent(event) {
    if (event && event.key === 'Enter') {
      event.preventDefault();
      var value = Number(event.target.value) - 1;
      value = value <= 0 ? 0 : value >= this.props.totalPage ? this.props.totalPage - 1 : value;
      this.onPageChange(value);
    }
  }

  onPageChange(current) {
    const { totalPage, isLoading } = this.props;
    if (isLoading) return;
    if (totalPage == current || current < 0) return;
    this.props.onPageChange(current);
  }

  refresh() {
    this.props.reloadData();
  }
  refreshGridPage() {
    this.props.loadData(true);
  }

  getPagingbar({ totalRecords, currentPage, pageSize, title, totalPage }) {
    if (totalRecords == 1) {
      return (
        <label className="display_record display">
          <span className="display-no-of-record">{strings.Displaying}: </span> 1 {' of '} 1{' '}
          {' Record'}
        </label>
      );
    }

    if (totalRecords != 0) {
      if (currentPage * pageSize + 1 < totalRecords) {
        return (
          <label className="display_record display">
            <span className="display-no-of-record">{strings.Displaying}: </span>{' '}
            {currentPage * pageSize + 1}
            {' - '}
            {currentPage < totalPage - 1 ? currentPage * pageSize + pageSize : totalRecords}{' '}
            {' of '} {totalRecords} {' Records '}
          </label>
        );
      } else {
        return (
          <label className="display_record display">
            <span className="display-no-of-record">{strings.Displaying}: </span> {currentPage}
            {' - '}
            {totalRecords}
            {' of '} {totalRecords} {' Records'}
          </label>
        );
      }
    } else {
      return <label className="display_record">{title + ' ' + strings.DisplayingNoRecords}</label>;
    }
  }

  getTotalPages(pages, currentPage) {
    var a = [];
    for (let i = 1; i <= pages; i++) {
      if ((currentPage + 3 >= i && i >= currentPage - 3) || i == 1 || i == pages) {
        if ((currentPage + 3 == i || i == currentPage - 3) && 1 !== i)
          a.push({
            text: '...',
            active: i == currentPage,
            onClick: () => this.onPageChange(currentPage + 3 == i ? i + 4 : i - 4),
          });
        else
          a.push({
            text: i,
            active: i == currentPage,
            onClick: () => this.onPageChange(i - 1),
          });
      }
      // if (currentPage + pages - 5 < i) {
      //   a.push({ text: i, active: i == currentPage, onClick: () => this.onPageChange(i) })
      // }
    }
    return a;
  }

  render() {
    const {
      firstPage,
      previousPage,
      nextPage,
      lastPage,
      onCustomPageNoChange,
      onkeyPressEvent,
      refresh,
      refreshGridPage,
      onPageSizeChange,
    } = this;
    const { title, currentPage, pageSize, totalRecords, totalPage, isLoading, pagination } =
      this.props;
    const menu = (
      <Menu onClick={onPageSizeChange}>
        {paging.options.map((item) => (
          <Menu.Item eventKey={item} key={item}>
            {item}
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <>
        {totalPage > 0 ? (
          <div
            id={isLoading ? 'IRCQCPageination' : ''}
            class="ag-paging-panel ag-unselectable dark:bg-gray-900"
            style={{
              padding: pagination == 'compressed' ? '12px 16px' : '16px 20px',
              paddingRight: '20px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '60px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#fafafa',
              position: 'sticky',
              bottom: '0',
              width: '100%',
              zIndex: '100',
            }}
          >
            {/* Left side - Items per page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="dark:text-white"
                style={{
                  fontSize: '14px',
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Items Per Page
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange({ key: e.target.value })}
                style={{
                  backgroundColor: 'transparent',
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  padding: '8px 12px',
                  border: '1px solid rgba(242, 244, 247, 1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '70px',
                  height: '36px',
                }}
              >
                {paging.options.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Center - Record count with range */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <span
                className="dark:text-white"
                style={{
                  fontSize: '14px',
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: '#667085',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>
                  {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalRecords)}
                </span>{' '}
                of <span style={{ fontWeight: 700 }}>{totalRecords}</span> rows
              </span>
            </div>

            {/* Right side - Navigation buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Previous page button */}
              <div
                class={`ag-paging-button ${
                  totalPage == 0 ? true : currentPage == 0 ? 'ag-disabled' : ''
                }`}
                onClick={previousPage}
                style={{
                  cursor: currentPage == 0 ? 'not-allowed' : 'pointer',
                  padding: '8px 12px',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  border: '1px solid #d0d5dd',
                  backgroundColor: '#fff',
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#344054',
                }}
              >
                <span
                  class="ag-icon ag-icon-previous dark:text-white"
                  style={{ margin: '0px' }}
                ></span>
                <span>Previous</span>
              </div>

              {/* Page numbers */}
              {this.getTotalPages(totalPage, currentPage + 1).map((page, index) => (
                <div
                  key={index}
                  className={`ag-paging-button ${page.active ? 'ag-paging-button-active' : ''}`}
                  onClick={page.onClick}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    margin: '0 2px',
                    backgroundColor: page.active ? 'rgba(105, 65, 198, 1)' : 'transparent',
                    color: page.active ? '#fff' : '#344054',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minWidth: '36px',
                    minHeight: '36px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #d0d5dd',
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {page.text}
                </div>
              ))}

              {/* Next page button */}
              <div
                class={`ag-paging-button ${
                  totalPage == 0 ? true : currentPage >= totalPage - 1 ? 'ag-disabled' : ''
                }`}
                onClick={nextPage}
                style={{
                  cursor: currentPage >= totalPage - 1 ? 'not-allowed' : 'pointer',
                  padding: '8px 12px',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  border: '1px solid #d0d5dd',
                  backgroundColor: '#fff',
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#344054',
                }}
              >
                <span>Next</span>
                <span class="ag-icon ag-icon-next dark:text-white" style={{ margin: '0px' }}></span>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        {/* <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Pagination pages={this.getTotalPages(totalPage, currentPage + 1)} />
          </Grid>
          <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
            <Dropdown overlay={menu}>
              <Button
                style={{
                  marginTop: 20,
                  color: paginationDropDownColor[0],
                  border: '1px solid #C31D1D',
                }}
                // className="ant-btn-primary"
                ghost
              >
                {pageSize} <Icon type="down" />
              </Button>
            </Dropdown>
          </Grid>
        </Grid> */}
        <div>
          {/* <div style={{ height: "40px" }}>
            <div className="col-xs-11 col-sm-11 col-md-12 background-color-white"> */}

          {/* <Button
                className="grid-toolbar-refreshGrid-button paging-btn"
                disabled={totalPage == 0 ? true : currentPage == 0}
                onClick={firstPage}
                icon={'double-left'}
                style={{ margin: '5px' }}
              />
              <Button
                className="grid-toolbar-refreshGrid-button paging-btn"
                disabled={totalPage == 0 ? true : currentPage == 0}
                onClick={previousPage}
                icon={'left'}
                style={{ margin: '5px' }}
              />
              <label className="display_record pagebar-text">{'Page'} </label>
              <input
                key={Math.random()}
                defaultValue={totalPage == 0 ? 0 : currentPage + 1}
                disabled={totalPage == 0 ? true : false}
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                className="paginator-text page-text"
                onBlur={onCustomPageNoChange}
                onKeyPress={onkeyPressEvent}
                min='0'
              />
              <label className="display_record pagebar-text">
                {' '}
                {' of '} {totalPage}{' '}
              </label>
              <Button
                className="grid-toolbar-refreshGrid-button paging-btn"
                disabled={totalPage == 0 ? true : currentPage >= totalPage - 1}
                onClick={nextPage}
                icon={'right'}
                style={{ margin: '5px' }}
              />
              <Button
                className="grid-toolbar-refreshGrid-button paging-btn"
                disabled={totalPage == 0 ? true : currentPage >= totalPage - 1}
                onClick={lastPage}
                icon={'double-right'}
                style={{ margin: '5px' }}
              />
              <Button
                className="grid-toolbar-refreshGrid-button paging-btn"
                onClick={refresh}
                icon={isLoading ? 'loading' : 'reload'}
                style={{ margin: '5px' }}
              >
                {' '}
                <i className={isLoading ? 'fa fa-spinner fa-spin' : 'fa fa-refresh'} />
              </Button> */}

          {/* <DropdownButton id='paging' style={{ minWidth: '35px' }} title={pageSize} dropup type="button" onSelect={onPageSizeChange} className="btn btn-w-m grid-toolbar-refreshGrid-button paging-btn" >
                {
                    paging.options.map(item => <MenuItem eventKey={item} key={item}>{item}</MenuItem>)
                }
            </DropdownButton> */}
          {/* <Dropdown overlay={menu}>
                <Button style={{ marginLeft: 8 }}>
                  {pageSize} <Icon type="down" />
                </Button>
              </Dropdown> */}

          {/* </div>
          </div> */}

          {/* <div className="clearfix" /> */}
        </div>
        {/*<div>
          <div>
             <br />
           <div className="col-xs-1 col-sm-1 col-md-4 background-color-white">
              {this.getPagingbar({
                totalRecords,
                currentPage,
                pageSize,
                title,
                totalPage,
              })}
            </div> 
          </div>
        </div>*/}
      </>
    );
  }
}
