import { CustomDecorator, SetMetadata } from '@nestjs/common'

export const ONLY_ACTIVE_STATUS = 'only_active_status'
export const OnlyActiveStatus = (): CustomDecorator => SetMetadata(ONLY_ACTIVE_STATUS, true)
