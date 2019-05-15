const requireDir = require('require-dir')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const YAML = require('yaml')
const pug = require('pug')
const { markdown } = require('markdown')

const mkdirp = promisify(require('mkdirp'))
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

// resolvePath creates a file path from the cwd.
const resolvePath = (...paths) => path.resolve(__dirname, ...paths)
const PUBLIC_PATH = resolvePath('../public')
const CONFIG_PATH = resolvePath('../site.yml')
const BLOG_PATH = resolvePath('blog')

// loadYAML loads and parses a YAML file.
const loadYAML = async filePath => {
  const data = await readFile(filePath, 'utf-8')
  return YAML.parse(data.toString())
}

// createTemplate compiles a Pug template.
const createTemplate = filePath => pug.compileFile(resolvePath(filePath))
const blogTemplate = createTemplate('views/blog.pug')

// createBlog generates the blog from the template and data.
// It saves the generated HTML to the public directory.
const createBlog = async blog => {
  const { slug } = blog
  const contentPath = resolvePath(BLOG_PATH, `${slug}.md`)
  const contentData = await readFile(contentPath, 'utf-8')
  const contentHTML = markdown.toHTML(contentData.toString())

  const html = blogTemplate({
    ...blog,
    content: contentHTML,
    keywords: blog.keywords.join(', '),
  })

  const filePath = resolvePath(PUBLIC_PATH, 'blog', `${slug}.html`)
  await writeFile(filePath, html, 'utf-8')

  return html
}

async function main() {
  const config = await loadYAML(CONFIG_PATH)

  // Create blog directory
  await mkdirp(resolvePath(`${PUBLIC_PATH}/blog`))

  for (const blog of config.blog) {
    await createBlog(blog)
  }
}

main()
  .then(() => console.log('Success'))
  .catch(err => console.error(err))
