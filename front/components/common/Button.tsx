import React, { HTMLAttributes } from 'react';

type ButtonProps = {
  text: string;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
};

/**
 * Button component
 *
 * @param {string} text - Text to display on the button
 * @param {() => void} onClick - Function to call when the button is clicked
 * @param {string} fontSize - Font size of the button, unit in rem Ex. 1.5rem
 * @param {boolean} primary - Whether the button is primary or not
 * @param {boolean} danger - Whether the button is danger or not
 *
 */
class Button extends React.Component<ButtonProps, {}> {
  render() {
    return (
      <button
        className={`
      rounded-xl px-4 py-4  
      ${
        this.props.primary
          ? 'bg-primary text-white'
          : this.props.danger
          ? 'border-2 border-light-red text-light-red'
          : 'border-2 border-secondary text-secondary'
      } 
      text-sm font-normal 
      `}
        onClick={this.props.onClick}
      >
        {this.props.text}
      </button>
    );
  }
}

export default Button;
