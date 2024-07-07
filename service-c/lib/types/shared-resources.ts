import { IVpc } from "aws-cdk-lib/aws-ec2";
import { ICluster } from "aws-cdk-lib/aws-ecs";

export interface SharedResources {
  vpc: IVpc;
  cluster: ICluster;
}
