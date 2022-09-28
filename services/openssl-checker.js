module.exports = (host, ip) => {
    const [currentIp = host, port = 443] = ip.split(':');
    const connect = ip ? `-connect ${currentIp}:${port} ` : '';
    const command = `openssl s_client -servername ${host.trim()} ${connect} | openssl x509 -noout -dates`;

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

    try {
        const result = require('child_process').execSync(`openssl s_client -servername ${host} ${connect} | openssl x509 -noout -dates`).toString();

        const validTo = result.match(/notAfter=(.+)\n/)[1];
        const validFrom = result.match(/notBefore=(.+)\n/)[1];

        return {
            error: false,
            state: 'finished',
            host,
            hostByIp: currentIp,
            port,
            valid: getDaysRemaining(new Date(), new Date(validTo)) > 0,
            valid_from: validFrom,
            valid_to: validTo,
            issuer: '',
            expires_in: getDaysRemaining(new Date(), new Date(validTo)),
            ip,
        }
    } catch (e) {
        return {
            error: e.toString(),
            state: 'error',
            host,
            hostByIp: currentIp,
            port,
            valid: false,
            valid_from: false,
            valid_to: false,
            issuer: false,
            expires_in: false,
            ip,
        }
    }
}
