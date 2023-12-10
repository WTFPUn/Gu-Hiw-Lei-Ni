import React, { HTMLAttributes } from 'react';

type ButtonProps = {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  primary?: boolean;
  danger?: boolean;
  'data-test'?: string;
};

/**
 * Button component
 *
 * @param {string} text - Text to display on the button
 * @param {(e) => void} onClick - Function to call when the button is clicked
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
      rounded-xl px-4 py-4 border-2   
      ${
        this.props.primary
          ? ' bg-primary text-white border-primary'
          : this.props.danger
          ? ' border-redish text-redish'
          : ' border-secondary text-secondary'
      } 
      text-sm font-normal 
      `}
        onClick={this.props.onClick}
        data-test={this.props['data-test']}
      >
        {this.props.text}
      </button>
    );
  }
}

export default Button;
