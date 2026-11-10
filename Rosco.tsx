import React from 'react';
import { QuestionItem } from './questions';

export type LetterStatus = 'unanswered' | 'passed' | 'correct' | 'wrong';

interface RoscoProps {
  questions: QuestionItem[];
  currentIndex: number;
  letterStatuses: Record<number, LetterStatus>;
  onSelectLetter: (index: number) => void;
  size?: number;
}

export const Rosco: React.FC<RoscoProps> = ({
  questions,
  currentIndex,
  letterStatuses,
  onSelectLetter,
  size = 560
}) => {
  const totalLetters = questions.length;
  const radius = size * 0.41; // distance from center
  const center = size / 2;
  const bubbleSize = Math.max(28, Math.min(42, (size / 560) * 38));

  return (
    <div
      className="relative mx-auto flex items-center justify-center select-none"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Decorative ambient background rings */}
      <div className="absolute inset-4 rounded-full border border-blue-500/15 pointer-events-none" />
      <div className="absolute inset-14 rounded-full border border-cyan-400/10 pointer-events-none" />
      <div className="absolute inset-24 rounded-full border border-indigo-400/5 pointer-events-none" />
      
      {/* Glow aura */}
      <div className="absolute w-3/4 h-3/4 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Render 27 circular letter nodes */}
      {questions.map((q, idx) => {
        // A starts at 12 o'clock (-90 degrees), going clockwise
        const angle = -90 + (idx * 360) / totalLetters;
        const rad = (angle * Math.PI) / 180;
        const x = center + radius * Math.cos(rad);
        const y = center + radius * Math.sin(rad);

        const isActive = idx === currentIndex;
        const status = letterStatuses[q.id] || 'unanswered';

        let bgStyle = 'bg-gradient-to-b from-blue-600 to-blue-800 text-white border-blue-400/40 shadow-blue-900/40';
        let statusBadge = null;

        if (status === 'correct') {
          bgStyle = 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-emerald-300 shadow-emerald-950/60 shadow-lg';
          statusBadge = '✓';
        } else if (status === 'wrong') {
          bgStyle = 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-rose-300 shadow-rose-950/60 shadow-lg';
          statusBadge = '✕';
        } else if (status === 'passed') {
          bgStyle = 'bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 border-amber-200 shadow-amber-950/60 shadow-lg font-bold';
        }

        if (isActive) {
          bgStyle = 'bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-500 text-slate-950 border-white shadow-amber-500/80 shadow-2xl scale-125 z-20 animate-pulse-ring font-black';
        }

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelectLetter(idx)}
            title={`${q.letter}: ${q.ruleEs} (${status})`}
            className={`absolute flex items-center justify-center rounded-full font-game font-bold tracking-tight border-2 transition-all duration-200 cursor-pointer ${bgStyle} ${
              isActive ? 'scale-115' : 'hover:scale-110 active:scale-95'
            }`}
            style={{
              width: `${bubbleSize}px`,
              height: `${bubbleSize}px`,
              left: `${x - bubbleSize / 2}px`,
              top: `${y - bubbleSize / 2}px`,
              fontSize: `${Math.round(bubbleSize * 0.48)}px`,
            }}
          >
            <span>{q.letter}</span>
            {statusBadge && !isActive && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-950 text-[9px] font-bold text-white shadow-sm border border-white/40"
              >
                {statusBadge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
