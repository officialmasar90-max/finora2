import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Apakah Finora gratis digunakan?',
    answer: 'Ya, Finora memiliki paket Gratis yang bisa Anda gunakan tanpa biaya. Anda dapat meningkatkan ke paket Premium kapan saja untuk membuka fitur lengkap seperti konsultan AI dan laporan mendalam.',
  },
  {
    question: 'Apakah data keuangan saya aman?',
    answer: 'Keamanan data kami prioritaskan. Finora menggunakan enkripsi tingkat bank untuk melindungi informasi Anda. Semua data disimpan dengan standar keamanan tertinggi dan tidak dibagikan kepada pihak ketiga.',
  },
  {
    question: 'Bagaimana cara Konsultan AI bekerja?',
    answer: 'Konsultan AI menganalisis pola transaksi, anggaran, dan tujuan keuangan Anda, lalu memberikan rekomendasi personal yang relevan. Saran AI membantu Anda mengoptimalkan pengeluaran dan mencapai target lebih cepat.',
  },
  {
    question: 'Apakah saya perlu pengetahuan keuangan untuk menggunakan Finora?',
    answer: 'Sama sekali tidak. Finora dirancang untuk semua orang, dari pemula hingga yang berpengalaman. Antarmuka kami intuitif dan panduan disediakan di setiap langkah untuk membantu Anda memahami keuangan dengan mudah.',
  },
  {
    question: 'Apakah Finora tersedia di mobile?',
    answer: 'Ya, Finora dirancang responsif dan dapat diakses dengan optimal di smartphone, tablet, maupun desktop. Anda dapat memantau keuangan kapan saja dan di mana saja.',
  },
  {
    question: 'Bisakah saya membatalkan langganan Premium?',
    answer: 'Tentu. Anda dapat membatalkan langganan Premium kapan saja tanpa penalti. Setelah pembatalan, akun Anda kembali ke paket Gratis dengan fitur dasar yang tetap tersedia.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Pertanyaan yang sering diajukan
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Temukan jawaban atas pertanyaan umum tentang Finora.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-200 ${
                  isOpen ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                >
                  <span className="text-sm sm:text-base font-semibold text-navy-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? 'max-h-60' : 'max-h-0'
                  }`}
                >
                  <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
