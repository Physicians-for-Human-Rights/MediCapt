import _ from 'lodash'
import { ZodError } from 'zod'

import { recordTypeToFlatRecord } from 'utils/records'
import { RecordManifestWithData } from 'utils/types/recordMetadata'
import { getRecordTypeFormManifest } from 'utils/manifests'

const getRecordFromManifest = (
  recordManifest: RecordManifestWithData | undefined
) => {
  if (!recordManifest) return {}
  const r = getRecordTypeFormManifest(recordManifest)
  if (!r || r instanceof ZodError) {
    console.log(r, 'FIXME OLD STYLE RECORD')
    return {}
  }
  return recordTypeToFlatRecord(r)
}

export default getRecordFromManifest
