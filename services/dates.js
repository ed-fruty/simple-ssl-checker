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

const getDaysRemainingFromNow = date => getDaysRemaining(new Date(), new Date(date));

const isValidDate = date => getDaysRemainingFromNow(date) > 0;

module.exports = {
    getDaysRemainingFromNow,
    isValidDate,
}
