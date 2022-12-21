import { deleteDB, openDB } from 'idb'

const DB_NAME = 'cached-videos-db'

export default function useIndexedDB (storename) {
  return async function (operation, key, value = null) {
    const db = await openDB(DB_NAME, 1, {
      upgrade (db) {
        db.createObjectStore(storename)
      }
    })

    if (operation === 0) {
      const get_value = await db.get(storename, key)
      db.close()
      return get_value
    } else {
      const set_value = await db.put(storename, value, key)
      db.close()
      return set_value
    }
  }
}

import { sendLogRequest } from '../utils/logger'


export async function deleteIndexedDB (meetingId) {
  try {
    sendLogRequest(meetingId, 'info', 'Clearing Indexed DB')
    await deleteDB(DB_NAME)
  } catch (e) {
    sendLogRequest(
      meetingId,
      'error',
      `Could not clear Indexed DB of browser\n${e.toString()}`
    )
  }
}
