import React from 'react';
import { InputComponent } from '../input-component';
import '../../../../../src/index.css';
import WindowedSelect from 'react-windowed-select';

// Add CSS to remove inner borders
const customSelectStyles = `
  .custom-select-no-border input {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  .custom-select-no-border input:focus {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
  .custom-select-no-border .react-select__input {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
  .custom-select-no-border .react-select__input input {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customSelectStyles;
  document.head.appendChild(styleElement);
}

export class CustomSelect extends InputComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      options,
      onChange,
      name,
      value,
      allowZeros,
      mode,
      mappingId,
      title,
      disabled,
      ...rest
    } = this.props;

    const formattedOptions = options.map((opt) => {
      return {
        label: opt.DisplayValue,
        value: opt[mappingId],
      };
    });
    return (
      <>
        <WindowedSelect
          {...rest}
          isMulti={mode === 'multiple'}
          id={name}
          options={formattedOptions}
          isDisabled={disabled}
          isSearchable={true}
          isClearable={true}
          placeholder={rest.placeholder || `Search ${title || 'options'}...`}
          noOptionsMessage={() => 'No options found'}
          className="custom-select-no-border"
          value={
            mode === 'multiple'
              ? formattedOptions.filter((opt) =>
                  Array.isArray(value) ? value.includes(opt.value) : value === opt.value,
                )
              : formattedOptions.find((opt) => opt.value === value) || null
          }
          onChange={(selectedOption) => {
            if (onChange) {
              if (mode === 'multiple') {
                onChange(selectedOption ? selectedOption.map((item) => item.value) : []);
              } else {
                onChange(selectedOption ? selectedOption.value : null);
              }
            }
          }}
          closeMenuOnSelect={mode !== 'multiple'}
          menuShouldScrollIntoView={false}
          maxMenuHeight={200}
          styles={{
            menu: (provided) => ({
              ...provided,
              zIndex: 9999,
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: 'white',
              marginTop: '4px',
              maxHeight: '200px',
            }),
            menuList: (provided) => ({
              ...provided,
              maxHeight: '200px',
              overflowY: 'auto',
              '::-webkit-scrollbar': {
                width: '8px',
              },
              '::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '::-webkit-scrollbar-thumb': {
                background: '#6941C6',
                borderRadius: '4px',
              },
              '::-webkit-scrollbar-thumb:hover': {
                background: '#5a35b0',
              },
            }),
            control: (provided, state) => ({
              ...provided,
              border: '1px solid #d1d5db ',
              borderRadius: '8px',
              minHeight: '48px',
              height: '48px',
              boxShadow: 'none',
              backgroundColor: '#FFFFFF',
              '&:hover': {
                borderColor: '#9ca3af',
                '&.css-1dimb5e-singleValue': {
                  color: '#101828',
                },
              },
              '&:focus-within': {
                borderColor: '#9ca3af',
                '& .css-1dimb5e-singleValue': {
                  color: '#101828',
                },
              },
            }),
            valueContainer: (provided) => ({
              ...provided,
              padding: '8px 14px',
              height: '38px',
            }),
            input: (provided) => ({
              ...provided,
              border: 'none !important',
              outline: 'none !important',
              boxShadow: 'none !important',
              margin: 0,
              padding: 0,
              background: 'transparent !important',
              '&:focus': {
                border: 'none !important',
                outline: 'none !important',
                boxShadow: 'none !important',
              },
            }),
            placeholder: (provided) => ({
              ...provided,
              color: '#9ca3af',
              fontSize: '14px',
            }),
            singleValue: (provided) => ({
              ...provided,
              color: '#374151',
              fontSize: '14px',
            }),
            indicatorSeparator: () => ({
              display: 'none',
            }),
            dropdownIndicator: (provided) => ({
              ...provided,
              color: '#6b7280',
              padding: '8px',
            }),
          }}
        />
      </>
    );
  }
}

export default CustomSelect;
