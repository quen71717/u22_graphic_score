import React from "react";
import { useIntegratedScore } from "../context/IntegratedScoreContext";

const MidiControls: React.FC = () => {
  const { saveMIDI } = useIntegratedScore();

  return (
    <div className="flex items-center">
        <button
          onClick={saveMIDI}
          className="btn btn-primary"
        >
          MIDI 出力
        </button>
    </div>
  );
};

export default MidiControls;