export type ParamField =
  | {
      key: string
      label: string
      type: 'range'
      min: number
      max: number
      step: number
      default: number
    }
  | {
      key: string
      label: string
      type: 'number'
      default: number
    }
  | {
      key: string
      label: string
      type: 'color'
      default: string
    }
  | {
      key: string
      label: string
      type: 'boolean'
      default: boolean
    }

export type ParamSchema = ParamField[]

export type ParamValue = number | string | boolean
export type ParamValues = Record<string, ParamValue>
