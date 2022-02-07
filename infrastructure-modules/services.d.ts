// HumanID service

type HumanIDAction =
  | {
      action: 'machineID-to-humanID'
      machineID: string
      suggestedPrefix: string
    }
  | {
      action: 'humanID-to-machineID'
      humanID: string
    }

type HumanIDResponse =
  | { humanID: string; machineID: string }
  | { failure: 'NOT_FOUND' }
