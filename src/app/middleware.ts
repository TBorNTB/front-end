//Role based access control (RBAC) middleware example
// Typical middleware.ts pattern for SSG auth
import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/admin', '/projects', '/topics']
const publicRoutes = ['/login', '/signup', '/']

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = protectedRoutes.includes(path)
  const token = req.cookies.get('session')?.value
  
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return NextResponse.next()
}
// You can expand this middleware to check user roles and permissions
// by decoding the token and verifying access rights for each route.