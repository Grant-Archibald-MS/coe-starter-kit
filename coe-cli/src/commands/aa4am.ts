"use strict";
import { LoginArguments, LoginCommand} from './login';
import { DevOpsBranchArguments, DevOpsCommand} from './devops';
import { Console } from 'console';

/**
 * ALM Accelerator for Advanced Makers Branch Arguments
 */
class AA4AMBranchArguments {
  /**
   * The name of the configuration file to read from
   */
  configFile: string
  /**
   * The client id to authenticate with
   */
  clientId: string

  auth: string
  /**
   * The name of the Azure DevOps Organization
   */
  organizationName: string

  /**
   * The Azure DevOps project name that AA4AM installed ot
   */
  projectName: string

  /**
   * The Azure repo name that AA4AM installed to
   */
  repositoryName: string;

  /**
   * The source branch to copy from
   */
  sourceBranch: string

  /**
   * The destination branch that will be copied to
   */
  destinationBranch: string
}

/**
 * AML Accelereator for Advanced Makers commands
 */
class AA4AMCommand {
  createLoginCommand: () => LoginCommand
  createDevOpsCommand: () => DevOpsCommand

  constructor() {
      this.createLoginCommand = () => new LoginCommand
      this.createDevOpsCommand = () => new DevOpsCommand
  }

  AA4AMCommand() {
    this.createLoginCommand = () => new LoginCommand
    this.createDevOpsCommand = () => new DevOpsCommand
  }

  async init() : Promise<boolean> {
    console.log('Init called')
    return Promise.resolve(true);
  }

  /**
   * Login and Branch an Azure DevOps repository 
   *
   * @param args {AA4AMBranchArguments} - The branch request
   * @return - async outcome
   *
   */
  async branch(args: AA4AMBranchArguments) : Promise<void> {
    let loginCommmand = this.createLoginCommand();
    let loginArgs = new LoginArguments();
    loginArgs.configFile = args.configFile
    loginArgs.clientId = args.clientId
    loginArgs.auth = args.auth
    await loginCommmand.execute(loginArgs)

    let branchArgs = new DevOpsBranchArguments();
    branchArgs.accessToken = loginCommmand.accessToken;
    branchArgs.organizationName = args.organizationName;
    branchArgs.projectName = args.projectName;
    branchArgs.repositoryName = args.repositoryName;
    branchArgs.sourceBranch = args.sourceBranch;
    branchArgs.destinationBranch = args.destinationBranch;

    let devopsCommand = this.createDevOpsCommand();
    await devopsCommand.branch(branchArgs)
  }
}

export { 
  AA4AMBranchArguments,
  AA4AMCommand
};