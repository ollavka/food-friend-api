import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { Nullable } from '@common/type'

@Injectable()
export class BcryptService {
  public async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10)
  }

  public async compare(value: string, hash: Nullable<string>): Promise<boolean> {
    return bcrypt.compare(value, hash ?? '')
  }
}
