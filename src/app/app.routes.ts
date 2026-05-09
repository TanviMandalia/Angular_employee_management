import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { NgModule } from '@angular/core';

export const routes: Routes = [
   {
    path: '',
    component: Login
  },

  {
    path: 'dashboard',
    component: Dashboard
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
