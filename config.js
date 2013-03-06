var path = require('path');

exports.config = {
    site_url      : 'http://localhost/',
    upload_dir    : path.join(__dirname, 'public', 'upload'),
    root_dir      : __dirname,
    static_dir    : 'public',
    port          : '80',
    db            : 'mongodb://localhost/migs',
    cookies_prefix: 'migs_',
    session_secret: 'migsapp',
}