export default function(eleventyConfig) {
    return {
        dir: {
            input: "./content/posts",          // wir arbeiten im Root
            includes: "_includes",
            output: "./assets/blogs"      // hier landet das fertige Site-Bundle
        },
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        templateFormats: ["md", "njk", "html"]
    };
}
