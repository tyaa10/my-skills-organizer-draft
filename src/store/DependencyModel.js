// Model class for Dependency
export default class DependencyModel {
  constructor (
    fromNodeId = null,
    toNodeId = null,
    id = null
  ) {
    this.fromNodeId = fromNodeId
    this.toNodeId = toNodeId
    this.id = id
  }
}
