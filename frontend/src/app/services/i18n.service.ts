import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppLanguage = 'en' | 'mr' | 'hi';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly STORAGE_KEY = 'agrismart_language';
  
  private currentLanguage$ = new BehaviorSubject<AppLanguage>('en');
  
  private supportedLanguages: { code: AppLanguage; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' }
  ];

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  /**
   * Initialize language from storage or browser settings
   */
  private initializeLanguage(): void {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem(this.STORAGE_KEY) as AppLanguage;
    
    if (savedLanguage && this.isValidLanguage(savedLanguage)) {
      this.setLanguage(savedLanguage);
    } else {
      // Try browser language
      const browserLang = this.translate.getBrowserLang();
      if (browserLang && this.isValidLanguage(browserLang as AppLanguage)) {
        this.setLanguage(browserLang as AppLanguage);
      } else {
        // Default to English
        this.setLanguage('en');
      }
    }
  }

  /**
   * Check if language code is valid
   */
  private isValidLanguage(lang: string): boolean {
    return this.supportedLanguages.some(l => l.code === lang);
  }

  /**
   * Set the application language
   */
  setLanguage(lang: AppLanguage): void {
    if (!this.isValidLanguage(lang)) {
      console.warn(`Invalid language: ${lang}. Defaulting to English.`);
      lang = 'en';
    }

    this.translate.use(lang);
    this.currentLanguage$.next(lang);
    
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, lang);
    
    // Update Accept-Language header for API calls
    this.updateAcceptLanguageHeader(lang);
  }

  /**
   * Get the current language
   */
  getCurrentLanguage(): AppLanguage {
    return this.currentLanguage$.value;
  }

  /**
   * Get current language as Observable
   */
  getCurrentLanguage$(): Observable<AppLanguage> {
    return this.currentLanguage$.asObservable();
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): { code: AppLanguage; name: string; nativeName: string }[] {
    return this.supportedLanguages;
  }

  /**
   * Check if current language is RTL (for future use with Arabic/Hebrew)
   */
  isRTL(): boolean {
    // Currently no RTL languages supported
    return false;
  }

  /**
   * Translate a key
   */
  translateKey(key: string, params?: Record<string, string>): Observable<string> | string {
    if (params) {
      return this.translate.instant(key, params);
    }
    return this.translate.instant(key);
  }

  /**
   * Get translation as Observable (for async use)
   */
  getTranslation$(key: string, params?: Record<string, string>): Observable<string> {
    return this.translate.get(key, params);
  }

  /**
   * Update Accept-Language header for API requests
   */
  private updateAcceptLanguageHeader(lang: AppLanguage): void {
    // Set the Accept-Language for all future API calls
    // This will be read by the backend middleware
    const langMap: Record<AppLanguage, string> = {
      'en': 'en-US',
      'mr': 'mr-IN', 
      'hi': 'hi-IN'
    };
    
    // Store for later use in HTTP interceptors
    sessionStorage.setItem('accept_language', langMap[lang]);
  }

  /**
   * Get Accept-Language header value
   */
  getAcceptLanguageHeader(): string {
    const lang = this.getCurrentLanguage();
    const langMap: Record<AppLanguage, string> = {
      'en': 'en-US',
      'mr': 'mr-IN',
      'hi': 'hi-IN'
    };
    return langMap[lang];
  }

  /**
   * Toggle between languages (for quick switching)
   */
  toggleLanguage(): void {
    const currentIndex = this.supportedLanguages.findIndex(
      l => l.code === this.getCurrentLanguage()
    );
    const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
    this.setLanguage(this.supportedLanguages[nextIndex].code);
  }
}