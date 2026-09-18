import { Link } from 'react-router-dom';

export default function ProviderCard({ provider }) {
  return (
    <article className="card overflow-hidden p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-lg font-bold text-slate-700">
          {provider.profileImage || provider.user?.profileImage ? (
            <img className="h-full w-full object-cover" src={provider.profileImage || provider.user.profileImage} alt="" />
          ) : (provider.businessName?.[0] || 'P')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-bold">{provider.businessName}</h3>
            {provider.isVerified && <span className="pill">Verified</span>}
          </div>
          <p className="mt-1 text-sm text-slate-500">{provider.city || provider.address || 'Local provider'}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(provider.services || []).slice(0, 3).map((s) => <span className="pill" key={s._id}>{s.name}</span>)}
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4 text-center">
        <div><div className="font-bold">⭐ {provider.rating?.toFixed?.(1) ?? provider.rating ?? '—'}</div><div className="text-xs text-slate-400">Rating</div></div>
        <div><div className="font-bold">{provider.totalReviews ?? 0}</div><div className="text-xs text-slate-400">Reviews</div></div>
        <div><div className="font-bold">₹{provider.pricePerVisit || 0}</div><div className="text-xs text-slate-400">Visit</div></div>
      </div>
      <Link to={`/providers/${provider._id}`} className="btn-primary block text-center text-sm">View profile</Link>
    </article>
  );
}
