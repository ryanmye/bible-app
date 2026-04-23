import type { Version } from '../../domain/bible/types';

export const BUNDLED_VERSIONS: readonly Version[] = [
  {
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'en',
    source: 'bundled',
    copyright: 'Public Domain',
    installedAt: 0,
  },
  {
    id: 'asv',
    name: 'American Standard Version',
    abbreviation: 'ASV',
    language: 'en',
    source: 'bundled',
    copyright: 'Public Domain',
    installedAt: 0,
  },
  {
    id: 'web',
    name: 'World English Bible',
    abbreviation: 'WEB',
    language: 'en',
    source: 'bundled',
    copyright: 'Public Domain',
    installedAt: 0,
  },
] as const;
