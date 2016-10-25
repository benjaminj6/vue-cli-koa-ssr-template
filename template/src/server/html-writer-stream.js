var Transform = require('stream').Transform

module.exports = class HtmlWriterStream extends Transform {
  constructor(options = {}) {
    super(options);
    this.started = false;
  }

  get isHead() {
    return !this.started;
  }

  head(data) {
    this.push(`<!DOCTYPE html><html lang="en">
<head>
  <meta charset="utf-8">
  <title>${this.options.title || 'No title'}</title>
  <link href="/bundle.css" rel='stylesheet' type='text/css'>
</head><body>${data}`);

    this.started = false;
  }

  body(data) {
    this.push(data.toString());
  }

  footer() {
    this.push(`<script src="/bundle.js"></script>
  </body>
</html>`);

    // end the stream
    this.push(null);
  }

  _transform(chunk, encoding, done) {
      var data = chunk.toString()
      this.isHead ? this.head(data) : this.body(data);
      done();
  }

  _flush(done) {
      this.footer();
      this._lastLineData = null
      done();
  }
}