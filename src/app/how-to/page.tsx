export default function HowToPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-5xl font-black text-[var(--text-strong)]">How it works</h1>

      <div className="space-y-12 text-lg leading-relaxed text-[var(--text-muted)]">
        <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 shadow-lg">
          <h2 className="mb-6 border-b border-[var(--panel-border)] pb-4 text-3xl font-bold text-[var(--text-strong)]">
            Typing Mechanics
          </h2>
          <ul className="list-inside list-disc space-y-4">
            <li>
              <strong className="text-blue-400">Word-Locking:</strong> You can use backspace freely
              to fix typos <em className="text-[var(--text-strong)]">within</em> the word you are
              currently typing.
            </li>
            <li>
              <strong className="text-blue-400">Commiting a word:</strong> As soon as you press the{' '}
              <code className="rounded bg-[var(--panel-bg)] px-2 py-1 text-[var(--text-strong)]">
                Spacebar
              </code>
              , your word is submitted. You cannot go back to the previous word.
            </li>
            <li>
              <strong className="text-blue-400">Net WPM Calculation:</strong> Your speed is measured
              in strictly Net WPM. Any incorrect words submitted will actively penalize your final
              WPM score just like a real typing test.
            </li>
            <li>
              <strong className="text-blue-400">Accuracy:</strong> Calculated based on the total
              number of correct characters typed overall against the total keystrokes locked in.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 shadow-lg">
          <h2 className="mb-6 border-b border-[var(--panel-border)] pb-4 text-3xl font-bold text-[var(--text-strong)]">
            Difficulty Tiers
          </h2>
          <div className="space-y-6">
            <div className="rounded-xl border border-green-500/20 bg-[var(--panel-bg)] p-4">
              <h3 className="mb-2 text-xl font-bold text-green-400">EASY</h3>
              <p>
                Strictly lowercase english words perfectly structured to form basic sentences. No
                punctuation or numbers.
              </p>
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-[var(--panel-bg)] p-4">
              <h3 className="mb-2 text-xl font-bold text-yellow-400">MEDIUM</h3>
              <p>
                Standard typing format. All cases (upper/lower), forming meaningful sentences.
                Regularly used special characters like commas and fullstops are included.
              </p>
            </div>

            <div className="rounded-xl border border-orange-500/20 bg-[var(--panel-bg)] p-4">
              <h3 className="mb-2 text-xl font-bold text-orange-400">HARD</h3>
              <p>
                Randomly selected English words. Punctuation and special characters are randomly
                injected. Sentences have no coherent meaning.
              </p>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-[var(--panel-bg)] p-4">
              <h3 className="mb-2 text-xl font-bold text-red-500">SUPER HARD</h3>
              <p>
                A chaotic mix of random English words and purely random character permutations (e.g.{' '}
                <code className="rounded bg-black px-1 text-red-300">xznv</code>,{' '}
                <code className="rounded bg-black px-1 text-red-300">asdfhugni</code>) simulating
                code typing entropy.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
