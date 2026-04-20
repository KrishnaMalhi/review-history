import { redirect } from 'next/navigation';

export default function AdminVerifyRedirectPage() {
  redirect('/auth/login');
}
