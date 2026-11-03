import { redirect } from 'next/navigation';

// @next-codemod-ignore
export const instant = false;

export default function RootPage() {
  redirect('/home');
}
