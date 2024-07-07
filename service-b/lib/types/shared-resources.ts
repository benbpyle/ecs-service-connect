import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";
import { ICluster } from "aws-cdk-lib/aws-ecs";
import { IApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface SharedResources {
  vpc: IVpc;
  cluster: ICluster;
  loadBalancer: IApplicationLoadBalancer,
  securityGroup: ISecurityGroup
}
