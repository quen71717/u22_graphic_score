import React from 'react';
import { useScore } from '../context/ScoreContext';
import {
  ZoomIn,
  ZoomOut, 
  ChevronLeft,
  ChevronRight,
  Code,
  Save,
  Upload,
  Plus,
  Trash,
  Edit,
  Download
} from 'lucide-react';

interface ToolbarProps {
  onToggleCodeEditor: () => void;
  showCodeEditor: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onToggleCodeEditor, showCodeEditor }) => {
  const { 
    currentPage, 
    totalPages, 
    navigateToPage, 
    zoomIn, 
    zoomOut
  } = useScore();

  const handleFileImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mei,.xml,.musicxml';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const text = await file.text();
        // Here we would process the imported file
        console.log('File imported, length:', text.length);
      }
    };
    input.click();
  };

  const ToolbarButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }> = ({ icon, label, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center p-2 rounded-md transition-colors duration-200
        ${disabled
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-wrap items-center justify-between gap-2 transition-colors duration-300">
      <div className="flex items-center space-x-2">
        <ToolbarButton
          icon={<Plus className="h-5 w-5" />}
          label="New Score"
          onClick={() => {/* New Score Logic */}}
        />
        <ToolbarButton
          icon={<Upload className="h-5 w-5" />}
          label="Import"
          onClick={handleFileImport}
        />
        <ToolbarButton
          icon={<Download className="h-5 w-5" />}
          label="Export"
          onClick={() => {/* Export Logic */}}
        />
        <ToolbarButton
          icon={<Save className="h-5 w-5" />}
          label="Save"
          onClick={() => {/* Save Logic */}}
        />
      </div>

      <div className="flex items-center space-x-2">
        <ToolbarButton
          icon={<Edit className="h-5 w-5" />}
          label="Edit Mode"
          onClick={() => {/* Toggle Edit Mode Logic */}}
        />
        <ToolbarButton
          icon={<Trash className="h-5 w-5" />}
          label="Delete"
          onClick={() => {/* Delete Note Logic */}}
        />
      </div>

      <div className="flex items-center space-x-2">
        <ToolbarButton
          icon={<ZoomOut className="h-5 w-5" />}
          label="Zoom Out"
          onClick={zoomOut}
        />
        <ToolbarButton
          icon={<ZoomIn className="h-5 w-5" />}
          label="Zoom In"
          onClick={zoomIn}
        />
      </div>

      <div className="flex items-center space-x-2">
        <ToolbarButton
          icon={<ChevronLeft className="h-5 w-5" />}
          label="Previous Page"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        />
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <ToolbarButton
          icon={<ChevronRight className="h-5 w-5" />}
          label="Next Page"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        />
      </div>

      <div className="flex items-center space-x-2">
        <ToolbarButton
          icon={<Code className="h-5 w-5" />}
          label="Toggle Code Editor"
          onClick={onToggleCodeEditor}
        />
      </div>
    </div>
  );
};

export default Toolbar;