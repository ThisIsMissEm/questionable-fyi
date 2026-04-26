import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'chromeless/login': ExtractProps<(typeof import('../../inertia/pages/chromeless/login.tsx'))['default']>
    'chromeless/onboarding': ExtractProps<(typeof import('../../inertia/pages/chromeless/onboarding.tsx'))['default']>
    'chromeless/signup': ExtractProps<(typeof import('../../inertia/pages/chromeless/signup.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'interviews': ExtractProps<(typeof import('../../inertia/pages/interviews.tsx'))['default']>
    'profiles/show': ExtractProps<(typeof import('../../inertia/pages/profiles/show.tsx'))['default']>
  }
}
