
import { createOptionsDecorator } from '@layerr/core';
import { BusDecoratorKeys } from '../message-handler/message-mapper/handler-lookup/decorator/bus-decorator.keys';

export const Handler = createOptionsDecorator(BusDecoratorKeys.DECORATOR_OPTIONS);

