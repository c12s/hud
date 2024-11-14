import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomepageComponent } from './homepage/homepage.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MaterialModule } from './material-module';
import { MenubarComponent } from './menubar/menubar.component';
import { ChartLinearComponent } from './chart-linear/chart-linear.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NodesComponent } from './nodes/nodes.component';
import { RelationshipManagementComponent } from './relationship-management/relationship-management.component';
import { SchemaManagementComponent } from './schema-management/schema-management.component';
import { ConfigGroupManagementComponent } from './config-group-management/config-group-management.component';
import { StandaloneConfigManagementComponent } from './standalone-config-management/standalone-config-management.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthGuard } from './services/authGuard.service';
import { AddLabelDialogComponent } from './add-label-dialog/add-label-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddSchemaDialogComponent } from './add-schema-dialog/add-schema-dialog.component';
import { SchemaDetailsDialogComponent } from './schema-management/schema-details-dialog/schema-details-dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    HomepageComponent,
    MenubarComponent,
    ChartLinearComponent,
    NodesComponent,
    RelationshipManagementComponent,
    SchemaManagementComponent,
    ConfigGroupManagementComponent,
    StandaloneConfigManagementComponent,
    AddLabelDialogComponent,
    AddSchemaDialogComponent,
    SchemaDetailsDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatSidenavModule,
    SidebarComponent,
    MaterialModule,
    NgxChartsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  providers: [
    AuthGuard,
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
