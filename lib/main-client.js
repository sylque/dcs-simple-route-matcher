import { getId, getPathname } from './pathname-ids-client'
import { Match } from 'meteor/check'

export class SimpleRouteMatcher {
  //----------------------------------------------------------------------------

  constructor({
    maxPageNameLength,
    forceLowercase,
    predefinedPageNames = [],
    otherPagesPrefix = ''
  }) {
    if (
      !Match.test(maxPageNameLength, Match.Integer) ||
      maxPageNameLength < 1
    ) {
      throwError(
        `missing or invalid argument maxPageNameLength="${maxPageNameLength}"`
      )
    }

    if (!Match.test(forceLowercase, Boolean)) {
      throwError(
        `missing or invalid argument forceLowercase="${forceLowercase}"`
      )
    }

    if (
      !Match.test(
        predefinedPageNames,
        Match.Optional([{ pageName: String, pathname: String }])
      )
    ) {
      throwError(
        `invalid argument predefinedPageNames=${JSON.stringify(
          predefinedPageNames
        )} (1)`
      )
    }

    predefinedPageNames.forEach(({ pageName, pathname }) => {
      if (
        pageName.length > maxPageNameLength ||
        (forceLowercase && pageName !== pageName.toLowerCase()) ||
        !pathname.startsWith('/')
      ) {
        throwError(
          `invalid argument predefinedPageNames=${JSON.stringify(
            predefinedPageNames
          )} (2)`
        )
      }
    })

    if (otherPagesPrefix !== undefined) {
      if (
        !Match.test(otherPagesPrefix, String) ||
        otherPagesPrefix.length > maxPageNameLength - 1 ||
        (forceLowercase && otherPagesPrefix !== otherPagesPrefix.toLowerCase())
      ) {
        throwError(`invalid argument otherPagesPrefix="${otherPagesPrefix}"`)
      }
    }

    this.maxPageNameLength = maxPageNameLength
    this.forceLowercase = forceLowercase
    this.predefinedPageNames = predefinedPageNames
    this.otherPagesPrefix = otherPagesPrefix || ''
  }

  //----------------------------------------------------------------------------

  async getPageName(pathname) {
    if (!Match.test(pathname, String) || !pathname.startsWith('/')) {
      throwError(`missing or invalid argument pathname="${pathname}"`)
    }

    // Case the pathname corresponds to a predefined page name
    const found = this.predefinedPageNames.find(o => o.pathname === pathname)
    if (found) {
      return found.pageName
    }

    // Case the pathname corresponds to a generated page name
    const id = await getId(pathname)
    const pageName = this.otherPagesPrefix + id
    if (pageName.length > this.maxPageNameLength) {
      throwError(
        `page name "${pageName}" is too long (>${this.maxPageNameLength})`
      )
    }
    return pageName
  }

  //----------------------------------------------------------------------------

  async getPathname(pageName) {
    if (
      !Match.test(pageName, String) ||
      pageName.length > this.maxPageNameLength
    ) {
      throwError(`missing or invalid argument pageName="${pageName}"`)
    }

    // Case the page name is predefined
    const found = this.predefinedPageNames.find(o => o.pageName === pageName)
    if (found) {
      return found.pathname
    }

    // Case the pageName is generated
    const id = pageName.substring(this.otherPagesPrefix.length)
    return getPathname(id)
  }

  //----------------------------------------------------------------------------
}

function throwError(msg) {
  throw new Error('dcs-simple-route-matcher: ' + msg)
}
