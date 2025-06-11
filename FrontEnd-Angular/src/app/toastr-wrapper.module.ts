import { NgModule } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    ToastrModule.forRoot({
      timeOut: 8000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      tapToDismiss: true,
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
      progressAnimation: 'decreasing',
    }),
  ],
  exports: [ToastrModule],
})
export class ToastrWrapperModule {}
