// Model class for Template
export default class TemplateModel {
  constructor (
    title,
    description,
    access,
    link,
    id = null
  ) {
    this.title = title
    this.description = description
    this.access = access
    this.link = link
    this.id = id
  }
}
