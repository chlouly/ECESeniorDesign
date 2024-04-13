import React, { useRef, useState } from 'react';
import { FiUpload } from 'react-icons/fi';


const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setName(selectedFile.name);
        } else {
            setFile(null);
            setName('');
        }
    };

    const handleUpload = () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                console.log('File content:', text);

                const formData = new FormData();
                formData.append('file', file);
                formData.append('name', name);

                fetch('/upload', { method: 'POST', body: formData })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log('Response:', data);
                        alert('File uploaded successfully');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        alert('An error occurred while uploading the file');
                    });
            };
            reader.readAsText(file);
        } else {
            console.log('No file selected');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-100 p-4">
            <div className="text-3xl font-bold text-blue-800 mb-8">Upload Page</div>
            <div className="mb-4">
                {name && (
                    <div className="bg-white border border-gray-300 rounded-md px-4 py-2">
                        Selected File: {name}
                    </div>
                )}
            </div>
            <div className='space-y-4 w-full max-w-md'>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button 
                className="flex items-center justify-center w-full max-w-md px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                onClick={() => fileInputRef.current.click()}
            >
                Select File
            </button>
            <button 
                className="flex items-center justify-center w-full max-w-md px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                onClick={handleUpload}
            >
                <FiUpload className="mr-2" />
                Upload
            </button>
            </div>
        </div>
    );
};

export default UploadPage;
