import React from 'react'

const SearchField = ({...props}) => {
  return (
    <div>
        <input {...props} placeholder='Search'  className='w-72 h-10 bg-white p-5 rounded-md transition ease-in-out focus:outline-none focus:ring focus:ring-gray-300'/>
    </div>
  )
}

export default SearchField
