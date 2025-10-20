/**
 * @fileoverview PromptLibraryPage - Main library page component
 * Displays grid of prompts with search, filters, and card-based editing
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  SortDesc,
  FileText,
  Calendar,
  Play,
  Eye,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatePromptDialog } from './create-prompt-dialog';
import { PromptCardEditor } from './prompt-card-editor';
import { useStructuredPromptStore } from '@/stores/structured-prompt-store';
import { useProjectStore } from '@/stores/project-store';
import { StructuredPrompt, PromptSortBy } from '@/types/structured-prompt';
import { estimateReadingTime } from '@/lib/structured-prompt-helpers';

export default function PromptLibraryPage() {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const { projects, currentProject } = useProjectStore();
  const { prompts, loading, fetchLibraryPrompts } = useStructuredPromptStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [sortBy, setSortBy] = useState<PromptSortBy>('updated_at_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'editor'>('grid');

  // Load prompts on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  // Handle prompt ID from URL
  useEffect(() => {
    if (promptId) {
      setViewMode('editor');
    } else {
      setViewMode('grid');
    }
  }, [promptId]);

  const loadPrompts = () => {
    fetchLibraryPrompts({
      filters: {
        searchQuery: searchQuery || undefined,
        tool: selectedTool !== 'all' ? selectedTool : undefined,
        projectId: currentProject?.id,
      },
      sortBy,
    });
  };

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPrompts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTool, sortBy]);

  // Get unique tool names for filter
  const toolNames = Array.from(
    new Set(prompts.map((p) => p.tool_name).filter(Boolean))
  ).sort();

  const handlePromptClick = (prompt: StructuredPrompt) => {
    navigate(`/library/${prompt.id}`);
  };

  const handleCloseEditor = () => {
    navigate('/library');
  };

  // Render editor view
  if (viewMode === 'editor' && promptId) {
    return <PromptCardEditor promptId={promptId} onClose={handleCloseEditor} />;
  }

  // Render grid view
  return (
    <div className="h-full flex flex-col bg-background">
      <Navigation />

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
              <p className="text-muted-foreground mt-1">
                Manage and edit your structured AI prompts
              </p>
            </div>

            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Prompt
            </Button>
          </div>

          {/* Filters bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tool filter */}
                <Select value={selectedTool} onValueChange={setSelectedTool}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Tools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tools</SelectItem>
                    {toolNames.map((tool) => (
                      <SelectItem key={tool} value={tool}>
                        {tool}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as PromptSortBy)}>
                  <SelectTrigger className="w-48">
                    <SortDesc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at_desc">Recently Updated</SelectItem>
                    <SelectItem value="created_at_desc">Recently Created</SelectItem>
                    <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                    <SelectItem value="run_count_desc">Most Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prompts grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading prompts...</p>
                </div>
              </div>
            ) : prompts.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    Create your first structured prompt with card-based editing for better
                    organization and reusability.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Prompt
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                <AnimatePresence>
                  {prompts.map((prompt, idx) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      index={idx}
                      onClick={() => handlePromptClick(prompt)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create dialog */}
      <CreatePromptDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={currentProject?.id}
      />
    </div>
  );
}

// Prompt card component
interface PromptCardProps {
  prompt: StructuredPrompt;
  index: number;
  onClick: () => void;
}

function PromptCard({ prompt, index, onClick }: PromptCardProps) {
  const readingTime = estimateReadingTime(prompt.compiled_prompt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {prompt.title}
              </CardTitle>
              {prompt.description && (
                <CardDescription className="mt-2 line-clamp-2">
                  {prompt.description}
                </CardDescription>
              )}
            </div>

            {prompt.is_template && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 shrink-0">
                Template
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {prompt.framework_name && (
              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                <Workflow className="w-3 h-3 mr-1" />
                From Canvas: {prompt.framework_name}
              </Badge>
            )}
            {prompt.tool_name && (
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {prompt.tool_name}
              </Badge>
            )}
            {prompt.run_count > 0 && (
              <Badge variant="outline" className="text-xs">
                <Play className="w-3 h-3 mr-1" />
                {prompt.run_count}x
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              {readingTime} min
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Section indicators */}
            <div className="flex flex-wrap gap-1">
              {[
                { type: 'role', color: 'bg-purple-500' },
                { type: 'context', color: 'bg-blue-500' },
                { type: 'task', color: 'bg-green-500' },
                { type: 'constraints', color: 'bg-orange-500' },
                { type: 'format', color: 'bg-red-500' },
                ...(prompt.examples_section ? [{ type: 'examples', color: 'bg-yellow-500' }] : []),
              ].map(({ type, color }) => (
                <div
                  key={type}
                  className={cn('h-1.5 flex-1 rounded-full', color)}
                  title={`${type} section`}
                />
              ))}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  Updated {new Date(prompt.updated_at).toLocaleDateString()}
                </span>
              </div>
              <span>v{prompt.version}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
