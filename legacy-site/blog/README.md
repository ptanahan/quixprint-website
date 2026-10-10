# Updating the Quixprint Blog

The blog landing page is at `/blog/`.

## To publish a new post

1. Duplicate the folder:
   `blog/_post-template/`

2. Rename the duplicate using a short URL slug, for example:
   `blog/how-to-prepare-files-for-print/`

3. Open the duplicated `index.html` and replace:
   - Page title
   - Meta description
   - Post heading
   - Date
   - Featured image
   - Article content

4. Open `blog/posts.js`.

5. Copy one existing post object, paste it at the top of the list, and update:
   - `title`
   - `slug`
   - `date`
   - `author`
   - `excerpt`
   - `image`
   - `imageAlt`

6. Commit the changes to GitHub. Netlify will redeploy automatically.

## Important

The `slug` in `posts.js` must exactly match the post folder name.

Example:

```text
slug: "how-to-prepare-files-for-print"
folder: blog/how-to-prepare-files-for-print/
URL: https://quixprint.com/blog/how-to-prepare-files-for-print/
```

## Existing URLs preserved

- `/blog/james-dyson-marketing-genius-flyer-strategy/`
- `/blog/bopp-vs-paper-labels/`

These match the existing Squarespace URLs, which helps preserve existing links and search visibility.
