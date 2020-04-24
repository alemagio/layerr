
import { MessageBusMiddlewareInterface } from '@layerr/bus';
import { Observable, of, throwError } from 'rxjs';
import { flatMap, retryWhen, concatMap, delay, timeout, tap } from 'rxjs/operators';
import { HttpAdapterInterface } from '../adapter/http-adapter.interface';
import { HttpExecution } from '../http-execution';
import { RemoteResponse } from '../response/remote-response';
import { JsonType } from '@layerr/core';

export class RequestExecutionBusMiddleware implements MessageBusMiddlewareInterface {

  constructor(
    private _httpAdapter: HttpAdapterInterface
  ) {}

  /**
   * @inheritDoc
   */
  handle(message: HttpExecution, next: (message: HttpExecution) => Observable<any>): Observable<any> {
    // Starts by streaming the request.
    let request$ = this._httpAdapter.execute<JsonType>(message.request);

    // TODO: Find a way to test it as unit.
    /* istanbul ignore if */
    if (Number.isFinite(message.retryAttemptCount!) && message.retryAttemptCount! > 0) {
      request$ = request$
        .pipe(
          retryWhen((notifiers: Observable<RemoteResponse<JsonType>>) => notifiers
            .pipe(
              concatMap((response: RemoteResponse<JsonType>, index: number) => {
                // If the all the attempts has been tried or the request is not failed with status code zero forward the error...
                if ((!response || response.status !== 0) || index > message.retryAttemptCount!) {
                  return throwError(response);
                }
                // ...otherwise execute the next attempt after a specified amount of time.
                return of(response)
                  .pipe(
                    delay(message.retryDelay || 200)
                  );
              }))
          )
        );
    }

    // TODO: Find a way to test it as unit.
    // Sets the timeout if needed.
    /* istanbul ignore if */
    if (message.timeout > 0) {
      request$ = request$
        .pipe(
          timeout(message.timeout)
        );
    }

    // Otherwise, simply returns the stream.
    return request$
      .pipe(
        tap((response) => message.response = response),
        flatMap(() => next(message))
      );
  }

}