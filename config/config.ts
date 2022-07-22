import { IConfig } from 'dumi'

const config: IConfig = {
  mode: 'site',
  title: 'Hox',
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
  menus: {
    '/guide': [
      {
        title: 'Quick Start',
        path: '/guide/quick-start',
      },
      {
        title: 'Performance',
        path: '/guide/performance',
      },
      {
        title: 'Use in Class Components',
        path: '/guide/use-in-class-components',
      },
    ],
    '/zh/guide': [
      {
        title: '快速上手',
        path: '/guide/quick-start',
      },
      {
        title: '性能优化',
        path: '/guide/performance',
      },
      {
        title: '在类组件中使用',
        path: '/guide/use-in-class-components',
      },
    ],
  },
  resolve: {
    includes: ['docs'],
    passivePreview: true,
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
      content: 'State sharing for React components.',
    },
    {
      name: 'google-site-verification',
      content: '283Gpan2mySpkvW36ciOJaQryX3dH7C0Hr3sRM5L_hM',
    },
  ],
  hash: true,
  locales: [
    ['en', 'English'],
    ['zh', '中文'],
  ],
  exportStatic: {},
  // dynamicImport: {},
}

export default config
