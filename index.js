const fs = require('fs').promises
const path = require('path')
const frontMatter = require('front-matter')
const remark = require('remark')
const remarkHTML = require('remark-html')
const remarkSlug = require('remark-slug')
const remarkHighlight = require('remark-highlight.js')
const pug = require('pug')

// Store a reference to the source directories.
const postsDirPath = path.resolve(__dirname, 'posts')
const pagesDirPath = path.resolve(__dirname, 'templates/pages')
// Store a reference path to the destination directories.
const publicDirPath = path.resolve(__dirname, 'public')
const publicBlogDirPath = path.resolve(publicDirPath, 'blog')

/**
 * getFiles returns a list of all files in a directory path {dirPath}
 * that match a given file extension {fileExt} (optional).
 */
const getFiles = async (dirPath, fileExt = '') => {
  // List all the entries in the directory.
  const dirents = await fs.readdir(dirPath, { withFileTypes: true })

  return (
    dirents
      // Omit any sub-directories.
      .filter(dirent => dirent.isFile())
      // Ensure the file extension matches a given extension (optional).
      .filter(dirent =>
        fileExt.length ? dirent.name.toLowerCase().endsWith(fileExt) : true,
      )
      // Return a list of file names.
      .map(dirent => dirent.name)
  )
}

// removeFiles deletes all files in a directory that match a file extension.
const removeFiles = async (dirPath, fileExt) => {
  // Get a list of all files in the directory.
  const fileNames = await getFiles(dirPath, fileExt)

  // Create a list of files to remove.
  const filesToRemove = fileNames.map(fileName =>
    fs.unlink(path.resolve(dirPath, fileName)),
  )

  return Promise.all(filesToRemove)
}

/**
 * parsePost consumes the file name and file content and returns a post
 * object with separate front matter (meta), post body and slug.
 */
const parsePost = (fileName, fileData) => {
  // Strip the extension from the file name to get a slug.
  const slug = path.basename(fileName, '.md')
  // Split the file content into the front matter (attributes) and post body.
  const { attributes, body } = frontMatter(fileData)

  return { ...attributes, body, slug }
}

/**
 * getPosts lists and reads all the Markdown files in the posts directory,
 * returning a list of post objects after parsing the file contents.
 */
const getPosts = async dirPath => {
  // Get a list of all Markdown files in the directory.
  const fileNames = await getFiles(dirPath, '.md')

  // Create a list of files to read.
  const filesToRead = fileNames.map(fileName =>
    fs.readFile(path.resolve(dirPath, fileName), 'utf-8'),
  )

  // Asynchronously read all the file contents.
  const fileData = await Promise.all(filesToRead)

  return fileNames.map((fileName, i) => parsePost(fileName, fileData[i]))
}

/**
 * getPages retrieves all pages in the templates directory.
 */
const getPages = async dirPath => {
  // Get all files in the pages directory.
  const pages = await getFiles(dirPath, '.pug')
  // Return just the file names (slug).
  return pages.map(page => path.basename(page, '.pug'))
}

/**
 * markdownToHTML converts Markdown text to HTML.
 * Adds links to headings, and code syntax highlighting.
 */
const markdownToHTML = text =>
  new Promise((resolve, reject) =>
    remark()
      .use(remarkHTML)
      .use(remarkSlug)
      .use(remarkHighlight)
      .process(text, (err, file) =>
        err ? reject(err) : resolve(file.contents),
      ),
  )

/**
 * createPost generates a new HTML page from a template and saves the file.
 * It also converts the post body from Markdown to HTML.
 */
const createPost = async post => {
  const templatePath = path.resolve(
    __dirname,
    'templates',
    path.format({ name: 'post', ext: '.pug' }),
  )

  // Use the template engine to generate the file content.
  const fileData = pug.renderFile(templatePath, {
    ...post,
    // Convert Markdown to HTML.
    body: await markdownToHTML(post.body),
  })

  // Combine the slug and file extension to create a file name.
  const fileName = path.format({ name: post.slug, ext: '.html' })
  // Create a file path in the destination directory.
  const filePath = path.resolve(publicBlogDirPath, fileName)

  // Save the file in the desired location.
  await fs.writeFile(filePath, fileData, 'utf-8')

  return post
}

/**
 * createPage generates the HTML file for the page.
 */
const createPage = async (name, deps) => {
  const templatePath = path.resolve(
    __dirname,
    'templates',
    'pages',
    path.format({ name, ext: '.pug' }),
  )

  // Use the template engine to generate the file content.
  const fileData = pug.renderFile(templatePath, deps)
  // Create a file path in the destination directory.
  const filePath = path.resolve(
    publicDirPath,
    path.format({ name, ext: '.html' }),
  )

  // Save the file in the desired location.
  await fs.writeFile(filePath, fileData, 'utf-8')
}

// build runs the static site generator.
const build = async () => {
  // Delete any previously-generated HTML files in the public directory.
  await removeFiles(publicDirPath, '.html')
  await removeFiles(publicBlogDirPath, '.html')

  // Get all the Markdown files in the posts directory.
  const posts = await getPosts(postsDirPath)

  // Generate pages for all posts that are public.
  const postsToCreate = posts
    .filter(post => Boolean(post.public))
    .map(post => createPost(post))

  const createdPosts = await Promise.all(postsToCreate)

  // Get all pages in the templates directory.
  const pages = await getPages(pagesDirPath)

  // Create HTML files in the public directory for every page.
  const pagesToCreate = pages.map(page =>
    createPage(page, {
      // Sort created posts by publish date (newest first).
      posts: createdPosts.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }),
  )

  const createdPages = await Promise.all(pagesToCreate)

  return { posts: createdPosts, pages: createdPages }
}

build()
  .then(({ pages, posts }) =>
    console.log(
      `Build successful. Generated ${pages.length} page(s) and ${
        posts.length
      } post(s).`,
    ),
  )
  .catch(err => console.error(err))
