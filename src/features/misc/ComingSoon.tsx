import { useNavigate } from 'react-router';
import { Icon } from '@/components/Icon';
import { SubHeader } from '@/components/ui';

/** Placeholder for prototype screens not yet ported to React. */
export function ComingSoon({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <>
      <SubHeader title={title} />
      <div className="white-page gate">
        <div className="gate-ic"><Icon name="clock" size={26} /></div>
        <div className="center-text">
          <div className="h">این بخش در حال انتقال است</div>
          <div className="s">طراحی‌اش در نسخه‌ی HTML آماده است و در فاز بعدی به اپ اضافه می‌شود.</div>
        </div>
        <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>بازگشت به خانه</button>
      </div>
    </>
  );
}
