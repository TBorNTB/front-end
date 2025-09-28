import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
/*
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {},
        password: {},
      },
      authorize(credentials) {
        // Validate user and return user object
        return { id: 1, name: 'Nurul', role: 'user' }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role
      return session
    },
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
  },
})*/