export const fetchPDF = async (file) => {
    try {
        // Check if the filePath is provided
        if (!file) {
            throw new Error('File is required');
        }

        // Construct the URL to fetch the PDF
        const url = `/api/file?filePath=${encodeURIComponent(file)}`;

        // Send the GET request
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch PDF');
        }

        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a URL for the PDF blob
        const pdfUrl = URL.createObjectURL(blob);

        return pdfUrl; // Return the PDF URL to be used in the application
    } catch (error) {
        console.error('Error in fetchPDF function:', error);
        throw error;
    }
};

export const uploadPDF = async (file, path) => {
    try {
        // Create a FormData object
        const formData = new FormData();

        // Append the file and the additional field
        formData.append('file', file); // Append the file with the key 'pdf'
        formData.append('file_path', path); // Append the file path with the key 'file_path'

        // Check if the file is a PDF
        if (file.type !== 'application/pdf') {
            throw new Error('Only PDF files are allowed');
        }

        // Send the POST request
        const response = await fetch('/api/file/upload', {
            method: 'POST',
            body: formData, // Send the FormData object as the request body
        });

        if (!response.ok) {
            throw new Error('Failed to upload PDF');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error in uploadPDF function:', error);
        throw error;
    }
};
