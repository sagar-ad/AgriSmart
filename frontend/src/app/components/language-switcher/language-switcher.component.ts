import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { I18nService, AppLanguage } from '../../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="language-switcher">
      <button 
        class="language-toggle" 
        (click)="toggleDropdown()"
        [attr.aria-label]="'LANGUAGE.SWITCH_LANGUAGE' | translate"
        type="button">
        <span class="current-language">
          {{ getCurrentLanguageName() }}
        </span>
        <span class="dropdown-arrow" [class.open]="isOpen">▼</span>
      </button>
      
      <div class="language-dropdown" *ngIf="isOpen">
        <button 
          *ngFor="let lang of languages" 
          class="language-option"
          [class.active]="currentLanguage === lang.code"
          (click)="selectLanguage(lang.code)"
          type="button">
          <span class="lang-native">{{ lang.nativeName }}</span>
          <span class="lang-name">{{ lang.name }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .language-switcher {
      position: relative;
      display: inline-block;
    }

    .language-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: transparent;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      transition: all 0.2s ease;
    }

    .language-toggle:hover {
      background: #f5f5f5;
      border-color: #4CAF50;
    }

    .current-language {
      font-weight: 500;
    }

    .dropdown-arrow {
      font-size: 10px;
      transition: transform 0.2s ease;
    }

    .dropdown-arrow.open {
      transform: rotate(180deg);
    }

    .language-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      min-width: 150px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      overflow: hidden;
    }

    .language-option {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 10px 16px;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background 0.2s ease;
    }

    .language-option:hover {
      background: #f5f5f5;
    }

    .language-option.active {
      background: #e8f5e9;
    }

    .lang-native {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .lang-name {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentLanguage: AppLanguage = 'en';
  languages: { code: AppLanguage; name: string; nativeName: string }[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private i18nService: I18nService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.languages = this.i18nService.getSupportedLanguages();
    
    this.i18nService.getCurrentLanguage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLanguage = lang;
      });

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(lang: AppLanguage): void {
    this.i18nService.setLanguage(lang);
    this.isOpen = false;
  }

  getCurrentLanguageName(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage);
    return lang ? lang.nativeName : 'English';
  }

  private handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-switcher')) {
      this.isOpen = false;
    }
  }
}