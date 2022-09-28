const { getDaysRemainingFromNow, isValidDate } = require("./dates");

module.exports = (host, ip) => {
    const [currentIp = host, port = 443] = ip.split(':');
    const connect = ip ? `-connect ${currentIp}:${port} ` : '';

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
            valid: isValidDate(validTo),
            valid_from: validFrom,
            valid_to: validTo,
            issuer: '',
            expires_in: getDaysRemainingFromNow(validTo),
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
