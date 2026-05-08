export default function Loading() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
      </div>
      <p className="text-[var(--text-muted)] font-mono tracking-widest uppercase text-sm animate-pulse">Loading workspace</p>
    </div>
  )
}
