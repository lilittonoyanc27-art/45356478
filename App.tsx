import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  QUESTIONS,
  QuestionItem,
  checkAnswer
} from './questions';
import { Rosco, LetterStatus } from './Rosco';
import { soundManager } from './sound';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Languages,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'FINISHED'>('IDLE');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [letterStatuses, setLetterStatuses] = useState<Record<number, LetterStatus>>({});
  const [userAnswers, setUserAnswers] = useState<Record<number, { input: string; isCorrect: boolean }>>({});
  const [inputValue, setInputValue] = useState<string>('');
  
  // Timer State (30 minutes = 1800 seconds)
  const TOTAL_TIME = 30 * 60; // 1800 seconds
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);

  // Translation visibility (per-question click reveal or global toggle)
  const [revealedTranslations, setRevealedTranslations] = useState<Record<number, boolean>>({});
  const [alwaysShowTranslation, setAlwaysShowTranslation] = useState<boolean>(false);

  // Peek answer without penalty (just view answer)
  const [peekedAnswers, setPeekedAnswers] = useState<Record<number, boolean>>({});

  // Sound & Speech
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [speaking, setSpeaking] = useState<boolean>(false);

  // Feedback banner state after answering
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctAnswer: string;
    correctAnswerHy: string;
    letter: string;
  } | null>(null);

  // Screen size tracking for responsive Rosco diameter
  const [roscoSize, setRoscoSize] = useState<number>(500);

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate scores
  const correctCount = Object.values(letterStatuses).filter(s => s === 'correct').length;
  const wrongCount = Object.values(letterStatuses).filter(s => s === 'wrong').length;
  const passedCount = Object.values(letterStatuses).filter(s => s === 'passed').length;
  const answeredCount = correctCount + wrongCount;
  const remainingCount = QUESTIONS.length - answeredCount;

  // Track responsive window size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 450) {
        setRoscoSize(310);
      } else if (width < 640) {
        setRoscoSize(370);
      } else if (width < 1024) {
        setRoscoSize(440);
      } else if (width < 1280) {
        setRoscoSize(480);
      } else {
        setRoscoSize(520);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer countdown loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          if (prev <= 10) {
            soundManager.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // Focus input on active question
  useEffect(() => {
    if (gameState === 'PLAYING' && !feedback) {
      inputRef.current?.focus();
    }
  }, [currentIndex, gameState, feedback]);

  // Sync sound controller enabled state
  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find next playable question (unanswered or passed)
  const getNextIndex = useCallback((startIndex: number): number | null => {
    const total = QUESTIONS.length;
    // Check remaining in circular order
    for (let i = 1; i <= total; i++) {
      const nextIdx = (startIndex + i) % total;
      const q = QUESTIONS[nextIdx];
      const status = letterStatuses[q.id];
      if (!status || status === 'unanswered' || status === 'passed') {
        return nextIdx;
      }
    }
    return null; // All questions answered!
  }, [letterStatuses]);

  // Start game
  const startGame = () => {
    setGameState('PLAYING');
    setCurrentIndex(0);
    setLetterStatuses({});
    setUserAnswers({});
    setTimeLeft(TOTAL_TIME);
    setRevealedTranslations({});
    setPeekedAnswers({});
    setFeedback(null);
    setInputValue('');
    soundManager.playCorrect();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Pause / Resume
  const togglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // End game trigger
  const handleGameOver = useCallback(() => {
    setGameState('FINISHED');
    soundManager.playVictory();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  // Check if all letters are completed
  const checkCompletion = useCallback((updatedStatuses: Record<number, LetterStatus>) => {
    const completed = QUESTIONS.every(q => {
      const s = updatedStatuses[q.id];
      return s === 'correct' || s === 'wrong';
    });
    if (completed) {
      handleGameOver();
      return true;
    }
    return false;
  }, [handleGameOver]);

  // Submit Answer (Correct or Wrong -> CONTINUE playing!)
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (gameState !== 'PLAYING') return;

    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      // Empty input counts as Pasapalabra (skip)
      handlePasapalabra();
      return;
    }

    const currentQ = QUESTIONS[currentIndex];
    const isCorrect = checkAnswer(trimmedInput, currentQ);
    const newStatus: LetterStatus = isCorrect ? 'correct' : 'wrong';

    const updatedStatuses = {
      ...letterStatuses,
      [currentQ.id]: newStatus
    };
    setLetterStatuses(updatedStatuses);

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: { input: trimmedInput, isCorrect }
    }));

    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    // Show temporary feedback banner with correct answer and translation
    setFeedback({
      show: true,
      isCorrect,
      correctAnswer: currentQ.answerEs,
      correctAnswerHy: currentQ.answerHy,
      letter: currentQ.letter
    });

    setInputValue('');

    // Check if rosco is finished
    const isDone = checkCompletion(updatedStatuses);
    if (!isDone) {
      // Automatically advance to the next question after brief feedback so flow continues uninterrupted
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        const nextIdx = getNextIndex(currentIndex);
        if (nextIdx !== null) {
          setCurrentIndex(nextIdx);
        } else {
          handleGameOver();
        }
      }, isCorrect ? 900 : 1800); // Give slightly more time to read wrong answer correction
    }
  };

  // Immediate Next button if user doesn't want to wait for feedback timer
  const handleProceedNext = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setFeedback(null);
    const nextIdx = getNextIndex(currentIndex);
    if (nextIdx !== null) {
      setCurrentIndex(nextIdx);
    } else {
      handleGameOver();
    }
  };

  // Pasapalabra (Pass/Skip question)
  const handlePasapalabra = () => {
    if (gameState !== 'PLAYING') return;

    const currentQ = QUESTIONS[currentIndex];
    // Mark as passed (yellow)
    const updatedStatuses = {
      ...letterStatuses,
      [currentQ.id]: 'passed' as LetterStatus
    };
    setLetterStatuses(updatedStatuses);

    soundManager.playPasapalabra();
    setInputValue('');

    // Move to next pending or passed letter
    const nextIdx = getNextIndex(currentIndex);
    if (nextIdx !== null && nextIdx !== currentIndex) {
      setCurrentIndex(nextIdx);
    }
  };

  // Insert Spanish accent or special character into input
  const insertChar = (char: string) => {
    setInputValue(prev => prev + char);
    inputRef.current?.focus();
  };

  // Toggle Armenian translation reveal for current question
  const toggleTranslation = (id: number) => {
    setRevealedTranslations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle answer peek without penalty (just viewing the answer)
  const togglePeekAnswer = () => {
    setPeekedAnswers(prev => ({
      ...prev,
      [QUESTIONS[currentIndex].id]: !prev[QUESTIONS[currentIndex].id]
    }));
  };

  // Text to speech for Spanish question
  const speakCurrentQuestion = (text: string) => {
    setSpeaking(true);
    soundManager.speakSpanish(text);
    setTimeout(() => setSpeaking(false), 2000);
  };

  const currentQ = QUESTIONS[currentIndex];
  const isArmenianRevealed = alwaysShowTranslation || revealedTranslations[currentQ.id];
  const isAnswerPeeked = !!peekedAnswers[currentQ.id];

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-blue-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-400 p-0.5 shadow-lg shadow-blue-900/50 flex items-center justify-center">
              <div className="w-full h-full bg-[#030b1c] rounded-[10px] flex items-center justify-center font-game font-black text-xl text-amber-400">
                P
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-game font-black text-xl tracking-tight text-white uppercase">
                  Pasapalabra
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                  Arm · Esp
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Իսպաներեն-հայերեն բառախաղ · 27 տառ · 30 րոպե
              </p>
            </div>
          </div>

          {/* Quick HUD Counters */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Timer Display Widget */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              timeLeft < 180 
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-slate-900/80 border-blue-800/40 text-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-game font-bold text-base sm:text-lg tabular-nums tracking-wide">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Score Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{correctCount}</span>
                <span className="text-[10px] text-emerald-400/70 hidden sm:inline">ճիշտ</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>{wrongCount}</span>
                <span className="text-[10px] text-rose-400/70 hidden sm:inline">սխալ</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title={soundEnabled ? 'Ձայնն անջատել / Silenciar' : 'Ձայնը միացնել / Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {gameState === 'IDLE' ? (
          /* Welcome & Rules Screen */
          <div className="max-w-2xl mx-auto my-auto text-center py-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Հեռուստախաղ «Պասապալաբրա» · Իսպաներեն-Հայերեն
            </div>

            <h1 className="font-game font-black text-4xl sm:text-6xl text-white tracking-tight mb-4">
              EL ROSCO <span className="text-amber-400">ARMENIO</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
              Փորձարկեք ձեր իսպաներենի բառապաշարը հայերեն թարգմանությամբ։ 27 տառ, 30 րոպե ժամանակ։
            </p>

            {/* Rule feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-8">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-blue-900/30">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-2">
                  ⏱️
                </div>
                <div className="text-sm font-bold text-white mb-1">30 րոպե ժամանակ</div>
                <div className="text-xs text-slate-400">
                  Հանգիստ մտածեք և պատասխանեք յուրաքանչյուր հարցին։
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-blue-900/30">
                <div className="w-8 h-8 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center font-bold mb-2">
                  🇦🇲
                </div>
                <div className="text-sm font-bold text-white mb-1">Հայերեն թարգմանություն</div>
                <div className="text-xs text-slate-400">
                  Սեղմեք իսպաներեն հարցի վրա՝ հայերեն իմաստը տեսնելու համար։
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-blue-900/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-bold mb-2">
                  🔄
                </div>
                <div className="text-sm font-bold text-white mb-1">Սխալի դեպքում շարունակեք</div>
                <div className="text-xs text-slate-400">
                  Խաղը չի ընդհատվում սխալ պատասխանից։ Շարունակեք մինչև ավարտ։
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-game font-black text-xl hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              <Play className="w-6 h-6 fill-current" />
              Սկսել Խաղը / Empezar
            </button>
          </div>
        ) : gameState === 'FINISHED' ? (
          /* Victory & Results Review Screen */
          <div className="max-w-4xl mx-auto my-auto py-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-bold mb-4 shadow-xl shadow-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="font-game font-black text-3xl sm:text-5xl text-white mb-2">
                Խաղն ավարտվեց / ¡Fin de la partida!
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Մնացած ժամանակը՝ <strong className="text-amber-400">{formatTime(timeLeft)}</strong>
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 text-center">
              <div className="p-4 sm:p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-lg">
                <div className="font-game font-black text-3xl sm:text-5xl text-emerald-400 mb-1">
                  {correctCount}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-300 uppercase tracking-wide">
                  Ճիշտ (Aciertos)
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 shadow-lg">
                <div className="font-game font-black text-3xl sm:text-5xl text-rose-400 mb-1">
                  {wrongCount}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-rose-300 uppercase tracking-wide">
                  Սխալ (Fallos)
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-700/40 shadow-lg">
                <div className="font-game font-black text-3xl sm:text-5xl text-amber-400 mb-1">
                  {passedCount + remainingCount}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Անպատասխան
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={startGame}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-game font-bold text-base hover:bg-amber-300 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                Կրկին խաղալ / Jugar de nuevo
              </button>
            </div>

            {/* Complete 27-Question Performance Review */}
            <div className="rounded-2xl bg-slate-900/80 border border-blue-900/40 p-4 sm:p-6 max-h-96 overflow-y-auto">
              <h3 className="font-game font-bold text-lg text-white mb-4 flex items-center justify-between">
                <span>Բոլոր 27 բառերի ամփոփում / Repaso de palabras</span>
                <span className="text-xs font-normal text-slate-400">
                  {answeredCount} / {QUESTIONS.length}
                </span>
              </h3>

              <div className="space-y-3">
                {QUESTIONS.map(q => {
                  const status = letterStatuses[q.id];
                  const userAnswer = userAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
                        status === 'correct'
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                          : status === 'wrong'
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-100'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-8 h-8 rounded-lg font-game font-bold flex items-center justify-center shrink-0 ${
                          status === 'correct'
                            ? 'bg-emerald-500 text-white'
                            : status === 'wrong'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {q.letter}
                        </span>
                        <div>
                          <div className="font-semibold text-white">
                            {q.answerEs} <span className="text-slate-400 font-normal">({q.answerHy})</span>
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {q.questionEs}
                          </div>
                          <div className="text-xs text-amber-400/80 line-clamp-1">
                            {q.questionHy}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs shrink-0 pl-11 sm:pl-0">
                        {status === 'correct' && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Ճիշտ
                          </span>
                        )}
                        {status === 'wrong' && (
                          <div className="text-right">
                            <span className="flex items-center gap-1 text-rose-400 font-medium">
                              <XCircle className="w-4 h-4" /> Ձեր պատասխանը՝ "{userAnswer?.input}"
                            </span>
                          </div>
                        )}
                        {(!status || status === 'unanswered' || status === 'passed') && (
                          <span className="text-slate-500">Բաց թողնված</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Active Gameplay Screen: TV-Studio Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
            {/* Left Column: Authentic Pasapalabra Wheel (Rosco) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center order-2 lg:order-1">
              <Rosco
                questions={QUESTIONS}
                currentIndex={currentIndex}
                letterStatuses={letterStatuses}
                onSelectLetter={(idx) => {
                  if (gameState === 'PLAYING') {
                    setCurrentIndex(idx);
                    setFeedback(null);
                    setInputValue('');
                  }
                }}
                size={roscoSize}
              />

              {/* Rosco Legend / Status Helper */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 border border-blue-400" />
                  <span>Սպասող</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 border border-white" />
                  <span>Ընթացիկ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400" />
                  <span>Ճիշտ ({correctCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-400" />
                  <span>Սխալ ({wrongCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300" />
                  <span>Անցած</span>
                </div>
              </div>
            </div>

            {/* Right Column: Question Card & Answer Controls */}
            <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2">
              {/* Question Box Card */}
              <div className="relative rounded-3xl bg-slate-900/90 border-2 border-blue-600/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                {/* Letter Header & Rule Banner */}
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-game font-black text-3xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      {currentQ.letter}
                    </div>
                    <div>
                      <div className="text-amber-400 font-game font-bold text-lg leading-tight">
                        {currentQ.ruleEs}
                      </div>
                      <div className="text-xs text-slate-400">
                        {currentQ.ruleHy}
                      </div>
                    </div>
                  </div>

                  {/* Question Audio & Quick actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakCurrentQuestion(currentQ.questionEs)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer ${
                        speaking
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Լսել իսպաներեն արտասանությունը / Escuchar pronunciación"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={togglePause}
                      className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                      title={gameState === 'PAUSED' ? 'Շարունակել / Reanudar' : 'Դադար / Pausar'}
                    >
                      {gameState === 'PAUSED' ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Primary Spanish Question - CLICKABLE TO REVEAL ARMENIAN TRANSLATION */}
                <div
                  onClick={() => toggleTranslation(currentQ.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleTranslation(currentQ.id);
                    }
                  }}
                  className="group relative cursor-pointer p-4 rounded-2xl bg-blue-950/30 hover:bg-blue-900/30 border border-blue-500/20 hover:border-blue-400/50 transition-all duration-200 mb-4"
                  title="Սեղմեք իսպաներեն հարցի վրա՝ հայերեն թարգմանությունը տեսնելու համար"
                >
                  <div className="flex items-center justify-between text-xs text-blue-300/80 mb-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      🇪🇸 Իսպաներեն հարց / Pregunta en español:
                    </span>
                    <span className="text-[11px] bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-md group-hover:bg-amber-400 group-hover:text-slate-950 transition font-semibold">
                      {isArmenianRevealed ? '🇦🇲 Փակել թարգմանությունը' : '🇦🇲 Սեղմեք՝ տեսնելու թարգմանությունը'}
                    </span>
                  </div>

                  <p className="text-xl sm:text-2xl font-bold text-white leading-snug group-hover:text-amber-200 transition">
                    {currentQ.questionEs}
                  </p>
                </div>

                {/* Armenian Translation Card (Revealed on click) */}
                {isArmenianRevealed ? (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-100 mb-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs text-amber-400/80 mb-1 font-semibold">
                      <span>🇦🇲 Հայերեն թարգմանություն / Traducción al armenio:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTranslation(currentQ.id);
                        }}
                        className="text-[11px] underline hover:text-white cursor-pointer"
                      >
                        Փակել
                      </button>
                    </div>
                    <p className="text-lg sm:text-xl font-medium text-amber-100">
                      {currentQ.questionHy}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleTranslation(currentQ.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 text-amber-300 text-xs sm:text-sm font-semibold transition cursor-pointer mb-5"
                  >
                    <Languages className="w-4 h-4 text-amber-400" />
                    <span>Սեղմեք այստեղ կամ հարցի վրա՝ հայերեն թարգմանությունը տեսնելու համար</span>
                  </button>
                )}

                {/* Answer Peek Card (Shows answer without marking as wrong) */}
                {isAnswerPeeked && (
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-100 mb-5 animate-in fade-in duration-200 shadow-lg shadow-cyan-950/40">
                    <div className="flex items-center justify-between text-xs text-cyan-300 mb-2 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>Պատասխանի դիտում (չի համարվում սխալ) / Просмотр ответа:</span>
                      </span>
                      <button
                        type="button"
                        onClick={togglePeekAnswer}
                        className="text-[11px] text-cyan-300 hover:text-white underline cursor-pointer"
                      >
                        Փակել
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-cyan-700/30">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold font-game text-white tracking-wide">
                          {currentQ.answerEs}
                        </div>
                        <div className="text-xs text-cyan-200/90 mt-0.5">
                          🇦🇲 {currentQ.answerHy}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => soundManager.speakSpanish(currentQ.answerEs)}
                          className="p-2 rounded-lg bg-cyan-900/40 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/40 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                          title="Լսել արտասանությունը"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Լսել</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputValue(currentQ.answerEs);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                        >
                          Տեղադրել դաշտում
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instant Feedback Notice (Shows for 1.5s after answering) */}
                {feedback && feedback.show && (
                  <div className={`p-4 rounded-2xl border mb-5 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-150 ${
                    feedback.isCorrect
                      ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-sm sm:text-base">
                          {feedback.isCorrect ? '¡CORRECTO! ՃԻՇՏ Է' : '¡INCORRECTO! ՍԽԱԼ Է (Խաղը շարունակվում է)'}
                        </div>
                        <div className="text-xs sm:text-sm opacity-90">
                          Ճիշտ պատասխան՝ <strong className="font-bold underline">{feedback.correctAnswer}</strong> ({feedback.correctAnswerHy})
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedNext}
                      className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      Հաջորդը <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Answer Submission Form */}
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Գրեք պատասխանն իսպաներեն..."
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-950 border-2 border-blue-500/40 focus:border-amber-400 focus:outline-none text-xl sm:text-2xl font-game font-bold text-white placeholder-slate-500 shadow-inner tracking-wide"
                    />

                    {inputValue && (
                      <button
                        type="button"
                        onClick={() => setInputValue('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-md"
                      >
                        Մաքրել
                      </button>
                    )}
                  </div>

                  {/* Spanish Special Characters Keyboard Toolbar */}
                  <div className="flex items-center justify-between flex-wrap gap-1.5 text-xs text-slate-400">
                    <span className="text-[11px] uppercase tracking-wider">Իսպաներեն տառեր՝</span>
                    <div className="flex items-center gap-1">
                      {['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'].map((char) => (
                        <button
                          key={char}
                          type="button"
                          onClick={() => insertChar(char)}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 font-game font-bold text-sm text-slate-200 border border-slate-700 transition cursor-pointer"
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Submit, Pasapalabra & View Answer */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-game font-bold text-base shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Պատասխանել</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePasapalabra}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-game font-black text-base shadow-lg shadow-amber-900/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Pasapalabra</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePeekAnswer}
                      className={`w-full py-3.5 px-4 rounded-2xl font-game font-bold text-base border transition cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                        isAnswerPeeked
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-900/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-600/40 hover:border-cyan-400 shadow-slate-950/40'
                      }`}
                      title="Տեսնել պատասխանը առանց սխալ հաշվելու / Посмотреть ответ без штрафа"
                    >
                      {isAnswerPeeked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      <span>{isAnswerPeeked ? 'Թաքցնել' : 'Պատասխան'}</span>
                    </button>
                  </div>
                </form>

                {/* Subtitle / Controls footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={alwaysShowTranslation}
                      onChange={(e) => setAlwaysShowTranslation(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>Միշտ ցուցադրել հայերեն թարգմանությունը</span>
                  </label>

                  <div className="hidden sm:block text-[11px] text-slate-500">
                    Enter = Պատասխանել · Դատարկ Enter = Pasapalabra
                  </div>
                </div>
              </div>

              {/* Bottom Quick Status Stats */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-blue-900/30 text-xs">
                <div className="text-slate-400">
                  Հարց <strong className="text-white">{currentIndex + 1}</strong> / {QUESTIONS.length}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-semibold">{correctCount} ճիշտ</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-rose-400 font-semibold">{wrongCount} սխալ</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-semibold">{remainingCount} մնացած</span>
                </div>
                <button
                  type="button"
                  onClick={handleGameOver}
                  className="text-slate-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Ավարտել խաղը
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 bg-slate-950/60 py-3 px-4 text-center text-xs text-slate-500">
        Pasapalabra · Իսպաներեն-հայերեն բառախաղ · 27 նոր հարց ու պատասխան
      </footer>
    </div>
  );
}
