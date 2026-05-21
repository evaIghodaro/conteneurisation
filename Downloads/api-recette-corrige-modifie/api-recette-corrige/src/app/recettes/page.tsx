import RecipeSearch from '@/components/RecipeSearch';

export default function RecettesPage() {
  return (
    <div className="pb-16 pt-8">
      <div className="warm-container space-y-8">
        <section className="recipe-banner px-6 py-12 sm:px-10 lg:px-14">
          <div className="max-w-2xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#ffdcb6]">
              catalogue des recettes
            </p>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Explorez les saveurs du monde</h1>
            <p className="max-w-xl text-lg leading-8 text-[#fff0e2]">
              Parcourez les recettes, filtrez selon vos envies et profitez d&apos;une page plus chaleureuse, plus visuelle et plus proche de l&apos;univers cuisine.
            </p>
          </div>
        </section>

        <RecipeSearch />
      </div>
    </div>
  );
}
