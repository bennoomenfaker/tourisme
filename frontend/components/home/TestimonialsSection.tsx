"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Amina B.",
    role: "Éco-Voyageuse",
    text: "EcoVoyage m'a permis de découvrir des endroits magnifiques tout en soutenant les communautés locales. Une expérience inoubliable !",
    rating: 5,
    avatar: "https://picsum.photos/seed/testimonial1/100/100",
  },
  {
    name: "Youssef M.",
    role: "Guide local",
    text: "Grâce à la plateforme, je peux partager ma passion pour les circuits éco-responsables et rencontrer des voyageurs du monde entier.",
    rating: 5,
    avatar: "https://picsum.photos/seed/testimonial2/100/100",
  },
  {
    name: "Sophie L.",
    role: "Propriétaire de projet",
    text: "Enfin une plateforme qui valorise les projets durables. Nos réservations ont augmenté de 40% depuis que nous avons rejoint EcoVoyage.",
    rating: 5,
    avatar: "https://picsum.photos/seed/testimonial3/100/100",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-6 md:px-20 lg:px-40 max-w-[1440px] mx-auto">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
          Ce que disent nos voyageurs
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Des milliers de voyageurs, guides et propriétaires nous font confiance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative"
          >
            <Quote size={24} className="text-primary/20 absolute top-4 right-4" />
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
