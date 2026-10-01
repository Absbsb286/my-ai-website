const projects = [
  {
    title: "Toko Online Kopi",
    description:
      "Website e-commerce untuk brand kopi lokal dengan katalog produk dan sistem checkout.",
    tags: ["Next.js", "Tailwind CSS"],
  },
  {
    title: "Dashboard Analitik",
    description:
      "Dashboard interaktif untuk memantau performa penjualan secara real-time.",
    tags: ["React", "TypeScript"],
  },
  {
    title: "Landing Page Startup",
    description:
      "Landing page modern dan responsif untuk startup teknologi dengan fokus konversi.",
    tags: ["Next.js", "Tailwind CSS"],
  },
];

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Project Manager, PT Maju Jaya",
    quote:
      "Proses kerja sama berjalan sangat lancar. Hasilnya melebihi ekspektasi kami, dan kini website kami tampil jauh lebih profesional.",
    photo: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Sari Wijaya",
    role: "Pemilik, Sari's Bakery",
    quote:
      "Terima kasih banyak! Setelah memakai website baru ini, pesanan online kami meningkat dua kali lipat dalam sebulan.",
    photo: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Andi Pratama",
    role: "CTO, Nusantara Tech",
    quote:
      "Kode yang rapi, performa cepat, dan komunikasinya jelas. Kami pasti akan bekerja sama lagi untuk proyek berikutnya.",
    photo: "https://i.pravatar.cc/150?img=33",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <main className="text-center max-w-2xl mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Website Otomatis Saya v2
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Halaman ini diubah oleh AI secara otomatis.
        </p>
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

      <section aria-label="Projects" className="w-full max-w-5xl mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Projects
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.title}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {project.title}
              </h3>
              <p className="mt-2 text-gray-600">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Testimoni Klien" className="w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Testimoni Klien
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <p className="text-gray-700 italic">
                “{testimonial.quote}”
              </p>
              <div className="mt-6 flex items-center gap-4">
                <img
                  src={testimonial.photo}
                  alt={`Foto ${testimonial.name}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}