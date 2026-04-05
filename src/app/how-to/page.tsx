export default function HowToPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-black text-[var(--text-strong)] mb-8">How it works</h1>
      
      <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">
        
        <section className="bg-[var(--panel-bg)] p-8 rounded-2xl border border-[var(--panel-border)] shadow-lg">
          <h2 className="text-3xl font-bold text-[var(--text-strong)] mb-6 border-b border-[var(--panel-border)] pb-4">Typing Mechanics</h2>
          <ul className="space-y-4 list-disc list-inside">
            <li><strong className="text-blue-400">Word-Locking:</strong> You can use backspace freely to fix typos <em className="text-[var(--text-strong)]">within</em> the word you are currently typing.</li>
            <li><strong className="text-blue-400">Commiting a word:</strong> As soon as you press the <code className="bg-[var(--panel-bg)] px-2 py-1 rounded text-[var(--text-strong)]">Spacebar</code>, your word is submitted. You cannot go back to the previous word.</li>
            <li><strong className="text-blue-400">Net WPM Calculation:</strong> Your speed is measured in strictly Net WPM. Any incorrect words submitted will actively penalize your final WPM score just like a real typing test.</li>
            <li><strong className="text-blue-400">Accuracy:</strong> Calculated based on the total number of correct characters typed overall against the total keystrokes locked in.</li>
          </ul>
        </section>

        <section className="bg-[var(--panel-bg)] p-8 rounded-2xl border border-[var(--panel-border)] shadow-lg">
          <h2 className="text-3xl font-bold text-[var(--text-strong)] mb-6 border-b border-[var(--panel-border)] pb-4">Difficulty Tiers</h2>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[var(--panel-bg)] border border-green-500/20">
              <h3 className="text-green-400 font-bold mb-2 text-xl">EASY</h3>
              <p>Strictly lowercase english words perfectly structured to form basic sentences. No punctuation or numbers.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-[var(--panel-bg)] border border-yellow-500/20">
              <h3 className="text-yellow-400 font-bold mb-2 text-xl">MEDIUM</h3>
              <p>Standard typing format. All cases (upper/lower), forming meaningful sentences. Regularly used special characters like commas and fullstops are included.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-[var(--panel-bg)] border border-orange-500/20">
              <h3 className="text-orange-400 font-bold mb-2 text-xl">HARD</h3>
              <p>Randomly selected English words. Punctuation and special characters are randomly injected. Sentences have no coherent meaning.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-[var(--panel-bg)] border border-red-500/20">
              <h3 className="text-red-500 font-bold mb-2 text-xl">SUPER HARD</h3>
              <p>A chaotic mix of random English words and purely random character permutations (e.g. <code className="bg-black text-red-300 px-1 rounded">xznv</code>, <code className="bg-black text-red-300 px-1 rounded">asdfhugni</code>) simulating code typing entropy.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
