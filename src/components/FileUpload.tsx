'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
}

export default function FileUpload({ onFileSelect, onClose, isOpen }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (acceptedTypes.includes(file.type)) {
        const newFile: UploadedFile = {
          file,
          status: 'uploading'
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.file === file 
                  ? { ...f, preview: e.target?.result as string, status: 'success' }
                  : f
              )
            );
          };
          reader.readAsDataURL(file);
        } else {
          // Simulate upload for non-image files
          setTimeout(() => {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.file === file 
                  ? { ...f, status: 'success' }
                  : f
              )
            );
          }, 1000);
        }

        setUploadedFiles(prev => [...prev, newFile]);
        onFileSelect(file);
      }
    });
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/95 backdrop-blur-lg border border-white/30 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload File
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Upload Area */}
              <div className="p-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 transition-all duration-300 hover:scale-110 hover:text-blue-500" />
                  <p className="text-gray-900 mb-2">
                    Drag and drop files here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-500 hover:text-blue-600 underline transition-all duration-300 hover:scale-105"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: Images, PDF, Word, Text files
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 cursor-pointer"
                      >
                        {/* File Preview/Icon */}
                        <div className="w-10 h-10 flex-shrink-0">
                          {uploadedFile.preview ? (
                            <img
                              src={uploadedFile.preview}
                              alt={uploadedFile.file.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <File className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(uploadedFile.file.size)}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          {uploadedFile.status === 'uploading' && (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          )}
                          {uploadedFile.status === 'success' && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                          {uploadedFile.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          
                          <button
                            onClick={() => removeFile(uploadedFile.file)}
                            className="p-1 hover:bg-gray-200 rounded transition-all duration-300 hover:scale-110 hover:shadow-lg"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  disabled={uploadedFiles.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}