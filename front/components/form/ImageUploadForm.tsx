import React, { Component } from 'react';

type ImageUploadFormProps = {
  imageUrl?: string;
  onImageChange?: (file: File) => void;
};

type ImageUploadFormState = {
  imageFile: File | null;
  imageUrl: string;
};

/**
 * ImageUploadForm component
 * @param {string} imageUrl - The url of the image
 * @param {(file: File) => void} onImageChange - Callback function when the image is changed
 *
 */
class ImageUploadForm extends Component<
  ImageUploadFormProps,
  ImageUploadFormState
> {
  constructor(props: ImageUploadFormProps) {
    super(props);
    this.state = {
      imageFile: null,
      imageUrl: props.imageUrl || '',
    };
  }

  handle_image_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({
          imageFile: file,
          imageUrl: reader.result as string,
        });
        if (this.props.onImageChange) this.props.onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  render() {
    const { imageUrl } = this.state;
    return (
      <div className="h-32 w-32 border-secondary border-2 rounded-full flex justify-center items-center">
        <label htmlFor="profile-image-upload">
          <img
            src={imageUrl}
            alt="Profile"
            className="rounded-full h-24 w-24"
          />
        </label>
        <input
          data-test="image-upload"
          type="file"
          accept="image/*"
          onChange={this.handle_image_change}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
}

export default ImageUploadForm;
