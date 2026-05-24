import { isLoggedIn } from '../services/authApi'

// Pages that require login
const AUTH_PAGES = [
  'pages/caretaker-login/index'
]

// Pages that should redirect to home if already logged in
const REDIRECT_IF_LOGGED_IN = [
  'pages/caretaker-login/index'
]

export function checkAuth(path: string): string | null {
  const isAuth = AUTH_PAGES.some(page => path.includes(page))
  const isRedirect = REDIRECT_IF_LOGGED_IN.some(page => path.includes(page))
  const loggedIn = isLoggedIn()

  if (isAuth && loggedIn && !isRedirect) {
    return '/pages/caretaker-home/index'
  }

  if (!isAuth && !loggedIn) {
    return '/pages/caretaker-login/index'
  }

  return null
}
