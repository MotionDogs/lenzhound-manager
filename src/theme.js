const Colors = require('material-ui/lib/styles/colors');
const ColorManipulator = require('material-ui/lib/utils/color-manipulator');
const Spacing = require('material-ui/lib/styles/spacing');
const zIndex = require('material-ui/lib/styles/zIndex');

module.exports = {
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: Colors.pink500,
    primary2Color: Colors.pink700,
    primary3Color: Colors.lightBlack,
    accent1Color: Colors.blueA200,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey500,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.pink500,
  }
};
