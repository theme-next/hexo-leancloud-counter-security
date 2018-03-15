[hexo-image]: https://img.shields.io/badge/hexo-%3E%3D%203.0-blue.svg
[node-image]: https://img.shields.io/node/v/hexo-leancloud-counter-security.svg
[size-image]: https://img.shields.io/github/size/theme-next/hexo-leancloud-counter-security/index.js.svg
[mnt-image]: https://img.shields.io/maintenance/yes/2018.svg
[npm-image]: https://img.shields.io/npm/v/hexo-leancloud-counter-security.svg
[dm-image]: https://img.shields.io/npm/dm/hexo-leancloud-counter-security.svg
[dt-image]: https://img.shields.io/npm/dt/hexo-leancloud-counter-security.svg
[lic-image]: https://img.shields.io/npm/l/hexo-leancloud-counter-security.svg

[hexo-url]: https://hexo.io
[node-url]: https://nodejs.org/en/download/releases
[npm-url]: https://www.npmjs.com/package/hexo-leancloud-counter-security


# hexo-leancloud-counter-security
[![hexo-image]][hexo-url]
[![node-image]][node-url]
[![npm-image]][npm-url]
[![mnt-image]](../../commits/master)
[![lic-image]](LICENSE)

A plugin to fix a serious security bug in leancloud visitor counter for NexT theme site and other site that integrated this function using a similar way.

A full document to set the counter up and running safely:

[https://leaferx.online/2018/02/11/lc-security/](https://leaferx.online/2018/02/11/lc-security/)(Only Chinese for now)

English document is still under translating.

Recommend to read the doc first.

## Installation
![size-image]
[![dm-image]][npm-url]
[![dt-image]][npm-url]

```bash
npm install hexo-leancloud-counter-security --save
```

## Usage
Activate this plugin in hexo's _config.yml (which locates in the root dir of your blog) by filling those options:
```yml
leancloud_counter_security:
  enable_sync: true
  app_id: <<your app id>>
  app_key: <<your app key>>
  username: <<your username>> # Will be asked while deploying if is left blank
  password: <<your password>> # Recommmended to be left blank. Will be asked while deploying if is left blank
```
If `leancloud_counter_security` not specified (or commented), plugin will totally disabled.

### NexT theme
This plugin integrated in «NexT» and after plugin enabled in main Hexo config, need to enable options in NexT config:
```yml
leancloud_visitors:
  enable: true
  security: true
  app_id: <<your app id>>
  app_key: <<your app key>>
```
You should build the Leancloud background first to make the counter active.

After that, install this plugin and config it to make the counter safe.

### Console Command
```
hexo lc-counter register <<username>> <<password>>
```
or
```
hexo lc-counter r <<username>> <<password>>
```
Register a user in your Leancloud database for authority control.
