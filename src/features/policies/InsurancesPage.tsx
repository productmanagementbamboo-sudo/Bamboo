import { useNavigate } from 'react-router';
import { TabHeader } from '@/components/ui';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';

const STATUS = {
  active: ['فعال', 'done'],
  docs: ['در انتظار تکمیل مدارک', 'pending'],
  pending: ['در انتظار صدور', 'pending'],
} as const;

export function InsurancesPage() {
  const navigate = useNavigate();
  const policies = useApp((s) => s.policies);
  return (
    <>
      <TabHeader title="بیمه‌های من" />
      <div className="mint-page">
        <button className="new-btn" onClick={() => navigate('/')}>صدور بیمه جدید</button>
        {policies.map((p) => {
          const [label, cls] = STATUS[p.status];
          return (
            <div key={p.id} className="policy-card">
              <div className="top">
                <div><div className="name">{p.name}</div><div className="plate">{p.plate}</div></div>
                <div className={`status ${cls}`}>{label}</div>
              </div>
              <div className="meta">
                <div className="m"><div className="k">تاریخ صدور</div><div className="v">{p.issued}</div></div>
                <div className="m"><div className="k">تاریخ انقضا</div><div className="v">{p.expires}</div></div>
              </div>
              {p.endorse.map((e) => <span key={e.code} className="end-chip">{e.t}</span>)}
              <div className="pol-actions">
                {p.kind === 'salis' && p.status === 'active' && (
                  <button onClick={() => navigate(`/endorse?policy=${p.id}`)}>درخواست الحاقیه ›</button>
                )}
                {p.status === 'active' && (
                  <>
                    <button onClick={() => navigate(`/claim/new?policy=${p.id}`)}>اعلام خسارت ›</button>
                    <button onClick={() => toast('دانلود PDF در این نمونه شبیه‌سازی شده')}>دانلود PDF</button>
                  </>
                )}
                {p.status === 'docs' && <button onClick={() => navigate(`/issue/body?resume=${p.id}`)}>تکمیل مدارک ›</button>}
                {p.status === 'pending' && <span style={{ color: 'var(--ink-soft)' }}>صدور در صف است</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
