"use strict";
import { AA4AMBranchArguments, AA4AMCommand } from '../../src/commands/aa4am';
import { LoginCommand } from '../../src/commands/login';
import { DevOpsCommand } from '../../src/commands/devops';
import { AuthenticationResult } from '@azure/msal-node';
import { mock } from 'jest-mock-extended';


describe('Branch', () => {
    test('Default', async () => {
        // Arrange
        var command = new AA4AMCommand();

        const mockedLoginCommand= mock<LoginCommand>();
        const mockedDevOpsCommand= mock<DevOpsCommand>();

        command.createLoginCommand = () => mockedLoginCommand
        command.createDevOpsCommand = () => mockedDevOpsCommand

        let result: AuthenticationResult;
        let loginPromise = Promise.resolve(result);
        mockedLoginCommand.execute.mockReturnValue(loginPromise);
        mockedDevOpsCommand.branch.mockReturnValue(Promise.resolve())
    
        // Act
        let args = new AA4AMBranchArguments();
        await command.branch(args)

        // Assert
        expect(mockedLoginCommand.execute).toHaveBeenCalled()
        expect(mockedDevOpsCommand.branch).toHaveBeenCalled()
    })
});
