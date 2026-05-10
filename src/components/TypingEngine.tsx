"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react'

interface KeystrokeEvent {
  t: number;                // ms since start
  k: string;                // key
  v: 'hit' | 'miss' | 'del' // hit=correct, miss=error, del=backspace
}

interface TypingEngineProps {
  content: string
  onComplete: (stats: { 
    wpm: number, 
    timeSeconds: number, 
    errors: number,
    rawLog: KeystrokeEvent[],
    trueAccuracy: number
  }) => void
}

export default function TypingEngine({ content, onComplete }: TypingEngineProps) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [activeWordIndex, setActiveWordIndex] = useState(0)
  const [typedWords, setTypedWords] = useState<string[]>([])
  const [currentTypedWord, setCurrentTypedWord] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  
  // Analytics State
  const [rawLog, setRawLog] = useState<KeystrokeEvent[]>([])
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const targetWords = useMemo(() => content.trim().split(/\s+/), [content])

  // Keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Tab') {
        e.preventDefault()
        return
      }
      if (!isFocused) return

      const now = Date.now()
      const timeOffset = startTime ? now - startTime : 0

      if (e.key === 'Backspace') {
        setTotalKeystrokes(prev => prev + 1)
        setRawLog(prev => [...prev, { t: timeOffset, k: 'Backspace', v: 'del' }])
        
        if (currentTypedWord.length > 0) {
          setCurrentTypedWord(prev => prev.slice(0, -1))
        }
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        if (currentTypedWord.length > 0) {
          const isWordCorrect = currentTypedWord === targetWords[activeWordIndex]
          
          setTotalKeystrokes(prev => prev + 1)
          setRawLog(prev => [...prev, { t: timeOffset, k: ' ', v: isWordCorrect ? 'hit' : 'miss' }])

          const newTypedWords = [...typedWords, currentTypedWord]
          
          if (activeWordIndex + 1 === targetWords.length) {
            finish(newTypedWords, totalKeystrokes + 1)
          } else {
            setTypedWords(newTypedWords)
            setActiveWordIndex(activeWordIndex + 1)
            setCurrentTypedWord('')
          }
        }
        return
      }

      if (e.key.length === 1) { // Printable characters
        let actualStartTime = startTime
        if (!actualStartTime) {
          actualStartTime = now
          setStartTime(actualStartTime)
        }

        const isCharCorrect = currentTypedWord + e.key === targetWords[activeWordIndex].slice(0, currentTypedWord.length + 1)
        
        const newTotal = totalKeystrokes + 1
        setTotalKeystrokes(newTotal)
        setRawLog(prev => [...prev, { t: now - (actualStartTime as number), k: e.key, v: isCharCorrect ? 'hit' : 'miss' }])

        const newWord = currentTypedWord + e.key
        setCurrentTypedWord(newWord)

        if (activeWordIndex === targetWords.length - 1 && newWord === targetWords[activeWordIndex]) {
          const newTypedWords = [...typedWords, newWord]
          finish(newTypedWords, newTotal)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeWordIndex, currentTypedWord, isFocused, startTime, targetWords, typedWords, totalKeystrokes])

  const finish = (finalTypedWords: string[], finalTotalKeys: number) => {
    const end = Date.now()
    const durationMs = end - (startTime || end)
    const minutes = durationMs / 1000 / 60 || 1 / 60

    // 1. Standard Metrics
    let wpmTotalKeystrokes = 0
    let incorrectWordsCount = 0
    let totalTargetChars = 0
    let finalCorrectChars = 0

    targetWords.forEach((target, i) => {
      const typed = finalTypedWords[i] || ""
      wpmTotalKeystrokes += typed.length + 1
      totalTargetChars += target.length
      if (typed !== target) incorrectWordsCount++
      for (let j = 0; j < Math.max(target.length, typed.length); j++) {
        if (target[j] === typed[j]) finalCorrectChars++
      }
    })

    const grossWpm = (wpmTotalKeystrokes / 5) / minutes
    let netWpm = Math.max(0, grossWpm - (incorrectWordsCount / minutes))

    // 2. New Competitive Metrics
    // True Accuracy = Hits / (Hits + Misses)
    const hits = rawLog.filter(e => e.v === 'hit').length
    const misses = rawLog.filter(e => e.v === 'miss').length
    const trueAccuracy = (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0

    onComplete({
      wpm: netWpm,
      timeSeconds: durationMs / 1000,
      errors: incorrectWordsCount,
      rawLog,
      trueAccuracy
    })
  }

  return (
    <div
      className="relative w-full max-w-4xl p-8 outline-none cursor-text rounded-xl bg-[var(--panel-bg)] border border-[var(--panel-border)] shadow-2xl overflow-hidden"
      tabIndex={0}
      ref={containerRef}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={() => containerRef.current?.focus()}
    >
      {!isFocused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--panel-bg)]/80 backdrop-blur-[2px]">
          <p className="text-[var(--text-strong)] text-xl font-medium tracking-wide">Click or press any key to focus</p>
        </div>
      )}

      <div className={`flex flex-wrap gap-x-2 gap-y-3 leading-relaxed text-2xl font-mono ${!isFocused ? 'blur-sm opacity-50' : ''}`}>
        {targetWords.map((word, wIdx) => {
          const isActive = wIdx === activeWordIndex
          const isPast = wIdx < activeWordIndex

          let typedObj = ''
          if (isActive) typedObj = currentTypedWord
          if (isPast) typedObj = typedWords[wIdx]

          let hasTypo = false
          if (isActive) {
            hasTypo = !word.startsWith(currentTypedWord)
          } else if (isPast) {
            hasTypo = typedObj !== word
          }

          let wordBgClass = 'px-1 -mx-1 transition-colors '
          if (isActive) {
            wordBgClass += hasTypo ? 'bg-[var(--error-light)] rounded' : 'bg-[var(--panel-border)]/30 rounded'
          } else if (isPast && hasTypo) {
            wordBgClass += 'border-b-2 border-[var(--error)]'
          }

          return (
            <div 
              key={wIdx} 
              className={`relative flex ${wordBgClass}`}
            >

              {/* Characters */}
              {word.split('').map((char, cIdx) => {
                let colorClass = 'text-[var(--text-muted)]' // untyped
                
                if (isActive || isPast) {
                  if (cIdx < typedObj.length) {
                    const typedChar = typedObj[cIdx]
                    colorClass = typedChar === char ? 'text-[var(--text-strong)]' : 'text-[var(--error)] font-bold'
                  }
                }
                
                return (
                  <span key={cIdx} className="relative">
                    {isActive && currentTypedWord.length === cIdx && (
                      <span className="absolute -left-[1px] top-0 bottom-0 w-0.5 bg-[var(--cursor)] animate-pulse" />
                    )}
                    <span className={`${colorClass} transition-colors duration-150`}>
                      {char}
                    </span>
                  </span>
                )
              })}

              {/* Extra typed characters */}
              {typedObj.length > word.length && (
                <span className="text-[var(--error)] opacity-80">
                  {typedObj.slice(word.length)}
                </span>
              )}

              {/* Cursor if at the very end of the word or extra chars */}
              {isActive && currentTypedWord.length >= word.length && (
                <span className="relative">
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--cursor)] animate-pulse" />
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
