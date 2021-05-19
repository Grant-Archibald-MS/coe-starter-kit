"use strict";
import { DevOpsBranchArguments, DevOpsCommand } from '../../src/commands/devops'
import * as azdev from "azure-devops-node-api"
import { mock } from 'jest-mock-extended';
import { IRequestHandler } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import corem = require('azure-devops-node-api/CoreApi');
import CoreInterfaces = require('azure-devops-node-api/interfaces/CoreInterfaces');
import GitInterfaces = require('azure-devops-node-api/interfaces/GitInterfaces');
import gitm = require('azure-devops-node-api/GitApi');

describe('Branch', () => {
    
    beforeEach(() => jest.clearAllMocks())

    test('Create new branch if project exists', async () => {
        // Arrange
        var command = new DevOpsCommand();
        let mockDevOpsWebApi = mock<azdev.WebApi>(); 
        let mockCoreApi = mock<corem.ICoreApi>(); 
        
        let mockProject = mock<CoreInterfaces.TeamProject>()
        
        let mockGitApi = mock<gitm.IGitApi>();
        let mockRepo = mock<GitInterfaces.GitRepository>()
        let mockSourceRef = mock<GitInterfaces.GitRef>()

        command.createWebApi = (org: string, handler: IRequestHandler) => mockDevOpsWebApi;
        command.getUrl = (url: string) => Promise.resolve('123')

        mockDevOpsWebApi.getCoreApi.mockReturnValue(Promise.resolve(mockCoreApi))
        mockDevOpsWebApi.getGitApi.mockReturnValue(Promise.resolve(mockGitApi))

        mockCoreApi.getProject.mockReturnValue(Promise.resolve(mockProject))

        mockGitApi.getRepositories.mockReturnValue(Promise.resolve([mockRepo]))

        mockGitApi.getRefs.mockReturnValue(Promise.resolve([mockSourceRef]))

        mockProject.name = 'alm-sandbox'
        mockRepo.name = 'repo1'
        mockSourceRef.name = 'refs/heads/main'

        let args = new DevOpsBranchArguments();
        args.accessToken = "FOO"
        args.organizationName = "org"
        args.projectName = "P1"
        args.repositoryName = "repo1"        
        args.sourceBranch = "main"  
        args.destinationBranch = "NewSolution"  

        // Act
        await command.branch(args)

        // Assert
        expect(mockDevOpsWebApi.getCoreApi).toHaveBeenCalled()
        expect(mockCoreApi.getProject).toHaveBeenCalled()
    })
});
