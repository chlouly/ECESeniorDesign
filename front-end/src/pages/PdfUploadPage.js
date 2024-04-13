import React, { useRef } from 'react';
import { FiUpload } from 'react-icons/fi';

const UploadPage = () => {
    const fileInputRef = useRef(null);

    const handleUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        console.log('File uploaded:', file);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-100 p-4">
            <div className="text-3xl font-bold text-blue-800 mb-8">Upload Page</div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button 
                className="flex items-center justify-center w-full max-w-md px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                onClick={handleUpload}
            >
                <FiUpload className="mr-2" />
                Upload
            </button>
        </div>
    );
};

export default UploadPage;
