import { useNavigate } from 'react-router';
import { Icon, type IconName } from '@/components/Icon';
import { Chevron, TabHeader } from '@/components/ui';

type Row = [IconName, string, string, string];

const NOW: Row[] = [
  ['camera', 'مستندسازی صحنه تصادف', 'راهنمای عکس‌برداری و ثبت اطلاعات', '/assistant/docguide'],
  ['scale', 'تعیین مقصر', 'پیش‌بینی غیررسمی از روی شرح حادثه', '/assistant/fault'],
  ['badge', 'دریافت گزارش راهور', 'اتصال خودکار به API پلیس راهور', '/assistant/police'],
  ['wrench', 'درخواست امداد خودرو', 'اعزام سریع در محل', '/assistant/service/tow'],
  ['cross', 'درخواست اورژانس', 'اعزام آمبولانس به موقعیت شما', '/assistant/service/amb'],
  ['truck', 'درخواست جرثقیل', 'حمل خودرو پس از حادثه', '/assistant/service/crane'],
  ['users', 'اشتراک‌گذاری اطلاعات', 'هر کی باید خبردار بشه رو از قبل مشخص کن', '/profile/contacts'],
];
const AFTER: Row[] = [
  ['phone', 'تماس حمایتی کال‌سنتر', 'مشاوره‌ی روانی پس از حادثه', '/assistant/support'],
  ['ticket', 'کد تخفیف حمل‌ونقل جایگزین', 'ارسال خودکار پس از تصادف', '/assistant/ride'],
  ['note', 'پرسشنامه‌ی علت تصادف', 'یک روز پس از حادثه ارسال می‌شود', '/assistant/survey'],
  ['gauge', 'تقویم فنی خودرو', 'در صورت اعلام علت فنی حادثه', '/assistant/carcal'],
  ['brain', 'پکیج سلامت روان', 'در صورت اعلام علت روانی حادثه', '/assistant/mind'],
];

export function AssistantPage() {
  const navigate = useNavigate();
  const row = ([ic, t, s, to]: Row) => (
    <button key={to} className="assist-row" onClick={() => navigate(to)}>
      <div className="assist-icon"><Icon name={ic} /></div>
      <div><div className="t">{t}</div><div className="s">{s}</div></div>
      <Chevron />
    </button>
  );
  return (
    <>
      <TabHeader title="دستیار هوشمند مدیریت حادثه" />
      <div className="lilac-page">
        <div className="claim-hero">
          <div><div className="t">تصادف کردی؟</div><div className="s">یه مسیر قدم‌به‌قدم، از سلامتی تا ثبت خسارت</div></div>
          <button className="btn" onClick={() => navigate('/accident')}>شروع</button>
        </div>
        <div className="section-tag">همین الان</div>
        {NOW.map(row)}
        <div className="section-tag">بعد از حادثه</div>
        {AFTER.map(row)}
      </div>
    </>
  );
}
