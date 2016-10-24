const koa = require('koa');
const router = require('koa-router')();
const serve = require('koa-static');
const {vueHandler} = require('./middlewares/vue');
const HtmlWriterStream = require('./html-writer-stream');

/*
* HTTP server class.
*/

exports.Server = class {

  /*
  * Class constructor.
  */

  constructor(config) {
    this._config = Object.assign(config);

    this._app = null;
    this._server = null;
  }

  /*
  * Returns a promise which starts the server.
  */

  listen() {
    return async () => {
      if (this._server) return this;

      this._app = new koa();

      // serve static assets
      let staticPath = 'dist/client';
      app.use(serve(staticPath));

      // basic middlewware to set config on ctx
      app.use(async(ctx, next) => {
        ctx.config = this._config;
        await next();
      });

      // streaming from root route
      router.get('/', async (ctx, next) => {
        ctx.type = 'html';
        if (ctx.vue) {
          let stream = ctx.vue.renderToStream();
          let htmlWriter = new HtmlWriterStream();
          ctx.body = stream.pipe(htmlWriter);
        } else {
          console.log('no .vue object found on ctx. No SSR streaming possible :()');
        }
        await next();
      });

      app
        .use(router.routes())
        .use(router.allowedMethods());

      this._app.use(vueHandler(this._config));

      let {serverPort, serverHost} = this._config;
      this._server = await this._app.listen(serverPort, serverHost);
    });
  }

  /*
  * Returns a promise which stops the server.
  */

  close() {
    return async () => {
      if (!this._server) return this;

      await this._server.close();

      this._server = null;
      this._app = null;
    });
  }

}
