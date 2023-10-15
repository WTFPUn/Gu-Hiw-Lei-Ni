import React, { Component } from 'react';

interface ImageUploadFormProps {
  imageUrl?: string;
  onImageChange?: (file: File) => void;
}

interface ImageUploadFormState {
  imageFile: File | null;
  imageUrl: string;
}

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

  handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          id="profile-image-upload"
          type="file"
          accept="image/*"
          onChange={this.handleImageChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
}

export default ImageUploadForm;
