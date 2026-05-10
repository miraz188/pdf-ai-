import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { HiUpload, HiDocumentText } from 'react-icons/hi';

const FileUpload = ({ onUpload, uploading = false }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 52428800,
    disabled: uploading
  });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
        ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-800/50'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center">
        {uploading ? (
          <>
            <div className="w-20 h-20 mb-4">
              <svg className="animate-spin h-full w-full text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-primary-400">Processing PDF...</p>
            <p className="text-dark-400 mt-2">Extracting text and analyzing content</p>
          </>
        ) : isDragActive ? (
          <>
            <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
              <HiDocumentText className="w-10 h-10 text-primary-500" />
            </div>
            <p className="text-lg font-medium text-primary-400">Drop your PDF here</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mb-4">
              <HiUpload className="w-10 h-10 text-dark-400" />
            </div>
            <p className="text-lg font-medium text-dark-300">Drop your PDF here or click to browse</p>
            <p className="text-dark-400 mt-2">Supports PDF files up to 50MB</p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FileUpload;
