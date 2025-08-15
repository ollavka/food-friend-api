export function useOnlyIf<T>(useData: T, onlyIf: boolean): T | null {
  return onlyIf ? useData : null
}
