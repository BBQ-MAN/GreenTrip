// NextAuth catch-all Route Handler
// App Router에서 NextAuth handler 자체가 dynamic이므로 별도 dynamic 선언 불필요.
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
