import { IVpc, Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import {
  ApplicationLoadBalancer,
  IApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface LoadBalancerConstructProps {
  vpc: IVpc;
}

export class LoadBalancerConstruct extends Construct {
  private readonly _loadBalancer: IApplicationLoadBalancer;

  get loadBalancer(): IApplicationLoadBalancer {
    return this._loadBalancer;
  }

  constructor(
    scope: Construct,
    id: string,
    props: LoadBalancerConstructProps
  ) {
    super(scope, id);

    const securityGroup = new SecurityGroup(
      scope,
      `LoadBalancer-SG`,
      {
        vpc: props.vpc,
        securityGroupName: `loadbalancer-sg`,
        description: `ALB Security Group`,
        allowAllOutbound: true,
      }
    );


    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      'HTTP Traffic',
      false);

    this._loadBalancer = new ApplicationLoadBalancer(
      scope,
      'LoadBalancer',
      {
        vpc: props.vpc,
        internetFacing: true,
        loadBalancerName: `sample-cluster-alb`,
        securityGroup: securityGroup,
      }
    );

    new StringParameter(
      scope,
      `SsmParam-ALB-Name`,
      {
        parameterName: `/core-infra/alb-arn`,
        stringValue: this._loadBalancer.loadBalancerArn,
      }
    );

    // put the security group in a parameter for fetching later
    new StringParameter(
      scope,
      `SsmParam-SecurityGroup-ID`,
      {
        parameterName: `/core-infra/alb-security-group-id`,
        stringValue: securityGroup.securityGroupId,
      }
    );
  }
}
