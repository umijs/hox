---
title: Hox
hero:
  title: Hox
  desc: State sharing for React components.
---

> Here is the documentation for Hox v2, if you are using v1 then go to [here](https://github.com/umijs/hox/blob/v1/README.md)

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
&nbsp;
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
&nbsp;
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

```shell
npm add hox@2.0.0-alpha.2
```

## Play Hox in Codesandbox

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/awmleer/todo-app-with-hox/tree/master/)

## From state management to state sharing

In Hox v1, we've been calling it a "state management" library.

May wish to recall (or understand) these state management libraries such as redux, zustand, and recoil. Although they can also help us solve the problem of data sharing to a certain extent, their most essential ability is to operate data. They are called and really should be called "state management" tools.

The problem that Hox wants to solve is not how to organize and operate data, nor the hierarchical, asynchronous, and fine-grained data flow. We hope that Hox will only focus on one pain point: sharing state among multiple components.

If you also realize that the `value` `onChange` passed from layer to layer will have a devastating impact on a high-quality code base, and rudely stuffing data into redux will not make an application very scalable and effective. Maintainability, then Hox may be a "state sharing" solution for you, it's simple, lightweight, reliable, and suitable for almost any project no matter how big or small.

## Why use Hox?

- Direct reuse of existing React knowledge, almost no learning cost, how you write React components, you can write Store
- Designed for flexible refactoring, using the same DSL in Store and components allows you to convert a component's local state into a state shared between components at almost zero cost
- Supports both local and global states, a good balance between flexibility and simplicity
- Excellent performance and TypeScript support
