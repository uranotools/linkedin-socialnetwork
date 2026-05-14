declare module '@core/PluginBase' {
    export class PluginBase { constructor(config: any); }
}
declare module '@core/Security/Vault' {
    export class Vault { static getSecret(module: string, key: string): string; }
}
declare module '@core/Router' {
    export const Router: any;
}
