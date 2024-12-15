export const fetchImage = async (filePath) => {
    const res = await fetch(
        `/api/img?filePath=${filePath}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )

    const pic = await res.blob()
    

    return URL.createObjectURL(pic);
}

export const uploadImage = async (file, path) => {
    try {
    // Create a FormData object
        const formData = new FormData();

        // Append the file and the additional field
        formData.append('image', file); // Append the file with the key 'image'
        formData.append('file_path', path); // Append the file path with the key 'file_path'   

        // Send the POST request
        const response = await fetch('/api/img/upload', {
            method: 'POST',
            body: formData, // Send the FormData object as the request body
        });
    
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
    
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error in uploadImage function:', error);
        throw error;
    }
};
  

