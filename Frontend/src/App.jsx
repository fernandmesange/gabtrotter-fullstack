import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,237,213,0.9),transparent_55%),linear-gradient(180deg,#fff7ed,white_60%,#ffedd5)] px-6 py-16 text-slate-900">
      <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-orange-200/70 bg-white/85 shadow-2xl shadow-orange-200/40 backdrop-blur">
        <div className="bg-orange-500 px-8 py-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Message officiel
            </div>
            <img className="h-10 w-auto" src="/logo-blanc.png" alt="Logo Gabtrotter" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
            Fermeture définitive de l&apos;association Gabtrotter
          </h1>
        </div>
        <div className="flex flex-col gap-6 px-8 py-8">
          <div className="space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            <p>
              L&apos;association Gabtrotter informe le public, ses partenaires et l&apos;ensemble de sa
              communauté qu&apos;à compter du 31 mars 2026, elle cessera définitivement ses activités
              et fermera ses portes.
            </p>
            <p>
              Cette décision marque la fin d&apos;un parcours associatif riche en initiatives, en
              engagements et en collaborations qui ont contribué, durant ces années, à promouvoir
              nos actions et nos valeurs.
            </p>
            <p>
              Nous adressons nos sincères remerciements à toutes les personnes, institutions et
              partenaires qui ont accompagné l&apos;association tout au long de son existence.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200/70 bg-orange-50/80 px-5 py-4 text-sm text-orange-900">
            Pour toute information complémentaire, merci de contacter :
            <a className="ml-2 font-semibold underline" href="mailto:associationgabtrotter@gmail.com">
              associationgabtrotter@gmail.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
