---
title: Hox
hero:
  title: Hox
  desc: 在 React 组件间共享状态
---

> 这里是 Hox v2 的文档，如果你在使用 v1，那么请前往[这里](https://github.com/umijs/hox/blob/v1/README.md)

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
&nbsp;
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
&nbsp;
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

```shell
npm add hox@2.0.0-rc.0
```

## 在线体验

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/awmleer/todo-app-with-hox/tree/master/)

## 从状态管理到状态共享

在 Hox v1 中，我们一直宣称它是一个"状态管理"库。

不妨回想（或者了解）一下 redux、zustand、recoil 这些状态管理库，它们虽然在一定程度上也可以帮我们解决数据共享的问题，但它们最本质的能力还是对数据的操作。它们被称做也确实应该被称做"状态管理"工具。

而 Hox 想解决的问题，不是如何组织和操作数据，不是数据流的分层、异步、细粒度，我们希望 Hox 只聚焦于一个痛点：在多个组件间共享状态。

如果你也意识到了，层层传递的 `value` `onChange` 会对一个优质代码库带来的毁灭性影响，粗暴地把数据塞在 redux 中也并不能让一个应用得到很好的拓展性和可维护性，那么 Hox 或许会是一个适合你的"状态共享"方案，它简单、轻量、可靠，适合无论大小的几乎所有项目。

## 为什么要用 Hox？

- 直接复用已有的 React 知识，几乎没有学习成本，你怎么写 React 组件，就可以怎么写 Store
- 为灵活重构而设计，在 Store 和组件中使用同一套 DSL 可以让你几乎 0 成本的将组件的局部状态转化为一个组件间共享的状态
- 同时支持局部状态和全局状态，在灵活和简单之间做到了很好的平衡
- 优秀的性能和 TypeScript 支持
