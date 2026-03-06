import React from 'react';
import { InputVariants, InputSizes, InputColors } from './material-tailwind-components/Input';
import {
  SelectVariants,
  SelectSizes,
  SelectValidations,
} from './material-tailwind-components/Select';
import { ButtonVariants, ButtonColors } from './material-tailwind-components/Button';
import { BadgeColors, BadgeOverlap } from './material-tailwind-components/Badge';

export function Forms() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, marginRight: 20, marginLeft: 20 }}>
          <InputVariants label="Input Variants" />
          <br />
          <br />
          <InputSizes label="Input Sizes" />
          <br />
          <br />
          <InputColors label="Input Colors" />
        </div>
        <div style={{ flex: 1, marginRight: 20 }}>
          <SelectVariants label="Select Variants" />
          <br />
          <br />
          <SelectSizes label="Select Sizes" />
          <br />
          <br />
          <SelectValidations label="Select Validations" />
        </div>
        <div style={{ flex: 1, marginRight: 20 }}>
          <ButtonVariants label="Button Variants" />
          <ButtonColors label="Button Colors" />
          <br />
          <br />
          <BadgeColors label="Badge Colors" />
          <BadgeOverlap label="Badge Overlap" />
        </div>
      </div>
    </>
  );
}
