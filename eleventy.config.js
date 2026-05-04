module.exports = function (eleventyConfig) {
  // --- Passthrough Copies ---
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");

  // --- Custom Filters ---

  // Date formatting
  eleventyConfig.addFilter("dateFormat", function (dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Short date
  eleventyConfig.addFilter("dateShort", function (dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  });

  // Truncate text
  eleventyConfig.addFilter("truncate", function (str, len) {
    if (!str) return "";
    if (str.length <= len) return str;
    return str.substring(0, len).trim() + "…";
  });

  // Slugify
  eleventyConfig.addFilter("slugify", function (str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  });

  // Reading time estimate
  eleventyConfig.addFilter("readingTime", function (content) {
    if (!content) return "1 min read";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  });

  // --- Collections ---

  // All blog posts sorted by date
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/blog/**/*.njk")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Posts by category
  const categories = [
    "training",
    "health",
    "food",
    "product-reviews",
    "tips-and-guides",
  ];
  categories.forEach((cat) => {
    eleventyConfig.addCollection(cat, function (collectionApi) {
      return collectionApi
        .getFilteredByGlob("src/blog/**/*.njk")
        .filter((item) => item.data.category === cat)
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    });
  });

  // Featured posts
  eleventyConfig.addCollection("featured", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/blog/**/*.njk")
      .filter((item) => item.data.featured)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // --- Server Options ---
  eleventyConfig.setServerOptions({
    port: 8080,
  });

  return {
    pathPrefix: (process.env.PATH_PREFIX || "/").trim(),
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
