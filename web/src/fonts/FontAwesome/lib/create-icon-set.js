import React, { Component } from 'react';
import PropTypes from 'prop-types';


const DEFAULT_ICON_SIZE = 12;
const DEFAULT_ICON_COLOR = 'black';

export default function createIconSet(glyphMap, fontFamily, fontFile) {
  let fontReference = fontFamily;
  



  const IconNamePropType = PropTypes.oneOf(Object.keys(glyphMap));

  class Icon extends Component {
    static propTypes = {
      name: IconNamePropType,
      size: PropTypes.number,
      color: PropTypes.string,
      children: PropTypes.node,
      style: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    };

    static defaultProps = {
      size: DEFAULT_ICON_SIZE,
      
    };



    root = null;
    handleRef = ref => {
      this.root = ref;
    };

    render() {
      const { name, size, color, style, ...props } = this.props;

      let glyph = name ? glyphMap[name] || '?' : '';
      if (typeof glyph === 'number') {
        glyph = String.fromCharCode(glyph);
      }

      const styleDefaults = {
        fontSize: size,
        color,
      };

      const styleOverrides = {
        fontFamily: fontReference,
        fontWeight: 'normal',
        fontStyle: 'normal',
      };

      var combinedStyle = Object.assign(styleDefaults, style, styleOverrides);
      props.ref = this.handleRef;

      return <div style={combinedStyle} >{glyph}{this.props.children}</div>;
    }
  }

  const imageSourceCache = {};


  return Icon;
}
