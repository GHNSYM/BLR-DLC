export type NotificationPermissionState =
  | 'unsupported'
  | NotificationPermission

const SERVICE_WORKER_URL = '/notification-sw.js'

export function getNotificationPermission(): NotificationPermissionState {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function registerNotificationWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL)
    return registration
  } catch {
    return null
  }
}

export async function requestBrowserNotifications() {
  if (!('Notification' in window)) return 'unsupported' as const
  await registerNotificationWorker()
  return Notification.requestPermission()
}

export async function showBrowserNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const options: NotificationOptions = {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: `blr-july-jam-${title}`,
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null)
    if (registration) {
      registration.showNotification(title, options)
      return
    }
  }

  new Notification(title, options)
}
