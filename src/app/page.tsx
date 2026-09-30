export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <main className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Halo, ini Website AI Pertama Saya! 🚀
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Dibuat dengan Next.js + Vercel + AI
        </p>
        <a
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Pelajari Lebih Lanjut
        </a>
      </main>
    </div>
  );
}