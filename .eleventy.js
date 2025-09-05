export default function(eleventyConfig) {
    eleventyConfig.ignores.add("content/blogs/templates/**");
    eleventyConfig.addPassthroughCopy("content/assets");
    eleventyConfig.addPassthroughCopy("content/style.css");


    eleventyConfig.addFilter("ymd", d => {
        const x = new Date(d), p=n=>String(n).padStart(2,"0");
        return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;
    });

    eleventyConfig.addCollection("blogs", (api) =>
            api.getFilteredByGlob("content/blogs/*.md")
                .sort((a, b) => b.date - a.date)
    );

    return {
        dir: {
            input: "./content/",
            includes: "./_includes",
            output: "./docs/"
        },
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        templateFormats: ["md", "njk", "html"]
    };
}
