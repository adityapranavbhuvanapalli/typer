"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react'

interface TypingEngineProps {
  content: string
  onComplete: (stats: { wpm: number, accuracy: number, timeSeconds: number, errors: number }) => void
}

export default function TypingEngine({ content, onComplete }: TypingEngineProps) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [activeWordIndex, setActiveWordIndex] = useState(0)
  const [typedWords, setTypedWords] = useState<string[]>([])
  const [currentTypedWord, setCurrentTypedWord] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [historyTotalKeystrokes, setHistoryTotalKeystrokes] = useState(0)
  const [historyCorrectKeystrokes, setHistoryCorrectKeystrokes] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const targetWords = useMemo(() => content.trim().split(/\s+/), [content])

  // Keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts like cmd+r
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Prevent tabbing out
      if (e.key === 'Tab') {
        e.preventDefault()
        return
      }

      // We only care if we are "focused" or globally
      // Let's just listen globally if there's no other inputs
      if (!isFocused) return

      if (e.key === 'Backspace') {
        if (currentTypedWord.length > 0) {
          setCurrentTypedWord(prev => prev.slice(0, -1))
        }
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        if (currentTypedWord.length > 0) {
          const isWordCorrect = currentTypedWord === targetWords[activeWordIndex]
          const newTotal = historyTotalKeystrokes + 1
          const newCorrect = historyCorrectKeystrokes + (isWordCorrect ? 1 : 0)
          
          setHistoryTotalKeystrokes(newTotal)
          setHistoryCorrectKeystrokes(newCorrect)

          const newTypedWords = [...typedWords, currentTypedWord]
          
          if (activeWordIndex + 1 === targetWords.length) {
            // Hitting space on the final word ends the test (even if mistyped)
            finish(newTypedWords, newTotal, newCorrect)
          } else {
            setTypedWords(newTypedWords)
            setActiveWordIndex(activeWordIndex + 1)
            setCurrentTypedWord('')
          }
        }
        return
      }

      if (e.key.length === 1) { // Printable characters
        if (!startTime) setStartTime(Date.now())

        const isCharCorrect = currentTypedWord + e.key === targetWords[activeWordIndex].slice(0, currentTypedWord.length + 1)
        
        const newTotal = historyTotalKeystrokes + 1
        const newCorrect = historyCorrectKeystrokes + (isCharCorrect ? 1 : 0)

        setHistoryTotalKeystrokes(newTotal)
        setHistoryCorrectKeystrokes(newCorrect)

        const newWord = currentTypedWord + e.key
        setCurrentTypedWord(newWord)

        // Auto-complete if it's the very last word and they just typed the final correct character
        if (activeWordIndex === targetWords.length - 1 && newWord === targetWords[activeWordIndex]) {
          const newTypedWords = [...typedWords, newWord]
          finish(newTypedWords, newTotal, newCorrect)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeWordIndex, currentTypedWord, isFocused, startTime, targetWords, typedWords, historyTotalKeystrokes, historyCorrectKeystrokes])

  const finish = (finalTypedWords: string[], finalTotalKeys: number, finalCorrectKeys: number) => {
    const end = Date.now()
    const timeTakenMin = (end - (startTime || end)) / 1000 / 60

    // Math logic
    // Gross WPM = (wpmTotalKeystrokes / 5) / TimeInMin
    let wpmTotalKeystrokes = 0
    let incorrectWordsCount = 0
    let totalTargetChars = 0
    let finalCorrectChars = 0

    targetWords.forEach((target, i) => {
      const typed = finalTypedWords[i] || ""
      wpmTotalKeystrokes += typed.length + 1 // +1 for space
      totalTargetChars += target.length
      
      if (typed !== target) {
        incorrectWordsCount++
      }

      // Calculate final accuracy purely by comparing the submitted strings vs target
      for (let j = 0; j < Math.max(target.length, typed.length); j++) {
        if (target[j] === typed[j]) {
          finalCorrectChars++
        }
      }
    })

    const timeSeconds = (end - (startTime || end)) / 1000
    const minutes = timeTakenMin > 0 ? timeTakenMin : 1 / 60 // avoid infinity

    const grossWpm = (wpmTotalKeystrokes / 5) / minutes
    // Penalize uncorrected words
    let netWpm = grossWpm - (incorrectWordsCount / minutes)
    if (netWpm < 0) netWpm = 0

    const accuracy = totalTargetChars > 0 ? (finalCorrectChars / totalTargetChars) * 100 : 0

    onComplete({
      wpm: netWpm,
      accuracy: accuracy,
      timeSeconds: timeSeconds,
      errors: incorrectWordsCount
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
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--panel-bg)]/60 backdrop-blur-[2px]">
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
            wordBgClass += hasTypo ? 'bg-red-500/20 rounded' : 'bg-gray-500/20 dark:bg-white/10 rounded'
          } else if (isPast && hasTypo) {
            wordBgClass += 'border-b-2 border-red-500'
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
                    colorClass = typedChar === char ? 'text-[var(--text-strong)]' : 'text-red-500 font-bold'
                  }
                }
                
                return (
                  <span key={cIdx} className="relative">
                    {isActive && currentTypedWord.length === cIdx && (
                      <span className="absolute -left-[1px] top-0 bottom-0 w-0.5 bg-blue-500 animate-pulse" />
                    )}
                    <span className={`${colorClass} transition-colors duration-150`}>
                      {char}
                    </span>
                  </span>
                )
              })}

              {/* Extra typed characters */}
              {typedObj.length > word.length && (
                <span className="text-red-500 opacity-80">
                  {typedObj.slice(word.length)}
                </span>
              )}

              {/* Cursor if at the very end of the word or extra chars */}
              {isActive && currentTypedWord.length >= word.length && (
                <span className="relative">
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 animate-pulse" />
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
