'use strict';

const https = require('https');

const getDaysBetween = (validFrom, validTo) => {
    return Math.round(Math.abs(+validFrom - +validTo) / 8.64e7);
};

const getDaysRemaining = (validFrom, validTo) => {
    const daysRemaining = getDaysBetween(validFrom, validTo);
    if (new Date(validTo).getTime() < new Date().getTime()) {
        return -daysRemaining;
    }
    return daysRemaining;
};

const formatDate = date => date; // new Date(date).toISOString().slice(0, 19).replace('T', ' ');

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

    console.log(options);

    const promise = new Promise((resolve, reject) => {
        try {
            const req = https.request(options, res => {
                const crt = res.connection.getPeerCertificate(),
                    vFrom = crt.valid_from, vTo = crt.valid_to;
                resolve({
                    expires_in: getDaysRemaining(new Date(), new Date(vTo)),
                    valid:  res.socket.authorized || getDaysRemaining(new Date(), new Date(vTo)) > 0 || false,
                    valid_from: formatDate(vFrom),
                    valid_to: formatDate(vTo),
                    host,
                    hostByIp: hostByIp,
                    port,
                    issuer: crt.issuer?.CN ? crt.issuer.CN : crt.issuer?.O,
                    error: false,
                    state: 'finished',
                    ip,
                });
            });
            req.on('error', reject);
            req.end();
        } catch (e) {
            reject({
                error: e.toString(),
                host,
                hostByIp,
                port,
                expires_in: false,
                valid: false,
                valid_from: false,
                valid_to: false,
                issuer: false,
                state: 'error',
                ip,
            });
        }
    });

    try {
        return await promise;
    } catch (e) {
        console.error(e);
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


const checkCertificateValidity = async host => {
    let isValid = true;
    try {
        const res = await getSSLCertificateInfo(this.host);
        if(res.daysRemaining <= 0 || !res.valid) {
            isValid = false;
        }
    } catch(err)  {
        isValid = false;
    }

    return isValid;
};


module.exports = async (host, ip) => {
    return await getSSLCertificateInfo(host, ip);
}
