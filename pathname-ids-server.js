//See:
// https://forums.meteor.com/t/automatically-increment-order-numbers/11261/30
// https://www.mongodb.com/blog/post/generating-globally-unique-identifiers-for-use-with-mongodb

import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

//------------------------------------------------------------------------------

// { _id: growing number in base 36 , pathname: string }
const pathnameIds = new Mongo.Collection('dcs-pathname-ids')

pathnameIds.rawCollection().createIndex({ pathname: 1 }, { unique: true })

//PathnameIds.remove({})

//------------------------------------------------------------------------------

Meteor.startup(() => {
  try {
    pathnameIds.insert({ _id: 'SEQUENCE NUMBER DOC ID', seq: 0 })
  } catch (err) {
    // Will always get here once the doc's in place, so just ignore
  }
})

//------------------------------------------------------------------------------

Meteor.publish('dcs-pathname-ids', function() {
  return pathnameIds.find({})
})

//------------------------------------------------------------------------------

async function getNextSeqNumber() {
  try {
    const ret = await pathnameIds
      .rawCollection()
      .findOneAndUpdate(
        { _id: 'SEQUENCE NUMBER DOC ID' },
        { $inc: { seq: 1 } },
        { returnNewDocument: true }
      )
    return ret.value.seq
  } catch (e) {
    throw new Meteor.Error(
      'ENEXTSEQ',
      `Failed to get next sequence number (${e})`
    )
  }
}

//------------------------------------------------------------------------------

Meteor.methods({
  async ['dcs-pathname-ids.get-id'](pathname) {
    if (process.env.NODE_ENV !== 'production') {
      const doc = pathnameIds.findOne({ pathname })
      if (doc) {
        throw new Meteor.Error(
          'EFORBIDDEN',
          `Calling dcs-pathname-ids.get-id with an already registered pathname ("${pathname}") is forbidden. Did you call init()?`
        )
      }
    }
    const seq = await getNextSeqNumber()
    const _id = seq.toString(36)
    try {
      // We need to do a findOne again, as the pathname might have been
      // inserted while we were generating the _id
      const ret = await pathnameIds
        .rawCollection()
        .findOneAndUpdate(
          { pathname },
          { $setOnInsert: { _id, pathname } },
          { upsert: true, returnOriginal: false }
        )
      return ret.value._id
    } catch (e) {
      throw new Meteor.Error('EPATHNAMEID', `Failed to get pathname id (${e})`)
    }
  }
})

//------------------------------------------------------------------------------
