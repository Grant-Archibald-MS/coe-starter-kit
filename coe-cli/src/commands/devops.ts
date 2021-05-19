"use strict";
import * as azdev from "azure-devops-node-api"
import { IRequestHandler } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import util from "util"
import { GitRefUpdate, GitCommitRef, GitPush, GitChange, VersionControlChangeType, GitItem, ItemContentType } from 'azure-devops-node-api/interfaces/GitInterfaces';
import axios from 'axios';
import { ItemContent } from "azure-devops-node-api/interfaces/TfvcInterfaces";

/**
 * Branch Arguments
 */
class DevOpsBranchArguments {
    /**
     * The Bearer Auth access token
     */
    accessToken: string
    /**
     * The name of the Azure DevOps Organization
     */
    organizationName:string
    /**
     * The name of repository that the Accelerator has been deployed to or wil lbe deployed to
     */
    repositoryName: string
    /**
     * The name of the project that the Accelerator has been deployed to
     */
    projectName: string
    /**
     * The source branch to branch from (Optional). If not defined will use default branch
     */
    sourceBranch: string

    /**
     * The name of the branch to create
     */
    destinationBranch: string
}

 /**
 * Azure DevOps Commands
 */
class DevOpsCommand {
    createWebApi: (orgUrl: string, authHandler: IRequestHandler) => azdev.WebApi
    getUrl: (url: string) => Promise<string>

    constructor() {
        this.createWebApi = (orgUrl: string, authHandler: IRequestHandler) => new azdev.WebApi(orgUrl, authHandler)
        this.getUrl = async (url: string) => {
            return (await (axios.get<string>(url))).data
        }
    }

    /**
     * Login to Azure DevOps
     *
     * @param args {DevOpsBranchArguments} - The branch request
     * @return {Promise} aync outcome
     *
     */
    async branch(args: DevOpsBranchArguments) : Promise<void> {
        let orgUrl = util.format("https://dev.azure.com/%s",args.organizationName);
        let authHandler = azdev.getBearerHandler(args.accessToken); 
        let connection = this.createWebApi(orgUrl, authHandler); 

        let core = await connection.getCoreApi()
        let project = await core.getProject(args.projectName)

        if (typeof project !== "undefined") {
            console.debug(util.format("Found project %s", project.name))

            let gitApi = await connection.getGitApi()
            var repos = await gitApi.getRepositories(project.id);

            let foundRepo = false
            for ( let i = 0; i < repos.length; i++ ) {
                let repo = repos[i]
                if ( repo.name == args.repositoryName ) {
                    foundRepo = true
                    console.debug(util.format("Found matching %s", args.repositoryName))

                    let refs = await gitApi.getRefs(repo.id, undefined, "heads/");

                    let sourceBranch = args.sourceBranch;
                    if (typeof sourceBranch === "undefined") {
                        sourceBranch = repo.defaultBranch
                    }

                    let sourceRef = refs.filter(f => f.name == util.format("refs/heads/%s", sourceBranch))
                    if (sourceRef.length == 0) {
                        console.error("Source branch not found")
                        return;
                    }

                    let destinationRef = refs.filter(f => f.name == util.format("refs/heads/%s", args.destinationBranch))
                    if (destinationRef.length > 0) {
                        console.error("Destination branch already exists")
                        return;
                    }

                    let newRef = <GitRefUpdate> {};
                    newRef.repositoryId = repo.id
                    newRef.oldObjectId = sourceRef[0].objectId
                    newRef.name = util.format("refs/heads/%s", args.destinationBranch)

                    let newGitCommit = <GitCommitRef> {}
                    newGitCommit.comment = "Add DevOps Pipeline"
                    newGitCommit.changes = await this.getGitCommitChanges(args.destinationBranch, ['validation', 'test', 'prod'])

                    let gitPush = <GitPush> {}
                    gitPush.refUpdates = [ newRef ]
                    gitPush.commits = [ newGitCommit ]

                    await gitApi.createPush(gitPush, repo.id, project.name)
                }
            }

            if (!foundRepo && args.repositoryName?.length > 0 ) {
                console.debug(util.format("Repo %s not found", args.repositoryName))
                console.debug('Did you mean?')
                repos.forEach( repo => {
                    if ( repo.name.startsWith(args.repositoryName[0]) ) {
                        console.debug(repo.name)
                    }
                });
            }
        }
    }

    async getGitCommitChanges(destinationBranch: string, names: string[]): Promise<GitChange[]> {
        let results : GitChange[] = []
        for ( let i = 0; i < names.length; i++ ) {
            let url = util.format("https://raw.githubusercontent.com/microsoft/coe-alm-accelerator-templates/main/Pipelines/build-deploy-%s-SampleSolution.yml", names[i]);
            
            let response = await this.getUrl(url)

            let commit = <GitChange>{}
            commit.changeType = VersionControlChangeType.Add
            commit.item = <GitItem>{}
            commit.item.path = util.format("/%s/deploy-%s-%s.yml", destinationBranch, names[i], destinationBranch)
            commit.newContent = <ItemContent>{}
            commit.newContent.content = (response)?.replace(new RegExp('SampleSolutionName'), destinationBranch)
            commit.newContent.contentType = ItemContentType.RawText

            results.push(commit)
        }
        return results;
    }
}

export { 
    DevOpsBranchArguments,
    DevOpsCommand 
};