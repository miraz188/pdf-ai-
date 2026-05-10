import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChatAlt2, HiPaperAirplane, HiPlus, HiTrash } from 'react-icons/hi';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { chatService } from '../services/chat';
import { documentService } from '../services/documents';
import { useToast } from '../hooks/useToast';

const Chat = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { if (selectedDoc) loadSessions(selectedDoc); }, [selectedDoc]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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

  const loadSessions = async (docId) => {
    try {
      const sess = await chatService.getDocumentSessions(docId);
      setSessions(sess);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createSession = async () => {
    if (!selectedDoc) return;
    try {
      const session = await chatService.createSession(selectedDoc);
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
      showSuccess('New chat session created');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      showError('Failed to create session');
    }
  };

  const loadSession = async (session) => {
    try {
      const fullSession = await chatService.getSession(session.id);
      setCurrentSession(fullSession);
      setMessages(fullSession.messages || []);
    } catch (error) {
      showError('Failed to load session');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentSession || sending) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMsg }]);
    setSending(true);

    try {
      const response = await chatService.sendMessage(currentSession.id, userMsg);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      showError(error.response?.data?.detail || 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputMessage(userMsg);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId);
      showSuccess('Session deleted');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      showError('Failed to delete session');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sessions Sidebar */}
      <div className="w-64 flex-shrink-0 bg-dark-900 rounded-xl border border-dark-800 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-dark-800 space-y-2">
          <select
            value={selectedDoc || ''}
            onChange={(e) => setSelectedDoc(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-200 text-sm focus:outline-none focus:border-primary-500/50"
          >
            {documents.length === 0 && <option value="">No documents</option>}
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.original_filename}</option>
            ))}
          </select>
          <Button onClick={createSession} className="w-full" size="sm" icon={HiPlus} disabled={!selectedDoc}>
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-dark-500 text-center py-4">No sessions yet</p>
          )}
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => loadSession(session)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                currentSession?.id === session.id
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
              }`}
            >
              <span className="truncate flex-1">{session.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded ml-1 flex-shrink-0"
              >
                <HiTrash className="w-3 h-3 text-red-400" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-dark-900 rounded-xl border border-dark-800 flex flex-col overflow-hidden">
        {!currentSession ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={HiChatAlt2}
              title="No active chat"
              description={documents.length === 0 ? "Upload a PDF document first, then start chatting" : "Select a session or create a new one to chat with your document"}
              action={documents.length > 0 ? <Button onClick={createSession} icon={HiPlus}>Start New Chat</Button> : null}
            />
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-dark-800 flex-shrink-0">
              <h2 className="font-semibold text-white text-sm truncate">{currentSession.title}</h2>
              <p className="text-xs text-dark-400">{messages.length} messages</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-dark-500 text-sm">Ask a question about the document to get started</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary-600/20 text-primary-100 rounded-br-sm'
                        : 'bg-dark-800 text-dark-200 rounded-bl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.role === 'assistant' && msg.tokens_used > 0 && (
                        <p className="text-xs text-dark-500 mt-1.5">{msg.tokens_used} tokens</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-dark-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-dark-800 flex gap-3 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about the document... (Enter to send)"
                rows={1}
                className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200
                           placeholder-dark-400 text-sm resize-none
                           focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
                disabled={sending}
                style={{ minHeight: '42px', maxHeight: '120px' }}
              />
              <Button
                type="submit"
                icon={HiPaperAirplane}
                disabled={sending || !inputMessage.trim()}
                className="self-end flex-shrink-0"
              >
                Send
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
