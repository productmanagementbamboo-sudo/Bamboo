import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { END_COVER_MAX, END_COVER_MIN, endorsementCost, submitEndorsement, uploadDocument } from '@/api/mock';
import type { Policy } from '@/api/types';
import { Icon, type IconName } from '@/components/Icon';
import { FlowProgress, Spinner, SuccessBadge, useBack } from '@/components/ui';
import { digitsOnly, faN, fmt, toman } from '@/lib/format';
import { daysUntil } from '@/lib/jalali';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';

type TypeKey = 'cover' | 'person' | 'car' | 'disc';
interface Sub { k: string; t: string; doc?: string; val?: boolean; note?: boolean; slider?: boolean; num?: number; ph?: string }

const TYPES: { k: TypeKey; t: string; s: string; ic: IconName }[] = [
  { k: 'cover', t: 'تغییر پوشش و تعهدات', s: 'افزایش سقف تعهد مالی یا درخواست دیگر', ic: 'shield' },
  { k: 'person', t: 'تغییر مشخصات فردی', s: 'مالک، بیمه‌گذار، آدرس، کدپستی، موبایل', ic: 'user' },
  { k: 'car', t: 'تغییر مشخصات خودرو', s: 'مدل، کاربری، شاسی، موتور، VIN، پلاک', ic: 'car' },
  { k: 'disc', t: 'انتقال یا حذف تخفیفات', s: 'جابه‌جایی یا حذف تخفیف عدم خسارت', ic: 'trend' },
];

const SUBS: Record<TypeKey, Sub[]> = {
  cover: [
    { k: 'raise', t: 'افزایش پوشش مالی', slider: true },
    { k: 'other', t: 'سایر', note: true },
  ],
  person: [
    { k: 'owner', t: 'مشخصات مالک خودرو', doc: 'برگ سبز یا روی کارت ماشین', val: true },
    { k: 'holder', t: 'مشخصات بیمه‌گذار', doc: 'عکس کارت ملی', val: true },
    { k: 'addr', t: 'آدرس', val: true, ph: 'آدرس جدید' },
    { k: 'postal', t: 'کد پستی', val: true, num: 10, ph: '۱۰ رقم' },
    { k: 'mobile', t: 'شماره موبایل', val: true, num: 11, ph: '۰۹۱۲۳۴۵۶۷۸۹' },
    { k: 'other', t: 'سایر تغییرات', note: true },
  ],
  car: [
    { k: 'model', t: 'مدل', doc: 'برگ سبز', val: true },
    { k: 'usage', t: 'کاربری', doc: 'برگ سبز', val: true },
    { k: 'chassis', t: 'شماره شاسی', doc: 'برگ سبز', val: true },
    { k: 'engine', t: 'شماره موتور', doc: 'پشت کارت ماشین یا برگ سبز', val: true },
    { k: 'vin', t: 'شماره VIN', doc: 'روی کارت ماشین یا برگ سبز', val: true },
    { k: 'plate', t: 'تعویض پلاک', doc: 'برگ سبز خودروی جدید', val: true, ph: 'پلاک جدید' },
    { k: 'other', t: 'سایر تغییرات', note: true },
  ],
  disc: [
    { k: 'remove', t: 'حذف تخفیفات از روی بیمه‌نامه', doc: 'تاریخچه نقل و انتقالات' },
    { k: 'move', t: 'انتقال تخفیفات', doc: 'تاریخچه نقل و انتقالات', val: true, ph: 'پلاک مقصد' },
  ],
};

type Step = 'pol' | 'type' | 'subs' | 'detail' | 'review' | 'pay' | 'done';
const TITLES: Record<Step, string> = {
  pol: 'الحاقیه بیمه ثالث', type: 'نوع الحاقیه', subs: 'چه چیزی تغییر می‌کند؟',
  detail: 'جزئیات و مدارک', review: 'مرور و ثبت', pay: 'پرداخت مابه‌التفاوت', done: 'ثبت شد',
};

const subHint = (x: Sub) =>
  x.doc ? 'مدرک لازم: ' + x.doc : x.note ? 'فقط توضیح می‌نویسی' : x.slider ? 'سقف جدید رو انتخاب می‌کنی' : 'بدون مدرک';

export function EndorseFlow() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const leave = useBack('/insurances');
  const policies = useApp((s) => s.policies);
  const addEndorsement = useApp((s) => s.addEndorsement);
  const salis = policies.filter((p) => p.kind === 'salis');

  const [skipPol] = useState(() => salis.some((p) => p.id === params.get('policy') && p.status === 'active'));
  const [policyId, setPolicyId] = useState<string | null>(skipPol ? params.get('policy') : null);
  const [type, setType] = useState<TypeKey | null>(null);
  const [subs, setSubs] = useState<string[]>([]);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<Record<string, 'busy' | 'done'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [cover, setCover] = useState(END_COVER_MIN);
  const [i, setI] = useState(0);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const policy = policies.find((p) => p.id === policyId) ?? null;
  const subList = type ? SUBS[type].filter((x) => subs.includes(x.k)) : [];
  const payable = type === 'cover' && subs.includes('raise') && policy ? endorsementCost(cover, daysUntil(policy.expires)) : 0;

  const steps: Step[] = [
    ...(skipPol ? [] : ['pol' as const]),
    ...(policy ? ['type' as const] : []),
    ...(policy && type ? ['subs', 'detail', 'review', ...(payable ? ['pay'] : []), 'done'] as Step[] : []),
  ];
  if (!steps.length) steps.push('pol');
  const cur = steps[Math.min(i, steps.length - 1)];
  const total = Math.max(steps.length - 1, 4);

  const go = (n: number) => { setI(n); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const back = () => (i > 0 && cur !== 'done' ? go(i - 1) : leave());
  const autoNext = () => setTimeout(() => go(i + 1), 350);

  const detailReady = subList.every((x) => {
    if (x.slider) return true;
    if (x.note) return (notes[x.k] ?? '').trim().length > 3;
    const vOk = !x.val || (vals[x.k] ?? '').trim().length > (x.num ? x.num - 1 : 2);
    return vOk && (!x.doc || docs[x.k] === 'done');
  });

  const scan = async (k: string) => {
    if (docs[k]) return;
    setDocs((d) => ({ ...d, [k]: 'busy' }));
    await uploadDocument();
    setDocs((d) => ({ ...d, [k]: 'done' }));
  };

  const finalize = async () => {
    if (!policy || !type) return;
    setSubmitting(true);
    const r = await submitEndorsement();
    const t = TYPES.find((x) => x.k === type)!;
    addEndorsement(policy.id, {
      t: t.t + (payable ? '، افزایش سقف' : ''), code: r.code, amount: payable, status: payable ? 'done' : 'review',
    });
    setCode(r.code);
    setSubmitting(false);
    go(steps.indexOf('done'));
  };

  const renderStep = () => {
    switch (cur) {
      case 'pol':
        if (!salis.some((p) => p.status === 'active')) {
          return (
            <>
              <div className="warn-band"><Icon name="alert" size={15} /> الحاقیه فقط روی بیمه ثالث فعال ممکنه.</div>
              <button className="btn-primary" onClick={() => navigate('/issue/third-party')}>خرید بیمه ثالث</button>
            </>
          );
        }
        return (
          <>
            <div className="note-band">الحاقیه فقط روی بیمه شخص ثالث ممکنه. برای کدوم بیمه‌نامه می‌خوای؟</div>
            {salis.map((p) => {
              const ok = p.status === 'active';
              return (
                <button key={p.id} className={`choice ${policyId === p.id ? 'sel' : ''}`} style={ok ? undefined : { opacity: 0.5 }}
                  onClick={() => (ok ? (setPolicyId(p.id), autoNext()) : toast('این بیمه‌نامه فعال نیست'))}>
                  <div className="ci"><Icon name="shield" /></div>
                  <div><div className="t13">{p.name}</div><div className="s11">{p.car} · {p.plate}</div></div>
                </button>
              );
            })}
          </>
        );
      case 'type':
        return (
          <>
            <div className="note-band">کدوم مورد رو می‌خوای تغییر بدی؟</div>
            {TYPES.map((t) => (
              <button key={t.k} className={`choice ${type === t.k ? 'sel' : ''}`} onClick={() => {
                if (type !== t.k) { setType(t.k); setSubs([]); setVals({}); setDocs({}); setNotes({}); }
                autoNext();
              }}>
                <div className="ci"><Icon name={t.ic} /></div>
                <div><div className="t13">{t.t}</div><div className="s11">{t.s}</div></div>
              </button>
            ))}
          </>
        );
      case 'subs':
        return (
          <>
            <div className="note-band">هر چند مورد که لازم داری انتخاب کن.</div>
            {SUBS[type!].map((x) => (
              <button key={x.k} className={`choice ${subs.includes(x.k) ? 'sel' : ''}`}
                onClick={() => setSubs((s) => (s.includes(x.k) ? s.filter((k) => k !== x.k) : [...s, x.k]))}>
                <div className="ci"><Icon name="check" size={16} /></div>
                <div style={{ flex: 1 }}><div className="t13">{x.t}</div><div className="s11">{subHint(x)}</div></div>
              </button>
            ))}
            <button className="btn-primary" disabled={!subs.length} onClick={() => go(i + 1)}>ادامه</button>
          </>
        );
      case 'detail':
        return (
          <>
            {subList.map((x) => (
              <div key={x.k} className="list-card" style={{ padding: 14 }}>
                <div className="t13">{x.t}</div>
                {x.slider && (
                  <>
                    <div className="calcbox" style={{ margin: '8px 0 0' }}>
                      <div className="crow"><b>سقف تعهد مالی جدید</b><span>{fmt(cover)} ت</span></div>
                      <input type="range" min={END_COVER_MIN} max={END_COVER_MAX} step={1_000_000} value={cover}
                        aria-label="سقف تعهد مالی جدید" onChange={(e) => setCover(+e.target.value)} />
                      <div className="scale"><span>{fmt(END_COVER_MIN)}</span><span>{fmt(END_COVER_MAX)}</span></div>
                      <div className="s11" style={{ marginTop: 8 }}>سقف فعلی بیمه‌نامه: {toman(END_COVER_MIN)}</div>
                    </div>
                    <div className={payable ? 'ok-band' : 'note-band'} style={{ marginTop: 8 }}>
                      {payable
                        ? <>مابه‌التفاوت قابل پرداخت: <b>{toman(payable)}</b> (به نسبت روزهای باقی‌مانده)</>
                        : 'سقف رو بالا ببر تا مابه‌التفاوت محاسبه بشه.'}
                    </div>
                  </>
                )}
                {x.note && (
                  <div className="field" style={{ margin: '8px 0 0' }}>
                    <textarea className="input" placeholder="توضیح بده چه چیزی باید تغییر کنه." value={notes[x.k] ?? ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [x.k]: e.target.value }))} />
                  </div>
                )}
                {x.val && (
                  <div className="field" style={{ margin: '8px 0 0' }}>
                    <label>مقدار جدید</label>
                    <input className={`input ${x.num ? 'ltr-input' : ''}`} inputMode={x.num ? 'numeric' : undefined}
                      placeholder={x.ph ?? x.t + ' جدید'}
                      value={x.num ? faN(vals[x.k] ?? '') : vals[x.k] ?? ''}
                      onChange={(e) => setVals((v) => ({ ...v, [x.k]: x.num ? digitsOnly(e.target.value, x.num) : e.target.value }))} />
                  </div>
                )}
                {x.doc && (
                  <button className="doc-item doc-btn" style={{ marginTop: 8 }} onClick={() => scan(x.k)}>
                    <div className={`doc-th ${docs[x.k] === 'done' ? 'ok' : ''}`}><Icon name={docs[x.k] === 'done' ? 'check' : 'camera'} /></div>
                    <div className="di-t"><div className="t13">{x.doc}</div><div className="s11">عکس بگیر یا از گالری انتخاب کن</div></div>
                    <span className="mini-btn">{docs[x.k] === 'busy' ? 'در حال ثبت…' : docs[x.k] === 'done' ? 'ثبت شد' : 'افزودن'}</span>
                  </button>
                )}
              </div>
            ))}
            <button className="btn-primary" disabled={!detailReady} onClick={() => go(i + 1)}>ادامه</button>
          </>
        );
      case 'review': {
        const t = TYPES.find((x) => x.k === type)!;
        return (
          <>
            <div className="list-card">
              <div className="tx-row"><div className="l"><div className="s">بیمه‌نامه</div></div><div className="amt" style={{ fontSize: 12.5 }}>{policy!.name} · {policy!.plate}</div></div>
              <div className="tx-row"><div className="l"><div className="s">نوع الحاقیه</div></div><div className="amt" style={{ fontSize: 12.5 }}>{t.t}</div></div>
            </div>
            <div className="list-card">
              {subList.map((x) => (
                <div key={x.k} className="tx-row">
                  <div className="l"><div className="t">{x.t}</div>{x.doc && <div className="s">{x.doc}: {docs[x.k] === 'done' ? 'ثبت شد' : '—'}</div>}</div>
                  <div className="amt review-val">
                    {x.slider ? toman(cover) : x.note ? notes[x.k] : x.num ? faN(vals[x.k] ?? '') : vals[x.k] || (x.doc ? 'با مدرک' : '—')}
                  </div>
                </div>
              ))}
            </div>
            {payable
              ? <div className="ok-band">مابه‌التفاوت قابل پرداخت: <b>{toman(payable)}</b></div>
              : <div className="note-band">این الحاقیه هزینه‌ای نداره. بعد از بررسی مدارک، بیمه‌نامه‌ی اصلاح‌شده برات صادر می‌شه.</div>}
            <button className="btn-primary" disabled={submitting} onClick={() => (payable ? go(i + 1) : finalize())}>
              {submitting ? <><Spinner />در حال ثبت…</> : payable ? 'ادامه به پرداخت' : 'ثبت درخواست الحاقیه'}
            </button>
          </>
        );
      }
      case 'pay':
        return (
          <>
            <div className="list-card">
              <div className="tx-row">
                <div className="l"><div className="t">افزایش سقف تعهد مالی</div><div className="s">از {fmt(END_COVER_MIN)} به {fmt(cover)} تومان</div></div>
                <div className="amt">{toman(payable)}</div>
              </div>
              <div className="tx-row" style={{ borderTop: '1.5px dashed var(--line)' }}>
                <div className="l"><div className="t" style={{ fontWeight: 800 }}>مبلغ قابل پرداخت</div></div>
                <div className="amt" style={{ color: 'var(--forest)', fontSize: 15 }}>{toman(payable)}</div>
              </div>
            </div>
            <div className="note-band">بعد از پرداخت، الحاقیه نهایی و بیمه‌نامه‌ی جدید صادر می‌شه.</div>
            <button className="btn-primary" disabled={submitting} onClick={finalize}>
              {submitting ? <><Spinner />در حال پرداخت…</> : `پرداخت ${toman(payable)}`}
            </button>
          </>
        );
      case 'done': {
        const paid = code && policy?.endorse.find((e) => e.code === code)?.amount;
        return (
          <>
            <SuccessBadge />
            <div className="center-text">
              <div className="h">{paid ? 'الحاقیه صادر شد' : 'درخواست الحاقیه ثبت شد'}</div>
              <div className="s">{paid ? 'بیمه‌نامه‌ی اصلاح‌شده در «بیمه‌های من» در دسترسه.' : 'مدارکت رو بررسی می‌کنیم و نتیجه رو بهت اطلاع می‌دیم.'}</div>
            </div>
            <div className="code-pill" dir="ltr">{code}</div>
            <button className="btn-primary" onClick={() => navigate('/insurances', { replace: true })}>بیمه‌های من</button>
          </>
        );
      }
    }
  };

  return (
    <>
      <div className="subheader">
        <button className="back" onClick={back} aria-label="بازگشت"><Icon name="back" /></button>
        <h2>{TITLES[cur]}</h2>
      </div>
      <FlowProgress total={total} current={Math.min(i, total - 1)} />
      <div className="flow-page"><div className="flow-body"><div className="fstep active">
        {policy && cur !== 'pol' && cur !== 'done' && <PolicyContext policy={policy} typeLabel={TYPES.find((x) => x.k === type)?.t}
          onChange={skipPol ? undefined : () => go(0)} />}
        {renderStep()}
      </div></div></div>
    </>
  );
}

function PolicyContext({ policy, typeLabel, onChange }: { policy: Policy; typeLabel?: string; onChange?: () => void }) {
  return (
    <div className="end-ctx">
      <div className="ic"><Icon name="shield" size={16} /></div>
      <div className="tx"><b>الحاقیه {policy.name}</b><small>{policy.car} · {policy.plate}{typeLabel ? ' · ' + typeLabel : ''}</small></div>
      {onChange && <button className="mini-btn" onClick={onChange}>تغییر</button>}
    </div>
  );
}
