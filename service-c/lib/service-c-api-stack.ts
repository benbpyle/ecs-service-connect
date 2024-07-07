import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EcsServiceConstruct } from './constructs/ecs-service-construct';
import { EcsTaskDefinitionConstruct } from './constructs/ecs-task-definition-construct';
import { SharedResourcesConstruct } from './constructs/shared-resources-construct';
import { EcsService } from './types/service';

export interface ServiceCApiStackProps extends cdk.StackProps {
  service: EcsService;
}

export class ServiceCApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ServiceCApiStackProps) {
    super(scope, id, props);

    const sharedResourcesConstruct = new SharedResourcesConstruct(this, 'SharedResourcesConstruct');
    const taskDefinitionConstruct = new EcsTaskDefinitionConstruct(
      this,
      'TaskDefinitionConstruct',
      {
        service: props.service,
      }
    );

    new EcsServiceConstruct(
      this,
      'EcsServiceConstruct',
      {
        task: taskDefinitionConstruct.task,
        service: props?.service,
        sharedResources: sharedResourcesConstruct.sharedResources
      }
    );
  }
}
