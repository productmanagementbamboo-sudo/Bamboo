// Small presentational building blocks shared across pages.
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from './Icon';
import { useUi } from '@/store/ui';

export function Spinner() {
  return <span className="spin" />;
}

export function Switch({ on }: { on: boolean }) {
  return <span className={`switch ${on ? 'on' : ''}`} />;
}

export function ToggleRow({ label, sub, on, onToggle }: { label: string; sub?: string; on: boolean; onToggle(): void }) {
  return (
    <div className="toggle-row" role="switch" aria-checked={on} tabIndex={0} onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}>
      <span className="lbl">{label}{sub && <span className="sub">{sub}</span>}</span>
      <Switch on={on} />
    </div>
  );
}

export function Chevron() {
  return <span className="chev"><Icon name="chevron" size={14} /></span>;
}

/** Back = browser history when there is any, otherwise a sensible parent. */
export function useBack(fallback = '/') {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
}

export function SubHeader({ title, onBack, backTo = '/', extra }: {
  title: ReactNode; onBack?: () => void; backTo?: string; extra?: ReactNode;
}) {
  const back = useBack(backTo);
  return (
    <div className="subheader">
      <button className="back" onClick={onBack ?? back} aria-label="بازگشت"><Icon name="back" /></button>
      <h2>{title}</h2>
      {extra}
    </div>
  );
}

export function TabHeader({ title }: { title: string }) {
  return <div className="subheader"><h2>{title}</h2></div>;
}

export function FlowProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flow-progress">
      {Array.from({ length: total }, (_, i) => <div key={i} className={`seg ${i <= current ? 'done' : ''}`} />)}
    </div>
  );
}

export function Sheet({ open, title, onClose, children }: {
  open: boolean; title: ReactNode; onClose(): void; children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="بستن"><Icon name="close" size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast() {
  const t = useUi((s) => s.toast);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!t) return;
    setVisible(true);
    const h = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(h);
  }, [t]);
  return <div className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">{t?.msg}</div>;
}

export function SuccessBadge() {
  return <div className="success-badge"><Icon name="check" size={28} style={{ stroke: '#fff' }} /></div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="s11" style={{ textAlign: 'center', padding: 14 }}>{children}</div>;
}
