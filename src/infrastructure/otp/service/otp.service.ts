import { randomInt } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HASH_PEPPER_KEY } from '@common/constant'
import { hashValue } from '@common/util'
import { HashOtpCodeParams } from '../type'

@Injectable()
export class OtpService {
  private hashPepper: string

  public constructor(private readonly configService: ConfigService<{ [HASH_PEPPER_KEY]: string }, true>) {
    this.hashPepper = configService.get<string>(HASH_PEPPER_KEY)
  }

  private formatCodeRaw(code: string, { identity, scope }: HashOtpCodeParams): string {
    const formattedCode = `${identity}:${scope}:${code}:${this.hashPepper}`
    return formattedCode
  }

  public generateCode(): string {
    const min = 100_000
    const max = 1_000_000
    const randomNumber = randomInt(min, max)
    return randomNumber.toString().padStart(6, '0')
  }

  public hashCode(code: string, params: HashOtpCodeParams): string {
    const formattedCode = this.formatCodeRaw(code, params)
    const hashedCode = hashValue(formattedCode)
    return hashedCode
  }

  public compare(code: string, hash: string, params: HashOtpCodeParams): boolean {
    const hashedCode = this.hashCode(code, params)
    return hashedCode === hash
  }
}
