declare module '*.png'
declare module '*.jpg'
declare module '*.json'
declare module '*.svg'
declare module '*.xml'

declare module '*.yaml' {
  const data: any
  export default data
}
