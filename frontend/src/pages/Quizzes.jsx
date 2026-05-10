import React, { useState, useEffect } from 'react';
import { HiAcademicCap, HiTrash, HiDocumentText } from 'react-icons/hi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { quizService } from '../services/quizzes';
import { documentService } from '../services/documents';
import { useToast } from '../hooks/useToast';

const Quizzes = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { if (selectedDoc) loadQuizzes(selectedDoc); }, [selectedDoc]);

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

  const loadQuizzes = async (docId) => {
    try {
      const qs = await quizService.getDocumentQuizzes(docId);
      setQuizzes(qs);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    const toastId = showLoading('Generating quiz with AI... this may take a minute');
    setGenerating(true);
    try {
      const quiz = await quizService.createQuiz(selectedDoc, numQuestions, difficulty);
      dismissToast(toastId);
      showSuccess('Quiz generated successfully!');
      setQuizzes(prev => [quiz, ...prev]);
      setShowModal(false);
    } catch (error) {
      dismissToast(toastId);
      showError(error.response?.data?.detail || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId);
      showSuccess('Quiz deleted');
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (error) {
      showError('Failed to delete quiz');
    }
  };

  const difficultyColors = { easy: 'text-green-400 bg-green-500/10', medium: 'text-yellow-400 bg-yellow-500/10', hard: 'text-red-400 bg-red-500/10' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quizzes</h1>
          <p className="text-dark-400 mt-1">Test your knowledge with AI-generated quizzes</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={documents.length === 0}>
          Generate Quiz
        </Button>
      </div>

      {documents.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {documents.map(doc => (
            <button key={doc.id} onClick={() => setSelectedDoc(doc.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDoc === doc.id
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
              }`}>
              {doc.original_filename}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonList count={3} />
      ) : documents.length === 0 ? (
        <EmptyState icon={HiDocumentText} title="No documents" description="Upload a PDF first to generate quizzes" />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={HiAcademicCap}
          title="No quizzes yet"
          description="Generate your first quiz from a document"
          action={<Button onClick={() => setShowModal(true)}>Generate Quiz</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(quiz => (
            <Card key={quiz.id} padding="p-5" hover={false}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <HiAcademicCap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{quiz.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${difficultyColors[quiz.difficulty]}`}>
                        {quiz.difficulty}
                      </span>
                      <span className="text-xs text-dark-400">{quiz.total_questions} questions</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(quiz.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <HiTrash className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => { setSelectedQuiz(quiz); setShowQuizModal(true); }} className="w-full">
                View Questions
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate Quiz">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Number of Questions: <span className="text-primary-400">{numQuestions}</span>
            </label>
            <input type="range" min="1" max="20" value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-dark-500 mt-1">
              <span>1</span><span>20</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                    difficulty === d
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                      : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-dark-200'
                  }`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleGenerate} loading={generating}>Generate</Button>
          </div>
        </div>
      </Modal>

      {/* Quiz View Modal */}
      <Modal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} title={selectedQuiz?.title || 'Quiz'} size="lg">
        {selectedQuiz && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {selectedQuiz.questions?.map((q, i) => (
              <div key={q.id} className="bg-dark-700/50 rounded-xl p-4">
                <p className="font-medium text-white mb-3">{i + 1}. {q.question_text}</p>
                <div className="space-y-1">
                  {q.options?.map((opt, j) => (
                    <div key={j} className={`px-3 py-2 rounded-lg text-sm ${
                      opt.startsWith(q.correct_answer)
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'text-dark-300'
                    }`}>
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-dark-400 mt-3 italic border-t border-dark-600 pt-2">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Quizzes;
