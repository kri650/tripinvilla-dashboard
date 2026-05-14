import { UserCircle } from 'lucide-react';
export default function Account() {
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Account</div></div>
      <div className="content-card">
        <div className="empty-state"><UserCircle /><p>Account content management will appear here.</p></div>
      </div>
    </div>
  );
}
