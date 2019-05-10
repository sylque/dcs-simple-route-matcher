//See:
// https://forums.meteor.com/t/automatically-increment-order-numbers/11261/30
// https://www.mongodb.com/blog/post/generating-globally-unique-identifiers-for-use-with-mongodb

import { Tracker } from 'meteor/tracker'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

//------------------------------------------------------------------------------

// { _id: growing number in base 36 , pathname: string }
const pathnameIds = new Mongo.Collection('dcs-pathname-ids')

//------------------------------------------------------------------------------

const handle = Meteor.subscribe('dcs-pathname-ids')
const subscriptionReady = new Promise(resolve => {
  Tracker.autorun(computation => {
    if (handle.ready()) {
      resolve()
      computation.stop()
    }
  })
})

//------------------------------------------------------------------------------

export const getId = async pathname => {
  await subscriptionReady
  const doc = pathnameIds.findOne({ pathname })
  return doc ? doc._id : callPromise('dcs-pathname-ids.get-id', pathname)
}

export const getPathname = async id => {
  await subscriptionReady
  const doc = pathnameIds.findOne(id)
  return doc && doc.pathname
}

//------------------------------------------------------------------------------

const callPromise = (...args) =>
  new Promise((resolve, reject) => {
    Meteor.call(...args, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })

//------------------------------------------------------------------------------

/*
export const getPathnameIds = () =>
  subscriptionReady.then(() => ({
    getId() {
      const doc = pathnameIds.findOne({ pathname })
      return doc ? doc._id : callPromise('dcs-pathname-ids.get-id', pathname)
    },

    getPathname() {
      const doc = pathnameIds.findOne(id)
      if (doc) {
        return doc.pathname
      } else {
        throw new Error(`Pathname id "${id}" not found`)
      }
    }
  }))
*/
