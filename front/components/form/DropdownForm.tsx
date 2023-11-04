import React from 'react';

type DropdownFormProps = {
  text?: string;
  placeholder?: string;
  ref?: (ref: DropdownForm) => void;
  width?: string;
  required?: boolean;
  name?: string;
  options?: {
    value: string;
    text: string;
  }[];
};

type DropdownFormState = {
  value: string;
};

class DropdownForm extends React.Component<
  DropdownFormProps,
  DropdownFormState
> {
  constructor(props: DropdownFormProps) {
    super(props);
    this.state = {
      value: '',
    };
  }

  public get_value() {
    return this.state.value;
  }

  render() {
    const elems: React.ReactElement[] = [];
    if (this.props.text) {
      elems.push(
        <div key={'text' + this.props.text} className="text-md">
          {this.props.text}{' '}
          {this.props.required && <span className="text-red-500">*</span>}
        </div>,
      );
    }
    elems.push(
      <select
        key={'dropdown' + this.props.text}
        className={
          'border-2 border-secondary bg-transparent placeholder:text-light-gray rounded-xl px-4 py-3 mt-2  ' +
          (this.props.width ? this.props.width + ' ' : '')
        }
        required={this.props.required ? this.props.required : false}
        placeholder={this.props.placeholder ? this.props.placeholder : ''}
        value={this.state.value}
        name={this.props.name}
        onChange={e => {
          this.setState((state: DropdownFormState) => {
            const newState: DropdownFormState = {
              ...state,
              value: e.target.value,
            };
            return newState;
          });
        }}
      >
        {this.props.placeholder && (
          <option value="" disabled selected hidden>
            {this.props.placeholder}
          </option>
        )}
        {this.props.options &&
          this.props.options.map((option, index) => {
            return (
              <option
                key={index + 'selectdropdown' + this.props.text}
                value={option.value}
              >
                {option.text}
              </option>
            );
          })}
      </select>,
    );

    return <div className="flex flex-col ">{elems}</div>;
  }
}

export default DropdownForm;
