"use strict";
import CoeCliCommands from '../../src/commands/commands'
import { LoginCommand } from '../../src/commands/login'
import { AA4AMCommand } from '../../src/commands/aa4am'
import * as msal from '@azure/msal-node';
import { mock } from 'jest-mock-extended';


describe('AA4AM', () => {

    test('Install', async () => {
        // Arrange
        var commands = new CoeCliCommands();
        let mockAA4AMCommand = mock<AA4AMCommand>(); 
        commands.createAA4AMCommand = () => mockAA4AMCommand;

        mockAA4AMCommand.init.mockReturnValue(Promise.resolve(true))

        // Act
        await commands.init(['node', 'commands.spec', 'aa4am', 'install'])

        // Assert
        expect(mockAA4AMCommand.init).toHaveBeenCalled()
    })
});

describe('Login', () => {
    test('Execute', async () => {
        // Arrange
        var commands = new CoeCliCommands();
        let mockLoginCommand = mock<LoginCommand>(); 

        commands.createLoginCommand = () => mockLoginCommand

        let result : msal.AuthenticationResult
        mockLoginCommand.execute.mockReturnValue(Promise.resolve(result))
        
        // Act
        await commands.init(['node', 'commands.spec', 'login', '-c', 'foo.config'])

        // Assert
        expect(mockLoginCommand.execute).toHaveBeenCalled()
    })
});