class Utils {
    static getRootUrl(req) {
        const protocol = req.protocol; 
        const host = req.get('host');

        return `${protocol}://${host}`;
    }
}

module.exports = Utils;