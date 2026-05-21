import Link from 'next/link';
// Icônes Lucide - bibliothèque d'icônes SVG modernes et légères
import { UserPlus, ChefHat, Heart, Globe2 } from 'lucide-react';

// Étapes "Comment ça marche" - section statique qui explique le site
const steps = [
  {
    Icon: UserPlus,
    title: 'Crée ton compte',
    desc: 'Inscris-toi en quelques secondes pour rejoindre la communauté.',
  },
  {
    Icon: ChefHat,
    title: 'Partage tes recettes',
    desc: 'Ajoute tes plats préférés avec photos, ingrédients et étapes.',
  },
  {
    Icon: Heart,
    title: 'Sauvegarde tes favoris',
    desc: 'Garde sous la main les recettes que tu veux refaire.',
  },
  {
    Icon: Globe2,
    title: 'Voyage culinaire',
    desc: 'Découvre les saveurs du monde partagées par les autres membres.',
  },
];

const countries = [
  { name: 'Italie 🍝', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop' },
  { name: 'Japon 🍱', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop' },
  { name: 'Mexique 🌮', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
  { name: 'Inde 🍛', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop' },
];

export default function Home() {
  return (
    <div className="pb-20">
      <section className="warm-container pt-8 sm:pt-10">
        <div className="warm-hero flex items-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="relative z-10 max-w-2xl text-white">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#ffdcb6]">
              Cuisine • voyage • partage
            </p>
            <h1 className="mb-5 text-5xl font-bold leading-tight sm:text-6xl">
              Recettes du Monde
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#fff3e6] sm:text-xl">
              Découvrez des recettes venues d&apos;ailleurs dans une ambiance plus chaleureuse, inspirée d&apos;un vrai univers culinaire.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/recettes"
                className="rounded-full bg-[#e87526] px-7 py-3.5 font-semibold text-white transition hover:bg-[#cf651c]"
              >
                Explorer les recettes
              </Link>
              <Link
                href="/favorites"
                className="soft-pill rounded-full px-7 py-3.5 font-semibold text-white"
              >
                Voir mes favoris
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="warm-container mt-10">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-800">Comment ça marche ?</h2>
        <p className="mb-10 text-center text-gray-600 max-w-2xl mx-auto">
          Recettes du Monde est une plateforme communautaire où chacun peut partager ses recettes préférées et découvrir celles des autres.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.Icon;
            return (
              <div
                key={step.title}
                className="rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex items-center justify-between">
                  {/* Conteneur d'icône avec dégradé orange */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md">
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">{step.title}</h3>
                <p className="text-sm leading-6 text-gray-600">{step.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="inline-block rounded-full bg-orange-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Rejoindre la communauté
          </Link>
        </div>
      </section>

      <section className="warm-container mt-12 mb-16 pb-8">
        <h2 className="mb-6 text-3xl font-bold text-gray-800">Explorer par pays</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {countries.map((country, index) => (
            <Link key={country.name} href={`/recettes?country=${country.name.split(' ')[0]}`} className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl block">
              <div className="relative h-40 overflow-hidden">
                <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{country.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="warm-container mt-16">
        <div className="grid gap-8 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 shadow-[0_18px_38px_rgba(232,117,38,0.12)] lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="section-title mb-3">À propos du projet</p>
            <h2 className="mb-4 text-3xl font-bold text-[#2f241f] sm:text-4xl">
              Voyagez à travers les saveurs du monde entier
            </h2>
            <p className="mb-4 text-lg leading-8 text-[#6f6259]">
              Recettes du Monde rassemble une sélection variée de plats venus des quatre coins du globe : entrées, plats principaux, desserts, recettes végétariennes, halal ou casher — il y en a pour tous les goûts et tous les régimes.
            </p>
            <p className="text-lg leading-8 text-[#6f6259]">
              Créez un compte pour ajouter vos propres recettes, enregistrer vos favoris et partager votre passion de la cuisine avec une communauté de gourmands.
            </p>
          </div>
          <div className="h-[300px] rounded-2xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
              alt="Cuisine du monde"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
