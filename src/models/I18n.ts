/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable import/no-extraneous-dependencies */
import { Languages } from '@prisma/client';
import i18n from 'i18n';

import { Logger } from '../services/logger.js';
import { Locale } from '../utils/Locales.js';

const logger = new Logger();

export function initI18n(): void {
    i18n.configure({
        locales: Object.keys(Languages),
        defaultLocale: 'EnglishUS',
        directory: `${process.cwd()}/locales`,
        retryInDefaultLocale: true,
        objectNotation: true,
        register: global,
        logWarnFn: console.warn,
        logErrorFn: console.error,
        missingKeyFn: function (_locale, value) {
            return value;
        },
        mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false,
        },
    });

    logger.info('I18n has been initialized');
}

export { i18n };

export function T(locale: string, text: string | i18n.TranslateOptions, ...params: any): string {
    i18n.setLocale(locale);
    return i18n.__(text, ...params);
}

export function inlineLocalization(lan: any, name: any, desc: any): any {
    return {
        name: [Locale[lan], name],
        description: [Locale[lan], T(lan, desc)],
    };
}

export function inlineDescriptionLocalization(name: any, text: any): any {
    return i18n
        .getLocales()
        .map(locale => inlineLocalization(Locale[locale] || locale, name, text));
}

export function inlineChoicesLocale(text: string | i18n.TranslateOptions): any {
    const o = {};
    i18n.getLocales().forEach(locale => {
        o[Locale[locale] || locale] = T(locale, text);
    });
    return o;
}
