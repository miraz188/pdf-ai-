import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, onClick = null, padding = 'p-6' }) => {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl ${padding}
        transition-all duration-300
        ${hover ? 'hover:shadow-xl hover:shadow-primary-500/5 hover:border-dark-600' : ''}
        ${onClick ? 'cursor-pointer w-full text-left' : ''}
        ${className}`}
    >
      {children}
    </Component>
  );
};

export default Card;
