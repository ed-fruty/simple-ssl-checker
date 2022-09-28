'use strict';

const https = require('https');
const { getDaysRemainingFromNow, isValidDate } = require('./dates');

const getSSLCertificateInfo = async (host, ip) => {
    let [hostByIp = host, port = 443] = ip.split(':');

    const options = {
        agent: false,
        method: 'HEAD',
        port: port,
        rejectUnauthorized: false,
        hostname: hostByIp ? hostByIp.trim() : host.trim(),
        headers: {
            Host: host.trim()
        },
        timeout: 10
    };

    const promise = new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            const crt = res.connection.getPeerCertificate();
            const expiresIn = getDaysRemainingFromNow(crt.valid_to);

            resolve({
                expires_in: expiresIn,
                valid:  res.socket.authorized || isValidDate(crt.valid_to) || false,
                valid_from: crt.valid_from,
                valid_to: crt.valid_to,
                host,
                hostByIp,
                port,
                issuer: crt.issuer?.CN ? crt.issuer.CN : crt.issuer?.O,
                error: false,
                state: 'finished',
                ip,
            });
        });

        req.on('error', reject);
        req.end();
    });

    try {
        return await promise;
    } catch (e) {
        return {
            error: e.toString(),
            host,
            hostByIp,
            port,
            valid: false,
            valid_from: false,
            valid_to: false,
            issuer: false,
            expires_in: false,
            state: 'error',
            ip,
        }
    }
};


module.exports = async (host, ip) => {
    return await getSSLCertificateInfo(host, ip);
}
