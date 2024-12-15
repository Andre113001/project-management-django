import { useState, cloneElement } from 'react';

const Modal = ({ children, trigger, onOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (onOpen) onOpen(); // Execute any logic before opening
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      {cloneElement(trigger, { onClick: handleOpen })}
      {isOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='relative phone:h-screen desktop:h-auto bg-white p-20 desktop:rounded-xl shadow-lg w-full max-w-xl'>
            <button
              onClick={handleClose}
              className='absolute text-[40px] top-[-15px] right-2 text-gray-500 hover:text-gray-700'
            >
              &times;
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
