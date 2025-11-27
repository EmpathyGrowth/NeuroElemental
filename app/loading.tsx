export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-500/30 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-8" />
          <h2 className="text-2xl font-bold text-foreground animate-pulse">
            Loading NeuroElemental...
          </h2>
        </div>
      </main>
    </div>
  );
}





