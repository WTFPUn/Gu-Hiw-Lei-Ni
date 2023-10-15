import React from 'react';

type TextFormProps = {
  text?: string;
  placeholder?: string;
  ref?: (ref: TextForm) => void;
  width?: string;
  required?: boolean;
  password?: boolean;
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
 *
 */

class TextForm extends React.Component<TextFormProps, TextFormState> {
  constructor(props: TextFormProps) {
    super(props);
    this.state = {
      text: '',
    };
  }

  public get_value() {
    return this.state.text;
  }

  render() {
    const elems: React.ReactElement[] = [];
    if (this.props.text) {
      elems.push(
        <div key="text" className="text-md">
          {this.props.text}{' '}
          {this.props.required && <span className="text-red-500">*</span>}
        </div>,
      );
    }
    elems.push(
      <input
        type={this.props.password ? 'password' : 'text'}
        className={
          'border-2 border-secondary bg-transparent placeholder:text-gray rounded-xl px-4 py-2 mt-2  ' +
          (this.props.width ? this.props.width + ' ' : '')
        }
        required={this.props.required ? this.props.required : false}
        placeholder={this.props.placeholder ? this.props.placeholder : ''}
        value={this.state.text}
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
