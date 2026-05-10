import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDocumentText, HiTrash, HiEye } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import FileUpload from '../components/ui/FileUpload';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { SkeletonList } from '../components/ui/Skeleton';
import { documentService } from '../services/documents';
import { useToast } from '../hooks/useToast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleUpload = async (file) => {
    const toastId = showLoading('Uploading and processing PDF...');
    setUploading(true);
    try {
      const result = await documentService.uploadDocument(file);
      dismissToast(toastId);
      showSuccess(`"${result.document.original_filename}" uploaded successfully!`);
      await loadDocuments();
    } catch (err) {
      dismissToast(toastId);
      showError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    try {
      await documentService.deleteDocument(documentToDelete.id);
      showSuccess('Document deleted successfully');
      setDocuments(docs => docs.filter(d => d.id !== documentToDelete.id));
    } catch (err) {
      showError('Failed to delete document');
    } finally {
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Documents</h1>
          <p className="text-dark-400 mt-1">Upload and manage your PDF documents</p>
        </div>
        <span className="text-sm text-dark-400">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="max-w-2xl">
        <FileUpload onUpload={handleUpload} uploading={uploading} />
      </div>

      {loading ? (
        <SkeletonList count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadDocuments} />
      ) : documents.length === 0 && !uploading ? (
        <EmptyState
          icon={HiDocumentText}
          title="No documents uploaded"
          description="Upload your first PDF to get started with AI-powered learning"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card padding="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                      <HiDocumentText className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {}}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                        title="View document"
                      >
                        <HiEye className="w-4 h-4 text-dark-400" />
                      </button>
                      <button
                        onClick={() => { setDocumentToDelete(doc); setDeleteModalOpen(true); }}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <HiTrash className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-medium text-white mb-2 truncate">{doc.original_filename}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-dark-400">
                      <span>Pages</span>
                      <span className="text-dark-300">{doc.page_count}</span>
                    </div>
                    <div className="flex justify-between text-dark-400">
                      <span>Size</span>
                      <span className="text-dark-300">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between text-dark-400">
                      <span>Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        doc.status === 'completed'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-dark-400">
                      <span>Uploaded</span>
                      <span className="text-dark-300">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Document" size="sm">
        <p className="text-dark-300 mb-2">Are you sure you want to delete this document?</p>
        <p className="text-dark-400 text-sm mb-6">"{documentToDelete?.original_filename}"</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Documents;
