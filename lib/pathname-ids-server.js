//See:
// https://forums.meteor.com/t/automatically-increment-order-numbers/11261/30
// https://www.mongodb.com/blog/post/generating-globally-unique-identifiers-for-use-with-mongodb

import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

//------------------------------------------------------------------------------

// Collection of pairs {_id, pathname}, where _id is a growing number in base 36
// and pathname is a string
const pathnameIds = new Mongo.Collection('dcs-pathname-ids')

// Enforce pathname uniqueness
pathnameIds.rawCollection().createIndex({ pathname: 1 }, { unique: true })

//pathnameIds.remove({})

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
  // Generate an id for pathname. If an id already exists for this pathname, 
  // returns it instead
  async ['dcs-pathname-ids.generate-id'](pathname) {
    check(pathname, String)

    const seq = await getNextSeqNumber()
    const _id = seq.toString(36)

    try {
      // We need to do a findOneAndUpdate, because the pathname might have been
      // inserted by another user while we were generating the seq
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
