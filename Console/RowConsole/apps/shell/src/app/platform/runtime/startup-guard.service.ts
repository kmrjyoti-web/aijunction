import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { TableMasterRepo } from '@ai-junction/core';

@Injectable({
    providedIn: 'root'
})
export class StartupGuardService implements CanActivate {

    constructor(private tableMasterRepo: TableMasterRepo) { }

    async canActivate(): Promise<boolean> {
        // Check if any sync is pending that BLOCKS startup
        // Or validate schemas
        console.log('Startup Guard Checking...');
        return true;
    }
}
