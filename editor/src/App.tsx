import React from 'react';
import EditorLayout from './components/EditorLayout';
import { ScoreProvider } from './context/ScoreContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ScoreProvider>
        <EditorLayout />
      </ScoreProvider>
    </ThemeProvider>
  );
}

export default App;