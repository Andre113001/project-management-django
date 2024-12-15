import React, { useState } from 'react';

const UploadImage = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      onImageSelected(file);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      onImageSelected(imageUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    if (selectedImage) {
      // If an image is already selected, clicking removes the image
      setSelectedImage(null);
    } else {
      // If no image is selected, trigger the file input
      document.getElementById('imageInput').click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative w-full h-64 border-2 border-dashed rounded-xl overflow-hidden border-gray-400 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-primary"
        onDrop={handleImageDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        {selectedImage ? (
          <img src={selectedImage} alt="Selected" className="h-full w-full object-cover" />
        ) : (
          <p className="text-gray-500 text-center">Drag & drop an image here or click to upload</p>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="imageInput"
      />
    </div>
  );
};

export default UploadImage;
