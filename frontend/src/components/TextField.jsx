import { forwardRef } from 'react';

const TextField = forwardRef(({ title, variant = 'default', className, ...props }, ref) => {
  const baseStyle = 'w-full h-10 bg-secondary p-5 rounded-md transition ease-in-out focus:outline-none';

  const variantStyles = {
    default: 'focus:ring focus:ring-gray-300',
    alert: 'ring ring-red-400',
  };

  const combinedClasses = `${baseStyle} ${variantStyles[variant]} ${className}`;

  return (
    <div className='w-full'>
      <h1 className='text-md font-bold'>{title}</h1>
      <input {...props} ref={ref} className={combinedClasses} />
    </div>
  );
});

export default TextField;
