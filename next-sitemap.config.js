/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://hechun.tech',
    generateRobotsTxt: true,
    exclude: ['/dashboard/*', '/adminLogin', '/auth/*', '/404', '/500'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/*', '/adminLogin', '/auth/*', '/404', '/500'],
            }
        ]
    }
}
