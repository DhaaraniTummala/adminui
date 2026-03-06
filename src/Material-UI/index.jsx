import {
  BasicTextFields,
  TextFieldSizes,
  ColorTextFields,
  ValidationTextFields,
  InputWithIcon,
  FormPropsTextFields,
} from './MUI-components/inputs';
import {
  SelectVariants,
  MultipleSelectPlaceholder,
  SelectSmall,
  SelectOtherProps,
} from './MUI-components/select';
import {
  BasicButtons,
  TextButtons,
  IconLabelButtons,
  ButtonSizes,
  ColorButtons,
} from './MUI-components/button';

import { ColorBadge, CustomColorBadge, BadgeOverlap } from './MUI-components/badge';

import {
  Checkboxes,
  CheckboxLabels,
  IconCheckboxes,
  ControlledCheckbox,
  IndeterminateCheckbox,
  SizeCheckboxes,
  ColorCheckboxes,
} from './MUI-components/checkbox';

import {
  RadioButtonsGroup,
  RowRadioButtonsGroup,
  ColorRadioButtons,
  ErrorRadios,
} from './MUI-components/radioButton';
import { HoverRating, BasicRating } from './MUI-components/feedback';
import {
  BasicSwitches,
  SwitchLabels,
  ColorSwitches,
  CustomizedSwitches,
} from './MUI-components/switch';

import {
  ContinuousSlider,
  DiscreteSlider,
  InputSlider,
  NonLinearSlider,
  ColorSlider,
} from './MUI-components/slider';
import { SelectAllTransferList } from './MUI-components/transferList';
import {
  VerticalToggleButtons,
  ToggleButtonNotEmpty,
  StandaloneToggleButton,
  ColorToggleButton,
} from './MUI-components/toggleButton';

import {
  ImageAvatars,
  LetterAvatars,
  SizeAvatars,
  TotalAvatars,
  BadgeAvatars,
} from './MUI-components/avatar';

import BasicCard from './MUI-components/cards';

function MuiComponents() {
  return (
    // rendering the left-part
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, marginRight: 20, marginLeft: 20 }}>
        <h1 style={{ paddingLeft: 20, paddingTop: 20 }}>
          <b>Input Variants</b>
        </h1>
        <BasicTextFields />
        <h1 style={{ paddingLeft: 20 }}>
          <b>Input Text Sizes</b>
        </h1>
        <TextFieldSizes />
        <h1 style={{ paddingLeft: 20 }}>
          <b>Input Colors</b>
        </h1>
        <ColorTextFields />
        <h1 style={{ paddingLeft: 20 }}>
          <b>Validation</b>
        </h1>
        <ValidationTextFields />
        <b>InputWithIcon:</b>
        <InputWithIcon />
        <b>FormPropsTextFields:</b>
        <FormPropsTextFields />
        <h1 style={{ paddingLeft: 20, paddingTop: 20, paddingBottom: 20 }}>
          <b>Checkbox Variants</b>
        </h1>
        <b>Basic Checkbox:</b>
        <Checkboxes />
        <b>Label :</b>
        <CheckboxLabels />
        <b>Icon : </b>
        <IconCheckboxes />
        <b>Controlled : </b>
        <ControlledCheckbox />
        <br />
        <b>Indeterminate : </b>
        <IndeterminateCheckbox />
        <h1 style={{ paddingLeft: 20, paddingTop: 20 }}>
          <b>Checkbox Sizes</b>
        </h1>
        <SizeCheckboxes />
        <h1 style={{ paddingLeft: 20, paddingTop: 20 }}>
          <b>Checkbox Colors</b>
        </h1>
        <ColorCheckboxes />
      </div>
      {/* rendering the middle part */}
      <div style={{ flex: 2, marginRight: 20 }}>
        <h1 style={{ paddingTop: 20 }}>
          <b>SelectVariants</b>
        </h1>
        <SelectVariants />
        <h1 style={{ paddingTop: 20 }}>
          <b>MultipleSelectPlaceholder</b>
        </h1>
        <MultipleSelectPlaceholder />
        <SelectSmall />
        <h1 style={{ paddingTop: 20 }}>
          <b>SelectOtherProps</b>
        </h1>
        <SelectOtherProps />
        <h1 style={{ paddingTop: 20 }}>
          <b>Switch Variants</b>
        </h1>
        <b>Basic Switch: </b>
        <BasicSwitches />
        <b>Label: </b>
        <SwitchLabels />
        <h1 style={{ paddingTop: 20 }}>
          <b>Switch Colors</b>
        </h1>
        <ColorSwitches />
        <h1 style={{ paddingTop: 20 }}>
          <b>Switch Customized :</b>
        </h1>
        <CustomizedSwitches />
        <h1 style={{ paddingTop: 20 }}>
          <b>Slider Variants :</b>
        </h1>
        <b>Continuous Slider: </b>
        <ContinuousSlider />
        <b>Discrete Slider: </b>
        <DiscreteSlider />
        <b>Input Slider: </b>
        <InputSlider />
        <b>Non-Linear Slider: </b>
        <NonLinearSlider />
        <h1 style={{ paddingTop: 20 }}>
          <b>Slider Color :</b>
        </h1>
        <ColorSlider />
        <h1 style={{ paddingTop: 20 }}>
          <b>Toggle Button :</b>
        </h1>
        <b> VerticalToggleButtons: </b> <br />
        <div>
          <VerticalToggleButtons />
        </div>
        <b>ToggleButtonNotEmpty :</b> <br />
        <ToggleButtonNotEmpty />
        <b>StandaloneToggleButton :</b>
        <StandaloneToggleButton />
        <h1 style={{ paddingTop: 20 }}>
          <b>Toggle Button Color :</b>
        </h1>
        <ColorToggleButton />
        <h1 style={{ paddingLeft: 20, paddingTop: 20 }}>
          <b>Enhanced Transfer List :</b>
        </h1>
        <br />
        <div>
          <SelectAllTransferList />
        </div>
      </div>
      {/* rendering the right-side part */}
      <div style={{ flex: 1, marginRight: 20 }}>
        <h1 style={{ paddingTop: 20 }}>
          <b>Button Variants</b>
        </h1>
        <br />

        <BasicButtons />
        <br />
        <TextButtons />
        <br />
        <IconLabelButtons />
        <br />

        <h1>
          <b>Button Sizes</b>
        </h1>
        <br />
        <ButtonSizes />
        <br />

        <h1>
          <b>Button Colors</b>
        </h1>
        <br />
        <ColorButtons />
        <br />
        <div>
          <h1>
            <b>Badge Colors</b>
          </h1>
          <br />
          <ColorBadge /> <br />
          <CustomColorBadge />
          <br />
          <h1>
            <b>Badge Overlap</b>
          </h1>
          <br />
          <BadgeOverlap />
        </div>

        <h1 style={{ paddingTop: 20 }}>
          <b>Radio Button Variants</b>
        </h1>
        <b>Radio group : </b>
        <br />
        <RadioButtonsGroup />

        <RowRadioButtonsGroup />

        <b>Error Check : </b>
        <ErrorRadios />

        <h1 style={{ paddingTop: 20 }}>
          <b>Radio Button Colors</b>
        </h1>
        <ColorRadioButtons />

        <h1 style={{ paddingTop: 20 }}>
          <b>Feedback Variants</b>
        </h1>
        <b>Hover feedback : </b>
        <HoverRating />

        <b>Basic feedback : </b>
        <BasicRating />

        <h1 style={{ paddingTop: 20 }}>
          <b>Avatar Variants</b>
        </h1>
        <b>Image Avatars : </b>
        <ImageAvatars />

        <b>Letter Avatars : </b>
        <LetterAvatars />

        <b>Size Avatars : </b>
        <SizeAvatars />

        <b>Total Avatars : </b>
        <div style={{ paddingRight: 180 }}>
          <TotalAvatars />
        </div>

        <b>Badge Avatars : </b>
        <BadgeAvatars />
      </div>
    </div>
  );
}

export default MuiComponents;
