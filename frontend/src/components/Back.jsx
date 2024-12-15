import React from 'react';
import { useNavigate } from 'react-router-dom';

const Back = ({ to, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
        if (to) {
            navigate(to);
        }
    };

    return (
        <div className='flex gap-2 items-center text-md opacity-80 cursor-pointer' onClick={handleClick}>
            <p>{`< Back`}</p>
        </div>
    );
};

export default Back;
