const https = require('./https-ssl-checker');
const openssl = require('./openssl-checker');

module.exports = async (checker, host, ip) => {
    if (checker === 'openssl') {
        return openssl(host, ip);
    }

    return https(host, ip);
}
