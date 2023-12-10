import { get_auth } from '@/utils/auth';
import { classNames } from '@/utils/style';
import React from 'react';

type TextFormProps = {
  text?: string;
  placeholder?: string;
  ref?: (ref: TextForm) => void;
  width?: string;
  required?: boolean;
  password?: boolean;
  name?: string;
  value?: string;
  min?: string;
  max?: string;
  number?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  'data-test'?: string;
};

type TextFormState = {
  text: string;
};

/**
 * TextForm component
 *
 * @param {string} text - Text to display on the button
 * @param {string} placeholder - Placeholder text
 * @param {(ref: TextForm) => void} ref - Reference to the component
 * @param {string} width - Width of the text form, unit in rem Ex. w-[1.5rem]
 * @param {string} height - Height of the text form, unit in rem Ex. h-[1.5rem]
 * @param {boolean} required - Whether the text form is required or not
 * @param {boolean} password - Whether the text form is password or not
 * @param {string} name - Name of the text form
 * @param {string} value - Value of the text form
 * @param {string} min - Minimum value of the text form
 * @param {string} max - Maximum value of the text form
 * @param {boolean} number - Whether the text form is number or not
 * @param {boolean} disabled - Whether the text form is disabled or not
 * @param {string} defaultValue - Default value of the text form
 * @param {string} data-test - Test id for testing
 *
 */

class TextForm extends React.Component<TextFormProps, TextFormState> {
  constructor(props: TextFormProps) {
    super(props);
    this.state = {
      text: props.value ?? props.defaultValue ?? '',
    };
  }

  public get_value() {
    return this.state.text;
  }

  public set_value(value: string) {
    this.setState((state: TextFormState) => {
      const newState: TextFormState = {
        ...state,
        text: value,
      };
      return newState;
    });
  }

  render() {
    const elems: React.ReactElement[] = [];
    if (this.props.text) {
      elems.push(
        <div key={'text' + this.props.text} className="text-md font-medium">
          {this.props.text}{' '}
          {this.props.required && (
            <span className="text-red-500 font-normal">*</span>
          )}
        </div>,
      );
    }
    elems.push(
      <input
        key={'input' + this.props.text}
        type={
          this.props.password
            ? 'password'
            : this.props.number
            ? 'number'
            : 'text'
        }
        className={
          'border-2 border-secondary placeholder:text-light-gray rounded-xl px-4 py-3 mt-2  ' +
          (this.props.width ? this.props.width + ' ' : '') +
          (this.props.disabled ? ' bg-gray-300' : ' bg-transparent')
        }
        required={this.props.required ? this.props.required : false}
        placeholder={this.props.placeholder ? this.props.placeholder : ''}
        value={this.props.value ?? this.state.text}
        name={this.props.name}
        min={this.props.min}
        disabled={this.props.disabled}
        max={this.props.max}
        data-test={this.props['data-test']}
        onChange={e => {
          this.setState((state: TextFormState) => {
            const newState: TextFormState = {
              ...state,
              text: e.target.value,
            };
            return newState;
          });
        }}
      />,
    );

    return <div className="flex flex-col ">{elems}</div>;
  }
}

export default TextForm;
