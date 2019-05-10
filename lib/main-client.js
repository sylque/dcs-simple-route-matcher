import { getId, getPathname } from './pathname-ids-client'

export class SimpleRouteMatcher {
  //----------------------------------------------------------------------------

  constructor({ homePageName, pageNamePrefix = '', maxPageNameLength }) {
    if (typeof maxPageNameLength !== 'number' || maxPageNameLength < 1) {
      throw new Error(
        `Missing or invalid argument maxPageNameLength ("${maxPageNameLength}")`
      )
    }
    if (
      typeof homePageName !== 'string' ||
      homePageName.length > maxPageNameLength
    ) {
      throw new Error(
        `Missing or invalid argument homePageName ("${homePageName}")`
      )
    }
    if (
      typeof pageNamePrefix !== 'string' ||
      pageNamePrefix.length > maxPageNameLength - 1
    ) {
      throw new Error(`Invalid argument pageNamePrefix ("${pageNamePrefix}")`)
    }

    this.homePageName = homePageName
    this.pageNamePrefix = pageNamePrefix
    this.maxPageNameLength = maxPageNameLength
  }

  //----------------------------------------------------------------------------

  async getPageName(pathname) {
    if (!pathname || typeof pathname !== 'string') {
      throw new Error(`Missing or invalid argument pathname ("${pathname}")`)
    }

    if (pathname === '/') {
      return this.homePageName
    }

    const id = await getId(pathname)
    const pageName = this.pageNamePrefix + id

    if (pageName.length <= this.maxPageNameLength) {
      return pageName
    } else {
      throw new Error(
        `Page name "${pageName}" too long (>${this.maxPageNameLength})`
      )
    }
  }

  //----------------------------------------------------------------------------

  async getPathname(pageName) {
    if (!pageName || typeof pageName !== 'string') {
      throw new Error(`Missing or invalid argument pageName ("${pageName}")`)
    }
    if (pageName.length > this.maxPageNameLength) {
      throw new Error(`Page name "${pageName}" is too long`)
    }
    if (!pageName.startsWith(this.pageNamePrefix)) {
      throw new Error(
        `Page name "${pageName}" should start with ${this.pageNamePrefix}`
      )
    }

    if (pageName === this.homePageName) {
      return '/'
    }

    const id = pageName.substring(this.pageNamePrefix.length)
    return getPathname(id)
  }

  //----------------------------------------------------------------------------
}
