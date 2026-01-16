import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavService, Menu } from '../../../../services/nav.service';
import { LayoutService } from '../../../../utils/layout.service';

@Component({
    // ... (Metadata same)
    selector: 'app-modern-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
      <div>
        <div class="logo-wrapper">
             <h2 class="text-xl font-bold p-4">AI Junction</h2>
        </div>
        <nav class="sidebar-main">
            <div id="sidebar-menu">
                <ul class="sidebar-links custom-scrollbar">
                    <li class="back-btn">
                        <div class="mobile-back text-end"><span>Back</span><i class="fa fa-angle-right ps-2" aria-hidden="true"></i></div>
                    </li>
                    <li class="pin-title sidebar-main-title">
                        <div>
                            <h6>Pinned</h6>
                        </div>
                    </li>
                    @for(item of navServices.items(); track item.title) {
                        @if(item.headTitle1) {
                            <li class="sidebar-main-title">
                                <div>
                                    <h6>{{item.headTitle1}}</h6>
                                </div>
                            </li>
                        }
                        @if(item.type === 'link') {
                            <li class="sidebar-list">
                                <a [routerLink]="item.path" class="sidebar-link sidebar-title" 
                                   [class.active]="item.active"
                                   (click)="toggleMenu(item)">
                                    <i *ngIf="item.icon" [class]="'aspect-square h-4 w-4 mr-2 ' + 'icon-' + item.icon"></i>
                                    <span>{{item.title}}</span>
                                </a>
                            </li>
                        }
                        @if(item.type === 'sub') {
                            <li class="sidebar-list">
                                <a href="javascript:void(0)" class="sidebar-link sidebar-title" 
                                   [class.active]="item.active"
                                   (click)="toggleMenu(item)">
                                    <i *ngIf="item.icon" [class]="'aspect-square h-4 w-4 mr-2 ' + 'icon-' + item.icon"></i>
                                    <span>{{item.title}}</span>
                                    <div class="according-menu">
                                        <i class="fa fa-angle-right" [class.down]="item.active"></i>
                                    </div>
                                </a>
                                <ul class="sidebar-submenu" [class.d-block]="item.active" [class.d-none]="!item.active">
                                    @for(child of item.children; track child.title) {
                                        <li>
                                            <a [routerLink]="child.path" class="sidebar-link" 
                                               [class.active]="child.active"
                                               (click)="toggleMenu(child)">
                                                {{child.title}}
                                            </a>
                                        </li>
                                    }
                                </ul>
                            </li>
                        }
                    }
                </ul>
            </div>
        </nav>
      </div>
    `,
    styles: [`
        :host { 
            display: block; 
            height: 100vh;
            background: white;
            border-right: 1px solid #eee;
        }
        .sidebar-main-title {
            padding: 10px 20px;
            text-transform: uppercase;
            font-weight: 600;
            color: #999;
            font-size: 0.75rem;
        }
        .sidebar-link {
            display: flex;
            align-items: center;
            padding: 10px 20px;
            color: #2c323f;
            text-decoration: none;
            transition: all 0.3s;
        }
        .sidebar-link:hover, .sidebar-link.active {
            color: var(--theme-default, #7366ff);
            background-color: rgba(115, 102, 255, 0.1);
        }
        .sidebar-submenu {
            display: none;
            list-style: none;
            padding-left: 20px;
        }
        .sidebar-submenu.d-block { display: block; }
        .sidebar-submenu.d-none { display: none; }
        .according-menu {
            margin-left: auto;
        }
        .fa-angle-right {
            transition: transform 0.3s;
        }
        .fa-angle-right.down {
            transform: rotate(90deg);
        }
    `]
})
export class ModernSidebarComponent {
    public navServices = inject(NavService);
    public layoutService = inject(LayoutService);
    public router = inject(Router);

    constructor() {
        console.log('ModernSidebarComponent initialized');
        console.log('Nav items:', this.navServices.items());
    }

    toggleMenu(item: Menu) {
        if (!item.active) {
            this.navServices.items().forEach((a: Menu) => {
                if (this.navServices.items().includes(item)) {
                    a.active = false;
                }
                if (!a.children) return;
                a.children.forEach((b: Menu) => {
                    if (a.children?.includes(item)) {
                        b.active = false;
                    }
                });
            });
        }
        item.active = !item.active;
    }
}
