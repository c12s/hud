import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomepageComponent } from './homepage/homepage.component';
import { NodesComponent } from './nodes/nodes.component';
import { RelationshipManagementComponent } from './relationship-management/relationship-management.component';
import { SchemaManagementComponent } from './schema-management/schema-management.component';
import { ConfigGroupManagementComponent } from './config-group-management/config-group-management.component';
import { StandaloneConfigManagementComponent } from './standalone-config-management/standalone-config-management.component';
import { AuthGuard } from './services/authGuard.service';

const routes: Routes = [
  {
    path: 'app/login',
    component: LoginComponent,
  },
  {
    path: 'app/registration',
    component: RegistrationComponent,
  },
  {
    path: 'app/home',
    component: HomepageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'node', component: NodesComponent, canActivate: [AuthGuard] },
      { path: 'relationship', component: RelationshipManagementComponent, canActivate: [AuthGuard] },
      { path: 'schema', component: SchemaManagementComponent, canActivate: [AuthGuard] },
      { path: 'configGroup', component: ConfigGroupManagementComponent, canActivate: [AuthGuard] },
      { path: 'standalone', component: StandaloneConfigManagementComponent, canActivate: [AuthGuard] },
    ]
  },
  { path: '', 
    redirectTo: 'app/login', 
    pathMatch: 'full' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
