import { forwardRef } from 'react';

const TextArea = forwardRef(({ title, variant = 'default', className, ...props }, ref) => {
  const baseStyle = 'w-full bg-secondary p-5 rounded-md transition ease-in-out focus:outline-none';

  const variantStyles = {
    default: 'focus:ring focus:ring-gray-300',
    alert: 'ring ring-red-400'
  };

  const combinedClasses = `${baseStyle} ${variantStyles[variant]} ${className}`;

  return (
    <div>
      <h1 className='text-sm font-bold'>{title}</h1>
      <textarea {...props} ref={ref} className={combinedClasses} rows="4" />
    </div>
  );
});

export default TextArea;
