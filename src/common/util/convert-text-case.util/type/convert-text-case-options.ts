export type ConvertTextCaseOptions = {
  onUnknown?: 'throw' | 'return-initial'
  acronyms?: {
    list: Set<string>
    preserve?: boolean
  }
}
