import { CallHandler, ClassSerializerInterceptor, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, map } from 'rxjs'

@Injectable()
export class SerializeInterceptor extends ClassSerializerInterceptor {
  public constructor(protected readonly reflector: Reflector) {
    super(reflector, { excludeExtraneousValues: true })
  }

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return super.intercept(context, next).pipe(
      map((serialized) => ({
        status: 'success',
        data: serialized,
      })),
    )
  }
}
