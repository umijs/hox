import { IConfig } from 'dumi'

const config: IConfig = {
  mode: 'site',
  title: 'Hox',
  history: {
    type: 'hash',
  },
  navs: {
    'en': [
      {
        title: 'Guide',
        path: '/guide',
      },
      {
        title: 'Releases',
        path: 'https://github.com/umijs/hox/releases',
      },
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/hox',
      },
    ],
    'zh': [
      {
        title: '指南',
        path: '/zh/guide',
      },
      {
        title: '发布日志',
        path: 'https://github.com/umijs/hox/releases',
      },
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/hox',
      },
    ],
  },
  resolve: {
    includes: ['docs'],
  },
  metas: [
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover',
    },
    {
      name: 'keywords',
      content: 'hox, React, State Management',
    },
    {
      name: 'description',
      content: 'Sharing states between React components.',
    },
  ],
  hash: true,
  locales: [
    ['en', 'English'],
    ['zh', '中文'],
  ],
  // exportStatic: {},
  // dynamicImport: {},
}

export default config
