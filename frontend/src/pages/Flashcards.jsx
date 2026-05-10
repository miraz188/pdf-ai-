import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiViewGrid, HiTrash, HiArrowRight, HiArrowLeft, HiX } from 'react-icons/hi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { flashcardService } from '../services/flashcards';
import { documentService } from '../services/documents';
import { useToast } from '../hooks/useToast';

const Flashcards = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [numCards, setNumCards] = useState(10);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { if (selectedDoc) loadDecks(selectedDoc); }, [selectedDoc]);

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

  const loadDecks = async (docId) => {
    try {
      const d = await flashcardService.getDocumentDecks(docId);
      setDecks(d);
    } catch (error) {
      console.error('Error loading decks:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    const toastId = showLoading('Generating flashcards with AI... this may take a minute');
    setGenerating(true);
    try {
      const deck = await flashcardService.createDeck(selectedDoc, numCards);
      dismissToast(toastId);
      showSuccess('Flashcard deck generated!');
      setDecks(prev => [deck, ...prev]);
    } catch (error) {
      dismissToast(toastId);
      showError(error.response?.data?.detail || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (deckId) => {
    try {
      await flashcardService.deleteDeck(deckId);
      showSuccess('Deck deleted');
      setDecks(prev => prev.filter(d => d.id !== deckId));
    } catch (error) {
      showError('Failed to delete deck');
    }
  };

  const startStudy = async (deck) => {
    try {
      const fullDeck = await flashcardService.getDeck(deck.id);
      setCurrentDeck(fullDeck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowStudyMode(true);
    } catch (error) {
      showError('Failed to load flashcards');
    }
  };

  const nextCard = () => {
    if (currentDeck && currentCardIndex < currentDeck.flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
    }
  };

  const currentCard = currentDeck?.flashcards?.[currentCardIndex];
  const progress = currentDeck ? ((currentCardIndex + 1) / currentDeck.flashcards.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Flashcards</h1>
          <p className="text-dark-400 mt-1">Study with AI-generated flashcards</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <input type="range" min="5" max="30" value={numCards}
              onChange={(e) => setNumCards(parseInt(e.target.value))}
              className="w-24 accent-primary-500" />
            <span className="text-sm text-dark-400 w-16">{numCards} cards</span>
          </div>
          <Button onClick={handleGenerate} loading={generating} disabled={documents.length === 0}>
            Generate Deck
          </Button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {documents.map(doc => (
            <button key={doc.id} onClick={() => setSelectedDoc(doc.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDoc === doc.id
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-dark-200'
              }`}>
              {doc.original_filename}
            </button>
          ))}
        </div>
      )}

      {/* Study Mode Overlay */}
      <AnimatePresence>
        {showStudyMode && currentDeck && currentCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-dark-950/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="max-w-xl w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-white">{currentDeck.title}</h2>
                  <p className="text-xs text-dark-400">{currentCardIndex + 1} / {currentDeck.flashcards.length}</p>
                </div>
                <button onClick={() => setShowStudyMode(false)}
                  className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                  <HiX className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-dark-800 rounded-full h-1.5 mb-6">
                <motion.div
                  className="bg-primary-500 h-1.5 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Card */}
              <div
                className="relative cursor-pointer select-none"
                style={{ perspective: '1000px', minHeight: '280px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '280px' }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-dark-800 border border-dark-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                    style={{ backfaceVisibility: 'hidden' }}>
                    {currentCard.category && (
                      <span className="text-xs text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full mb-4">
                        {currentCard.category}
                      </span>
                    )}
                    <p className="text-xl font-medium text-white">{currentCard.front_text}</p>
                    {currentCard.hint && (
                      <p className="text-sm text-yellow-400 mt-4">💡 Hint: {currentCard.hint}</p>
                    )}
                    <p className="text-xs text-dark-500 mt-6">Tap to reveal answer</p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 bg-primary-900/30 border border-primary-700/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <p className="text-lg text-dark-100 leading-relaxed">{currentCard.back_text}</p>
                    <p className="text-xs text-dark-500 mt-6">Tap to see question</p>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-between mt-6 gap-4">
                <Button variant="secondary" onClick={prevCard} disabled={currentCardIndex === 0} icon={HiArrowLeft}>
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={nextCard}
                  disabled={currentCardIndex === currentDeck.flashcards.length - 1}
                  icon={HiArrowRight}
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <SkeletonList count={3} />
      ) : decks.length === 0 ? (
        <EmptyState
          icon={HiViewGrid}
          title="No flashcard decks"
          description="Generate your first deck from a document"
          action={<Button onClick={handleGenerate} loading={generating} disabled={documents.length === 0}>Generate Deck</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map(deck => (
            <Card key={deck.id} padding="p-5" hover={false}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <HiViewGrid className="w-5 h-5 text-purple-400" />
                </div>
                <button onClick={() => handleDelete(deck.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <HiTrash className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <h3 className="font-medium text-white mb-1 truncate">{deck.title}</h3>
              <p className="text-sm text-dark-400 mb-4">{deck.card_count} cards · {new Date(deck.created_at).toLocaleDateString()}</p>
              <Button variant="primary" size="sm" onClick={() => startStudy(deck)} className="w-full">
                Study Now
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
