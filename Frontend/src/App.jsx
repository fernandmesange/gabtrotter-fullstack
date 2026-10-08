import { useRef, useState } from 'react';
import { CheckCircle2, FileKey2, Landmark, LockKeyhole, Send } from 'lucide-react';
import axiosInstance from './api/axiosInstance';

const requestTypes = [
  ['ACCESS', 'Accéder à mes données'],
  ['RECTIFICATION', 'Rectifier mes données'],
  ['ERASURE', 'Effacer mes données'],
  ['RESTRICTION', 'Limiter le traitement'],
  ['OBJECTION', "M'opposer au traitement"],
  ['WITHDRAW_CONSENT', 'Retirer mon consentement'],
];

function App() {
  const [form, setForm] = useState({ submissionId: '', accessCode: '', type: 'ACCESS', contactEmail: '', details: '' });
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const statusRef = useRef(null);
  const update = ({ target: { name, value } }) => setForm((current) => ({ ...current, [name]: value }));

  const submitRequest = async (event) => {
    event.preventDefault();
    setStatus({ kind: 'loading', message: 'Envoi de la demande en cours.' });
    try {
      const { data } = await axiosInstance.post('/privacy/requests', form);
      setStatus({
        kind: 'success',
        message: `Demande enregistrée. Identifiant de suivi : ${data.requestId}. Échéance indicative : ${new Date(data.deadlineAt).toLocaleDateString('fr-FR')}.`,
      });
      setForm((current) => ({ ...current, details: '' }));
    } catch (error) {
      setStatus({ kind: 'error', message: error.response?.data?.message || "La demande n'a pas pu être enregistrée." });
    } finally {
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-[#17211e]">
      <header className="border-b-4 border-[#f97316] bg-[#17211e] text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <img className="h-10 w-auto" src="/logo-blanc.png" alt="Gabtrotter" />
          <span className="text-sm font-semibold">Information officielle</span>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-5xl gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <section aria-labelledby="closure-title">
          <p className="mb-3 font-semibold text-[#b54708]">Association Gabtrotter</p>
          <h1 id="closure-title" className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl">Fermeture définitive de l&apos;association</h1>
          <div className="mt-7 space-y-4 text-base leading-7 text-[#3f4d48] sm:text-lg">
            <p>L&apos;association Gabtrotter informe le public, ses partenaires et l&apos;ensemble de sa communauté qu&apos;à compter du 31 mars 2026, elle cessera définitivement ses activités et fermera ses portes.</p>
            <p>Cette décision marque la fin d&apos;un parcours associatif riche en initiatives, en engagements et en collaborations qui ont contribué, durant ces années, à promouvoir nos actions et nos valeurs.</p>
            <p>Nous adressons nos sincères remerciements à toutes les personnes, institutions et partenaires qui ont accompagné l&apos;association tout au long de son existence.</p>
          </div>
          <div className="mt-7 border-l-4 border-[#0f766e] bg-white px-5 py-4 text-sm text-[#243f3a]">Pour toute information complémentaire :{' '}<a className="font-semibold underline decoration-2 underline-offset-4" href="mailto:associationgabtrotter@gmail.com">associationgabtrotter@gmail.com</a></div>
        </section>
        <section aria-labelledby="rights-title" className="self-start border border-[#cad3cf] bg-white p-5 shadow-[6px_6px_0_#dce5e1] sm:p-7">
          <div className="flex items-start gap-3">
            <FileKey2 className="mt-1 h-7 w-7 shrink-0 text-[#0f766e]" aria-hidden="true" />
            <div><h2 id="rights-title" className="text-2xl font-bold">Exercer vos droits</h2><p className="mt-2 leading-6 text-[#4c5a55]">Utilisez le reçu confidentiel remis après l&apos;enquête. Le code sert uniquement à retrouver la soumission concernée.</p></div>
          </div>
          <form className="mt-7 space-y-5" onSubmit={submitRequest}>
            <div><label className="mb-2 block font-semibold" htmlFor="submissionId">Identifiant de soumission</label><input className="field" id="submissionId" name="submissionId" value={form.submissionId} onChange={update} autoComplete="off" required /></div>
            <div><label className="mb-2 block font-semibold" htmlFor="accessCode">Code confidentiel</label><input className="field font-mono" id="accessCode" name="accessCode" value={form.accessCode} onChange={update} autoComplete="off" required /></div>
            <div><label className="mb-2 block font-semibold" htmlFor="type">Nature de la demande</label><select className="field" id="type" name="type" value={form.type} onChange={update}>{requestTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div><label className="mb-2 block font-semibold" htmlFor="contactEmail">Adresse de contact <span className="font-normal text-[#5d6a66]">(facultatif)</span></label><input className="field" id="contactEmail" name="contactEmail" type="email" value={form.contactEmail} onChange={update} autoComplete="email" /></div>
            <div><label className="mb-2 block font-semibold" htmlFor="details">Précisions <span className="font-normal text-[#5d6a66]">(facultatif)</span></label><textarea className="field min-h-28 resize-y" id="details" name="details" value={form.details} onChange={update} /></div>
            <button className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#c2410c] px-5 py-3 font-bold text-white hover:bg-[#9a3412] disabled:cursor-wait disabled:bg-[#716761]" type="submit" disabled={status.kind === 'loading'}><Send className="h-5 w-5" aria-hidden="true" />{status.kind === 'loading' ? 'Envoi en cours' : 'Envoyer la demande'}</button>
          </form>
          {status.message && <div ref={statusRef} tabIndex="-1" role={status.kind === 'error' ? 'alert' : 'status'} className={`mt-5 flex gap-3 border-l-4 p-4 ${status.kind === 'error' ? 'border-[#b91c1c] bg-[#fef2f2] text-[#7f1d1d]' : 'border-[#0f766e] bg-[#f0fdfa] text-[#134e4a]'}`}>{status.kind === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" /> : <LockKeyhole className="h-5 w-5 shrink-0" aria-hidden="true" />}<p>{status.message}</p></div>}
          <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-[#4c5a55]"><Landmark className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Une demande ne déclenche pas automatiquement une suppression : elle est vérifiée puis traitée par une personne habilitée.</p>
        </section>
      </div>
    </main>
  );
}

export default App;
