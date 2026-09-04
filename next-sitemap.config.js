/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.sebastianlevano.com",
  generateRobotsTxt: true,
  additionalPaths: async (config) => [await config.transform(config, "/")],
};
