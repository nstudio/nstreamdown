import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNstreamdown } from '@demo/shared';
import {} from '@nstudio/nstreamdown';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNstreamdown {}
