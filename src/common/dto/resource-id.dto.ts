import { ToUuid } from '@common/validation'

export class ResourceIdDto {
  @ToUuid()
  public id: string
}
