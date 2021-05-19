"use strict";
import commander, { Command } from 'commander';
import { LoginArguments, LoginCommand} from './login';
import { AA4AMBranchArguments, AA4AMCommand} from './aa4am';

/**
 * Define supported commands across COE Toolkit
 */
class CoeCliCommands {
    createLoginCommand: () => LoginCommand
    createAA4AMCommand: () => AA4AMCommand
  
    constructor() {
        this.createLoginCommand = () => new LoginCommand
        this.createAA4AMCommand = () => new AA4AMCommand
    }

    /**
     * Parse commands from command line
     *
     * @param argv {string[]} - The command line to parse
     * @return {Promise} aync outcome
     *
     */
    async init(argv: string[]) : Promise<void> {
        const program = new Command();
        program.version('0.0.1');

        this.AddLoginCommands(program);
        this.AddALMAcceleratorForAdvancedMakerCommands(program);
       
        await program.parseAsync(argv);
    }

    AddLoginCommands(program: commander.Command) {
        var login = program.command('login')
            .description('Login')
            .option('-c, --config <configFile>', 'The config file')
            .option('-i, --clientId <id>', 'The client id file')
            .option('-a, --authority <auth>', 'The client id file', "https://login.microsoftonline.com/common/")
            .action(async (options: any) : Promise<void> => {
                var args: LoginArguments = new LoginArguments(); 
                args.configFile = options.config
                args.clientId = options.clientId
                args.auth = options.authority
                let command = this.createLoginCommand()
                await command.execute(args)
                return Promise.resolve()
            });

        return login;
    }

    AddALMAcceleratorForAdvancedMakerCommands(program: commander.Command) {
        var aa4am = program.command('aa4am')
        .description('ALM Accelerator For Advanced Makers');
    
        aa4am.command('install')
            .description('Initialize a new ALM Accelerators for Makers instance')
            .action(() => {
                let command = this.createAA4AMCommand()
                command.init();
            });

        aa4am.command('branch')
            .description('Create a new Application Branch')
            .option('-c, --config <file>', 'The config file')
            .option('-i, --clientId <id>', 'The client id file')
            .option('-a, --authority <auth>', 'The client id file', "https://login.microsoftonline.com/common/")
            .option('-o, --devopsOrg <name>', 'The Azure DevOps Organization name')
            .option('-r, --repository <name>', 'The Azure DevOps name')
            .option('-p, --project <name>', 'The Azure DevOps name')
            .option('-s, --source <name>', 'The source branch to copy from')
            .option('-d, --destination <name>', 'The branch to create')
            .action(async (options: any) : Promise<void> => {
                let args = new AA4AMBranchArguments();
                args.configFile = options.config
                args.clientId = options.clientId
                args.auth = options.authority
                args.organizationName = options.devopsOrg
                args.repositoryName = options.repository
                args.projectName = options.project
                args.sourceBranch = options.source
                args.destinationBranch = options.destination

                let command = this.createAA4AMCommand()
                await command.branch(args)
                return Promise.resolve()
            });

        return aa4am;
    }
}

export default CoeCliCommands;