import React from "react";
import CircularProgress from '@mui/material/CircularProgress';

const Button = ({ className = '', children, variant = "default", isLoading = false, ...props }) => {
  const baseStyle =
    "w-full max-w-full flex justify-center items-center gap-3 font-bold rounded-md p-3 cursor-pointer focus:outline-none transition ease-in-out";

  const variantStyles = {
    default: "bg-primary text-white hover:bg-[#49b4c9] focus:ring focus:ring-primary",
    "default-outline": "border-2 text-primary border-primary bg-transparent hover:bg-primary hover:text-white focus:ring focus:ring-primary",
    secondary: "bg-secondary text-black hover:bg-[#c0c0c0] focus:ring focus:ring-gray-400",
    warning: "bg-red-400 text-white hover:bg-[#ea6a6a] focus:ring focus:ring-red-300",
    disabled: "bg-secondary text-gray-300 cursor-not-allowed",
  };

  const combinedClasses = `${baseStyle} ${variantStyles[variant]} ${className}`;

  return (
    <div className="w-full">
      <button disabled={isLoading} className={combinedClasses} {...props}>
        {isLoading && <CircularProgress size={20} color="inherit" />}
        {children}
      </button>
    </div>
  );
};

export default Button;
