// Helped class for Node
export default class NodeModel {
  constructor (
    status,
    radius,
    left,
    top,
    user = null,
    id = null
  ) {
    this.status = status
    this.radius = radius
    this.left = left
    this.top = top
    this.user = user
    this.id = id
  }
}
