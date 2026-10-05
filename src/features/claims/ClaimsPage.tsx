import { useNavigate } from 'react-router';
import type { Claim } from '@/api/types';
import { Icon } from '@/components/Icon';
import { Empty, TabHeader } from '@/components/ui';
import { useApp } from '@/store/app';

export function claimStatus(c: Claim): [string, string] {
  if (c.branch === 'bod' || c.finType === 'non') return ['در انتظار تماس', 'pending'];
  if (c.link === 'paid') return ['واریز شد', 'done'];
  if (c.link === 'rej') return ['مالک نپذیرفت', 'bad'];
  return ['منتظر مالک ماشین', 'pending'];
}

export function ClaimsPage() {
  const navigate = useNavigate();
  const claims = useApp((s) => s.claims);
  return (
    <>
      <TabHeader title="خسارت" />
      <div className="peach-page">
        <div className="claim-hero">
          <div><div className="t">اعلام خسارت فوری</div><div className="s">تشکیل پرونده آنلاین در چند دقیقه</div></div>
          <button className="btn" onClick={() => navigate('/claim/new')}>شروع</button>
        </div>
        <div className="claim-row">
          <button className="claim-card" onClick={() => navigate('/claim/new?branch=fin')}>
            <div className="claim-icon"><Icon name="car" /></div><div className="tile-t">خسارت مالی</div>
          </button>
          <button className="claim-card" onClick={() => navigate('/claim/new?branch=bod')}>
            <div className="claim-icon"><Icon name="heart" /></div><div className="tile-t">تصادف جانی</div>
          </button>
        </div>
        <div className="recent-t">خسارت‌های من</div>
        {claims.length ? claims.map((c) => {
          const [label, cls] = claimStatus(c);
          return (
            <button key={c.id} className="recent-item" onClick={() => navigate(`/claims/${c.id}`)}>
              <div className="l"><div className="t">{c.title}</div><div className="s">{c.date} · <bdi dir="ltr">{c.id}</bdi></div></div>
              <div className={`status ${cls}`}>{label}</div>
            </button>
          );
        }) : <Empty>هنوز پرونده‌ای نداری.</Empty>}
      </div>
    </>
  );
}
