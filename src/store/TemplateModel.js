// Model class for Template
export default class TemplateModel {
  constructor (
    title,
    description,
    access,
    id = null
  ) {
    this.title = title
    this.description = description
    this.access = access
    this.id = id
  }
}
