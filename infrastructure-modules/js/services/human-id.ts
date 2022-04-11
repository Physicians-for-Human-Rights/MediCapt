export type HumanIDAction =
  | {
      action: 'machineID-to-humanID'
      machineID: string
      suggestedPrefix: string
    }
  | {
      action: 'humanID-to-machineID'
      humanID: string
    }

export type HumanIDResponse =
  | { humanID: string; machineID: string }
  | { failure: 'NOT_FOUND' }
