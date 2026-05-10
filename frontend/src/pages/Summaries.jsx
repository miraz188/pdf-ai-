import React, { useState, useEffect } from 'react';
import { HiLightBulb, HiTrash, HiDocumentText } from 'react-icons/hi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { summaryService } from '../services/summaries';
import { documentService } from '../services/documents';
import { useToast } from '../hooks/useToast';

const summaryTypes = [
  { value: 'short', label: 'Short' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'bullet_points', label: 'Bullet Points' },
  { value: 'key_concepts', label: 'Key Concepts' },
];

const Summaries = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [summaryType, setSummaryType] = useState('short');
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { if (selectedDoc) loadSummaries(selectedDoc); }, [selectedDoc]);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
      if (docs.length > 0) setSelectedDoc(docs[0].id);
    } catch (error) {
      showError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadSummaries = async (docId) => {
    try {
      const sums = await summaryService.getDocumentSummaries(docId);
      setSummaries(sums);
    } catch (error) {
      console.error('Error loading summaries:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    const toastId = showLoading('Generating summary with AI... this may take a minute');
    setGenerating(true);
    try {
      const summary = await summaryService.createSummary(selectedDoc, summaryType);
      dismissToast(toastId);
      showSuccess('Summary generated successfully!');
      setSummaries(prev => [summary, ...prev]);
      setShowModal(false);
    } catch (error) {
      dismissToast(toastId);
      showError(error.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (summaryId) => {
    try {
      await summaryService.deleteSummary(summaryId);
      showSuccess('Summary deleted');
      setSummaries(prev => prev.filter(s => s.id !== summaryId));
    } catch (error) {
      showError('Failed to delete summary');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Summaries</h1>
          <p className="text-dark-400 mt-1">AI-generated document summaries</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={documents.length === 0}>
          Generate Summary
        </Button>
      </div>

      {documents.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDoc === doc.id
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
              }`}
            >
              {doc.original_filename}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonList count={3} />
      ) : documents.length === 0 ? (
        <EmptyState icon={HiDocumentText} title="No documents available" description="Upload a PDF document first to generate summaries" />
      ) : summaries.length === 0 ? (
        <EmptyState
          icon={HiLightBulb}
          title="No summaries yet"
          description="Generate your first AI-powered summary"
          action={<Button onClick={() => setShowModal(true)}>Generate Summary</Button>}
        />
      ) : (
        <div className="space-y-4">
          {summaries.map(summary => (
            <Card key={summary.id} padding="p-6" hover={false}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <HiLightBulb className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-dark-200 capitalize">
                      {summary.summary_type.replace('_', ' ')} Summary
                    </span>
                    <p className="text-xs text-dark-500">{summary.word_count} words · {new Date(summary.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(summary.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <HiTrash className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <p className="text-dark-200 whitespace-pre-wrap leading-relaxed">{summary.content}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate Summary">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Summary Type</label>
            <div className="grid grid-cols-2 gap-2">
              {summaryTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSummaryType(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    summaryType === type.value
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                      : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleGenerate} loading={generating}>Generate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Summaries;
