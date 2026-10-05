import { useEffect, useState } from 'react';
import type { Contact } from '@/api/types';
import { Sheet, SubHeader, ToggleRow } from '@/components/ui';
import { digitsOnly, faN, isMobile } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';

const RELATIONS = ['همسر', 'پدر یا مادر', 'دوست', 'مدیر ناوگان'];
const MAX = 3;

export function ContactsPage() {
  const { contacts, updateContact, removeContact } = useApp();
  const [adding, setAdding] = useState(false);
  const [invite, setInvite] = useState<Contact | null>(null);

  const togglePerm = (c: Contact, k: 'docs' | 'sos') => {
    updateContact(c.id, { [k]: !c[k] });
    if (c[k]) toast('دسترسی همان لحظه قطع شد');
  };

  return (
    <>
      <SubHeader title="افراد مورد اعتماد" backTo="/profile"
        extra={<span className="s11" style={{ marginRight: 'auto' }}>{faN(contacts.length)} از {faN(MAX)}</span>} />
      <div className="rose-page">
        <div className="note-band" style={{ background: 'var(--surface)' }}>
          تا سه نفر رو انتخاب کن که در تصادف خبردار بشن یا بیمه‌نامه‌ات رو ببینن. هر دسترسی رو جدا کنترل می‌کنی، و تا وقتی فرد دعوت رو تأیید نکنه هیچ دسترسی‌ای فعال نمی‌شه.
        </div>
        <div style={{ marginTop: 14 }}>
          {contacts.length ? contacts.map((c) => (
            <div key={c.id} className="contact-card">
              <div className="cc-top">
                <div className="avatar sm">{c.name[0]}</div>
                <div className="cc-info"><div className="t13">{c.name}</div><div className="s11">{c.rel} · {faN(c.phone)}</div></div>
                <span className={`status ${c.status === 'active' ? 'done' : 'pending'}`}>{c.status === 'active' ? 'فعال' : 'در انتظار تأیید'}</span>
              </div>
              <div className="perm-list">
                <ToggleRow label="مشاهده و دریافت بیمه‌نامه‌ها" on={c.docs} onToggle={() => togglePerm(c, 'docs')} />
                <ToggleRow label="پیامک و تماس اضطراری هنگام تصادف" on={c.sos} onToggle={() => togglePerm(c, 'sos')} />
              </div>
              <div className="cc-actions">
                {c.status === 'pending' && <button className="mini-btn" onClick={() => setInvite(c)}>نمای فرد دعوت‌شده</button>}
                <button className="mini-btn danger" onClick={() => { removeContact(c.id); toast('فرد مورد اعتماد حذف شد و همه‌ی دسترسی‌هاش قطع شد'); }}>حذف</button>
              </div>
            </div>
          )) : <div className="list-card s11" style={{ textAlign: 'center' }}>هنوز کسی رو اضافه نکردی.</div>}
        </div>
        {contacts.length < MAX && <button className="btn-primary" onClick={() => setAdding(true)}>افزودن فرد مورد اعتماد</button>}
      </div>
      <AddContactSheet open={adding} onClose={() => setAdding(false)} />
      <InviteSheet contact={invite} onClose={() => setInvite(null)} />
    </>
  );
}

function AddContactSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const addContact = useApp((s) => s.addContact);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rel, setRel] = useState(RELATIONS[0]);
  const [docs, setDocs] = useState(true);
  const [sos, setSos] = useState(true);

  useEffect(() => {
    if (open) { setName(''); setPhone(''); setRel(RELATIONS[0]); setDocs(true); setSos(true); }
  }, [open]);

  const save = () => {
    addContact({ name: name.trim(), phone, rel, docs, sos });
    onClose();
    toast('پیامک دعوت ارسال شد');
  };

  return (
    <Sheet open={open} title="افزودن فرد مورد اعتماد" onClose={onClose}>
      <div className="field"><label htmlFor="cm-name">نام</label>
        <input id="cm-name" className="input" placeholder="مثلاً مامان" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field" style={{ marginTop: 10 }}><label htmlFor="cm-phone">شماره موبایل</label>
        <input id="cm-phone" className="input ltr-input" inputMode="numeric" placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          value={faN(phone)} onChange={(e) => setPhone(digitsOnly(e.target.value, 11))} />
      </div>
      <div className="field" style={{ marginTop: 10 }}><label>نسبت</label>
        <div className="chip-row">
          {RELATIONS.map((r) => <button key={r} className={`chip ${rel === r ? 'sel' : ''}`} onClick={() => setRel(r)}>{r}</button>)}
        </div>
      </div>
      <div className="perm-list" style={{ marginTop: 14 }}>
        <ToggleRow label="مشاهده و دریافت بیمه‌نامه‌ها" on={docs} onToggle={() => setDocs(!docs)} />
        <ToggleRow label="پیامک و تماس اضطراری هنگام تصادف" on={sos} onToggle={() => setSos(!sos)} />
      </div>
      <div className="warn-band" style={{ marginTop: 12 }}>یه پیامک دعوت براش می‌فرستیم. تا وقتی تأیید نکنه، هیچ دسترسی‌ای فعال نمی‌شه.</div>
      <button className="btn-primary" style={{ marginTop: 14 }} disabled={!name.trim() || !isMobile(phone)} onClick={save}>ارسال دعوت</button>
    </Sheet>
  );
}

function InviteSheet({ contact, onClose }: { contact: Contact | null; onClose(): void }) {
  const { user, updateContact, removeContact } = useApp();
  const respond = (ok: boolean) => {
    if (!contact) return;
    if (ok) { updateContact(contact.id, { status: 'active' }); toast('فرد مورد اعتماد دعوت رو تأیید کرد. دسترسی‌ها فعال شد.'); }
    else { removeContact(contact.id); toast('دعوت رد شد'); }
    onClose();
  };
  return (
    <Sheet open={!!contact} title="نمای فرد دعوت‌شده" onClose={onClose}>
      <div className="s11" style={{ marginBottom: 8 }}>این همون پیامیه که فرد مورد اعتماد می‌بینه (نمایشی).</div>
      <div className="sms-preview">{user.name} شما را به عنوان فرد مورد اعتماد خود در بامبو انتخاب کرده است. جهت تأیید روی لینک کلیک کنید.</div>
      <div className="btn-pair">
        <button className="btn-primary" onClick={() => respond(true)}>تأیید می‌کنم</button>
        <button className="btn-secondary" onClick={() => respond(false)}>قبول نمی‌کنم</button>
      </div>
    </Sheet>
  );
}
