import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Policy } from '@/api/types';
import { Icon, type IconName } from '@/components/Icon';
import { faN } from '@/lib/format';
import { daysUntil } from '@/lib/jalali';
import { plateShort } from '@/lib/plate';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';
import { TopBar } from '@/layout/TopBar';

export function HomePage() {
  const navigate = useNavigate();
  const { auth, policies } = useApp();
  const showCards = auth && policies.length > 0;
  const [activeCard, setActiveCard] = useState(0);

  const endorse = () => {
    if (!policies.some((p) => p.kind === 'salis' && p.status === 'active')) {
      toast('برای الحاقیه، اول باید یک بیمه ثالث فعال داشته باشی');
      return;
    }
    navigate('/endorse');
  };

  const actions: { icon: IconName; label: string; go(): void; hot?: boolean }[] = [
    { icon: 'car', label: 'ثالث', go: () => navigate('/issue/third-party') },
    { icon: 'shield', label: 'بدنه', go: () => navigate('/issue/body') },
    { icon: 'doc', label: 'خسارت', go: () => navigate('/claim/new') },
    { icon: 'alert', label: 'تصادف کردم', go: () => navigate('/accident'), hot: true },
    { icon: 'endorse', label: 'الحاقیه', go: endorse },
    { icon: 'users', label: 'اشتراک‌گذاری اطلاعات', go: () => navigate('/profile/contacts') },
    { icon: 'wallet', label: 'کیف پول', go: () => navigate('/wallet') },
    { icon: 'chat', label: 'دستیار خرید', go: () => navigate('/advisor') },
  ];

  const cardCount = showCards ? policies.length + 1 : 1;

  return (
    <>
      <TopBar />
      <button className="home-search" onClick={() => navigate('/advisor')}>
        <Icon name="search" size={17} />
        <span className="ph">دنبال چه چیزی هستی؟</span>
        <span className="go"><Icon name="camera" size={15} /></span>
      </button>

      {!auth && (
        <div className="home-head">
          <div className="greet">سلام</div>
          <h1>ثالث و بدنه‌ی خودرو و موتور،<br /><em>تمام‌آنلاین</em></h1>
          <p>قیمت بگیر، مدارک رو با عکس ثبت کن، همون لحظه بخر.</p>
        </div>
      )}

      {showCards && (
        <div className="home-sec-h">
          <div className="t">بیمه‌های من</div>
          <button className="a link-btn" onClick={() => navigate('/insurances')}>همه</button>
        </div>
      )}

      <div
        className="cards-row"
        onScroll={(e) => {
          const el = e.currentTarget;
          setActiveCard(Math.round(Math.abs(el.scrollLeft) / 282));
        }}
      >
        {showCards && policies.map((p) => <InsureCard key={p.id} p={p} />)}
        <div className="insure-empty" role="button" tabIndex={0} onClick={() => navigate('/issue/third-party')}>
          <b>{auth ? 'اولین بیمه‌ات رو بگیر' : 'هنوز بیمه‌ای نداری'}</b>
          <span>بیمه‌نامه‌ات رو اینجا مثل یه کارت نگه می‌داریم</span>
          <span className="cta-pill">شروع صدور بیمه ثالث</span>
        </div>
      </div>
      {cardCount > 1 && (
        <div className="card-dots">
          {Array.from({ length: cardCount }, (_, i) => <i key={i} className={i === activeCard ? 'on' : ''} />)}
        </div>
      )}

      <div className="qa-row">
        {actions.map((a) => (
          <button key={a.label} className={a.hot ? 'hot' : ''} onClick={a.go}>
            <div className="ic"><Icon name={a.icon} size={20} /></div>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      <div className="trust-band">
        <div className="h">
          تا اینجا فقط قیمت دیدی. تفاوت اصلی ما جای دیگه‌ست: <b>خسارتت رو هم خودمون، تا واریز نهایی، پیش می‌بریم</b> — نه اینکه فقط بیمه رو بهت بفروشیم.
        </div>
        <div className="trust-stats">
          <div className="ts"><b>زیر ۲ دقیقه</b><span>صدور بیمه ثالث</span></div>
          <div className="ts"><b>تمام‌آنلاین</b><span>از اعلام تا واریز خسارت</span></div>
        </div>
      </div>

      <div className="home-panel">
        {([
          ['badge', 'گزارش راهور', 'اتصال خودکار به راهور', '/assistant/police'],
          ['scale', 'تعیین مقصر', 'پیش‌بینی غیررسمی', '/assistant/fault'],
          ['camera', 'مستندسازی صحنه', 'راهنمای عکس‌برداری', '/assistant/docguide'],
        ] as [IconName, string, string, string][]).map(([ic, t, s, to]) => (
          <div key={to} className="home-row" role="button" tabIndex={0} onClick={() => navigate(to)}>
            <div className="ic"><Icon name={ic} size={20} /></div>
            <div className="tx"><b>{t}</b><small>{s}</small></div>
            <div className="chev"><Icon name="chevron" size={20} /></div>
          </div>
        ))}
      </div>
    </>
  );
}

function InsureCard({ p }: { p: Policy }) {
  const navigate = useNavigate();
  const docs = p.status === 'docs';
  const pending = p.status === 'pending';
  const active = p.status === 'active';
  return (
    <div
      className={`insure-card ${p.kind}`}
      role="button"
      tabIndex={0}
      onClick={() => navigate(docs ? `/issue/body?resume=${p.id}` : '/insurances')}
    >
      <div className="ic-top">
        <span className="ic-kind">{p.kind === 'salis' ? 'ثالث' : 'بدنه'}</span>
        <span className={`ic-st ${active ? '' : 'warn'}`}>{docs ? 'در انتظار مدارک' : pending ? 'در حال صدور' : 'فعال'}</span>
      </div>
      <div className="ic-plate">{plateShort(p.plate)}</div>
      {active ? (
        <div className="ic-bottom">
          <div className="ic-car">{p.car || 'خودرو'}<small>تا {p.expires}</small></div>
          <div className="ic-days"><b>{faN(daysUntil(p.expires))}</b><small>روز مانده</small></div>
        </div>
      ) : (
        <div className="ic-note">
          {docs ? 'پرداختت ثبت شد. بعد از تکمیل مدارک صادر می‌شه.' : 'بیمه مرکزی الان پاسخ نمی‌ده، صدور در صفه.'}
        </div>
      )}
      {active && p.kind === 'salis' && (
        <button className="ic-endorse-btn" onClick={(e) => { e.stopPropagation(); navigate(`/endorse?policy=${p.id}`); }}>
          <Icon name="endorse" size={14} /><span>الحاقیه</span>
        </button>
      )}
    </div>
  );
}
