import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { RbacService } from '../services/rbac.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Directive({
  selector: '[appRbac]',
  standalone: true
})
export class RbacDirective implements OnInit {
  private hasView = false;
  private destroy$ = new Subject<void>();
  
  @Input() set appRbac(permission: { resource: string, action: 'view' | 'create' | 'edit' | 'delete' | 'upload' }) {
    if (permission) {
      this.rbacService.hasPermission(permission.resource, permission.action)
        .pipe(takeUntil(this.destroy$))
        .subscribe(hasPermission => {
          if (hasPermission && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
          } else if (!hasPermission && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
          }
        });
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RbacService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}