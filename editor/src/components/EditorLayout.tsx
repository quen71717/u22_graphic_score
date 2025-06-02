import React from "react";
import Header from "./Header";
import Toolbar from "./Toolbar";
import ScoreDisplay from "./ScoreDisplay";
import CodeEditor from "./CodeEditor";
import StatusBar from "./StatusBar";
import FileControls from "./FileControls";
import { useState } from "react";

const EditorLayout: React.FC = () => {
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <FileControls />
      <Toolbar
        onToggleCodeEditor={() => setShowCodeEditor(!showCodeEditor)}
        showCodeEditor={showCodeEditor}
      />
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            showCodeEditor ? "w-1/2" : "w-full"
          }`}
        >
          <ScoreDisplay />
        </div>
        {showCodeEditor && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700">
            <CodeEditor />
          </div>
        )}
      </div>
      <StatusBar />
    </div>
  );
};

export default EditorLayout;
