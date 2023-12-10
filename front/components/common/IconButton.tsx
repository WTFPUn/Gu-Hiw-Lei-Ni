import React from 'react';

type IconButtonProps = {
  img: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  text?: string;
  'data-test'?: string;
  disabled?: boolean;
};

/**
 * IconButton component
 * @param {string} img - The image of the icon button.
 * @param {React.MouseEventHandler<HTMLElement>} onClick - The onClick event handler of the icon button.
 * @param {string} text - The text of the icon button.
 */
export default class IconButton extends React.Component<IconButtonProps> {
  constructor(props: IconButtonProps) {
    super(props);
  }
  render() {
    return (
      <button
        data-test={this.props['data-test']}
        onClick={this.props.onClick}
        className="w-24 h-18 flex flex-col justify-center items-center font-normal text-xs gap-2 text-center "
      >
        <img src={this.props.img} alt="icon-btn" className="w-16 h-16 " />
        <span>{this.props.text}</span>
      </button>
    );
  }
}
