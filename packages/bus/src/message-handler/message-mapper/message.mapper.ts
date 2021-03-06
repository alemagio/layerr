
import { ClassResolverInterface } from '@layerr/core';
import { HandlerLookupInterface } from '../handler-lookup/handler-lookup.interface';
import { AbstractMessageMapper } from './abstract-message-mapper';
import { MessageTypeExtractorInterface } from '../extractor/message-type-extractor.interface';

/**
 * Provides the ability to resolve a specific handler for a given message.
 * It is based on the handling collection and uses an extractor to
 * get the identifier of a message and a resolver to instantiate a new handler.
 */
export class MessageMapper extends AbstractMessageMapper {

  constructor(
    _messageLookup: HandlerLookupInterface,
    _extractor: MessageTypeExtractorInterface,
    private _classResolver: ClassResolverInterface
  ) {
    super(_messageLookup, _extractor);
  }

  /**
   * @inheritDoc
   */
  getHandlers(message: any): Function[] {
    // Gets the handler based on the message.
    const handlerIdentifier = this._getHandlerIdentifier(message);
    // Resolves the handler function.
    const handler = this._classResolver.resolve<any>(handlerIdentifier);
    return [ handler.handle.bind(handler) ];
  }

}
