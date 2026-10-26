import { en } from './en';
import { es } from './es';

import { moment } from 'obsidian';

export function t(key: keyof typeof en, ...args: string[]): string {
    const locale = moment.locale() || 'en';
    
    let translation = key as string;

    if (locale === 'es') {
        translation = es[key] || en[key] || key;
    } else {
        translation = en[key] || key;
    }

    args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, arg);
    });

    return translation;
}
