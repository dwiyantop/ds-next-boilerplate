import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
};

const DEMO_TOKEN = 'demo-auth-token';

export const getSession = async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookie = cookieStore.get('demo-auth');
  const headerToken = headerStore.get('x-demo-auth');

  if (cookie?.value === DEMO_TOKEN || headerToken === DEMO_TOKEN) {
    return {
      user: {
        id: '0001',
        name: 'GAG Demo User',
        email: 'demo@example.com',
        roles: ['admin'],
      },
    };
  }

  return null;
};

export const requireSession = async (): Promise<Session> => {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
};
