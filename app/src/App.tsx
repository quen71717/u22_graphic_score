import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { IntegratedScoreProvider } from "./context/IntegratedScoreContext";
import Header from "./components/Header";
import IntegratedEditor from "./components/IntegratedEditor";
import "./index.css";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <IntegratedScoreProvider>
        <div className="app-container">
          <Header />
          <IntegratedEditor />
        </div>
      </IntegratedScoreProvider>
    </ThemeProvider>
  );
};

export default App;
