import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiDocumentText, HiLightBulb, HiAcademicCap,
  HiViewGrid, HiArrowRight, HiUpload
} from 'react-icons/hi';
import Card from '../components/ui/Card';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { documentService } from '../services/documents';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const docs = await documentService.getDocuments(0, 6);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: HiDocumentText,
      label: 'Upload PDF',
      path: '/documents',
      color: 'from-blue-500/20 to-blue-600/20 text-blue-400',
      description: 'Upload and process a new document'
    },
    {
      icon: HiLightBulb,
      label: 'Get Summary',
      path: '/summaries',
      color: 'from-yellow-500/20 to-yellow-600/20 text-yellow-400',
      description: 'Generate AI summaries'
    },
    {
      icon: HiAcademicCap,
      label: 'Take Quiz',
      path: '/quizzes',
      color: 'from-green-500/20 to-green-600/20 text-green-400',
      description: 'Test your knowledge'
    },
    {
      icon: HiViewGrid,
      label: 'Study Flashcards',
      path: '/flashcards',
      color: 'from-purple-500/20 to-purple-600/20 text-purple-400',
      description: 'Review with flashcards'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username || 'User'}! 👋
        </h1>
        <p className="text-dark-400">
          Upload PDFs and use AI to enhance your learning experience.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={action.path}>
              <Card hover padding="p-5">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white mb-1">{action.label}</h3>
                <p className="text-sm text-dark-400">{action.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Documents</h2>
          <Link to="/documents" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
            View all <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={HiDocumentText}
            title="No documents yet"
            description="Upload your first PDF document to start learning with AI"
            action={
              <Link to="/documents">
                <Button icon={HiUpload}>Upload Document</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Link key={doc.id} to={`/documents`}>
                <Card hover padding="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiDocumentText className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-white truncate">{doc.original_filename}</h3>
                      <p className="text-sm text-dark-400 mt-1">{doc.page_count} pages</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {doc.status}
                        </span>
                        <span className="text-xs text-dark-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
