import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action = null }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    {Icon && (
      <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-dark-500" />
      </div>
    )}
    <h3 className="text-xl font-semibold text-dark-300 mb-2">{title}</h3>
    <p className="text-dark-400 max-w-md mb-6">{description}</p>
    {action}
  </motion.div>
);

export default EmptyState;
