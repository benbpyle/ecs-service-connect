import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import {
  FargateService,
  LogDrivers,
  TaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { SharedResources } from '../types/shared-resources';
import { EcsService } from '../types/service';

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
          namespace: 'highlands.local',
          services: [
            {
              portMappingName: 'web',
              dnsName: props.service.apiShortName,
              port: 8080,
              discoveryName: props.service.apiShortName,
            },
          ],
        },
      }
    );
  }
}
