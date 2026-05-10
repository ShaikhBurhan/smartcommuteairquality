function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-6">
        {/* Animated rings */}
        <div className="relative w-20 h-20">
          <div
            className="absolute inset-0 rounded-full border-4 border-slate-100"
          ></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500"
            style={{
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-emerald-300"
            style={{
              animation: 'spin 1.5s linear infinite reverse',
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-3 h-3 bg-emerald-500 rounded-full"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            ></div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.25em]">
            Loading Module
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                style={{
                  animation: 'bounce 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
