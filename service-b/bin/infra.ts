#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServiceBApiStack } from '../lib/service-b-api-stack';

const app = new cdk.App();
new ServiceBApiStack(app, 'ServiceBApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  service: {
    serviceName: 'Service-B',
    ecrUri: 'public.ecr.aws/f8u4w2p3/rust-service-b',
    imageTag: 'no-apm',
    apiShortName: 'service-b'
  },
});
