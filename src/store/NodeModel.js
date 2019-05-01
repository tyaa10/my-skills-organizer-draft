// Helped class for Node
export default class NodeModel {
  constructor (
    title,
    type,
    description,
    access,
    status,
    dependenciesSatisfied,
    radius,
    left,
    top,
    user = null,
    id = null
  ) {
    this.title = title
    this.type = type
    this.description = description
    this.access = access
    this.status = status
    this.dependenciesSatisfied = dependenciesSatisfied
    this.radius = radius
    this.left = left
    this.top = top
    this.user = user
    this.id = id
  }
}
