import { useState } from 'react';
import { ProjectList } from '@/components/project/project-list';
import { Navigation } from '@/components/ui/navigation';
import { motion } from 'framer-motion';
import { FolderOpen, Database } from 'lucide-react';

export default function Projects() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <p className="text-gray-600 mt-1">
                  Manage your UX workflow projects, knowledge bases, and collaborative workspaces
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span>Project Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Knowledge Base Integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div>
            <ProjectList />
          </div>
        </main>
      </motion.div>
    </div>
  );
}