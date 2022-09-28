const https = require('./https-ssl-checker');
const openssl = require('./openssl-checker');

module.exports = async (checker, host, ip) => {

    // const parseIps = (ips) => {
    //     return ips.split(/\r?\n/).join(' ').split(' ')
    // }
    //
    // const ips = parseIps(ip);

    if (checker === 'openssl') {
        return openssl(host, ip);
    }

    return https(host, ip);
}
