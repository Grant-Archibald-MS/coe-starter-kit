"use strict";
import { PublicClientApplication, DeviceCodeRequest, AuthenticationResult, Configuration } from '@azure/msal-node';
import { DeviceCodeResponse } from "@azure/msal-common";
import * as path from 'path'
import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

/**
 * Login Arguments
 */
class LoginArguments {
    /**
     * The configuration file to read from
     */
    configFile : string

    /**
     * The Azure Active directory client id to authenticate with 
     */
    clientId : string

    /**
     * The Azure Active Directory authorization url
     */
    auth : string
}

 /**
 * Azure Active Directory Login Commands
 */
class LoginCommand {
    accessToken: string;
    createClientApp: (config: any) => PublicClientApplication

    constructor() {
        this.createClientApp = (config) => {
            return new PublicClientApplication(<Configuration>config)
        } 
    }

    /**
     * Login to Azure DevOps
     *
     * @param args {LoginArguments} - The login arguments
     * @return {Promise} aync outcome
     *
     */
    async execute(args: LoginArguments) : Promise<void | AuthenticationResult> {
        var config : any = undefined
        
        if (args?.configFile?.length > 0) {
            let configFile = path.isAbsolute(args?.configFile) ? args?.configFile :path.join(process.cwd(), args?.configFile)
            let json : string = await readFile(configFile, 'utf8');
            config = <Configuration>JSON.parse(json);
        }

        if ( typeof config === "undefined" ) {
            let clientId: string = args.clientId
            config = {
                "authOptions":
                {
                    "clientId": clientId,
                    "authority": "https://login.microsoftonline.com/common/"
                },
                "request":
                {
                    "deviceCodeUrlParameters": {
                        "scopes": ["499b84ac-1321-427f-aa17-267ca6975798/user_impersonation"]
                    }
                },
                "resourceApi":
                {
                    "endpoint": "https://dev.azure.com"
                }
            }
        }

        // Build MSAL Client Configuration from scenario configuration file
        const clientConfig = {
            auth: config.authOptions
        };

        var self = this

        const pca =  this.createClientApp(clientConfig)

        let runtimeOptions: any

        if (!runtimeOptions) {
             runtimeOptions = {
                 deviceCodeCallback: (response: DeviceCodeResponse) => console.log(response.message)
             }
        }
    
        let deviceCodeRequest: DeviceCodeRequest = <DeviceCodeRequest>{
            ...config.request.deviceCodeUrlParameters,
            deviceCodeCallback: (response: DeviceCodeResponse) => console.log(response.message)
        }

        // Check if a timeout was provided at runtime.
        if (runtimeOptions?.timeout) {
             deviceCodeRequest.timeout = runtimeOptions.timeout;
        }
    
        /**
         * MSAL Usage
         * The code below demonstrates the correct usage pattern of the ClientApplicaiton.acquireTokenByDeviceCode API.
         * 
         * Device Code Grant
         * 
         * In this code block, the application uses MSAL to obtain an Access Token through the Device Code grant.
         * Once the device code request is executed, the user will be prompted by the console application to visit a URL,
         * where they will input the device code shown in the console. Once the code is entered, the promise below should resolve
         * with an AuthenticationResult object.
         * 
         * The AuthenticationResult contains an `accessToken` property. Said property contains a string representing an encoded Json Web Token
         * which can be added to the `Authorization` header in a protected resource request to demonstrate authorization.
         */
        return await pca.acquireTokenByDeviceCode(deviceCodeRequest)
        .then((response) => {
            self.accessToken = response.accessToken
            return response;
        }).catch((error) => {
            console.log(error)
            return error;
        });
    }
}

export { 
    LoginArguments,
    LoginCommand
};