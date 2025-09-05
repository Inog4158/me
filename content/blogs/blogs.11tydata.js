export default {
    layout: "post.njk",
    permalink: "./blogs/{{ slug or page.fileSlug }}.html",
    eleventyComputed: {
        title(data) {
            return data.title || data.page?.fileSlug.replace(/-/g, " ").replace(/_/g, " ");
        }
    }
}