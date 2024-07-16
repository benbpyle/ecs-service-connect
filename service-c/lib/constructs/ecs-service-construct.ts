import {
  FargateService,
  LogDrivers,
  TaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Duration } from 'aws-cdk-lib';
import { EcsService } from '../types/service';
import { SharedResources } from '../types/shared-resources';

export interface EcsServiceConstructProps {
  service: EcsService;
  task: TaskDefinition;
  sharedResources: SharedResources
}

export class EcsServiceConstruct extends Construct {
  constructor(scope: Construct, id: string, props: EcsServiceConstructProps) {
    super(scope, id);

    const securityGroup = new SecurityGroup(
      scope,
      `SG-${props.service.serviceName}`,
      {
        vpc: props.sharedResources.vpc,
        securityGroupName: `ecs-service-${props.service.serviceName}-sg`,
        description: `ECS Service ${props.service.serviceName} Security Group`,
        allowAllOutbound: true,
      }
    );

    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(3000),
      'Group Inbound',
      false
    );

    new FargateService(
      scope,
      `Service-${props.service.serviceName}`,
      {
        cluster: props.sharedResources.cluster,
        taskDefinition: props.task,
        desiredCount: 1,
        serviceName: props.service.serviceName,
        securityGroups: [securityGroup],
        serviceConnectConfiguration: {
          logDriver: LogDrivers.awsLogs({
            streamPrefix: props.service.serviceName
          }),
          namespace: props.sharedResources.namespace,
          services: [
            {
              portMappingName: 'web',
              dnsName: props.service.apiShortName,
              port: 8081,
              discoveryName: props.service.apiShortName,
              //perRequestTimeout: Duration.seconds(10)
            },
          ],
        },
      }
    );

  }
}
