import {createSharedPathnamesNavigation} from 'next-intl/navigation';


export const locales = ['en', 'es', 'zh'] as const;
export type Locale = 'en' | 'es' | 'zh';

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({locales});
